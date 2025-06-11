
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface TokenShopHeaderProps {
  totalPackages: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function TokenShopHeader({ totalPackages, viewMode, onViewModeChange }: TokenShopHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Available Packages</h2>
        <p className="text-muted-foreground">
          {totalPackages} package{totalPackages !== 1 ? 's' : ''} available
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
