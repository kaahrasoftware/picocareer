
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px]" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubs?.map((hub) => (
          <Card
            key={hub.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
            onClick={() => navigate(`/hubs/${hub.id}`)}
            style={{
              borderColor: hub.brand_colors?.primary || '#9b87f5',
              borderWidth: '1px',
              background: `linear-gradient(to bottom right, ${hub.brand_colors?.primary}08, ${hub.brand_colors?.secondary}08)`,
            }}
          >
            {hub.banner_url ? (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={hub.banner_url}
                  alt={`${hub.name} banner`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div 
                className="h-48 w-full bg-gradient-to-r flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${hub.brand_colors?.primary || '#9b87f5'}, ${hub.brand_colors?.secondary || '#7E69AB'})`
                }}
              >
                <Globe className="h-12 w-12 text-white" />
              </div>
            )}

            <CardHeader 
              className="relative pb-4"
              style={{
                borderBottom: `1px solid ${hub.brand_colors?.primary}20`
              }}
            >
              <div className="flex items-start gap-4">
                <div className="relative -mt-12">
                  {hub.logo_url ? (
                    <img
                      src={hub.logo_url}
                      alt={`${hub.name} logo`}
                      className="h-16 w-16 rounded-lg border-4 border-background bg-background object-cover shadow-md"
                      style={{
                        borderColor: hub.brand_colors?.primary || '#9b87f5'
                      }}
                    />
                  ) : (
                    <div 
                      className="h-16 w-16 rounded-lg border-4 border-background flex items-center justify-center shadow-md"
                      style={{ 
                        backgroundColor: hub.brand_colors?.accent || '#8B5CF6',
                        borderColor: hub.brand_colors?.primary || '#9b87f5'
                      }}
                    >
                      <span className="text-2xl font-bold text-white">
                        {hub.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle 
                    className="text-xl font-bold"
                    style={{
                      color: hub.brand_colors?.primary || '#9b87f5'
                    }}
                  >
                    {hub.name}
                  </CardTitle>
                  <div 
                    className="text-sm px-2 py-1 rounded-full inline-block mt-1"
                    style={{ 
                      backgroundColor: `${hub.brand_colors?.secondary || '#7E69AB'}15`,
                      color: hub.brand_colors?.secondary || '#7E69AB',
                      border: `1px solid ${hub.brand_colors?.secondary}30`
                    }}
                  >
                    {hub.type}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p 
                className="text-sm line-clamp-3"
                style={{
                  color: hub.brand_colors?.secondary || '#7E69AB'
                }}
              >
                {hub.description || 'No description available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
