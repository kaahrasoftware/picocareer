
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      time: '5 minutes ago',
      icon: CheckCircle,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Opportunity',
      message: 'A new scholarship opportunity matches your profile.',
      time: '1 hour ago',
      icon: Info,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Session Reminder',
      message: 'You have a mentorship session scheduled for tomorrow.',
      time: '2 hours ago',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card key={notification.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {notification.time}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p>{notification.message}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
