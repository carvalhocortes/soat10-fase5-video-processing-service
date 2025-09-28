export class ProcessVideoDTO {
  constructor(
    public readonly fileId: string,
    public readonly fileName: string,
    public readonly userId: string,
    public readonly s3Key: string,
    public readonly uploadStatus: string,
  ) {}

  static create(data: {
    payload: { fileId: string; fileName: string; userId: string; s3Key: string; uploadStatus: string };
  }): ProcessVideoDTO {
    if (!data.payload.fileId) {
      throw new Error('File ID is required');
    }

    if (!data.payload.s3Key) {
      throw new Error('S3 Key is required');
    }

    return new ProcessVideoDTO(
      data.payload.fileId,
      data.payload.fileName,
      data.payload.userId,
      data.payload.s3Key,
      data.payload.uploadStatus,
    );
  }
}
