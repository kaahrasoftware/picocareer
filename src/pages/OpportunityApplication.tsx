
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function OpportunityApplication() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Apply for Opportunity</h1>
          <p className="text-muted-foreground">
            Complete your application for this opportunity (ID: {id})
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Fill out all required fields to submit your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this opportunity..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume/CV</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Submit Application
              </Button>
              <Button type="button" variant="outline">
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
