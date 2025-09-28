import { SqsListener } from '@infrastructure/external/sqsListener';
import { ProcessVideoUseCase } from '@application/use-cases/payment/ProcessVideo.useCase';
import { SnsPublisher } from '@infrastructure/external/snsPublisher';

export function createSqsListener(queueUrl: string, topicArn: string): SqsListener {
  const snsPublisher = new SnsPublisher(topicArn);
  const useCase = new ProcessVideoUseCase(snsPublisher);
  return new SqsListener(queueUrl, useCase);
}
