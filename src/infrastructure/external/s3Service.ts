import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.S3_BUCKET_NAME || 'soat10-video-manager-bucket';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-west-2',
    });
  }

  async downloadFile(s3Key: string, localPath: string): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(localPath);

      if (response.Body instanceof Readable) {
        response.Body.pipe(writeStream);

        return new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
      } else {
        throw new Error('Unexpected response body type');
      }
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  async uploadFile(localPath: string, s3Key: string): Promise<void> {
    try {
      const fileStream = fs.createReadStream(localPath);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'application/zip',
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }
}
