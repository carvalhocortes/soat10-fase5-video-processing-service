import { ValidationError } from '@shared/errors/ValidationError';

export interface ProcessedVideoProps {
  fileId: string;
  status: string;
  userId: string;
  processedFileS3Key: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProcessedVideo {
  public readonly fileId: string;
  public readonly status: string;
  public readonly userId: string;
  public readonly processedFileS3Key: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: ProcessedVideoProps) {
    this.fileId = props.fileId;
    this.status = props.status;
    this.userId = props.userId;
    this.processedFileS3Key = props.processedFileS3Key;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: Omit<ProcessedVideoProps, 'createdAt' | 'updatedAt'>): ProcessedVideo {
    this.validate(props);
    return new ProcessedVideo({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static update(props: Omit<ProcessedVideoProps, 'updatedAt'>): ProcessedVideo {
    this.validate(props);
    return new ProcessedVideo({
      ...props,
      updatedAt: new Date(),
    });
  }

  public static reconstruct(props: ProcessedVideoProps): ProcessedVideo {
    return new ProcessedVideo(props);
  }

  private static validate(props: Omit<ProcessedVideoProps, 'createdAt' | 'updatedAt'>): void {
    if (!props.processedFileS3Key) {
      throw new ValidationError('processedFileS3Key is required');
    }
    if (!props.fileId) {
      throw new ValidationError('fileId is required');
    }
  }
}
