import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    position: string | null;
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    location?: string | null;
    top_mentor?: boolean | null;
  } | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!profile) return null;

  const displayTitle = profile.position || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.position 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Use user ID in the file path to comply with RLS policies
      const filePath = `${profile.id}.${fileExt}`;

      // If there's an existing avatar, delete it first
      if (profile.avatar_url) {
        const oldFilePath = profile.avatar_url.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([oldFilePath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      // Force reload the page to update the avatar
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 ml-6">
      <div className="relative w-20 h-20 group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
        <div className="absolute inset-[3px] rounded-full bg-background" />
        <Avatar className="h-16 w-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
          <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-white" />
          )}
        </label>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{profile.full_name}</h2>
          {profile.top_mentor ? (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Top Mentor
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
              mentor
            </Badge>
          )}
        </div>
        <p className="text-lg font-medium text-foreground/90">{displayTitle}</p>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {profile.position ? (
              <Building2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{displaySubtitle}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}