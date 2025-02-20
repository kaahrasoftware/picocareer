
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  mentorId: string;
  menteeId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const body = await req.json() as RequestBody;
    const { mentorId, menteeId } = body;

    if (!mentorId || !menteeId) {
      throw new Error('Missing required fields: mentorId and menteeId are required');
    }

    console.log('Creating Supabase client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching mentor profile...', mentorId);
    const { data: mentorData, error: mentorError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentorId)
      .single();

    if (mentorError) {
      console.error('Error fetching mentor:', mentorError);
      throw mentorError;
    }

    console.log('Fetching mentee profile...', menteeId);
    const { data: menteeData, error: menteeError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single();

    if (menteeError) {
      console.error('Error fetching mentee:', menteeError);
      throw menteeError;
    }

    console.log('Creating notification...');
    const { error: notifyError } = await supabaseAdmin
      .from('notifications')
      .insert({
        profile_id: mentorId,
        title: 'New Availability Request',
        message: `${menteeData.full_name} has requested your availability for mentoring sessions.`,
        type: 'availability_request',
        category: 'general'
      });

    if (notifyError) {
      console.error('Error creating notification:', notifyError);
      throw notifyError;
    }

    console.log('Successfully created notification');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification sent successfully'
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in notify-mentor-availability:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    );
  }
});
