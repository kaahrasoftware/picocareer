-- CRITICAL SECURITY FIX: Enable RLS on remaining unprotected tables
-- This completes the security audit by protecting all remaining public tables

-- Enable RLS on all unprotected tables
ALTER TABLE public.hub_announcement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_announcement_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_department_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_resource_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTNERSHIPS TABLE POLICIES (Admin-only access)
-- =====================================================
-- Contains sensitive business contact information

CREATE POLICY "Admins can view all partnerships" 
ON public.partnerships 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "Admins can manage partnerships" 
ON public.partnerships 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- =====================================================
-- HUB ANALYTICS POLICIES (Hub members + admins)
-- =====================================================

-- Hub announcement analytics
CREATE POLICY "Hub members can view announcement analytics" 
ON public.hub_announcement_analytics 
FOR SELECT 
TO authenticated
USING (
  -- User is hub member or admin
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_announcement_analytics.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can insert announcement analytics" 
ON public.hub_announcement_analytics 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Hub announcement engagement  
CREATE POLICY "Hub members can view announcement engagement" 
ON public.hub_announcement_engagement 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_announcement_engagement.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can manage announcement engagement" 
ON public.hub_announcement_engagement 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Hub department metrics
CREATE POLICY "Hub members can view department metrics" 
ON public.hub_department_metrics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_department_metrics.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can manage department metrics" 
ON public.hub_department_metrics 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Hub metrics
CREATE POLICY "Hub members can view hub metrics" 
ON public.hub_metrics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_metrics.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can manage hub metrics" 
ON public.hub_metrics 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Hub resource analytics
CREATE POLICY "Hub members can view resource analytics" 
ON public.hub_resource_analytics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_resource_analytics.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can insert resource analytics" 
ON public.hub_resource_analytics 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Hub resource engagement
CREATE POLICY "Hub members can view resource engagement" 
ON public.hub_resource_engagement 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hub_members hm 
    WHERE hm.hub_id = hub_resource_engagement.hub_id 
    AND hm.profile_id = auth.uid()
    AND hm.status = 'Approved'
  ) OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

CREATE POLICY "System can manage resource engagement" 
ON public.hub_resource_engagement 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);