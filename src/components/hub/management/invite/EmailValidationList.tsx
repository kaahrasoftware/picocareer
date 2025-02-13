
import { EmailValidationResult } from "./types";

interface EmailValidationListProps {
  validatedEmails: EmailValidationResult[];
}

export function EmailValidationList({ validatedEmails }: EmailValidationListProps) {
  if (validatedEmails.length === 0) return null;

  return (
    <div className="text-sm space-y-1">
      {validatedEmails.map((result, index) => (
        <div 
          key={index}
          className={`flex items-center gap-2 ${
            result.exists ? 'text-green-500' : 'text-red-500'
          }`}
        >
          <span>•</span>
          <span>{result.email}</span>
          <span className="text-xs">
            {result.exists ? '(valid)' : '(not registered)'}
          </span>
        </div>
      ))}
    </div>
  );
}
