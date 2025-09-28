import { ProcessedVideo } from '@core/entities/processedVideo.entity';
import { SnsPublisher } from '@infrastructure/external/snsPublisher';
import { ProcessVideoDTO } from '@application/dto/ProcessVideoDTO';
import { S3Service } from '@infrastructure/external/s3Service';
import { VideoProcessingService } from '@infrastructure/external/videoProcessingService';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class ProcessVideoUseCase {
  private readonly s3Service: S3Service;
  private readonly videoProcessingService: VideoProcessingService;

  constructor(private readonly snsPublisher: SnsPublisher) {
    this.s3Service = new S3Service();
    this.videoProcessingService = new VideoProcessingService();
  }

  async execute({ fileId, fileName, userId, s3Key }: ProcessVideoDTO): Promise<ProcessedVideo> {
    const tempDir = path.join(os.tmpdir(), `video-processing-${uuidv4()}`);
    const videoPath = path.join(tempDir, fileName);
    const framesDir = path.join(tempDir, 'frames');
    const zipPath = path.join(tempDir, 'frames.zip');

    try {
      console.log(`Starting video processing for file: ${fileName}, user: ${userId}`);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`Created temporary directory: ${tempDir}`);
      }

      console.log(`Downloading video from S3 key: ${s3Key}`);
      console.log(`Target video path: ${videoPath}`);
      await this.s3Service.downloadFile(s3Key, videoPath);

      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file was not downloaded successfully to: ${videoPath}`);
      }

      const stats = fs.statSync(videoPath);
      console.log(`Video file downloaded successfully. Size: ${stats.size} bytes`);

      console.log('Extracting frames from video...');
      const extractedFrames = await this.videoProcessingService.extractFrames(videoPath, framesDir);

      if (extractedFrames.length === 0) {
        throw new Error('No frames were extracted from the video');
      }

      console.log(`Successfully extracted ${extractedFrames.length} frames`);

      console.log('Creating ZIP file with extracted frames...');
      await this.videoProcessingService.createZipFromFrames(extractedFrames, zipPath);

      const processedFileS3Key = `processed/${userId}/${path.parse(fileName).name}_frames.zip`;
      console.log(`Uploading ZIP file to S3 key: ${processedFileS3Key}`);
      await this.s3Service.uploadFile(zipPath, processedFileS3Key);

      const processedVideo = ProcessedVideo.create({
        fileId,
        userId,
        processedFileS3Key,
        status: 'COMPLETED',
      });

      await this.snsPublisher.publish({ eventType: 'PROCESS_VIDEO_COMPLETED', payload: processedVideo });

      console.log(`Video processing completed successfully for file: ${fileName}`);
      return processedVideo;
    } catch (error) {
      console.error('Error processing video:', error);

      await this.snsPublisher.publish({
        eventType: 'PROCESS_VIDEO_FAILURE',
        payload: {
          fileId,
          fileName,
          userId,
          s3Key,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Cleaning up temporary files...');
      this.videoProcessingService.cleanupTempFiles([tempDir]);
    }
  }
}
