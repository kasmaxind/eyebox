import fs from 'fs';
import path from 'path';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getS3Client, s3Config } from '../config/s3';
import { env } from '../config/env';
import mime from 'mime-types';

export class S3Service {
  private getLocalPath(key: string): string {
    const localDir = path.resolve(process.cwd(), s3Config.localDir);
    const fullPath = path.join(localDir, key);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return fullPath;
  }

  async uploadFile(key: string, body: Buffer | fs.ReadStream, contentType?: string): Promise<string> {
    if (s3Config.useLocal) {
      const localPath = this.getLocalPath(key);
      if (body instanceof Buffer) {
        fs.writeFileSync(localPath, body);
      } else {
        const stream = body as fs.ReadStream;
        await new Promise<void>((resolve, reject) => {
          const writeStream = fs.createWriteStream(localPath);
          stream.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
      }
      return `/uploads/${key}`;
    }

    const client = getS3Client();
    if (!client) throw new Error('S3 client not configured');

    const upload = new Upload({
      client,
      params: {
        Bucket: s3Config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType || mime.lookup(key) || 'application/octet-stream',
      },
    });

    await upload.done();
    return s3Config.cloudfrontUrl
      ? `${s3Config.cloudfrontUrl}/${key}`
      : `https://${s3Config.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async uploadFromPath(key: string, filePath: string): Promise<string> {
    const stream = fs.createReadStream(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    return this.uploadFile(key, stream, contentType);
  }

  async deleteFile(key: string): Promise<void> {
    if (s3Config.useLocal) {
      const localPath = this.getLocalPath(key);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      return;
    }

    const client = getS3Client();
    if (!client) return;

    await client.send(new DeleteObjectCommand({ Bucket: s3Config.bucket, Key: key }));
  }

  getPublicUrl(key: string): string {
    if (s3Config.useLocal) return `/uploads/${key}`;
    if (s3Config.cloudfrontUrl) return `${s3Config.cloudfrontUrl}/${key}`;
    return `https://${s3Config.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getFile(key: string): Promise<Buffer> {
    if (s3Config.useLocal) {
      const localPath = this.getLocalPath(key);
      return fs.readFileSync(localPath);
    }

    const client = getS3Client();
    if (!client) throw new Error('S3 client not configured');

    const response = await client.send(
      new GetObjectCommand({ Bucket: s3Config.bucket, Key: key })
    );
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as Buffer));
    }
    return Buffer.concat(chunks);
  }
}

export const s3Service = new S3Service();
