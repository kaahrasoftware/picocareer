
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Major {
  title: string;
  reasoning: string;
}

interface MajorsTabProps {
  majors: Major[];
}

export function MajorsTab({ majors }: MajorsTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recommended Academic Majors</h3>
      <ScrollArea className="h-[400px] rounded-md">
        <ul className="space-y-6">
          {majors.map((major, index) => (
            <li key={index} className="border-b pb-4 last:border-0">
              <h4 className="font-semibold text-base">{major.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{major.reasoning}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
