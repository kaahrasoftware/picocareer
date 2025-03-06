
import { QuestionBank } from './question-types';

/**
 * Structured question bank for career assessment
 */

export const CATEGORIES = ['education', 'skills', 'workstyle', 'goals'];

export const questionBank: QuestionBank = {
  "education": {
    "name": "Education Background",
    "description": "Questions about your educational history and learning preferences",
    "questions": [
      {
        "id": "edu-1",
        "text": "What is your highest level of education?",
        "allowCustom": true,
        "customPrompt": "Tell us about your education level",
        "options": [
          { "id": "e1-1", "text": "High School" },
          { "id": "e1-2", "text": "Bachelor's Degree" },
          { "id": "e1-3", "text": "Master's Degree" },
          { "id": "e1-4", "text": "Doctorate" },
          { "id": "e1-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "edu-2",
        "text": "Which field of study interests you most?",
        "allowCustom": true,
        "customPrompt": "Tell us about your field of interest",
        "options": [
          { "id": "e2-1", "text": "Science & Technology" },
          { "id": "e2-2", "text": "Business & Economics" },
          { "id": "e2-3", "text": "Arts & Humanities" },
          { "id": "e2-4", "text": "Healthcare" },
          { "id": "e2-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "edu-3",
        "text": "How do you prefer to learn new things?",
        "allowCustom": true,
        "customPrompt": "Describe your learning style",
        "options": [
          { "id": "e3-1", "text": "Hands-on Practice" },
          { "id": "e3-2", "text": "Reading & Research" },
          { "id": "e3-3", "text": "Visual Learning" },
          { "id": "e3-4", "text": "Group Discussion" },
          { "id": "e3-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "edu-4",
        "text": "What are your academic achievements?",
        "allowCustom": true,
        "customPrompt": "Tell us about your achievements",
        "options": [
          { "id": "e4-1", "text": "High Academic Honors" },
          { "id": "e4-2", "text": "Strong Project Portfolio" },
          { "id": "e4-3", "text": "Research Experience" },
          { "id": "e4-4", "text": "Leadership Activities" },
          { "id": "e4-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "edu-5",
        "text": "Your preferred learning environment?",
        "allowCustom": true,
        "customPrompt": "Describe your ideal learning environment",
        "options": [
          { "id": "e5-1", "text": "Traditional Classroom" },
          { "id": "e5-2", "text": "Online Learning" },
          { "id": "e5-3", "text": "Practical Workshops" },
          { "id": "e5-4", "text": "Self-Directed Study" },
          { "id": "e5-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "edu-6",
        "text": "Future education plans?",
        "allowCustom": true,
        "customPrompt": "Tell us about your education plans",
        "options": [
          { "id": "e6-1", "text": "Advanced Degree" },
          { "id": "e6-2", "text": "Professional Certificates" },
          { "id": "e6-3", "text": "Skill-Specific Training" },
          { "id": "e6-4", "text": "Continuous Learning" },
          { "id": "e6-custom", "text": "Other (specify)" }
        ]
      }
    ]
  },
  "skills": {
    "name": "Skills & Abilities",
    "description": "Questions about your technical and soft skills",
    "questions": [
      {
        "id": "skill-1",
        "text": "Your strongest technical skills?",
        "allowCustom": true,
        "customPrompt": "Tell us about your technical skills",
        "options": [
          { "id": "s1-1", "text": "Data & Analytics" },
          { "id": "s1-2", "text": "Programming" },
          { "id": "s1-3", "text": "Design & Creative" },
          { "id": "s1-4", "text": "Technical Writing" },
          { "id": "s1-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "skill-2",
        "text": "Best soft skill?",
        "allowCustom": true,
        "customPrompt": "Tell us about your soft skills",
        "options": [
          { "id": "s2-1", "text": "Communication" },
          { "id": "s2-2", "text": "Leadership" },
          { "id": "s2-3", "text": "Problem Solving" },
          { "id": "s2-4", "text": "Team Collaboration" },
          { "id": "s2-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "skill-3",
        "text": "Natural talents?",
        "allowCustom": true,
        "customPrompt": "Tell us about your natural talents",
        "options": [
          { "id": "s3-1", "text": "Creative Thinking" },
          { "id": "s3-2", "text": "Strategic Planning" },
          { "id": "s3-3", "text": "People Management" },
          { "id": "s3-4", "text": "Technical Aptitude" },
          { "id": "s3-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "skill-4",
        "text": "Area of expertise?",
        "allowCustom": true,
        "customPrompt": "Tell us about your expertise",
        "options": [
          { "id": "s4-1", "text": "Technical Systems" },
          { "id": "s4-2", "text": "Business Operations" },
          { "id": "s4-3", "text": "Creative Production" },
          { "id": "s4-4", "text": "People Development" },
          { "id": "s4-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "skill-5",
        "text": "Skills you want to develop?",
        "allowCustom": true,
        "customPrompt": "Tell us what skills you want to develop",
        "options": [
          { "id": "s5-1", "text": "Advanced Tech Skills" },
          { "id": "s5-2", "text": "Management Abilities" },
          { "id": "s5-3", "text": "Creative Expertise" },
          { "id": "s5-4", "text": "Leadership Qualities" },
          { "id": "s5-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "skill-6",
        "text": "Problem-solving approach?",
        "allowCustom": true,
        "customPrompt": "Describe how you solve problems",
        "options": [
          { "id": "s6-1", "text": "Analytical Thinking" },
          { "id": "s6-2", "text": "Creative Solutions" },
          { "id": "s6-3", "text": "Collaborative Approach" },
          { "id": "s6-4", "text": "Systematic Method" },
          { "id": "s6-custom", "text": "Other (specify)" }
        ]
      }
    ]
  },
  "workstyle": {
    "name": "Work Environment & Style",
    "description": "Questions about your preferred work environment and style",
    "questions": [
      {
        "id": "work-1",
        "text": "Preferred work environment?",
        "allowCustom": true,
        "customPrompt": "Describe your ideal work environment",
        "options": [
          { "id": "w1-1", "text": "Traditional Office" },
          { "id": "w1-2", "text": "Remote Work" },
          { "id": "w1-3", "text": "Hybrid Setting" },
          { "id": "w1-4", "text": "Field Work" },
          { "id": "w1-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "work-2",
        "text": "Team dynamics preference?",
        "allowCustom": true,
        "customPrompt": "Describe your preferred team dynamics",
        "options": [
          { "id": "w2-1", "text": "Independent Work" },
          { "id": "w2-2", "text": "Team Collaboration" },
          { "id": "w2-3", "text": "Leadership Role" },
          { "id": "w2-4", "text": "Mixed Interaction" },
          { "id": "w2-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "work-3",
        "text": "Work-life balance priority?",
        "allowCustom": true,
        "customPrompt": "Tell us about your work-life balance priorities",
        "options": [
          { "id": "w3-1", "text": "Fixed Schedule" },
          { "id": "w3-2", "text": "Flexible Hours" },
          { "id": "w3-3", "text": "Results-Focused" },
          { "id": "w3-4", "text": "Project-Based" },
          { "id": "w3-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "work-4",
        "text": "Leadership style?",
        "allowCustom": true,
        "customPrompt": "Describe your leadership style",
        "options": [
          { "id": "w4-1", "text": "Directive" },
          { "id": "w4-2", "text": "Collaborative" },
          { "id": "w4-3", "text": "Supportive" },
          { "id": "w4-4", "text": "Delegative" },
          { "id": "w4-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "work-5",
        "text": "Communication preference?",
        "allowCustom": true,
        "customPrompt": "Tell us how you prefer to communicate",
        "options": [
          { "id": "w5-1", "text": "Written" },
          { "id": "w5-2", "text": "Verbal" },
          { "id": "w5-3", "text": "Visual" },
          { "id": "w5-4", "text": "Mixed Methods" },
          { "id": "w5-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "work-6",
        "text": "Stress management approach?",
        "allowCustom": true,
        "customPrompt": "How do you manage stress at work?",
        "options": [
          { "id": "w6-1", "text": "Planning & Organization" },
          { "id": "w6-2", "text": "Regular Breaks" },
          { "id": "w6-3", "text": "Team Support" },
          { "id": "w6-4", "text": "Problem Prioritization" },
          { "id": "w6-custom", "text": "Other (specify)" }
        ]
      }
    ]
  },
  "goals": {
    "name": "Career Goals & Values",
    "description": "Questions about your career aspirations and values",
    "questions": [
      {
        "id": "goal-1",
        "text": "Career aspirations?",
        "allowCustom": true,
        "customPrompt": "Tell us about your career aspirations",
        "options": [
          { "id": "g1-1", "text": "Executive Leadership" },
          { "id": "g1-2", "text": "Expert/Specialist" },
          { "id": "g1-3", "text": "Entrepreneur" },
          { "id": "g1-4", "text": "Project Manager" },
          { "id": "g1-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "goal-2",
        "text": "Growth priority?",
        "allowCustom": true,
        "customPrompt": "What's your top professional growth priority?",
        "options": [
          { "id": "g2-1", "text": "Skill Development" },
          { "id": "g2-2", "text": "Career Advancement" },
          { "id": "g2-3", "text": "Income Growth" },
          { "id": "g2-4", "text": "Work-Life Balance" },
          { "id": "g2-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "goal-3",
        "text": "Desired impact?",
        "allowCustom": true,
        "customPrompt": "What kind of impact do you want to make?",
        "options": [
          { "id": "g3-1", "text": "Social Change" },
          { "id": "g3-2", "text": "Innovation" },
          { "id": "g3-3", "text": "Business Success" },
          { "id": "g3-4", "text": "Knowledge Sharing" },
          { "id": "g3-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "goal-4",
        "text": "Definition of success?",
        "allowCustom": true,
        "customPrompt": "How do you define professional success?",
        "options": [
          { "id": "g4-1", "text": "Financial Rewards" },
          { "id": "g4-2", "text": "Personal Growth" },
          { "id": "g4-3", "text": "Recognition" },
          { "id": "g4-4", "text": "Making a Difference" },
          { "id": "g4-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "goal-5",
        "text": "Professional vision?",
        "allowCustom": true,
        "customPrompt": "Describe your professional vision",
        "options": [
          { "id": "g5-1", "text": "Industry Leader" },
          { "id": "g5-2", "text": "Innovator" },
          { "id": "g5-3", "text": "Mentor" },
          { "id": "g5-4", "text": "Subject Expert" },
          { "id": "g5-custom", "text": "Other (specify)" }
        ]
      },
      {
        "id": "goal-6",
        "text": "Core work values?",
        "allowCustom": true,
        "customPrompt": "What values are most important to you at work?",
        "options": [
          { "id": "g6-1", "text": "Innovation" },
          { "id": "g6-2", "text": "Integrity" },
          { "id": "g6-3", "text": "Collaboration" },
          { "id": "g6-4", "text": "Excellence" },
          { "id": "g6-custom", "text": "Other (specify)" }
        ]
      }
    ]
  }
};

export default questionBank;
