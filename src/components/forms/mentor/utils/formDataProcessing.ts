
import type { FormValues } from "../types";

// Convert comma-separated strings to arrays for submission
export const processFormDataForSubmission = (data: FormValues): FormValues => {
  const processedData = { ...data };
  
  // Convert textarea fields to arrays
  const arrayFields = ['skills', 'tools_used', 'keywords', 'fields_of_interest'];
  
  arrayFields.forEach(field => {
    if (processedData[field as keyof FormValues] && typeof processedData[field as keyof FormValues] === 'string') {
      const value = processedData[field as keyof FormValues] as string;
      (processedData as any)[field] = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  });
  
  return processedData;
};

// Convert arrays to comma-separated strings for form display
export const processFormDataForDisplay = (data: any): FormValues => {
  const processedData = { ...data };
  
  // Convert array fields to strings
  const arrayFields = ['skills', 'tools_used', 'keywords', 'fields_of_interest'];
  
  arrayFields.forEach(field => {
    if (processedData[field] && Array.isArray(processedData[field])) {
      processedData[field] = processedData[field].join(', ');
    }
  });
  
  return processedData;
};
