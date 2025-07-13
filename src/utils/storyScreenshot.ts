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
  
  // Modern asymmetrical content container
  const contentWrapper = document.createElement('div');
  contentWrapper.style.flex = '1';
  contentWrapper.style.display = 'flex';
  contentWrapper.style.flexDirection = 'column';
  contentWrapper.style.justifyContent = 'center';
  contentWrapper.style.margin = '40px 0';
  contentWrapper.style.position = 'relative';
  contentWrapper.style.zIndex = '1';
  
  // Floating geometric shapes for background
  const shape1 = document.createElement('div');
  shape1.style.position = 'absolute';
  shape1.style.top = '10%';
  shape1.style.right = '5%';
  shape1.style.width = '120px';
  shape1.style.height = '120px';
  shape1.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))';
  shape1.style.borderRadius = '30px';
  shape1.style.transform = 'rotate(15deg)';
  shape1.style.backdropFilter = 'blur(10px)';
  shape1.style.zIndex = '0';
  
  const shape2 = document.createElement('div');
  shape2.style.position = 'absolute';
  shape2.style.bottom = '15%';
  shape2.style.left = '8%';
  shape2.style.width = '80px';
  shape2.style.height = '80px';
  shape2.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))';
  shape2.style.borderRadius = '50%';
  shape2.style.backdropFilter = 'blur(8px)';
  shape2.style.zIndex = '0';
  
  contentWrapper.appendChild(shape1);
  contentWrapper.appendChild(shape2);
  
  // Main content card with modern glassmorphism
  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))';
  card.style.backdropFilter = 'blur(30px)';
  card.style.borderRadius = '32px';
  card.style.padding = '70px 50px';
  card.style.color = '#ffffff';
  card.style.textAlign = 'left';
  card.style.boxShadow = '0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
  card.style.border = '1px solid rgba(255,255,255,0.15)';
  card.style.position = 'relative';
  card.style.zIndex = '1';
  card.style.overflow = 'hidden';
  
  // Floating rank badge with 3D effect
  const rankBadge = document.createElement('div');
  rankBadge.style.position = 'absolute';
  rankBadge.style.top = '-25px';
  rankBadge.style.right = '30px';
  rankBadge.style.background = 'linear-gradient(135deg, #00A6D4 0%, #012169 100%)';
  rankBadge.style.color = 'white';
  rankBadge.style.width = '80px';
  rankBadge.style.height = '80px';
  rankBadge.style.borderRadius = '20px';
  rankBadge.style.display = 'flex';
  rankBadge.style.alignItems = 'center';
  rankBadge.style.justifyContent = 'center';
  rankBadge.style.fontSize = '28px';
  rankBadge.style.fontWeight = '800';
  rankBadge.style.boxShadow = '0 15px 35px rgba(0,166,212,0.5), 0 5px 15px rgba(0,0,0,0.2)';
  rankBadge.style.border = '2px solid rgba(255,255,255,0.3)';
  rankBadge.style.transform = 'rotate(-8deg)';
  rankBadge.style.zIndex = '2';
  rankBadge.textContent = `#${rank}`;
  
  // Modern hero section with asymmetrical layout
  const heroSection = document.createElement('div');
  heroSection.style.marginBottom = '45px';
  heroSection.style.position = 'relative';
  
  // Career title with gradient text
  const title = document.createElement('h1');
  title.style.fontSize = '52px';
  title.style.fontWeight = '800';
  title.style.lineHeight = '1.1';
  title.style.margin = '0 0 20px 0';
  title.style.background = 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)';
  title.style.webkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.webkitTextFillColor = 'transparent';
  title.style.letterSpacing = '-1px';
  title.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
  title.textContent = recommendation.title;
  
  // Modern match score with 3D progress ring
  const matchScoreContainer = document.createElement('div');
  matchScoreContainer.style.display = 'flex';
  matchScoreContainer.style.alignItems = 'center';
  matchScoreContainer.style.gap = '25px';
  matchScoreContainer.style.marginBottom = '45px';
  matchScoreContainer.style.padding = '20px';
  matchScoreContainer.style.background = 'rgba(255,255,255,0.1)';
  matchScoreContainer.style.borderRadius = '20px';
  matchScoreContainer.style.border = '1px solid rgba(255,255,255,0.2)';
  
  // Circular progress indicator
  const progressRing = document.createElement('div');
  progressRing.style.position = 'relative';
  progressRing.style.width = '90px';
  progressRing.style.height = '90px';
  progressRing.style.borderRadius = '50%';
  progressRing.style.background = `conic-gradient(from 0deg, #00A6D4 0%, #012169 ${Math.round(recommendation.matchScore)}%, rgba(255,255,255,0.2) ${Math.round(recommendation.matchScore)}%)`;
  progressRing.style.display = 'flex';
  progressRing.style.alignItems = 'center';
  progressRing.style.justifyContent = 'center';
  progressRing.style.boxShadow = '0 8px 25px rgba(0,166,212,0.3)';
  
  const progressInner = document.createElement('div');
  progressInner.style.width = '70px';
  progressInner.style.height = '70px';
  progressInner.style.borderRadius = '50%';
  progressInner.style.background = 'rgba(255,255,255,0.95)';
  progressInner.style.display = 'flex';
  progressInner.style.alignItems = 'center';
  progressInner.style.justifyContent = 'center';
  progressInner.style.fontSize = '18px';
  progressInner.style.fontWeight = '800';
  progressInner.style.color = '#012169';
  progressInner.textContent = `${Math.round(recommendation.matchScore)}%`;
  
  progressRing.appendChild(progressInner);
  
  const matchLabel = document.createElement('div');
  matchLabel.style.fontSize = '28px';
  matchLabel.style.fontWeight = '700';
  matchLabel.style.color = '#ffffff';
  matchLabel.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
  matchLabel.textContent = 'Perfect Match';
  
  matchScoreContainer.appendChild(progressRing);
  matchScoreContainer.appendChild(matchLabel);
  
  heroSection.appendChild(title);
  heroSection.appendChild(matchScoreContainer);
  
  // Modern card-based details section
  const detailsGrid = document.createElement('div');
  detailsGrid.style.display = 'grid';
  detailsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  detailsGrid.style.gap = '20px';
  detailsGrid.style.margin = '0 0 45px 0';
  
  const detailsData = [];
  if (recommendation.salaryRange) {
    detailsData.push({ icon: '💰', label: 'Salary Range', value: recommendation.salaryRange });
  }
  if (recommendation.growthOutlook) {
    detailsData.push({ icon: '📈', label: 'Growth Outlook', value: recommendation.growthOutlook });
  }
  if (recommendation.timeToEntry) {
    detailsData.push({ icon: '⏱️', label: 'Time to Entry', value: recommendation.timeToEntry });
  }
  
  detailsData.forEach(detail => {
    const detailCard = document.createElement('div');
    detailCard.style.padding = '20px';
    detailCard.style.background = 'rgba(255,255,255,0.15)';
    detailCard.style.borderRadius = '16px';
    detailCard.style.border = '1px solid rgba(255,255,255,0.25)';
    detailCard.style.backdropFilter = 'blur(10px)';
    detailCard.style.textAlign = 'center';
    detailCard.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
    
    const icon = document.createElement('div');
    icon.style.fontSize = '32px';
    icon.style.marginBottom = '10px';
    icon.textContent = detail.icon;
    
    const label = document.createElement('div');
    label.style.fontSize = '14px';
    label.style.color = 'rgba(255,255,255,0.8)';
    label.style.marginBottom = '5px';
    label.style.fontWeight = '600';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.5px';
    label.textContent = detail.label;
    
    const value = document.createElement('div');
    value.style.fontSize = '18px';
    value.style.color = '#ffffff';
    value.style.fontWeight = '700';
    value.style.lineHeight = '1.3';
    value.textContent = detail.value;
    
    detailCard.appendChild(icon);
    detailCard.appendChild(label);
    detailCard.appendChild(value);
    detailsGrid.appendChild(detailCard);
  });
  
  // Modern quote section with gradient styling
  const reasoning = document.createElement('div');
  reasoning.style.position = 'relative';
  reasoning.style.padding = '25px';
  reasoning.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
  reasoning.style.borderRadius = '20px';
  reasoning.style.border = '1px solid rgba(255,255,255,0.2)';
  reasoning.style.backdropFilter = 'blur(15px)';
  reasoning.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
  
  const quoteIcon = document.createElement('div');
  quoteIcon.style.position = 'absolute';
  quoteIcon.style.top = '15px';
  quoteIcon.style.left = '20px';
  quoteIcon.style.fontSize = '24px';
  quoteIcon.style.color = 'rgba(255,255,255,0.6)';
  quoteIcon.textContent = '"';
  
  const reasoningText = recommendation.reasoning || 'Personalized recommendation based on your unique assessment results and career preferences.';
  const truncatedReasoning = reasoningText.length > 120 
    ? reasoningText.substring(0, 117) + '...'
    : reasoningText;
  
  const reasoningContent = document.createElement('div');
  reasoningContent.style.fontSize = '18px';
  reasoningContent.style.lineHeight = '1.5';
  reasoningContent.style.color = 'rgba(255,255,255,0.95)';
  reasoningContent.style.fontStyle = 'italic';
  reasoningContent.style.fontWeight = '500';
  reasoningContent.style.marginLeft = '15px';
  reasoningContent.textContent = truncatedReasoning;
  
  reasoning.appendChild(quoteIcon);
  reasoning.appendChild(reasoningContent);
  
  card.appendChild(rankBadge);
  card.appendChild(heroSection);
  if (detailsData.length > 0) {
    card.appendChild(detailsGrid);
  }
  card.appendChild(reasoning);
  
  contentWrapper.appendChild(card);
  
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
  container.appendChild(contentWrapper);
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