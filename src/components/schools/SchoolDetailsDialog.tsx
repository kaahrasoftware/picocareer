
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  MapPin, 
  Globe, 
  Building, 
  Briefcase,
  School,
  BookOpen,
  DollarSign,
  Users,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SchoolMajorsList } from "./SchoolMajorsList";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { School } from "@/types/database/schools";

interface SchoolDetailsDialogProps {
  schoolId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolDetailsDialog({ 
  schoolId, 
  open, 
  onOpenChange 
}: SchoolDetailsDialogProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open && schoolId) {
      fetchSchoolDetails();
    }
  }, [open, schoolId]);

  const fetchSchoolDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (error) throw error;
      setSchool(data);
    } catch (error) {
      console.error('Error fetching school details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load school details. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderExternalLink = (url: string | null, label: string, icon: React.ReactNode) => {
    if (!url) return null;
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        asChild
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          {icon}
          <span>{label}</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </Button>
    );
  };

  const renderHeader = () => (
    <div className="relative">
      {school?.cover_image_url ? (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img
            src={school.cover_image_url}
            alt={school?.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-24 bg-gradient-to-r from-primary/30 to-primary/10" />
      )}
      
      <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 px-6 flex">
        <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background bg-background flex items-center justify-center">
          {school?.logo_url ? (
            <img
              src={school.logo_url}
              alt={`${school?.name} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            <School className="h-12 w-12 text-primary/60" />
          )}
        </div>
      </div>
    </div>
  );

  const renderSchoolInfo = () => (
    <>
      <div className="pt-16 px-6">
        <h2 className="text-2xl font-bold">{school?.name}</h2>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {school?.type && (
            <Badge variant="outline" className="capitalize">
              {school.type}
            </Badge>
          )}
          
          {school?.country && (
            <Badge variant="outline">
              {school.country}
            </Badge>
          )}
          
          {school?.acceptance_rate !== null && (
            <Badge variant="outline">
              {Math.round((school.acceptance_rate || 0) * 100)}% Acceptance Rate
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            {school?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{school.location}</span>
              </div>
            )}
            
            {school?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={school.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {school.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              </div>
            )}
            
            {school?.ranking && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Ranking: {school.ranking}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {school?.student_population && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{school.student_population.toLocaleString()} Students</span>
              </div>
            )}
            
            {school?.student_faculty_ratio && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{school.student_faculty_ratio} Student-Faculty Ratio</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3">Apply</h3>
        <div className="flex flex-wrap gap-2">
          {renderExternalLink(
            school?.undergraduate_application_url,
            "Undergraduate Application",
            <BookOpen className="h-4 w-4" />
          )}
          
          {renderExternalLink(
            school?.graduate_application_url,
            "Graduate Application",
            <GraduationCap className="h-4 w-4" />
          )}
          
          {renderExternalLink(
            school?.admissions_page_url,
            "Admissions Page",
            <Building className="h-4 w-4" />
          )}
          
          {renderExternalLink(
            school?.financial_aid_url,
            "Financial Aid",
            <DollarSign className="h-4 w-4" />
          )}
          
          {renderExternalLink(
            school?.international_students_url,
            "International Students",
            <Globe className="h-4 w-4" />
          )}
          
          {renderExternalLink(
            school?.virtual_tour_url,
            "Virtual Tour",
            <Briefcase className="h-4 w-4" />
          )}
        </div>
      </div>
    </>
  );

  const renderTuitionInfo = () => {
    if (!school?.tuition_fees || Object.keys(school.tuition_fees).length === 0) {
      return (
        <div className="p-6">
          <p className="text-muted-foreground">No tuition information available.</p>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Program</th>
                <th className="px-4 py-2 text-left font-medium">Tuition</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(school.tuition_fees as Record<string, string>).map(([program, fee]) => (
                <tr key={program} className="border-t">
                  <td className="px-4 py-2 capitalize">{program.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2">{fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : (
          <>
            {renderHeader()}
            
            <Tabs defaultValue="overview" className="mt-12">
              <div className="px-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="programs">Programs</TabsTrigger>
                  <TabsTrigger value="tuition">Tuition</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview">
                {renderSchoolInfo()}
              </TabsContent>
              
              <TabsContent value="programs">
                <div className="p-6">
                  <SchoolMajorsList schoolId={schoolId} />
                </div>
              </TabsContent>
              
              <TabsContent value="tuition">
                {renderTuitionInfo()}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
