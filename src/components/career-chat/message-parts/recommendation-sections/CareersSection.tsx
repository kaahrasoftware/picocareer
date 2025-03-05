
import React from 'react';
import { Briefcase, Award, GraduationCap, CheckCircle } from 'lucide-react';
import { CareerRecommendation } from '../../utils/recommendationParser';

interface CareersSectionProps {
  careers: CareerRecommendation[];
}

export function CareersSection({ careers }: CareersSectionProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Briefcase className="h-5 w-5 text-primary mr-2" />
          Top Career Matches
        </h3>
        
        <div className="space-y-3">
          {careers.map((career, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-md p-4 border ${idx < 3 ? 'border-amber-200' : 'border-blue-100'} transition-all hover:shadow-md ${idx < 3 ? 'bg-amber-50/30' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {idx < 3 && <Award className="h-4 w-4 text-amber-500" />}
                  <h4 className="font-medium text-gray-800">{career.title}</h4>
                </div>
                <span className={`text-xs ${idx < 3 ? 'bg-amber-100 text-amber-800' : 'bg-primary/20 text-primary'} px-2 py-1 rounded-full font-medium`}>
                  {career.match}% Match
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{career.reasoning}</p>
              
              {career.keySkills && career.keySkills.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Key Skills
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {career.keySkills.map((skill, skillIdx) => (
                      <span 
                        key={skillIdx} 
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {career.education && (
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <GraduationCap className="h-3 w-3 mr-1 text-blue-500" />
                    Education
                  </h5>
                  <p className="text-xs text-gray-600">{career.education}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
