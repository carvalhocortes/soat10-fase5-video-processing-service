import * as yup from 'yup';
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

const envSchema = yup.object({
  NODE_ENV: yup.mixed().oneOf(['development', 'production', 'test']).default('development'),
  PORT: yup
    .number()
    .transform((value) => Number(value))
    .default(3000),

  // AWS
  AWS_REGION: yup.string().required(),
  AWS_ACCESS_KEY_ID: yup.string().required(),
  AWS_SECRET_ACCESS_KEY: yup.string().required(),
  AWS_SESSION_TOKEN: yup.string().required(),

  // External APIs
});

export const env = envSchema.validateSync({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
});

export type EnvConfig = yup.InferType<typeof envSchema>;
