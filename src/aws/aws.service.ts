import { Injectable } from '@nestjs/common';
import {
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

@Injectable()
export class AwsService {
  sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({});
  }

  async pushIntoQueue(attributes: Record<string, MessageAttributeValue>) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      DelaySeconds: 10,
      MessageAttributes: attributes,
      MessageBody:
        'Information about current NY Times fiction bestseller for week of 12/11/2016.',
    });

    const response = await this.sqsClient.send(command);

    return response;
  }

}
