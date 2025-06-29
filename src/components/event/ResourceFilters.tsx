
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Upload } from 'lucide-react';

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedAccess: string;
  onAccessChange: (value: string) => void;
  onExport?: () => void;
  onBulkUpload?: () => void;
}

export function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedAccess,
  onAccessChange,
  onExport,
  onBulkUpload
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAccess} onValueChange={onAccessChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="participants_only">Participants</SelectItem>
          </SelectContent>
        </Select>

        {onBulkUpload && (
          <Button variant="outline" size="sm" onClick={onBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
