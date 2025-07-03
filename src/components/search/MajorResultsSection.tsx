
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, DollarSign, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MajorSearchResult {
  id: string;
  title: string;
  description: string;
  category?: string;
  degree_levels?: string[];
  popular_careers?: string[];
  school_count?: number;
  salary_info?: string;
}

interface MajorResultsSectionProps {
  results: MajorSearchResult[];
  isLoading: boolean;
}

export function MajorResultsSection({ results, isLoading }: MajorResultsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No majors found</h3>
          <p className="text-muted-foreground text-center">
            Try adjusting your search terms or browse all majors
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((major) => (
        <Card key={major.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <Link 
                    to={`/majors/${major.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {major.title}
                  </Link>
                </CardTitle>
                {major.category && (
                  <Badge variant="secondary" className="w-fit">
                    {major.category}
                  </Badge>
                )}
              </div>
              <Link to={`/majors/${major.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{major.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {major.school_count && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{major.school_count} schools offer this</span>
                </div>
              )}
              
              {major.salary_info && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{major.salary_info}</span>
                </div>
              )}
              
              {major.degree_levels && major.degree_levels.length > 0 && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{major.degree_levels.join(', ')}</span>
                </div>
              )}
            </div>

            {major.popular_careers && major.popular_careers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Popular Career Paths:</h4>
                <div className="flex flex-wrap gap-2">
                  {major.popular_careers.slice(0, 4).map((career, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {career}
                    </Badge>
                  ))}
                  {major.popular_careers.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{major.popular_careers.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
