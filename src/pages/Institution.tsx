
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstitutionHeader } from "@/components/institution/InstitutionHeader";
import { InstitutionResources } from "@/components/institution/InstitutionResources";
import { InstitutionAnnouncements } from "@/components/institution/InstitutionAnnouncements";
import { InstitutionMembers } from "@/components/institution/InstitutionMembers";
import { InstitutionDepartments } from "@/components/institution/InstitutionDepartments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Institution() {
  const { id } = useParams<{ id: string }>();

  const { data: institution, isLoading } = useQuery({
    queryKey: ['institution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Institution;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Institution not found</h1>
        <p className="text-muted-foreground mb-4">
          The institution you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <InstitutionHeader institution={institution} />
      
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <InstitutionAnnouncements institutionId={institution.id} />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <InstitutionResources institutionId={institution.id} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <InstitutionMembers institutionId={institution.id} />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <InstitutionDepartments institutionId={institution.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
