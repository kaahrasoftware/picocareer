import { Control, UseFormRegister } from "react-hook-form";

export interface FormFieldProps {
  control: Control<any> | UseFormRegister<any>;
  name: string;
  render?: ({ field }: { field: any }) => JSX.Element;
  children?: React.ReactNode;
}

export function FormField({ control, name, render, children }: FormFieldProps) {
  if (render) {
    return (
      <div>
        {render({
          field: {
            name,
            onChange: (value: any) => {
              if ('onChange' in control) {
                control.onChange(value);
              } else {
                control(name)(value);
              }
            },
            value: '',
            ref: (node: any) => {
              if ('ref' in control) {
                control.ref(node);
              }
            },
          },
        })}
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}