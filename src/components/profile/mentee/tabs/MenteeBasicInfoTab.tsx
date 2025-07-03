
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AcademicStatus } from '@/types/mentee-profile';
import { Edit2 } from 'lucide-react';

interface MenteeBasicInfoTabProps {
  profile: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MenteeBasicInfoTab({ profile, isEditing, onEdit, onSave, onCancel }: MenteeBasicInfoTabProps) {
  const academicStatusOptions: { value: AcademicStatus; label: string }[] = [
    { value: 'undergraduate', label: 'Undergraduate Student' },
    { value: 'graduate', label: 'Graduate Student' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'high_school', label: 'High School Student' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Basic Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  defaultValue={profile?.first_name}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  defaultValue={profile?.last_name}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={profile?.email}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={profile?.phone}
              />
            </div>

            <div>
              <Label htmlFor="academic_status">Academic Status</Label>
              <Select defaultValue={profile?.academic_status}>
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                defaultValue={profile?.bio}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSave}>
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                <p className="text-sm">{profile?.first_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                <p className="text-sm">{profile?.last_name || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm">{profile?.email || 'Not provided'}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
              <p className="text-sm">{profile?.phone || 'Not provided'}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Academic Status</Label>
              <p className="text-sm">
                {academicStatusOptions.find(opt => opt.value === profile?.academic_status)?.label || 'Not provided'}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
              <p className="text-sm">{profile?.bio || 'No bio provided'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
