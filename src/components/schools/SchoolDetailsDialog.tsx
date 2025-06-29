
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Users, DollarSign, Calendar, GraduationCap } from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  location?: string;
  type?: string;
  established?: number;
  website?: string;
  student_population?: number;
  tuition_in_state?: number;
  tuition_out_state?: number;
  acceptance_rate?: number;
  graduation_rate?: number;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolDetailsDialogProps {
  school: SchoolData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolDetailsDialog({ school, open, onOpenChange }: SchoolDetailsDialogProps) {
  if (!school) return null;

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate?: number) => {
    if (!rate) return 'N/A';
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            {school.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {school.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={school.image_url}
                alt={school.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{school.location}</span>
                  </div>
                )}
                
                {school.type && (
                  <div>
                    <Badge variant="secondary">{school.type}</Badge>
                  </div>
                )}
                
                {school.established && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Established {school.established}</span>
                  </div>
                )}
                
                {school.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.student_population && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student Population:</span>
                    <span className="font-medium">{school.student_population.toLocaleString()}</span>
                  </div>
                )}
                
                {school.acceptance_rate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acceptance Rate:</span>
                    <span className="font-medium">{formatPercentage(school.acceptance_rate)}</span>
                  </div>
                )}
                
                {school.graduation_rate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graduation Rate:</span>
                    <span className="font-medium">{formatPercentage(school.graduation_rate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {(school.tuition_in_state || school.tuition_out_state) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tuition Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {school.tuition_in_state && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In-State Tuition:</span>
                      <span className="font-medium">{formatCurrency(school.tuition_in_state)}</span>
                    </div>
                  )}
                  
                  {school.tuition_out_state && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Out-of-State Tuition:</span>
                      <span className="font-medium">{formatCurrency(school.tuition_out_state)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {school.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {school.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
