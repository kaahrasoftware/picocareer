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
  isEditing: boolean;
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
  profileId,
  isEditing
}: SocialSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Social Links</h3>
      <div className="grid grid-cols-4 gap-4">
        <EditableField
          label="LinkedIn"
          value={linkedinUrl}
          fieldName="linkedin_url"
          profileId={profileId}
          placeholder="Add your LinkedIn URL"
          isEditing={isEditing}
        />
        <EditableField
          label="GitHub"
          value={githubUrl}
          fieldName="github_url"
          profileId={profileId}
          placeholder="Add your GitHub URL"
          isEditing={isEditing}
        />
        <EditableField
          label="Personal Website"
          value={websiteUrl}
          fieldName="website_url"
          profileId={profileId}
          placeholder="Add your website URL"
          isEditing={isEditing}
        />
        <EditableField
          label="X (Twitter)"
          value={xUrl}
          fieldName="X_url"
          profileId={profileId}
          placeholder="Add your X URL"
          isEditing={isEditing}
        />
        <EditableField
          label="Facebook"
          value={facebookUrl}
          fieldName="facebook_url"
          profileId={profileId}
          placeholder="Add your Facebook URL"
          isEditing={isEditing}
        />
        <EditableField
          label="TikTok"
          value={tiktokUrl}
          fieldName="tiktok_url"
          profileId={profileId}
          placeholder="Add your TikTok URL"
          isEditing={isEditing}
        />
        <EditableField
          label="YouTube"
          value={youtubeUrl}
          fieldName="youtube_url"
          profileId={profileId}
          placeholder="Add your YouTube URL"
          isEditing={isEditing}
        />
        <EditableField
          label="Instagram"
          value={instagramUrl}
          fieldName="instagram_url"
          profileId={profileId}
          placeholder="Add your Instagram URL"
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}