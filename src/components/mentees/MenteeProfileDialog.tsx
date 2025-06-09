
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  GraduationCap,
  BookOpen,
  Code,
  FileText,
  Target,
  MapPin,
  Calendar,
  Star,
  Award,
  TrendingUp,
  Github,
  ExternalLink,
  Lightbulb,
  Trophy
} from "lucide-react";

interface MenteeProfileDialogProps {
  menteeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenteeProfileDialog({ menteeId, open, onOpenChange }: MenteeProfileDialogProps) {
  // Fetch complete mentee profile data
  const { data: mentee, isLoading } = useQuery({
    queryKey: ['mentee-profile', menteeId],
    queryFn: async () => {
      if (!menteeId) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
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
        .order('created_at', { ascending: false });

      // Fetch courses
      const { data: courses } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false });

      // Fetch interests
      const { data: interests } = await supabase
        .from('mentee_interests')
        .select('*')
        .eq('mentee_id', menteeId);

      // Fetch essay responses
      const { data: essays } = await supabase
        .from('mentee_essay_responses')
        .select(`
          *,
          prompt:prompt_id(title, category, word_limit)
        `)
        .eq('mentee_id', menteeId);

      return {
        ...profile,
        school: profile.schools,
        academic_major: profile.majors,
        academic_records: academicRecords || [],
        projects: projects || [],
        courses: courses || [],
        interests: interests || [],
        essays: essays || []
      };
    },
    enabled: !!menteeId && open
  });

  if (!open || !menteeId) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!mentee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Profile not found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const latestRecord = mentee.academic_records?.[0];
  const gpaProgress = latestRecord?.cumulative_gpa ? (latestRecord.cumulative_gpa / 4.0) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-6">
            <ProfileAvatar
              avatarUrl={mentee.avatar_url}
              imageAlt={mentee.full_name}
              size="xl"
              editable={false}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{mentee.full_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>{mentee.academic_major?.title || 'Undecided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span>{mentee.school?.name || 'No school listed'}</span>
                </div>
                {mentee.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span>{mentee.location}</span>
                  </div>
                )}
                {latestRecord && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>{latestRecord.year} {latestRecord.semester}</span>
                  </div>
                )}
              </div>
              {mentee.bio && (
                <p className="mt-3 text-gray-700">{mentee.bio}</p>
              )}
              {latestRecord?.cumulative_gpa && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current GPA</span>
                    <span className="text-lg font-bold text-blue-600">
                      {latestRecord.cumulative_gpa.toFixed(2)}/4.0
                    </span>
                  </div>
                  <Progress value={gpaProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="essays">Essays</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Academic Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {latestRecord ? (
                    <>
                      <div className="flex justify-between">
                        <span>Current GPA:</span>
                        <span className="font-semibold">{latestRecord.cumulative_gpa?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semester:</span>
                        <span>{latestRecord.semester} {latestRecord.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span>{latestRecord.credits_earned || 0}/{latestRecord.credits_attempted || 0}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No academic records available</p>
                  )}
                </CardContent>
              </Card>

              {/* Projects Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Projects:</span>
                    <span className="font-semibold">{mentee.projects?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-green-600 font-semibold">
                      {mentee.projects?.filter(p => p.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="text-blue-600 font-semibold">
                      {mentee.projects?.filter(p => p.status === 'in_progress').length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Essays Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Essays
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Essays:</span>
                    <span className="font-semibold">{mentee.essays?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-green-600 font-semibold">
                      {mentee.essays?.filter(e => !e.is_draft).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drafts:</span>
                    <span className="text-yellow-600 font-semibold">
                      {mentee.essays?.filter(e => e.is_draft).length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills and Interests Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentee.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    )) || <p className="text-muted-foreground">No skills listed</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fields of Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentee.fields_of_interest?.map((field, index) => (
                      <Badge key={index} variant="outline">{field}</Badge>
                    )) || <p className="text-muted-foreground">No interests listed</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academics" className="space-y-6">
            {/* Academic Records */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {mentee.academic_records && mentee.academic_records.length > 0 ? (
                  <div className="space-y-4">
                    {mentee.academic_records.map((record, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{record.semester} {record.year}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>Semester GPA: <span className="font-medium">{record.semester_gpa?.toFixed(2) || 'N/A'}</span></div>
                              <div>Cumulative GPA: <span className="font-medium">{record.cumulative_gpa?.toFixed(2) || 'N/A'}</span></div>
                              <div>Credits Attempted: <span className="font-medium">{record.credits_attempted || 0}</span></div>
                              <div>Credits Earned: <span className="font-medium">{record.credits_earned || 0}</span></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Honors and Awards */}
                        {(record.honors && record.honors.length > 0) && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">Honors</h5>
                            <div className="flex flex-wrap gap-1">
                              {record.honors.map((honor, idx) => (
                                <Badge key={idx} className="bg-yellow-100 text-yellow-800">{honor}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(record.awards && record.awards.length > 0) && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">Awards</h5>
                            <div className="flex flex-wrap gap-1">
                              {record.awards.map((award, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-800">{award}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No academic records available</p>
                )}
              </CardContent>
            </Card>

            {/* Course History */}
            <Card>
              <CardHeader>
                <CardTitle>Course History</CardTitle>
              </CardHeader>
              <CardContent>
                {mentee.courses && mentee.courses.length > 0 ? (
                  <div className="space-y-3">
                    {mentee.courses.map((course, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{course.course_name}</h4>
                            {course.course_code && (
                              <p className="text-sm text-muted-foreground">{course.course_code}</p>
                            )}
                            <div className="flex gap-4 mt-1 text-sm">
                              {course.semester && <span>{course.semester} {course.year}</span>}
                              {course.credits && <span>{course.credits} credits</span>}
                              {course.instructor_name && <span>Prof. {course.instructor_name}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                            {course.grade && (
                              <div className="mt-1 font-semibold">{course.grade}</div>
                            )}
                          </div>
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No courses listed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {mentee.projects && mentee.projects.length > 0 ? (
              <div className="grid gap-6">
                {mentee.projects.map((project, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5" />
                            {project.title}
                          </CardTitle>
                          {project.description && (
                            <p className="text-muted-foreground mt-2">{project.description}</p>
                          )}
                        </div>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Project Timeline */}
                      {(project.start_date || project.end_date) && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {project.start_date && (
                            <div>Started: {new Date(project.start_date).toLocaleDateString()}</div>
                          )}
                          {project.end_date && (
                            <div>Completed: {new Date(project.end_date).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Technologies</h5>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="outline">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills Used */}
                      {project.skills_used && project.skills_used.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Skills Used</h5>
                          <div className="flex flex-wrap gap-2">
                            {project.skills_used.map((skill, idx) => (
                              <Badge key={idx} className="bg-blue-50 text-blue-700">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Collaborators */}
                      {project.collaborators && project.collaborators.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Collaborators</h5>
                          <div className="flex flex-wrap gap-2">
                            {project.collaborators.map((collaborator, idx) => (
                              <Badge key={idx} className="bg-green-50 text-green-700">{collaborator}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project Links */}
                      <div className="flex gap-3">
                        {project.github_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {project.live_demo_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-muted-foreground">Projects will appear here when added</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="essays" className="space-y-6">
            {mentee.essays && mentee.essays.length > 0 ? (
              <div className="space-y-4">
                {mentee.essays.map((essay, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {essay.prompt?.title || 'Untitled Essay'}
                          </CardTitle>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Category: {essay.prompt?.category || 'N/A'}</span>
                            <span>Words: {essay.word_count}</span>
                            {essay.prompt?.word_limit && (
                              <span>Limit: {essay.prompt.word_limit}</span>
                            )}
                            <span>Version: {essay.version}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={essay.is_draft ? 'secondary' : 'default'}>
                            {essay.is_draft ? 'Draft' : 'Complete'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {essay.response_text && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap line-clamp-6">
                            {essay.response_text}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last updated: {new Date(essay.updated_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No essays yet</h3>
                  <p className="text-muted-foreground">Essay responses will appear here when added</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Personal Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mentee.interests && mentee.interests.length > 0 ? (
                    <div className="space-y-3">
                      {mentee.interests.map((interest, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{interest.interest_name}</h4>
                              <Badge variant="outline" className="mt-1">
                                {interest.category}
                              </Badge>
                            </div>
                            {interest.proficiency_level && (
                              <Badge variant="secondary">{interest.proficiency_level}</Badge>
                            )}
                          </div>
                          {interest.description && (
                            <p className="text-sm text-muted-foreground mt-2">{interest.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No interests listed</p>
                  )}
                </CardContent>
              </Card>

              {/* Fields of Interest */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Academic Fields
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentee.fields_of_interest?.map((field, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                        {field}
                      </Badge>
                    )) || <p className="text-muted-foreground">No academic fields listed</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
