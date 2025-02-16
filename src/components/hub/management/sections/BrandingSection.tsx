import { Control, useFormContext } from "react-hook-form";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormData } from "../HubGeneralSettings";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";

const BRAND_COLORS = {
  brand: [
    { name: 'Primary Purple', value: '#9b87f5' },
    { name: 'Secondary Purple', value: '#7E69AB' },
    { name: 'Accent Purple', value: '#8B5CF6' },
  ],
  pastel: [
    { name: 'Soft Purple', value: '#E5DEFF' },
    { name: 'Soft Blue', value: '#D3E4FD' },
    { name: 'Soft Green', value: '#F2FCE2' },
    { name: 'Soft Yellow', value: '#FEF7CD' },
    { name: 'Soft Orange', value: '#FEC6A1' },
    { name: 'Soft Pink', value: '#FFDEE2' },
    { name: 'Soft Peach', value: '#FDE1D3' },
  ],
  vibrant: [
    { name: 'Vivid Purple', value: '#8B5CF6' },
    { name: 'Magenta Pink', value: '#D946EF' },
    { name: 'Bright Orange', value: '#F97316' },
    { name: 'Ocean Blue', value: '#0EA5E9' },
  ],
};

const DEFAULT_COLORS = {
  primary: '#9b87f5',
  secondary: '#7E69AB',
  accent: '#8B5CF6',
};

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description: string;
}

function ColorPicker({ value, onChange, label, description }: ColorPickerProps) {
  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };

  const handleCopyHex = (hexCode: string) => {
    navigator.clipboard.writeText(hexCode);
    toast({
      title: "Copied!",
      description: `Color code ${hexCode} copied to clipboard`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="text-sm font-medium flex items-center gap-2">
              {label}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex gap-2">
            <div
              className="w-12 h-10 rounded border cursor-pointer"
              style={{ backgroundColor: value }}
            />
            <div className="relative flex-1">
              <Input
                value={value}
                readOnly
                className="w-[120px] font-mono uppercase pr-8"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => handleCopyHex(value)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-3">
          <Tabs defaultValue="custom">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
              <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom">
              <div className="space-y-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-32"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="presets" className="space-y-4">
              {Object.entries(BRAND_COLORS).map(([category, colors]) => (
                <div key={category}>
                  <div className="text-sm font-medium mb-2 capitalize">{category}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <TooltipProvider key={color.value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleColorChange(color.value)}
                              className={cn(
                                "w-full aspect-square rounded border relative group",
                                value === color.value && "ring-2 ring-primary"
                              )}
                              style={{ backgroundColor: color.value }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyHex(color.value);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color.name}</p>
                            <p className="font-mono text-xs">{color.value}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface BrandingSectionProps {
  control: Control<FormData>;
  register: any;
  hubId: string;
  defaultValues: FormData;
}

export function BrandingSection({ control, register, hubId, defaultValues }: BrandingSectionProps) {
  const queryClient = useQueryClient();
  const { getValues, setValue } = useFormContext<FormData>();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { logo_url, banner_url, brand_colors } = getValues();
      
      const { error } = await supabase
        .from('hubs')
        .update({
          logo_url,
          banner_url,
          brand_colors,
          updated_at: new Date().toISOString()
        })
        .eq('id', hubId);

      if (error) throw error;

      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'hub_settings_updated',
        _details: {
          logo_url,
          banner_url,
          brand_colors
        }
      });

      await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
      await queryClient.invalidateQueries({ queryKey: ['hubs'] });
      
      toast({
        title: "Success",
        description: "Branding settings have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving branding settings:', error);
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUploadSuccess = async (newUrl: string) => {
    await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
    await queryClient.invalidateQueries({ queryKey: ['hubs'] });
  };

  const resetColors = () => {
    setValue('brand_colors.primary', DEFAULT_COLORS.primary);
    setValue('brand_colors.secondary', DEFAULT_COLORS.secondary);
    setValue('brand_colors.accent', DEFAULT_COLORS.accent);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Branding</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetColors}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Colors
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            control={control}
            name="logo_url"
            label="Logo"
            description="Upload your hub logo (recommended size: 200x200px)"
            bucket="hub-logos"
            onUploadSuccess={handleImageUploadSuccess}
          />
          <ImageUpload
            control={control}
            name="banner_url"
            label="Banner"
            description="Upload your hub banner (recommended size: 1200x300px)"
            bucket="hub-banners"
            onUploadSuccess={handleImageUploadSuccess}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Brand Colors</h4>
            <div className="text-sm text-muted-foreground">
              Preview your color scheme in real-time
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <ColorPicker
              value={getValues("brand_colors.primary") || DEFAULT_COLORS.primary}
              onChange={(value) => setValue("brand_colors.primary", value)}
              label="Primary Color"
              description="Main brand color, used for primary elements and emphasis"
            />
            
            <ColorPicker
              value={getValues("brand_colors.secondary") || DEFAULT_COLORS.secondary}
              onChange={(value) => setValue("brand_colors.secondary", value)}
              label="Secondary Color"
              description="Supporting color, used for secondary elements and backgrounds"
            />
            
            <ColorPicker
              value={getValues("brand_colors.accent") || DEFAULT_COLORS.accent}
              onChange={(value) => setValue("brand_colors.accent", value)}
              label="Accent Color"
              description="Highlight color, used for calls-to-action and important elements"
            />
          </div>

          <div className="mt-6 p-4 rounded-lg border">
            <div className="text-sm font-medium mb-3">Live Preview</div>
            <div className="space-y-2">
              <div 
                className="h-16 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${getValues("brand_colors.primary") || DEFAULT_COLORS.primary}, ${getValues("brand_colors.secondary") || DEFAULT_COLORS.secondary})`
                }}
              />
              <div className="flex gap-2">
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: getValues("brand_colors.primary") || DEFAULT_COLORS.primary }}
                />
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: getValues("brand_colors.secondary") || DEFAULT_COLORS.secondary }}
                />
                <div
                  className="flex-1 h-8 rounded"
                  style={{ backgroundColor: getValues("brand_colors.accent") || DEFAULT_COLORS.accent }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
