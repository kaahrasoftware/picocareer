
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    const client = new SmtpClient();

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

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: Deno.env.get("GMAIL_USER"),
      password: Deno.env.get("GMAIL_APP_PASSWORD")
    });

    // Send email to mentor
    await client.send({
      from: Deno.env.get("GMAIL_USER") || "",
      to: mentor.email,
      subject: "New Availability Request",
      content: `
        <h2>New Availability Request</h2>
        <p>Hello ${mentor.first_name},</p>
        <p>${mentee.full_name} has requested availability slots from you.</p>
        <p>Please check your calendar and add some available time slots if possible.</p>
        <p>Best regards,<br/>The PicoCareer Team</p>
      `,
      html: true
    });

    await client.close();

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
