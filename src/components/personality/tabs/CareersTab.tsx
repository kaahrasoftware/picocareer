
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Career {
  title: string;
  reasoning: string;
}

interface CareersTabProps {
  careers: Career[];
}

export function CareersTab({ careers }: CareersTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recommended Career Paths</h3>
      <ScrollArea className="h-[400px] rounded-md">
        <ul className="space-y-6">
          {careers.map((career, index) => (
            <li key={index} className="border-b pb-4 last:border-0">
              <h4 className="font-semibold text-base">{career.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{career.reasoning}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
