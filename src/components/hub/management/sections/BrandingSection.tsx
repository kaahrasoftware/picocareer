
import { Control } from "react-hook-form";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormData } from "../HubGeneralSettings";

interface BrandingSectionProps {
  control: Control<FormData>;
  register: any;
}

export function BrandingSection({ control, register }: BrandingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            control={control}
            name="logo_url"
            label="Logo"
            description="Upload your hub logo (recommended size: 200x200px)"
            bucket="hub-logos"
          />
          <ImageUpload
            control={control}
            name="banner_url"
            label="Banner"
            description="Upload your hub banner (recommended size: 1200x300px)"
            bucket="hub-banners"
          />
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Brand Colors</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.primary")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.primary")}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.secondary")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.secondary")}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="accentColor" className="text-sm font-medium">Accent Color</label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.accent")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.accent")}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
