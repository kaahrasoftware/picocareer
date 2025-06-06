
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Calendar, Clock, Mail, Download, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { downloadPartnershipPDF } from "./utils/partnershipPdfGenerator";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const submissionTime = new Date().toLocaleString();

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDownloadPDF = () => {
    try {
      downloadPartnershipPDF();
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <div className="relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="animate-bounce">🎉</div>
              <div className="absolute top-4 right-4 animate-pulse">✨</div>
              <div className="absolute top-8 left-8 animate-bounce delay-100">🌟</div>
              <div className="absolute bottom-4 right-8 animate-pulse delay-200">🎊</div>
            </div>
          )}
          
          <ScrollArea className="h-[80vh] w-full">
            <div className="p-6 space-y-6">
              {/* Header Section */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Application Submitted Successfully!
                </DialogTitle>
                <p className="text-gray-600">
                  Thank you for your interest in partnering with PicoCareer. We're excited about the possibility of working together!
                </p>
              </div>

              {/* Submission Details Card */}
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-emerald-900 mb-2">Application Submitted</h4>
                    <p className="text-emerald-700">{submissionTime}</p>
                    <p className="text-emerald-600 text-sm mt-1">Status: Under Review</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">What's Next?</h4>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>• Initial review (1-2 business days)</li>
                          <li>• Team evaluation (3-5 business days)</li>
                          <li>• Partnership proposal call</li>
                          <li>• Contract negotiation if approved</li>
                          <li>• Implementation planning phase</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Stay Connected</h4>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <p>info@picocareer.com</p>
                          <p>+1 (919) 443-5301</p>
                          <p>Response within 24 hours</p>
                          <p>Monday-Friday, 9 AM - 6 PM EST</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Expected Response Time: 3-5 Business Days
                  </h4>
                  <p className="text-purple-700 text-sm">
                    Our partnership team will review your application and reach out with next steps
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your email for confirmation and updates</li>
                    <li>• Our team may request additional documentation</li>
                    <li>• Partnership agreements typically take 2-4 weeks to finalize</li>
                    <li>• All terms will be clearly outlined in our formal agreement</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Footer Buttons */}
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Confirmation
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  >
                    Close
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    We'll keep you updated on your partnership application status
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
