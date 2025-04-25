
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemplateSettingsFormData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

interface TemplateSettingsFormProps {
  adminId: string;
}

export function TemplateSettingsForm({ adminId }: TemplateSettingsFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  
  const methods = useForm<TemplateSettingsFormData>({
    defaultValues: {
      logo_url: "",
      primary_color: "#9b87f5",
      secondary_color: "#7E69AB",
      accent_color: "#8B5CF6"
    }
  });

  const { watch, setValue } = methods;
  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const accentColor = watch("accent_color");
  const logoUrl = watch("logo_url");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('email_template_settings')
        .select('*')
        .eq('admin_id', adminId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error loading template settings:', error);
        }
        return;
      }

      if (data) {
        setValue('logo_url', data.logo_url || '');
        setValue('primary_color', data.primary_color);
        setValue('secondary_color', data.secondary_color);
        setValue('accent_color', data.accent_color);
      }
    };

    fetchSettings();
  }, [adminId, setValue]);

  const onSubmit = async (data: TemplateSettingsFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_template_settings')
        .upsert({
          admin_id: adminId,
          ...data
        });

      if (error) throw error;
      toast.success("Default template settings saved");
    } catch (error) {
      console.error("Error saving template settings:", error);
      toast.error("Failed to save template settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60}>
            <Card className="p-6 h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Branding Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload your logo and customize the branding for all email templates.
                    </p>
                    
                    <ImageUpload
                      control={methods.control}
                      name="logo_url"
                      label="Company Logo"
                      description="Upload your company logo (recommended size: 150x40px)"
                      bucket="email-assets"
                      folderPath="logos"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Set the default colors for all email templates. Content-specific templates can override these settings.
                    </p>
                    
                    <div className="grid gap-6">
                      <ColorPicker
                        value={primaryColor}
                        onChange={(value) => setValue("primary_color", value)}
                        label="Primary Color"
                        description="Main brand color used in headers and buttons"
                      />
                      
                      <ColorPicker
                        value={secondaryColor}
                        onChange={(value) => setValue("secondary_color", value)}
                        label="Secondary Color"
                        description="Used for gradients and backgrounds"
                      />
                      
                      <ColorPicker
                        value={accentColor}
                        onChange={(value) => setValue("accent_color", value)}
                        label="Accent Color"
                        description="Used for links and call-to-action buttons"
                      />
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
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              
              {/* Simple Email Header Preview */}
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  {logoUrl ? (
                    <div className="h-10 flex items-center justify-center">
                      <img 
                        src={logoUrl} 
                        alt="Company Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-10 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                      Company Logo
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div 
                    className="h-12 rounded" 
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      marginBottom: '16px'
                    }}
                  ></div>
                  
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      Button Example
                    </button>
                  </div>
                </div>
                
                <div className="border-t p-4 text-center">
                  <div className="text-xs text-gray-400">
                    Footer area with unsubscribe link
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 bg-white p-3 rounded border">
                <p>These colors will be applied as defaults for all email templates. Individual content type templates can override these settings.</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </form>
    </FormProvider>
  );
}
