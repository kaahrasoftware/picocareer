
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye, Download, TrendingUp } from 'lucide-react';

interface TopUser {
  profile_id: string;
  full_name: string;
  avatar_url?: string;
  total_views: number;
  total_downloads: number;
  total_interactions: number;
  unique_resources: number;
}

interface TopUsersCardProps {
  users: TopUser[];
  title?: string;
  className?: string;
}

export function TopUsersCard({ users, title = "Top Active Users", className }: TopUsersCardProps) {
  if (!users || users.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No user activity data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.slice(0, 5).map((user, index) => (
            <div
              key={user.profile_id}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border"
            >
              <div className="flex items-center gap-2">
                <Badge 
                  variant={index === 0 ? "default" : "secondary"} 
                  className={`w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs ${
                    index === 0 ? 'bg-amber-500 hover:bg-amber-600' : ''
                  }`}
                >
                  {index + 1}
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="text-xs">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name}
                  </span>
                  {index === 0 && <Crown className="h-3 w-3 text-amber-500" />}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{user.total_views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{user.total_downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{user.unique_resources} resources</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {user.total_interactions}
                </div>
                <div className="text-xs text-gray-500">interactions</div>
              </div>
            </div>
          ))}
        </div>
        
        {users.length > 5 && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Showing top 5 of {users.length} active users
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
