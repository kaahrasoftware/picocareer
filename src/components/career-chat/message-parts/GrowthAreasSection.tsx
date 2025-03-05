
import React from 'react';
import { TrendingUp, AlertCircle, CircleAlert, CircleCheck } from 'lucide-react';

interface GrowthArea {
  skill: string;
  importance: string;
  description: string;
}

interface GrowthAreasSectionProps {
  areas: GrowthArea[];
}

export function GrowthAreasSection({ areas }: GrowthAreasSectionProps) {
  const getImportanceIcon = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <CircleAlert className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <CircleCheck className="h-4 w-4 text-green-500" />;
      default:
        return <CircleAlert className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-amber-50 p-5 rounded-lg shadow-sm border border-amber-100 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
        Suggested Growth Areas
      </h3>
      <div className="space-y-3">
        {areas.map((area, idx) => (
          <div key={idx} className="bg-white rounded-md p-4 border border-amber-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getImportanceIcon(area.importance)}
                <h4 className="font-medium text-gray-800">{area.skill}</h4>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                area.importance.toLowerCase() === 'high' 
                  ? 'bg-red-100 text-red-700' 
                  : area.importance.toLowerCase() === 'medium' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
              }`}>
                {area.importance.charAt(0).toUpperCase() + area.importance.slice(1)} Priority
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{area.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
