
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School } from "@/types/database/schools";

interface SchoolsDataTableProps {
  onEditSchool: (school: School) => void;
  onViewSchool: (school: School) => void;
  onDataChange: () => void;
}

type SchoolStatus = 'Approved' | 'Pending' | 'Rejected';

export function SchoolsDataTable({
  onEditSchool,
  onViewSchool,
  onDataChange
}: SchoolsDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | 'all'>('all');

  const { data: schools = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-schools', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as School[];
    }
  });

  const handleDelete = async (schoolId: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (error) throw error;
      refetch();
      onDataChange();
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as SchoolStatus | 'all');
  };

  if (isLoading) {
    return <div>Loading schools...</div>;
  }

  if (error) {
    return <div>Error loading schools: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schools Grid */}
      {schools.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No schools found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schools.map((school) => (
            <Card key={school.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {school.location || 'Location not specified'} | {school.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSchool(school)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSchool(school)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(school.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {school.status} | Students: {school.student_population || 'N/A'}
                  {school.acceptance_rate && ` | Acceptance Rate: ${Math.round(school.acceptance_rate * 100)}%`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
