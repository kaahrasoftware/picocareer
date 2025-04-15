
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if email exists
      const { data: existingEmail } = await supabase
        .from('email_subscriptions')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        toast.error('This email is already subscribed to our newsletter');
        return;
      }

      // If email doesn't exist, insert it
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ email }]);

      if (error) throw error;

      toast.success('Thank you for subscribing to our newsletter!');
      setEmail(''); // Clear the input after successful submission
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      // Handle specific error cases
      if (error.code === '23505') {
        toast.error('This email is already subscribed to our newsletter');
      } else {
        toast.error('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full md:w-auto max-w-md">
      <form onSubmit={handleEmailSubmit} className="relative">
        <div className="flex items-center">
          <input
            type="email"
            placeholder="Subscribe to our newsletter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-l-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Get the latest updates, resources, and opportunities
        </p>
      </form>
    </div>
  );
}
