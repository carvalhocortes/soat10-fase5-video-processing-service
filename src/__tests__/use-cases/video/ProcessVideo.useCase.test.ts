import { ProcessVideoDTO } from '@application/dto/ProcessVideoDTO';
import { ProcessedVideo } from '@core/entities/processedVideo.entity';

const mockSnsPublisher = {
  publish: jest.fn(),
};

const mockS3Service = {
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
};

const mockVideoProcessingService = {
  extractFrames: jest.fn(),
  createZipFromFrames: jest.fn(),
  cleanupTempFiles: jest.fn(),
};

jest.mock('@infrastructure/external/snsPublisher', () => ({
  SnsPublisher: jest.fn().mockImplementation(() => mockSnsPublisher),
}));

jest.mock('@infrastructure/external/s3Service', () => ({
  S3Service: jest.fn().mockImplementation(() => mockS3Service),
}));

jest.mock('@infrastructure/external/videoProcessingService', () => ({
  VideoProcessingService: jest.fn().mockImplementation(() => mockVideoProcessingService),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('os', () => ({
  tmpdir: jest.fn().mockReturnValue('/tmp'),
}));

jest.mock('path', () => ({
  join: jest.fn((...paths) => paths.join('/')),
  parse: jest.fn((fileName) => ({ name: fileName.split('.')[0] })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

import { ProcessVideoUseCase } from '@application/use-cases/payment/ProcessVideo.useCase';

describe('ProcessVideo UseCase', () => {
  let useCase: ProcessVideoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockS3Service.downloadFile.mockResolvedValue(undefined);
    mockS3Service.uploadFile.mockResolvedValue(undefined);
    mockVideoProcessingService.extractFrames.mockResolvedValue(['frame1.jpg', 'frame2.jpg']);
    mockVideoProcessingService.createZipFromFrames.mockResolvedValue(undefined);
    mockVideoProcessingService.cleanupTempFiles.mockResolvedValue(undefined);
    mockSnsPublisher.publish.mockResolvedValue(undefined);

    useCase = new ProcessVideoUseCase(mockSnsPublisher as any);
  });

  it('should process video successfully', async () => {
    const videoDTO = new ProcessVideoDTO(
      'file-123',
      'test-video.mp4',
      'user-456',
      'uploads/user-456/test-video.mp4',
      'PROCESSING',
    );

    const fs = jest.requireMock('fs');
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
    fs.statSync.mockReturnValue({ size: 1024 });

    const result = await useCase.execute(videoDTO);

    expect(result).toBeInstanceOf(ProcessedVideo);
    expect(result.fileId).toBe('file-123');
    expect(result.userId).toBe('user-456');
    expect(result.status).toBe('COMPLETED');
    expect(result.processedFileS3Key).toBe('processed/user-456/test-video_frames.zip');

    expect(mockS3Service.downloadFile).toHaveBeenCalled();
    expect(mockVideoProcessingService.extractFrames).toHaveBeenCalled();
    expect(mockVideoProcessingService.createZipFromFrames).toHaveBeenCalled();
    expect(mockS3Service.uploadFile).toHaveBeenCalled();
    expect(mockSnsPublisher.publish).toHaveBeenCalledWith({
      eventType: 'PROCESS_VIDEO_COMPLETED',
      payload: expect.objectContaining({
        fileId: 'file-123',
        userId: 'user-456',
        status: 'COMPLETED',
      }),
    });
    expect(mockVideoProcessingService.cleanupTempFiles).toHaveBeenCalled();
  });

  it('should handle error when no frames are extracted', async () => {
    const videoDTO = new ProcessVideoDTO(
      'file-123',
      'test-video.mp4',
      'user-456',
      'uploads/user-456/test-video.mp4',
      'PROCESSING',
    );

    const fs = jest.requireMock('fs');
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
    fs.statSync.mockReturnValue({ size: 1024 });

    mockVideoProcessingService.extractFrames.mockResolvedValue([]);

    await expect(useCase.execute(videoDTO)).rejects.toThrow(
      'Video processing failed: No frames were extracted from the video',
    );

    expect(mockSnsPublisher.publish).toHaveBeenCalledWith({
      eventType: 'PROCESS_VIDEO_FAILURE',
      payload: {
        fileId: 'file-123',
        fileName: 'test-video.mp4',
        userId: 'user-456',
        s3Key: 'uploads/user-456/test-video.mp4',
        status: 'FAILED',
        error: 'No frames were extracted from the video',
      },
    });

    expect(mockVideoProcessingService.cleanupTempFiles).toHaveBeenCalled();
  });

  it('should handle download error', async () => {
    const videoDTO = new ProcessVideoDTO(
      'file-123',
      'test-video.mp4',
      'user-456',
      'uploads/user-456/test-video.mp4',
      'PROCESSING',
    );

    const fs = jest.requireMock('fs');
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);

    await expect(useCase.execute(videoDTO)).rejects.toThrow(
      'Video processing failed: Video file was not downloaded successfully',
    );

    expect(mockSnsPublisher.publish).toHaveBeenCalledWith({
      eventType: 'PROCESS_VIDEO_FAILURE',
      payload: {
        fileId: 'file-123',
        fileName: 'test-video.mp4',
        userId: 'user-456',
        s3Key: 'uploads/user-456/test-video.mp4',
        status: 'FAILED',
        error: expect.stringContaining('Video file was not downloaded successfully'),
      },
    });

    expect(mockVideoProcessingService.cleanupTempFiles).toHaveBeenCalled();
  });
});
