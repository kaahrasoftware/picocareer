import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import type { Profile } from "@/types/database/profiles";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }

      // First, get the user type
      const { data: userTypeData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      const isMentee = userTypeData?.user_type === 'mentee';

      // Define base fields that both types share
      const baseQuery = `
        id,
        avatar_url,
        first_name,
        last_name,
        bio,
        linkedin_url,
        github_url,
        website_url,
        location,
        fields_of_interest,
        user_type,
        company:company_id (name),
        school:school_id (name),
        academic_major:academic_major_id (title)
      `;

      // Additional fields for mentors
      const mentorFields = `
        highest_degree,
        position,
        years_of_experience,
        keywords,
        skills,
        tools_used,
        top_mentor
      `;

      // Select fields based on user type
      const { data, error } = await supabase
        .from('profiles')
        .select(isMentee ? baseQuery : `${baseQuery}, ${mentorFields}`)
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No profile data found');

      // Transform the data to match our Profile type
      const transformedProfile: Profile = {
        ...data,
        company_name: data.company?.name ?? null,
        school_name: data.school?.name ?? null,
        academic_major: data.academic_major?.title ?? null,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null
      };

      return transformedProfile;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-background/60 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
        <ProfileHeader profile={profile} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}