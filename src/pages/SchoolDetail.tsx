import { useParams, Link } from "react-router-dom";
import { useSchoolById } from "@/hooks/useAllSchools";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
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
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { AcademicRequirements } from "@/components/major-details/AcademicRequirements";
import { SchoolMajorsList } from "@/components/schools/SchoolMajorsList";

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: school, isLoading: isSchoolLoading, error } = useSchoolById(id);

  if (isSchoolLoading) {
    return (
      <div className="container mx-auto py-12 space-y-8">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="pt-16">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <div className="flex gap-2 mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center py-16 space-y-4">
          <School className="h-16 w-16 mx-auto text-muted-foreground/60" />
          <h2 className="text-2xl font-bold">School not found</h2>
          <p className="text-muted-foreground">
            We couldn't find the school you're looking for.
          </p>
          <Button asChild>
            <Link to="/school">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schools
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/school" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Link>
        </Button>
      </div>

      {/* School Header */}
      <div className="relative mb-16">
        {school.cover_image_url ? (
          <div className="w-full h-64 overflow-hidden rounded-lg">
            <AspectRatio ratio={16/6}>
              <img
                src={school.cover_image_url}
                alt={school.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg" />
        )}
        
        <div className="absolute -bottom-12 left-8 flex items-end">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background bg-background flex items-center justify-center shadow-md">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={`${school.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <School className="h-12 w-12 text-primary/60" />
            )}
          </div>
          <div className="bg-background py-2 px-4 rounded-tr-lg rounded-br-lg shadow-sm">
            <h1 className="text-2xl font-bold">{school.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="mt-12">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs & Majors</TabsTrigger>
          <TabsTrigger value="tuition">Tuition & Financial Aid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* School Information */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">About {school.name}</h2>
                
                <div className="flex flex-wrap gap-2 my-4">
                  {school.type && (
                    <Badge variant="outline" className="capitalize">
                      {school.type}
                    </Badge>
                  )}
                  
                  {school.country && (
                    <Badge variant="outline">
                      {school.country}
                    </Badge>
                  )}
                  
                  {school.acceptance_rate !== null && (
                    <Badge variant="outline">
                      {Math.round((school.acceptance_rate || 0) * 100)}% Acceptance Rate
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {school.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{school.location}</span>
                      </div>
                    )}
                    
                    {school.website && (
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
                    
                    {school.ranking && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Ranking: {school.ranking}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {school.student_population && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{school.student_population.toLocaleString()} Students</span>
                      </div>
                    )}
                    
                    {school.student_faculty_ratio && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{school.student_faculty_ratio} Student-Faculty Ratio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Links */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Application Resources</h2>
                <div className="flex flex-wrap gap-3">
                  {renderExternalLink(
                    school.undergraduate_application_url,
                    "Undergraduate Application",
                    <BookOpen className="h-4 w-4" />
                  )}
                  
                  {renderExternalLink(
                    school.graduate_application_url,
                    "Graduate Application",
                    <GraduationCap className="h-4 w-4" />
                  )}
                  
                  {renderExternalLink(
                    school.admissions_page_url,
                    "Admissions Page",
                    <Building className="h-4 w-4" />
                  )}
                  
                  {renderExternalLink(
                    school.virtual_tour_url,
                    "Virtual Tour",
                    <Briefcase className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                <dl className="space-y-3">
                  {school.acceptance_rate !== null && (
                    <div className="grid grid-cols-2 gap-1">
                      <dt className="text-sm text-muted-foreground">Acceptance Rate:</dt>
                      <dd className="text-sm font-medium">{(school.acceptance_rate * 100).toFixed(1)}%</dd>
                    </div>
                  )}
                  
                  {school.student_population && (
                    <div className="grid grid-cols-2 gap-1">
                      <dt className="text-sm text-muted-foreground">Student Population:</dt>
                      <dd className="text-sm font-medium">{school.student_population.toLocaleString()}</dd>
                    </div>
                  )}
                  
                  {school.student_faculty_ratio && (
                    <div className="grid grid-cols-2 gap-1">
                      <dt className="text-sm text-muted-foreground">Student-Faculty Ratio:</dt>
                      <dd className="text-sm font-medium">{school.student_faculty_ratio}</dd>
                    </div>
                  )}
                  
                  {school.ranking && (
                    <div className="grid grid-cols-2 gap-1">
                      <dt className="text-sm text-muted-foreground">Ranking:</dt>
                      <dd className="text-sm font-medium">{school.ranking}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Financial Aid Card */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Financial Resources</h2>
                <div className="space-y-3">
                  {renderExternalLink(
                    school.financial_aid_url,
                    "Financial Aid",
                    <DollarSign className="h-4 w-4" />
                  )}
                  
                  {renderExternalLink(
                    school.international_students_url,
                    "International Students",
                    <Globe className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="programs" className="space-y-8">
          {id && <SchoolMajorsList schoolId={id} />}
        </TabsContent>
        
        <TabsContent value="tuition" className="space-y-8">
          {school.tuition_fees && Object.keys(school.tuition_fees).length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Tuition & Fees Information</h2>
              
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-6 py-3 text-left font-medium">Program</th>
                        <th className="px-6 py-3 text-left font-medium">Tuition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(school.tuition_fees as Record<string, string>).map(([program, fee]) => (
                        <tr key={program} className="border-t hover:bg-muted/20">
                          <td className="px-6 py-4 capitalize">{program.replace(/_/g, ' ')}</td>
                          <td className="px-6 py-4">{fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Resources</h3>
                <div className="space-y-3">
                  {renderExternalLink(
                    school.financial_aid_url,
                    "Financial Aid Information",
                    <DollarSign className="h-4 w-4" />
                  )}
                  
                  {renderExternalLink(
                    school.international_students_url,
                    "International Student Aid",
                    <Globe className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium">No tuition information available</h3>
              <p className="text-muted-foreground">This institution hasn't provided detailed tuition information yet.</p>
              
              {school.financial_aid_url && (
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <a href={school.financial_aid_url} target="_blank" rel="noopener noreferrer">
                      Visit Financial Aid Website <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <GoToTopButton />
    </div>
  );
}
