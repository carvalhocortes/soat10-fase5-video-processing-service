import { ProcessedVideo } from '@core/entities/processedVideo.entity';
import { ValidationError } from '@shared/errors/ValidationError';

describe('ProcessedVideo Entity Test', () => {
  it('should create a valid processed video', () => {
    const processedVideo = ProcessedVideo.create({
      fileId: 'file-123',
      status: 'COMPLETED',
      userId: 'user-456',
      processedFileS3Key: 'processed/user-456/video_frames.zip',
    });

    expect(processedVideo).toBeInstanceOf(ProcessedVideo);
    expect(processedVideo.fileId).toBe('file-123');
    expect(processedVideo.status).toBe('COMPLETED');
    expect(processedVideo.userId).toBe('user-456');
    expect(processedVideo.processedFileS3Key).toBe('processed/user-456/video_frames.zip');
    expect(processedVideo.createdAt).toBeInstanceOf(Date);
    expect(processedVideo.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw an error if processedFileS3Key is empty', () => {
    expect(() =>
      ProcessedVideo.create({
        fileId: 'file-123',
        status: 'COMPLETED',
        userId: 'user-456',
        processedFileS3Key: '',
      }),
    ).toThrow(ValidationError);
  });

  it('should throw an error if fileId is empty', () => {
    expect(() =>
      ProcessedVideo.create({
        fileId: '',
        status: 'COMPLETED',
        userId: 'user-456',
        processedFileS3Key: 'processed/user-456/video_frames.zip',
      }),
    ).toThrow(ValidationError);
  });

  it('should update the processed video', () => {
    const processedVideo = ProcessedVideo.create({
      fileId: 'file-123',
      status: 'PROCESSING',
      userId: 'user-456',
      processedFileS3Key: 'processed/user-456/video_frames.zip',
    });

    const updated = ProcessedVideo.update({
      fileId: 'file-123',
      status: 'COMPLETED',
      userId: 'user-456',
      processedFileS3Key: 'processed/user-456/video_frames.zip',
      createdAt: processedVideo.createdAt,
    });

    expect(updated.status).toBe('COMPLETED');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(processedVideo.updatedAt.getTime());
  });

  it('should reconstruct the processed video', () => {
    const now = new Date();
    const processedVideo = ProcessedVideo.reconstruct({
      fileId: 'file-123',
      status: 'COMPLETED',
      userId: 'user-456',
      processedFileS3Key: 'processed/user-456/video_frames.zip',
      createdAt: now,
      updatedAt: now,
    });

    expect(processedVideo.fileId).toBe('file-123');
    expect(processedVideo.status).toBe('COMPLETED');
    expect(processedVideo.userId).toBe('user-456');
    expect(processedVideo.processedFileS3Key).toBe('processed/user-456/video_frames.zip');
    expect(processedVideo.createdAt).toBe(now);
    expect(processedVideo.updatedAt).toBe(now);
  });

  it('should create a processed video with different status values', () => {
    const statuses = ['PROCESSING', 'COMPLETED', 'FAILED'];

    statuses.forEach((status) => {
      const processedVideo = ProcessedVideo.create({
        fileId: 'file-123',
        status,
        userId: 'user-456',
        processedFileS3Key: 'processed/user-456/video_frames.zip',
      });

      expect(processedVideo.status).toBe(status);
    });
  });
});
