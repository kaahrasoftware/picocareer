import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BlogNotificationRequest {
  blogId: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blogId } = await req.json() as BlogNotificationRequest;
    console.log('Processing blog notification request:', { blogId });

    // Fetch blog details with author information
    const { data: blog, error: blogError } = await supabase
      .from('blogs')
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(
          full_name,
          email
        )
      `)
      .eq('id', blogId)
      .single();

    if (blogError || !blog) {
      console.error('Error fetching blog:', blogError);
      throw new Error('Blog not found');
    }

    console.log('Blog details:', blog);

    // Fetch all users to notify them about the new blog post
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch users');
    }

    console.log('Found users to notify:', users.length);

    // Create notifications for all users
    const notifications = users.map(user => ({
      profile_id: user.id,
      title: 'New Blog Post',
      message: `${blog.author.full_name} has published a new blog post: "${blog.title}"`,
      type: 'blog_posted',
      action_url: `/blog/${blog.id}`
    }));

    // Insert notifications
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      throw new Error('Failed to create notifications');
    }

    // Send emails to all users
    if (RESEND_API_KEY) {
      const emailContent = `
        <h2>New Blog Post: ${blog.title}</h2>
        <p>A new blog post has been published by ${blog.author.full_name}.</p>
        <p><strong>Summary:</strong> ${blog.summary}</p>
        <p>Read the full post on our website.</p>
      `;

      const emailPayload = {
        from: "PicoCareer <blogs@picocareer.com>",
        to: users.map(user => user.email),
        subject: `New Blog Post: ${blog.title}`,
        html: emailContent,
      };

      console.log('Sending email with payload:', emailPayload);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailRes.ok) {
        const emailError = await emailRes.text();
        console.error('Error sending email:', emailError);
        throw new Error('Failed to send email via Resend API');
      }

      const emailData = await emailRes.json();
      console.log('Email sent successfully:', emailData);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-blog-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);