import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnershipApplicationForm } from "./PartnershipApplicationForm";
import { CheckCircle, Clock, Shield } from "lucide-react";
export function ApplicationFormSection() {
  const [showForm, setShowForm] = useState(false);
  return <section id="application-form" className="py-24 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto relative">
        {!showForm ? <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 mx-auto w-fit">
                <Shield className="h-4 w-4" />
                Ready to Get Started?
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Transform Education Together
              </CardTitle>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Start your partnership journey today. Our streamlined application takes about 10-15 minutes to complete.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mb-3" />
                  <span className="font-medium text-gray-800">Multi-step Process</span>
                  <span className="text-sm text-gray-600 mt-1">Guided application flow</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
                  <Clock className="h-8 w-8 text-cyan-600 mb-3" />
                  <span className="font-medium text-gray-800">Save Progress</span>
                  <span className="text-sm text-gray-600 mt-1">Return anytime to continue</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <Shield className="h-8 w-8 text-purple-600 mb-3" />
                  <span className="font-medium text-gray-800">No Commitment</span>
                  <span className="text-sm text-gray-600 mt-1">Explore options freely</span>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-12 py-4 text-lg shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border-0" onClick={() => setShowForm(true)}>
                Start Partnership Application
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Secure application • GDPR compliant • No spam, ever
              </p>
            </CardContent>
          </Card> : <Card className="bg-white border-0 shadow-2xl">
            <CardContent className="p-0">
              <PartnershipApplicationForm onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>}
      </div>
    </section>;
}