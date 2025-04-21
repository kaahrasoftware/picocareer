
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { award, briefcase, calendarDays, book } from "lucide-react";
import { cn } from "@/lib/utils";

// Map resource keys to table details
const resourceConfigs = [
  {
    key: "scholarships",
    title: "Scholarships",
    description: "Find scholarships and financial aid opportunities to fund your education",
    icon: award,
    path: "/scholarships",
    gradient: "from-blue-500 to-blue-700",
    table: "scholarships",
    statusField: "status",
    statusValue: "Active"
  },
  {
    key: "opportunities",
    title: "Opportunities",
    description: "Discover internships, jobs, and other career development opportunities",
    icon: briefcase,
    path: "/opportunities",
    gradient: "from-purple-500 to-purple-700",
    table: "opportunities",
    statusField: "status",
    statusValue: "Approved"
  },
  {
    key: "events",
    title: "Events",
    description: "Join workshops, webinars, and networking events in your field",
    icon: calendarDays,
    path: "/event",
    gradient: "from-emerald-500 to-emerald-700",
    table: "events",
    statusField: "status",
    statusValue: "Approved"
  },
  {
    key: "blog",
    title: "Blog",
    description: "Read articles and insights about education, careers, and personal development",
    icon: book,
    path: "/blog",
    gradient: "from-rose-500 to-rose-700",
    table: "blogs",
    statusField: "status",
    statusValue: "Approved"
  }
];

export function ResourcesHighlightSection() {
  // Query resource counts efficiently with Promise.all
  const { data: counts = {}, isLoading } = useQuery({
    queryKey: ["resource-section-counts"],
    queryFn: async () => {
      const countResults = await Promise.all(resourceConfigs.map(async (rc) => {
        const { count, error } = await supabase
          .from(rc.table)
          .select("id", { count: "exact", head: true })
          .eq(rc.statusField, rc.statusValue);

        // fallback in case error
        return { key: rc.key, count: !error && typeof count === "number" ? count : 0 };
      }));
      // Transform the array to an object for quick lookup
      return countResults.reduce((obj, curr) => {
        obj[curr.key] = curr.count;
        return obj;
      }, {} as Record<string, number>);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Resources</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access valuable resources to support your academic and professional journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resourceConfigs.map((resource) => {
            const Icon = resource.icon;
            const count = counts[resource.key] ?? 0;
            return (
              <Link
                key={resource.path}
                to={resource.path}
                className="group relative overflow-hidden rounded-2xl p-8 transition-transform hover:-translate-y-1"
              >
                <div className={cn(
                  "absolute inset-0 opacity-90 bg-gradient-to-br",
                  resource.gradient
                )} />
                <div className="relative z-10 flex flex-col items-center text-white text-center space-y-4">
                  <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform flex flex-col items-center">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                    {resource.title}
                    {/* Count Badge */}
                    <span className="ml-2 bg-black/30 rounded-full px-2 py-0.5 text-xs font-semibold">
                      {isLoading ? "..." : count?.toLocaleString() }
                    </span>
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
