import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfileManager } from '@/hooks/useProfileManager';
import type { Profile } from '@/types/database/profiles';

interface SocialLinksEditProps {
  profile: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  linkedin_url: string;
  github_url: string;
  website_url: string;
  X_url: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
}

export function SocialLinksEdit({ profile, onCancel, onSuccess }: SocialLinksEditProps) {
  const { updateSocialLinks, isUpdating } = useProfileManager(profile);
  
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      website_url: profile.website_url || '',
      X_url: (profile as any).X_url || '',
      instagram_url: (profile as any).instagram_url || '',
      facebook_url: (profile as any).facebook_url || '',
      youtube_url: (profile as any).youtube_url || '',
      tiktok_url: (profile as any).tiktok_url || '',
    }
  });

  const onSubmit = async (data: FormData) => {
    const result = await updateSocialLinks({
      linkedin_url: data.linkedin_url.trim() || null,
      github_url: data.github_url.trim() || null,
      website_url: data.website_url.trim() || null,
      X_url: data.X_url.trim() || null,
      instagram_url: data.instagram_url.trim() || null,
      facebook_url: data.facebook_url.trim() || null,
      youtube_url: data.youtube_url.trim() || null,
      tiktok_url: data.tiktok_url.trim() || null,
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          {...register("linkedin_url")}
          type="url"
          placeholder="https://linkedin.com/in/username"
        />
      </div>

      <div>
        <Label htmlFor="github_url">GitHub URL</Label>
        <Input
          id="github_url"
          {...register("github_url")}
          type="url"
          placeholder="https://github.com/username"
        />
      </div>

      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          {...register("website_url")}
          type="url"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <Label htmlFor="X_url">X (Twitter) URL</Label>
        <Input
          id="X_url"
          {...register("X_url")}
          type="url"
          placeholder="https://x.com/username"
        />
      </div>

      <div>
        <Label htmlFor="instagram_url">Instagram URL</Label>
        <Input
          id="instagram_url"
          {...register("instagram_url")}
          type="url"
          placeholder="https://instagram.com/username"
        />
      </div>

      <div>
        <Label htmlFor="facebook_url">Facebook URL</Label>
        <Input
          id="facebook_url"
          {...register("facebook_url")}
          type="url"
          placeholder="https://facebook.com/username"
        />
      </div>

      <div>
        <Label htmlFor="youtube_url">YouTube URL</Label>
        <Input
          id="youtube_url"
          {...register("youtube_url")}
          type="url"
          placeholder="https://youtube.com/channel/username"
        />
      </div>

      <div>
        <Label htmlFor="tiktok_url">TikTok URL</Label>
        <Input
          id="tiktok_url"
          {...register("tiktok_url")}
          type="url"
          placeholder="https://tiktok.com/@username"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}