
import { useState, useCallback } from 'react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export function useEmailCampaignFormState() {
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addProfile = useCallback((profile: Profile) => {
    setSelectedProfiles(prev => {
      const exists = prev.some(p => p.id === profile.id);
      if (exists) return prev;
      return [...prev, profile];
    });
  }, []);

  const removeProfile = useCallback((profileId: string) => {
    setSelectedProfiles(prev => prev.filter(p => p.id !== profileId));
  }, []);

  const clearProfiles = useCallback(() => {
    setSelectedProfiles([]);
  }, []);

  const getSelectedProfilesFormatted = useCallback(() => {
    return selectedProfiles.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email
    }));
  }, [selectedProfiles]);

  return {
    selectedProfiles,
    isLoading,
    setIsLoading,
    addProfile,
    removeProfile,
    clearProfiles,
    getSelectedProfilesFormatted
  };
}
