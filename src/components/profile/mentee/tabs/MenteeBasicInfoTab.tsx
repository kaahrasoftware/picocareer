
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AcademicStatus } from '@/types/mentee-profile';
import { Edit2, BookOpen, Star } from 'lucide-react';
import { useFavoriteCourses } from '@/hooks/useFavoriteCourses';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MenteeBasicInfoTabProps {
  profile: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MenteeBasicInfoTab({ profile, isEditing, onEdit, onSave, onCancel }: MenteeBasicInfoTabProps) {
  const [formData, setFormData] = useState({
    academic_status: profile?.academic_status || '',
    current_gpa: profile?.current_gpa || '',
    graduation_year: profile?.graduation_year || '',
    total_credits: profile?.total_credits || '',
    class_rank: profile?.class_rank || '',
  });

  const { data: favoriteCourses } = useFavoriteCourses(profile?.id);
  
  const academicStatusOptions: { value: AcademicStatus; label: string }[] = [
    { value: 'undergraduate', label: 'Undergraduate Student' },
    { value: 'graduate', label: 'Graduate Student' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'high_school', label: 'High School Student' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          academic_status: formData.academic_status,
          current_gpa: formData.current_gpa ? parseFloat(formData.current_gpa) : null,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          total_credits: formData.total_credits ? parseInt(formData.total_credits) : null,
          class_rank: formData.class_rank || null,
        })
        .eq('id', profile?.id);

      if (error) throw error;
      
      toast.success('Academic information updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update academic information');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Information
        </CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academic_status">Academic Status</Label>
                <Select 
                  value={formData.academic_status} 
                  onValueChange={(value) => handleInputChange('academic_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic status" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current_gpa">Current GPA</Label>
                <Input
                  id="current_gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="3.75"
                  value={formData.current_gpa}
                  onChange={(e) => handleInputChange('current_gpa', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="graduation_year">Expected Graduation Year</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  min="2020"
                  max="2035"
                  placeholder="2025"
                  value={formData.graduation_year}
                  onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="total_credits">Total Credits Completed</Label>
                <Input
                  id="total_credits"
                  type="number"
                  min="0"
                  placeholder="90"
                  value={formData.total_credits}
                  onChange={(e) => handleInputChange('total_credits', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="class_rank">Class Rank (Optional)</Label>
              <Input
                id="class_rank"
                placeholder="e.g., Top 10%, 15 of 200"
                value={formData.class_rank}
                onChange={(e) => handleInputChange('class_rank', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Academic Status</Label>
                <p className="text-sm font-medium">
                  {academicStatusOptions.find(opt => opt.value === profile?.academic_status)?.label || 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Current GPA</Label>
                <p className="text-sm font-medium">
                  {profile?.current_gpa ? `${profile.current_gpa}/4.0` : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Expected Graduation Year</Label>
                <p className="text-sm font-medium">{profile?.graduation_year || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Credits Completed</Label>
                <p className="text-sm font-medium">{profile?.total_credits || 'Not provided'}</p>
              </div>
            </div>

            {profile?.class_rank && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Class Rank</Label>
                <p className="text-sm font-medium">{profile.class_rank}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favorite Subjects/Courses
              </Label>
              {favoriteCourses && favoriteCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {favoriteCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border">
                      <div>
                        <p className="font-medium text-sm">{course.course_name}</p>
                        {course.course_code && (
                          <p className="text-xs text-muted-foreground">{course.course_code}</p>
                        )}
                      </div>
                      {course.grade && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                          {course.grade}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  No favorite courses selected. Add courses and mark them as favorites to display here.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
