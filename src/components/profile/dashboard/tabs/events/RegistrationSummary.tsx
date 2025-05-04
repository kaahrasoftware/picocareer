
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Table } from "lucide-react";

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

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Registration Summary: {eventTitle}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {registrationCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Countries */}
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            <PieChart className="h-4 w-4" />
            <span>Top Countries</span>
          </div>
          
          {topCountries.length > 0 ? (
            <ul className="text-sm">
              {topCountries.map(([country, count], index) => (
                <li key={country} className="flex justify-between py-1">
                  <span>{country || 'Not specified'}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No country data available</p>
          )}
        </div>

        {/* Top Academic Fields */}
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            <BarChart className="h-4 w-4" />
            <span>Top Academic Fields</span>
          </div>
          
          {topFields.length > 0 ? (
            <ul className="text-sm">
              {topFields.map(([field, count], index) => (
                <li key={field} className="flex justify-between py-1">
                  <span className="line-clamp-1">{field || 'Not specified'}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No academic field data available</p>
          )}
        </div>

        {/* Organizations */}
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            <Table className="h-4 w-4" />
            <span>Registration Status</span>
          </div>
          
          <div className="text-sm">
            <div className="flex justify-between py-1">
              <span>Registered</span>
              <span className="text-muted-foreground">{registrationCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
