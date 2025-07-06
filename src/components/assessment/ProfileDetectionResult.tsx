
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, ArrowRight, Brain } from 'lucide-react';

interface ProfileDetectionResultProps {
  profileType: string;
  onContinue: () => void;
}

const getProfileInfo = (profileType: string) => {
  switch (profileType) {
    case 'middle_school':
      return {
        label: 'Middle School Student',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'You\'re at an exciting stage of exploration! Our questions will help you discover potential career paths and understand what interests you most.',
        nextSteps: 'We\'ll ask you 3 personalized questions about your interests, preferred activities, and future goals.',
        icon: '🎓'
      };
    case 'high_school':
      return {
        label: 'High School Student',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'You\'re making important decisions about your future! Our assessment will help you explore careers that align with your interests and academic path.',
        nextSteps: 'We\'ll ask you 3 tailored questions about your academic preferences, career interests, and college plans.',
        icon: '📚'
      };
    case 'college':
      return {
        label: 'College Student',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'You\'re preparing for your career transition! Our questions will help you connect your studies with potential career opportunities.',
        nextSteps: 'We\'ll ask you 3 focused questions about your major, internship interests, and post-graduation goals.',
        icon: '🎯'
      };
    case 'career_professional':
      return {
        label: 'Career Professional',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'You\'re looking to advance or transition your career! Our assessment will help you explore new opportunities and growth paths.',
        nextSteps: 'We\'ll ask you 3 strategic questions about your experience, career goals, and desired changes.',
        icon: '💼'
      };
    default:
      return {
        label: 'Professional',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        description: 'We\'ve identified your profile and will personalize the remaining questions for you.',
        nextSteps: 'We\'ll ask you personalized questions based on your background.',
        icon: '✨'
      };
  }
};

export const ProfileDetectionResult = ({ profileType, onContinue }: ProfileDetectionResultProps) => {
  const profileInfo = getProfileInfo(profileType);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <CardTitle className="text-2xl flex items-center justify-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            Profile Detected!
          </CardTitle>
          
          <div className="flex justify-center mb-3">
            <Badge className={`${profileInfo.color} text-lg px-4 py-2`}>
              <span className="mr-2">{profileInfo.icon}</span>
              <User className="h-4 w-4 mr-2" />
              {profileInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {profileInfo.description}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              What's Next?
            </h3>
            <p className="text-muted-foreground">
              {profileInfo.nextSteps}
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                ✨ Step 1 Complete • Step 2 of 3: Personalized Questions
              </p>
            </div>
            
            <Button 
              onClick={onContinue}
              size="lg"
              className="px-8"
            >
              Continue to Personalized Questions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
