
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";

export default function Hubs() {
  const navigate = useNavigate();

  const { data: hubs, isLoading } = useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('status', 'Approved')
        .order('name');

      if (error) throw error;
      return data as Hub[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hubs</h1>
        <Button onClick={() => navigate('/hubs/new')}>
          Create Hub
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs?.map((hub) => (
          <Card
            key={hub.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/hubs/${hub.id}`)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                {hub.logo_url ? (
                  <img
                    src={hub.logo_url}
                    alt={`${hub.name} logo`}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{hub.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{hub.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {hub.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
