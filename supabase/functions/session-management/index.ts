import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionManagementRequest {
  session_token?: string;
  action: 'status' | 'extend' | 'pause' | 'resume' | 'analytics' | 'recovery';
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { session_token, action, data }: SessionManagementRequest = await req.json();
    const startTime = Date.now();

    if (action === 'status' && !session_token) {
      throw new Error('Session token is required for status check');
    }

    let sessionId: string | null = null;
    if (session_token) {
      const { data: validatedSessionId, error: validationError } = await supabaseClient.rpc('validate_session_token', {
        p_session_token: session_token
      });

      if (validationError || !validatedSessionId) {
        throw new Error('Invalid or expired session token');
      }
      sessionId = validatedSessionId;
    }

    switch (action) {
      case 'status': {
        // Get detailed session status
        const { data: session, error: sessionError } = await supabaseClient
          .from('api_assessment_sessions')
          .select(`
            id,
            organization_id,
            api_user_id,
            template_id,
            session_token,
            is_active,
            started_at,
            completed_at,
            current_question_index,
            expires_at,
            last_activity_at,
            progress_data,
            client_metadata,
            api_assessment_templates!inner(
              name,
              estimated_duration_minutes,
              question_sets
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found');
        }

        // Calculate session statistics
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const startedAt = new Date(session.started_at || now);
        const lastActivity = new Date(session.last_activity_at || now);

        const totalQuestions = session.api_assessment_templates.question_sets?.reduce(
          (total: number, set: any) => total + (set.questions?.length || 0), 0
        ) || 0;

        const currentIndex = session.current_question_index || 0;
        const progressPercentage = totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;

        const timeElapsed = Math.round((now.getTime() - startedAt.getTime()) / 1000 / 60); // minutes
        const timeRemaining = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60));
        const timeSinceActivity = Math.round((now.getTime() - lastActivity.getTime()) / 1000 / 60);

        const status = {
          session_id: session.id,
          is_active: session.is_active,
          is_expired: now > expiresAt,
          is_completed: !!session.completed_at,
          progress: {
            current_question: currentIndex,
            total_questions: totalQuestions,
            percentage: progressPercentage,
            questions_remaining: Math.max(0, totalQuestions - currentIndex)
          },
          timing: {
            started_at: session.started_at,
            expires_at: session.expires_at,
            completed_at: session.completed_at,
            last_activity_at: session.last_activity_at,
            time_elapsed_minutes: timeElapsed,
            time_remaining_minutes: timeRemaining,
            minutes_since_activity: timeSinceActivity,
            estimated_duration: session.api_assessment_templates.estimated_duration_minutes
          },
          template: {
            name: session.api_assessment_templates.name
          }
        };

        return new Response(JSON.stringify(status), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'extend': {
        // Extend session expiration
        const extensionMinutes = data?.minutes || 30;
        const maxExtension = data?.max_minutes || 120;

        if (extensionMinutes > maxExtension) {
          throw new Error(`Extension cannot exceed ${maxExtension} minutes`);
        }

        const { data: session, error: fetchError } = await supabaseClient
          .from('api_assessment_sessions')
          .select('expires_at, completed_at')
          .eq('id', sessionId)
          .single();

        if (fetchError || !session) {
          throw new Error('Session not found');
        }

        if (session.completed_at) {
          throw new Error('Cannot extend completed session');
        }

        const newExpirationTime = new Date(Date.now() + extensionMinutes * 60 * 1000);

        const { error: updateError } = await supabaseClient
          .from('api_assessment_sessions')
          .update({
            expires_at: newExpirationTime.toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (updateError) {
          throw new Error('Failed to extend session');
        }

        return new Response(JSON.stringify({
          success: true,
          extended_by_minutes: extensionMinutes,
          new_expires_at: newExpirationTime.toISOString(),
          message: `Session extended by ${extensionMinutes} minutes`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'analytics': {
        // Get session analytics
        const { data: session, error: sessionError } = await supabaseClient
          .from('api_assessment_sessions')
          .select(`
            id,
            organization_id,
            started_at,
            completed_at,
            current_question_index,
            progress_data,
            last_activity_at,
            api_assessment_templates!inner(
              question_sets,
              estimated_duration_minutes
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found');
        }

        // Get response analytics
        const { data: responses, error: responsesError } = await supabaseClient
          .from('assessment_responses')
          .select('question_id, answer, created_at')
          .eq('assessment_id', session.id);

        if (responsesError) {
          console.error('Error fetching responses for analytics:', responsesError);
        }

        const now = new Date();
        const startedAt = new Date(session.started_at || now);
        const completedAt = session.completed_at ? new Date(session.completed_at) : null;

        const totalQuestions = session.api_assessment_templates.question_sets?.reduce(
          (total: number, set: any) => total + (set.questions?.length || 0), 0
        ) || 0;

        const analytics = {
          session_id: session.id,
          duration_minutes: completedAt 
            ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000 / 60)
            : Math.round((now.getTime() - startedAt.getTime()) / 1000 / 60),
          completion_rate: totalQuestions > 0 
            ? Math.round(((responses?.length || 0) / totalQuestions) * 100) 
            : 0,
          questions_answered: responses?.length || 0,
          questions_total: totalQuestions,
          average_time_per_question: responses?.length 
            ? Math.round((now.getTime() - startedAt.getTime()) / 1000 / 60 / responses.length)
            : 0,
          is_completed: !!session.completed_at,
          estimated_vs_actual: {
            estimated_minutes: session.api_assessment_templates.estimated_duration_minutes,
            actual_minutes: Math.round((now.getTime() - startedAt.getTime()) / 1000 / 60)
          }
        };

        return new Response(JSON.stringify(analytics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'recovery': {
        // Session recovery functionality
        const { data: session, error: sessionError } = await supabaseClient
          .from('api_assessment_sessions')
          .select(`
            id,
            is_active,
            expires_at,
            completed_at,
            current_question_index,
            progress_data
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found');
        }

        if (session.completed_at) {
          return new Response(JSON.stringify({
            recoverable: false,
            reason: 'Session already completed',
            completed_at: session.completed_at
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const isExpired = now > expiresAt;

        if (isExpired) {
          // Auto-extend expired session by 30 minutes for recovery
          const newExpirationTime = new Date(Date.now() + 30 * 60 * 1000);

          const { error: updateError } = await supabaseClient
            .from('api_assessment_sessions')
            .update({
              expires_at: newExpirationTime.toISOString(),
              is_active: true,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', sessionId);

          if (updateError) {
            throw new Error('Failed to recover session');
          }

          return new Response(JSON.stringify({
            recoverable: true,
            recovered: true,
            message: 'Session recovered and extended by 30 minutes',
            new_expires_at: newExpirationTime.toISOString(),
            current_question_index: session.current_question_index,
            progress_data: session.progress_data
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          recoverable: true,
          recovered: false,
          message: 'Session is still active',
          expires_at: session.expires_at,
          current_question_index: session.current_question_index,
          progress_data: session.progress_data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in session-management function:', error);
    
    const statusCode = error.message.includes('Invalid') || error.message.includes('expired') ? 401 : 
                       error.message.includes('not found') ? 404 : 
                       error.message.includes('Unknown action') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'SESSION_MANAGEMENT_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});