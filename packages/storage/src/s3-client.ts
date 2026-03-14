import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;
let s3PresignClient: S3Client | null = null;

function getS3ClientConfig(): S3ClientConfig {
  return {
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  };
}

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(getS3ClientConfig());
  }
  return s3Client;
}

export function getS3PresignClient(): S3Client {
  if (!s3PresignClient) {
    s3PresignClient = new S3Client({
      ...getS3ClientConfig(),
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }
  return s3PresignClient;
}
