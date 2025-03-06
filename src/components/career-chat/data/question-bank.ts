
import { QuestionCategory } from './question-types';

interface Question {
  intro?: string;
  question: string;
  options: string[];
}

export const questionBank: Record<QuestionCategory, Question[]> = {
  education: [
    {
      intro: "Let's start by understanding your educational background.",
      question: "What is your current highest level of education?",
      options: [
        "High School or GED",
        "Some College",
        "Associate's Degree",
        "Bachelor's Degree",
        "Master's Degree",
        "Doctorate or Professional Degree"
      ]
    },
    {
      question: "What field of study are you most interested in or have you studied?",
      options: [
        "Computer Science/IT",
        "Business/Economics",
        "Engineering",
        "Arts/Humanities",
        "Natural Sciences",
        "Social Sciences",
        "Healthcare/Medicine",
        "Education"
      ]
    },
    {
      question: "How would you describe your learning style?",
      options: [
        "Self-directed learner",
        "Prefer structured educational settings",
        "Hands-on, practical learning",
        "Discussion and collaborative learning",
        "Visual learning through demonstrations"
      ]
    },
    {
      question: "Are you interested in pursuing more education or certifications?",
      options: [
        "Yes, I plan to pursue a higher degree",
        "Yes, interested in professional certifications",
        "Maybe, if required for career advancement",
        "No, I prefer to learn on the job",
        "Undecided"
      ]
    },
    {
      question: "How important is continuous learning and development in your career?",
      options: [
        "Extremely important - I love learning new things",
        "Important for career advancement",
        "Somewhat important",
        "Not very important",
        "I prefer stability over learning new skills"
      ]
    },
    {
      question: "What academic achievements are you most proud of?",
      options: [
        "High grades/academic honors",
        "Research or projects",
        "Leadership positions",
        "Competition awards",
        "Overcoming educational challenges",
        "Teaching or mentoring others"
      ]
    }
  ],
  skills: [
    {
      intro: "Now let's explore your skills and abilities.",
      question: "Which technical skills are you strongest in?",
      options: [
        "Programming/Software Development",
        "Data Analysis/Statistics",
        "Design/Creative Tools",
        "Technical Writing/Documentation",
        "Research Methods",
        "Engineering/Physical Sciences",
        "Project Management Tools"
      ]
    },
    {
      question: "What soft skills do you excel at?",
      options: [
        "Communication/Presenting",
        "Leadership/Team Management",
        "Critical Thinking/Problem Solving",
        "Creativity/Innovation",
        "Teamwork/Collaboration",
        "Organization/Time Management",
        "Adaptability/Flexibility"
      ]
    },
    {
      question: "What skills would you like to develop further?",
      options: [
        "Technical/Digital Skills",
        "Leadership/Management",
        "Creative/Design Skills",
        "Communication/Public Speaking",
        "Analytical/Research Skills",
        "Foreign Languages",
        "Business/Entrepreneurial Skills"
      ]
    },
    {
      question: "How quickly do you learn new tools or technologies?",
      options: [
        "Very quickly - I enjoy the challenge",
        "Fairly quickly with good resources",
        "At an average pace",
        "I prefer to master one thing before learning another",
        "I find learning new technologies challenging"
      ]
    },
    {
      question: "How do you prefer to solve complex problems?",
      options: [
        "Research thoroughly before acting",
        "Collaborate with others for diverse perspectives",
        "Trial and error experimentation",
        "Break it down into smaller components",
        "Use intuition and past experience",
        "Find an expert or established solution"
      ]
    },
    {
      question: "Which of these tools or technologies are you most comfortable with?",
      options: [
        "Microsoft Office/Google Workspace",
        "Programming Languages (Python, Java, etc.)",
        "Creative Software (Adobe, Design Tools)",
        "Data Analysis Tools (SQL, Excel, BI tools)",
        "Project Management Software",
        "Social Media/Digital Marketing Tools",
        "Industry-Specific Software"
      ]
    }
  ],
  workstyle: [
    {
      intro: "Let's understand your work preferences and style.",
      question: "What type of work environment do you prefer?",
      options: [
        "Structured corporate environment",
        "Small business or startup",
        "Remote/work from home",
        "Field work/changing locations",
        "Creative or collaborative workspace",
        "Academic or research setting"
      ]
    },
    {
      question: "How do you prefer to interact with colleagues?",
      options: [
        "Frequent collaboration and teamwork",
        "Balance of teamwork and independent work",
        "Mostly independent with occasional collaboration",
        "Leading or managing others",
        "Working entirely independently"
      ]
    },
    {
      question: "What is your ideal work-life balance?",
      options: [
        "Standard 9-5 with clear boundaries",
        "Flexible hours but consistent schedule",
        "Project-based with varying intensity",
        "Willing to work long hours for career advancement",
        "Part-time or reduced hours",
        "Seasonal work with time off periods"
      ]
    },
    {
      question: "Do you prefer leading or being part of a team?",
      options: [
        "Leading a team",
        "Individual contributor with some leadership",
        "Part of a collaborative team",
        "Working independently within a team structure",
        "Purely individual contributor"
      ]
    },
    {
      question: "How do you handle work-related stress and pressure?",
      options: [
        "Thrive under pressure - it motivates me",
        "Handle it well with good organization",
        "Prefer a moderate, consistent pace",
        "Occasional pressure is fine but not constantly",
        "Prefer low-pressure environments",
        "Stress significantly affects my performance"
      ]
    },
    {
      question: "How important is a diverse and inclusive workplace to you?",
      options: [
        "Essential - I seek this specifically",
        "Very important",
        "Somewhat important",
        "Not a major factor in my decision",
        "I haven't thought much about it"
      ]
    }
  ],
  goals: [
    {
      intro: "Finally, let's discuss your career goals and aspirations.",
      question: "What are your primary career goals for the next 5 years?",
      options: [
        "Advance to a senior or management position",
        "Develop specialized expertise",
        "Change career fields or industries",
        "Start my own business",
        "Achieve better work-life balance",
        "Increase income/financial stability",
        "Make a positive impact/meaningful work"
      ]
    },
    {
      question: "How important is career growth and advancement to you?",
      options: [
        "Extremely important - rapid advancement",
        "Very important but balanced with other factors",
        "Moderately important",
        "Less important than job satisfaction",
        "Not very important - stability is my priority"
      ]
    },
    {
      question: "What impact would you like to make through your work?",
      options: [
        "Help individuals directly",
        "Create innovative solutions or products",
        "Advance knowledge in a field",
        "Environmental or social change",
        "Economic or business impact",
        "Creative or cultural contributions",
        "Educational impact"
      ]
    },
    {
      question: "How do you define career success?",
      options: [
        "Financial rewards and security",
        "Recognition and prestige",
        "Work-life balance and personal fulfillment",
        "Making a difference/positive impact",
        "Continuous learning and growth",
        "Leadership and influence",
        "Creative expression and innovation"
      ]
    },
    {
      question: "Where do you see yourself in 10+ years?",
      options: [
        "Executive or senior leadership",
        "Recognized expert in my field",
        "Business owner or entrepreneur",
        "Retired or working part-time",
        "Switched to a different career",
        "Teaching or mentoring others",
        "Unsure but open to opportunities"
      ]
    },
    {
      question: "Which values are most important to you in a career?",
      options: [
        "Innovation and creativity",
        "Helping others/social impact",
        "Financial success",
        "Independence and autonomy",
        "Stability and security",
        "Recognition and status",
        "Balance and wellbeing"
      ]
    }
  ]
};
