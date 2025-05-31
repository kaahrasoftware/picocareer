
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface OrganizationApiKey {
  id: string;
  organization_id: string;
  api_key: string;
  name: string;
  permissions: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface ApiUsageLog {
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  request_size_bytes: number;
  response_size_bytes: number;
  created_at: string;
}

// Rate limiting check
async function checkRateLimit(apiKeyId: string, limitPerMinute: number): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  
  const { count } = await supabase
    .from('organization_api_usage_logs')
    .select('*', { count: 'exact' })
    .eq('api_key_id', apiKeyId)
    .gte('created_at', oneMinuteAgo);
    
  return (count || 0) < limitPerMinute;
}

// Log API usage
async function logApiUsage(usage: Omit<ApiUsageLog, 'created_at'>): Promise<void> {
  await supabase
    .from('organization_api_usage_logs')
    .insert({
      ...usage,
      created_at: new Date().toISOString()
    });
}

// Validate API key
async function validateApiKey(apiKey: string): Promise<OrganizationApiKey | null> {
  const { data } = await supabase
    .from('organization_api_keys')
    .select('*')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();
    
  return data;
}

// Career Chat Session for Organizations
async function createOrganizationChatSession(orgId: string, userId?: string, metadata?: any) {
  const sessionData = {
    organization_id: orgId,
    external_user_id: userId,
    status: 'active',
    session_metadata: metadata || {},
    progress_data: {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0,
      overall: 0
    },
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('organization_chat_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Send message to chat session
async function sendChatMessage(sessionId: string, message: string, messageType: 'user' | 'bot' = 'user') {
  const messageData = {
    session_id: sessionId,
    content: message,
    message_type: messageType,
    created_at: new Date().toISOString(),
    metadata: {}
  };

  const { data, error } = await supabase
    .from('organization_chat_messages')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;

  // If it's a user message, generate AI response
  if (messageType === 'user') {
    try {
      // Call the existing career chat AI function
      const aiResponse = await supabase.functions.invoke('career-chat-ai', {
        body: {
          sessionId,
          userMessage: message,
          currentCategory: 'education',
          questionCount: 1
        }
      });

      if (aiResponse.data) {
        const botMessage = {
          session_id: sessionId,
          content: aiResponse.data.content?.question || 'Let me help you explore your career options.',
          message_type: 'bot',
          created_at: new Date().toISOString(),
          metadata: aiResponse.data
        };

        await supabase
          .from('organization_chat_messages')
          .insert(botMessage);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  }

  return data;
}

// Get chat session messages
async function getChatMessages(sessionId: string) {
  const { data, error } = await supabase
    .from('organization_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Search careers
async function searchCareers(query: string, filters?: any) {
  let queryBuilder = supabase
    .from('careers')
    .select('id, title, description, salary_range, industry, required_skills, job_outlook')
    .eq('status', 'Approved');

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
  }

  if (filters?.industry) {
    queryBuilder = queryBuilder.eq('industry', filters.industry);
  }

  if (filters?.limit) {
    queryBuilder = queryBuilder.limit(filters.limit);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

// Get organization analytics
async function getOrganizationAnalytics(orgId: string, startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const end = endDate || new Date().toISOString();

  const [sessionsResult, messagesResult, usageResult] = await Promise.all([
    supabase
      .from('organization_chat_sessions')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .gte('created_at', start)
      .lte('created_at', end),
    
    supabase
      .from('organization_chat_messages')
      .select('*', { count: 'exact' })
      .gte('created_at', start)
      .lte('created_at', end),
    
    supabase
      .from('organization_api_usage_logs')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
  ]);

  return {
    total_sessions: sessionsResult.count || 0,
    total_messages: messagesResult.count || 0,
    api_calls: usageResult.data?.length || 0,
    period: { start, end }
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const apiKeyData = await validateApiKey(apiKey);

    if (!apiKeyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting
    const rateLimitOk = await checkRateLimit(apiKeyData.id, apiKeyData.rate_limit_per_minute);
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let responseData: any;
    let statusCode = 200;

    // Route handling
    if (path === '/org-api/chat/sessions' && method === 'POST') {
      const body = await req.json();
      responseData = await createOrganizationChatSession(
        apiKeyData.organization_id,
        body.user_id,
        body.metadata
      );
      statusCode = 201;

    } else if (path.match(/\/org-api\/chat\/sessions\/([^\/]+)\/messages/) && method === 'POST') {
      const sessionId = path.split('/')[4];
      const body = await req.json();
      responseData = await sendChatMessage(sessionId, body.message, 'user');
      statusCode = 201;

    } else if (path.match(/\/org-api\/chat\/sessions\/([^\/]+)\/messages/) && method === 'GET') {
      const sessionId = path.split('/')[4];
      responseData = await getChatMessages(sessionId);

    } else if (path === '/org-api/careers/search' && method === 'GET') {
      const query = url.searchParams.get('q') || '';
      const industry = url.searchParams.get('industry');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      responseData = await searchCareers(query, { industry, limit });

    } else if (path === '/org-api/analytics' && method === 'GET') {
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      
      responseData = await getOrganizationAnalytics(apiKeyData.organization_id, startDate, endDate);

    } else {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log API usage
    const responseTime = Date.now() - startTime;
    await logApiUsage({
      api_key_id: apiKeyData.id,
      endpoint: path,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      request_size_bytes: 0, // Could be calculated if needed
      response_size_bytes: JSON.stringify(responseData).length
    });

    // Update API key usage count
    await supabase
      .from('organization_api_keys')
      .update({ 
        usage_count: apiKeyData.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', apiKeyData.id);

    return new Response(
      JSON.stringify({ data: responseData, success: true }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
