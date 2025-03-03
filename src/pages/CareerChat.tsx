
import React from 'react';
import { PicoChat } from '@/components/PicoChat';

export default function CareerChat() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Career Guide</h1>
        <p className="text-muted-foreground mt-2">
          Chat with Pico, our AI assistant, to discover personalized career recommendations based on your interests and skills.
        </p>
      </div>
      
      <PicoChat />
    </div>
  );
}
