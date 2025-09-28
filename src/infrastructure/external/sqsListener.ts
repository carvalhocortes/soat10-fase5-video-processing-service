import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ProcessVideoUseCase } from '@application/use-cases/payment/ProcessVideo.useCase';

export class SqsListener {
  private sqs: SQSClient;
  private queueUrl: string;
  private useCase: ProcessVideoUseCase;

  constructor(queueUrl: string, useCase: ProcessVideoUseCase) {
    this.sqs = new SQSClient({
      region: process.env.AWS_REGION || 'us-west-2',
    });
    this.queueUrl = queueUrl;
    this.useCase = useCase;
  }

  async listen(): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };
    const response = await this.sqs.send(new ReceiveMessageCommand(params));
    if (response.Messages) {
      for (const message of response.Messages) {
        try {
          const messageBody = JSON.parse(message.Body || '{}');
          const { eventType, payload } = JSON.parse(messageBody.Message || '{}');
          if (eventType === 'FILE_UPLOADED') {
            await this.useCase.execute(payload);
          }
          await this.sqs.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle!,
            }),
          );
        } catch (err) {
          console.error('Error processing message:', err);
        }
      }
    }
  }
}
