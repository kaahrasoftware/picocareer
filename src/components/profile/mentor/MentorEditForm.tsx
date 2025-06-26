import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function MentorEditForm() {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="session-types">
          <AccordionTrigger>Session Types</AccordionTrigger>
          <AccordionContent>
            {/* Session types content */}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            {/* Availability content */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
