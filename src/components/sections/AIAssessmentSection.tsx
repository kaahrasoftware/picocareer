
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AIAssessmentSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Discover Your Perfect Career Path</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take our AI-powered career assessment to get personalized recommendations 
            based on your interests, skills, and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Advanced algorithms analyze your responses to identify the best career matches for your unique profile.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Personalized Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Get detailed career recommendations with explanations of why they match your interests and skills.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Growth Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Discover skills to develop, education paths to consider, and next steps for your career journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/career-assessment">
            <Button size="lg" className="px-8">
              <Brain className="h-5 w-5 mr-2" />
              Start Your Career Assessment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
