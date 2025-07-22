
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  currentBalance: number;
  walletId?: string;
}

export function useUserSearch(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async (): Promise<UserSearchResult[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      // Search for users by email, first name, or last name
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          full_name,
          user_type,
          wallets (
            id,
            balance
          )
        `)
        .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (profilesError) throw profilesError;

      return profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        fullName: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        userType: profile.user_type || 'mentee',
        currentBalance: profile.wallets?.[0]?.balance || 0,
        walletId: profile.wallets?.[0]?.id
      })) || [];
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 30000,
  });
}
