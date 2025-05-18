
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Globe, MapPin, School as SchoolIcon } from "lucide-react";
import { School } from "@/types/database/schools";
import { SchoolMajorsManager } from "./SchoolMajorsManager";
import { useSchoolMajors } from "@/hooks/useAllSchools";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  school: School;
  onEdit: () => void;
}

export function SchoolDetailsDialog({ 
  open, 
  onClose, 
  school,
  onEdit
}: SchoolDetailsDialogProps) {
  const { data: schoolMajors, isLoading: isLoadingMajors } = useSchoolMajors(school.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatAcceptanceRate = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return "Not available";
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl">{school.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">School Details</TabsTrigger>
            <TabsTrigger value="majors">Majors & Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Header with Cover Image */}
            {school.cover_image_url && (
              <div className="relative w-full h-48 overflow-hidden rounded-md mb-6">
                <img 
                  src={school.cover_image_url} 
                  alt={`${school.name} campus`} 
                  className="w-full h-full object-cover"
                />
                
                {school.logo_url && (
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                      <img 
                        src={school.logo_url} 
                        alt={`${school.name} logo`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className={`flex items-center ${school.cover_image_url ? 'pt-6' : ''}`}>
              {!school.cover_image_url && school.logo_url && (
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border border-gray-200">
                  <img 
                    src={school.logo_url} 
                    alt={`${school.name} logo`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <Badge className="mr-2 capitalize">{school.type}</Badge>
                  <Badge variant="outline" className={`${getStatusColor(school.status)} text-white`}>
                    {school.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center text-muted-foreground">
                  {school.location && (
                    <div className="flex items-center mr-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{school.location}, {school.country}</span>
                    </div>
                  )}
                  {school.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={school.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {school.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* School Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Acceptance Rate</h4>
                <p className="text-lg font-semibold">
                  {formatAcceptanceRate(school.acceptance_rate)}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Student Population</h4>
                <p className="text-lg font-semibold">
                  {school.student_population?.toLocaleString() || "Not available"}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Student-Faculty Ratio</h4>
                <p className="text-lg font-semibold">
                  {school.student_faculty_ratio || "Not available"}
                </p>
              </div>
            </div>

            {/* Important Links */}
            <div className="space-y-2 mt-6">
              <h3 className="text-lg font-semibold">Important Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {school.undergraduate_application_url && (
                  <LinkItem 
                    label="Undergraduate Application" 
                    url={school.undergraduate_application_url} 
                  />
                )}
                {school.graduate_application_url && (
                  <LinkItem 
                    label="Graduate Application" 
                    url={school.graduate_application_url} 
                  />
                )}
                {school.admissions_page_url && (
                  <LinkItem 
                    label="Admissions Page" 
                    url={school.admissions_page_url} 
                  />
                )}
                {school.international_students_url && (
                  <LinkItem 
                    label="International Students" 
                    url={school.international_students_url} 
                  />
                )}
                {school.financial_aid_url && (
                  <LinkItem 
                    label="Financial Aid" 
                    url={school.financial_aid_url} 
                  />
                )}
                {school.virtual_tour_url && (
                  <LinkItem 
                    label="Virtual Tour" 
                    url={school.virtual_tour_url} 
                  />
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="majors">
            <SchoolMajorsManager schoolId={school.id} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkItem({ label, url }: { label: string; url: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
    >
      <Globe className="h-5 w-5 mr-2 text-primary" />
      <div className="overflow-hidden">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
        </div>
      </div>
    </a>
  );
}
