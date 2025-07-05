
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Clock, Target, BookOpen, Briefcase, GraduationCap, User } from 'lucide-react';

interface AssessmentIntroProps {
  onStart: () => void;
  onViewHistory: () => void;
}

export const AssessmentIntro = ({ onStart, onViewHistory }: AssessmentIntroProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Discover Your Perfect Career Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Our AI-powered career assessment adapts to your unique situation, whether you're exploring 
            careers for the first time or looking to make a professional transition.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Personalized Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                Questions tailored to your academic level and career stage for more relevant insights.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                10-15 Minutes
              </h3>
              <p className="text-sm text-muted-foreground">
                Quick assessment that adapts based on your responses for maximum efficiency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Designed for Every Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Middle & High School Students</h4>
                  <p className="text-sm text-muted-foreground">Explore interests and discover potential career paths early</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">College Students</h4>
                  <p className="text-sm text-muted-foreground">Align your major with career goals and plan your future</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Career Professionals</h4>
                  <p className="text-sm text-muted-foreground">Find new opportunities and plan career transitions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Recent Graduates</h4>
                  <p className="text-sm text-muted-foreground">Navigate the transition from education to career</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What You'll Get</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Personalized career recommendations based on your stage and interests</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Detailed information about salary, growth potential, and requirements</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Next steps and educational pathways for each career</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Related careers to explore and professional mentors to connect with</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={onStart} size="lg" className="px-8">
          Start Assessment
        </Button>
        <Button variant="outline" onClick={onViewHistory} size="lg">
          View Past Results
        </Button>
      </div>
    </div>
  );
};
