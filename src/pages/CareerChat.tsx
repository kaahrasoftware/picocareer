
import React from 'react';
import { MainLayout } from '@/router/layouts';
import PicoChat from '@/components/career-chat/PicoChat';

export default function CareerChat() {
  return (
    <MainLayout>
      <div className="career-chat-container">
        <PicoChat />
      </div>
    </MainLayout>
  );
}
