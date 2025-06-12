import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, GraduationCap, BookOpen, Trophy, Calendar, FileText } from "lucide-react";
import { MenteeEssaysPlaceholder } from "./MenteeEssaysPlaceholder";

interface MenteeProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menteeId: string;
}

interface MenteeProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  academic_year?: string;
  academic_major?: string;
  school?: string;
  gpa?: number;
  career_interests?: string[];
  skills?: string[];
  achievements?: string[];
  extracurricular_activities?: string[];
  created_at: string;
}

interface AcademicRecord {
  id: string;
  semester: string;
  year: number;
  semester_gpa: number;
  cumulative_gpa: number;
  credits_earned: number;
  credits_attempted: number;
  class_rank?: number;
  honors?: string[];
  awards?: string[];
}

interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  semester?: string;
  year?: number;
  grade?: string;
  credits?: number;
  instructor_name?: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  github_url?: string;
  live_demo_url?: string;
  technologies?: string[];
  skills_used?: string[];
  collaborators?: string[];
}

interface Interest {
  id: string;
  interest_name: string;
  category: string;
  proficiency_level?: string;
  description?: string;
  related_major_id?: string;
  related_career_id?: string;
}

export function MenteeProfileDialog({ isOpen, onClose, menteeId }: MenteeProfileDialogProps) {
  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && menteeId) {
      fetchMenteeData();
    }
  }, [isOpen, menteeId]);

  const fetchMenteeData = async () => {
    try {
      setLoading(true);

      // Fetch mentee profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', menteeId)
        .eq('user_type', 'mentee')
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch academic records
      const { data: recordsData } = await supabase
        .from('mentee_academic_records')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false });

      setAcademicRecords(recordsData || []);

      // Fetch courses
      const { data: coursesData } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false });

      setCourses(coursesData || []);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('mentee_projects')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);

      // Fetch interests
      const { data: interestsData } = await supabase
        .from('mentee_interests')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

      setInterests(interestsData || []);

    } catch (error) {
      console.error('Error fetching mentee data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mentee Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
                {profile.academic_major && (
                  <Badge variant="outline" className="mt-2">
                    {profile.academic_major}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Tabs for detailed information */}
            <Tabs defaultValue="academics" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="academics">Academics</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="interests">Interests</TabsTrigger>
                <TabsTrigger value="essays">Essays</TabsTrigger>
              </TabsList>

              <TabsContent value="academics" className="space-y-4">
                {academicRecords.length > 0 ? (
                  academicRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          {record.semester} {record.year}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">Semester GPA: {record.semester_gpa}</p>
                            <p className="font-medium">Cumulative GPA: {record.cumulative_gpa}</p>
                          </div>
                          <div>
                            <p>Credits Earned: {record.credits_earned}/{record.credits_attempted}</p>
                            {record.class_rank && <p>Class Rank: {record.class_rank}</p>}
                          </div>
                        </div>
                        {record.honors && record.honors.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Honors:</p>
                            <div className="flex flex-wrap gap-2">
                              {record.honors.map((honor, index) => (
                                <Badge key={index} variant="secondary">{honor}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No academic records found</p>
                )}
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {course.course_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            {course.course_code && <p>Code: {course.course_code}</p>}
                            {course.semester && course.year && <p>Term: {course.semester} {course.year}</p>}
                          </div>
                          <div>
                            {course.grade && <p>Grade: {course.grade}</p>}
                            {course.credits && <p>Credits: {course.credits}</p>}
                          </div>
                        </div>
                        {course.instructor_name && (
                          <p className="mt-2">Instructor: {course.instructor_name}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No courses found</p>
                )}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {project.description && <p className="mb-4">{project.description}</p>}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p>Status: <Badge variant="outline">{project.status}</Badge></p>
                            {project.start_date && <p>Started: {new Date(project.start_date).toLocaleDateString()}</p>}
                          </div>
                          <div>
                            {project.end_date && <p>Completed: {new Date(project.end_date).toLocaleDateString()}</p>}
                            <div className="flex gap-2 mt-2">
                              {project.github_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    GitHub
                                  </a>
                                </Button>
                              )}
                              {project.live_demo_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer">
                                    Live Demo
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Technologies:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No projects found</p>
                )}
              </TabsContent>

              <TabsContent value="interests" className="space-y-4">
                {interests.length > 0 ? (
                  interests.map((interest) => (
                    <Card key={interest.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {interest.interest_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p>Category: <Badge variant="outline">{interest.category}</Badge></p>
                          {interest.proficiency_level && (
                            <p>Proficiency: <Badge variant="secondary">{interest.proficiency_level}</Badge></p>
                          )}
                          {interest.description && <p>{interest.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No interests found</p>
                )}
              </TabsContent>

              <TabsContent value="essays">
                <MenteeEssaysPlaceholder />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
