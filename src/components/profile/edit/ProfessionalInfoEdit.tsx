import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CompanySelector } from '@/components/profile-details/form-sections/CompanySelector';
import { PositionSelector } from '@/components/profile-details/form-sections/PositionSelector';
import { useProfileManager } from '@/hooks/useProfileManager';
import type { Profile } from '@/types/database/profiles';

interface ProfessionalInfoEditProps {
  profile: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  position: string;
  company_id: string;
  years_of_experience: number;
  skills: string;
  tools_used: string;
  keywords: string;
  fields_of_interest: string;
}

export function ProfessionalInfoEdit({ profile, onCancel, onSuccess }: ProfessionalInfoEditProps) {
  const { updateProfessionalInfo, isUpdating } = useProfileManager(profile);
  
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      position: profile.position || '',
      company_id: profile.company_id || '',
      years_of_experience: profile.years_of_experience || 0,
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      tools_used: Array.isArray(profile.tools_used) ? profile.tools_used.join(', ') : '',
      keywords: Array.isArray(profile.keywords) ? profile.keywords.join(', ') : '',
      fields_of_interest: Array.isArray(profile.fields_of_interest) ? profile.fields_of_interest.join(', ') : '',
    }
  });

  const onSubmit = async (data: FormData) => {
    const result = await updateProfessionalInfo({
      position: data.position.trim() || null,
      company_id: data.company_id || null,
      years_of_experience: Number(data.years_of_experience),
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      tools_used: data.tools_used ? data.tools_used.split(',').map(s => s.trim()).filter(Boolean) : [],
      keywords: data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
      fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(',').map(s => s.trim()).filter(Boolean) : [],
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="position">Position</Label>
        <PositionSelector
          value={watch("position")}
          onValueChange={(value) => setValue("position", value)}
        />
      </div>

      <div>
        <Label htmlFor="company">Company</Label>
        <CompanySelector
          value={watch("company_id")}
          onValueChange={(value) => setValue("company_id", value)}
        />
      </div>

      <div>
        <Label htmlFor="years_of_experience">Years of Experience</Label>
        <Input
          id="years_of_experience"
          {...register("years_of_experience")}
          type="number"
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="skills">Skills</Label>
        <Textarea
          id="skills"
          {...register("skills")}
          placeholder="React, TypeScript, Node.js (comma-separated)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="tools_used">Tools Used</Label>
        <Textarea
          id="tools_used"
          {...register("tools_used")}
          placeholder="VS Code, Docker, AWS (comma-separated)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="keywords">Keywords</Label>
        <Textarea
          id="keywords"
          {...register("keywords")}
          placeholder="Frontend, Backend, Full-stack (comma-separated)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="fields_of_interest">Fields of Interest</Label>
        <Textarea
          id="fields_of_interest"
          {...register("fields_of_interest")}
          placeholder="AI, Web Development, Mobile (comma-separated)"
          rows={2}
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