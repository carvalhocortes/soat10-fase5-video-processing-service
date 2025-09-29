import { ProcessVideoDTO } from '@application/dto/ProcessVideoDTO';

describe('ProcessVideoDTO', () => {
  it('should create a valid ProcessVideoDTO', () => {
    const data = {
      payload: {
        fileId: 'file-123',
        fileName: 'test-video.mp4',
        userId: 'user-456',
        s3Key: 'uploads/user-456/test-video.mp4',
        status: 'PROCESSING',
      },
    };

    const dto = ProcessVideoDTO.create(data);

    expect(dto).toBeInstanceOf(ProcessVideoDTO);
    expect(dto.fileId).toBe('file-123');
    expect(dto.fileName).toBe('test-video.mp4');
    expect(dto.userId).toBe('user-456');
    expect(dto.s3Key).toBe('uploads/user-456/test-video.mp4');
    expect(dto.status).toBe('PROCESSING');
  });

  it('should throw an error if fileId is missing', () => {
    const data = {
      payload: {
        fileId: '',
        fileName: 'test-video.mp4',
        userId: 'user-456',
        s3Key: 'uploads/user-456/test-video.mp4',
        status: 'PROCESSING',
      },
    };

    expect(() => ProcessVideoDTO.create(data)).toThrow('File ID is required');
  });

  it('should throw an error if s3Key is missing', () => {
    const data = {
      payload: {
        fileId: 'file-123',
        fileName: 'test-video.mp4',
        userId: 'user-456',
        s3Key: '',
        status: 'PROCESSING',
      },
    };

    expect(() => ProcessVideoDTO.create(data)).toThrow('S3 Key is required');
  });

  it('should create a DTO with valid constructor parameters', () => {
    const dto = new ProcessVideoDTO(
      'file-123',
      'test-video.mp4',
      'user-456',
      'uploads/user-456/test-video.mp4',
      'PROCESSING',
    );

    expect(dto.fileId).toBe('file-123');
    expect(dto.fileName).toBe('test-video.mp4');
    expect(dto.userId).toBe('user-456');
    expect(dto.s3Key).toBe('uploads/user-456/test-video.mp4');
    expect(dto.status).toBe('PROCESSING');
  });

  it('should handle different status values', () => {
    const statuses = ['PROCESSING', 'COMPLETED', 'FAILED', 'PENDING'];

    statuses.forEach((status) => {
      const data = {
        payload: {
          fileId: 'file-123',
          fileName: 'test-video.mp4',
          userId: 'user-456',
          s3Key: 'uploads/user-456/test-video.mp4',
          status,
        },
      };

      const dto = ProcessVideoDTO.create(data);

      expect(dto.status).toBe(status);
    });
  });
});
