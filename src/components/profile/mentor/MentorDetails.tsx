import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MentorDetailsProps {
  mentorData: {
    sessionTypes: Array<{
      type: string;
      duration: number;
      price: number;
      description: string | null;
    }>;
    specializations: Array<{
      career: { title: string } | null;
      major: { title: string } | null;
      years_of_experience: number;
    }>;
  } | null;
}

export function MentorDetails({ mentorData }: MentorDetailsProps) {
  if (!mentorData) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorData.sessionTypes.map((session, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <h4 className="font-medium">{session.type}</h4>
                <p className="text-sm text-muted-foreground">
                  Duration: {session.duration} minutes
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: ${session.price}
                </p>
                {session.description && (
                  <p className="text-sm mt-2">{session.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorData.specializations.map((spec, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                {spec.career?.title && (
                  <p className="font-medium">{spec.career.title}</p>
                )}
                {spec.major?.title && (
                  <p className="text-sm text-muted-foreground">
                    Major: {spec.major.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Years of Experience: {spec.years_of_experience}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}