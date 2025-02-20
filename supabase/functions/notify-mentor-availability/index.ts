
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from "npm:googleapis@118.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  mentorId: string;
  menteeId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { mentorId, menteeId }: RequestBody = await req.json()

    // Get mentor and mentee details
    const { data: mentor } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', mentorId)
      .single()

    const { data: mentee } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', menteeId)
      .single()

    if (!mentor || !mentee) {
      throw new Error('Mentor or mentee not found')
    }

    // Set up Gmail API
    const auth = new google.auth.JWT(
      Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      undefined,
      Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/gmail.send'],
      'info@picocareer.com'
    );

    const gmail = google.gmail({ version: 'v1', auth });

    // Create email content
    const emailContent = `
      <h2>New Availability Request</h2>
      <p>Hello ${mentor.first_name},</p>
      <p>${mentee.full_name} has requested availability slots from you.</p>
      <p>Please check your calendar and add some available time slots if possible.</p>
      <p>Best regards,<br/>The PicoCareer Team</p>
    `;

    // Create email message
    const emailLines = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${mentor.email}`,
      'From: PicoCareer <info@picocareer.com>',
      'Subject: New Availability Request',
      '',
      emailContent
    ];

    const email = emailLines.join('\r\n').trim();

    // Send email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      },
    });

    console.log('Email sent successfully to:', mentor.email);

    // Create notification in the database
    await supabase
      .from('notifications')
      .insert({
        profile_id: mentorId,
        type: 'mentor_request',
        title: 'New Availability Request',
        message: `${mentee.full_name} has requested availability slots from you.`,
        category: 'mentorship'
      })

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
