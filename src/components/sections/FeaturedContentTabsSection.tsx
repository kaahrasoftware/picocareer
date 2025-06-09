
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Users, Briefcase, GraduationCap, Building } from "lucide-react";

// Import existing components and hooks
import { MentorCard } from "@/components/MentorCard";
import { CareerCard } from "@/components/CareerCard";
import { MajorCard } from "@/components/MajorCard";
import { SchoolCard } from "@/components/SchoolCard";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";

import { useTopRatedMentors } from "@/hooks/useTopRatedMentors";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
import { useFeaturedMajors } from "@/hooks/useFeaturedMajors";
import { useFeaturedSchools } from "@/hooks/useFeaturedSchools";

export const FeaturedContentTabsSection = () => {
  const [activeTab, setActiveTab] = useState("mentors");
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false);

  // Data hooks
  const { data: mentors = [], isLoading: mentorsLoading } = useTopRatedMentors();
  const { data: careers = [], isLoading: careersLoading } = useFeaturedCareers();
  const { data: majors = [], isLoading: majorsLoading } = useFeaturedMajors();
  const { data: schools = [], isLoading: schoolsLoading } = useFeaturedSchools();

  const handleCareerClick = (careerId: string) => {
    setSelectedCareerId(careerId);
    setIsCareerDialogOpen(true);
  };

  const handleCareerDialogOpenChange = (open: boolean) => {
    setIsCareerDialogOpen(open);
    if (!open) {
      setSelectedCareerId(null);
    }
  };

  const tabConfig = [
    {
      id: "mentors",
      label: "Top Mentors",
      icon: Users,
      gradient: "from-blue-400 to-cyan-400",
      viewAllLink: "/mentor"
    },
    {
      id: "careers",
      label: "Featured Careers",
      icon: Briefcase,
      gradient: "from-purple-400 to-pink-400",
      viewAllLink: "/career"
    },
    {
      id: "majors",
      label: "Featured Majors",
      icon: GraduationCap,
      gradient: "from-green-400 to-emerald-400",
      viewAllLink: "/program"
    },
    {
      id: "schools",
      label: "Featured Schools",
      icon: Building,
      gradient: "from-orange-400 to-red-400",
      viewAllLink: "/school"
    }
  ];

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="h-64">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(196,181,253,0.1),transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore Featured Content
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover top-rated mentors, featured careers, academic majors, and schools to guide your journey.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm">
            {tabConfig.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 text-sm font-medium transition-all duration-300"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[tab.label.split(' ').length - 1]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full`} />
                <h3 className="text-2xl font-bold text-foreground">Top Rated Mentors</h3>
              </div>
              <Button asChild variant="outline">
                <Link to="/mentor">View All</Link>
              </Button>
            </div>
            
            {mentorsLoading ? (
              <LoadingSkeleton />
            ) : mentors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No mentors available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.slice(0, 6).map((mentor) => (
                  <MentorCard 
                    key={mentor.id}
                    id={mentor.id}
                    name={mentor.name}
                    position={mentor.career_title}
                    company={mentor.company}
                    location={mentor.location}
                    skills={mentor.skills}
                    keywords={mentor.keywords}
                    rating={mentor.rating}
                    totalRatings={mentor.totalRatings}
                    avatarUrl={mentor.imageUrl}
                    topMentor={mentor.top_mentor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full`} />
                <h3 className="text-2xl font-bold text-foreground">Featured Careers</h3>
              </div>
              <Button asChild variant="outline">
                <Link to="/career">View All</Link>
              </Button>
            </div>
            
            {careersLoading ? (
              <LoadingSkeleton />
            ) : careers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No careers available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careers.slice(0, 6).map((career) => (
                  <CareerCard 
                    key={career.id}
                    {...career}
                    onClick={() => handleCareerClick(career.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Majors Tab */}
          <TabsContent value="majors" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full`} />
                <h3 className="text-2xl font-bold text-foreground">Featured Majors</h3>
              </div>
              <Button asChild variant="outline">
                <Link to="/program">View All</Link>
              </Button>
            </div>
            
            {majorsLoading ? (
              <LoadingSkeleton />
            ) : majors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No majors available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {majors.slice(0, 6).map((major) => (
                  <MajorCard key={major.id} {...major} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full`} />
                <h3 className="text-2xl font-bold text-foreground">Featured Schools</h3>
              </div>
              <Button asChild variant="outline">
                <Link to="/school">View All</Link>
              </Button>
            </div>
            
            {schoolsLoading ? (
              <LoadingSkeleton />
            ) : schools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No schools available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.slice(0, 6).map((school) => (
                  <SchoolCard key={school.id} school={school} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Career Details Dialog */}
        {selectedCareerId && (
          <CareerDetailsDialog
            careerId={selectedCareerId}
            open={isCareerDialogOpen}
            onOpenChange={handleCareerDialogOpenChange}
          />
        )}
      </div>
    </section>
  );
};
