
import { RichTextEditor } from "@/components/forms/RichTextEditor";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  hubId: string;
}

export function ContentEditor({ value, onChange, hubId }: ContentEditorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Content</label>
      <div className="w-full">
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Enter announcement content"
          uploadConfig={{
            bucket: "hub_resources",
            folderPath: `hubs/${hubId}/announcements`
          }}
        />
      </div>
    </div>
  );
}
