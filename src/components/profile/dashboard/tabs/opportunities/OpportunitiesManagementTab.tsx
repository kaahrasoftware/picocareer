
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Calendar, Building } from "lucide-react";

interface OpportunityWithAuthor {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  opportunity_type: string;
  deadline: string;
  status: string;
  created_at: string;
  author_id: string;
}

export function OpportunitiesManagementTab() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithAuthor | null>(null);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(item => ({
        ...item,
        organization: item.organization || 'Unknown Organization'
      })) || [];
    },
  });

  const handleEditOpportunity = (opportunityId: string) => {
    const opportunity = opportunities?.find(opp => opp.id === opportunityId);
    if (opportunity) {
      setSelectedOpportunity(opportunity);
    }
  };

  if (isLoading) {
    return <div>Loading opportunities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Opportunities Management</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      <div className="grid gap-6">
        {opportunities?.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.organization}
                  </p>
                </div>
                <Badge 
                  variant={opportunity.status === 'Active' ? 'default' : 'secondary'}
                >
                  {opportunity.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{opportunity.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {opportunity.opportunity_type}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditOpportunity(opportunity.id)}
                  >
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
    </div>
  );
}
