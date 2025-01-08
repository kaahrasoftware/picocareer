import { UseFormRegister } from "react-hook-form";
import type { FormFields } from "../types/form-types";

export interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
  schoolId: string;
}

export function PersonalInfoSection({ register, handleFieldChange, schoolId }: PersonalSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          id="firstName"
          {...register("firstName")}
          onChange={(e) => handleFieldChange("firstName", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          id="lastName"
          {...register("lastName")}
          onChange={(e) => handleFieldChange("lastName", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          id="phone"
          {...register("phone")}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="school" className="block text-sm font-medium text-gray-700">
          School
        </label>
        <select
          id="school"
          {...register("schoolId")}
          onChange={(e) => handleFieldChange("schoolId", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value={schoolId}>{schoolId}</option>
          {/* Add other school options here */}
        </select>
      </div>
    </div>
  );
}
