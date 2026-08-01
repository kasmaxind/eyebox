import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client | null {
  if (env.USE_LOCAL_STORAGE) return null;

  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
    });
  }
  return s3Client;
}

export const s3Config = {
  bucket: env.S3_BUCKET,
  cloudfrontUrl: env.CLOUDFRONT_URL,
  useLocal: env.USE_LOCAL_STORAGE,
  localDir: env.LOCAL_UPLOAD_DIR,
};
