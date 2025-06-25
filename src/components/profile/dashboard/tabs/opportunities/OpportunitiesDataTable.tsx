
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OpportunitiesDataTableProps {
  searchQuery: string;
  selectedType: string;
  selectedLocation: string;
}

export function OpportunitiesDataTable({ searchQuery, selectedType, selectedLocation }: OpportunitiesDataTableProps) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: opportunities = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-opportunities', searchQuery, selectedType, selectedLocation],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,provider_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedType && selectedType !== 'all') {
        query = query.eq('opportunity_type', selectedType);
      }

      if (selectedLocation && selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete opportunity",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedIds.length} opportunities deleted successfully`,
      });

      setSelectedIds([]);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete opportunities",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading opportunities...</div>;
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === opportunities.length && opportunities.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(opportunities.map(o => o.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(opportunity.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, opportunity.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== opportunity.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{opportunity.title}</TableCell>
                <TableCell>{opportunity.provider_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{opportunity.opportunity_type}</Badge>
                </TableCell>
                <TableCell>{opportunity.location}</TableCell>
                <TableCell>
                  <Badge 
                    variant={opportunity.status === 'Active' ? 'default' : 'secondary'}
                  >
                    {opportunity.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {opportunity.profiles ? 
                    `${opportunity.profiles.first_name} ${opportunity.profiles.last_name}` : 
                    'Unknown'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {opportunity.application_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(opportunity.application_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(opportunity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
