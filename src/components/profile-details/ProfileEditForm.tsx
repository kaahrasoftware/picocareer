import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileEditFormProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      bio: profile.bio || "",
      skills: profile.skills?.join(", ") || "",
      tools_used: profile.tools_used?.join(", ") || "",
      keywords: profile.keywords?.join(", ") || "",
      fields_of_interest: profile.fields_of_interest?.join(", ") || "",
      linkedin_url: profile.linkedin_url || "",
      github_url: profile.github_url || "",
      website_url: profile.website_url || "",
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Convert comma-separated strings to arrays
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s: string) => s.trim()) : [],
        tools_used: data.tools_used ? data.tools_used.split(",").map((t: string) => t.trim()) : [],
        keywords: data.keywords ? data.keywords.split(",").map((k: string) => k.trim()) : [],
        fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(",").map((f: string) => f.trim()) : [],
      };

      const { error } = await supabase
        .from('profiles')
        .update(formattedData)
        .eq('id', profile.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
      {/* Bio Section */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">About</h4>
        <Textarea
          {...register("bio")}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
        />
      </div>

      {/* Skills Section */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Skills</h4>
          <Input
            {...register("skills")}
            placeholder="Enter skills (comma-separated)"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Tools</h4>
          <Input
            {...register("tools_used")}
            placeholder="Enter tools (comma-separated)"
          />
        </div>
      </div>

      {/* Keywords and Fields of Interest */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Keywords</h4>
          <Input
            {...register("keywords")}
            placeholder="Enter keywords (comma-separated)"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Fields of Interest</h4>
          <Input
            {...register("fields_of_interest")}
            placeholder="Enter fields of interest (comma-separated)"
          />
        </div>
      </div>

      {/* Links Section */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold mb-2">Links</h4>
        <div className="space-y-4">
          <Input
            {...register("linkedin_url")}
            placeholder="LinkedIn URL"
          />
          <Input
            {...register("github_url")}
            placeholder="GitHub URL"
          />
          <Input
            {...register("website_url")}
            placeholder="Website URL"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}