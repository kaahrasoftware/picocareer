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
  private logoImage: string | null = null;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generatePDF(data: PDFExportData, options: PDFGenerationOptions = {}): Promise<void> {
    try {
      // Load logo first
      await this.loadLogo();
      
      // Set PDF metadata
      this.doc.setProperties({
        title: 'PicoCareer Assessment Results',
        subject: 'Career Assessment Report',
        author: 'PicoCareer',
        creator: 'PicoCareer Assessment Platform'
      });
      
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
    // Modern gradient header
    this.addGradientHeader();
    
    // PicoCareer logo and branding
    if (this.logoImage) {
      this.doc.addImage(this.logoImage, 'PNG', this.margin, 20, 25, 25);
    }
    
    // Company name and tagline
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PicoCareer', this.margin + 35, 35);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('AI-Powered Career Guidance', this.margin + 35, 45);
    
    // Hero section
    this.currentY = 90;
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.centerText('Your Career Journey', this.currentY);
    this.centerText('Starts Here', this.currentY + 15);
    
    this.currentY += 35;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.centerText('Personalized Career Assessment Results', this.currentY);
    
    // Modern assessment info cards
    this.currentY += 30;
    this.addModernInfoCards(data);
    
    // Achievement badge
    this.addAchievementBadge();
    
    // Modern disclaimer
    this.currentY = this.pageHeight - 35;
    this.doc.setFontSize(9);
    this.doc.setTextColor(120, 120, 120);
    this.centerText('This personalized report is generated using advanced AI analysis', this.currentY);
    this.centerText('and should be used as a comprehensive guide for career exploration.', this.currentY + 5);
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
    if (this.currentY > this.pageHeight - 150) {
      this.addNewPage();
    }
    
    // Enhanced career card
    const cardHeight = 130;
    const cardRadius = 8;
    
    // Card shadow effect
    this.doc.setFillColor(0, 0, 0);
    this.doc.setGState(this.doc.GState({ opacity: 0.08 }));
    this.doc.roundedRect(this.margin + 1, this.currentY + 1, this.pageWidth - 2 * this.margin, cardHeight, cardRadius, cardRadius, 'F');
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    // Card background
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight, cardRadius, cardRadius, 'F');
    
    // Card border
    this.doc.setDrawColor(230, 230, 230);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight, cardRadius, cardRadius, 'S');
    
    // Rank badge
    this.addRankBadge(rank, this.margin + 15, this.currentY + 15);
    
    // Career title
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(recommendation.title, this.margin + 50, this.currentY + 22);
    
    // Match score with enhanced progress bar
    this.addMatchScoreBar(recommendation.matchScore, this.currentY + 32);
    
    // Description with proper text wrapping
    this.doc.setTextColor(70, 70, 70);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    const descLines = this.doc.splitTextToSize(recommendation.description, this.pageWidth - 6 * this.margin);
    this.doc.text(descLines, this.margin + 15, this.currentY + 50);
    
    // Match reasoning without emoji
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(this.primaryColor);
    this.doc.text('Why this matches you:', this.margin + 15, this.currentY + 68);
    const reasoningLines = this.doc.splitTextToSize(recommendation.reasoning, this.pageWidth - 6 * this.margin);
    this.doc.text(reasoningLines, this.margin + 15, this.currentY + 78);
    
    this.currentY += cardHeight + 15;
    
    // Enhanced career details section
    this.addModernCareerDetails(recommendation);
    
    this.currentY += 25;
  }

  private addEnhancedCareerDetails(recommendation: any): void {
    const leftCol = this.margin + 10;
    const rightCol = this.pageWidth / 2 + 15;
    const startY = this.currentY;
    
    // Left column
    this.currentY = startY;
    
    if (recommendation.salaryRange) {
      this.addCleanDetailItem('Salary Range', recommendation.salaryRange, leftCol);
    }
    
    if (recommendation.growthOutlook) {
      this.addCleanDetailItem('Growth Outlook', recommendation.growthOutlook, leftCol);
    }
    
    if (recommendation.timeToEntry) {
      this.addCleanDetailItem('Time to Entry', recommendation.timeToEntry, leftCol);
    }
    
    // Right column
    const rightStartY = startY;
    this.currentY = rightStartY;
    
    if (recommendation.workEnvironment) {
      this.addCleanDetailItem('Work Environment', recommendation.workEnvironment, rightCol);
    }
    
    if (recommendation.requiredSkills && recommendation.requiredSkills.length > 0) {
      this.addCleanDetailItem('Key Skills', recommendation.requiredSkills.join(', '), rightCol);
    }
    
    if (recommendation.educationRequirements && recommendation.educationRequirements.length > 0) {
      this.addCleanDetailItem('Education Requirements', recommendation.educationRequirements.join(', '), rightCol);
    }
    
    // Set currentY to the maximum of both columns
    this.currentY = Math.max(this.currentY, startY + 40);
  }

  private addCleanDetailItem(label: string, value: string, x: number): void {
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text(`${label}:`, x, this.currentY);
    
    this.currentY += 6;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFontSize(10);
    
    const lines = this.doc.splitTextToSize(value, (this.pageWidth / 2) - 25);
    this.doc.text(lines, x, this.currentY);
    this.currentY += lines.length * 5 + 8;
  }

  private addFooterPage(): void {
    this.currentY = 40;
    
    // Modern thank you section with logo
    if (this.logoImage) {
      const logoSize = 30;
      const logoX = (this.pageWidth - logoSize) / 2;
      this.doc.addImage(this.logoImage, 'PNG', logoX, this.currentY, logoSize, logoSize);
      this.currentY += logoSize + 15;
    }
    
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.secondaryColor);
    this.centerText('Thank You for Choosing PicoCareer', this.currentY);
    
    this.currentY += 15;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.centerText('Your career journey is just beginning', this.currentY);
    
    // Modern next steps cards
    this.currentY += 30;
    this.addModernNextStepsCards();
    
    // Resources section
    this.currentY += 20;
    this.addResourcesSection();
    
    // Modern certification footer
    this.addModernCertificationFooter();
  }

  private addModernNextStepsCards(): void {
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.centerText('Your Next Steps', this.currentY);
    
    this.currentY += 20;
    
    const steps = [
      { title: 'Research Careers', desc: 'Explore recommended careers in detail and learn about industry trends' },
      { title: 'Build Networks', desc: 'Connect with industry professionals and seek mentorship opportunities' },
      { title: 'Develop Skills', desc: 'Identify skill gaps and pursue relevant education or training' },
      { title: 'Gain Experience', desc: 'Seek internships, volunteer work, and hands-on opportunities' }
    ];
    
    const cardWidth = (this.pageWidth - 5 * this.margin) / 2;
    const cardHeight = 35;
    
    steps.forEach((step, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const cardX = this.margin + col * (cardWidth + this.margin);
      const cardY = this.currentY + row * (cardHeight + 15);
      
      // Card background with subtle gradient
      this.doc.setFillColor(248, 250, 252);
      this.doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'F');
      this.doc.setDrawColor(220, 225, 235);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'S');
      
      // Step number
      this.doc.setFillColor(this.primaryColor);
      this.doc.circle(cardX + 15, cardY + 12, 8, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text((index + 1).toString(), cardX + 12, cardY + 16);
      
      // Title and description
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(step.title, cardX + 28, cardY + 12);
      
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(step.desc, cardWidth - 35);
      this.doc.text(descLines, cardX + 28, cardY + 20);
    });
    
    this.currentY += 2 * (cardHeight + 15) + 10;
  }

  private addResourcesSection(): void {
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.centerText('Additional Resources', this.currentY);
    
    this.currentY += 18;
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const resources = [
      'Email support: support@picocareer.com for personalized guidance',
      'Career resources: Visit www.picocareer.com/blog for insights',
      'Social media: Follow us for daily career tips and industry updates',
      'Community: Join our forum for peer support and networking'
    ];
    
    resources.forEach(resource => {
      this.centerText(resource, this.currentY);
      this.currentY += 10;
    });
  }

  private addModernCertificationFooter(): void {
    this.currentY = this.pageHeight - 70;
    
    // Modern gradient footer
    this.addGradientFooter();
    
    // Logo in footer
    if (this.logoImage) {
      this.doc.addImage(this.logoImage, 'PNG', this.margin + 10, this.currentY + 15, 20, 20);
    }
    
    // Certification text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Certified by PicoCareer', this.margin + 40, this.currentY + 20);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('AI-Powered Career Guidance Platform', this.margin + 40, this.currentY + 30);
    
    // Website and contact
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    const websiteX = this.pageWidth - this.margin - 60;
    this.doc.text('www.picocareer.com', websiteX, this.currentY + 20);
    this.doc.text('info@picocareer.com', websiteX, this.currentY + 30);
    
    // Generation timestamp
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(200, 200, 200);
    const timestamp = new Date().toLocaleString();
    this.centerText(`Generated on ${timestamp}`, this.currentY + 50);
  }

  private addGradientFooter(): void {
    const footerHeight = 60;
    const steps = 15;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(1 + ratio * 0);
      const g = Math.round(33 + ratio * 133);
      const b = Math.round(105 + ratio * 64);
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(this.margin, this.currentY + i * (footerHeight / steps), this.pageWidth - 2 * this.margin, footerHeight / steps + 1, 'F');
    }
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
    this.currentY = 20;
    
    // Add page header
    this.doc.setFontSize(10);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('PicoCareer Assessment Results', this.margin, 15);
    
    const pageNum = this.doc.internal.pages.length - 1;
    this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin - 20, 15);
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

  private async loadLogo(): Promise<void> {
    try {
      const response = await fetch('/lovable-uploads/d6b217eb-2cec-4933-b8ee-09a438e5d28d.png');
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          this.logoImage = reader.result as string;
          resolve();
        };
        reader.onerror = () => {
          console.warn('Could not load logo, using fallback');
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Could not load logo:', error);
    }
  }

  private addGradientHeader(): void {
    // Create gradient effect with multiple rectangles
    const headerHeight = 70;
    const steps = 20;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(0 + (1 - ratio) * 0);
      const g = Math.round(166 + (1 - ratio) * 60);
      const b = Math.round(212 + (1 - ratio) * 57);
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * (headerHeight / steps), this.pageWidth, headerHeight / steps + 1, 'F');
    }
  }

  private addModernInfoCards(data: PDFExportData): void {
    const cardWidth = (this.pageWidth - 3 * this.margin) / 2;
    const cardHeight = 35;
    
    // Left card - Assessment Info
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(this.margin, this.currentY, cardWidth, cardHeight, 5, 5, 'F');
    this.doc.setDrawColor(226, 232, 240);
    this.doc.roundedRect(this.margin, this.currentY, cardWidth, cardHeight, 5, 5, 'S');
    
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Assessment Details', this.margin + 8, this.currentY + 12);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const completedDate = new Date(data.completedAt).toLocaleDateString();
    this.doc.text(`Completed: ${completedDate}`, this.margin + 8, this.currentY + 20);
    this.doc.text(`${data.responses.length} Questions • ${data.recommendations.length} Matches`, this.margin + 8, this.currentY + 27);
    
    // Right card - Profile Type
    const rightCardX = this.margin + cardWidth + this.margin;
    this.doc.setFillColor(240, 253, 244);
    this.doc.roundedRect(rightCardX, this.currentY, cardWidth, cardHeight, 5, 5, 'F');
    this.doc.setDrawColor(187, 247, 208);
    this.doc.roundedRect(rightCardX, this.currentY, cardWidth, cardHeight, 5, 5, 'S');
    
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Your Profile', rightCardX + 8, this.currentY + 12);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    if (data.detectedProfileType) {
      const profileLabel = this.getProfileTypeLabel(data.detectedProfileType);
      this.doc.text(profileLabel, rightCardX + 8, this.currentY + 20);
      this.doc.text('AI-Detected Profile Type', rightCardX + 8, this.currentY + 27);
    }
    
    this.currentY += cardHeight + 20;
  }

  private addAchievementBadge(): void {
    const badgeY = this.currentY + 10;
    const badgeX = this.pageWidth / 2;
    
    // Badge background
    this.doc.setFillColor(this.primaryColor);
    this.doc.circle(badgeX, badgeY, 25, 'F');
    
    // Badge border
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(2);
    this.doc.circle(badgeX, badgeY, 25, 'S');
    
    // Badge text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.centerText('ASSESSMENT', badgeY - 3);
    this.centerText('COMPLETE', badgeY + 5);
    
    this.currentY += 35;
  }

  private addRankBadge(rank: number, x: number, y: number): void {
    // Badge background
    this.doc.setFillColor(this.primaryColor);
    this.doc.circle(x + 10, y + 8, 12, 'F');
    
    // Badge text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    const rankText = `#${rank}`;
    const textWidth = this.doc.getTextWidth(rankText);
    this.doc.text(rankText, x + 10 - textWidth/2, y + 12);
  }

  private addMatchScoreBar(score: number, y: number): void {
    const barWidth = 140;
    const barHeight = 10;
    const barX = this.pageWidth - this.margin - barWidth - 20;
    
    // Label
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Match Score:', barX - 35, y + 7);
    
    // Background bar with subtle shadow
    this.doc.setFillColor(230, 230, 230);
    this.doc.roundedRect(barX, y, barWidth, barHeight, 5, 5, 'F');
    
    // Progress bar with color coding
    const progressWidth = (score / 100) * barWidth;
    let progressColor = score >= 80 ? [34, 197, 94] : score >= 60 ? [0, 166, 212] : [251, 146, 60];
    this.doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
    this.doc.roundedRect(barX, y, progressWidth, barHeight, 5, 5, 'F');
    
    // Score text
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${score}%`, barX + barWidth + 8, y + 7);
  }

  private addModernCareerDetails(recommendation: any): void {
    const detailCards = [
      { label: 'Salary Range', value: recommendation.salaryRange },
      { label: 'Growth Outlook', value: recommendation.growthOutlook },
      { label: 'Time to Entry', value: recommendation.timeToEntry },
      { label: 'Work Environment', value: recommendation.workEnvironment }
    ].filter(card => card.value);
    
    if (detailCards.length === 0) return;
    
    const cardWidth = (this.pageWidth - 4 * this.margin) / 2;
    const cardHeight = 30;
    let cardX = this.margin + 10;
    let cardY = this.currentY;
    
    detailCards.forEach((card, index) => {
      if (index > 0 && index % 2 === 0) {
        cardY += cardHeight + 8;
        cardX = this.margin + 10;
      }
      
      // Card background with subtle styling
      this.doc.setFillColor(248, 250, 252);
      this.doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'F');
      this.doc.setDrawColor(220, 225, 235);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'S');
      
      // Content without icons
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${card.label}:`, cardX + 8, cardY + 12);
      
      this.doc.setTextColor(70, 70, 70);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      const valueLines = this.doc.splitTextToSize(card.value, cardWidth - 16);
      this.doc.text(valueLines, cardX + 8, cardY + 20);
      
      cardX += cardWidth + this.margin;
    });
    
    const rowCount = Math.ceil(detailCards.length / 2);
    this.currentY = cardY + cardHeight + 8;
  }
}