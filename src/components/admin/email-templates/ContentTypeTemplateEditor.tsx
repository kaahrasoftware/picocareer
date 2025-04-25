
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";
import { EmailTemplatePreview } from "./EmailTemplatePreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Move } from "lucide-react";
import type { EmailContentTypeSettings } from "@/types/database/email";
import { ContentType } from "../email-campaign-form/utils";

interface ContentTypeTemplateEditorProps {
  adminId: string;
  contentType: ContentType;
}

interface FormData extends Omit<EmailContentTypeSettings, 'id' | 'admin_id' | 'created_at' | 'updated_at'> {
  layout_settings: {
    headerStyle: 'centered' | 'banner' | 'minimal';
    showAuthor: boolean;
    showDate: boolean;
    imagePosition: 'top' | 'inline' | 'side';
    contentBlocks: string[];
    metadataDisplay: string[];
  };
}

export function ContentTypeTemplateEditor({ adminId, contentType }: ContentTypeTemplateEditorProps) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  const methods = useForm<FormData>({
    defaultValues: {
      content_type: contentType,
      primary_color: '#9b87f5',
      secondary_color: '#7E69AB',
      accent_color: '#8B5CF6',
      layout_settings: {
        headerStyle: 'centered',
        showAuthor: true,
        showDate: true,
        imagePosition: 'top',
        contentBlocks: ['title', 'image', 'description', 'cta'],
        metadataDisplay: ['category', 'date', 'author']
      }
    }
  });

  const { register, setValue, watch, handleSubmit, reset } = methods;
  const values = watch();

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('email_content_type_settings')
        .select('*')
        .eq('admin_id', adminId)
        .eq('content_type', contentType)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error loading template settings:', error);
        }
        return;
      }

      if (data) {
        reset({
          content_type: contentType,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          layout_settings: data.layout_settings as FormData['layout_settings']
        });
      }
    };

    loadSettings();
  }, [adminId, contentType, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_content_type_settings')
        .upsert({
          admin_id: adminId,
          content_type: contentType,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          layout_settings: data.layout_settings
        });

      if (error) throw error;

      toast.success('Template settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to save template settings');
      console.error('Error saving template settings:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateContentBlocks = (blockName: string, checked: boolean) => {
    const currentBlocks = values.layout_settings.contentBlocks || [];
    if (checked && !currentBlocks.includes(blockName)) {
      setValue('layout_settings.contentBlocks', [...currentBlocks, blockName]);
    } else if (!checked && currentBlocks.includes(blockName)) {
      setValue('layout_settings.contentBlocks', currentBlocks.filter(block => block !== blockName));
    }
  };

  const updateMetadataDisplay = (fieldName: string, checked: boolean) => {
    const currentMetadata = values.layout_settings.metadataDisplay || [];
    if (checked && !currentMetadata.includes(fieldName)) {
      setValue('layout_settings.metadataDisplay', [...currentMetadata, fieldName]);
    } else if (!checked && currentMetadata.includes(fieldName)) {
      setValue('layout_settings.metadataDisplay', currentMetadata.filter(field => field !== fieldName));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60}>
            <Card className="p-6 h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="colors">Colors & Branding</TabsTrigger>
                  <TabsTrigger value="layout">Layout Structure</TabsTrigger>
                  <TabsTrigger value="content">Content Elements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="colors" className="space-y-4">
                  <h3 className="text-lg font-semibold">Color Settings</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Customize the colors for {contentType} email templates.
                  </p>
                  
                  <div className="space-y-4">
                    <ColorPicker
                      value={values.primary_color}
                      onChange={(value) => setValue('primary_color', value)}
                      label="Primary Color"
                      description="Main brand color used for headers and titles"
                    />
                    
                    <ColorPicker
                      value={values.secondary_color}
                      onChange={(value) => setValue('secondary_color', value)}
                      label="Secondary Color"
                      description="Used for gradients and backgrounds"
                    />
                    
                    <ColorPicker
                      value={values.accent_color}
                      onChange={(value) => setValue('accent_color', value)}
                      label="Accent Color"
                      description="Used for links and call-to-action buttons"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <h3 className="text-lg font-semibold">Layout Structure</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Define the structure and layout of your email template.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Header Style</label>
                      <Select
                        value={values.layout_settings.headerStyle}
                        onValueChange={(value) => setValue('layout_settings.headerStyle', value as 'centered' | 'banner' | 'minimal')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose header style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="centered">Centered</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image Position</label>
                      <Select
                        value={values.layout_settings.imagePosition}
                        onValueChange={(value) => setValue('layout_settings.imagePosition', value as 'top' | 'inline' | 'side')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose image position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top (Full width)</SelectItem>
                          <SelectItem value="inline">Inline (Centered)</SelectItem>
                          <SelectItem value="side">Side (Text wrap)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4">
                  <h3 className="text-lg font-semibold">Content Elements</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose which elements to display in your email content.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Content Blocks</h4>
                      <div className="space-y-2">
                        {['title', 'image', 'description', 'cta'].map((block) => (
                          <div key={block} className="flex items-center space-x-2">
                            <Switch
                              id={`content-block-${block}`}
                              checked={values.layout_settings.contentBlocks?.includes(block) || false}
                              onCheckedChange={(checked) => updateContentBlocks(block, checked)}
                            />
                            <Label htmlFor={`content-block-${block}`} className="capitalize">{block}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Display Options</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="show-author"
                            {...register('layout_settings.showAuthor')}
                          />
                          <Label htmlFor="show-author">Show Author</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="show-date"
                            {...register('layout_settings.showDate')}
                          />
                          <Label htmlFor="show-date">Show Date</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Metadata Fields</h4>
                      <div className="space-y-2">
                        {['author', 'category', 'date', 'readTime'].map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Switch
                              id={`metadata-field-${field}`}
                              checked={values.layout_settings.metadataDisplay?.includes(field) || false}
                              onCheckedChange={(checked) => updateMetadataDisplay(field, checked)}
                            />
                            <Label htmlFor={`metadata-field-${field}`} className="capitalize">{field}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Template Settings"}
                </Button>
              </div>
            </Card>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40}>
            <div className="h-full flex flex-col p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <EmailTemplatePreview 
                contentType={contentType}
                primaryColor={values.primary_color}
                secondaryColor={values.secondary_color}
                accentColor={values.accent_color}
                layoutSettings={values.layout_settings}
              />
              <div className="mt-4 p-3 bg-white rounded border text-xs text-gray-500">
                <p>This is a preview of how your email template will look. The actual email may vary slightly depending on the email client.</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </form>
    </FormProvider>
  );
}
