
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Target, 
  Lightbulb, 
  TrendingUp,
  History
} from 'lucide-react';

interface AssessmentIntroProps {
  onStart: () => void;
  onViewHistory: () => void;
}

export const AssessmentIntro = ({ onStart, onViewHistory }: AssessmentIntroProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Discover Your Ideal Career Path</CardTitle>
          <p className="text-muted-foreground mt-2">
            Our AI-powered assessment analyzes your interests, skills, and goals to recommend 
            personalized career paths tailored just for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms analyze your responses to identify career matches
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Quick & Comprehensive</h3>
                <p className="text-sm text-muted-foreground">
                  Complete in 10-15 minutes with detailed insights
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Personalized Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get career recommendations based on your unique profile
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Growth Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Discover skills to develop and next steps to take
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              What You'll Discover
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Career Matches</Badge>
              <Badge variant="secondary">Skill Assessments</Badge>
              <Badge variant="secondary">Growth Areas</Badge>
              <Badge variant="secondary">Education Paths</Badge>
              <Badge variant="secondary">Industry Insights</Badge>
              <Badge variant="secondary">Next Steps</Badge>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={onStart} size="lg" className="px-8">
              Start Assessment
            </Button>
            <Button variant="outline" onClick={onViewHistory} size="lg">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
