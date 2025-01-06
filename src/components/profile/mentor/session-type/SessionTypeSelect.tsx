import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Control } from "react-hook-form";
import { SESSION_TYPE_OPTIONS, SessionTypeEnum } from "@/types/session";
import { SessionTypeFormData } from "./types";

// Session type descriptions
const SESSION_TYPE_DESCRIPTIONS: Record<SessionTypeEnum, string> = {
  "Know About my Career": "Get insights about specific career paths, day-to-day responsibilities, challenges, and growth opportunities from experienced professionals.",
  "Resume/CV Review": "Receive detailed feedback on your resume/CV structure, content, and formatting to make it stand out to employers.",
  "Campus France": "Learn about studying in France, application processes, documentation requirements, and cultural preparation.",
  "Undergrad Application": "Get guidance on undergraduate application processes, essay writing, school selection, and application strategies.",
  "Grad Application": "Receive advice on graduate school applications, research proposals, statement of purpose, and program selection.",
  "TOEFL Exam Prep Advice": "Get tips and strategies for TOEFL exam preparation, including study plans and practice resources.",
  "IELTS Exam Prep Advice": "Learn effective preparation strategies for IELTS, including tips for all test sections.",
  "Duolingo Exam Prep Advice": "Get guidance on preparing for the Duolingo English Test, including format and practice strategies.",
  "SAT Exam Prep Advise": "Receive strategic advice for SAT preparation, including study planning and test-taking techniques.",
  "ACT Exam Prep Advice": "Learn effective strategies for ACT preparation across all test sections.",
  "GRE Exam Prep Advice": "Get comprehensive guidance on GRE preparation, including study materials and test strategies.",
  "GMAT Exam Prep Advice": "Receive strategic advice for GMAT preparation, including quantitative and verbal sections.",
  "MCAT Exam Prep Advice": "Learn about effective MCAT preparation strategies and resource management.",
  "LSAT Exam Prep Advice": "Get guidance on LSAT preparation, including logical reasoning and analytical skills.",
  "DAT Exam Prep Advice": "Receive preparation strategies for the Dental Admission Test.",
  "Advice for PhD Students": "Get insights on PhD program navigation, research planning, and academic career development.",
  "How to Find Grants/Fellowships": "Learn strategies for identifying and applying to relevant grants and fellowships.",
  "Grant Writing Guidance": "Get tips on writing compelling grant proposals and funding applications.",
  "Interview Prep": "Prepare for interviews with mock sessions, common questions, and industry-specific advice.",
  "How to Succeed as a College Student": "Learn effective study habits, time management, and college life balance strategies.",
  "Investment Strategies": "Get basic guidance on personal finance and investment planning for students.",
  "Study Abroad Programs": "Learn about study abroad opportunities, application processes, and preparation tips.",
  "Tips for F-1 Students": "Get guidance on F-1 visa requirements, maintenance, and student life in the US.",
  "College Application Last Review": "Get a final review of your college application materials before submission.",
  "Application Essays Review": "Receive feedback on your application essays' content, structure, and impact.",
  "I need someone to practice my presentation with": "Practice and receive feedback on presentation delivery and content.",
  "Study Tips": "Learn effective study techniques, time management, and academic success strategies.",
  "Volunteer Opportunities": "Discover meaningful volunteer opportunities and their impact on personal growth.",
  "Know About my Academic Major": "Get detailed insights about specific academic majors, coursework, and career prospects."
};

interface SessionTypeSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
  availableTypes: SessionTypeEnum[];
}

export function SessionTypeSelect({ form, availableTypes }: SessionTypeSelectProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      rules={{ required: "Session type is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Session Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <TooltipProvider>
                {SESSION_TYPE_OPTIONS.filter(type => !availableTypes.includes(type)).map((type) => (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <SelectItem value={type}>
                        {type}
                      </SelectItem>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px] p-4">
                      <p>{SESSION_TYPE_DESCRIPTIONS[type]}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}