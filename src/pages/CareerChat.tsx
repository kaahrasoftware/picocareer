
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
    <div className="relative h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Main Chat Interface */}
      <div className="relative flex max-w-6xl mx-auto px-4 lg:px-8 h-full pt-4">
        {/* Sidebar */}
        <div 
          className={`${
            showSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0 -translate-x-full'
          } transition-all duration-300 z-20 absolute lg:relative border-r bg-white/80 backdrop-blur-sm shadow-sm flex-shrink-0 h-full rounded-l-xl`}
        >
          <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        {/* Main chat content */}
        <div className="flex-1 transition-all duration-300 h-full">
          {/* Sidebar toggle */}
          <div className="p-2 lg:hidden sticky top-0 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-9 w-9 bg-white/80 backdrop-blur-sm"
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </Button>
          </div>
          
          {/* Chat container with enhanced styling */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm h-full">
            <PicoChatContainer
              isSidebarOpen={showSidebar}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
