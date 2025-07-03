
import { jsPDF } from 'jspdf';
import { CareerChatMessage } from '@/types/database/analytics';

export function generatePDF(messages: CareerChatMessage[]): jsPDF {
  // Create a PDF document with the chat results
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Career Assessment Results", 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Find recommendation messages
  const recommendationMessages = messages.filter(
    msg => msg.message_type === 'recommendation' || 
            msg.metadata?.rawResponse?.type === 'recommendation' ||
            msg.metadata?.rawResponse?.type === 'assessment_result'
  );
  
  let yPos = 40;
  
  // If we have recommendations
  if (recommendationMessages.length > 0) {
    // Add a section for career recommendations
    doc.setFontSize(16);
    doc.text("Career Recommendations", 20, yPos);
    yPos += 10;
    
    // Extract and add careers
    doc.setFontSize(12);
    recommendationMessages.forEach(msg => {
      if (msg.metadata?.rawResponse?.content?.careers) {
        const careers = msg.metadata.rawResponse.content.careers;
        careers.forEach((career: any, index: number) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(`${index + 1}. ${career.title} (${career.match_percentage}% match)`, 20, yPos);
          yPos += 7;
          
          doc.setFont(undefined, 'normal');
          
          // Break description into multiple lines
          const description = career.description;
          const descLines = doc.splitTextToSize(description, 170);
          doc.text(descLines, 20, yPos);
          yPos += 7 * descLines.length + 5;
        });
      }
    });
  }
  
  // Add user responses section
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.text("Your Assessment Responses", 20, yPos);
  yPos += 10;
  
  // Extract user responses
  const userMessages = messages.filter(msg => msg.message_type === 'user');
  
  doc.setFontSize(12);
  userMessages.forEach((msg, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`Q${index + 1}:`, 20, yPos);
    yPos += 7;
    
    doc.setFont(undefined, 'normal');
    const response = msg.content;
    const respLines = doc.splitTextToSize(response, 170);
    doc.text(respLines, 20, yPos);
    yPos += 7 * respLines.length + 5;
  });
  
  return doc;
}

export function downloadPdfResults(messages: CareerChatMessage[]): void {
  try {
    const doc = generatePDF(messages);
    doc.save("career-assessment-results.pdf");
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error("Failed to generate PDF");
  }
}
