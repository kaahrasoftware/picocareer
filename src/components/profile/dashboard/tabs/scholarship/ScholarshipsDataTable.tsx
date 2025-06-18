
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScholarshipDetails } from "@/types/database/scholarships";

interface ScholarshipsDataTableProps {
  onEditScholarship: (scholarship: ScholarshipDetails) => void;
  onViewScholarship: (scholarship: ScholarshipDetails) => void;
  onDataChange: () => void;
}

export function ScholarshipsDataTable({
  onEditScholarship,
  onViewScholarship,
  onDataChange
}: ScholarshipsDataTableProps) {
  const { data: scholarships = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-scholarships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ScholarshipDetails[];
    }
  });

  const handleDelete = async (scholarshipId: string) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;
    
    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', scholarshipId);
      
      if (error) throw error;
      refetch();
      onDataChange();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
    }
  };

  if (isLoading) {
    return <div>Loading scholarships...</div>;
  }

  if (error) {
    return <div>Error loading scholarships: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {scholarships.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No scholarships found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Amount: {scholarship.amount} {scholarship.currency}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewScholarship(scholarship)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditScholarship(scholarship)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(scholarship.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{scholarship.description}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {scholarship.status} | Created: {new Date(scholarship.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
