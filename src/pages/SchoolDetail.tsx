
import { useParams } from "react-router-dom";
import { useSchoolById } from "@/hooks/useAllSchools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { SchoolMajorsList } from "@/components/schools/SchoolMajorsList";
import { SchoolDetailHeader } from "@/components/schools/SchoolDetailHeader";
import { SchoolOverviewTab } from "@/components/schools/SchoolOverviewTab";
import { SchoolTuitionTab } from "@/components/schools/SchoolTuitionTab";
import { SchoolDetailSkeleton } from "@/components/schools/SchoolDetailSkeleton";
import { SchoolDetailErrorState } from "@/components/schools/SchoolDetailErrorState";
import type { School } from "@/types/database/schools";

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: schoolRaw, isLoading: isSchoolLoading, error } = useSchoolById(id);

  if (isSchoolLoading) {
    return <SchoolDetailSkeleton />;
  }

  if (error || !schoolRaw) {
    return <SchoolDetailErrorState />;
  }

  // Transform the school data to match our School type
  const school: School = {
    ...schoolRaw,
    author_id: (schoolRaw as any).author_id || undefined, // Handle missing author_id gracefully with type assertion
    type: schoolRaw.type as School['type']
  };

  return (
    <div className="container mx-auto py-8">
      <SchoolDetailHeader school={school} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="mt-12">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs & Majors</TabsTrigger>
          <TabsTrigger value="tuition">Tuition & Financial Aid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <SchoolOverviewTab school={school} />
        </TabsContent>
        
        <TabsContent value="programs" className="space-y-8">
          {id && <SchoolMajorsList schoolId={id} school={school} />}
        </TabsContent>
        
        <TabsContent value="tuition" className="space-y-8">
          <SchoolTuitionTab school={school} />
        </TabsContent>
      </Tabs>
      
      <GoToTopButton />
    </div>
  );
}
