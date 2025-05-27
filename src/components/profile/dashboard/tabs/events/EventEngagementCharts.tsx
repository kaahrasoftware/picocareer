
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Briefcase, GraduationCap, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b'];

interface EngagementData {
  countries: Array<{ name: string; count: number; percentage: number }>;
  careers: Array<{ name: string; count: number; percentage: number }>;
  organizations: Array<{ name: string; count: number; percentage: number }>;
  studentProfessionalSplit: Array<{ name: string; count: number; percentage: number }>;
  acquisitionChannels: Array<{ name: string; count: number; percentage: number }>;
  totalParticipants: number;
}

export function EventEngagementCharts() {
  const { data: engagementData, isLoading } = useQuery({
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

      // Process student vs professional split
      const roleMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg.student_or_professional) {
          const role = reg.student_or_professional;
          roleMap.set(role, (roleMap.get(role) || 0) + 1);
        }
      });

      const studentProfessionalSplit = Array.from(roleMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalParticipants) * 100)
        }));

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
        studentProfessionalSplit,
        acquisitionChannels,
        totalParticipants
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!engagementData || engagementData.totalParticipants === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Registration Data Available
          </h3>
          <p className="text-gray-600">
            Event engagement charts will appear once participants register for events.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Event Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {engagementData.totalParticipants.toLocaleString()}
          </div>
          <p className="text-gray-600">Total Event Participants</p>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementData.countries} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip 
                  formatter={(value, name) => [`${value} participants`, 'Count']}
                  labelFormatter={(label) => `Country: ${label}`}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Careers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" />
              Top Career Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementData.careers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} participants`, 'Count']}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" />
              Top Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementData.organizations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} participants`, 'Count']}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student vs Professional Split */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Participant Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={engagementData.studentProfessionalSplit}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {engagementData.studentProfessionalSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Channels */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              How Participants Found Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementData.acquisitionChannels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} participants`, 'Count']}
                />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
