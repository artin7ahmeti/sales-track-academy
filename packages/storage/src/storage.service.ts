import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getS3Client } from './s3-client';
import { generateDownloadUrl, generateUploadUrl } from './presigned-urls';

export class StorageService {
  constructor(private readonly bucket: string) {}

  async getUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string> {
    return generateUploadUrl(this.bucket, key, contentType, expiresIn);
  }

  async getDownloadUrl(key: string, expiresIn?: number, inline?: boolean): Promise<string> {
    return generateDownloadUrl(
      this.bucket, key, expiresIn,
      inline ? 'inline' : undefined,
    );
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await getS3Client().send(command);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await getS3Client().send(command);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await getS3Client().send(command);
      return true;
    } catch {
      return false;
    }
  }
}
