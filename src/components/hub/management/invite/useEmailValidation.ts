
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmailValidationResult } from "./types";

export function useEmailValidation() {
  const [validatedEmails, setValidatedEmails] = useState<EmailValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateEmails = async (emails: string[]) => {
    setIsValidating(true);
    try {
      const results: EmailValidationResult[] = [];
      
      for (const email of emails) {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email.trim())
          .maybeSingle();
          
        results.push({
          email: email.trim(),
          exists: !!data
        });
      }
      
      setValidatedEmails(results);
      return results;
    } catch (error) {
      console.error('Error validating emails:', error);
      return [];
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validatedEmails,
    isValidating,
    validateEmails,
    setValidatedEmails
  };
}
