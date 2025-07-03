
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MenteeAcademicRecordForm } from '../forms/MenteeAcademicRecordForm';
import { useMenteeAcademicRecords, useMenteeDataMutations } from '@/hooks/useMenteeData';
import { MenteeAcademicRecord } from '@/types/mentee-profile';
import { Plus, Edit2, Trash2, GraduationCap, Award, BookOpen } from 'lucide-react';
import type { Profile } from "@/types/database/profiles";

interface MenteeAcademicsTabProps {
  profile: Profile;
  isEditing?: boolean;
}

export function MenteeAcademicsTab({ profile, isEditing = false }: MenteeAcademicsTabProps) {
  const { data: academicRecords = [], isLoading } = useMenteeAcademicRecords(profile.id);
  const [selectedRecord, setSelectedRecord] = useState<MenteeAcademicRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: MenteeAcademicRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmit = (data: Omit<MenteeAcademicRecord, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Submit data:', data);
    handleCloseDialog();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading academic records...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Academic Records</CardTitle>
          <Button onClick={handleAddRecord}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'Edit Academic Record' : 'Add Academic Record'}
            </DialogTitle>
          </DialogHeader>
          <MenteeAcademicRecordForm
            record={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
