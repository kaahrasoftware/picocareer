import React, { useState } from "react";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string;
  bucket?: string;
}

export function ImageUpload({ onChange, value, bucket }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(value || null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
    </div>
  );
}
