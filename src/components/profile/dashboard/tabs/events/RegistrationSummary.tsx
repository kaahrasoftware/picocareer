
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface RegistrationSummaryProps {
  selectedEvent: string;
  eventTitle?: string;
  registrationCount: number;
  countriesData?: Record<string, number>;
  academicFieldsData?: Record<string, number>;
}

export function RegistrationSummary({
  selectedEvent,
  eventTitle,
  registrationCount,
  countriesData = {},
  academicFieldsData = {}
}: RegistrationSummaryProps) {
  // If we're looking at all events, return null
  if (selectedEvent === 'all') {
    return null;
  }

  // Get the top 3 countries
  const topCountries = Object.entries(countriesData).sort(([, countA], [, countB]) => countB - countA).slice(0, 3);

  // Get the top 3 academic fields
  const topFields = Object.entries(academicFieldsData).sort(([, countA], [, countB]) => countB - countA).slice(0, 3);

  // Calculate total registrations from countries to get percentages
  const totalCountriesCount = Object.values(countriesData).reduce((sum, count) => sum + count, 0) || 1;
  const totalFieldsCount = Object.values(academicFieldsData).reduce((sum, count) => sum + count, 0) || 1;

  return (
    <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-md">
      <CardHeader className="border-b bg-muted/10 pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-lg font-medium">Registration Summary</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs font-normal">
              {eventTitle}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {registrationCount} Registrations
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="grid gap-6 p-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Top Locations</h3>
          
          {topCountries.length > 0 ? (
            <div className="space-y-3">
              {topCountries.map(([country, count]) => (
                <div key={country} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{country}</span>
                    <span className="font-medium">{Math.round((count / totalCountriesCount) * 100)}%</span>
                  </div>
                  <Progress value={(count / totalCountriesCount) * 100} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No location data available
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Academic Fields</h3>
          
          {topFields.length > 0 ? (
            <div className="flex flex-col gap-4 pt-2">
              {topFields.map(([field, count], index) => (
                <div key={field} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{field}</span>
                    <span className="font-medium">{Math.round((count / totalFieldsCount) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(count / totalFieldsCount) * 100} 
                    className="h-2" 
                    indicatorClassName={`bg-${['blue', 'green', 'amber'][index] || 'primary'}-500`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No academic field data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
