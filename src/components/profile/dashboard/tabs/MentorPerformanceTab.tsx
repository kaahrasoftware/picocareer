import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useMentorPerformanceStats } from "@/hooks/useMentorPerformanceStats";

const mockBarData = [
  {
    "sessionType": "Career Advice",
    "menteeCount": 45,
    "menteeCountColor": "hsl(341, 70%, 50%)"
  },
  {
    "sessionType": "Resume Review",
    "menteeCount": 62,
    "menteeCountColor": "hsl(298, 70%, 50%)"
  },
  {
    "sessionType": "Mock Interview",
    "menteeCount": 23,
    "menteeCountColor": "hsl(121, 70%, 50%)"
  },
  {
    "sessionType": "Personal Branding",
    "menteeCount": 78,
    "menteeCountColor": "hsl(241, 70%, 50%)"
  },
  {
    "sessionType": "Networking Tips",
    "menteeCount": 34,
    "menteeCountColor": "hsl(249, 70%, 50%)"
  }
];

const mockLineData = [
  {
    "id": "newMentees",
    "color": "hsl(204, 70%, 50%)",
    "data": [
      { "x": "Jan", "y": 23 },
      { "x": "Feb", "y": 45 },
      { "x": "Mar", "y": 12 },
      { "x": "Apr", "y": 56 },
      { "x": "May", "y": 34 },
      { "x": "Jun", "y": 67 },
      { "x": "Jul", "y": 28 },
      { "x": "Aug", "y": 51 },
      { "x": "Sep", "y": 39 },
      { "x": "Oct", "y": 62 },
      { "x": "Nov", "y": 48 },
      { "x": "Dec", "y": 71 }
    ]
  }
];

const mockPieData = [
  {
    "id": "positive",
    "label": "Positive",
    "value": 75,
    "color": "hsl(154, 70%, 50%)"
  },
  {
    "id": "neutral",
    "label": "Neutral",
    "value": 15,
    "color": "hsl(44, 70%, 50%)"
  },
  {
    "id": "negative",
    "label": "Negative",
    "value": 10,
    "color": "hsl(34, 70%, 50%)"
  }
];

export function MentorPerformanceTab({ profileId }: { profileId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState<"all" | "year" | "month" | "quarter">("month");
  
  const {
    data: stats,
    isLoading,
    error
  } = useMentorPerformanceStats(profileId, timeFilter);

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value as "all" | "year" | "month" | "quarter");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mentor Performance Analytics</h2>
        <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Mentees</CardTitle>
                <CardDescription>Number of unique mentees</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.totalMentees || 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Sessions</CardTitle>
                <CardDescription>Number of sessions conducted</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.totalSessions || 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>Average feedback rating</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.averageRating?.toFixed(1) || 0}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
              <CardDescription>Distribution of session types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveBar
                  data={mockBarData}
                  keys={["menteeCount"]}
                  indexBy="sessionType"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: 'category10' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'session type',
                    legendPosition: 'middle',
                    legendOffset: 32
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'mentee count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                  role="application"
                  ariaLabel="Session Types Distribution"
                  barAriaLabel={d => `${d.id}: ${d.formattedValue} mentees`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Mentees Over Time</CardTitle>
              <CardDescription>Number of new mentees acquired over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveLine
                  data={mockLineData}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: true,
                    reverse: false
                  }}
                  yFormat=" >-.2f"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'month',
                    legendOffset: 36,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'mentees',
                    legendOffset: -40,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>Distribution of feedback ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsivePie
                  data={mockPieData}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'category10' }}
                  borderWidth={1}
                  borderColor={{
                    from: 'color',
                    modifiers: [
                      [
                        'darker',
                        0.2
                      ]
                    ]
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [
                      [
                        'darker',
                        2
                      ]
                    ]
                  }}
                  defs={[
                    {
                      id: 'dots',
                      type: 'patternDots',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      size: 4,
                      padding: 1,
                      stagger: true
                    },
                    {
                      id: 'lines',
                      type: 'patternLines',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      rotation: -45,
                      lineWidth: 6,
                      spacing: 10
                    }
                  ]}
                  fill={[
                    {
                      match: {
                        id: 'ruby'
                      },
                      id: 'dots'
                    },
                    {
                      match: {
                        id: 'c'
                      },
                      id: 'lines'
                    }
                  ]}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000'
                          }
                        }
                      ]
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
