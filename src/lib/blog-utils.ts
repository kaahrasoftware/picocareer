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

export async function generateContentForExistingBlogs() {
  try {
    console.log('Starting content generation for existing blogs');
    
    // Fetch all blogs that need content generation
    const { data: blogs, error: fetchError } = await supabase
      .from('blogs')
      .select('id, title, content')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`Found ${blogs?.length || 0} blogs to process`);

    // Process each blog
    for (const blog of blogs || []) {
      try {
        // Skip if content is already substantial (more than 500 characters)
        if (blog.content && blog.content.length > 500) {
          console.log(`Skipping blog ${blog.id} - already has substantial content`);
          continue;
        }

        console.log(`Generating content for blog: ${blog.title}`);
        const generatedContent = await generateBlogContent(blog.title);

        // Update the blog with new content
        const { error: updateError } = await supabase
          .from('blogs')
          .update({ content: generatedContent })
          .eq('id', blog.id);

        if (updateError) {
          console.error(`Error updating blog ${blog.id}:`, updateError);
          continue;
        }

        console.log(`Successfully updated blog ${blog.id}`);
      } catch (error) {
        console.error(`Error processing blog ${blog.id}:`, error);
        // Continue with next blog even if one fails
        continue;
      }
    }

    console.log('Finished content generation for existing blogs');
  } catch (error) {
    console.error('Error in generateContentForExistingBlogs:', error);
    throw error;
  }
}