
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Rocket } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit Application",
    description: "Fill out our comprehensive partnership form with your organization details and goals.",
    color: "text-blue-500"
  },
  {
    icon: Users,
    title: "Initial Review",
    description: "Our team reviews your application and schedules a discovery call to discuss opportunities.",
    color: "text-green-500"
  },
  {
    icon: CheckCircle,
    title: "Partnership Agreement",
    description: "We work together to create a customized partnership agreement that benefits both parties.",
    color: "text-purple-500"
  },
  {
    icon: Rocket,
    title: "Launch & Grow",
    description: "Begin your partnership journey with ongoing support and regular progress reviews.",
    color: "text-pink-500"
  }
];

export function PartnershipSteps() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Partnership Process</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our streamlined process ensures a smooth partnership journey from application to launch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="relative border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-background rounded-full">
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
