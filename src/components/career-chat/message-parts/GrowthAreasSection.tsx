
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface GrowthArea {
  area: string;
  description: string;
}

interface GrowthAreasSectionProps {
  areas: GrowthArea[];
}

export function GrowthAreasSection({ areas }: GrowthAreasSectionProps) {
  return (
    <div className="bg-gradient-to-r from-white to-green-50 p-5 rounded-lg shadow-sm border border-green-100 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
        Suggested Growth Areas
      </h3>
      <div className="space-y-3">
        {areas.map((area, idx) => (
          <div key={idx} className="bg-white rounded-md p-3 border border-green-100 transition-all hover:shadow-md">
            <h4 className="font-medium text-gray-800">{area.area}</h4>
            <p className="text-sm text-gray-600 mt-1">{area.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
