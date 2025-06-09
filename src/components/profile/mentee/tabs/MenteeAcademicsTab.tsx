
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMenteeAcademicRecords } from "@/hooks/useMenteeData";
import { useMenteeAcademicMutations } from "@/hooks/useMenteeAcademicMutations";
import { MenteeAcademicRecordForm } from "../forms/MenteeAcademicRecordForm";
import { TrendingUp, Award, GraduationCap, Plus, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Profile } from "@/types/database/profiles";
import type { MenteeAcademicRecord } from "@/types/mentee-profile";

interface MenteeAcademicsTabProps {
  profile: Profile;
  isEditing: boolean;
}

export function MenteeAcademicsTab({ profile, isEditing }: MenteeAcademicsTabProps) {
  const { data: academicRecords = [], isLoading } = useMenteeAcademicRecords(profile.id);
  const { deleteAcademicRecord } = useMenteeAcademicMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MenteeAcademicRecord | null>(null);

  if (isLoading) {
    return <div>Loading academic records...</div>;
  }

  const latestRecord = academicRecords[0];
  const totalCredits = (profile as any).total_credits;
  const currentGPA = (profile as any).current_gpa;

  const handleEdit = (record: MenteeAcademicRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (record: MenteeAcademicRecord) => {
    await deleteAcademicRecord.mutateAsync({
      id: record.id,
      menteeId: profile.id
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGPA || latestRecord?.cumulative_gpa || 'N/A'}</div>
            {latestRecord?.cumulative_gpa && (
              <p className="text-xs text-muted-foreground">
                Cumulative: {latestRecord.cumulative_gpa}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits || academicRecords.reduce((sum, record) => sum + (record.credits_earned || 0), 0)}</div>
            {latestRecord?.credits_earned && (
              <p className="text-xs text-muted-foreground">
                Last semester: {latestRecord.credits_earned} credits
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(profile as any).class_rank || latestRecord?.class_rank || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Current ranking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Records by Semester */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Academic History</CardTitle>
          {isEditing && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {academicRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No academic records added yet.
              </p>
              {isEditing && (
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Record
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {academicRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">
                      {record.semester} {record.year}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {record.semester_gpa && (
                          <div className="text-sm font-medium">
                            Semester GPA: {record.semester_gpa}
                          </div>
                        )}
                        {record.cumulative_gpa && (
                          <div className="text-xs text-muted-foreground">
                            Cumulative: {record.cumulative_gpa}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Academic Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this academic record for {record.semester} {record.year}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(record)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {record.credits_attempted && (
                      <div>
                        <span className="font-medium">Credits Attempted:</span> {record.credits_attempted}
                      </div>
                    )}
                    {record.credits_earned && (
                      <div>
                        <span className="font-medium">Credits Earned:</span> {record.credits_earned}
                      </div>
                    )}
                    {record.class_rank && (
                      <div>
                        <span className="font-medium">Class Rank:</span> {record.class_rank}
                      </div>
                    )}
                  </div>

                  {record.honors && record.honors.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Honors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.honors.map((honor, index) => (
                          <span
                            key={index}
                            className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                          >
                            {honor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.awards && record.awards.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Awards:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.awards.map((award, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Record Form Dialog */}
      {showForm && (
        <MenteeAcademicRecordForm
          menteeId={profile.id}
          record={editingRecord}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
