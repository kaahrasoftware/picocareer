import jsPDF from 'jspdf';
import { PDFExportData, PDFGenerationOptions } from '@/types/pdf';

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 25;
  private currentY: number = 25;
  
  // Modern color palette (brand colors)
  private colors = {
    primary: [0, 166, 212] as number[],        // #00A6D4
    primaryDark: [1, 33, 105] as number[],     // #012169
    secondary: [248, 250, 252] as number[],    // Light background
    text: [15, 23, 42] as number[],            // Dark text
    textMuted: [71, 85, 105] as number[],      // Muted text
    border: [226, 232, 240] as number[],       // Light border
    success: [34, 197, 94] as number[],        // Green for progress
    accent: [99, 102, 241] as number[]         // Purple accent
  };

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
    this.currentY = 30;
    
    // Modern hero section with gradient background effect
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, 0, this.pageWidth, 80, 'F');
    
    // Large PicoCareer logo/title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(36);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, this.currentY + 25);
    
    // Subtitle with modern styling
    this.currentY += 35;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 166, 212);
    this.doc.text('Career Assessment Results', this.margin, this.currentY);
    
    // Modern card for main title
    this.currentY = 100;
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 45);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Your Personalized Career Report', this.margin + 20, this.currentY + 25);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(14);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Discover careers that match your unique profile and interests', this.margin + 20, this.currentY + 38);
    
    // Statistics cards
    this.currentY += 70;
    this.addStatisticsCards(data);
    
    // Assessment summary section
    this.currentY += 80;
    this.addSummarySection(data);
    
    // Professional call-to-action
    this.currentY += 60;
    this.addCallToAction();
  }
  
  private addModernCard(x: number, y: number, width: number, height: number, fillColor?: number[]): void {
    // Card shadow effect
    this.doc.setFillColor(0, 0, 0, 0.05);
    this.doc.rect(x + 1, y + 1, width, height, 'F');
    
    // Card background
    if (fillColor) {
      this.doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    } else {
      this.doc.setFillColor(255, 255, 255);
    }
    this.doc.rect(x, y, width, height, 'F');
    
    // Card border
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, y, width, height, 2, 2, 'S');
  }
  
  private addStatisticsCards(data: PDFExportData): void {
    const cardWidth = (this.pageWidth - 4 * this.margin) / 3;
    const cardHeight = 50;
    
    // Total Recommendations Card
    this.addModernCard(this.margin, this.currentY, cardWidth, cardHeight, [248, 250, 252]);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(28);
    this.doc.setTextColor(0, 166, 212);
    this.doc.text(data.recommendations.length.toString(), this.margin + 15, this.currentY + 25);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Career Matches', this.margin + 15, this.currentY + 38);
    
    // Completion Date Card
    const completedDate = new Date(data.completedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    this.addModernCard(this.margin + cardWidth + 10, this.currentY, cardWidth, cardHeight, [248, 250, 252]);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 166, 212);
    this.doc.text(completedDate, this.margin + cardWidth + 25, this.currentY + 25);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Assessment Date', this.margin + cardWidth + 25, this.currentY + 38);
    
    // Profile Type Card
    if (data.detectedProfileType) {
      this.addModernCard(this.margin + 2 * (cardWidth + 10), this.currentY, cardWidth, cardHeight, [248, 250, 252]);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(0, 166, 212);
      const profileText = this.doc.splitTextToSize(data.detectedProfileType, cardWidth - 20);
      this.doc.text(profileText, this.margin + 2 * (cardWidth + 10) + 15, this.currentY + 22);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(12);
      this.doc.setTextColor(71, 85, 105);
      this.doc.text('Profile Type', this.margin + 2 * (cardWidth + 10) + 15, this.currentY + 38);
    }
  }
  
  private addSummarySection(data: PDFExportData): void {
    // Section header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Assessment Overview', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setDrawColor(0, 166, 212);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin, this.currentY, this.margin + 100, this.currentY);
    
    this.currentY += 20;
    
    // Content card
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 45);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(13);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('This comprehensive assessment has analyzed your responses and identified career paths', this.margin + 20, this.currentY + 18);
    this.doc.text('that align with your skills, interests, and professional goals. Each recommendation', this.margin + 20, this.currentY + 30);
    this.doc.text('includes detailed insights to help guide your career decisions.', this.margin + 20, this.currentY + 42);
  }
  
  private addCallToAction(): void {
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, [0, 166, 212]);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Ready to explore your career options?', this.margin + 20, this.currentY + 20);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.text('Review each recommendation on the following pages for detailed insights.', this.margin + 20, this.currentY + 30);
  }

  private addCareerRecommendation(recommendation: any, rank: number): void {
    this.currentY = 30;
    
    // Modern page header
    this.addModernPageHeader(rank);
    this.currentY += 50; // Add space after header
    
    // Hero section for career
    this.addCareerHero(recommendation, rank);
    this.currentY += 80; // Add space after hero section
    
    // Match score with modern design
    this.addModernMatchScore(recommendation.matchScore);
    this.currentY += 70; // Add space after match score
    
    // Career description card
    this.addDescriptionCard(recommendation);
    // currentY is updated inside addDescriptionCard
    this.currentY += 20; // Add spacing after description
    
    // Reasoning section
    if (recommendation.reasoning) {
      this.addReasoningSection(recommendation.reasoning);
      // currentY is updated inside addReasoningSection
      this.currentY += 20; // Add spacing after reasoning
    }
    
    // Career details grid
    this.addModernCareerDetails(recommendation);
    // currentY is updated inside addModernCareerDetails
  }
  
  private addModernPageHeader(rank: number): void {
    // Header background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // Logo and page indicator
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, 25);
    
    // Page indicator
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text(`Career Recommendation ${rank}`, this.pageWidth - this.margin - 80, 25);
  }
  
  private addCareerHero(recommendation: any, rank: number): void {
    const cardHeight = 70;
    
    // Hero card
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight);
    
    // Rank badge
    this.doc.setFillColor(0, 166, 212);
    this.doc.circle(this.margin + 25, this.currentY + 30, 15, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(rank.toString(), this.margin + 20, this.currentY + 35);
    
    // Career title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(22);
    this.doc.setTextColor(15, 23, 42);
    const titleLines = this.doc.splitTextToSize(recommendation.title, this.pageWidth - 120);
    this.doc.text(titleLines, this.margin + 50, this.currentY + 25);
    
    // Calculate title height for proper positioning
    const titleHeight = titleLines.length * 8;
    
    // Category or industry badge
    if (recommendation.category || recommendation.industry) {
      this.doc.setFillColor(99, 102, 241);
      this.doc.roundedRect(this.margin + 50, this.currentY + 25 + titleHeight + 5, 80, 12, 6, 6, 'F');
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(recommendation.category || recommendation.industry || 'Professional', this.margin + 60, this.currentY + 32 + titleHeight + 5);
    }
  }
  
  private addDescriptionCard(recommendation: any): void {
    // Calculate required height for description
    const descriptionLines = this.doc.splitTextToSize(recommendation.description, this.pageWidth - 80);
    const cardHeight = Math.max(50, descriptionLines.length * 6 + 25);
    
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight);
    
    // Section header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Career Overview', this.margin + 20, this.currentY + 18);
    
    // Description text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text(descriptionLines, this.margin + 20, this.currentY + 35);
    
    this.currentY += cardHeight;
  }
  
  private addReasoningSection(reasoning: string): void {
    const reasoningLines = this.doc.splitTextToSize(reasoning, this.pageWidth - 80);
    const cardHeight = Math.max(45, reasoningLines.length * 6 + 25);
    
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight, [254, 249, 195]); // Light yellow
    
    // Icon effect
    this.doc.setFillColor(99, 102, 241);
    this.doc.circle(this.margin + 25, this.currentY + 20, 8, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('?', this.margin + 22, this.currentY + 24);
    
    // Section header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Why This Career Matches You', this.margin + 45, this.currentY + 18);
    
    // Reasoning text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text(reasoningLines, this.margin + 20, this.currentY + 35);
    
    this.currentY += cardHeight;
  }

  private addModernMatchScore(score: number): void {
    // Match score card
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50);
    
    // Circular progress indicator
    const centerX = this.margin + 50;
    const centerY = this.currentY + 25;
    const radius = 18;
    
    // Background circle
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(3);
    this.doc.circle(centerX, centerY, radius, 'S');
    
    // Progress arc (simplified as partial circle)
    const progressAngle = (score / 100) * 360;
    this.doc.setDrawColor(34, 197, 94);
    this.doc.setLineWidth(4);
    
    // Draw progress segments
    for (let i = 0; i < progressAngle; i += 10) {
      const startAngle = (i - 90) * Math.PI / 180;
      const endAngle = (Math.min(i + 8, progressAngle) - 90) * Math.PI / 180;
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      this.doc.line(x1, y1, x2, y2);
    }
    
    // Score text in center
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text(`${score}%`, centerX - 8, centerY + 3);
    
    // Match label and details
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Compatibility Score', this.margin + 85, this.currentY + 20);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    const matchText = score >= 80 ? 'Excellent Match' : score >= 65 ? 'Good Match' : score >= 50 ? 'Moderate Match' : 'Potential Match';
    this.doc.text(matchText, this.margin + 85, this.currentY + 35);
  }

  private addModernCareerDetails(recommendation: any): void {
    // Grid of detail cards
    const cardWidth = (this.pageWidth - 3 * this.margin) / 2;
    const cardHeight = 55;
    const spacing = 15;
    
    let row = 0;
    let col = 0;
    const startY = this.currentY;
    
    // Salary Range Card
    if (recommendation.salaryRange) {
      const x = this.margin + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);
      
      this.addModernCard(x, y, cardWidth, cardHeight);
      this.addDetailCardContent('💰', 'Salary Range', recommendation.salaryRange, x, y);
      
      col = col === 0 ? 1 : 0;
      if (col === 0) row++;
    }
    
    // Growth Outlook Card
    if (recommendation.growthOutlook) {
      const x = this.margin + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);
      
      this.addModernCard(x, y, cardWidth, cardHeight);
      this.addDetailCardContent('📈', 'Growth Outlook', recommendation.growthOutlook, x, y);
      
      col = col === 0 ? 1 : 0;
      if (col === 0) row++;
    }
    
    // Time to Entry Card
    if (recommendation.timeToEntry) {
      const x = this.margin + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);
      
      this.addModernCard(x, y, cardWidth, cardHeight);
      this.addDetailCardContent('⏱️', 'Time to Entry', recommendation.timeToEntry, x, y);
      
      col = col === 0 ? 1 : 0;
      if (col === 0) row++;
    }
    
    // Work Environment Card
    if (recommendation.workEnvironment) {
      const x = this.margin + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);
      
      this.addModernCard(x, y, cardWidth, cardHeight);
      this.addDetailCardContent('🏢', 'Work Environment', recommendation.workEnvironment, x, y);
      
      col = col === 0 ? 1 : 0;
      if (col === 0) row++;
    }
    
    // Update currentY to be after the detail cards
    this.currentY = startY + (row + (col > 0 ? 1 : 0)) * (cardHeight + spacing) + 20;
    
    // Skills and Education sections
    this.addSkillsAndEducation(recommendation);
  }
  
  private addDetailCardContent(icon: string, title: string, content: string, x: number, y: number): void {
    // Icon placeholder (using bullet point since emojis might not render)
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 166, 212);
    this.doc.text('●', x + 15, y + 20);
    
    // Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text(title, x + 25, y + 20);
    
    // Content
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(71, 85, 105);
    const cardWidth = (this.pageWidth - 3 * this.margin) / 2;
    const contentLines = this.doc.splitTextToSize(content, cardWidth - 40);
    
    // Display content with proper line spacing
    contentLines.slice(0, 3).forEach((line: string, index: number) => {
      this.doc.text(line, x + 15, y + 35 + index * 5);
    });
  }
  
  private addSkillsAndEducation(recommendation: any): void {
    const hasSkills = recommendation.requiredSkills && recommendation.requiredSkills.length > 0;
    const hasEducation = recommendation.educationRequirements && recommendation.educationRequirements.length > 0;
    
    if (!hasSkills && !hasEducation) return;
    
    const cardWidth = this.pageWidth - 2 * this.margin;
    
    // Calculate required height based on content
    const maxSkills = hasSkills ? Math.min(6, recommendation.requiredSkills.length) : 0;
    const maxEducation = hasEducation ? Math.min(4, recommendation.educationRequirements.length) : 0;
    const maxItems = Math.max(maxSkills, maxEducation);
    const cardHeight = Math.max(90, 50 + maxItems * 6);
    
    this.addModernCard(this.margin, this.currentY, cardWidth, cardHeight);
    
    // Section header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Requirements & Skills', this.margin + 20, this.currentY + 22);
    
    const leftColumn = this.margin + 20;
    const rightColumn = this.pageWidth / 2 + 10;
    
    // Skills section
    if (hasSkills) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(15, 23, 42);
      this.doc.text('Key Skills:', leftColumn, this.currentY + 40);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(71, 85, 105);
      
      recommendation.requiredSkills.slice(0, 6).forEach((skill: string, index: number) => {
        this.doc.text(`• ${skill}`, leftColumn + 5, this.currentY + 52 + index * 6);
      });
    }
    
    // Education section
    if (hasEducation) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(15, 23, 42);
      this.doc.text('Education:', rightColumn, this.currentY + 40);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(71, 85, 105);
      
      recommendation.educationRequirements.slice(0, 4).forEach((req: string, index: number) => {
        this.doc.text(`• ${req}`, rightColumn + 5, this.currentY + 52 + index * 6);
      });
    }
    
    this.currentY += cardHeight + 20;
  }

  private addContactPage(): void {
    this.currentY = 30;
    
    // Modern header (without rank parameter for contact page)
    this.addContactPageHeader();
    this.currentY += 50;
    
    // Hero section
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(28);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Ready to Take the Next Step?', this.margin + 25, this.currentY + 35);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(14);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Connect with PicoCareer for personalized career guidance and support', this.margin + 25, this.currentY + 55);
    
    this.currentY += 100;
    
    // Contact cards
    this.addContactCards();
    this.currentY += 110; // Add space after contact cards
    
    // Resources section
    this.addResourcesSection();
    this.currentY += 80; // Add space after resources
    
    // Final CTA
    this.addFinalCTA();
    
    this.addModernFooter();
  }
  
  private addContactPageHeader(): void {
    // Header background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // Logo
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(1, 33, 105);
    this.doc.text('PicoCareer', this.margin, 25);
    
    // Page indicator
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Contact & Resources', this.pageWidth - this.margin - 70, 25);
  }
  
  private addContactCards(): void {
    const cardWidth = (this.pageWidth - 3 * this.margin) / 2;
    const cardHeight = 90;
    
    // Contact Card
    this.addModernCard(this.margin, this.currentY, cardWidth, cardHeight, [248, 250, 252]);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Get in Touch', this.margin + 20, this.currentY + 25);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('🌐 www.picocareer.com', this.margin + 20, this.currentY + 40);
    this.doc.text('📧 hello@picocareer.com', this.margin + 20, this.currentY + 55);
    this.doc.text('📞 1-800-PICO-CAREER', this.margin + 20, this.currentY + 70);
    
    // Support Card
    this.addModernCard(this.margin + cardWidth + 15, this.currentY, cardWidth, cardHeight, [248, 250, 252]);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Need Help?', this.margin + cardWidth + 35, this.currentY + 25);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('💬 Live Chat Support', this.margin + cardWidth + 35, this.currentY + 40);
    this.doc.text('📚 Career Resources Hub', this.margin + cardWidth + 35, this.currentY + 55);
    this.doc.text('🎯 One-on-One Coaching', this.margin + cardWidth + 35, this.currentY + 70);
  }
  
  private addResourcesSection(): void {
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 100);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(15, 23, 42);
    this.doc.text('Available Resources & Services', this.margin + 25, this.currentY + 25);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(71, 85, 105);
    
    const resources = [
      '🎯 Personalized Career Coaching Sessions',
      '📊 Industry Insights and Market Trends',
      '🎓 Educational Pathway Recommendations',
      '💼 Professional Development Plans',
      '🤝 Networking Opportunities',
      '📝 Resume and Portfolio Reviews'
    ];
    
    resources.forEach((resource, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = this.margin + 25 + col * ((this.pageWidth - 2 * this.margin) / 2);
      const y = this.currentY + 45 + row * 15;
      this.doc.text(resource, x, y);
    });
  }
  
  private addFinalCTA(): void {
    this.addModernCard(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, [0, 166, 212]);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Start Your Career Journey Today!', this.margin + 25, this.currentY + 25);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.text('Visit www.picocareer.com to explore more opportunities and connect with our experts.', this.margin + 25, this.currentY + 40);
  }

  private addSimpleFooter(): void {
    const footerY = this.pageHeight - 25;
    
    // Modern footer line
    this.doc.setDrawColor(0, 166, 212);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
    
    // Footer text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(71, 85, 105);
    this.doc.text('Generated by PicoCareer - www.picocareer.com', this.margin, footerY + 10);
    
    const now = new Date().toLocaleDateString('en-US');
    this.doc.text(`Generated on ${now}`, this.pageWidth - this.margin - 50, footerY + 10);
  }
  
  private addModernFooter(): void {
    const footerY = this.pageHeight - 35;
    
    // Footer background
    this.doc.setFillColor(1, 33, 105);
    this.doc.rect(0, footerY, this.pageWidth, 35, 'F');
    
    // Footer content
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('PicoCareer', this.margin, footerY + 15);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.text('Empowering careers through intelligent assessment', this.margin, footerY + 25);
    
    const now = new Date().toLocaleDateString('en-US');
    this.doc.text(`Generated on ${now}`, this.pageWidth - this.margin - 50, footerY + 15);
    this.doc.text('www.picocareer.com', this.pageWidth - this.margin - 50, footerY + 25);
  }
}