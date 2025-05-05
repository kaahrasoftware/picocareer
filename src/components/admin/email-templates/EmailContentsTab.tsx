
import React, { useState } from "react";
import { EmailHtmlEditor } from "./EmailHtmlEditor";
import { Card } from "@/components/ui/card";

interface EmailContentsTabProps {
  adminId: string;
}

export function EmailContentsTab({ adminId }: EmailContentsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Email HTML Templates</h2>
        <p className="text-gray-500 mb-6">
          Customize the HTML structure of your email templates. Changes will be applied to all future emails of the selected content type.
        </p>
        
        <EmailHtmlEditor adminId={adminId} />
      </Card>
    </div>
  );
}
