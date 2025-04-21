
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactDetails = [
  {
    label: "Email",
    value: "info@picocareer.com",
    icon: Mail,
    href: "mailto:info@picocareer.com"
  },
  {
    label: "Phone (USA)",
    value: "+1 (919) 443-5301",
    icon: Phone,
    href: "tel:+19194435301"
  },
  {
    label: "Phone (Kenya)",
    value: "+254 (742) 486-604",
    icon: Phone,
    href: "tel:+254742486604"
  },
  {
    label: "Phone (Togo)",
    value: "+228 (97) 47-64-46",
    icon: Phone,
    href: "tel:+22897476446"
  },
  {
    label: "Address",
    value: "131 Continental Dr Suite 305 Newark, DE, 19713 US",
    icon: MapPin
  }
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Contact form data:', data);
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:gap-10 gap-6 items-stretch">
        {/* Contact Info Panel */}
        <Card className="md:w-1/2 w-full bg-[#F1F0FB] border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-[#6E59A5]">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5">
              {contactDetails.map((item, idx) => (
                <li key={item.label} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-[#E5DEFF] text-[#6E59A5] rounded-md mr-3">
                    <item.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-sm text-[#6E59A5]">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-base text-[#403E43] hover:text-[#8B5CF6] transition-all underline underline-offset-2"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-base text-[#403E43]">{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Contact Form */}
        <Card className="md:w-1/2 w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-[#6E59A5]">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#403E43]">Name</label>
                <Input id="name" {...register("name", { required: true })} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#403E43]">Email</label>
                <Input id="email" type="email" {...register("email", { required: true })} />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2 text-[#403E43]">Subject</label>
                <Input id="subject" {...register("subject", { required: true })} />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-[#403E43]">Message</label>
                <Textarea id="message" {...register("message", { required: true })} rows={5} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
