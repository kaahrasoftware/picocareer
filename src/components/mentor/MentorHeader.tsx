interface MentorHeaderProps {
  name: string;
  imageUrl?: string;
  image_url?: string;
}

export function MentorHeader({ name, imageUrl, image_url }: MentorHeaderProps) {
  const avatarUrl = imageUrl || image_url;
  
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden">
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      </div>
      <h2 className="text-2xl font-semibold">{name}</h2>
    </div>
  );
}