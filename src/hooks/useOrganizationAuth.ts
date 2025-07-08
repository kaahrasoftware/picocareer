import { useState, useEffect } from 'react';
import { useAuthSession } from './useAuthSession';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizationAuth() {
  const { user, session } = useAuthSession();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganization() {
      if (!user) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setError(null);
        
        // First, check if user has an organization associated
        const { data: orgData, error } = await supabase
          .from('api_organizations')
          .select('*')
          .eq('contact_email', user.email)
          .maybeSingle();

        if (error) {
          console.error('Error loading organization:', error);
          setError('Failed to load organization data');
          setLoading(false);
          return;
        }

        // Organization should be created automatically via trigger during signup
        // If it doesn't exist, show helpful error
        if (!orgData) {
          setError('Organization not found. Please contact support if this continues.');
          setLoading(false);
          return;
        }

        setOrganization(orgData);
      } catch (error) {
        console.error('Error in organization auth:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [user]);

  return {
    organization,
    loading,
    error,
    user,
    session
  };
}