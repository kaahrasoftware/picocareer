import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfileManager } from '@/hooks/useProfileManager';
import type { Profile } from '@/types/database/profiles';

interface PersonalInfoEditProps {
  profile: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
}

export function PersonalInfoEdit({ profile, onCancel, onSuccess }: PersonalInfoEditProps) {
  const { updatePersonalInfo, isUpdating } = useProfileManager(profile);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
    }
  });

  const onSubmit = async (data: FormData) => {
    const result = await updatePersonalInfo({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      bio: data.bio.trim(),
      location: data.location.trim(),
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register('first_name', { required: 'First name is required' })}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register('last_name', { required: 'Last name is required' })}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Tell us about yourself..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="City, Country"
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