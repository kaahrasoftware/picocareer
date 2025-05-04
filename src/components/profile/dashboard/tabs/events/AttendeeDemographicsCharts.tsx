
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  LabelList 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttendeeDemographicsChartsProps {
  geographicData: { country: string; count: number }[];
  academicData: { field: string; count: number }[];
  isLoading: boolean;
}

export function AttendeeDemographicsCharts({ 
  geographicData, 
  academicData,
  isLoading 
}: AttendeeDemographicsChartsProps) {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if ((!geographicData || geographicData.length === 0) && 
      (!academicData || academicData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No demographic data available
      </div>
    );
  }

  // Format the country data for charts
  const countryChartData = geographicData.map(item => ({
    name: item.country,
    value: item.count
  }));

  // Format the academic field data for charts
  const academicChartData = academicData.map(item => ({
    name: item.field,
    value: item.count
  }));

  // Define shorter names for long values to fit in chart
  const shortenName = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 12) + '...';
    }
    return name;
  };

  return (
    <Tabs defaultValue="geographic" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="geographic">Geographic</TabsTrigger>
        <TabsTrigger value="academic">Academic Fields</TabsTrigger>
      </TabsList>
      
      <TabsContent value="geographic" className="h-[250px]">
        {countryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={countryChartData}
              margin={{
                top: 5,
                right: 30,
                left: 80,
                bottom: 5,
              }}
            >
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                tickFormatter={shortenName}
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} registrations`, 'Count']}
                contentStyle={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#3b82f6" barSize={20}>
                <LabelList dataKey="value" position="right" fill="#666" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No geographic data available
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="academic" className="h-[250px]">
        {academicChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={academicChartData}
              margin={{
                top: 5,
                right: 30,
                left: 80,
                bottom: 5,
              }}
            >
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                tickFormatter={shortenName}
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} registrations`, 'Count']}
                contentStyle={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" barSize={20}>
                <LabelList dataKey="value" position="right" fill="#666" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No academic field data available
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
