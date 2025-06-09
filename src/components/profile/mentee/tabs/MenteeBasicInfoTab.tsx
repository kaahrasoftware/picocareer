
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/database/profiles";
import type { AcademicStatus } from "@/types/mentee-profile";

interface MenteeBasicInfoTabProps {
  profile: Profile;
  isEditing: boolean;
}

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "India", "China", "Brazil", "Mexico", "South Korea",
  "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Singapore"
];

const ACADEMIC_STATUSES: { value: AcademicStatus; label: string }[] = [
  { value: 'current_student', label: 'Current Student' },
  { value: 'gap_year', label: 'Gap Year' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transfer_student', label: 'Transfer Student' },
  { value: 'prospective_student', label: 'Prospective Student' }
];

export function MenteeBasicInfoTab({ profile, isEditing }: MenteeBasicInfoTabProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    city: (profile as any).city || '',
    country: (profile as any).country || '',
    current_gpa: (profile as any).current_gpa || '',
    graduation_year: (profile as any).graduation_year || '',
    academic_status: (profile as any).academic_status || 'current_student' as AcademicStatus,
    class_rank: (profile as any).class_rank || '',
    total_credits: (profile as any).total_credits || ''
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          city: formData.city,
          country: formData.country,
          current_gpa: formData.current_gpa ? parseFloat(formData.current_gpa as string) : null,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year as string) : null,
          academic_status: formData.academic_status,
          class_rank: formData.class_rank ? parseInt(formData.class_rank as string) : null,
          total_credits: formData.total_credits ? parseInt(formData.total_credits as string) : null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">First Name</Label>
                <p className="text-sm text-muted-foreground">{profile.first_name || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name</Label>
                <p className="text-sm text-muted-foreground">{profile.last_name || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              <p className="text-sm text-muted-foreground">{profile.bio || 'No bio added yet'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">City</Label>
                <p className="text-sm text-muted-foreground">{(profile as any).city || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Country</Label>
                <p className="text-sm text-muted-foreground">{(profile as any).country || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Current GPA</Label>
                <p className="text-sm text-muted-foreground">{(profile as any).current_gpa || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Graduation Year</Label>
                <p className="text-sm text-muted-foreground">{(profile as any).graduation_year || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Academic Status</Label>
                <p className="text-sm text-muted-foreground">
                  {ACADEMIC_STATUSES.find(s => s.value === (profile as any).academic_status)?.label || 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Class Rank</Label>
                <p className="text-sm text-muted-foreground">{(profile as any).class_rank || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_gpa">Current GPA</Label>
              <Input
                id="current_gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.current_gpa}
                onChange={(e) => handleInputChange('current_gpa', e.target.value)}
                placeholder="e.g., 3.75"
              />
            </div>
            <div>
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                min="2020"
                max="2035"
                value={formData.graduation_year}
                onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                placeholder="e.g., 2025"
              />
            </div>
            <div>
              <Label htmlFor="academic_status">Academic Status</Label>
              <Select 
                value={formData.academic_status} 
                onValueChange={(value) => handleInputChange('academic_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class_rank">Class Rank (Optional)</Label>
              <Input
                id="class_rank"
                type="number"
                min="1"
                value={formData.class_rank}
                onChange={(e) => handleInputChange('class_rank', e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="total_credits">Total Credits Earned</Label>
            <Input
              id="total_credits"
              type="number"
              min="0"
              value={formData.total_credits}
              onChange={(e) => handleInputChange('total_credits', e.target.value)}
              placeholder="e.g., 45"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
