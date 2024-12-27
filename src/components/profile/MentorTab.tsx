import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MentorEditForm } from "./mentor/MentorEditForm";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Settings } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface MentorTabProps {
  profile: Profile | null;
}

export function MentorTab({ profile }: MentorTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mentorData, isLoading } = useQuery({
    queryKey: ['mentor-details', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const [sessionTypesResponse, specializationsResponse, sessionsResponse] = await Promise.all([
        supabase
          .from('mentor_session_types')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('mentor_specializations')
          .select(`
            *,
            career:careers(id, title),
            major:majors(id, title)
          `)
          .eq('profile_id', profile.id),
        supabase
          .from('mentor_sessions')
          .select('*')
          .eq('mentor_id', profile.id)
      ]);

      if (sessionTypesResponse.error) throw sessionTypesResponse.error;
      if (specializationsResponse.error) throw specializationsResponse.error;
      if (sessionsResponse.error) throw sessionsResponse.error;

      const sessions = sessionsResponse.data;
      const total_sessions = sessions.length;
      const now = new Date();
      const completed_sessions = sessions.filter(s => new Date(s.scheduled_at) < now).length;
      const upcoming_sessions = sessions.filter(s => new Date(s.scheduled_at) >= now).length;
      
      const total_hours = sessions.reduce((acc, session) => {
        const sessionType = sessionTypesResponse.data.find(st => st.id === session.session_type_id);
        return acc + (sessionType ? sessionType.duration / 60 : 0);
      }, 0);

      const session_data = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const monthSessions = sessions.filter(s => {
          const sessionDate = new Date(s.scheduled_at);
          return sessionDate.getMonth() === date.getMonth() && 
                 sessionDate.getFullYear() === date.getFullYear();
        }).length;
        return {
          name: monthName,
          sessions: monthSessions
        };
      }).reverse();

      return {
        sessionTypes: sessionTypesResponse.data,
        specializations: specializationsResponse.data.map(spec => ({
          career: spec.career ? { id: spec.career.id, title: spec.career.title } : null,
          major: spec.major ? { id: spec.major.id, title: spec.major.title } : null,
          years_of_experience: spec.years_of_experience
        })),
        stats: {
          total_sessions,
          completed_sessions,
          upcoming_sessions,
          total_hours,
          session_data
        }
      };
    },
    enabled: !!profile?.id
  });

  const handleUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['mentor-details', profile?.id] });
    toast({
      title: "Success",
      description: "Settings updated successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  const canAccessMentorTab = ['mentor', 'editor', 'admin'].includes(profile.user_type || '');

  if (!canAccessMentorTab) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          You need to be registered as a mentor, editor, or admin to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <MentorEditForm
          profile={profile}
          mentorData={mentorData}
          setIsEditing={setIsEditing}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mentor Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="availability" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  Availability
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Clock className="h-4 w-4" />
                  Contents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {mentorData?.stats && <MentorshipStats stats={mentorData.stats} />}
                </div>
              </TabsContent>

              <TabsContent value="availability" className="mt-0">
                <AvailabilityManager 
                  profileId={profile.id} 
                  onUpdate={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="sessions" className="mt-0">
                <SessionTypeManager
                  profileId={profile.id}
                  sessionTypes={mentorData?.sessionTypes || []}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}