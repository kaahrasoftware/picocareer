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
  container.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.color = 'white';
  container.style.padding = '50px 40px';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.overflow = 'hidden';
  
  // Dynamic gradient background with multiple layers
  container.style.background = `
    radial-gradient(circle at 20% 80%, hsl(199, 89%, 48%) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, hsl(220, 100%, 20%) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, hsl(199, 89%, 60%) 0%, transparent 50%),
    linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(220, 100%, 20%) 100%)
  `;
  
  // Floating geometric shapes for visual interest
  const shapes = document.createElement('div');
  shapes.style.position = 'absolute';
  shapes.style.top = '0';
  shapes.style.left = '0';
  shapes.style.width = '100%';
  shapes.style.height = '100%';
  shapes.style.pointerEvents = 'none';
  shapes.innerHTML = `
    <div style="position: absolute; top: 15%; right: 10%; width: 120px; height: 120px; background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border-radius: 50%; backdrop-filter: blur(10px);"></div>
    <div style="position: absolute; bottom: 20%; left: 15%; width: 80px; height: 80px; background: linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)); border-radius: 20px; backdrop-filter: blur(10px); transform: rotate(45deg);"></div>
    <div style="position: absolute; top: 60%; right: 20%; width: 60px; height: 60px; background: linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius: 50%; backdrop-filter: blur(10px);"></div>
  `;
  
  // Header with logo and modern typography
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '40px';
  header.style.position = 'relative';
  header.style.zIndex = '10';
  header.innerHTML = `
    <div style="font-size: 42px; font-weight: 700; margin-bottom: 12px; background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0.9)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${brandingText}</div>
    <div style="font-size: 24px; opacity: 0.9; font-weight: 500;">Career Assessment Results</div>
  `;
  
  // Main content with glassmorphism
  const card = document.createElement('div');
  card.style.background = 'rgba(255, 255, 255, 0.15)';
  card.style.backdropFilter = 'blur(20px)';
  card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  card.style.borderRadius = '32px';
  card.style.padding = '60px 40px';
  card.style.color = 'white';
  card.style.margin = '20px 0';
  card.style.flex = '1';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.position = 'relative';
  card.style.zIndex = '10';
  card.style.boxShadow = '0 32px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
  
  // Floating rank badge with 3D effect
  const rankContainer = document.createElement('div');
  rankContainer.style.position = 'relative';
  rankContainer.style.display = 'flex';
  rankContainer.style.justifyContent = 'flex-end';
  rankContainer.style.marginBottom = '20px';
  
  const rankBadge = document.createElement('div');
  rankBadge.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))';
  rankBadge.style.backdropFilter = 'blur(10px)';
  rankBadge.style.border = '2px solid rgba(255,255,255,0.3)';
  rankBadge.style.color = 'white';
  rankBadge.style.width = '90px';
  rankBadge.style.height = '90px';
  rankBadge.style.borderRadius = '50%';
  rankBadge.style.display = 'flex';
  rankBadge.style.alignItems = 'center';
  rankBadge.style.justifyContent = 'center';
  rankBadge.style.fontSize = '32px';
  rankBadge.style.fontWeight = '700';
  rankBadge.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
  rankBadge.style.position = 'relative';
  rankBadge.innerHTML = `
    <div style="position: absolute; top: -8px; right: -8px; background: linear-gradient(45deg, #FFD700, #FFA500); color: #000; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);">★</div>
    #${rank}
  `;
  rankContainer.appendChild(rankBadge);
  
  // Career title with modern layout
  const titleContainer = document.createElement('div');
  titleContainer.style.textAlign = 'left';
  titleContainer.style.marginBottom = '30px';
  
  const title = document.createElement('h1');
  title.style.fontSize = '48px';
  title.style.fontWeight = '800';
  title.style.lineHeight = '1.1';
  title.style.margin = '0';
  title.style.color = 'white';
  title.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  title.textContent = recommendation.title;
  titleContainer.appendChild(title);
  
  // Circular progress for match score
  const progressContainer = document.createElement('div');
  progressContainer.style.display = 'flex';
  progressContainer.style.alignItems = 'center';
  progressContainer.style.justifyContent = 'center';
  progressContainer.style.marginBottom = '40px';
  
  const progressRing = document.createElement('div');
  progressRing.style.position = 'relative';
  progressRing.style.width = '120px';
  progressRing.style.height = '120px';
  progressRing.style.background = `conic-gradient(
    hsl(199, 89%, 60%) 0deg,
    hsl(199, 89%, 60%) ${Math.round(recommendation.matchScore) * 3.6}deg,
    rgba(255, 255, 255, 0.2) ${Math.round(recommendation.matchScore) * 3.6}deg,
    rgba(255, 255, 255, 0.2) 360deg
  )`;
  progressRing.style.borderRadius = '50%';
  progressRing.style.padding = '8px';
  progressRing.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
  
  const progressInner = document.createElement('div');
  progressInner.style.width = '100%';
  progressInner.style.height = '100%';
  progressInner.style.background = 'rgba(255, 255, 255, 0.1)';
  progressInner.style.backdropFilter = 'blur(10px)';
  progressInner.style.borderRadius = '50%';
  progressInner.style.display = 'flex';
  progressInner.style.alignItems = 'center';
  progressInner.style.justifyContent = 'center';
  progressInner.style.flexDirection = 'column';
  progressInner.innerHTML = `
    <div style="font-size: 32px; font-weight: 800; color: white; line-height: 1;">${Math.round(recommendation.matchScore)}%</div>
    <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8); font-weight: 500;">MATCH</div>
  `;
  
  progressRing.appendChild(progressInner);
  progressContainer.appendChild(progressRing);
  
  // Modern details grid
  const detailsGrid = document.createElement('div');
  detailsGrid.style.display = 'grid';
  detailsGrid.style.gridTemplateColumns = '1fr';
  detailsGrid.style.gap = '16px';
  detailsGrid.style.marginBottom = '40px';
  
  const detailItems = [];
  if (recommendation.salaryRange) {
    detailItems.push({
      icon: '💎',
      label: 'Salary Range',
      value: recommendation.salaryRange,
      color: 'hsl(199, 89%, 60%)'
    });
  }
  if (recommendation.growthOutlook) {
    detailItems.push({
      icon: '📊',
      label: 'Growth Outlook',
      value: recommendation.growthOutlook,
      color: 'hsl(142, 76%, 50%)'
    });
  }
  if (recommendation.timeToEntry) {
    detailItems.push({
      icon: '⚡',
      label: 'Time to Entry',
      value: recommendation.timeToEntry,
      color: 'hsl(48, 100%, 60%)'
    });
  }
  
  detailItems.forEach(item => {
    const detailCard = document.createElement('div');
    detailCard.style.background = 'rgba(255, 255, 255, 0.1)';
    detailCard.style.backdropFilter = 'blur(10px)';
    detailCard.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    detailCard.style.borderRadius = '16px';
    detailCard.style.padding = '20px 24px';
    detailCard.style.display = 'flex';
    detailCard.style.alignItems = 'center';
    detailCard.style.gap = '16px';
    detailCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    
    detailCard.innerHTML = `
      <div style="width: 48px; height: 48px; background: ${item.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">${item.icon}</div>
      <div style="flex: 1;">
        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); font-weight: 500; margin-bottom: 4px;">${item.label}</div>
        <div style="font-size: 18px; color: white; font-weight: 600;">${item.value}</div>
      </div>
    `;
    
    detailsGrid.appendChild(detailCard);
  });
  
  // Reasoning with quote styling
  const reasoningContainer = document.createElement('div');
  reasoningContainer.style.background = 'rgba(255, 255, 255, 0.08)';
  reasoningContainer.style.backdropFilter = 'blur(10px)';
  reasoningContainer.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  reasoningContainer.style.borderRadius = '20px';
  reasoningContainer.style.padding = '24px';
  reasoningContainer.style.position = 'relative';
  reasoningContainer.style.margin = '0';
  
  const quoteIcon = document.createElement('div');
  quoteIcon.style.position = 'absolute';
  quoteIcon.style.top = '16px';
  quoteIcon.style.left = '20px';
  quoteIcon.style.fontSize = '32px';
  quoteIcon.style.color = 'rgba(255, 255, 255, 0.5)';
  quoteIcon.style.lineHeight = '1';
  quoteIcon.textContent = '"';
  
  const reasoningText = recommendation.reasoning || 'Personalized recommendation based on your assessment results and career preferences.';
  const truncatedReasoning = reasoningText.length > 100 
    ? reasoningText.substring(0, 97) + '...'
    : reasoningText;
  
  const reasoning = document.createElement('div');
  reasoning.style.fontSize = '18px';
  reasoning.style.lineHeight = '1.5';
  reasoning.style.color = 'rgba(255, 255, 255, 0.9)';
  reasoning.style.fontStyle = 'italic';
  reasoning.style.fontWeight = '400';
  reasoning.style.paddingLeft = '24px';
  reasoning.textContent = truncatedReasoning;
  
  reasoningContainer.appendChild(quoteIcon);
  reasoningContainer.appendChild(reasoning);
  
  // Assemble the card
  card.appendChild(rankContainer);
  card.appendChild(titleContainer);
  card.appendChild(progressContainer);
  if (detailItems.length > 0) {
    card.appendChild(detailsGrid);
  }
  card.appendChild(reasoningContainer);
  
  // Modern footer with gradient CTA
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '40px';
  footer.style.position = 'relative';
  footer.style.zIndex = '10';
  
  const ctaButton = document.createElement('div');
  ctaButton.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))';
  ctaButton.style.backdropFilter = 'blur(20px)';
  ctaButton.style.border = '2px solid rgba(255,255,255,0.3)';
  ctaButton.style.borderRadius = '50px';
  ctaButton.style.padding = '16px 32px';
  ctaButton.style.margin = '0 auto 20px auto';
  ctaButton.style.display = 'inline-block';
  ctaButton.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
  ctaButton.innerHTML = `
    <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px;">✨ Discover Your Path</div>
    <div style="font-size: 16px; color: rgba(255, 255, 255, 0.8); font-weight: 500;">Take your free assessment</div>
  `;
  
  const website = document.createElement('div');
  website.style.fontSize = '18px';
  website.style.color = 'rgba(255, 255, 255, 0.8)';
  website.style.fontWeight = '500';
  website.style.background = 'rgba(255, 255, 255, 0.1)';
  website.style.backdropFilter = 'blur(10px)';
  website.style.borderRadius = '20px';
  website.style.padding = '8px 20px';
  website.style.display = 'inline-block';
  website.textContent = 'picocareer.com';
  
  footer.appendChild(ctaButton);
  footer.appendChild(website);
  
  // Assemble the container
  container.appendChild(shapes);
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