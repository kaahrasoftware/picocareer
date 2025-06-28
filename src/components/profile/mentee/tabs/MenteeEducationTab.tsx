
import React, { useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenteeEducationTabProps {
  profileId: string;
  isEditing: boolean;
}

export function MenteeEducationTab({ profileId, isEditing }: MenteeEducationTabProps) {
  const [academicRecords] = useState([]);
  const [courses] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Education</h3>
        {isEditing && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>

      {/* Academic Records Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {academicRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No academic records added yet. {isEditing && "Click 'Add Record' to get started."}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Academic records will be rendered here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No courses added yet. {isEditing && "Add courses to track your academic progress."}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Courses will be rendered here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
