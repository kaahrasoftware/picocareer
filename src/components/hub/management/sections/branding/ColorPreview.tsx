
interface ColorPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function ColorPreview({ primaryColor, secondaryColor, accentColor }: ColorPreviewProps) {
  return (
    <div className="mt-6 p-4 rounded-lg border">
      <div className="text-sm font-medium mb-3">Live Preview</div>
      <div className="space-y-2">
        <div 
          className="h-16 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
          }}
        />
        <div className="flex gap-2">
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: secondaryColor }}
          />
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
