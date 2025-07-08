import { useState, useEffect } from 'react';
import { useAuthSession } from './useAuthSession';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizationAuth() {
  const { user, session } = useAuthSession();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrganization() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First, check if user has an organization associated
        const { data: orgData, error } = await supabase
          .from('api_organizations')
          .select('*')
          .eq('contact_email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading organization:', error);
          setLoading(false);
          return;
        }

        // If no organization exists, create one from user metadata
        if (!orgData) {
          const organizationName = user.user_metadata?.organization_name || 'My Organization';
          const contactName = user.user_metadata?.contact_name || user.email;

          const { data: newOrg, error: createError } = await supabase
            .from('api_organizations')
            .insert({
              name: organizationName,
              contact_email: user.email,
              contact_name: contactName,
              status: 'Pending',
              subscription_tier: 'free'
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating organization:', createError);
            setLoading(false);
            return;
          }

          setOrganization(newOrg);
        } else {
          setOrganization(orgData);
        }
      } catch (error) {
        console.error('Error in organization auth:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [user]);

  return {
    organization,
    loading,
    user,
    session
  };
}