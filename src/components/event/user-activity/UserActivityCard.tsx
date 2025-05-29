
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Download, Clock, User, FileText, Film, Image, 
  Link, Music, Presentation 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivity {
  id: string;
  profile_id: string;
  resource_id: string;
  interaction_type: 'view' | 'download';
  created_at: string;
  metadata?: {
    source?: string;
    resource_type?: string;
    resource_title?: string;
  };
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface UserActivityCardProps {
  activities: UserActivity[];
  title?: string;
  className?: string;
}

const getResourceIcon = (type?: string) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case 'video': return <Film className={iconClass} />;
    case 'audio': return <Music className={iconClass} />;
    case 'document': return <FileText className={iconClass} />;
    case 'presentation': return <Presentation className={iconClass} />;
    case 'image': return <Image className={iconClass} />;
    case 'link': return <Link className={iconClass} />;
    default: return <FileText className={iconClass} />;
  }
};

const getInteractionIcon = (type: string) => {
  return type === 'download' ? 
    <Download className="h-3 w-3" /> : 
    <Eye className="h-3 w-3" />;
};

const getInteractionColor = (type: string) => {
  return type === 'download' ? 
    'bg-green-100 text-green-700 border-green-200' : 
    'bg-blue-100 text-blue-700 border-blue-200';
};

export function UserActivityCard({ activities, title = "Recent User Activity", className }: UserActivityCardProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No recent user activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.slice(0, 10).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={activity.profiles?.avatar_url} 
                  alt={activity.profiles?.full_name || 'User'} 
                />
                <AvatarFallback className="text-xs">
                  {(activity.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {activity.profiles?.full_name || 'Unknown User'}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getInteractionColor(activity.interaction_type)}`}
                  >
                    {getInteractionIcon(activity.interaction_type)}
                    <span className="ml-1 capitalize">{activity.interaction_type}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getResourceIcon(activity.metadata?.resource_type)}
                  <span className="truncate">
                    {activity.metadata?.resource_title || 'Resource'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
        
        {activities.length > 10 && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Showing 10 of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
