import jsPDF from 'jspdf';
import { PDFExportData, PDFGenerationOptions } from '@/types/pdf';

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generatePDF(data: PDFExportData, options: PDFGenerationOptions = {}): Promise<void> {
    try {
      // Set PDF metadata
      this.doc.setProperties({
        title: 'PicoCareer Assessment Results',
        subject: 'Career Assessment Report',
        author: 'PicoCareer',
        creator: 'PicoCareer Assessment Platform'
      });
      
      // Add cover page
      this.addCoverPage(data);
      
      // Add career recommendations (one per page)
      data.recommendations.forEach((recommendation, index) => {
        if (index > 0) {
          this.doc.addPage();
        } else {
          this.doc.addPage();
        }
        this.addCareerRecommendation(recommendation, index + 1);
        this.addSimpleFooter();
      });
      
      // Add final contact page
      this.doc.addPage();
      this.addContactPage();
      
      // Download the PDF
      const fileName = `PicoCareer_Assessment_Results_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private addCoverPage(data: PDFExportData): void {
    this.currentY = 40;
    
    // Simple header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(16);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('Career Assessment Results', this.margin, this.currentY);
    
    // Simple line separator
    this.currentY += 10;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    // Title section
    this.currentY += 30;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Your Personalized Career Recommendations', this.margin, this.currentY);
    
    // Assessment summary
    this.currentY += 25;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('Assessment Summary', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    
    const completedDate = new Date(data.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.doc.text(`Completed: ${completedDate}`, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.text(`Total Recommendations: ${data.recommendations.length}`, this.margin, this.currentY);
    this.currentY += 8;
    
    if (data.detectedProfileType) {
      this.doc.text(`Detected Profile: ${data.detectedProfileType}`, this.margin, this.currentY);
      this.currentY += 8;
    }
    
    // Instructions
    this.currentY += 20;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('How to Use This Report', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.line(this.margin, this.currentY, this.margin + 90, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(71, 85, 105);
    
    const instructions = [
      'Each career recommendation is presented on a separate page',
      'Match scores indicate how well each career aligns with your responses',
      'Review the requirements and next steps for careers that interest you',
      'Contact PicoCareer for additional guidance and resources'
    ];
    
    instructions.forEach((instruction) => {
      this.doc.text(`• ${instruction}`, this.margin, this.currentY);
      this.currentY += 7;
    });
  }

  private addCareerRecommendation(recommendation: any, rank: number): void {
    this.currentY = 40;
    
    // Simple header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(22);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 20;
    
    // Career title with simple numbering
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text(`${rank}. ${recommendation.title}`, this.margin, this.currentY);
    
    this.currentY += 20;
    
    // Simple match score
    this.addSimpleMatchScore(recommendation.matchScore);
    
    this.currentY += 25;
    
    // Career description
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(51, 65, 85);
    
    const descriptionLines = this.doc.splitTextToSize(recommendation.description, this.pageWidth - 2 * this.margin);
    this.doc.text(descriptionLines, this.margin, this.currentY);
    this.currentY += descriptionLines.length * 5 + 20;
    
    // Reasoning
    if (recommendation.reasoning) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(51, 65, 85);
      this.doc.text('Why this matches you:', this.margin, this.currentY);
      
      this.currentY += 10;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(71, 85, 105);
      
      const reasoningLines = this.doc.splitTextToSize(recommendation.reasoning, this.pageWidth - 2 * this.margin);
      this.doc.text(reasoningLines, this.margin, this.currentY);
      this.currentY += reasoningLines.length * 5 + 20;
    }
    
    // Career details
    this.addCareerDetails(recommendation);
  }

  private addSimpleMatchScore(score: number): void {
    const barWidth = 120;
    const barHeight = 8;
    const fillWidth = (score / 100) * barWidth;
    
    // Background
    this.doc.setFillColor(241, 245, 249);
    this.doc.rect(this.margin, this.currentY, barWidth, barHeight, 'F');
    
    // Fill
    this.doc.setFillColor(0, 166, 212);
    this.doc.rect(this.margin, this.currentY, fillWidth, barHeight, 'F');
    
    // Border
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, barWidth, barHeight, 'S');
    
    // Score text
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text(`${score}% Match`, this.margin + barWidth + 15, this.currentY + 6);
  }

  private addCareerDetails(recommendation: any): void {
    // Simple border around details
    const boxHeight = 120;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight);
    
    this.currentY += 15;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('Career Details', this.margin + 10, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(71, 85, 105);
    
    const leftColumn = this.margin + 10;
    const rightColumn = this.pageWidth / 2 + 10;
    let leftY = this.currentY;
    let rightY = this.currentY;
    
    // Left column
    if (recommendation.salaryRange) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Salary Range:', leftColumn, leftY);
      leftY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(recommendation.salaryRange, leftColumn, leftY);
      leftY += 12;
    }
    
    if (recommendation.timeToEntry) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Time to Entry:', leftColumn, leftY);
      leftY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(recommendation.timeToEntry, leftColumn, leftY);
      leftY += 12;
    }
    
    if (recommendation.growthOutlook) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Growth Outlook:', leftColumn, leftY);
      leftY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(recommendation.growthOutlook, leftColumn, leftY);
      leftY += 12;
    }
    
    // Right column
    if (recommendation.workEnvironment) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Work Environment:', rightColumn, rightY);
      rightY += 6;
      this.doc.setFont('helvetica', 'normal');
      const envLines = this.doc.splitTextToSize(recommendation.workEnvironment, (this.pageWidth / 2) - 30);
      this.doc.text(envLines, rightColumn, rightY);
      rightY += envLines.length * 6 + 6;
    }
    
    if (recommendation.requiredSkills && recommendation.requiredSkills.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Key Skills:', rightColumn, rightY);
      rightY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      
      recommendation.requiredSkills.slice(0, 5).forEach((skill: string) => {
        this.doc.text(`• ${skill}`, rightColumn, rightY);
        rightY += 5;
      });
      
      if (recommendation.requiredSkills.length > 5) {
        this.doc.text(`• ... and ${recommendation.requiredSkills.length - 5} more`, rightColumn, rightY);
        rightY += 6;
      }
      
      this.doc.setFontSize(11);
    }
    
    // Education requirements at bottom if space allows
    if (recommendation.educationRequirements && recommendation.educationRequirements.length > 0 && leftY < this.currentY + 80) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Education Requirements:', leftColumn, leftY);
      leftY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      
      recommendation.educationRequirements.slice(0, 3).forEach((req: string) => {
        this.doc.text(`• ${req}`, leftColumn, leftY);
        leftY += 5;
      });
    }
    
    this.currentY += boxHeight;
  }

  private addContactPage(): void {
    this.currentY = 40;
    
    // Simple header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(22);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 30;
    
    // Contact information section
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('Next Steps & Contact Information', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.line(this.margin, this.currentY, this.margin + 150, this.currentY);
    
    this.currentY += 25;
    
    // Simple contact box
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80);
    
    this.currentY += 20;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(51, 65, 85);
    this.doc.text('Contact PicoCareer', this.margin + 15, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    
    this.doc.text('Website: www.picocareer.com', this.margin + 15, this.currentY);
    this.currentY += 8;
    this.doc.text('Email: hello@picocareer.com', this.margin + 15, this.currentY);
    
    this.currentY += 15;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Available Resources:', this.margin + 15, this.currentY);
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text('• Career coaching and guidance', this.margin + 20, this.currentY);
    this.currentY += 6;
    this.doc.text('• Industry insights and trends', this.margin + 20, this.currentY);
    this.currentY += 6;
    this.doc.text('• Educational pathway recommendations', this.margin + 20, this.currentY);
    
    this.addSimpleFooter();
  }

  private addSimpleFooter(): void {
    const footerY = this.pageHeight - 25;
    
    // Simple line separator
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
    
    // Footer text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 116, 139);
    this.doc.text('Generated by PicoCareer - www.picocareer.com', this.margin, footerY + 10);
    
    const now = new Date().toLocaleDateString('en-US');
    this.doc.text(`Generated on ${now}`, this.margin, footerY + 16);
  }
}