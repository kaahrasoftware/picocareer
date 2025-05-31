
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function OrganizationManagement() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Feature temporarily unavailable</p>
        </div>
      </div>

      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">Organization management feature is being updated</p>
          <p className="text-sm text-muted-foreground">This feature will be available soon with proper database integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
