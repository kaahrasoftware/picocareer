import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Mentors",
    value: "50+",
    description: "Experienced professionals ready to guide you",
    className: "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
  },
  {
    title: "Career Paths",
    value: "100+",
    description: "Diverse career opportunities to explore",
    className: "bg-gradient-to-br from-green-500/20 to-teal-500/20",
  },
  {
    title: "Academic Majors",
    value: "75+",
    description: "Fields of study to choose from",
    className: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
  },
  {
    title: "Success Rate",
    value: "92%",
    description: "Of mentees report positive career growth",
    className: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
  },
  {
    title: "Community",
    value: "1000+",
    description: "Active members in our growing network",
    className: "bg-gradient-to-br from-violet-500/20 to-indigo-500/20",
  },
];

export function StatisticsSection() {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold">
          Discover The Growing Ecosystem Of Opportunities And Support Available To You
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <Card
            key={item.title}
            className={cn(
              "relative overflow-hidden",
              "border border-white/10",
              "p-6 text-center",
              item.className
            )}
          >
            <div className="relative z-10 space-y-2">
              <h3 className="text-2xl font-bold">{item.value}</h3>
              <p className="text-lg font-semibold text-foreground/80">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}