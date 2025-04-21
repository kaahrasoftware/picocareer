
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StatisticsSection() {
  // Query for each resource count
  const { data, isLoading } = useQuery({
    queryKey: ["statistics-section-counts"],
    queryFn: async () => {
      const tables = [
        { table: "scholarships", statusField: "status", statusValue: "Active" },
        { table: "opportunities", statusField: "status", statusValue: "Active" },
        { table: "events", statusField: "status", statusValue: "Approved" },
        { table: "blogs", statusField: "status", statusValue: "Approved" }
      ];
      // Fetch counts in parallel
      const results = await Promise.all(
        tables.map(async ({ table, statusField, statusValue }) => {
          const { count, error } = await supabase
            .from(table)
            .select("id", { count: "exact", head: true })
            .eq(statusField, statusValue);
          return !error && typeof count === 'number' ? count : 0;
        })
      );
      return {
        scholarships: results[0],
        opportunities: results[1],
        events: results[2],
        blogs: results[3],
        total: results.reduce((a, b) => a + b, 0),
      };
    },
    staleTime: 60 * 1000 * 5,
  });

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {/* Scholarships */}
          <div>
            <div className="text-3xl font-bold text-primary">{isLoading ? "…" : data?.scholarships?.toLocaleString()}</div>
            <div className="mt-2 text-sm text-muted-foreground">Scholarships</div>
          </div>
          {/* Opportunities */}
          <div>
            <div className="text-3xl font-bold text-primary">{isLoading ? "…" : data?.opportunities?.toLocaleString()}</div>
            <div className="mt-2 text-sm text-muted-foreground">Opportunities</div>
          </div>
          {/* Events */}
          <div>
            <div className="text-3xl font-bold text-primary">{isLoading ? "…" : data?.events?.toLocaleString()}</div>
            <div className="mt-2 text-sm text-muted-foreground">Events</div>
          </div>
          {/* Resources */}
          <div>
            <div className="text-3xl font-bold text-primary">{isLoading ? "…" : data?.total?.toLocaleString()}</div>
            <div className="mt-2 text-sm text-muted-foreground">Resources</div>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground text-center">
          Explore scholarships, opportunities, events, and insightful blog posts to support your journey.
        </p>
      </div>
    </section>
  );
}
