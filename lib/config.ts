// Application Configuration

import { z } from 'zod';

const configSchema = z.object({
  n8n: z.object({
    webhookUrl: z.string().url(),
    apiKey: z.string().min(1),
    timeout: z.number().positive().default(30000),
    maxRetries: z.number().nonnegative().default(3),
    retryDelay: z.number().positive().default(1000),
  }),
  app: z.object({
    url: z.string().url(),
    name: z.string().default('MIXXN Claude'),
  }),
  features: z.object({
    autoRetry: z.boolean().default(true),
    errorLogging: z.boolean().default(true),
    analytics: z.boolean().default(false),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

export function getConfig(): AppConfig {
  const config = {
    n8n: {
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY || '',
      timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
      maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
      retryDelay: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      name: process.env.NEXT_PUBLIC_APP_NAME || 'MIXXN Claude',
    },
    features: {
      autoRetry: process.env.ENABLE_AUTO_RETRY === 'true',
      errorLogging: process.env.ENABLE_ERROR_LOGGING === 'true',
      analytics: process.env.ENABLE_ANALYTICS === 'true',
    },
  };

  return configSchema.parse(config);
}

export const config = getConfig();
