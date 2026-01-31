// n8n Type Definitions

export interface N8nConfig {
  webhookUrl: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface N8nWorkflowResponse<T = any> {
  success: boolean;
  data?: T;
  error?: N8nError;
}

export interface N8nError {
  code: string;
  message: string;
  details?: any;
}

export interface EchoRequest {
  message: string;
}

export interface EchoResponse {
  success: true;
  echo: string;
  timestamp: string;
  requestId: string;
  processed: boolean;
}

export type WorkflowStatus = 'idle' | 'processing' | 'success' | 'error' | 'retrying';

export interface WorkflowState {
  status: WorkflowStatus;
  data?: any;
  error?: N8nError;
  retryCount?: number;
}
