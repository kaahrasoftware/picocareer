
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Users, FileText, Link2, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { CardContent, Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Hub() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthSession();
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

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

  // Check if user is a member - now using the user's ID from the session
  const { data: isMember } = useQuery({
    queryKey: ['hub-membership', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user?.id) return false;

      const { data: hubMember } = await supabase
        .from('hub_members')
        .select('status')
        .eq('hub_id', id)
        .eq('profile_id', session.user.id)
        .eq('status', 'Approved')
        .maybeSingle();

      return !!hubMember;
    },
    enabled: !!id && !!session?.user?.id,
  });

  // Fetch hub statistics
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

  if (hubLoading || statsLoading) {
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
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stats */}
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
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social */}
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

            {/* Description */}
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
      </Tabs>
    </div>
  );
}
