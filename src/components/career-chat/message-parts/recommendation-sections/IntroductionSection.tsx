
import React from 'react';
import { CalendarDays, Info } from 'lucide-react';
import { TestResultIntroduction } from '../../utils/recommendationParser';

interface IntroductionSectionProps {
  introduction: TestResultIntroduction;
}

export function IntroductionSection({ introduction }: IntroductionSectionProps) {
  return (
    <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        {introduction.title}
      </h2>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
        <span>Completed on {introduction.completionDate}</span>
      </div>
      
      {introduction.summary && (
        <p className="text-gray-700 mb-4">{introduction.summary}</p>
      )}
      
      <div className="flex items-start mt-4 bg-blue-50 p-3 rounded-md">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          {introduction.overallInsight}
        </p>
      </div>
    </div>
  );
}
