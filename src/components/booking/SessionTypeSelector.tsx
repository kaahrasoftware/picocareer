
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionTypeSelectorProps {
  onSessionTypeSelect: (typeId: string) => void;
}

export function SessionTypeSelector({ onSessionTypeSelect }: SessionTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>("");

  const sessionTypes = [
    { id: "consultation", name: "Consultation", duration: 30, price: 50 },
    { id: "coaching", name: "Coaching Session", duration: 60, price: 100 },
    { id: "review", name: "Portfolio Review", duration: 45, price: 75 }
  ];

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
    onSessionTypeSelect(typeId);
  };

  return (
    <div className="space-y-3">
      {sessionTypes.map((type) => (
        <Card 
          key={type.id} 
          className={`cursor-pointer transition-colors ${
            selectedType === type.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
          }`}
          onClick={() => handleSelect(type.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{type.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{type.duration} minutes</span>
              <span className="font-semibold">${type.price}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
