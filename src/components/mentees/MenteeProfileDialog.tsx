import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, GraduationCap, Building, Star, Award, BookOpen, User } from 'lucide-react';

interface MenteeProfileDialogProps {
  menteeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenteeProfileDialog({ menteeId, open, onOpenChange }: MenteeProfileDialogProps) {
  const { data: menteeData, isLoading, error } = useQuery({
    queryKey: ['mentee-profile', menteeId],
    queryFn: async () => {
      if (!menteeId) return null;

      const { data, error } = await supabase
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

      if (error) throw error;
      return data;
    },
    enabled: !!menteeId,
  });

  const { data: academicRecords = [] } = useQuery({
    queryKey: ['mentee-academic-records', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];

      const { data, error } = await supabase
        .from('mentee_academic_records')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!menteeId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['mentee-projects', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];

      const { data, error } = await supabase
        .from('mentee_projects')
        .select('title, status, technologies')
        .eq('mentee_id', menteeId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!menteeId,
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['mentee-interests', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];

      const { data, error } = await supabase
        .from('mentee_interests')
        .select('interest_name, category')
        .eq('mentee_id', menteeId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!menteeId,
  });

  if (!menteeId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={menteeData?.avatar_url} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{menteeData?.full_name}</h2>
              <p className="text-sm text-muted-foreground">{menteeData?.school?.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{menteeData?.bio || 'No bio available.'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{menteeData?.location || 'No location specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{menteeData?.academic_major?.title || 'No major specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{menteeData?.school?.name || 'No school specified'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {menteeData?.skills?.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  )) || <span>No skills specified</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {menteeData?.fields_of_interest?.map((interest) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  )) || <span>No interests specified</span>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academics">
            {academicRecords.length > 0 ? (
              academicRecords.map((record) => (
                <Card key={record.id} className="mb-4">
                  <CardHeader>
                    <CardTitle>
                      {record.semester} {record.year}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>GPA: {record.cumulative_gpa}</span>
                    </div>
                    {record.honors && record.honors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>Honors: {record.honors.join(', ')}</span>
                      </div>
                    )}
                    {record.awards && record.awards.length > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Awards: {record.awards.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent>No academic records available.</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>Status: {project.status}</span>
                    </div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>Technologies: {project.technologies.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent>No projects available.</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interests">
            {interests.length > 0 ? (
              interests.map((interest, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{interest.interest_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>Category: {interest.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent>No interests available.</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
