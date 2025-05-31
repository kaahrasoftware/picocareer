
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Users } from 'lucide-react';

export function Opportunity() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Software Engineering Internship</h1>
              <p className="text-xl text-muted-foreground">Tech Company Inc.</p>
            </div>
            <Badge variant="secondary">Internship</Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              San Francisco, CA
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Summer 2024
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              $25-30/hour
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              5 positions available
            </div>
          </div>

          <Button size="lg" className="mb-8">Apply Now</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Join our engineering team for an exciting summer internship opportunity. 
                  You'll work on real projects that impact millions of users while learning 
                  from experienced software engineers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Currently pursuing a degree in Computer Science or related field</li>
                  <li>Proficiency in at least one programming language</li>
                  <li>Strong problem-solving skills</li>
                  <li>Excellent communication and teamwork abilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Application Deadline</p>
                  <p className="text-sm text-muted-foreground">March 15, 2024</p>
                </div>
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">12 weeks</p>
                </div>
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">June 1, 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
