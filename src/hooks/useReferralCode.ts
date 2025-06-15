
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "./useAuthSession";
import { toast } from "sonner";

export function useReferralCode() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ['referralCode', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      // First try to get existing referral code
      const { data: existingCode, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (existingCode) {
        return existingCode;
      }

      // If no code exists, generate one
      if (error?.code === 'PGRST116') {
        const { data: newCodeData, error: generateError } = await supabase
          .rpc('generate_referral_code', { p_profile_id: session.user.id });

        if (generateError) throw generateError;

        // Insert the new code
        const { data: insertedCode, error: insertError } = await supabase
          .from('referral_codes')
          .insert({
            profile_id: session.user.id,
            referral_code: newCodeData,
            is_active: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return insertedCode;
      }

      throw error;
    },
    enabled: !!session?.user?.id
  });

  const regenerateCode = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      // Deactivate current code
      if (referralCode) {
        await supabase
          .from('referral_codes')
          .update({ is_active: false })
          .eq('id', referralCode.id);
      }

      // Generate new code
      const { data: newCodeData, error: generateError } = await supabase
        .rpc('generate_referral_code', { p_profile_id: session.user.id });

      if (generateError) throw generateError;

      // Insert the new code
      const { data: insertedCode, error: insertError } = await supabase
        .from('referral_codes')
        .insert({
          profile_id: session.user.id,
          referral_code: newCodeData,
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return insertedCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralCode'] });
      toast.success('New referral code generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate new referral code: ' + error.message);
    }
  });

  const getReferralLink = () => {
    if (!referralCode) return '';
    return `${window.location.origin}/?ref=${referralCode.referral_code}`;
  };

  return {
    referralCode,
    isLoading,
    regenerateCode,
    getReferralLink
  };
}
