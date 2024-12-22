import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];
type Subcategories = Database["public"]["Enums"]["subcategories"];

export const categories: Categories[] = [
  "Technology",
  "Digital Tools",
  "Extracurricular Activities",
  "Success Stories",
  "Volunteerism",
  "Community Service",
  "Entrepreneurship",
  "Financial Literacy",
  "Arts Careers",
  "STEM Education",
  "STEM Careers",
  "Humanities Careers",
  "Diversity and Inclusion",
  "Educational Resources",
  "Leadership Development",
  "Mental Health",
  "Wellbeing",
  "High School to University Transition",
  "Study Abroad Preparation",
  "Personal Branding",
  "Internship and Job Search",
  "Networking Strategies",
  "Skill Development",
  "University Admissions",
  "Career Guidance"
];

export const subcategories: Record<string, Subcategories[]> = {
  "Technology": [
    "Essential Tech Skills for the Workplace",
    "Leveraging AI in Career Planning",
    "Artificial Intelligence",
    "Machine Learning",
    "Best Apps for Productivity",
    "Using Technology for Collaboration"
  ],
  "Career Guidance": [
    "Industry-Specific Career Insights",
    "Choosing the Right Career Path",
    "Transitioning Between Careers",
    "Work-Life Balance Tips",
    "Career Advancement Strategies"
  ],
  "Educational Resources": [
    "Crafting a Winning Personal Statement",
    "Navigating the Application Process",
    "Preparing for Entrance Exams",
    "Choosing the Right University",
    "Scholarship and Financial Aid Advice"
  ],
  "Skill Development": [
    "Soft Skills for Professional Success",
    "Technical Skill Mastery",
    "Communication Skills Development",
    "Problem-Solving and Critical Thinking",
    "Time Management Techniques"
  ],
  "Networking Strategies": [
    "Building Meaningful Connections",
    "Leveraging LinkedIn and Other Platforms",
    "Networking for Introverts",
    "Finding a Mentor",
    "Professional Event Etiquette"
  ],
  "Internship and Job Search": [
    "Crafting an Effective Resume",
    "Acing Job Interviews",
    "Finding Internship Opportunities",
    "Gaining Work Experience in High School",
    "Navigating Job Portals and Applications"
  ],
  "Personal Branding": [
    "Creating a Strong Online Presence",
    "Building a Professional Portfolio",
    "Social Media for Career Growth",
    "Establishing Expertise in Your Field",
    "Branding for Aspiring Entrepreneurs"
  ],
  "Study Abroad Preparation": [
    "Researching International Programs",
    "Visa Application Guidance",
    "Adjusting to New Cultures",
    "Managing Finances Abroad",
    "Safety Tips for International Students"
  ],
  "High School to University Transition": [
    "Adapting to University Life",
    "Choosing a Major",
    "Navigating Academic Expectations",
    "Developing Independence",
    "Building New Friendships"
  ],
  "Mental Health": [
    "Managing Stress and Anxiety",
    "Overcoming Imposter Syndrome",
    "Balancing Academic and Personal Life",
    "Self-Care Strategies for Students",
    "Seeking Support When Needed"
  ],
  "Leadership Development": [
    "Cultivating Emotional Intelligence",
    "Becoming a Campus Leader",
    "Decision-Making Skills",
    "Managing Teams Effectively",
    "Conflict Resolution Strategies"
  ],
  "Entrepreneurship": [
    "Starting a Business in College",
    "Writing a Business Plan",
    "Finding Funding for Startups",
    "Marketing Your Ideas",
    "Overcoming Entrepreneurial Challenges"
  ],
  "Educational Resources": [
    "Top Study Tools and Apps",
    "Online Learning Platforms",
    "Using Libraries Effectively",
    "Exam Preparation Guides",
    "Developing Effective Study Habits"
  ],
  "Diversity and Inclusion": [
    "Addressing Bias in Academia and Workplaces",
    "Supporting Underrepresented Groups",
    "Building Inclusive Communities",
    "Overcoming Barriers to Opportunity",
    "Celebrating Cultural Differences"
  ],
  "STEM Education": [
    "Encouraging STEM in Schools",
    "Exploring Careers in Technology",
    "Women in STEM",
    "Robotics and Coding for Beginners",
    "Research Opportunities in STEM Fields"
  ],
  "Humanities Careers": [
    "Exploring Creative Career Paths",
    "Building a Career in Writing",
    "Career Options for History Majors",
    "Monetizing Artistic Talents",
    "Pursuing Higher Education in the Arts"
  ],
  "Financial Literacy": [
    "Budgeting for Students",
    "Managing Student Loans",
    "Saving for the Future",
    "Understanding Credit and Debt",
    "Finding Part-Time Jobs as a Student"
  ],
  "Volunteerism": [
    "Finding Volunteer Opportunities",
    "Benefits of Community Involvement",
    "Organizing Campus Charity Events",
    "Highlighting Volunteer Work in Applications",
    "Making a Difference Locally and Globally"
  ],
  "Success Stories": [
    "Alumni Career Journeys",
    "Inspirational Mentor-Student Relationships",
    "Overcoming Academic and Career Challenges",
    "Students Who Made a Difference",
    "First-Generation College Graduates"
  ],
  "Extracurricular Activities": [
    "Benefits of Joining Clubs and Societies",
    "Sports and Physical Wellbeing",
    "Exploring Creative Hobbies",
    "How Extracurriculars Boost Applications",
    "Starting Your Own Club or Organization"
  ]
};

export const blogFormFields = [
  { 
    name: "title", 
    label: "Title", 
    placeholder: "Blog Post Title", 
    required: true 
  },
  { 
    name: "summary", 
    label: "Summary", 
    type: "textarea" as const, 
    placeholder: "Brief summary of the blog post", 
    required: true 
  },
  { 
    name: "content", 
    label: "Content", 
    type: "textarea" as const, 
    placeholder: "Full blog post content", 
    required: true 
  },
  { 
    name: "cover_image_url", 
    label: "Cover Image", 
    type: "image" as const, 
    description: "Upload a cover image for your blog post",
    bucket: "images"
  },
  { 
    name: "categories", 
    label: "Categories", 
    type: "multiselect" as const,
    placeholder: "Select categories",
    options: categories
  },
  { 
    name: "subcategories", 
    label: "Subcategories", 
    type: "multiselect" as const,
    placeholder: "Select subcategories",
    options: [],
    dependsOn: "categories"
  },
  { 
    name: "is_recent", 
    label: "Mark as Recent", 
    type: "checkbox" as const, 
    description: "Feature this post in recent blogs section" 
  }
];