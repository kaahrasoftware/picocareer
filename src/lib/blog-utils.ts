import { supabase } from "@/integrations/supabase/client";

export async function generateBlogContent(title: string): Promise<string> {
  try {
    console.log('Generating blog content for title:', title);
    
    const { data, error } = await supabase.functions.invoke('generate-blog-content', {
      body: { title },
    });

    if (error) {
      console.error('Error generating blog content:', error);
      throw error;
    }

    console.log('Successfully generated blog content');
    return data.content;
  } catch (error) {
    console.error('Error in generateBlogContent:', error);
    throw error;
  }
}