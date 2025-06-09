
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMenteeDataMutations } from "@/hooks/useMenteeData";
import type { MenteeCourse, CourseStatus } from "@/types/mentee-profile";

interface MenteeCourseFormProps {
  menteeId: string;
  course?: MenteeCourse | null;
  onClose: () => void;
}

const COURSE_STATUSES: { value: CourseStatus; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'dropped', label: 'Dropped' }
];

export function MenteeCourseForm({ menteeId, course, onClose }: MenteeCourseFormProps) {
  const [formData, setFormData] = useState({
    course_name: course?.course_name || '',
    course_code: course?.course_code || '',
    credits: course?.credits?.toString() || '',
    semester: course?.semester || '',
    year: course?.year?.toString() || '',
    grade: course?.grade || '',
    status: course?.status || 'in_progress' as CourseStatus,
    instructor_name: course?.instructor_name || '',
    description: course?.description || ''
  });

  const { addCourse, updateCourse } = useMenteeDataMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData = {
      mentee_id: menteeId,
      course_name: formData.course_name,
      course_code: formData.course_code || undefined,
      credits: formData.credits ? parseFloat(formData.credits) : undefined,
      semester: formData.semester || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      grade: formData.grade || undefined,
      status: formData.status,
      instructor_name: formData.instructor_name || undefined,
      description: formData.description || undefined
    };

    if (course) {
      updateCourse.mutate({ id: course.id, ...courseData });
    } else {
      addCourse.mutate(courseData);
    }
    
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_name">Course Name *</Label>
              <Input
                id="course_name"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>
            <div>
              <Label htmlFor="course_code">Course Code</Label>
              <Input
                id="course_code"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="e.g., CS 101"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                step="0.5"
                min="0"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="e.g., Fall, Spring"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., A, B+, 95%"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: CourseStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="instructor_name">Instructor Name</Label>
            <Input
              id="instructor_name"
              value={formData.instructor_name}
              onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
              placeholder="e.g., Dr. Jane Smith"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course description, key topics covered, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {course ? 'Update Course' : 'Add Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
