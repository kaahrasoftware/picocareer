
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Calendar, Users } from "lucide-react";
import { ScholarshipDetailsDialog } from "@/components/scholarships/ScholarshipDetailsDialog";

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  application_url: string;
  status: string;
  provider_name: string;
  created_at: string;
  updated_at: string;
}

export function ScholarshipManagementTab() {
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: scholarships, isLoading } = useQuery({
    queryKey: ['admin-scholarships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleViewDetails = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setDetailsDialogOpen(true);
  };

  const handleScholarshipUpdated = () => {
    // Refetch scholarships
    window.location.reload();
  };

  if (isLoading) {
    return <div>Loading scholarships...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Scholarship Management</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Scholarship
        </Button>
      </div>

      <div className="grid gap-6">
        {scholarships?.map((scholarship) => (
          <Card key={scholarship.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scholarship.provider_name}
                  </p>
                </div>
                <Badge 
                  variant={scholarship.status === 'Active' ? 'default' : 'secondary'}
                >
                  {scholarship.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{scholarship.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${scholarship.amount?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(scholarship)}
                  >
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedScholarship && (
        <ScholarshipDetailsDialog
          scholarship={selectedScholarship}
          open={detailsDialogOpen}
          onOpenChange={(open) => {
            setDetailsDialogOpen(open);
            if (!open) setSelectedScholarship(null);
          }}
        />
      )}
    </div>
  );
}
