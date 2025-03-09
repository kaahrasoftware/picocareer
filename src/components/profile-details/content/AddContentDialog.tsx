
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
import { Upload, Link as LinkIcon, FileText } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  content_source: z.enum(["file", "link", "text"]),
  file: z.any().optional(),
  external_url: z.string().url("Please enter a valid URL").optional(),
  text_content: z.string().optional(),
});

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  onContentAdded: () => void;
}

export function AddContentDialog({ 
  open, 
  onOpenChange, 
  profileId, 
  onContentAdded 
}: AddContentDialogProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content_type: "document",
      status: "published",
      content_source: "file",
      external_url: "",
      text_content: "",
    },
  });

  const contentSource = form.watch("content_source");
  const contentType = form.watch("content_type");

  const handleUploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${contentType}/${crypto.randomUUID()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('mentor-content')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('mentor-content')
        .getPublicUrl(fileName);
      
      return {
        url: publicUrl,
        size: file.size,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof contentFormSchema>) => {
    try {
      setIsUploading(true);
      
      let fileUrl = null;
      let externalUrl = null;
      let sizeInBytes = 0;
      let metadata = {};
      
      // Handle file upload if content source is file
      if (values.content_source === "file" && values.file) {
        const fileData = await handleUploadFile(values.file);
        fileUrl = fileData.url;
        sizeInBytes = fileData.size;
      } 
      // Handle external URL if content source is link
      else if (values.content_source === "link" && values.external_url) {
        externalUrl = values.external_url;
      }
      // Handle text content if content source is text
      else if (values.content_source === "text" && values.text_content) {
        metadata = { text_content: values.text_content };
        sizeInBytes = new Blob([values.text_content || ""]).size;
      }
      
      // Save content record to the database
      const { error } = await supabase
        .from('mentor_content')
        .insert({
          mentor_id: profileId,
          title: values.title,
          description: values.description,
          content_type: values.content_type,
          file_url: fileUrl,
          external_url: externalUrl,
          size_in_bytes: sizeInBytes,
          status: values.status,
          metadata,
        });
      
      if (error) throw error;
      
      onContentAdded();
      form.reset();
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
          <DialogDescription>
            Add content to share with your mentees and other users.
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
            
            <FormField
              control={form.control}
              name="content_source"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Content Source</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-1"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="file" id="file" />
                        </FormControl>
                        <FormLabel htmlFor="file" className="font-normal cursor-pointer flex items-center">
                          <Upload className="h-4 w-4 mr-1" /> File
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="link" id="link" />
                        </FormControl>
                        <FormLabel htmlFor="link" className="font-normal cursor-pointer flex items-center">
                          <LinkIcon className="h-4 w-4 mr-1" /> Link
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="text" id="text" />
                        </FormControl>
                        <FormLabel htmlFor="text" className="font-normal cursor-pointer flex items-center">
                          <FileText className="h-4 w-4 mr-1" /> Text
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {contentSource === "file" && (
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {contentSource === "link" && (
              <FormField
                control={form.control}
                name="external_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {contentSource === "text" && (
              <FormField
                control={form.control}
                name="text_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your content here"
                        className="min-h-[200px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Add Content"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
