
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { Textarea } from "@/components/ui/textarea";

interface ResourceBasicInfoProps {
  register: any;
}

export function ResourceBasicInfo({ register }: ResourceBasicInfoProps) {
  return (
    <>
      <BasicInputField
        field={register("title")}
        label="Title"
        placeholder="Enter resource title"
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          {...register("description")}
          placeholder="Enter resource description"
          className="min-h-[100px]"
        />
      </div>

      <BasicInputField
        field={register("category")}
        label="Category"
        placeholder="Enter resource category"
      />
    </>
  );
}
