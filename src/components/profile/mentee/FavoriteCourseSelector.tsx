
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, BookOpen } from 'lucide-react';
import { useAllMenteeCourses } from '@/hooks/useAllMenteeCourses';
import { useUpdateFavoriteCourse } from '@/hooks/useFavoriteCourses';
import { MenteeCourse } from '@/types/mentee-profile';
import { toast } from 'sonner';

interface FavoriteCourseSelectorProps {
  menteeId: string;
}

export function FavoriteCourseSelector({ menteeId }: FavoriteCourseSelectorProps) {
  const { data: allCourses, isLoading } = useAllMenteeCourses(menteeId);
  const updateFavoriteMutation = useUpdateFavoriteCourse();

  const handleFavoriteToggle = async (courseId: string, currentFavoriteStatus: boolean) => {
    try {
      await updateFavoriteMutation.mutateAsync({
        courseId,
        isFavorite: !currentFavoriteStatus
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const groupCoursesByYear = (courses: MenteeCourse[]) => {
    return courses.reduce((acc, course) => {
      const key = `${course.year} ${course.semester}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(course);
      return acc;
    }, {} as Record<string, MenteeCourse[]>);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">Select Favorite Courses</span>
        </div>
        <p className="text-sm text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  if (!allCourses || allCourses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">Select Favorite Courses</span>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              No courses found. Add courses first to mark them as favorites.
            </p>
            <p className="text-xs text-muted-foreground">
              Go to the Courses tab to add your courses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedCourses = groupCoursesByYear(allCourses);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4" />
        <span className="text-sm font-medium">Select Favorite Courses</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Select up to 5 courses to display as favorites in your profile.
      </p>
      
      <div className="space-y-4">
        {Object.entries(groupedCourses).map(([period, courses]) => (
          <Card key={period}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{period}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={course.is_favorite || false}
                    onCheckedChange={() => handleFavoriteToggle(course.id, course.is_favorite || false)}
                    disabled={updateFavoriteMutation.isPending}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate">
                          {course.course_name}
                        </p>
                        {course.course_code && (
                          <p className="text-xs text-muted-foreground">
                            {course.course_code}
                          </p>
                        )}
                      </div>
                      {course.grade && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                          {course.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
