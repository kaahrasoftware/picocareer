
import React, { useState } from 'react';
import { ProfileView } from '@/components/profile-details/ProfileView';
import { PersonalInfoEdit } from '@/components/profile/edit/PersonalInfoEdit';
import { ProfessionalInfoEdit } from '@/components/profile/edit/ProfessionalInfoEdit';
import { SocialLinksEdit } from '@/components/profile/edit/SocialLinksEdit';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, X } from 'lucide-react';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile;
}

type EditSection = 'personal' | 'professional' | 'social' | null;

export function ProfileTab({ profile }: ProfileTabProps) {
  const [editSection, setEditSection] = useState<EditSection>(null);

  const handleEdit = (section: EditSection) => {
    setEditSection(section);
  };

  const handleCancel = () => {
    setEditSection(null);
  };

  const handleSuccess = () => {
    setEditSection(null);
  };

  if (editSection) {
    const getSectionTitle = () => {
      switch (editSection) {
        case 'personal': return 'Edit Personal Information';
        case 'professional': return 'Edit Professional Information';
        case 'social': return 'Edit Social Links';
        default: return 'Edit Profile';
      }
    };

    const renderEditForm = () => {
      switch (editSection) {
        case 'personal':
          return <PersonalInfoEdit profile={profile} onCancel={handleCancel} onSuccess={handleSuccess} />;
        case 'professional':
          return <ProfessionalInfoEdit profile={profile} onCancel={handleCancel} onSuccess={handleSuccess} />;
        case 'social':
          return <SocialLinksEdit profile={profile} onCancel={handleCancel} onSuccess={handleSuccess} />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{getSectionTitle()}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
        {renderEditForm()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Profile Details</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('personal')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            Edit Personal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('professional')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            Edit Professional
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('social')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            Edit Social
          </Button>
        </div>
      </div>
      <ProfileView profile={profile} />
    </div>
  );
}
