
import React from 'react';
import { TrendingUp, BookOpen, ArrowUpRight } from 'lucide-react';
import { GrowthArea } from '../../utils/recommendationParser';

interface GrowthAreasSectionProps {
  growthAreas: GrowthArea[];
}

export function GrowthAreasSection({ growthAreas }: GrowthAreasSectionProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-white to-green-50 p-5 rounded-lg shadow-sm border border-green-100">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          Suggested Growth Areas
        </h3>
        
        <div className="space-y-3">
          {growthAreas.map((area, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-md p-3 border border-green-100 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium text-gray-800">{area.skill}</h4>
                <span className={`text-xs ${
                  area.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : area.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                } px-2 py-1 rounded-full`}>
                  {area.priority.charAt(0).toUpperCase() + area.priority.slice(1)} Priority
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{area.description}</p>
              
              {area.resources && area.resources.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                    Resources
                  </h5>
                  <ul className="space-y-1">
                    {area.resources.map((resource, resourceIdx) => (
                      <li 
                        key={resourceIdx} 
                        className="text-xs text-gray-600 flex items-center"
                      >
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
