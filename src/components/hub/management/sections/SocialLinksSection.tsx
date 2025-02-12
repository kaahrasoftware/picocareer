
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";

interface SocialLinksSectionProps {
  register: UseFormRegister<FormData>;
}

export function SocialLinksSection({ register }: SocialLinksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
          <Input
            id="facebook"
            {...register("social_links.facebook")}
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
          <Input
            id="twitter"
            {...register("social_links.twitter")}
            placeholder="https://twitter.com/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
          <Input
            id="linkedin"
            {...register("social_links.linkedin")}
            placeholder="https://linkedin.com/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
          <Input
            id="instagram"
            {...register("social_links.instagram")}
            placeholder="https://instagram.com/..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
