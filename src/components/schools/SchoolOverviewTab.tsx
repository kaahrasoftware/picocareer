
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
        <div className="border rounded-lg p-6 space-y-4 shadow-sm bg-white">
          <h2 className="text-xl font-semibold text-gray-900">About {school.name}</h2>
          
          <div className="flex flex-wrap gap-2 my-4">
            {school.type && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {school.type}
              </Badge>
            )}
            
            {school.country && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                {school.country}
              </Badge>
            )}
            
            {school.acceptance_rate !== null && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                {Math.round((school.acceptance_rate || 0) * 100)}% Acceptance Rate
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {school.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span className="text-gray-700">{school.location}</span>
                </div>
              )}
              
              {school.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-500" />
                  <a 
                    href={school.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {school.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </div>
              )}
              
              {school.ranking && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-gray-700">Ranking: {school.ranking}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {school.student_population && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="text-gray-700">{school.student_population.toLocaleString()} Students</span>
                </div>
              )}
              
              {school.student_faculty_ratio && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{school.student_faculty_ratio} Student-Faculty Ratio</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Links */}
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Application Resources</h2>
          <div className="flex flex-wrap gap-3">
            {renderExternalLink(
              school.undergraduate_application_url,
              "Undergraduate Application",
              <GraduationCap className="h-4 w-4" />,
              "default",
              "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            )}
            
            {renderExternalLink(
              school.graduate_application_url,
              "Graduate Application",
              <GraduationCap className="h-4 w-4" />,
              "default",
              "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
            )}
            
            {renderExternalLink(
              school.admissions_page_url,
              "Admissions Page",
              <Building className="h-4 w-4" />,
              "default",
              "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
            )}
            
            {renderExternalLink(
              school.virtual_tour_url,
              "Virtual Tour",
              <Briefcase className="h-4 w-4" />,
              "default",
              "bg-green-600 hover:bg-green-700 text-white border-green-600"
            )}
            
            {renderExternalLink(
              school.international_students_url,
              "International Students",
              <Globe className="h-4 w-4" />,
              "default",
              "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <DollarSign className="h-5 w-5 text-indigo-600" /> 
            Financial Resources
          </h2>
          <div className="space-y-3">
            {renderExternalLink(
              school.financial_aid_url,
              "Financial Aid",
              <Wallet className="h-4 w-4 text-indigo-700" />,
              "outline",
              "border-indigo-300 text-indigo-700 hover:bg-indigo-100"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
