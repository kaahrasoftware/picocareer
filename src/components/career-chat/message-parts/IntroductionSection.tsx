
import React from 'react';

interface IntroductionSectionProps {
  title: string;
  summary: string;
}

export function IntroductionSection({ title, summary }: IntroductionSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-blue-100 mb-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{summary}</p>
    </div>
  );
}
