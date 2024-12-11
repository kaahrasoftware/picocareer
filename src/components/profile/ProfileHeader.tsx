import React, { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileHeader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const skills = [
    { text: "biochemical engineering", colorClass: "bg-green-900/50 text-green-400" },
    { text: "microbiology", colorClass: "bg-indigo-900/50 text-indigo-400" },
    { text: "Bioreactor", colorClass: "bg-blue-900/50 text-blue-400" },
    { text: "Genetic engineering", colorClass: "bg-red-900/50 text-red-400" },
    { text: "GMP", colorClass: "bg-yellow-900/50 text-yellow-400" },
    { text: "MATLAB", colorClass: "bg-purple-900/50 text-purple-400" },
    { text: "AutoCAD", colorClass: "bg-gray-900/50 text-gray-400" },
    { text: "Computational modeling", colorClass: "bg-yellow-900/50 text-yellow-400" },
    { text: "Mathematical modeling", colorClass: "bg-blue-900/50 text-blue-400" },
    { text: "Engineer-in-Training", colorClass: "bg-gray-900/50 text-gray-400" },
    { text: "Six Sigma", colorClass: "bg-orange-900/50 text-orange-400" },
    { text: "Data analysis", colorClass: "bg-purple-900/50 text-purple-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 6 >= skills.length ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [skills.length]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');
      
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const visibleSkills = [...skills.slice(currentIndex, currentIndex + 6)];
  if (visibleSkills.length < 6) {
    visibleSkills.push(...skills.slice(0, 6 - visibleSkills.length));
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border p-3 dark:bg-kahra-darker/80">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-400">
            <img
              src={avatarUrl || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadAvatar}
                disabled={uploading}
              />
              <Upload className="w-6 h-6 text-white" />
            </label>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <DialogTitle className="text-xl font-bold">Bio-Chemical Engineering</DialogTitle>
            <p className="text-sm text-gray-400 dark:text-gray-400">NC State University</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">John Doe</h3>
            <p className="text-sm text-gray-400 dark:text-gray-400">@johndoe</p>
            <p className="text-sm text-gray-400 dark:text-gray-400">Austin, TX, USA</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-xl font-bold">0</p>
          <p className="text-xs text-gray-400 dark:text-gray-400">Mentees</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">495</p>
          <p className="text-xs text-gray-400 dark:text-gray-400">K-onnected</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">35</p>
          <p className="text-xs text-gray-400 dark:text-gray-400">Recordings</p>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {visibleSkills.map((skill, index) => (
            <span
              key={`${skill.text}-${index}`}
              className={`px-2 py-0.5 rounded-full ${skill.colorClass} text-xs whitespace-nowrap transition-all duration-300 ease-in-out`}
            >
              {skill.text}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}