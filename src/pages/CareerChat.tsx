
import React, { useState } from 'react';
import { PicoChatContainer } from '@/components/career-chat/PicoChatContainer';
import { ChatSidebar } from '@/components/career-chat/ChatSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export default function CareerChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // On mobile, sidebar is closed by default
  const showSidebar = isDesktop ? isSidebarOpen : isSidebarOpen && false;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex">
      {/* Sidebar */}
      <div 
        className={`${
          showSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0 -translate-x-full'
        } transition-all duration-300 z-20 absolute lg:relative border-r bg-white shadow-sm flex-shrink-0 h-full`}
      >
        <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      {/* Main chat content */}
      <div className="flex-1 transition-all duration-300">
        {/* Sidebar toggle on mobile */}
        <div className="p-2 lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8"
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </Button>
        </div>
        
        <PicoChatContainer
          isSidebarOpen={showSidebar}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
