
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  inviteId: string;
  hubId: string;
  invitedEmail: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inviteId, hubId, invitedEmail, role }: InvitationEmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get hub details
    const { data: hub, error: hubError } = await supabaseClient
      .from('hubs')
      .select('name, description')
      .eq('id', hubId)
      .single();

    if (hubError) throw hubError;

    // Get invitation token
    const { data: invite, error: inviteError } = await supabaseClient
      .from('hub_member_invites')
      .select('token')
      .eq('id', inviteId)
      .single();

    if (inviteError) throw inviteError;

    // Generate invitation URL
    const inviteUrl = `${Deno.env.get('PUBLIC_SITE_URL')}/hub-invite?token=${invite.token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Lovable <hub-invites@resend.dev>",
      to: [invitedEmail],
      subject: `You've been invited to join ${hub.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You've Been Invited!</h1>
          <p>You've been invited to join <strong>${hub.name}</strong> as a <strong>${role}</strong>.</p>
          ${hub.description ? `<p>${hub.description}</p>` : ''}
          <p>Click the button below to accept or decline this invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View Invitation
          </a>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-hub-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
