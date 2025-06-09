
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  BookOpen, 
  Code,
  Award,
  Lightbulb,
  FileText,
  Calendar,
  Target
} from 'lucide-react';

interface MenteeProfileDialogProps {
  menteeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenteeProfileDialog({ menteeId, open, onOpenChange }: MenteeProfileDialogProps) {
  // Fetch comprehensive mentee profile data
  const { data: menteeProfile, isLoading } = useQuery({
    queryKey: ['mentee-profile-full', menteeId],
    queryFn: async () => {
      if (!menteeId) return null;

      // Fetch main profile
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
      const { data: essayResponses } = await supabase
        .from('mentee_essay_responses')
        .select(`
          *,
          prompt:prompt_id(title, prompt_text, category)
        `)
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

      return {
        ...profile,
        school: profile.schools,
        academic_major: profile.majors,
        academic_records: academicRecords || [],
        projects: projects || [],
        courses: courses || [],
        interests: interests || [],
        essay_responses: essayResponses || []
      };
    },
    enabled: !!menteeId && open
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Mentee Profile</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[80vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !menteeProfile ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Profile not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <ProfileAvatar 
                  avatarUrl={menteeProfile.avatar_url} 
                  imageAlt={menteeProfile.full_name} 
                  size="xl"
                  editable={false}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {menteeProfile.full_name}
                  </h2>
                  
                  <div className="space-y-2">
                    {menteeProfile.academic_major?.title && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{menteeProfile.academic_major.title}</span>
                      </div>
                    )}
                    
                    {menteeProfile.school?.name && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span>{menteeProfile.school.name}</span>
                      </div>
                    )}
                    
                    {menteeProfile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <span>{menteeProfile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Latest GPA */}
                  {menteeProfile.academic_records?.[0]?.cumulative_gpa && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">
                        GPA: {menteeProfile.academic_records[0].cumulative_gpa.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {menteeProfile.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{menteeProfile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tabbed Content */}
              <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="interests">Interests</TabsTrigger>
                  <TabsTrigger value="essays">Essays</TabsTrigger>
                </TabsList>

                {/* Academic Records Tab */}
                <TabsContent value="academic" className="space-y-4">
                  {menteeProfile.academic_records?.length > 0 ? (
                    menteeProfile.academic_records.map((record) => (
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
                          <div className="grid grid-cols-2 gap-4">
                            {record.credits_attempted && (
                              <div>
                                <span className="font-medium">Credits Attempted:</span> {record.credits_attempted}
                              </div>
                            )}
                            {record.credits_earned && (
                              <div>
                                <span className="font-medium">Credits Earned:</span> {record.credits_earned}
                              </div>
                            )}
                            {record.class_rank && (
                              <div>
                                <span className="font-medium">Class Rank:</span> {record.class_rank}
                              </div>
                            )}
                          </div>
                          
                          {/* Honors and Awards */}
                          {(record.honors?.length > 0 || record.awards?.length > 0) && (
                            <div className="mt-4 space-y-3">
                              {record.honors?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-yellow-500" />
                                    Honors
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {record.honors.map((honor, index) => (
                                      <Badge key={index} className="bg-yellow-100 text-yellow-800">
                                        {honor}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {record.awards?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-blue-500" />
                                    Awards
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {record.awards.map((award, index) => (
                                      <Badge key={index} className="bg-blue-100 text-blue-800">
                                        {award}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No academic records available</p>
                  )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                  {menteeProfile.projects?.length > 0 ? (
                    menteeProfile.projects.map((project) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{project.title}</span>
                            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {project.description && (
                            <p className="text-gray-700 mb-4">{project.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {project.start_date && (
                              <div>
                                <span className="font-medium">Start Date:</span> {new Date(project.start_date).toLocaleDateString()}
                              </div>
                            )}
                            {project.end_date && (
                              <div>
                                <span className="font-medium">End Date:</span> {new Date(project.end_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {project.technologies?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Technologies:</h4>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, index) => (
                                  <Badge key={index} variant="outline">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {project.skills_used?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Skills Used:</h4>
                              <div className="flex flex-wrap gap-2">
                                {project.skills_used.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-4">
                            {project.github_url && (
                              <a 
                                href={project.github_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                GitHub Repository
                              </a>
                            )}
                            {project.live_demo_url && (
                              <a 
                                href={project.live_demo_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                Live Demo
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No projects available</p>
                  )}
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                  {menteeProfile.courses?.length > 0 ? (
                    <div className="grid gap-4">
                      {menteeProfile.courses.map((course) => (
                        <Card key={course.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{course.course_name}</h3>
                              <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                                {course.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              {course.course_code && (
                                <div><span className="font-medium">Code:</span> {course.course_code}</div>
                              )}
                              {course.credits && (
                                <div><span className="font-medium">Credits:</span> {course.credits}</div>
                              )}
                              {course.grade && (
                                <div><span className="font-medium">Grade:</span> {course.grade}</div>
                              )}
                              {course.instructor_name && (
                                <div><span className="font-medium">Instructor:</span> {course.instructor_name}</div>
                              )}
                              {course.semester && course.year && (
                                <div><span className="font-medium">Term:</span> {course.semester} {course.year}</div>
                              )}
                            </div>
                            
                            {course.description && (
                              <p className="mt-2 text-sm text-gray-700">{course.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No courses available</p>
                  )}
                </TabsContent>

                {/* Interests Tab */}
                <TabsContent value="interests" className="space-y-4">
                  {menteeProfile.interests?.length > 0 ? (
                    <div className="grid gap-4">
                      {menteeProfile.interests.map((interest) => (
                        <Card key={interest.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                {interest.interest_name}
                              </h3>
                              <Badge variant="outline">
                                {interest.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {interest.proficiency_level && (
                              <div className="mb-2">
                                <span className="font-medium">Proficiency:</span> {interest.proficiency_level}
                              </div>
                            )}
                            
                            {interest.description && (
                              <p className="text-sm text-gray-700">{interest.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No interests available</p>
                  )}
                </TabsContent>

                {/* Essays Tab */}
                <TabsContent value="essays" className="space-y-4">
                  {menteeProfile.essay_responses?.length > 0 ? (
                    menteeProfile.essay_responses.map((essay) => (
                      <Card key={essay.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{essay.prompt?.title || 'Essay Response'}</span>
                            <div className="flex items-center gap-2">
                              {essay.is_draft && (
                                <Badge variant="outline">Draft</Badge>
                              )}
                              {essay.word_count > 0 && (
                                <Badge variant="secondary">
                                  {essay.word_count} words
                                </Badge>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {essay.prompt?.prompt_text && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Prompt:</h4>
                              <p className="text-sm text-gray-700">{essay.prompt.prompt_text}</p>
                            </div>
                          )}
                          
                          {essay.response_text && (
                            <div>
                              <h4 className="font-medium mb-2">Response:</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{essay.response_text}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No essay responses available</p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Skills and Fields of Interest */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menteeProfile.skills?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {menteeProfile.skills.map((skill, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {menteeProfile.fields_of_interest?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                        Fields of Interest
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {menteeProfile.fields_of_interest.map((field, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
