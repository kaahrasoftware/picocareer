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
  
  // Clean, user-friendly card design
  const card = document.createElement('div');
  card.style.background = 'rgba(255, 255, 255, 0.1)';
  card.style.backdropFilter = 'blur(10px)';
  card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  card.style.borderRadius = '24px';
  card.style.padding = '60px 50px';
  card.style.color = 'white';
  card.style.textAlign = 'center';
  card.style.margin = '40px 0';
  card.style.flex = '1';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '40px';
  card.style.alignItems = 'center';
  
  // Hero section - Large match score
  const heroSection = document.createElement('div');
  heroSection.style.textAlign = 'center';
  
  const matchScore = Math.round(recommendation.matchScore || 85);
  heroSection.innerHTML = `
    <div style="font-size: 120px; font-weight: 800; margin-bottom: 16px; line-height: 1; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">${matchScore}%</div>
    <div style="font-size: 24px; opacity: 0.8; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Perfect Match</div>
  `;
  
  // Career title - Clean and prominent
  const title = document.createElement('h1');
  title.style.fontSize = '48px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.2';
  title.style.margin = '0 0 20px 0';
  title.style.color = 'white';
  title.style.textAlign = 'center';
  title.textContent = recommendation.title;
  
  // Simplified description
  const description = document.createElement('div');
  description.style.fontSize = '20px';
  description.style.lineHeight = '1.4';
  description.style.opacity = '0.9';
  description.style.margin = '0 0 40px 0';
  description.style.textAlign = 'center';
  description.style.maxWidth = '600px';
  
  const descText = recommendation.description || recommendation.reasoning || 'Personalized recommendation based on your assessment.';
  const truncatedDesc = descText.length > 120 
    ? descText.substring(0, 117) + '...'
    : descText;
  description.textContent = truncatedDesc;
  
  // Clean details section
  const detailsContainer = document.createElement('div');
  detailsContainer.style.display = 'grid';
  detailsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  detailsContainer.style.gap = '24px';
  detailsContainer.style.width = '100%';
  detailsContainer.style.maxWidth = '600px';
  
  const detailsData = [
    { icon: '💰', label: 'Salary Range', value: recommendation.salaryRange || 'Competitive' },
    { icon: '📈', label: 'Growth Outlook', value: recommendation.growthOutlook || 'Positive' },
    { icon: '⏱️', label: 'Time to Entry', value: recommendation.timeToEntry || 'Varies' }
  ];
  
  detailsData.forEach(detail => {
    const detailCard = document.createElement('div');
    detailCard.style.background = 'rgba(255, 255, 255, 0.15)';
    detailCard.style.backdropFilter = 'blur(5px)';
    detailCard.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    detailCard.style.borderRadius = '16px';
    detailCard.style.padding = '24px 20px';
    detailCard.style.textAlign = 'center';
    
    detailCard.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 12px;">${detail.icon}</div>
      <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">${detail.label}</div>
      <div style="font-size: 18px; color: white; font-weight: 600; line-height: 1.3;">${detail.value}</div>
    `;
    
    detailsContainer.appendChild(detailCard);
  });
  
  card.appendChild(heroSection);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(detailsContainer);
  
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