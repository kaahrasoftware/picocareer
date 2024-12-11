import { supabase } from "@/integrations/supabase/client";

export async function generateBlogContent(title: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-blog-content', {
      body: { title },
    });

    if (error) throw error;
    return data.content;
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw error;
  }
}