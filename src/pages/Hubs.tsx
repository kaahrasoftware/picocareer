import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Globe, Search, Users, ExternalLink, ArrowRight, Filter, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
export default function Hubs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const {
    data: hubs,
    isLoading
  } = useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('hubs').select('*').eq('status', 'Approved').order('name');
      if (error) throw error;
      return data as unknown as Hub[];
    }
  });

  // Filter and search hubs
  const filteredHubs = useMemo(() => {
    if (!hubs) return [];
    return hubs.filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || hub.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || hub.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [hubs, searchQuery, selectedType]);

  // Get unique hub types for filter
  const hubTypes = useMemo(() => {
    if (!hubs) return [];
    return Array.from(new Set(hubs.map(hub => hub.type)));
  }, [hubs]);
  const LoadingSkeleton = () => <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[420px] rounded-xl" />)}
      </div>
    </div>;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <LoadingSkeleton />
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Discover Amazing Communities
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Explore Educational Hubs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Connect with institutions, find your perfect educational and professional match, and join thriving communities.</p>
          
          {/* Stats */}
          
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search hubs by name or description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base" />
          </div>
          <div className="flex gap-2">
            <Button variant={selectedType === "all" ? "default" : "outline"} onClick={() => setSelectedType("all")} className="whitespace-nowrap">
              All Types
            </Button>
            {hubTypes.map(type => <Button key={type} variant={selectedType === type ? "default" : "outline"} onClick={() => setSelectedType(type)} className="whitespace-nowrap">
                {type}
              </Button>)}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredHubs.length} of {hubs?.length || 0} hubs
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Hub Grid */}
        {filteredHubs.length === 0 ? <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Globe className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hubs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? `No hubs match your search for "${searchQuery}"` : "No hubs available at the moment"}
            </p>
            {searchQuery && <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHubs.map(hub => <Card key={hub.id} className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm overflow-hidden" onClick={() => navigate(`/hubs/${hub.id}`)}>
                {/* Banner */}
                <div className="relative h-48 overflow-hidden">
                  {hub.banner_url ? <img src={hub.banner_url} alt={`${hub.name} banner`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /> : <div className="h-full w-full flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${hub.brand_colors?.primary || '#00A6D4'}, ${hub.brand_colors?.secondary || '#012169'})`
            }}>
                      <Globe className="h-16 w-16 text-white/80" />
                    </div>}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Type Badge */}
                  <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-0">
                    {hub.type}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Logo and Title */}
                  <div className="flex items-start gap-4">
                    <div className="relative -mt-8 shrink-0">
                      {hub.logo_url ? <img src={hub.logo_url} alt={`${hub.name} logo`} className="h-16 w-16 rounded-xl border-4 border-background bg-background object-cover shadow-lg" /> : <div className="h-16 w-16 rounded-xl border-4 border-background flex items-center justify-center shadow-lg" style={{
                  backgroundColor: hub.brand_colors?.primary || '#00A6D4'
                }}>
                          <span className="text-2xl font-bold text-white">
                            {hub.name[0]}
                          </span>
                        </div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {hub.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {hub.description || 'Discover what this hub has to offer and connect with its community.'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      <span>Active Community</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {hub.website && <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={e => {
                e.stopPropagation();
                window.open(hub.website, '_blank');
              }}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </Button>}
                    {hub.apply_now_URL && <Button size="sm" className="flex-1 text-xs" onClick={e => {
                e.stopPropagation();
                window.open(hub.apply_now_URL, '_blank');
              }}>
                        Apply Now
                      </Button>}
                  </div>
                </div>
              </Card>)}
          </div>}
      </div>
    </div>;
}