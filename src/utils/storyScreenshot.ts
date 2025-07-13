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
  container.style.padding = '60px 80px';
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
  card.style.width = '950px';
  card.style.maxWidth = '950px';
  card.style.textAlign = 'center';
  card.style.margin = '40px 0';
  card.style.flex = '1';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '30px';
  card.style.alignItems = 'center';
  
  // Hero section - Large match score
  const heroSection = document.createElement('div');
  heroSection.style.textAlign = 'center';
  
  const matchScore = Math.round(recommendation.matchScore || 85);
  heroSection.innerHTML = `
    <div style="font-size: 120px; font-weight: 800; margin-bottom: 32px; line-height: 1; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">${matchScore}%</div>
    <div style="font-size: 24px; opacity: 0.8; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Perfect Match</div>
  `;
  
  // Career title - Clean and prominent
  const title = document.createElement('h1');
  title.style.fontSize = '48px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.2';
  title.style.margin = '0';
  title.style.color = 'white';
  title.style.textAlign = 'center';
  title.textContent = recommendation.title;
  
  // Enhanced description section
  const descriptionSection = document.createElement('div');
  descriptionSection.style.width = '100%';
  descriptionSection.style.maxWidth = '700px';
  descriptionSection.style.textAlign = 'center';
  
  const description = document.createElement('div');
  description.style.fontSize = '28px';
  description.style.lineHeight = '1.5';
  description.style.opacity = '0.9';
  description.style.marginBottom = '0';
  
  const descText = recommendation.description || recommendation.reasoning || 'Personalized recommendation based on your assessment.';
  const truncatedDesc = descText.length > 150 
    ? descText.substring(0, 147) + '...'
    : descText;
  description.textContent = truncatedDesc;
  
  // Salary range tag - large and prominent golden style
  const salaryTag = document.createElement('div');
  salaryTag.style.background = 'rgba(255, 215, 0, 0.25)';
  salaryTag.style.backdropFilter = 'blur(5px)';
  salaryTag.style.border = '2px solid rgba(255, 215, 0, 0.7)';
  salaryTag.style.borderRadius = '32px';
  salaryTag.style.padding = '16px 32px';
  salaryTag.style.fontSize = '24px';
  salaryTag.style.fontWeight = '600';
  salaryTag.style.color = 'white';
  salaryTag.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
  salaryTag.style.whiteSpace = 'nowrap';
  salaryTag.style.margin = '24px auto 0';
  salaryTag.style.display = 'block';
  salaryTag.style.textAlign = 'center';
  salaryTag.style.width = 'fit-content';
  salaryTag.style.alignSelf = 'center';
  salaryTag.style.justifySelf = 'center';
  salaryTag.textContent = `💰 ${recommendation.salaryRange || 'Competitive Salary'}`;
  
  descriptionSection.appendChild(description);
  descriptionSection.appendChild(salaryTag);
  
  // Reasoning section - why this career fits the user
  const reasoningSection = document.createElement('div');
  reasoningSection.style.width = '100%';
  reasoningSection.style.maxWidth = '700px';
  reasoningSection.style.margin = '0';
  reasoningSection.style.padding = '28px';
  reasoningSection.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  reasoningSection.style.backdropFilter = 'blur(5px)';
  reasoningSection.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  reasoningSection.style.borderRadius = '20px';
  
  const reasoningTitle = document.createElement('h3');
  reasoningTitle.textContent = 'Why This Career Fits You';
  reasoningTitle.style.fontSize = '20px';
  reasoningTitle.style.fontWeight = '700';
  reasoningTitle.style.color = 'white';
  reasoningTitle.style.marginBottom = '16px';
  reasoningTitle.style.textAlign = 'center';
  reasoningTitle.style.textTransform = 'uppercase';
  
  const reasoningText = document.createElement('p');
  reasoningText.textContent = recommendation.reasoning;
  reasoningText.style.fontSize = '28px';
  reasoningText.style.lineHeight = '1.6';
  reasoningText.style.color = 'rgba(255, 255, 255, 0.9)';
  reasoningText.style.textAlign = 'left';
  reasoningText.style.margin = '0';
  
  reasoningSection.appendChild(reasoningTitle);
  reasoningSection.appendChild(reasoningText);
  
  // Enhanced details section with 2 items in 1x2 grid
  const detailsContainer = document.createElement('div');
  detailsContainer.style.display = 'grid';
  detailsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
  detailsContainer.style.gap = '32px';
  detailsContainer.style.width = '100%';
  detailsContainer.style.maxWidth = '900px';
  
  const detailsData = [
    { icon: '📈', label: 'Growth Outlook', value: recommendation.growthOutlook || 'Positive' },
    { icon: '🏢', label: 'Work Environment', value: recommendation.workEnvironment || 'Office/Remote' }
  ];
  
  detailsData.forEach(detail => {
    const detailCard = document.createElement('div');
    detailCard.style.background = 'rgba(255, 255, 255, 0.15)';
    detailCard.style.backdropFilter = 'blur(5px)';
    detailCard.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    detailCard.style.borderRadius = '20px';
    detailCard.style.padding = '40px 32px';
    detailCard.style.textAlign = 'center';
    
    detailCard.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 16px;">${detail.icon}</div>
      <div style="font-size: 20px; color: rgba(255, 255, 255, 0.7); font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">${detail.label}</div>
      <div style="font-size: 28px; color: white; font-weight: 400; line-height: 1.3;">${detail.value}</div>
    `;
    
    detailsContainer.appendChild(detailCard);
  });
  
  card.appendChild(heroSection);
  card.appendChild(title);
  card.appendChild(descriptionSection);
  card.appendChild(reasoningSection);
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