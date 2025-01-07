import { useState } from "react";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormFieldProps } from "@/components/forms/FormField";

const SchoolUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formFields: (FormFieldProps & { defaultValue?: any })[] = [
    {
      name: "name",
      label: "School Name",
      type: "text",
      placeholder: "Enter school name",
      required: true
    },
    {
      name: "location",
      label: "Location",
      type: "select",
      placeholder: "Select state",
      required: true,
      options: [
        { id: "Alabama - AL", title: "Alabama - AL" },
        { id: "Alaska - AK", title: "Alaska - AK" },
        { id: "Arizona - AZ", title: "Arizona - AZ" },
        { id: "Arkansas - AR", title: "Arkansas - AR" },
        { id: "California - CA", title: "California - CA" },
        { id: "Colorado - CO", title: "Colorado - CO" },
        { id: "Connecticut - CT", title: "Connecticut - CT" },
        { id: "Delaware - DE", title: "Delaware - DE" },
        { id: "Florida - FL", title: "Florida - FL" },
        { id: "Georgia - GA", title: "Georgia - GA" },
        { id: "Hawaii - HI", title: "Hawaii - HI" },
        { id: "Idaho - ID", title: "Idaho - ID" },
        { id: "Illinois - IL", title: "Illinois - IL" },
        { id: "Indiana - IN", title: "Indiana - IN" },
        { id: "Iowa - IA", title: "Iowa - IA" },
        { id: "Kansas - KS", title: "Kansas - KS" },
        { id: "Kentucky - KY", title: "Kentucky - KY" },
        { id: "Louisiana - LA", title: "Louisiana - LA" },
        { id: "Maine - ME", title: "Maine - ME" },
        { id: "Maryland - MD", title: "Maryland - MD" },
        { id: "Massachusetts - MA", title: "Massachusetts - MA" },
        { id: "Michigan - MI", title: "Michigan - MI" },
        { id: "Minnesota - MN", title: "Minnesota - MN" },
        { id: "Mississippi - MS", title: "Mississippi - MS" },
        { id: "Missouri - MO", title: "Missouri - MO" },
        { id: "Montana - MT", title: "Montana - MT" },
        { id: "Nebraska - NE", title: "Nebraska - NE" },
        { id: "Nevada - NV", title: "Nevada - NV" },
        { id: "New Hampshire - NH", title: "New Hampshire - NH" },
        { id: "New Jersey - NJ", title: "New Jersey - NJ" },
        { id: "New Mexico - NM", title: "New Mexico - NM" },
        { id: "New York - NY", title: "New York - NY" },
        { id: "North Carolina - NC", title: "North Carolina - NC" },
        { id: "North Dakota - ND", title: "North Dakota - ND" },
        { id: "Ohio - OH", title: "Ohio - OH" },
        { id: "Oklahoma - OK", title: "Oklahoma - OK" },
        { id: "Oregon - OR", title: "Oregon - OR" },
        { id: "Pennsylvania - PA", title: "Pennsylvania - PA" },
        { id: "Rhode Island - RI", title: "Rhode Island - RI" },
        { id: "South Carolina - SC", title: "South Carolina - SC" },
        { id: "South Dakota - SD", title: "South Dakota - SD" },
        { id: "Tennessee - TN", title: "Tennessee - TN" },
        { id: "Texas - TX", title: "Texas - TX" },
        { id: "Utah - UT", title: "Utah - UT" },
        { id: "Vermont - VT", title: "Vermont - VT" },
        { id: "Virginia - VA", title: "Virginia - VA" },
        { id: "Washington - WA", title: "Washington - WA" },
        { id: "West Virginia - WV", title: "West Virginia - WV" },
        { id: "Wisconsin - WI", title: "Wisconsin - WI" },
        { id: "Wyoming - WY", title: "Wyoming - WY" }
      ]
    },
    {
      name: "type",
      label: "School Type",
      type: "select",
      placeholder: "Select school type",
      required: true,
      options: [
        { id: "High School", title: "High School" },
        { id: "Community College", title: "Community College" },
        { id: "University", title: "University" },
        { id: "Other", title: "Other" }
      ]
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "Enter school website URL",
      description: "Optional: Include the full URL (e.g., https://www.school.edu)"
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate",
      type: "number",
      placeholder: "Enter acceptance rate (0-100)",
      description: "Optional: Enter a number between 0 and 100"
    }
  ];

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Convert acceptance_rate to a decimal if provided
      if (data.acceptance_rate) {
        data.acceptance_rate = parseFloat(data.acceptance_rate) / 100;
      }

      const { error } = await supabase
        .from('schools')
        .insert([{
          name: data.name,
          location: data.location,
          type: data.type,
          website: data.website || null,
          acceptance_rate: data.acceptance_rate || null,
          status: 'Pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School has been submitted for review.",
      });

    } catch (error: any) {
      console.error('Error submitting school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit a New School</h1>
        <p className="text-gray-600 mb-6">
          Please fill out the form below to submit a new school. All submissions will be reviewed before being published.
        </p>
        <GenericUploadForm
          fields={formFields}
          onSubmit={handleSubmit}
          buttonText="Submit School"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SchoolUpload;