// Error Classification and Handling

export class N8nError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'N8nError';
  }
}

export class NetworkError extends N8nError {
  constructor(message: string, details?: any) {
    super('NETWORK_ERROR', message, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends N8nError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class WorkflowError extends N8nError {
  constructor(message: string, details?: any) {
    super('WORKFLOW_ERROR', message, details);
    this.name = 'WorkflowError';
  }
}

export class TimeoutError extends N8nError {
  constructor(message: string = 'Request timed out', details?: any) {
    super('NETWORK_TIMEOUT', message, details);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends N8nError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super('RATE_LIMIT', message, details);
    this.name = 'RateLimitError';
  }
}

export function classifyError(error: any): N8nError {
  if (error instanceof N8nError) {
    return error;
  }

  const errorMessage = error?.message || 'Unknown error';
  const errorDetails = {
    originalError: error,
    stack: error?.stack,
  };

  // Network errors
  if (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ETIMEDOUT' ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection')
  ) {
    return new NetworkError(errorMessage, errorDetails);
  }

  // Timeout errors
  if (error?.code === 'ETIMEDOUT' || errorMessage.includes('timeout')) {
    return new TimeoutError(errorMessage, errorDetails);
  }

  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('required') ||
    errorMessage.includes('invalid')
  ) {
    return new ValidationError(errorMessage, errorDetails);
  }

  // Rate limiting
  if (error?.response?.status === 429 || errorMessage.includes('rate limit')) {
    return new RateLimitError(errorMessage, errorDetails);
  }

  // Default to workflow error
  return new WorkflowError(errorMessage, errorDetails);
}

export function shouldRetry(error: N8nError, retryCount: number, maxRetries: number): boolean {
  if (retryCount >= maxRetries) {
    return false;
  }

  // Retry network and timeout errors
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // Retry rate limit errors with delay
  if (error instanceof RateLimitError) {
    return true;
  }

  // Don't retry validation errors
  if (error instanceof ValidationError) {
    return false;
  }

  // Conditionally retry workflow errors
  return false;
}

export function getRetryDelay(retryCount: number, baseDelay: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return baseDelay * Math.pow(2, retryCount);
}
