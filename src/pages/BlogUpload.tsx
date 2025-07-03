
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/components/forms/blog/categories";
import { subcategories } from "@/components/forms/blog/subcategories";

export default function BlogUpload() {
  const { session } = useAuthSession();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [isRecent, setIsRecent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to upload blogs");
      return;
    }

    if (!title || !summary || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const blogData = {
        title,
        summary,
        content,
        author_id: session.user.id,
        status: 'Pending' as const,
        categories: selectedCategories as any,
        subcategories: selectedSubcategories as any,
        cover_image_url: coverImageUrl,
        other_notes: otherNotes,
        is_recent: isRecent,
      };

      const { error } = await supabase
        .from('blogs')
        .insert(blogData);

      if (error) throw error;

      toast.success("Blog submitted successfully! It will be reviewed before publication.");
      
      // Reset form
      setTitle("");
      setSummary("");
      setContent("");
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setCoverImageUrl("");
      setOtherNotes("");
      setIsRecent(false);
      
    } catch (error) {
      console.error('Error uploading blog:', error);
      toast.error("Failed to upload blog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleSubcategoryChange = (subcategory: string, checked: boolean) => {
    if (checked) {
      setSelectedSubcategories([...selectedSubcategories, subcategory]);
    } else {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== subcategory));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      setCoverImageUrl(data.publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to upload blogs</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Upload Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            required
          />
        </div>

        <div>
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary of your blog post"
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your blog content here..."
          />
        </div>

        <div>
          <Label>Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Subcategories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {subcategories.map((subcategory) => (
              <div key={subcategory} className="flex items-center space-x-2">
                <Checkbox
                  id={subcategory}
                  checked={selectedSubcategories.includes(subcategory)}
                  onCheckedChange={(checked) => handleSubcategoryChange(subcategory, checked as boolean)}
                />
                <Label htmlFor={subcategory} className="text-sm">{subcategory}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Cover Image</Label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {coverImageUrl && (
              <div className="mt-2">
                <img src={coverImageUrl} alt="Cover preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="otherNotes">Additional Notes</Label>
          <Textarea
            id="otherNotes"
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            placeholder="Any additional notes or context"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRecent"
            checked={isRecent}
            onCheckedChange={(checked) => setIsRecent(checked as boolean)}
          />
          <Label htmlFor="isRecent">Mark as recent content</Label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Uploading..." : "Submit Blog Post"}
        </Button>
      </form>
    </div>
  );
}
