
import React, { useState } from 'react';
import { PicoChatContainer } from '@/components/career-chat/PicoChatContainer';
import { ChatSidebar } from '@/components/career-chat/ChatSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, Brain, Sparkles } from 'lucide-react';

export default function CareerChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // On mobile, sidebar is closed by default
  const showSidebar = isDesktop ? isSidebarOpen : isSidebarOpen && false;

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50 to-white">
      {/* Welcome Banner - Visible before starting a chat */}
      <div className="max-w-6xl mx-auto pt-6 px-4 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center">
            <div className="absolute right-0 top-0 w-32 h-32 md:w-64 md:h-64 opacity-10">
              <Brain className="w-full h-full" />
            </div>
            
            <div className="flex-1 text-white z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                AI Career Guide
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-3">Discover Your Ideal Career Path</h1>
              <p className="text-white/90 mb-6 max-w-lg">
                Our AI-powered career assistant will analyze your skills, preferences, and goals to 
                suggest personalized career paths that match your unique profile.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
                  <span className="text-sm font-medium">Personalized Recommendations</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
                  <span className="text-sm font-medium">Skills Assessment</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
                  <span className="text-sm font-medium">Downloadable Report</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-24 h-24 md:w-32 md:h-32 text-white/80" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Main Chat Interface */}
      <div className="relative flex max-w-6xl mx-auto px-4 lg:px-8">
        {/* Sidebar */}
        <div 
          className={`${
            showSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0 -translate-x-full'
          } transition-all duration-300 z-20 absolute lg:relative border-r bg-white/80 backdrop-blur-sm shadow-sm flex-shrink-0 h-[calc(100vh-180px)] rounded-l-xl`}
        >
          <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        {/* Main chat content */}
        <div className="flex-1 transition-all duration-300">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
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
