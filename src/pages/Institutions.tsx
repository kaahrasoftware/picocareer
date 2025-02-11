
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";

export default function Institutions() {
  const navigate = useNavigate();

  const { data: institutions, isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('status', 'Approved')
        .order('name');

      if (error) throw error;
      return data as Institution[];
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
        <h1 className="text-3xl font-bold">Institutions</h1>
        <Button onClick={() => navigate('/institutions/new')}>
          Create Institution
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions?.map((institution) => (
          <Card
            key={institution.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/institutions/${institution.id}`)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                {institution.logo_url ? (
                  <img
                    src={institution.logo_url}
                    alt={`${institution.name} logo`}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{institution.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{institution.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {institution.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
