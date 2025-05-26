import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as Stream from 'stream';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class UploadService {
  s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
    console.log('UploadService initialized');
  }

  async uploadOnS3AsStream(readStream: () => Stream, filePath: string) {
    const inStream = readStream();
    const pass = new Stream.PassThrough();
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        Body: pass,
        ContentType: 'image/png',
        ACL: 'public-read',
      },
    });
    inStream.pipe(pass);

    const result = await upload.done();
    return result;
  }
}
