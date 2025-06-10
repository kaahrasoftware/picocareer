
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateDefaultAvatar } from '@/utils/avatarGenerator';

export function useDefaultAvatar(userId: string | undefined, currentAvatarUrl: string | null) {
  useEffect(() => {
    async function ensureDefaultAvatar() {
      if (!userId || currentAvatarUrl) return;

      try {
        // Check if user already has an avatar_type set
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_type, avatar_url')
          .eq('id', userId)
          .single();

        // If no avatar and no avatar_type, set default
        if (profile && !profile.avatar_url && !profile.avatar_type) {
          const defaultAvatarUrl = generateDefaultAvatar(userId);
          
          await supabase
            .from('profiles')
            .update({ 
              avatar_url: defaultAvatarUrl,
              avatar_type: 'default'
            })
            .eq('id', userId);
        }
      } catch (error) {
        console.error('Error setting default avatar:', error);
      }
    }

    ensureDefaultAvatar();
  }, [userId, currentAvatarUrl]);
}
