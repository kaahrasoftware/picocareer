
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, Plus, Users, Star, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { useMentorStats } from "./mentor/hooks/useMentorStats";

export function MentorTab() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const profileId = profile?.id;
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { stats, sessionTypes, refetchSessions, refetchSessionTypes } = useMentorStats(profileId);

  const handleRefresh = () => {
    refetchSessions();
    refetchSessionTypes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Mentor Dashboard</h3>
          <p className="text-muted-foreground">Manage your mentoring sessions and track your impact</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="session-types">Session Types</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_sessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.completed_sessions || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completion_rate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Session completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.average_rating || 0}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats?.total_ratings || 0} ratings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_hours || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Mentoring time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Your recent sessions and updates will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session-types" className="space-y-6">
          {profileId && (
            <SessionTypeManager 
              profileId={profileId} 
              sessionTypes={sessionTypes || []}
              onUpdate={handleRefresh}
            />
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Set your availability</p>
                <p className="text-sm">Configure when you're available for mentoring sessions</p>
                <Button className="mt-4" variant="outline">
                  Set Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Notification Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure how you want to receive notifications about sessions
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Session Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    Set when you want to be reminded about upcoming sessions
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Auto-accept Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically accept session requests within your availability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
