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
  
  // Main content card
  const card = document.createElement('div');
  card.style.background = 'rgba(255, 255, 255, 0.95)';
  card.style.borderRadius = '32px';
  card.style.padding = '60px 50px';
  card.style.color = '#1a1a1a';
  card.style.textAlign = 'center';
  card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
  card.style.margin = '40px 0';
  card.style.flex = '1';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'center';
  
  // Rank badge
  const rankBadge = document.createElement('div');
  rankBadge.style.background = 'linear-gradient(135deg, #00A6D4, #012169)';
  rankBadge.style.color = 'white';
  rankBadge.style.width = '80px';
  rankBadge.style.height = '80px';
  rankBadge.style.borderRadius = '50%';
  rankBadge.style.display = 'flex';
  rankBadge.style.alignItems = 'center';
  rankBadge.style.justifyContent = 'center';
  rankBadge.style.fontSize = '36px';
  rankBadge.style.fontWeight = 'bold';
  rankBadge.style.margin = '0 auto 40px auto';
  rankBadge.textContent = `#${rank}`;
  
  // Career title
  const title = document.createElement('h1');
  title.style.fontSize = '52px';
  title.style.fontWeight = 'bold';
  title.style.lineHeight = '1.2';
  title.style.margin = '0 0 30px 0';
  title.style.color = '#1a1a1a';
  title.textContent = recommendation.title;
  
  // Match score
  const matchScore = document.createElement('div');
  matchScore.style.fontSize = '36px';
  matchScore.style.fontWeight = 'bold';
  matchScore.style.color = '#00A6D4';
  matchScore.style.margin = '0 0 40px 0';
  matchScore.textContent = `${Math.round(recommendation.matchScore)}% Match`;
  
  // Key details
  const details = document.createElement('div');
  details.style.fontSize = '28px';
  details.style.lineHeight = '1.5';
  details.style.opacity = '0.8';
  details.style.margin = '0 0 40px 0';
  
  const detailsContent = [];
  if (recommendation.salaryRange) {
    detailsContent.push(`💰 ${recommendation.salaryRange}`);
  }
  if (recommendation.growthOutlook) {
    detailsContent.push(`📈 ${recommendation.growthOutlook}`);
  }
  if (recommendation.timeToEntry) {
    detailsContent.push(`⏱️ ${recommendation.timeToEntry}`);
  }
  
  details.innerHTML = detailsContent.join('<br>');
  
  // Reasoning snippet
  const reasoning = document.createElement('div');
  reasoning.style.fontSize = '24px';
  reasoning.style.lineHeight = '1.4';
  reasoning.style.fontStyle = 'italic';
  reasoning.style.opacity = '0.7';
  reasoning.style.margin = '0';
  reasoning.style.maxHeight = '120px';
  reasoning.style.overflow = 'hidden';
  
  const reasoningText = recommendation.reasoning || 'Personalized recommendation based on your assessment.';
  const truncatedReasoning = reasoningText.length > 120 
    ? reasoningText.substring(0, 117) + '...'
    : reasoningText;
  reasoning.textContent = `"${truncatedReasoning}"`;
  
  card.appendChild(rankBadge);
  card.appendChild(title);
  card.appendChild(matchScore);
  if (detailsContent.length > 0) {
    card.appendChild(details);
  }
  card.appendChild(reasoning);
  
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