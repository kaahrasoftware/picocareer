
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Briefcase, School } from "lucide-react";
import { SchoolsManagementTab } from "./schools/SchoolsManagementTab";
import { MajorsManagementTab } from "./majors/MajorsManagementTab";
import { CareersManagementTab } from "./careers/CareersManagementTab";

export function AcademicResourcesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Academic Resources</h2>
      </div>
      
      <Tabs defaultValue="majors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="majors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Majors
          </TabsTrigger>
          <TabsTrigger value="careers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Careers
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Schools
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="majors">
          <MajorsManagementTab />
        </TabsContent>
        
        <TabsContent value="careers">
          <CareersManagementTab />
        </TabsContent>
        
        <TabsContent value="schools">
          <SchoolsManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
