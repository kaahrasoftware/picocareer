import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubHeader } from "@/components/hub/HubHeader";
import { HubResources } from "@/components/hub/HubResources";
import { HubAnnouncements } from "@/components/hub/HubAnnouncements";
import { HubMembers } from "@/components/hub/HubMembers";
import { HubDepartments } from "@/components/hub/HubDepartments";
import { HubManagement } from "@/components/hub/management/HubManagement";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin, Users, FileText, Link2, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Hub() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthSession();
  const isValidUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['hub-member-role', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user?.id) return null;
      const { data, error } = await supabase
        .from('hub_members')
        .select('role, status')
        .eq('hub_id', id)
        .eq('profile_id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking hub membership:', error);
        return null;
      }
      return data;
    },
    enabled: !!id && !!session?.user?.id && isValidUUID,
  });

  const isAdmin = memberData?.role === 'admin';
  const isModerator = memberData?.role === 'moderator';
  const isMember = memberData?.status === 'Approved';

  const { data: hub, isLoading: hubLoading } = useQuery({
    queryKey: ['hub', id],
    queryFn: async () => {
      if (!isValidUUID) {
        throw new Error('Invalid hub ID');
      }

      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Hub;
    },
    enabled: !!id && isValidUUID,
  });

  const { data: hubStats, isLoading: statsLoading } = useQuery({
    queryKey: ['hub-stats', id],
    queryFn: async () => {
      if (!id) return null;

      const membersCount = await supabase
        .from('hub_members')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', id)
        .eq('status', 'Approved');

      const resourcesCount = await supabase
        .from('hub_resources')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', id);

      return {
        membersCount: membersCount.count || 0,
        resourcesCount: resourcesCount.count || 0
      };
    },
    enabled: !!id,
  });

  if (!id || !isValidUUID) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Hub ID</h1>
        <p className="text-muted-foreground mb-4">
          The hub ID provided is not valid.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (hubLoading || statsLoading || isMemberLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Hub not found</h1>
        <p className="text-muted-foreground mb-4">
          The hub you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <HubHeader hub={hub} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isMember && (
            <>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
            </>
          )}
          {(isAdmin || isModerator) && (
            <TabsTrigger value="manage">Manage</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{hubStats?.membersCount || 0} Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{hubStats?.resourcesCount || 0} Resources</span>
                  </div>
                  {hub.contact_info?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{hub.contact_info.address}</span>
                    </div>
                  )}
                  {hub.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={hub.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {hub.website}
                      </a>
                    </div>
                  )}
                  {hub.apply_now_URL && (
                    <div className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={hub.apply_now_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Apply Now
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {hub.contact_info?.email && (
                    <div className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`mailto:${hub.contact_info.email}`}
                        className="text-primary hover:underline"
                      >
                        {hub.contact_info.email}
                      </a>
                    </div>
                  )}
                  {hub.social_links && (
                    <div className="flex gap-4">
                      {hub.social_links.twitter && (
                        <a 
                          href={hub.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {hub.social_links.facebook && (
                        <a 
                          href={hub.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {hub.social_links.linkedin && (
                        <a 
                          href={hub.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {hub.social_links.instagram && (
                        <a 
                          href={hub.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {hub.important_links && hub.important_links.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Important Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {hub.important_links.map((link: { title: string; url: string }, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{link.title}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {hub.description && (
              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {hub.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {!isMember && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Join this hub to access announcements, resources, members list, and departments.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {isMember && (
          <>
            <TabsContent value="announcements" className="mt-6">
              <HubAnnouncements hubId={hub.id} />
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <HubResources hubId={hub.id} />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <HubMembers hubId={hub.id} />
            </TabsContent>

            <TabsContent value="departments" className="mt-6">
              <HubDepartments hubId={hub.id} />
            </TabsContent>
          </>
        )}

        {(isAdmin || isModerator) && (
          <TabsContent value="manage" className="mt-6">
            <HubManagement hub={hub} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
