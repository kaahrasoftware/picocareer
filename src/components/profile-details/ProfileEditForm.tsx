import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { SelectField } from "../profile/editable/fields/SelectField";
import { useQuery } from "@tanstack/react-query";

interface ProfileEditFormProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      bio: profile.bio || "",
      years_of_experience: profile.years_of_experience || 0,
      location: profile.location || "",
      skills: profile.skills?.join(", ") || "",
      tools_used: profile.tools_used?.join(", ") || "",
      keywords: profile.keywords?.join(", ") || "",
      fields_of_interest: profile.fields_of_interest?.join(", ") || "",
      linkedin_url: profile.linkedin_url || "",
      github_url: profile.github_url || "",
      website_url: profile.website_url || "",
      position: profile.position || "",
      company_id: profile.company_id || "",
      school_id: profile.school_id || "",
      academic_major_id: profile.academic_major_id || "",
      highest_degree: profile.highest_degree || "",
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
      {/* Personal Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input {...register("first_name")} />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input {...register("last_name")} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input {...register("location")} placeholder="City, Country" />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Professional Information</h4>
        <div>
          <label className="text-sm font-medium">Current Position</label>
          <SelectField
            fieldName="position"
            value={profile.position || ""}
            onSave={(value) => {
              // Handle position update
            }}
            onCancel={() => {}}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Company</label>
          <SelectField
            fieldName="company_id"
            value={profile.company_id || ""}
            onSave={(value) => {
              // Handle company update
            }}
            onCancel={() => {}}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Years of Experience</label>
          <Input
            type="number"
            {...register("years_of_experience")}
            min="0"
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Education</h4>
        <div>
          <label className="text-sm font-medium">School</label>
          <SelectField
            fieldName="school_id"
            value={profile.school_id || ""}
            onSave={(value) => {
              // Handle school update
            }}
            onCancel={() => {}}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Academic Major</label>
          <SelectField
            fieldName="academic_major_id"
            value={profile.academic_major_id || ""}
            onSave={(value) => {
              // Handle major update
            }}
            onCancel={() => {}}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Highest Degree</label>
          <SelectField
            fieldName="highest_degree"
            value={profile.highest_degree || ""}
            onSave={(value) => {
              // Handle degree update
            }}
            onCancel={() => {}}
          />
        </div>
      </div>

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