
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TemplateSettingsFormData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export function TemplateSettingsForm({ adminId }: { adminId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [libraryImages, setLibraryImages] = useState<{ name: string, url: string }[]>([]);
  
  const methods = useForm<TemplateSettingsFormData>({
    defaultValues: {
      logo_url: "",
      primary_color: "#9b87f5",
      secondary_color: "#7E69AB",
      accent_color: "#8B5CF6"
    }
  });

  const { watch, setValue } = methods;
  const logoUrl = watch("logo_url");
  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const accentColor = watch("accent_color");

  useEffect(() => {
    const fetchLogoImages = async () => {
      const { data, error } = await supabase.storage
        .from('images')
        .list('email-logos', {
          limit: 20,
          offset: 0,
        });

      if (error) {
        console.error('Error fetching logo images:', error);
        return;
      }

      const logoUrls = data?.map(file => ({
        name: file.name,
        url: supabase.storage.from('images').getPublicUrl(`email-logos/${file.name}`).data.publicUrl
      })) || [];

      setLibraryImages(logoUrls);
    };

    fetchLogoImages();
  }, []);

  const onSubmit = async (data: TemplateSettingsFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_template_settings')
        .upsert({
          admin_id: adminId,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color
        }, { onConflict: 'admin_id' });

      if (error) throw error;

      toast.success("Email Template Settings Updated");
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
        <Card className="p-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Email Template Design</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload
                  control={methods.control}
                  name="logo_url"
                  label="Company Logo"
                  description="Upload or select your logo (recommended size: 150x40px)"
                  bucket="images"
                  folderPath="email-logos"
                />
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" className="w-full">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Select from Library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Select Logo from Library</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-4 gap-4">
                        {libraryImages.map((image) => (
                          <div 
                            key={image.url} 
                            className="border rounded p-2 cursor-pointer hover:bg-muted"
                            onClick={() => setValue('logo_url', image.url)}
                          >
                            <img 
                              src={image.url} 
                              alt={image.name} 
                              className="w-full h-24 object-contain" 
                            />
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

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
          </div>

          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Template Settings"}
          </Button>
        </Card>
      </form>
    </FormProvider>
  );
}
