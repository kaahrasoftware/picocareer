import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const careerData = [
  { name: "Biomedical Eng.", value: 81 },
  { name: "Pharmaceutical Eng.", value: 89 },
  { name: "Bioprocess Eng.", value: 98 },
];

const COLORS = ["#6366f1", "#67e8f9", "#f59e0b"];

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-kahra-darker text-white">
        <DialogHeader>
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
              <p className="text-gray-400">NC State University</p>
              <div className="mt-2">
                <h3 className="text-xl font-semibold">John Doe</h3>
                <p className="text-gray-400">@johndoe</p>
                <p className="text-gray-400">Austin, TX, USA</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-400">Mentees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">495</p>
              <p className="text-sm text-gray-400">K-onnected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">35</p>
              <p className="text-sm text-gray-400">Recordings</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-sm">
              biochemical engineering
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-400 text-sm">
              microbiology
            </span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-gray-800">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Career Considerations</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={careerData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                  >
                    {careerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {careerData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Profile type:</p>
                  <p>Student</p>
                </div>
                <div>
                  <p className="text-gray-400">First Name:</p>
                  <p>John</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Name:</p>
                  <p>Doe</p>
                </div>
                <div>
                  <p className="text-gray-400">School:</p>
                  <p>North Carolina State University</p>
                </div>
                <div>
                  <p className="text-gray-400">Major:</p>
                  <p>Biochemical Engineering</p>
                </div>
                <div>
                  <p className="text-gray-400">Location:</p>
                  <p>Austin, Texas, USA</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="flex justify-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-full text-white">
                <span className="text-xl">+</span>
                create
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}