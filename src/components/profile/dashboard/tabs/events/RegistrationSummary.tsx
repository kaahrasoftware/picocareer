
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Table, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
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
  const topCountries = Object.entries(countriesData)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);
  
  // Get the top 3 academic fields
  const topFields = Object.entries(academicFieldsData)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);

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
            <CircularProgress 
              percentage={registrationCount > 0 ? 100 : 0} 
              size="sm" 
              color="#8B5CF6"
              className="ml-2" 
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
        {/* Registration Summary */}
        <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Total Registrations</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-4xl font-bold text-primary">{registrationCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Registered participants</p>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Registration status</span>
              <span className="font-medium">Complete</span>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </div>
        </div>

        {/* Top Countries */}
        <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium">Top Countries</h3>
          </div>
          
          {topCountries.length > 0 ? (
            <ul className="space-y-3">
              {topCountries.map(([country, count], index) => {
                const percentage = Math.round((count / totalCountriesCount) * 100);
                return (
                  <li key={country} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="line-clamp-1">{country || 'Not specified'}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" 
                      // Different colors for different items
                      style={{ 
                        background: '#f1f5f9',
                        '--tw-progress-bg': index === 0 ? '#f97316' : index === 1 ? '#f59e0b' : '#fbbf24'
                      } as React.CSSProperties} 
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">No country data available</p>
            </div>
          )}
        </div>

        {/* Top Academic Fields */}
        <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Top Academic Fields</h3>
          </div>
          
          {topFields.length > 0 ? (
            <ul className="space-y-3">
              {topFields.map(([field, count], index) => {
                const percentage = Math.round((count / totalFieldsCount) * 100);
                return (
                  <li key={field} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="line-clamp-1">{field || 'Not specified'}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" 
                      // Different colors for different items
                      style={{ 
                        background: '#f1f5f9',
                        '--tw-progress-bg': index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : '#93c5fd'
                      } as React.CSSProperties} 
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">No academic field data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
