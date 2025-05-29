
import { jsPDF } from 'jspdf';

export function generatePartnershipPDF(): jsPDF {
  const doc = new jsPDF();
  
  // Header with company branding
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text("PicoCareer", 20, 30);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text("Partnership Application Confirmation", 20, 40);
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  let yPos = 60;
  
  // Submission confirmation
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("Thank You for Your Partnership Interest!", 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Submission Date: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 10;
  doc.text("Status: Under Review", 20, yPos);
  yPos += 20;
  
  // Partnership process section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("What Happens Next?", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const nextSteps = [
    "1. Initial review by our partnership team (1-2 business days)",
    "2. Comprehensive evaluation of partnership proposal (3-5 business days)",
    "3. Follow-up contact with detailed partnership proposal",
    "4. Contract negotiation if partnership is approved",
    "5. Implementation planning and onboarding process"
  ];
  
  nextSteps.forEach(step => {
    doc.text(step, 25, yPos);
    yPos += 7;
  });
  
  yPos += 10;
  
  // Expected timeline
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Expected Response Time", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text("3-5 Business Days", 20, yPos);
  yPos += 7;
  doc.text("Our partnership team will review your application and reach out with next steps.", 20, yPos);
  yPos += 20;
  
  // Contact information
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Contact Information", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text("Email: info@picocareer.com", 20, yPos);
  yPos += 7;
  doc.text("Phone: +1 (919) 443-5301", 20, yPos);
  yPos += 7;
  doc.text("Business Hours: Monday-Friday, 9 AM - 6 PM EST", 20, yPos);
  yPos += 7;
  doc.text("Response Time: Within 24 hours", 20, yPos);
  yPos += 20;
  
  // Important notes
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Important Notes", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const notes = [
    "• Check your email regularly for updates and requests for additional information",
    "• Our team may request supplementary documentation during the review process",
    "• Partnership agreements typically require 2-4 weeks to finalize after approval",
    "• All partnership terms will be clearly outlined in our formal agreement"
  ];
  
  notes.forEach(note => {
    doc.text(note, 20, yPos);
    yPos += 6;
  });
  
  // Footer
  yPos = 280;
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.text("Thank you for considering PicoCareer as your partnership partner.", 20, yPos);
  doc.text("We look forward to exploring this opportunity with you.", 20, yPos + 5);
  
  return doc;
}

export function downloadPartnershipPDF(): void {
  try {
    const doc = generatePartnershipPDF();
    doc.save("PicoCareer-Partnership-Confirmation.pdf");
  } catch (error) {
    console.error('Error generating partnership PDF:', error);
    throw new Error("Failed to generate partnership confirmation PDF");
  }
}
