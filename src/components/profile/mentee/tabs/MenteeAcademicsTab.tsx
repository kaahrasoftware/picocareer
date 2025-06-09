
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMenteeAcademicRecords } from "@/hooks/useMenteeData";
import { TrendingUp, Award, GraduationCap } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface MenteeAcademicsTabProps {
  profile: Profile;
  isEditing: boolean;
}

export function MenteeAcademicsTab({ profile, isEditing }: MenteeAcademicsTabProps) {
  const { data: academicRecords = [], isLoading } = useMenteeAcademicRecords(profile.id);

  if (isLoading) {
    return <div>Loading academic records...</div>;
  }

  const latestRecord = academicRecords[0];
  const totalCredits = (profile as any).total_credits;
  const currentGPA = (profile as any).current_gpa;

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
            <div className="text-2xl font-bold">{currentGPA || 'N/A'}</div>
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
            <div className="text-2xl font-bold">{totalCredits || 0}</div>
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
            <div className="text-2xl font-bold">{(profile as any).class_rank || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Current ranking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Records by Semester */}
      <Card>
        <CardHeader>
          <CardTitle>Academic History</CardTitle>
        </CardHeader>
        <CardContent>
          {academicRecords.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No academic records added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {academicRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">
                      {record.semester} {record.year}
                    </h4>
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
    </div>
  );
}
