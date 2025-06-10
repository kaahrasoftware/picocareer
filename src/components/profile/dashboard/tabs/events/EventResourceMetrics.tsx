
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, HardDrive, Download, Shield, TrendingUp, RefreshCw, Eye, Activity } from 'lucide-react';
import { ColorfulStatCard } from '@/components/ui/colorful-stat-card';
import { Button } from '@/components/ui/button';
import { useEventResourceStats } from '@/hooks/useEventResourceStats';

const MODERN_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold text-primary">{payload[0].value}</span>
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function EventResourceMetrics() {
  const { data: stats, isLoading, refetch, isRefetching } = useEventResourceStats();

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

  if (!stats || stats.totalResources === 0) {
    return (
      <div className="space-y-6">
        {/* Empty state with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorfulStatCard
            title="Total Resources"
            value={0}
            icon={<FileText className="h-5 w-5" />}
            variant="blue"
            footer="across all events"
          />
          <ColorfulStatCard
            title="Storage Used"
            value="0 B"
            icon={<HardDrive className="h-5 w-5" />}
            variant="green"
            footer="total file storage"
          />
          <ColorfulStatCard
            title="Resource Types"
            value={0}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="purple"
            footer="different types"
          />
        </div>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Event Resources Available
            </h3>
            <p className="text-gray-600 mb-4">
              Resource analytics will appear once events have uploaded resources.
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

  return (
    <div className="space-y-6">
      {/* Modern Summary Cards */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Event Resource Analytics</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ColorfulStatCard
          title="Total Resources"
          value={stats.totalResources.toLocaleString()}
          icon={<FileText className="h-5 w-5" />}
          variant="blue"
          footer="across all events"
        />
        
        <ColorfulStatCard
          title="Storage Used"
          value={formatFileSize(stats.totalStorage)}
          icon={<HardDrive className="h-5 w-5" />}
          variant="green"
          footer={`avg ${formatFileSize(stats.averageFileSize)}/file`}
        />
        
        <ColorfulStatCard
          title="Total Views"
          value={stats.totalViews?.toLocaleString() || '0'}
          icon={<Eye className="h-5 w-5" />}
          variant="purple"
          footer="resource views"
        />

        <ColorfulStatCard
          title="Total Downloads"
          value={stats.totalDownloads?.toLocaleString() || '0'}
          icon={<Download className="h-5 w-5" />}
          variant="orange"
          footer="file downloads"
        />
      </div>

      {/* Modern Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resource Types Distribution */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <div className="p-2 bg-blue-200 rounded-full">
                <FileText className="h-4 w-4" />
              </div>
              Resource Types
            </CardTitle>
            <p className="text-sm text-blue-600">{stats.resourceTypes.length} different types</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.resourceTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Access Levels Distribution */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <div className="p-2 bg-green-200 rounded-full">
                <Shield className="h-4 w-4" />
              </div>
              Access Levels
            </CardTitle>
            <p className="text-sm text-green-600">Resource accessibility</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.accessLevels}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="count"
                  nameKey="level"
                >
                  {stats.accessLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MODERN_COLORS[index % MODERN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Engaging Resources */}
        {stats.topEngagingResources && stats.topEngagingResources.length > 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <div className="p-2 bg-purple-200 rounded-full">
                  <Activity className="h-4 w-4" />
                </div>
                Most Engaging
              </CardTitle>
              <p className="text-sm text-purple-600">Top resources by engagement</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.topEngagingResources} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    width={100} 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-medium text-gray-900">{label}</p>
                            <p className="text-sm text-gray-600">
                              Total Engagement: <span className="font-semibold text-primary">{payload[0].value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="engagement" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Events by Resources */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <div className="p-2 bg-orange-200 rounded-full">
                <TrendingUp className="h-4 w-4" />
              </div>
              Top Events
            </CardTitle>
            <p className="text-sm text-orange-600">Most resource-rich events</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.resourcesPerEvent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="title" 
                  width={100} 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm text-gray-600">
                            Resources: <span className="font-semibold text-primary">{payload[0].value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement by Type */}
        {stats.engagementByType && stats.engagementByType.length > 0 && (
          <Card className="lg:col-span-2 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <div className="p-2 bg-cyan-200 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Engagement by Resource Type
              </CardTitle>
              <p className="text-sm text-cyan-600">Views and downloads by type</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.engagementByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" fill="#06b6d4" name="Views" />
                  <Bar dataKey="downloads" fill="#10b981" name="Downloads" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
