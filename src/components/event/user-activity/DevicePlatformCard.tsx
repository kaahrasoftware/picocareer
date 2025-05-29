
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, Monitor, Tablet, Globe, Chrome, 
  Wifi, MapPin 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeviceData {
  device_type: string;
  count: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  count: number;
  percentage: number;
}

interface DevicePlatformCardProps {
  deviceData: DeviceData[];
  browserData: BrowserData[];
  className?: string;
}

const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const BROWSER_COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
    case 'smartphone':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    case 'desktop':
    case 'computer':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

export function DevicePlatformCard({ deviceData, browserData, className }: DevicePlatformCardProps) {
  const hasData = deviceData?.length > 0 || browserData?.length > 0;

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device & Platform Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No device or platform data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Device & Platform Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Device Types */}
          {deviceData?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Device Types
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {deviceData.slice(0, 4).map((device, index) => (
                  <div
                    key={device.device_type}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div style={{ color: DEVICE_COLORS[index % DEVICE_COLORS.length] }}>
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 capitalize truncate">
                        {device.device_type}
                      </div>
                      <div className="text-xs text-gray-600">
                        {device.count} users ({device.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browser Usage */}
          {browserData?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Chrome className="h-4 w-4" />
                Browser Usage
              </h4>
              <div className="space-y-2">
                {browserData.slice(0, 3).map((browser, index) => (
                  <div
                    key={browser.browser}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: BROWSER_COLORS[index % BROWSER_COLORS.length] }}
                      />
                      <span className="text-xs font-medium text-gray-900 capitalize">
                        {browser.browser}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {browser.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Insights */}
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center p-2 text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Live Tracking
            </Badge>
            <Badge variant="outline" className="justify-center p-2 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Global Access
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
