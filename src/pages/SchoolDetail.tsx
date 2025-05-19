
import { useParams, Link } from "react-router-dom";
import { useSchoolById } from "@/hooks/useAllSchools";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { ColorfulStatCard } from "@/components/ui/colorful-stat-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
  ArrowLeft,
  Award,
  Percent,
  BarChart,
  BookOpen as BookOpenIcon,
  Wallet
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

  const renderExternalLink = (url: string | null, label: string, icon: React.ReactNode, variant: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" = "outline", colorClass?: string) => {
    if (!url) return null;
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant, size: "sm" }),
          "gap-2 whitespace-nowrap transition-all hover:shadow-md",
          colorClass
        )}
      >
        {icon}
        <span>{label}</span>
        <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
      </a>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="hover:bg-primary/10"
        >
          <Link to="/school" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Link>
        </Button>
      </div>

      {/* School Header */}
      <div className="relative mb-16">
        {school.cover_image_url ? (
          <div className="w-full h-64 overflow-hidden rounded-lg shadow-md">
            <AspectRatio ratio={16/6}>
              <img
                src={school.cover_image_url}
                alt={school.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg shadow-md" />
        )}
        
        <div className="absolute -bottom-12 left-8 flex items-end">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background bg-background flex items-center justify-center shadow-lg">
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
          <div className="bg-background py-2 px-4 rounded-tr-lg rounded-br-lg shadow-md">
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
              <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm bg-card/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold">About {school.name}</h2>
                
                <div className="flex flex-wrap gap-2 my-4">
                  {school.type && (
                    <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/60">
                      {school.type}
                    </Badge>
                  )}
                  
                  {school.country && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/60">
                      {school.country}
                    </Badge>
                  )}
                  
                  {school.acceptance_rate !== null && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-900/60">
                      {Math.round((school.acceptance_rate || 0) * 100)}% Acceptance Rate
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {school.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        <span>{school.location}</span>
                      </div>
                    )}
                    
                    {school.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
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
                        <Award className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        <span>Ranking: {school.ranking}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {school.student_population && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                        <span>{school.student_population.toLocaleString()} Students</span>
                      </div>
                    )}
                    
                    {school.student_faculty_ratio && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span>{school.student_faculty_ratio} Student-Faculty Ratio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Links */}
              <div className="bg-card border rounded-lg p-6 shadow-sm bg-card/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Application Resources</h2>
                <div className="flex flex-wrap gap-3">
                  {renderExternalLink(
                    school.undergraduate_application_url,
                    "Undergraduate Application",
                    <BookOpenIcon className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none"
                  )}
                  
                  {renderExternalLink(
                    school.graduate_application_url,
                    "Graduate Application",
                    <GraduationCap className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none"
                  )}
                  
                  {renderExternalLink(
                    school.admissions_page_url,
                    "Admissions Page",
                    <Building className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-none"
                  )}
                  
                  {renderExternalLink(
                    school.virtual_tour_url,
                    "Virtual Tour",
                    <Briefcase className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none"
                  )}
                  
                  {renderExternalLink(
                    school.international_students_url,
                    "International Students",
                    <Globe className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-none"
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="space-y-6">
              {/* Colorful Stat Cards */}
              <div className="grid grid-cols-1 gap-4">
                {school.acceptance_rate !== null && (
                  <ColorfulStatCard 
                    title="Acceptance Rate"
                    value={`${(school.acceptance_rate * 100).toFixed(1)}%`}
                    icon={<Percent className="h-4 w-4" />}
                    variant="purple"
                    showProgress
                    progressValue={school.acceptance_rate * 100}
                  />
                )}
                
                {school.student_population && (
                  <ColorfulStatCard 
                    title="Student Population"
                    value={school.student_population}
                    icon={<Users className="h-4 w-4" />}
                    variant="blue"
                    footer="Total Enrolled Students"
                  />
                )}
                
                {school.student_faculty_ratio && (
                  <ColorfulStatCard 
                    title="Student-Faculty Ratio"
                    value={school.student_faculty_ratio}
                    icon={<GraduationCap className="h-4 w-4" />}
                    variant="green"
                    footer="Students per Faculty Member"
                  />
                )}
                
                {school.ranking && (
                  <ColorfulStatCard 
                    title="Ranking"
                    value={school.ranking}
                    icon={<Award className="h-4 w-4" />}
                    variant="amber"
                    footer="National University Ranking"
                  />
                )}
              </div>

              {/* Financial Aid Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> 
                  Financial Resources
                </h2>
                <div className="space-y-3">
                  {renderExternalLink(
                    school.financial_aid_url,
                    "Financial Aid",
                    <Wallet className="h-4 w-4" />,
                    "outline",
                    "border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
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
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-500" />
                Tuition & Fees Information
              </h2>
              
              <div className="bg-gradient-to-br from-green-50/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/40 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-100/80 dark:bg-green-900/50">
                        <th className="px-6 py-3 text-left font-medium text-green-800 dark:text-green-300">Program</th>
                        <th className="px-6 py-3 text-left font-medium text-green-800 dark:text-green-300">Tuition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(school.tuition_fees as Record<string, string>).map(([program, fee], index) => (
                        <tr 
                          key={program} 
                          className={cn(
                            "border-t border-green-200/70 dark:border-green-800/30 hover:bg-green-100/50 dark:hover:bg-green-900/30",
                            index % 2 === 0 ? "bg-green-50/50 dark:bg-green-900/20" : "bg-transparent"
                          )}
                        >
                          <td className="px-6 py-4 capitalize">{program.replace(/_/g, ' ')}</td>
                          <td className="px-6 py-4 font-medium text-green-800 dark:text-green-300">{fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100/80 dark:from-cyan-900/40 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800/40 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Financial Resources
                </h3>
                <div className="space-y-3">
                  {renderExternalLink(
                    school.financial_aid_url,
                    "Financial Aid Information",
                    <DollarSign className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-none"
                  )}
                  
                  {renderExternalLink(
                    school.international_students_url,
                    "International Student Aid",
                    <Globe className="h-4 w-4" />,
                    "default",
                    "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none"
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
                  <Button asChild variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60">
                    <a href={school.financial_aid_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
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
