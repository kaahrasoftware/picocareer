
import React from 'react';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Building, Target, Upload as UploadIcon } from 'lucide-react';
import type { StepProps } from '../types';

const partnershipTypeLabels: Record<string, string> = {
  university: 'University',
  high_school: 'High School',
  trade_school: 'Trade School',
  organization: 'Organization',
  individual: 'Individual',
  company: 'Company',
  nonprofit: 'Non-profit',
};

export function StepFive({ form, data }: StepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Partnership Type:</span>
                  <Badge variant="secondary" className="ml-2">
                    {partnershipTypeLabels[data.partner_type] || data.partner_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Organization:</span>
                  <span className="ml-2">{data.organization_name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Contact:</span>
                  <span className="ml-2">{data.contact_name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Email:</span>
                  <span className="ml-2">{data.contact_email}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 2: Organization Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Organization Details</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {data.organization_size && (
                <div>
                  <span className="text-sm font-medium">Size:</span>
                  <span className="ml-2">{data.organization_size}</span>
                </div>
              )}
              {data.website && (
                <div>
                  <span className="text-sm font-medium">Website:</span>
                  <span className="ml-2">{data.website}</span>
                </div>
              )}
              {data.established_year && (
                <div>
                  <span className="text-sm font-medium">Established:</span>
                  <span className="ml-2">{data.established_year}</span>
                </div>
              )}
              {data.focus_areas && data.focus_areas.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Focus Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.focus_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Step 3: Partnership Goals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Partnership Goals</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm font-medium">Goals:</span>
                <p className="mt-1 text-sm">{data.partnership_goals}</p>
              </div>
              {data.collaboration_areas && data.collaboration_areas.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Collaboration Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.collaboration_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.student_population && (
                <div>
                  <span className="text-sm font-medium">Student/Member Population:</span>
                  <span className="ml-2">{data.student_population.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Step 4: Supporting Documents */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Supporting Documents</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              {data.supporting_documents && data.supporting_documents.length > 0 ? (
                <div className="space-y-2">
                  {data.supporting_documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Terms and Conditions */}
          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the terms and conditions *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, I agree to PicoCareer's partnership terms and conditions,
                    privacy policy, and confirm that all information provided is accurate.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
