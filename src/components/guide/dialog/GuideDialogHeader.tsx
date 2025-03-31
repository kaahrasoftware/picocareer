
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideDialogHeaderProps {
  title: string;
  description: string;
  onClose: () => void;
}

export function GuideDialogHeader({ 
  title, 
  description, 
  onClose 
}: GuideDialogHeaderProps) {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full" 
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  );
}
