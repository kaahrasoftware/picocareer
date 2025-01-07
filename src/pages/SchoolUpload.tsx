import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FormFieldProps } from "@/components/forms/FormField";

const SchoolUpload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const fields: (FormFieldProps & { defaultValue?: any })[] = [
    {
      name: "name",
      label: "School Name",
      type: "text",
      required: true,
      placeholder: "Enter school name",
    },
    {
      name: "location",
      label: "Location",
      type: "select",
      required: true,
      placeholder: "Select state",
      options: [
        { id: "Alabama - AL", name: "Alabama - AL" },
        { id: "Alaska - AK", name: "Alaska - AK" },
        { id: "Arizona - AZ", name: "Arizona - AZ" },
        { id: "Arkansas - AR", name: "Arkansas - AR" },
        { id: "California - CA", name: "California - CA" },
        { id: "Colorado - CO", name: "Colorado - CO" },
        { id: "Connecticut - CT", name: "Connecticut - CT" },
        { id: "Delaware - DE", name: "Delaware - DE" },
        { id: "Florida - FL", name: "Florida - FL" },
        { id: "Georgia - GA", name: "Georgia - GA" },
        { id: "Hawaii - HI", name: "Hawaii - HI" },
        { id: "Idaho - ID", name: "Idaho - ID" },
        { id: "Illinois - IL", name: "Illinois - IL" },
        { id: "Indiana - IN", name: "Indiana - IN" },
        { id: "Iowa - IA", name: "Iowa - IA" },
        { id: "Kansas - KS", name: "Kansas - KS" },
        { id: "Kentucky - KY", name: "Kentucky - KY" },
        { id: "Louisiana - LA", name: "Louisiana - LA" },
        { id: "Maine - ME", name: "Maine - ME" },
        { id: "Maryland - MD", name: "Maryland - MD" },
        { id: "Massachusetts - MA", name: "Massachusetts - MA" },
        { id: "Michigan - MI", name: "Michigan - MI" },
        { id: "Minnesota - MN", name: "Minnesota - MN" },
        { id: "Mississippi - MS", name: "Mississippi - MS" },
        { id: "Missouri - MO", name: "Missouri - MO" },
        { id: "Montana - MT", name: "Montana - MT" },
        { id: "Nebraska - NE", name: "Nebraska - NE" },
        { id: "Nevada - NV", name: "Nevada - NV" },
        { id: "New Hampshire - NH", name: "New Hampshire - NH" },
        { id: "New Jersey - NJ", name: "New Jersey - NJ" },
        { id: "New Mexico - NM", name: "New Mexico - NM" },
        { id: "New York - NY", name: "New York - NY" },
        { id: "North Carolina - NC", name: "North Carolina - NC" },
        { id: "North Dakota - ND", name: "North Dakota - ND" },
        { id: "Ohio - OH", name: "Ohio - OH" },
        { id: "Oklahoma - OK", name: "Oklahoma - OK" },
        { id: "Oregon - OR", name: "Oregon - OR" },
        { id: "Pennsylvania - PA", name: "Pennsylvania - PA" },
        { id: "Rhode Island - RI", name: "Rhode Island - RI" },
        { id: "South Carolina - SC", name: "South Carolina - SC" },
        { id: "South Dakota - SD", name: "South Dakota - SD" },
        { id: "Tennessee - TN", name: "Tennessee - TN" },
        { id: "Texas - TX", name: "Texas - TX" },
        { id: "Utah - UT", name: "Utah - UT" },
        { id: "Vermont - VT", name: "Vermont - VT" },
        { id: "Virginia - VA", name: "Virginia - VA" },
        { id: "Washington - WA", name: "Washington - WA" },
        { id: "West Virginia - WV", name: "West Virginia - WV" },
        { id: "Wisconsin - WI", name: "Wisconsin - WI" },
        { id: "Wyoming - WY", name: "Wyoming - WY" },
      ],
    },
    {
      name: "type",
      label: "School Type",
      type: "select",
      required: true,
      placeholder: "Select school type",
      options: [
        { id: "High School", name: "High School" },
        { id: "Community College", name: "Community College" },
        { id: "University", name: "University" },
        { id: "Other", name: "Other" },
      ],
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "Enter school website URL",
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate (%)",
      type: "number",
      placeholder: "Enter acceptance rate (0-100)",
      description: "Enter a number between 0 and 100",
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from("schools").insert({
        name: data.name,
        location: data.location,
        type: data.type,
        website: data.website || null,
        acceptance_rate: data.acceptance_rate ? parseFloat(data.acceptance_rate) / 100 : null,
        status: "Pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "School has been submitted for review.",
      });

      navigate("/school");
    } catch (error) {
      console.error("Error submitting school:", error);
      toast({
        title: "Error",
        description: "Failed to submit school. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit a New School</h1>
        <GenericUploadForm
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Submit School"
        />
      </div>
    </div>
  );
};

export default SchoolUpload;