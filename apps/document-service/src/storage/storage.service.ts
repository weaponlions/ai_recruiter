import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env['S3_REGION'] ?? 'us-east-1',
      endpoint: process.env['S3_ENDPOINT'],
      forcePathStyle: true, // Required for MinIO
      credentials: {
        accessKeyId: process.env['S3_ACCESS_KEY'] ?? 'minioadmin',
        secretAccessKey: process.env['S3_SECRET_KEY'] ?? 'minioadmin',
      },
    });
    this.bucket = process.env['S3_BUCKET'] ?? 'hr-ai-documents';
  }

  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<string> {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket, Key: key, Body: body, ContentType: contentType,
    }));
    return key;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
