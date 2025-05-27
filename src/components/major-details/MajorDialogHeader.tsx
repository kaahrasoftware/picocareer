import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, TrendingUp } from "lucide-react";

interface Major {
  id: string;
  title: string;
  description: string;
  featured?: boolean;
  careers_count?: number;
  average_salary?: number;
  demand_score?: number;
  code?: string;
  created_at?: string;
  updated_at?: string;
}

interface MajorDialogHeaderProps {
  major: Major;
}

export function MajorDialogHeader({ major }: MajorDialogHeaderProps) {
  return (
    <Card className="border-none shadow-none bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{major.title}</h2>
              <div className="flex items-center space-x-2 mt-2">
                {major.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 leading-relaxed">
          {major.description}
        </p>
      </CardContent>
    </Card>
  );
}
