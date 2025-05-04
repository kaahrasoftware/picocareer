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
  const topCountries = Object.entries(countriesData).sort(([, countA], [, countB]) => countB - countA).slice(0, 3);

  // Get the top 3 academic fields
  const topFields = Object.entries(academicFieldsData).sort(([, countA], [, countB]) => countB - countA).slice(0, 3);

  // Calculate total registrations from countries to get percentages
  const totalCountriesCount = Object.values(countriesData).reduce((sum, count) => sum + count, 0) || 1;
  const totalFieldsCount = Object.values(academicFieldsData).reduce((sum, count) => sum + count, 0) || 1;
  return <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-md">
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
            <CircularProgress percentage={registrationCount > 0 ? 100 : 0} size="sm" color="#8B5CF6" className="ml-2" />
          </div>
        </CardTitle>
      </CardHeader>
      
    </Card>;
}