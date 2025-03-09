
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const contentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content_type: z.enum([
    "pdf", 
    "presentation", 
    "document", 
    "spreadsheet", 
    "image", 
    "blog", 
    "link", 
    "other"
  ]),
  status: z.enum(["draft", "published", "archived"]),
  external_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  external_url: string | null;
  size_in_bytes: number;
  status: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface EditContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItem: ContentItem;
  onContentUpdated: () => void;
}

export function EditContentDialog({ 
  open, 
  onOpenChange, 
  contentItem, 
  onContentUpdated 
}: EditContentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: contentItem.title,
      description: contentItem.description || "",
      content_type: contentItem.content_type as any,
      status: contentItem.status as any,
      external_url: contentItem.external_url || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contentFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Update content record in the database
      const { error } = await supabase
        .from('mentor_content')
        .update({
          title: values.title,
          description: values.description,
          content_type: values.content_type,
          external_url: values.external_url || null,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentItem.id);
      
      if (error) throw error;
      
      toast({
        title: "Content updated",
        description: "Your content has been successfully updated.",
      });
      
      onContentUpdated();
    } catch (error: any) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content type can only be changed if external_url is provided or file_url is null
  const canChangeContentType = !!contentItem.external_url || !contentItem.file_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update your content details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a description (optional)" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!canChangeContentType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {contentItem.external_url && (
              <FormField
                control={form.control}
                name="external_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {contentItem.file_url && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">File:</span>
                <a 
                  href={contentItem.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {contentItem.file_url.split('/').pop()}
                </a>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
