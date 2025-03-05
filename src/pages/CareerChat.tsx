
import React from 'react';
import PicoChat from '@/components/career-chat/PicoChat';
import { MainLayout } from '@/router/layouts';

export default function CareerChat() {
  return (
    <MainLayout>
      <div className="career-chat-container">
        <PicoChat />
      </div>
    </MainLayout>
  );
}
