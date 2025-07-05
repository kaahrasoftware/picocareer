
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Download, Calendar, Phone, Mail } from "lucide-react";
import { downloadPartnershipPDF } from "./utils/partnershipPdfGenerator";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  const handleDownloadConfirmation = () => {
    try {
      downloadPartnershipPDF();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Continue without PDF download
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-green-800">
                Application Submitted Successfully!
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600 mb-6">
            Thank you for your interest in partnering with PicoCareer. We've received your application and will review it carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              What Happens Next?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Initial review within 1-2 business days</li>
              <li>• Comprehensive evaluation within 3-5 business days</li>
              <li>• Follow-up call to discuss next steps</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                partnerships@picocareer.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                +1 (919) 443-5301
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownloadConfirmation}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Confirmation
          </Button>
          
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            Continue to Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
