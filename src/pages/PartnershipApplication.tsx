
import React from 'react';
import { PartnershipApplicationForm } from '@/components/partnerships/application/PartnershipApplicationForm';

export default function PartnershipApplication() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Partnership Application
            </h1>
            <p className="text-lg text-gray-600">
              Tell us about your organization and how you'd like to partner with PicoCareer
            </p>
          </div>
          
          <PartnershipApplicationForm />
        </div>
      </div>
    </div>
  );
}
