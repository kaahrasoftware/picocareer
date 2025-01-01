import { EditableField } from "@/components/profile/EditableField";

interface SocialSectionProps {
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  xUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  profileId: string;
}

export function SocialSection({
  linkedinUrl,
  githubUrl,
  websiteUrl,
  xUrl,
  facebookUrl,
  tiktokUrl,
  youtubeUrl,
  instagramUrl,
  profileId
}: SocialSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Social Links</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <EditableField
          label="LinkedIn"
          value={linkedinUrl}
          fieldName="linkedin_url"
          profileId={profileId}
          placeholder="Add your LinkedIn URL"
        />
        <EditableField
          label="GitHub"
          value={githubUrl}
          fieldName="github_url"
          profileId={profileId}
          placeholder="Add your GitHub URL"
        />
        <EditableField
          label="Personal Website"
          value={websiteUrl}
          fieldName="website_url"
          profileId={profileId}
          placeholder="Add your website URL"
        />
        <EditableField
          label="X (Twitter)"
          value={xUrl}
          fieldName="X_url"
          profileId={profileId}
          placeholder="Add your X URL"
        />
        <EditableField
          label="Facebook"
          value={facebookUrl}
          fieldName="facebook_url"
          profileId={profileId}
          placeholder="Add your Facebook URL"
        />
        <EditableField
          label="TikTok"
          value={tiktokUrl}
          fieldName="tiktok_url"
          profileId={profileId}
          placeholder="Add your TikTok URL"
        />
        <EditableField
          label="YouTube"
          value={youtubeUrl}
          fieldName="youtube_url"
          profileId={profileId}
          placeholder="Add your YouTube URL"
        />
        <EditableField
          label="Instagram"
          value={instagramUrl}
          fieldName="instagram_url"
          profileId={profileId}
          placeholder="Add your Instagram URL"
        />
      </div>
    </div>
  );
}