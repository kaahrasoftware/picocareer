
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit, Calendar, Clock, MapPin, Users, Video, User, Building } from 'lucide-react';
import { EventFormData } from '../types';
import { format } from 'date-fns';

interface ReviewStepProps {
  form: UseFormReturn<EventFormData>;
  onEdit: (stepIndex: number) => void;
}

export function ReviewStep({ form, onEdit }: ReviewStepProps) {
  const formData = form.getValues();

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'Not set';
    try {
      return format(new Date(dateTimeStr), 'PPP p');
    } catch {
      return dateTimeStr;
    }
  };

  const getEventTypeBadge = (type: string) => {
    const variants = {
      virtual: 'bg-blue-50 text-blue-700 border-blue-200',
      'in-person': 'bg-green-50 text-green-700 border-green-200',
      hybrid: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return variants[type as keyof typeof variants] || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review Your Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please review all the details below before creating your event. You can edit any section by clicking the edit button.
          </p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{formData.title || 'No title'}</h3>
            <Badge className={getEventTypeBadge(formData.event_type)}>
              {formData.event_type}
            </Badge>
          </div>
          
          {formData.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </div>
          )}

          {formData.thumbnail_url && (
            <div>
              <h4 className="font-medium mb-2">Event Image</h4>
              <img 
                src={formData.thumbnail_url} 
                alt="Event thumbnail" 
                className="w-48 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule & Location */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule & Location
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Time
              </h4>
              <p className="text-muted-foreground">{formatDateTime(formData.start_time)}</p>
            </div>
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </h4>
              <p className="text-muted-foreground">{formatDateTime(formData.end_time)}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h4>
            <p className="text-muted-foreground">{formData.location || 'Not specified'}</p>
          </div>

          <div>
            <h4 className="font-medium">Timezone</h4>
            <p className="text-muted-foreground">{formData.timezone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Platform & Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Platform & Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.event_type === 'virtual' || formData.event_type === 'hybrid') && (
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                Platform
              </h4>
              <p className="text-muted-foreground">{formData.platform}</p>
              {formData.meeting_link && (
                <p className="text-sm text-blue-600 break-all">{formData.meeting_link}</p>
              )}
            </div>
          )}

          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Maximum Attendees
            </h4>
            <p className="text-muted-foreground">{formData.max_attendees}</p>
          </div>

          {formData.facilitator && (
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Facilitator
              </h4>
              <p className="text-muted-foreground">{formData.facilitator}</p>
            </div>
          )}

          {formData.organized_by && (
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organized By
              </h4>
              <p className="text-muted-foreground">{formData.organized_by}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
