
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, CheckCircle, Handshake } from 'lucide-react';

const processSteps = [
  {
    step: 1,
    title: 'Submit Application',
    description: 'Complete our comprehensive partnership application form with your organization details and goals.',
    icon: FileText,
    timeframe: '5-10 minutes'
  },
  {
    step: 2,
    title: 'Initial Review',
    description: 'Our partnership team reviews your application and assesses the fit with our mission and values.',
    icon: MessageSquare,
    timeframe: '3-5 business days'
  },
  {
    step: 3,
    title: 'Partnership Discussion',
    description: 'We schedule a consultation to discuss specific partnership opportunities and customize benefits.',
    icon: CheckCircle,
    timeframe: '1-2 weeks'
  },
  {
    step: 4,
    title: 'Partnership Launch',
    description: 'Finalize partnership agreement and begin implementation with dedicated support from our team.',
    icon: Handshake,
    timeframe: '2-4 weeks'
  }
];

export function PartnershipProcess() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process ensures a smooth journey from application to active partnership
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.step} className="relative">
                  <Card className="h-full transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-purple-600" />
                      </div>
                      
                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                        {step.step}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {step.description}
                      </p>
                      
                      <div className="text-xs text-purple-600 bg-purple-50 rounded-full px-3 py-1 inline-block">
                        {step.timeframe}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-0.5 bg-purple-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
