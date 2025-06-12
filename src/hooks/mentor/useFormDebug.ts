
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useFormDebug(form: UseFormReturn<any>) {
  const values = form.watch();
  const errors = form.formState.errors;
  const isValid = form.formState.isValid;

  useEffect(() => {
    console.log('Form Debug Info:', {
      isValid,
      hasErrors: Object.keys(errors).length > 0,
      errors,
      skillsValue: values.skills,
      skillsType: typeof values.skills,
      touchedFields: form.formState.touchedFields,
      dirtyFields: form.formState.dirtyFields,
    });

    // Check for potential data type issues
    const textFields = ['skills', 'tools_used', 'keywords', 'fields_of_interest'];
    textFields.forEach(field => {
      const value = values[field];
      if (value && typeof value !== 'string') {
        console.warn(`Field ${field} should be string but is:`, typeof value, value);
      }
    });
  }, [values, errors, isValid, form.formState.touchedFields, form.formState.dirtyFields]);

  return { values, errors, isValid };
}
