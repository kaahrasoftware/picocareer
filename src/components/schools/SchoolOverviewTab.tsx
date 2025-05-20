
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Globe, 
  GraduationCap, 
  Users, 
  Award,
  Building,
  Briefcase,
  ExternalLink,
  Percent,
  DollarSign,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ColorfulStatCard } from "@/components/ui/colorful-stat-card";
import type { School } from "@/types/database/schools";

interface SchoolOverviewTabProps {
  school: School;
}

export function SchoolOverviewTab({ school }: SchoolOverviewTabProps) {
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
              <GraduationCap className="h-4 w-4" />,
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
  );
}
