
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';

interface SearchResultCardProps {
  result: {
    id: string;
    type: string;
    title: string;
    description: string;
    location?: string;
    category?: string;
    status?: string;
    metadata?: any;
  };
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const getResultPath = () => {
    const typeMap: { [key: string]: string } = {
      'school': '/schools',
      'major': '/majors',
      'career': '/careers',
      'opportunity': '/opportunities',
      'scholarship': '/scholarships',
      'mentor': '/mentors',
      'blog': '/blogs',
      'event': '/events'
    };
    return `${typeMap[result.type] || '/'}/${result.id}`;
  };

  const getResultIcon = () => {
    switch (result.type) {
      case 'mentor':
        return (
          <ProfileAvatar
            avatarUrl={result.metadata?.avatar_url || ''}
            firstName={result.metadata?.first_name || ''}
            lastName={result.metadata?.last_name || ''}
            size="sm"
            editable={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              {getResultIcon()}
              <Link 
                to={getResultPath()}
                className="hover:text-primary transition-colors"
              >
                {result.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {result.type}
              </Badge>
              {result.category && (
                <Badge variant="outline">
                  {result.category}
                </Badge>
              )}
              {result.status && (
                <Badge 
                  variant={result.status === 'active' ? 'default' : 'secondary'}
                >
                  {result.status}
                </Badge>
              )}
            </div>
          </div>
          <Link to={getResultPath()}>
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          {result.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {result.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{result.location}</span>
            </div>
          )}
          
          {result.metadata?.student_count && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{result.metadata.student_count} students</span>
            </div>
          )}
          
          {result.metadata?.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{result.metadata.salary_range}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
