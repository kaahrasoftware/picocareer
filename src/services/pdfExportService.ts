import jsPDF from 'jspdf';
import { PDFExportData, PDFGenerationOptions } from '@/types/pdf';

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private readonly primaryColor = '#00A6D4';
  private readonly secondaryColor = '#012169';
  private readonly accentColor = '#000000';
  private readonly lightGray = '#F8F9FA';
  private readonly textColor = '#2D3748';
  private readonly logoUrl = '/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png';

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generatePDF(data: PDFExportData, options: PDFGenerationOptions = {}): Promise<void> {
    try {
      // Add cover page
      this.addCoverPage(data);
      
      // Add assessment summary
      this.addNewPage();
      this.addAssessmentSummary(data);
      
      // Add career recommendations
      for (let i = 0; i < data.recommendations.length; i++) {
        if (i > 0 || this.currentY > this.pageHeight - 80) {
          this.addNewPage();
        }
        this.addCareerRecommendation(data.recommendations[i], i + 1);
      }
      
      // Add footer page with branding
      this.addNewPage();
      this.addFooterPage();
      
      // Download the PDF
      const fileName = `PicoCareer_Assessment_Results_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private addCoverPage(data: PDFExportData): void {
    // Clean header with logo
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Add logo
    try {
      this.doc.addImage(this.logoUrl, 'PNG', this.margin, 10, 60, 20);
    } catch (error) {
      // Fallback to text if logo fails
      this.doc.setTextColor(this.primaryColor);
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PicoCareer', this.margin, 25);
    }
    
    // Subtitle in header
    this.doc.setTextColor(this.textColor);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Career Assessment Results', this.margin + 70, 25);
    
    // Modern hero section
    this.currentY = 70;
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.centerText('Your Career Assessment', this.currentY);
    
    this.currentY += 15;
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'normal');
    this.centerText('Personalized Results Report', this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setTextColor(120, 120, 120);
    this.centerText('Powered by AI Career Intelligence', this.currentY);
    
    // Key metrics cards
    this.currentY += 30;
    const cardWidth = (this.pageWidth - 2 * this.margin - 20) / 3;
    const cardHeight = 40;
    
    // Assessment completion card
    this.addMetricCard('Assessment Completed', new Date(data.completedAt).toLocaleDateString(), this.margin, cardWidth, cardHeight);
    
    // Questions answered card
    this.addMetricCard('Questions Answered', data.responses.length.toString(), this.margin + cardWidth + 10, cardWidth, cardHeight);
    
    // Career matches card
    this.addMetricCard('Career Matches', data.recommendations.length.toString(), this.margin + 2 * (cardWidth + 10), cardWidth, cardHeight);
    
    this.currentY += cardHeight + 20;
    
    // Profile type section
    if (data.detectedProfileType) {
      this.doc.setFillColor(this.lightGray);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 'F');
      
      this.currentY += 10;
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Profile Type', this.margin + 10, this.currentY);
      
      this.currentY += 8;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.textColor);
      const profileLabel = this.getProfileTypeLabel(data.detectedProfileType);
      this.doc.text(profileLabel, this.margin + 10, this.currentY);
      
      this.currentY += 15;
    }
    
    // Add disclaimer
    this.currentY = this.pageHeight - 40;
    this.doc.setFontSize(10);
    this.doc.setTextColor(120, 120, 120);
    this.centerText('This report is generated based on your assessment responses', this.currentY);
    this.centerText('and should be used as a guide for career exploration.', this.currentY + 6);
  }

  private addAssessmentSummary(data: PDFExportData): void {
    this.addSectionHeader('Assessment Overview');
    
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setTextColor(60, 60, 60);
    
    const text = `Based on your responses to ${data.responses.length} personalized questions, our AI system has analyzed your interests, skills, and preferences to generate ${data.recommendations.length} career recommendations tailored specifically for you.`;
    
    this.addParagraph(text);
    
    if (data.detectedProfileType) {
      this.currentY += 10;
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.secondaryColor);
      this.doc.text('Your Profile Type', this.margin, this.currentY);
      
      this.currentY += 10;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      const profileInfo = this.getProfileTypeInfo(data.detectedProfileType);
      this.addParagraph(profileInfo);
    }
  }

  private addCareerRecommendation(recommendation: any, rank: number): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.addNewPage();
    }
    
    // Career title with rank
    this.doc.setFillColor(this.primaryColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`#${rank} ${recommendation.title}`, this.margin + 5, this.currentY + 10);
    
    // Match score
    const scoreX = this.pageWidth - this.margin - 30;
    this.doc.text(`${recommendation.matchScore}%`, scoreX, this.currentY + 10);
    
    this.currentY += 20;
    
    // Description
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.addParagraph(recommendation.description);
    
    this.currentY += 5;
    
    // Match reasoning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text('Why this career matches you:', this.margin, this.currentY);
    
    this.currentY += 5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.addParagraph(recommendation.reasoning);
    
    // Career details in columns
    this.currentY += 10;
    this.addCareerDetails(recommendation);
    
    this.currentY += 15;
  }

  private addCareerDetails(recommendation: any): void {
    const leftCol = this.margin;
    const rightCol = this.pageWidth / 2 + 10;
    const startY = this.currentY;
    
    // Left column
    this.currentY = startY;
    
    if (recommendation.salaryRange) {
      this.addDetailItem('Salary Range', recommendation.salaryRange, leftCol);
    }
    
    if (recommendation.growthOutlook) {
      this.addDetailItem('Growth Outlook', recommendation.growthOutlook, leftCol);
    }
    
    if (recommendation.timeToEntry) {
      this.addDetailItem('Time to Entry', recommendation.timeToEntry, leftCol);
    }
    
    // Right column
    this.currentY = startY;
    
    if (recommendation.workEnvironment) {
      this.addDetailItem('Work Environment', recommendation.workEnvironment, rightCol);
    }
    
    if (recommendation.requiredSkills && recommendation.requiredSkills.length > 0) {
      this.addDetailItem('Key Skills', recommendation.requiredSkills.slice(0, 4).join(', '), rightCol);
    }
    
    if (recommendation.educationRequirements && recommendation.educationRequirements.length > 0) {
      this.addDetailItem('Education Requirements', recommendation.educationRequirements.slice(0, 2).join(', '), rightCol);
    }
    
    // Set currentY to the maximum of both columns
    this.currentY = Math.max(this.currentY, startY + 30);
  }

  private addDetailItem(label: string, value: string, x: number): void {
    // Clean card design for each detail item
    const cardWidth = (this.pageWidth / 2) - 30;
    this.doc.setFillColor(this.lightGray);
    this.doc.rect(x, this.currentY - 3, cardWidth, 18, 'F');
    this.doc.setDrawColor(230, 230, 230);
    this.doc.rect(x, this.currentY - 3, cardWidth, 18, 'S');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text(label, x + 5, this.currentY + 3);
    
    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.textColor);
    
    const lines = this.doc.splitTextToSize(value, cardWidth - 10);
    this.doc.text(lines, x + 5, this.currentY + 3);
    this.currentY += lines.length * 3 + 8;
  }

  private addMetricCard(title: string, value: string, x: number, width: number, height: number): void {
    // Card background
    this.doc.setFillColor(this.lightGray);
    this.doc.rect(x, this.currentY, width, height, 'F');
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, this.currentY, width, height, 'S');
    
    // Title
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    const titleX = x + width / 2 - this.doc.getTextWidth(title) / 2;
    this.doc.text(title, titleX, this.currentY + 15);
    
    // Value
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    const valueX = x + width / 2 - this.doc.getTextWidth(value) / 2;
    this.doc.text(value, valueX, this.currentY + 28);
  }

  private addFooterPage(): void {
    this.currentY = 50;
    
    // Thank you section
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.centerText('Thank You for Using PicoCareer', this.currentY);
    
    this.currentY += 20;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.centerText('We hope this assessment helps guide your career journey.', this.currentY);
    
    // Next steps section
    this.currentY += 30;
    this.addSectionHeader('Your Next Steps');
    
    this.currentY += 10;
    const nextSteps = [
      'Research your recommended careers in depth',
      'Connect with professionals in these fields',
      'Explore educational and certification requirements',
      'Consider internships or job shadowing opportunities',
      'Develop skills aligned with your target careers'
    ];
    
    nextSteps.forEach((step, index) => {
      // Clean numbered list
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.primaryColor);
      this.doc.text(`${index + 1}.`, this.margin, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.textColor);
      this.doc.text(step, this.margin + 10, this.currentY);
      this.currentY += 10;
    });
    
    // Professional footer with logo
    this.currentY = this.pageHeight - 60;
    this.doc.setFillColor(this.secondaryColor);
    this.doc.rect(0, this.currentY, this.pageWidth, 60, 'F');
    
    // Add logo in footer
    try {
      this.doc.addImage(this.logoUrl, 'PNG', this.margin, this.currentY + 10, 40, 13);
    } catch (error) {
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PicoCareer', this.margin, this.currentY + 20);
    }
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('AI-Powered Career Guidance', this.margin + 50, this.currentY + 20);
    this.doc.setFontSize(10);
    this.doc.text('www.picocareer.com', this.margin + 50, this.currentY + 35);
  }

  private addSectionHeader(title: string): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text(title, this.margin, this.currentY);
    
    // Add underline
    this.doc.setDrawColor(this.primaryColor);
    this.doc.line(this.margin, this.currentY + 2, this.margin + 60, this.currentY + 2);
    
    this.currentY += 8;
  }

  private addParagraph(text: string): void {
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 5 + 5;
  }

  private centerText(text: string, y: number): void {
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    this.doc.text(text, x, y);
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = 35;
    
    // Modern page header with logo
    this.doc.setDrawColor(240, 240, 240);
    this.doc.line(0, 30, this.pageWidth, 30);
    
    try {
      this.doc.addImage(this.logoUrl, 'PNG', this.margin, 8, 30, 10);
    } catch (error) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.primaryColor);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PicoCareer', this.margin, 18);
    }
    
    this.doc.setFontSize(9);
    this.doc.setTextColor(120, 120, 120);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Career Assessment Results', this.margin + 40, 18);
    
    const pageNum = this.doc.internal.pages.length - 1;
    this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin - 15, 18);
  }

  private getProfileTypeLabel(profileType: string): string {
    switch (profileType) {
      case 'middle_school': return 'Middle School Student';
      case 'high_school': return 'High School Student';
      case 'college': return 'College Student';
      case 'career_professional': return 'Career Professional';
      default: return 'General Profile';
    }
  }

  private getProfileTypeInfo(profileType: string): string {
    switch (profileType) {
      case 'middle_school':
        return 'Your recommendations are tailored for your academic stage, focusing on exploring interests and building foundational skills for future career planning.';
      case 'high_school':
        return 'Your recommendations focus on college preparation and career exploration, helping you make informed decisions about your educational and career path.';
      case 'college':
        return 'Your recommendations are designed for your academic and career transition phase, helping you prepare for the professional world.';
      case 'career_professional':
        return 'Your recommendations focus on career advancement and potential transitions, leveraging your existing experience and skills.';
      default:
        return 'Your recommendations are personalized based on your assessment responses and career interests.';
    }
  }
}