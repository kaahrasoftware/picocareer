import React from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProfileHeader() {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 dark:bg-kahra-darker/80">
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

      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex gap-2 pb-2">
          <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-sm whitespace-nowrap">
            biochemical engineering
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-400 text-sm whitespace-nowrap">
            microbiology
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 text-sm whitespace-nowrap">
            Bioreactor
          </span>
          <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-400 text-sm whitespace-nowrap">
            Genetic engineering
          </span>
          <span className="px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-400 text-sm whitespace-nowrap">
            GMP
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-400 text-sm whitespace-nowrap">
            MATLAB
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-900/50 text-gray-400 text-sm whitespace-nowrap">
            AutoCAD
          </span>
          <span className="px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-400 text-sm whitespace-nowrap">
            Computational modeling
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 text-sm whitespace-nowrap">
            Mathematical modeling
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-900/50 text-gray-400 text-sm whitespace-nowrap">
            Engineer-in-Training
          </span>
          <span className="px-3 py-1 rounded-full bg-orange-900/50 text-orange-400 text-sm whitespace-nowrap">
            Six Sigma
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-400 text-sm whitespace-nowrap">
            Data analysis
          </span>
        </div>
      </ScrollArea>
    </div>
  );
}