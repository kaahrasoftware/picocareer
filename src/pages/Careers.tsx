
import React from 'react';
import { CareerHeader } from '@/components/career/CareerHeader';
import { CareerResults } from '@/components/career/CareerResults';

export default function Careers() {
  return (
    <div className="min-h-screen">
      <CareerHeader />
      <CareerResults />
    </div>
  );
}
