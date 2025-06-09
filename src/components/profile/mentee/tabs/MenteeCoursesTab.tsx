
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMenteeCourses, useMenteeDataMutations } from "@/hooks/useMenteeData";
import { MenteeCourseForm } from "../forms/MenteeCourseForm";
import type { Profile } from "@/types/database/profiles";
import type { MenteeCourse, CourseStatus } from "@/types/mentee-profile";

interface MenteeCoursesTabProps {
  profile: Profile;
  isEditing: boolean;
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  planned: "bg-yellow-100 text-yellow-800",
  dropped: "bg-red-100 text-red-800"
};

export function MenteeCoursesTab({ profile, isEditing }: MenteeCoursesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MenteeCourse | null>(null);
  
  const { data: courses = [], isLoading } = useMenteeCourses(profile.id);
  const { deleteCourse } = useMenteeDataMutations();

  const handleEdit = (course: MenteeCourse) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse.mutate(courseId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Courses</h3>
        {isEditing && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No courses added yet. {isEditing && "Click 'Add Course' to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{course.course_name}</CardTitle>
                  {course.course_code && (
                    <Badge variant="outline">{course.course_code}</Badge>
                  )}
                  <Badge className={STATUS_COLORS[course.status]}>
                    {course.status.replace('_', ' ')}
                  </Badge>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {course.semester && (
                    <div>
                      <span className="font-medium">Semester:</span> {course.semester}
                    </div>
                  )}
                  {course.year && (
                    <div>
                      <span className="font-medium">Year:</span> {course.year}
                    </div>
                  )}
                  {course.credits && (
                    <div>
                      <span className="font-medium">Credits:</span> {course.credits}
                    </div>
                  )}
                  {course.grade && (
                    <div>
                      <span className="font-medium">Grade:</span> {course.grade}
                    </div>
                  )}
                </div>
                {course.instructor_name && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Instructor:</span> {course.instructor_name}
                  </div>
                )}
                {course.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {course.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <MenteeCourseForm
          menteeId={profile.id}
          course={editingCourse}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
