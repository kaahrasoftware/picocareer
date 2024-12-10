import { Card } from "@/components/ui/card";

interface CareerCardProps {
  title: string;
  description: string;
  users: string;
  salary: string;
  imageUrl: string;
}

export function CareerCard({ title, description, users, salary, imageUrl }: CareerCardProps) {
  return (
    <Card className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-kahra-darker z-10" />
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="relative z-20 p-4 text-white">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 mb-4">{description}</p>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{users} Users</span>
          <span>{salary}</span>
        </div>
      </div>
    </Card>
  );
}