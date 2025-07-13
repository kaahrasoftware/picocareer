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
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.color = 'white';
  container.style.padding = '80px 60px';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  container.style.position = 'relative';
  
  // Add subtle pattern overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.background = 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)';
  overlay.style.pointerEvents = 'none';
  container.appendChild(overlay);
  
  // Header with logo and branding
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '60px';
  header.style.position = 'relative';
  header.style.zIndex = '1';
  
  // Logo container
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = '30px';
  logoContainer.style.gap = '20px';
  
  // Logo icon
  const logoIcon = document.createElement('img');
  logoIcon.src = '/lovable-uploads/d6b217eb-2cec-4933-b8ee-09a438e5d28d.png';
  logoIcon.style.width = '60px';
  logoIcon.style.height = '60px';
  logoIcon.style.borderRadius = '12px';
  logoIcon.style.background = 'rgba(255,255,255,0.1)';
  logoIcon.style.padding = '8px';
  logoIcon.style.backdropFilter = 'blur(10px)';
  
  // Brand text logo
  const brandLogo = document.createElement('img');
  brandLogo.src = '/lovable-uploads/facac3f6-d693-4d3f-a971-a6aa734c804e.png';
  brandLogo.style.height = '40px';
  brandLogo.style.filter = 'brightness(0) invert(1)';
  
  logoContainer.appendChild(logoIcon);
  logoContainer.appendChild(brandLogo);
  
  const subtitle = document.createElement('div');
  subtitle.style.fontSize = '28px';
  subtitle.style.fontWeight = '500';
  subtitle.style.opacity = '0.9';
  subtitle.style.letterSpacing = '0.5px';
  subtitle.textContent = 'Career Assessment Results';
  
  header.appendChild(logoContainer);
  header.appendChild(subtitle);
  
  // Main content card with glassmorphism
  const card = document.createElement('div');
  card.style.background = 'rgba(255, 255, 255, 0.95)';
  card.style.backdropFilter = 'blur(20px)';
  card.style.borderRadius = '24px';
  card.style.padding = '60px 50px';
  card.style.color = '#1a1a1a';
  card.style.textAlign = 'center';
  card.style.boxShadow = '0 32px 64px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)';
  card.style.margin = '40px 0';
  card.style.flex = '1';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'center';
  card.style.position = 'relative';
  card.style.zIndex = '1';
  
  // Rank badge with modern styling
  const rankBadge = document.createElement('div');
  rankBadge.style.background = 'linear-gradient(135deg, #00A6D4, #012169)';
  rankBadge.style.color = 'white';
  rankBadge.style.width = '90px';
  rankBadge.style.height = '90px';
  rankBadge.style.borderRadius = '50%';
  rankBadge.style.display = 'flex';
  rankBadge.style.alignItems = 'center';
  rankBadge.style.justifyContent = 'center';
  rankBadge.style.fontSize = '32px';
  rankBadge.style.fontWeight = '700';
  rankBadge.style.margin = '0 auto 40px auto';
  rankBadge.style.boxShadow = '0 8px 32px rgba(0, 166, 212, 0.4)';
  rankBadge.style.border = '3px solid rgba(255,255,255,0.2)';
  rankBadge.textContent = `#${rank}`;
  
  // Career title with improved typography
  const title = document.createElement('h1');
  title.style.fontSize = '48px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.1';
  title.style.margin = '0 0 25px 0';
  title.style.color = '#1a1a1a';
  title.style.letterSpacing = '-0.5px';
  title.textContent = recommendation.title;
  
  // Match score with progress visualization
  const matchScoreContainer = document.createElement('div');
  matchScoreContainer.style.margin = '0 0 40px 0';
  
  const matchScore = document.createElement('div');
  matchScore.style.fontSize = '32px';
  matchScore.style.fontWeight = '700';
  matchScore.style.color = '#00A6D4';
  matchScore.style.marginBottom = '15px';
  matchScore.textContent = `${Math.round(recommendation.matchScore)}% Match`;
  
  // Progress bar
  const progressBg = document.createElement('div');
  progressBg.style.width = '100%';
  progressBg.style.height = '8px';
  progressBg.style.background = 'rgba(0, 166, 212, 0.2)';
  progressBg.style.borderRadius = '4px';
  progressBg.style.overflow = 'hidden';
  progressBg.style.margin = '0 auto';
  progressBg.style.maxWidth = '300px';
  
  const progressFill = document.createElement('div');
  progressFill.style.width = `${Math.round(recommendation.matchScore)}%`;
  progressFill.style.height = '100%';
  progressFill.style.background = 'linear-gradient(90deg, #00A6D4, #012169)';
  progressFill.style.borderRadius = '4px';
  progressFill.style.transition = 'width 0.3s ease';
  
  progressBg.appendChild(progressFill);
  matchScoreContainer.appendChild(matchScore);
  matchScoreContainer.appendChild(progressBg);
  
  // Key details with modern icons and styling
  const details = document.createElement('div');
  details.style.display = 'grid';
  details.style.gridTemplateColumns = '1fr';
  details.style.gap = '15px';
  details.style.fontSize = '24px';
  details.style.lineHeight = '1.4';
  details.style.margin = '0 0 35px 0';
  details.style.padding = '25px';
  details.style.background = 'rgba(0, 166, 212, 0.05)';
  details.style.borderRadius = '16px';
  details.style.border = '1px solid rgba(0, 166, 212, 0.1)';
  
  const detailsContent = [];
  if (recommendation.salaryRange) {
    detailsContent.push(`<div style="display: flex; align-items: center; gap: 12px;"><span style="font-size: 20px;">💰</span><span style="color: #1a1a1a; font-weight: 600;">${recommendation.salaryRange}</span></div>`);
  }
  if (recommendation.growthOutlook) {
    detailsContent.push(`<div style="display: flex; align-items: center; gap: 12px;"><span style="font-size: 20px;">📈</span><span style="color: #1a1a1a; font-weight: 600;">${recommendation.growthOutlook}</span></div>`);
  }
  if (recommendation.timeToEntry) {
    detailsContent.push(`<div style="display: flex; align-items: center; gap: 12px;"><span style="font-size: 20px;">⏱️</span><span style="color: #1a1a1a; font-weight: 600;">${recommendation.timeToEntry}</span></div>`);
  }
  
  details.innerHTML = detailsContent.join('');
  
  // Reasoning snippet with improved styling
  const reasoning = document.createElement('div');
  reasoning.style.fontSize = '22px';
  reasoning.style.lineHeight = '1.5';
  reasoning.style.fontStyle = 'italic';
  reasoning.style.color = '#4a5568';
  reasoning.style.margin = '0';
  reasoning.style.padding = '20px';
  reasoning.style.background = 'rgba(0, 0, 0, 0.02)';
  reasoning.style.borderRadius = '12px';
  reasoning.style.borderLeft = '4px solid #00A6D4';
  reasoning.style.maxHeight = '100px';
  reasoning.style.overflow = 'hidden';
  
  const reasoningText = recommendation.reasoning || 'Personalized recommendation based on your assessment.';
  const truncatedReasoning = reasoningText.length > 100 
    ? reasoningText.substring(0, 97) + '...'
    : reasoningText;
  reasoning.textContent = `"${truncatedReasoning}"`;
  
  card.appendChild(rankBadge);
  card.appendChild(title);
  card.appendChild(matchScoreContainer);
  if (detailsContent.length > 0) {
    card.appendChild(details);
  }
  card.appendChild(reasoning);
  
  // Modern footer with enhanced CTA
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '60px';
  footer.style.position = 'relative';
  footer.style.zIndex = '1';
  
  const ctaMain = document.createElement('div');
  ctaMain.style.fontSize = '26px';
  ctaMain.style.fontWeight = '700';
  ctaMain.style.marginBottom = '15px';
  ctaMain.style.background = 'linear-gradient(90deg, #ffffff, rgba(255,255,255,0.9))';
  ctaMain.style.webkitBackgroundClip = 'text';
  ctaMain.style.backgroundClip = 'text';
  ctaMain.textContent = '🎯 Discover Your Career Path';
  
  const ctaSubtext = document.createElement('div');
  ctaSubtext.style.fontSize = '22px';
  ctaSubtext.style.opacity = '0.9';
  ctaSubtext.style.marginBottom = '20px';
  ctaSubtext.style.fontWeight = '500';
  ctaSubtext.textContent = 'Take your free assessment today';
  
  const websiteLink = document.createElement('div');
  websiteLink.style.fontSize = '18px';
  websiteLink.style.opacity = '0.8';
  websiteLink.style.padding = '12px 24px';
  websiteLink.style.background = 'rgba(255,255,255,0.1)';
  websiteLink.style.borderRadius = '12px';
  websiteLink.style.backdropFilter = 'blur(10px)';
  websiteLink.style.border = '1px solid rgba(255,255,255,0.2)';
  websiteLink.style.display = 'inline-block';
  websiteLink.style.fontWeight = '600';
  websiteLink.style.letterSpacing = '0.5px';
  websiteLink.textContent = 'picocareer.com';
  
  footer.appendChild(ctaMain);
  footer.appendChild(ctaSubtext);
  footer.appendChild(websiteLink);
  
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