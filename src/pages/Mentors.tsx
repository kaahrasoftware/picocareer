
import React from 'react';
import { MentorListHeader } from '@/components/mentors/MentorListHeader';
import { MentorListContent } from '@/components/mentors/MentorListContent';

export default function Mentors() {
  return (
    <div className="min-h-screen">
      <MentorListHeader />
      <MentorListContent />
    </div>
  );
}
