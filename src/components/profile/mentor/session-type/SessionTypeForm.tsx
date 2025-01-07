import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/forms/FormField";
import { SessionTypeFormData, SessionTypeFormProps } from "./types";
import { Button } from "@/components/ui/button";

export function SessionTypeForm({ 
  onSubmit, 
  onCancel, 
  onSuccess, 
  defaultValues, 
  isSubmitting 
}: SessionTypeFormProps) {
  const form = useForm<SessionTypeFormData>({
    defaultValues: defaultValues || {
      type: undefined,
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: ["Google Meet"],
      telegram_username: "",
      phone_number: ""
    }
  });

  const handleSubmit = async (data: SessionTypeFormData) => {
    try {
      await onSubmit(data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          name="type"
          control={form.control}
          label="Session Type"
          type="select"
          options={[
            { id: "First Touch", title: "First Touch" },
            { id: "Know About your Career", title: "Know About your Career" },
            { id: "Resume/CV Review", title: "Resume/CV Review" },
            { id: "Campus France", title: "Campus France" },
            { id: "Undergrad Application", title: "Undergrad Application" },
            { id: "Grad Application", title: "Grad Application" },
            { id: "TOEFL Exam Prep Advice", title: "TOEFL Exam Prep Advice" },
            { id: "IELTS Exam Prep Advice", title: "IELTS Exam Prep Advice" },
            { id: "Duolingo Exam Prep Advice", title: "Duolingo Exam Prep Advice" },
            { id: "SAT Exam Prep Advise", title: "SAT Exam Prep Advise" },
            { id: "ACT Exam Prep Advice", title: "ACT Exam Prep Advice" },
            { id: "GRE Exam Prep Advice", title: "GRE Exam Prep Advice" },
            { id: "GMAT Exam Prep Advice", title: "GMAT Exam Prep Advice" },
            { id: "MCAT Exam Prep Advice", title: "MCAT Exam Prep Advice" },
            { id: "LSAT Exam Prep Advice", title: "LSAT Exam Prep Advice" },
            { id: "DAT Exam Prep Advice", title: "DAT Exam Prep Advice" },
            { id: "Advice for PhD Students", title: "Advice for PhD Students" },
            { id: "How to Find Grants/Fellowships", title: "How to Find Grants/Fellowships" },
            { id: "Grant Writing Guidance", title: "Grant Writing Guidance" },
            { id: "Interview Prep", title: "Interview Prep" },
            { id: "How to Succeed as a College Student", title: "How to Succeed as a College Student" },
            { id: "Investment Strategies", title: "Investment Strategies" },
            { id: "Study Abroad Programs", title: "Study Abroad Programs" },
            { id: "Tips for F-1 Students", title: "Tips for F-1 Students" },
            { id: "College Application Last Review", title: "College Application Last Review" },
            { id: "Application Essays Review", title: "Application Essays Review" },
            { id: "I need someone to practice my presentation with", title: "I need someone to practice my presentation with" }
          ]}
          required
        />
        <FormField
          name="duration"
          control={form.control}
          label="Duration (minutes)"
          type="number"
          required
        />
        <FormField
          name="price"
          control={form.control}
          label="Price"
          type="number"
          required
        />
        <FormField
          name="description"
          control={form.control}
          label="Description"
          type="textarea"
          required
        />
        <FormField
          name="meeting_platform"
          control={form.control}
          label="Meeting Platform"
          type="select"
          options={[
            { id: "Google Meet", title: "Google Meet" },
            { id: "WhatsApp", title: "WhatsApp" },
            { id: "Telegram", title: "Telegram" },
            { id: "Phone Call", title: "Phone Call" }
          ]}
          required
        />
        <FormField
          name="telegram_username"
          control={form.control}
          label="Telegram Username"
          type="text"
        />
        <FormField
          name="phone_number"
          control={form.control}
          label="Phone Number"
          type="text"
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}