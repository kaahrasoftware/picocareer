
import { Target, Users, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function ValuesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "Striving for the highest quality in everything we do",
      bgClass: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      iconClass: "text-picocareer-primary",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building strong relationships and fostering collaboration",
      bgClass: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      iconClass: "text-picocareer-accent",
    },
    {
      icon: Flag,
      title: "Innovation",
      description: "Continuously improving and adapting to change",
      bgClass: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
      iconClass: "text-emerald-500",
    },
  ];

  return (
    <section className="pt-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Our Values</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          These core principles guide our mission and drive our commitment to excellence
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {values.map((value, index) => (
          <Card 
            key={index}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border-transparent ${
              hoveredIndex === index ? "scale-105" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${value.bgClass} opacity-70`} />
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${value.iconClass.split('-')[1]} to-transparent transform scale-x-0 transition-transform duration-300 ${
              hoveredIndex === index ? "scale-x-100" : ""
            }`} />
            
            <CardContent className="relative p-8 text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md transform transition-transform duration-300 ${
                hoveredIndex === index ? "rotate-12" : ""
              }`}>
                <value.icon className={`w-10 h-10 ${value.iconClass}`} />
              </div>
              
              <h3 className={`text-xl font-bold mb-3 transition-transform duration-300 ${
                hoveredIndex === index ? "transform translate-y-[-5px]" : ""
              }`}>
                {value.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
