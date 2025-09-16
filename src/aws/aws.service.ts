import { Injectable } from '@nestjs/common';
import {
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

import * as Stream from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  sqsClient: SQSClient;
  s3Client: S3Client;

  constructor() {
    this.sqsClient = new SQSClient({});
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
  }

  async pushIntoQueue(attributes: Record<string, MessageAttributeValue>) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      DelaySeconds: 1,
      MessageAttributes: attributes,
      MessageBody:
        'Information about current NY Times fiction bestseller for week of 12/11/2016.',
    });

    const response = await this.sqsClient.send(command);

    return response;
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
