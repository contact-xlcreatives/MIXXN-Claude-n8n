// Zod Validation Schemas

import { z } from 'zod';

// Echo Workflow Schemas
export const echoRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
});

export type EchoRequest = z.infer<typeof echoRequestSchema>;

export const echoResponseSchema = z.object({
  success: z.literal(true),
  echo: z.string(),
  timestamp: z.string(),
  requestId: z.string(),
  processed: z.boolean(),
});

export type EchoResponse = z.infer<typeof echoResponseSchema>;

// Generic Error Response Schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Workflow Response Union
export const workflowResponseSchema = z.union([
  echoResponseSchema,
  errorResponseSchema,
]);

export type WorkflowResponse = z.infer<typeof workflowResponseSchema>;
