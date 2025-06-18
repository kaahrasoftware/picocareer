
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface OpportunityWithAuthor {
  id: string;
  title: string;
  description: string;
  deadline: string;
  created_at: string;
  status: string;
  company: {
    name: string;
  } | null;
  author: {
    full_name: string;
  } | null;
}

export function OpportunitiesDataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities', currentPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          deadline,
          created_at,
          status
        `)
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the expected interface
      return (data || []).map(item => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        deadline: item.deadline || '',
        created_at: item.created_at || '',
        status: item.status || '',
        company: null, // Set to null since we're not fetching company data
        author: null   // Set to null since we're not fetching author data
      })) as OpportunityWithAuthor[];
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {opportunity.company?.name && (
                      <span className="text-sm text-muted-foreground">
                        {opportunity.company.name}
                      </span>
                    )}
                    <Badge variant={opportunity.status === 'Active' ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {opportunity.description?.substring(0, 200)}
                {opportunity.description?.length > 200 ? '...' : ''}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Posted: {format(new Date(opportunity.created_at), 'MMM d, yyyy')}
                </span>
                {opportunity.deadline && (
                  <span>
                    Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              {opportunity.author?.full_name && (
                <div className="text-xs text-muted-foreground mt-1">
                  Posted by: {opportunity.author.full_name}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {opportunities.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No opportunities found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
