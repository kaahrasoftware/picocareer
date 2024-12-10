import React, { useEffect, useRef, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProfileHeader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const skills = [
    { text: "biochemical engineering", color: "green" },
    { text: "microbiology", color: "indigo" },
    { text: "Bioreactor", color: "blue" },
    { text: "Genetic engineering", color: "red" },
    { text: "GMP", color: "yellow" },
    { text: "MATLAB", color: "purple" },
    { text: "AutoCAD", color: "gray" },
    { text: "Computational modeling", color: "yellow" },
    { text: "Mathematical modeling", color: "blue" },
    { text: "Engineer-in-Training", color: "gray" },
    { text: "Six Sigma", color: "orange" },
    { text: "Data analysis", color: "purple" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 4 >= skills.length ? 0 : prevIndex + 1
      );
    }, 500);

    return () => clearInterval(interval);
  }, [skills.length]);

  const visibleSkills = [...skills.slice(currentIndex, currentIndex + 4)];
  if (visibleSkills.length < 4) {
    visibleSkills.push(...skills.slice(0, 4 - visibleSkills.length));
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border p-4 dark:bg-kahra-darker/80">
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-400">
            <img
              src="/placeholder.svg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <DialogTitle className="text-2xl font-bold">Bio-Chemical Engineering</DialogTitle>
            <p className="text-gray-400 dark:text-gray-400">NC State University</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">John Doe</h3>
            <p className="text-gray-400 dark:text-gray-400">@johndoe</p>
            <p className="text-gray-400 dark:text-gray-400">Austin, TX, USA</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-400 dark:text-gray-400">Mentees</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">495</p>
          <p className="text-sm text-gray-400 dark:text-gray-400">K-onnected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">35</p>
          <p className="text-sm text-gray-400 dark:text-gray-400">Recordings</p>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {visibleSkills.map((skill, index) => (
            <span
              key={`${skill.text}-${index}`}
              className={`px-3 py-1 rounded-full bg-${skill.color}-900/50 text-${skill.color}-400 text-sm whitespace-nowrap transition-all duration-300 ease-in-out`}
            >
              {skill.text}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}