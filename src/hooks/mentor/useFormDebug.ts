
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useFormDebug(form: UseFormReturn<any>) {
  const values = form.watch();
  const errors = form.formState.errors;
  const isValid = form.formState.isValid;

  useEffect(() => {
    console.log('Form Debug Info:', {
      isValid,
      errors,
      values,
      touchedFields: form.formState.touchedFields,
      dirtyFields: form.formState.dirtyFields,
    });
  }, [values, errors, isValid, form.formState.touchedFields, form.formState.dirtyFields]);

  return { values, errors, isValid };
}
