import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import type { Profile } from "@/types/database/profiles";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [canAccessMentorTab, setCanAccessMentorTab] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your profile",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }

      const { data: userTypeData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      // Set admin status based on user_type
      setIsAdmin(userTypeData?.user_type === 'admin');
      // Set mentor tab access for mentors, editors, and admins
      setCanAccessMentorTab(['mentor', 'editor', 'admin'].includes(userTypeData?.user_type || ''));

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title),
          career:careers!profiles_position_fkey(title, id)
        `)
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No profile data found');

      return {
        ...data,
        company_name: data.company?.name ?? null,
        school_name: data.school?.name ?? null,
        academic_major: data.academic_major?.title ?? null,
        career_title: data.career?.title ?? null,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        email: data.email || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        school_id: data.school_id || null,
        company_id: data.company_id || null,
        academic_major_id: data.academic_major_id || null,
        user_type: data.user_type || 'mentee',
        highest_degree: data.highest_degree || null,
        top_mentor: data.top_mentor || false
      };
    },
    retry: false
  });

  // If not authorized and trying to access restricted tabs, switch to profile
  useEffect(() => {
    if ((!isAdmin && activeTab === 'dashboard') || (!canAccessMentorTab && activeTab === 'mentor')) {
      setActiveTab('profile');
    }
  }, [isAdmin, canAccessMentorTab, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="bg-background/60 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
              <ProfileHeader profile={profile} />
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  {isAdmin && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  {canAccessMentorTab && <TabsTrigger value="mentor">Mentor</TabsTrigger>}
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  {profile && <ProfileTab profile={profile} />}
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="dashboard">
                    <DashboardTab />
                  </TabsContent>
                )}

                <TabsContent value="calendar">
                  <CalendarTab />
                </TabsContent>

                {canAccessMentorTab && (
                  <TabsContent value="mentor">
                    <MentorTab profile={profile} />
                  </TabsContent>
                )}

                <TabsContent value="settings">
                  <SettingsTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}