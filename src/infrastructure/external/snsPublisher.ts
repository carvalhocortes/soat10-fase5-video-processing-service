import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export interface SnsEventMessage {
  eventType: string;
  payload: any;
}

export class SnsPublisher {
  private sns: SNSClient;
  private topicArn: string;

  constructor(topicArn: string) {
    this.sns = new SNSClient({});
    this.topicArn = topicArn;
  }

  async publish(message: SnsEventMessage): Promise<void> {
    const params = {
      TopicArn: this.topicArn,
      Message: JSON.stringify({
        eventType: message.eventType,
        payload: message.payload,
        timestamp: new Date().toISOString(),
      }),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: message.eventType,
        },
      },
    };
    await this.sns.send(new PublishCommand(params));
  }
}
