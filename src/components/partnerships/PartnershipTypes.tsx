
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, School, Wrench, Building, User, Users } from 'lucide-react';

const partnershipTypes = [
  {
    id: 'university',
    title: 'Universities',
    description: 'Enhance student career services with comprehensive guidance tools and industry connections.',
    icon: GraduationCap,
    benefits: ['Student career assessments', 'Alumni mentorship network', 'Job placement support'],
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'high_school',
    title: 'High Schools',
    description: 'Help students make informed decisions about their future education and career paths.',
    icon: School,
    benefits: ['College preparation tools', 'Career exploration resources', 'Counselor training'],
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'trade_school',
    title: 'Trade Schools',
    description: 'Connect students with skilled trade opportunities and industry partnerships.',
    icon: Wrench,
    benefits: ['Industry connections', 'Skills assessment tools', 'Job placement services'],
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'organization',
    title: 'Organizations',
    description: 'Access qualified talent and enhance your recruitment and employee development.',
    icon: Building,
    benefits: ['Talent pipeline access', 'Recruitment tools', 'Employee development'],
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'individual',
    title: 'Individuals',
    description: 'Join as a mentor or career coach to make a difference in students\' lives.',
    icon: User,
    benefits: ['Mentorship opportunities', 'Professional networking', 'Personal branding'],
    color: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'nonprofit',
    title: 'Nonprofits',
    description: 'Expand your impact through career development and educational initiatives.',
    icon: Users,
    benefits: ['Community outreach', 'Educational programs', 'Social impact'],
    color: 'bg-indigo-50 border-indigo-200'
  }
];

export function PartnershipTypes() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work with various types of organizations to create meaningful career development opportunities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnershipTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card key={type.id} className={`h-full transition-all duration-300 hover:shadow-lg ${type.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-white rounded-lg p-3 mr-4">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{type.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {type.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
