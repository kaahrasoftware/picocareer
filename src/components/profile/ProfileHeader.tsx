import React from "react";
import { DialogTitle } from "@/components/ui/dialog";

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
        <div>
          <DialogTitle className="text-2xl font-bold">Bio-Chemical Engineering</DialogTitle>
          <p className="text-gray-400 dark:text-gray-400">NC State University</p>
          <div className="mt-2">
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

      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-sm">
          biochemical engineering
        </span>
        <span className="px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-400 text-sm">
          microbiology
        </span>
      </div>
    </div>
  );
}