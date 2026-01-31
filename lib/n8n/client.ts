// n8n HTTP Client with Retry Logic

import type { N8nConfig, N8nWorkflowResponse } from './types';
import { classifyError, shouldRetry, getRetryDelay, N8nError } from './errors';
import { config } from '../config';

export class N8nClient {
  private config: N8nConfig;

  constructor(customConfig?: Partial<N8nConfig>) {
    this.config = {
      webhookUrl: config.n8n.webhookUrl,
      apiKey: config.n8n.apiKey,
      timeout: config.n8n.timeout,
      maxRetries: config.n8n.maxRetries,
      retryDelay: config.n8n.retryDelay,
      ...customConfig,
    };
  }

  /**
   * Execute a workflow via webhook
   */
  async executeWorkflow<TRequest = any, TResponse = any>(
    endpoint: string,
    data: TRequest,
    retryCount: number = 0
  ): Promise<N8nWorkflowResponse<TResponse>> {
    const url = `${this.config.webhookUrl}/webhook/${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Check if the response indicates success
      if (result.success === false && result.error) {
        const error = classifyError(result.error);

        // Attempt retry if applicable
        if (
          config.features.autoRetry &&
          shouldRetry(error, retryCount, this.config.maxRetries!)
        ) {
          const delay = getRetryDelay(retryCount, this.config.retryDelay);

          if (config.features.errorLogging) {
            console.log(
              `Retrying workflow ${endpoint} (attempt ${retryCount + 1}/${this.config.maxRetries}) after ${delay}ms`
            );
          }

          await this.sleep(delay);
          return this.executeWorkflow(endpoint, data, retryCount + 1);
        }

        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      const classified = classifyError(error);

      // Log error if enabled
      if (config.features.errorLogging) {
        console.error(`n8n workflow error (${endpoint}):`, classified);
      }

      // Attempt retry if applicable
      if (
        config.features.autoRetry &&
        shouldRetry(classified, retryCount, this.config.maxRetries!)
      ) {
        const delay = getRetryDelay(retryCount, this.config.retryDelay);

        if (config.features.errorLogging) {
          console.log(
            `Retrying workflow ${endpoint} (attempt ${retryCount + 1}/${this.config.maxRetries}) after ${delay}ms`
          );
        }

        await this.sleep(delay);
        return this.executeWorkflow(endpoint, data, retryCount + 1);
      }

      return {
        success: false,
        error: {
          code: classified.code,
          message: classified.message,
          details: classified.details,
        },
      };
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check n8n connection health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      if (config.features.errorLogging) {
        console.error('n8n health check failed:', error);
      }
      return false;
    }
  }
}

// Export singleton instance
export const n8nClient = new N8nClient();

// Export factory function
export function createN8nClient(customConfig?: Partial<N8nConfig>): N8nClient {
  return new N8nClient(customConfig);
}
