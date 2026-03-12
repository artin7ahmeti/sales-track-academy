import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './s3-client';

const DEFAULT_EXPIRY = 3600; // 1 hour

export async function generateUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = DEFAULT_EXPIRY,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function generateDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = DEFAULT_EXPIRY,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}
