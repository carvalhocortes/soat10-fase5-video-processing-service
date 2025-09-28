import { createSqsListener } from '@infrastructure/external/sqsListenerFactory';
import { HttpServer } from '@infrastructure/http/server';

const start = async () => {
  try {
    console.log('🚀 Starting SOAT10 Video Processing Service...');

    const port = parseInt(process.env.PORT || '3000', 10);
    const queueUrl =
      process.env.SQS_VIDEO_PROCESSING_QUEUE_URL || 'https://sqs.us-west-2.amazonaws.com/339713125069/sqs-video-processing';
    const topicArn = process.env.SNS_VIDEO_PROCESSING_TOPIC_ARN || 'arn:aws:sns:us-west-2:339713125069:sns-video-processing';

    const httpServer = new HttpServer(port);
    await httpServer.start();

    const sqsListener = createSqsListener(queueUrl, topicArn);

    const pollMessages = async () => {
      console.log('📥 Starting to listen for SQS messages...');
      while (true) {
        try {
          await sqsListener.listen();
        } catch (error) {
          console.error('Error processing SQS messages:', error);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    };

    pollMessages().catch((error) => {
      console.error('Fatal error in SQS polling:', error);
      process.exit(1);
    });

    console.log('✅ Application started successfully!');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

start();
