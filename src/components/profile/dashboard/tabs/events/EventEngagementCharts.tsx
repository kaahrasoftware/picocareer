import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Briefcase, GraduationCap, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { ColorfulStatCard } from '@/components/ui/colorful-stat-card';
import { Button } from '@/components/ui/button';
import { EventResourceAnalytics } from './EventResourceAnalytics';

const MODERN_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#06b6d4'];

interface EngagementData {
  countries: Array<{ name: string; count: number; percentage: number }>;
  careers: Array<{ name: string; count: number; percentage: number }>;
  organizations: Array<{ name: string; count: number; percentage: number }>;
  acquisitionChannels: Array<{ name: string; count: number; percentage: number }>;
  totalParticipants: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Participants: <span className="font-semibold text-primary">{payload[0].value}</span>
        </p>
        {payload[0].payload.percentage && (
          <p className="text-xs text-gray-500">{payload[0].payload.percentage}% of total</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold text-primary">{payload[0].value}</span>
        </p>
        <p className="text-xs text-gray-500">{payload[0].payload.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

const DonutCenterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold text-amber-600">{payload[0].value}</span>
        </p>
        <p className="text-xs text-gray-500">{payload[0].payload.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export function EventEngagementCharts() {
  const { data: engagementData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['event-engagement-data'],
    queryFn: async (): Promise<EngagementData> => {
      // Get all event registrations
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('*');

      if (error) throw error;

      const totalParticipants = registrations?.length || 0;

      // Process countries data
      const countryMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg.country) {
          countryMap.set(reg.country, (countryMap.get(reg.country) || 0) + 1);
        }
      });

      const countries = Array.from(countryMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalParticipants) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process careers/positions data
      const careerMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg['current academic field/position']) {
          const career = reg['current academic field/position'];
          careerMap.set(career, (careerMap.get(career) || 0) + 1);
        }
      });

      const careers = Array.from(careerMap.entries())
        .map(([name, count]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          count,
          percentage: Math.round((count / totalParticipants) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process organizations (schools/companies) data
      const orgMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg['current school/company']) {
          const org = reg['current school/company'];
          orgMap.set(org, (orgMap.get(org) || 0) + 1);
        }
      });

      const organizations = Array.from(orgMap.entries())
        .map(([name, count]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          count,
          percentage: Math.round((count / totalParticipants) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process acquisition channels
      const channelMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg['where did you hear about us']) {
          const channel = reg['where did you hear about us'];
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        }
      });

      const acquisitionChannels = Array.from(channelMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalParticipants) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        countries,
        careers,
        organizations,
        acquisitionChannels,
        totalParticipants
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton with colorful cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse border"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!engagementData || engagementData.totalParticipants === 0) {
    return (
      <div className="space-y-6">
        {/* Empty state with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorfulStatCard
            title="Total Participants"
            value={0}
            icon={<Users className="h-5 w-5" />}
            variant="blue"
            footer="across all events"
          />
          <ColorfulStatCard
            title="Countries Represented"
            value={0}
            icon={<Globe className="h-5 w-5" />}
            variant="green"
            footer="global reach"
          />
          <ColorfulStatCard
            title="Career Fields"
            value={0}
            icon={<Briefcase className="h-5 w-5" />}
            variant="purple"
            footer="diverse backgrounds"
          />
        </div>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registration Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              Event engagement charts will appear once participants register for events.
            </p>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate additional stats
  const topCountry = engagementData.countries[0];
  const topCareer = engagementData.careers[0];
  const diversityScore = Math.min(100, Math.round((engagementData.countries.length / engagementData.totalParticipants) * 100 * 10));

  return (
    <div className="space-y-8">
      {/* Participant Demographics Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Participant Demographics & Engagement</h3>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorfulStatCard
            title="Total Participants"
            value={engagementData.totalParticipants.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            variant="blue"
            footer="across all events"
          />
          
          <ColorfulStatCard
            title="Top Location"
            value={topCountry?.count || 0}
            icon={<Globe className="h-5 w-5" />}
            variant="green"
            footer={topCountry ? `${topCountry.name} (${topCountry.percentage}%)` : 'No data'}
          />
          
          <ColorfulStatCard
            title="Diversity Score"
            value={`${diversityScore}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="purple"
            footer="geographic diversity"
            showProgress={true}
            progressValue={diversityScore}
          />
        </div>

        {/* Demographics Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Countries */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <div className="p-2 bg-blue-200 rounded-full">
                  <Globe className="h-4 w-4" />
                </div>
                Top Countries
              </CardTitle>
              <p className="text-sm text-blue-600">{engagementData.countries.length} countries represented</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engagementData.countries} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Careers */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <div className="p-2 bg-green-200 rounded-full">
                  <Briefcase className="h-4 w-4" />
                </div>
                Top Career Fields
              </CardTitle>
              <p className="text-sm text-green-600">{engagementData.careers.length} different fields</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engagementData.careers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Organizations */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <div className="p-2 bg-purple-200 rounded-full">
                  <GraduationCap className="h-4 w-4" />
                </div>
                Top Organizations
              </CardTitle>
              <p className="text-sm text-purple-600">{engagementData.organizations.length} institutions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engagementData.organizations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Acquisition Channels */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <div className="p-2 bg-cyan-200 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                </div>
                How Participants Found Us
              </CardTitle>
              <p className="text-sm text-cyan-600">Top {engagementData.acquisitionChannels.length} acquisition channels</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engagementData.acquisitionChannels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resource Analytics Section */}
      <div className="border-t pt-8">
        <EventResourceAnalytics />
      </div>
    </div>
  );
}
