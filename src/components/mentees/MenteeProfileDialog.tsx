
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import {
  GraduationCap,
  MapPin,
  BookOpen,
  Trophy,
  FileText,
  Target,
  Star,
  Calendar,
  Award,
  TrendingUp,
  Code,
  Lightbulb,
  Users,
  Heart
} from 'lucide-react';

interface MenteeProfileDialogProps {
  menteeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenteeDetails {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  school_id?: string;
  academic_major_id?: string;
  skills?: string[];
  fields_of_interest?: string[];
  user_type: string;
  created_at: string;
  school?: { name: string };
  academic_major?: { title: string };
  academic_records?: Array<{
    id: string;
    year: number;
    semester: string;
    semester_gpa?: number;
    cumulative_gpa?: number;
    course_load?: number;
    honors?: string[];
    awards?: string[];
    notes?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    technologies?: string[];
    start_date?: string;
    end_date?: string;
    demo_url?: string;
    github_url?: string;
  }>;
  interests?: Array<{
    id: string;
    interest_name: string;
    category: string;
    level?: string;
  }>;
  essays?: Array<{
    id: string;
    title: string;
    content: string;
    essay_type: string;
    word_count?: number;
    created_at: string;
  }>;
}

export function MenteeProfileDialog({ menteeId, open, onOpenChange }: MenteeProfileDialogProps) {
  const { data: mentee, isLoading } = useQuery({
    queryKey: ['mentee-details', menteeId],
    queryFn: async (): Promise<MenteeDetails | null> => {
      if (!menteeId) return null;

      // Fetch basic profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location,
          school_id,
          academic_major_id,
          skills,
          fields_of_interest,
          user_type,
          created_at,
          schools:school_id(name),
          majors:academic_major_id(title)
        `)
        .eq('id', menteeId)
        .single();

      if (profileError) throw profileError;

      // Fetch academic records
      const { data: academicRecords } = await supabase
        .from('mentee_academic_records')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false });

      // Fetch projects
      const { data: projects } = await supabase
        .from('mentee_projects')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('start_date', { ascending: false });

      // Fetch interests
      const { data: interests } = await supabase
        .from('mentee_interests')
        .select('*')
        .eq('mentee_id', menteeId);

      // Fetch essays
      const { data: essays } = await supabase
        .from('mentee_essays')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

      return {
        ...profile,
        school: profile.schools,
        academic_major: profile.majors,
        academic_records: academicRecords || [],
        projects: projects || [],
        interests: interests || [],
        essays: essays || []
      };
    },
    enabled: !!menteeId && open,
  });

  if (!open || !menteeId) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!mentee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Mentee not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const latestRecord = mentee.academic_records?.[0];
  const activeProjects = mentee.projects?.filter(p => p.status === 'in_progress')?.length || 0;
  const completedProjects = mentee.projects?.filter(p => p.status === 'completed')?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <ProfileAvatar
              avatarUrl={mentee.avatar_url}
              imageAlt={mentee.full_name}
              size="lg"
              editable={false}
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{mentee.full_name}</DialogTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{mentee.academic_major?.title || 'Undeclared'}</span>
                </div>
                {mentee.school?.name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{mentee.school.name}</span>
                  </div>
                )}
                {mentee.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{mentee.location}</span>
                  </div>
                )}
              </div>
              {latestRecord?.cumulative_gpa && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">GPA: {latestRecord.cumulative_gpa.toFixed(2)}</span>
                  </div>
                  <Progress value={(latestRecord.cumulative_gpa / 4.0) * 100} className="h-2" />
                </div>
              )}
            </div>
          </div>
          {mentee.bio && (
            <p className="text-muted-foreground mb-4">{mentee.bio}</p>
          )}
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="essays">Essays</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{latestRecord?.cumulative_gpa?.toFixed(2) || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Cumulative GPA</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Code className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{mentee.projects?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{mentee.essays?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Essays Written</div>
                </CardContent>
              </Card>
            </div>

            {/* Skills & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentee.skills && mentee.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mentee.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {mentee.fields_of_interest && mentee.fields_of_interest.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Fields of Interest
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mentee.fields_of_interest.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="academics" className="space-y-4 mt-6">
            {mentee.academic_records && mentee.academic_records.length > 0 ? (
              <div className="space-y-4">
                {mentee.academic_records.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{record.year} - {record.semester}</span>
                        <div className="flex items-center gap-4">
                          {record.semester_gpa && (
                            <Badge variant="outline">
                              Semester GPA: {record.semester_gpa.toFixed(2)}
                            </Badge>
                          )}
                          {record.cumulative_gpa && (
                            <Badge variant="secondary">
                              Cumulative GPA: {record.cumulative_gpa.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {record.course_load && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Course Load: {record.course_load} credits
                        </p>
                      )}
                      
                      {record.honors && record.honors.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Honors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.honors.map((honor, index) => (
                              <Badge key={index} variant="outline" className="bg-yellow-50 border-yellow-200">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.awards && record.awards.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Awards
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.awards.map((award, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200">
                                {award}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No academic records available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-6">
            {mentee.projects && mentee.projects.length > 0 ? (
              <div className="space-y-4">
                {mentee.projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{project.title}</CardTitle>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {project.description && (
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                      )}
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started: {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Completed: {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {(project.demo_url || project.github_url) && (
                        <div className="mt-3 flex gap-2">
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Demo
                            </a>
                          )}
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Code
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No projects available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="essays" className="space-y-4 mt-6">
            {mentee.essays && mentee.essays.length > 0 ? (
              <div className="space-y-4">
                {mentee.essays.map((essay) => (
                  <Card key={essay.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{essay.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{essay.essay_type}</Badge>
                          {essay.word_count && (
                            <Badge variant="secondary">{essay.word_count} words</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{essay.content}</p>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Written on {new Date(essay.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No essays available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interests" className="space-y-4 mt-6">
            {mentee.interests && mentee.interests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(
                  mentee.interests.reduce((acc, interest) => {
                    if (!acc[interest.category]) acc[interest.category] = [];
                    acc[interest.category].push(interest);
                    return acc;
                  }, {} as Record<string, typeof mentee.interests>)
                ).map(([category, interests]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {interests.map((interest) => (
                          <div key={interest.id} className="flex items-center justify-between">
                            <span>{interest.interest_name}</span>
                            {interest.level && (
                              <Badge variant="outline" className="text-xs">
                                {interest.level}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No specific interests recorded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
