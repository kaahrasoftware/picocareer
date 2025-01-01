import { FormFieldProps } from "@/components/forms/FormField";

export const socialFields: FormFieldProps[] = [
  {
    name: "linkedin_url",
    label: "LinkedIn Profile",
    type: "text",
    placeholder: "https://linkedin.com/in/username",
    description: "Highly recommended - LinkedIn helps establish your professional credibility"
  },
  {
    name: "github_url",
    label: "GitHub Profile",
    type: "text",
    placeholder: "https://github.com/username",
    description: "Recommended for tech mentors - showcase your coding projects"
  },
  {
    name: "website_url",
    label: "Personal Website",
    type: "text",
    placeholder: "https://yourwebsite.com",
    description: "Share your portfolio or personal brand"
  },
  {
    name: "X_url",
    label: "X (Twitter) Profile",
    type: "text",
    placeholder: "https://x.com/username",
    description: "Connect with mentees through social media"
  },
  {
    name: "facebook_url",
    label: "Facebook Profile",
    type: "text",
    placeholder: "https://facebook.com/username",
    description: "Optional social media presence"
  },
  {
    name: "instagram_url",
    label: "Instagram Profile",
    type: "text",
    placeholder: "https://instagram.com/username",
    description: "Optional social media presence"
  },
  {
    name: "tiktok_url",
    label: "TikTok Profile",
    type: "text",
    placeholder: "https://tiktok.com/@username",
    description: "Optional social media presence"
  },
  {
    name: "youtube_url",
    label: "YouTube Channel",
    type: "text",
    placeholder: "https://youtube.com/@username",
    description: "Share your educational content"
  }
];