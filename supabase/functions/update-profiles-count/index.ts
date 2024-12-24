import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  try {
    // Update profiles count for all careers
    await supabase.rpc('update_careers_profiles_count')
    
    return new Response(
      JSON.stringify({ message: 'Profiles count updated successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating profiles count:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update profiles count' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})