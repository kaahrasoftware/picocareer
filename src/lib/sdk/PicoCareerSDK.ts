/**
 * PicoCareer Assessment SDK
 * A comprehensive TypeScript SDK for integrating PicoCareer assessments
 */

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface AssessmentSession {
  id: string;
  sessionToken: string;
  organizationId: string;
  templateId?: string;
  expiresAt: string;
  returnUrl?: string;
  callbackUrl?: string;
  webhookUrl?: string;
  clientMetadata?: Record<string, any>;
}

export interface AssessmentQuestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  options?: any;
  isRequired: boolean;
  orderIndex: number;
}

export interface AssessmentResponse {
  questionId: string;
  answer: any;
}

export interface AssessmentResult {
  id: string;
  sessionId: string;
  status: 'in_progress' | 'completed' | 'failed';
  recommendations: CareerRecommendation[];
  profileType?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  salaryRange?: string;
  requiredSkills?: string[];
  educationRequirements?: string[];
  reasoning: string;
}

export interface WebhookEvent {
  eventType: 'session.started' | 'session.completed' | 'response.submitted' | 'results.ready';
  sessionId: string;
  organizationId: string;
  timestamp: string;
  data: any;
}

export class PicoCareerSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PicoCareerSDKError';
  }
}

export class PicoCareerSDK {
  private config: Required<SDKConfig>;
  private baseHeaders: Record<string, string>;

  constructor(config: SDKConfig) {
    this.config = {
      baseUrl: 'https://wurdmlkfkzuivvwxjmxk.supabase.co/functions/v1',
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };

    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Assessment Session Management
   */
  async createSession(params: {
    externalUserId: string;
    templateId?: string;
    returnUrl?: string;
    callbackUrl?: string;
    webhookUrl?: string;
    clientMetadata?: Record<string, any>;
    expiresInMinutes?: number;
  }): Promise<AssessmentSession> {
    return this.request('POST', '/api-assessments', {
      external_user_id: params.externalUserId,
      template_id: params.templateId,
      return_url: params.returnUrl,
      callback_url: params.callbackUrl,
      webhook_url: params.webhookUrl,
      client_metadata: params.clientMetadata,
      expires_in_minutes: params.expiresInMinutes,
    });
  }

  async getSession(sessionId: string): Promise<AssessmentSession> {
    return this.request('GET', `/api-assessments/${sessionId}`);
  }

  async getQuestions(sessionToken: string): Promise<AssessmentQuestion[]> {
    return this.request('GET', `/api-assessments/questions?session_token=${sessionToken}`);
  }

  async submitResponse(
    sessionToken: string,
    responses: AssessmentResponse[]
  ): Promise<{ success: boolean; message: string }> {
    return this.request('POST', '/api-assessments/responses', {
      session_token: sessionToken,
      responses,
    });
  }

  async completeAssessment(sessionToken: string): Promise<{ success: boolean; assessmentId: string }> {
    return this.request('POST', '/api-assessments/complete', {
      session_token: sessionToken,
    });
  }

  /**
   * Results Management
   */
  async getResults(sessionId: string): Promise<AssessmentResult> {
    return this.request('GET', `/api-results/${sessionId}`);
  }

  async getAllResults(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ results: AssessmentResult[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('start_date', params.startDate);
    if (params?.endDate) query.append('end_date', params.endDate);

    return this.request('GET', `/api-results?${query.toString()}`);
  }

  /**
   * Analytics
   */
  async getAnalytics(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    sessions: number;
    completions: number;
    completionRate: number;
    averageScore: number;
    topCareers: Array<{ career: string; count: number }>;
  }> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.startDate) query.append('start_date', params.startDate);
    if (params?.endDate) query.append('end_date', params.endDate);

    return this.request('GET', `/api-results/analytics?${query.toString()}`);
  }

  /**
   * Webhook Utilities
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implement webhook signature validation
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  static parseWebhookEvent(payload: string): WebhookEvent {
    try {
      return JSON.parse(payload);
    } catch (error) {
      throw new PicoCareerSDKError('Invalid webhook payload', 'INVALID_WEBHOOK_PAYLOAD');
    }
  }

  /**
   * Private helper methods
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.baseHeaders,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, options);
        const responseData = await response.json();

        if (!response.ok) {
          throw new PicoCareerSDKError(
            responseData.error || 'Request failed',
            responseData.code || 'REQUEST_FAILED',
            response.status,
            responseData
          );
        }

        return responseData;
      } catch (error) {
        if (attempt === this.config.retryAttempts) {
          if (error instanceof PicoCareerSDKError) {
            throw error;
          }
          throw new PicoCareerSDKError(
            'Network request failed',
            'NETWORK_ERROR',
            undefined,
            error
          );
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw new PicoCareerSDKError('Max retry attempts reached', 'MAX_RETRIES_EXCEEDED');
  }
}

// Export the main SDK class as default
export default PicoCareerSDK;