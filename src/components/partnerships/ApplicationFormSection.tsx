
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnershipApplicationForm } from "./PartnershipApplicationForm";

export function ApplicationFormSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="application-form" className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="max-w-4xl mx-auto">
        {!showForm ? (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-purple-900 mb-4">
                Ready to Partner with Us?
              </CardTitle>
              <p className="text-xl text-gray-600">
                Start your partnership journey today. Our application takes about 10-15 minutes to complete.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Multi-step application process</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Save progress and return later</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>No commitment required</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                onClick={() => setShowForm(true)}
              >
                Start Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-0">
              <PartnershipApplicationForm onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
