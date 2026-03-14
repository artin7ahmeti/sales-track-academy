import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3PresignClient } from './s3-client';

const DEFAULT_EXPIRY = 3600; // 1 hour

export async function generateUploadUrl(
  bucket: string,
  key: string,
  _contentType: string,
  expiresIn = DEFAULT_EXPIRY,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(getS3PresignClient(), command, { expiresIn });
}

export async function generateDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = DEFAULT_EXPIRY,
  responseContentDisposition?: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ...(responseContentDisposition && { ResponseContentDisposition: responseContentDisposition }),
  });
  return getSignedUrl(getS3PresignClient(), command, { expiresIn });
}
