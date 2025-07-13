import html2canvas from 'html2canvas';
import { CareerRecommendation } from '@/types/assessment';

interface StoryScreenshotOptions {
  recommendation: CareerRecommendation;
  rank: number;
  brandingText?: string;
}

export const createStoryScreenshot = async (options: StoryScreenshotOptions): Promise<string> => {
  const { recommendation, rank, brandingText = "PicoCareer" } = options;
  
  // Create a temporary container for the story layout
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1080px';
  container.style.height = '1920px';
  container.style.background = 'linear-gradient(135deg, #00A6D4 0%, #012169 100%)';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.color = 'white';
  container.style.padding = '80px 60px';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  
  // Header with branding
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '60px';
  header.innerHTML = `
    <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">${brandingText}</div>
    <div style="font-size: 32px; opacity: 0.9;">Career Assessment Results</div>
  `;
  
  // Modern glassmorphism container
  const card = document.createElement('div');
  card.style.background = 'rgba(255, 255, 255, 0.1)';
  card.style.backdropFilter = 'blur(20px)';
  card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  card.style.borderRadius = '32px';
  card.style.padding = '60px 50px';
  card.style.color = 'white';
  card.style.textAlign = 'left';
  card.style.boxShadow = '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(0, 0, 0, 0.2)';
  card.style.margin = '40px 0';
  card.style.flex = '1';
  card.style.display = 'grid';
  card.style.gridTemplateColumns = '1fr 1fr';
  card.style.gap = '40px';
  card.style.alignItems = 'center';
  card.style.position = 'relative';
  
  // Add floating geometric shapes
  const floatingShape1 = document.createElement('div');
  floatingShape1.style.position = 'absolute';
  floatingShape1.style.top = '-20px';
  floatingShape1.style.right = '-20px';
  floatingShape1.style.width = '120px';
  floatingShape1.style.height = '120px';
  floatingShape1.style.background = 'linear-gradient(135deg, #60A5FA, #3B82F6)';
  floatingShape1.style.borderRadius = '50%';
  floatingShape1.style.filter = 'blur(40px)';
  floatingShape1.style.opacity = '0.3';
  
  const floatingShape2 = document.createElement('div');
  floatingShape2.style.position = 'absolute';
  floatingShape2.style.bottom = '-30px';
  floatingShape2.style.left = '-30px';
  floatingShape2.style.width = '80px';
  floatingShape2.style.height = '80px';
  floatingShape2.style.background = 'linear-gradient(135deg, #10B981, #60A5FA)';
  floatingShape2.style.borderRadius = '20px';
  floatingShape2.style.filter = 'blur(30px)';
  floatingShape2.style.opacity = '0.2';
  
  card.appendChild(floatingShape1);
  card.appendChild(floatingShape2);
  
  // Left column - Main content
  const leftColumn = document.createElement('div');
  leftColumn.style.display = 'flex';
  leftColumn.style.flexDirection = 'column';
  leftColumn.style.gap = '30px';
  
  // 3D-style floating rank badge
  const rankBadge = document.createElement('div');
  rankBadge.style.background = 'linear-gradient(135deg, #3B82F6, #1E40AF)';
  rankBadge.style.color = 'white';
  rankBadge.style.width = '100px';
  rankBadge.style.height = '100px';
  rankBadge.style.borderRadius = '20px';
  rankBadge.style.display = 'flex';
  rankBadge.style.alignItems = 'center';
  rankBadge.style.justifyContent = 'center';
  rankBadge.style.fontSize = '42px';
  rankBadge.style.fontWeight = 'bold';
  rankBadge.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3), 0 8px 16px rgba(59, 130, 246, 0.2)';
  rankBadge.style.border = '2px solid rgba(255, 255, 255, 0.3)';
  rankBadge.style.transform = 'perspective(1000px) rotateX(10deg)';
  rankBadge.textContent = `#${rank}`;
  
  // Career title with modern styling
  const title = document.createElement('h1');
  title.style.fontSize = '56px';
  title.style.fontWeight = '800';
  title.style.lineHeight = '1.1';
  title.style.margin = '0';
  title.style.color = 'white';
  title.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  title.textContent = recommendation.title;
  
  // Reasoning with modern styling
  const reasoning = document.createElement('div');
  reasoning.style.fontSize = '22px';
  reasoning.style.lineHeight = '1.5';
  reasoning.style.opacity = '0.9';
  reasoning.style.margin = '0';
  reasoning.style.fontStyle = 'italic';
  reasoning.style.color = 'rgba(255, 255, 255, 0.9)';
  
  const reasoningText = recommendation.reasoning || 'Personalized recommendation based on your assessment.';
  const truncatedReasoning = reasoningText.length > 140 
    ? reasoningText.substring(0, 137) + '...'
    : reasoningText;
  reasoning.textContent = `"${truncatedReasoning}"`;
  
  leftColumn.appendChild(rankBadge);
  leftColumn.appendChild(title);
  leftColumn.appendChild(reasoning);
  
  // Right column - Progress ring and details
  const rightColumn = document.createElement('div');
  rightColumn.style.display = 'flex';
  rightColumn.style.flexDirection = 'column';
  rightColumn.style.alignItems = 'center';
  rightColumn.style.gap = '30px';
  
  // 3D Progress ring for match score
  const progressContainer = document.createElement('div');
  progressContainer.style.position = 'relative';
  progressContainer.style.width = '180px';
  progressContainer.style.height = '180px';
  progressContainer.style.display = 'flex';
  progressContainer.style.alignItems = 'center';
  progressContainer.style.justifyContent = 'center';
  
  const progressRing = document.createElement('div');
  progressRing.style.width = '180px';
  progressRing.style.height = '180px';
  progressRing.style.borderRadius = '50%';
  progressRing.style.background = `conic-gradient(#3B82F6 0deg ${(recommendation.matchScore / 100) * 360}deg, rgba(255, 255, 255, 0.2) ${(recommendation.matchScore / 100) * 360}deg 360deg)`;
  progressRing.style.padding = '8px';
  progressRing.style.boxShadow = '0 16px 32px rgba(59, 130, 246, 0.3)';
  
  const progressInner = document.createElement('div');
  progressInner.style.width = '100%';
  progressInner.style.height = '100%';
  progressInner.style.borderRadius = '50%';
  progressInner.style.background = 'rgba(255, 255, 255, 0.1)';
  progressInner.style.backdropFilter = 'blur(10px)';
  progressInner.style.display = 'flex';
  progressInner.style.alignItems = 'center';
  progressInner.style.justifyContent = 'center';
  progressInner.style.flexDirection = 'column';
  progressInner.style.border = '2px solid rgba(255, 255, 255, 0.2)';
  
  const matchScoreText = document.createElement('div');
  matchScoreText.style.fontSize = '32px';
  matchScoreText.style.fontWeight = 'bold';
  matchScoreText.style.color = 'white';
  matchScoreText.textContent = `${Math.round(recommendation.matchScore)}%`;
  
  const matchLabel = document.createElement('div');
  matchLabel.style.fontSize = '16px';
  matchLabel.style.color = 'rgba(255, 255, 255, 0.8)';
  matchLabel.style.fontWeight = '500';
  matchLabel.textContent = 'Match';
  
  progressInner.appendChild(matchScoreText);
  progressInner.appendChild(matchLabel);
  progressRing.appendChild(progressInner);
  progressContainer.appendChild(progressRing);
  
  // Modern details cards
  const detailsContainer = document.createElement('div');
  detailsContainer.style.display = 'flex';
  detailsContainer.style.flexDirection = 'column';
  detailsContainer.style.gap = '16px';
  detailsContainer.style.width = '100%';
  
  const detailsData = [
    { icon: '💰', label: 'Salary', value: recommendation.salaryRange },
    { icon: '📈', label: 'Growth', value: recommendation.growthOutlook },
    { icon: '⏱️', label: 'Entry Time', value: recommendation.timeToEntry }
  ].filter(item => item.value);
  
  detailsData.forEach(detail => {
    const detailCard = document.createElement('div');
    detailCard.style.background = 'rgba(255, 255, 255, 0.15)';
    detailCard.style.backdropFilter = 'blur(10px)';
    detailCard.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    detailCard.style.borderRadius = '16px';
    detailCard.style.padding = '16px 20px';
    detailCard.style.display = 'flex';
    detailCard.style.alignItems = 'center';
    detailCard.style.gap = '12px';
    detailCard.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
    
    detailCard.innerHTML = `
      <span style="font-size: 24px;">${detail.icon}</span>
      <div>
        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">${detail.label}</div>
        <div style="font-size: 18px; color: white; font-weight: 600;">${detail.value}</div>
      </div>
    `;
    
    detailsContainer.appendChild(detailCard);
  });
  
  rightColumn.appendChild(progressContainer);
  rightColumn.appendChild(detailsContainer);
  
  card.appendChild(leftColumn);
  card.appendChild(rightColumn);
  
  // Footer with CTA
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '60px';
  footer.innerHTML = `
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 20px;">🎯 Discover Your Career Path</div>
    <div style="font-size: 24px; opacity: 0.9;">Take your free assessment today</div>
    <div style="font-size: 20px; opacity: 0.7; margin-top: 20px;">picocareer.com</div>
  `;
  
  container.appendChild(header);
  container.appendChild(card);
  container.appendChild(footer);
  
  // Add to DOM temporarily
  document.body.appendChild(container);
  
  try {
    // Capture the screenshot
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: false,
      width: 1080,
      height: 1920
    });
    
    // Convert to data URL
    const imageDataURL = canvas.toDataURL('image/png', 0.95);
    
    // Clean up
    document.body.removeChild(container);
    
    return imageDataURL;
  } catch (error) {
    // Clean up on error
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    throw error;
  }
};

export const downloadStoryImage = (imageDataURL: string, fileName: string = 'career-story.png') => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = imageDataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};