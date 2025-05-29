
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { HubStorageMetrics } from '@/types/database/analytics';
import { format } from 'date-fns';

interface StorageUsageDetailsProps {
  storageMetrics: HubStorageMetrics;
}

export function StorageUsageDetails({ storageMetrics }: StorageUsageDetailsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Storage Usage Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last calculated: {format(new Date(storageMetrics.last_calculated_at), 'PPpp')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Resources</h3>
            <p className="text-2xl font-bold">{storageMetrics.resources_count}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Media Files</h3>
            <p className="text-2xl font-bold">{storageMetrics.logo_count + storageMetrics.banner_count}</p>
            <div className="flex flex-col mt-2 text-xs text-muted-foreground">
              <span>Logos: {storageMetrics.logo_count}</span>
              <span>Banners: {storageMetrics.banner_count}</span>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Announcements</h3>
            <p className="text-2xl font-bold">{storageMetrics.announcements_count}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Total Files</h3>
            <p className="text-2xl font-bold">{storageMetrics.file_count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
