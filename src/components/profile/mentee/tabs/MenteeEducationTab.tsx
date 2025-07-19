
import React, { useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MenteeAcademicRecordForm } from '../forms/MenteeAcademicRecordForm';
import { MenteeCourseForm } from '../forms/MenteeCourseForm';
import { useMenteeAcademicRecords } from '@/hooks/useMenteeData';
import { useMenteeCourses, useMenteeDataMutations } from '@/hooks/useMenteeData';
import { MenteeAcademicRecord, MenteeCourse, CourseStatus } from '@/types/mentee-profile';
import type { Profile } from "@/types/database/profiles";

interface MenteeEducationTabProps {
  profile: Profile;
  isEditing: boolean;
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  planned: "bg-yellow-100 text-yellow-800",
  dropped: "bg-red-100 text-red-800"
};

export function MenteeEducationTab({ profile, isEditing }: MenteeEducationTabProps) {
  const { data: academicRecords = [], isLoading: loadingRecords } = useMenteeAcademicRecords(profile.id);
  const { data: courses = [], isLoading: loadingCourses } = useMenteeCourses(profile.id);
  const { deleteCourse } = useMenteeDataMutations();

  const [selectedRecord, setSelectedRecord] = useState<MenteeAcademicRecord | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MenteeCourse | null>(null);

  // Academic Records handlers
  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsRecordDialogOpen(true);
  };

  const handleEditRecord = (record: MenteeAcademicRecord) => {
    setSelectedRecord(record);
    setIsRecordDialogOpen(true);
  };

  const handleCloseRecordDialog = () => {
    setIsRecordDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleRecordSubmit = (data: Omit<MenteeAcademicRecord, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Submit academic record:', data);
    handleCloseRecordDialog();
  };

  // Course handlers
  const handleEditCourse = (course: MenteeCourse) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse.mutate(courseId);
    }
  };

  const handleCourseFormClose = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  if (loadingRecords || loadingCourses) {
    return <div className="flex justify-center p-8">Loading education data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Education</h3>
      </div>

      {/* Academic Records Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Records
          </CardTitle>
          {isEditing && (
            <Button onClick={handleAddRecord}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {academicRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No academic records found</p>
              <p className="text-sm">Add your academic records to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {academicRecords.map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{record.institution_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.degree_type} in {record.major}
                      </p>
                      {record.gpa && (
                        <p className="text-sm">GPA: {record.gpa}</p>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses
          </CardTitle>
          {isEditing && (
            <Button onClick={() => setShowCourseForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses added yet</p>
              {isEditing && <p className="text-sm">Click 'Add Course' to get started!</p>}
            </div>
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
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
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
        </CardContent>
      </Card>

      {/* Academic Record Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'Edit Academic Record' : 'Add Academic Record'}
            </DialogTitle>
          </DialogHeader>
          <MenteeAcademicRecordForm
            record={selectedRecord}
            onSubmit={handleRecordSubmit}
            onCancel={handleCloseRecordDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Course Form Dialog */}
      {showCourseForm && (
        <MenteeCourseForm
          menteeId={profile.id}
          course={editingCourse}
          onClose={handleCourseFormClose}
        />
      )}
    </div>
  );
}
