
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MatchesSectionProps {
  items: Array<{ title: string; reasoning: string }>;
  title: string;
}

export function MatchesSection({ items, title }: MatchesSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ScrollArea className="h-[400px] rounded-md">
        <ul className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="border-b pb-4 last:border-0">
              <h4 className="font-semibold text-base">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
