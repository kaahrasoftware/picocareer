import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const careerData = [
  { name: "Biomedical Eng.", value: 81 },
  { name: "Pharmaceutical Eng.", value: 89 },
  { name: "Bioprocess Eng.", value: 98 },
];

const skillsData = [
  { name: "Data Science", value: 92 },
  { name: "Pharmacology", value: 89 },
  { name: "Biotechnology", value: 87 },
  { name: "Computer Engineering", value: 72 },
];

const CAREER_COLORS = ["#6366f1", "#67e8f9", "#f59e0b"];
const SKILLS_COLORS = ["#FFE29F", "#9b87f5", "#F97316", "#0EA5E9"];

export function DashboardTab() {
  return (
    <div className="space-y-8">
      <div>
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
                  <Cell key={`cell-${index}`} fill={CAREER_COLORS[index % CAREER_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {careerData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CAREER_COLORS[index] }}
                />
                <span className="text-sm text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Transferable Skills</h3>
        <p className="text-gray-400 text-sm mb-4">
          Percentile of your current skills you can transfer to other majors
        </p>
        <div className="grid grid-cols-2 gap-4">
          {skillsData.map((skill, index) => (
            <div key={skill.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{skill.name}</span>
                <span className="text-sm font-bold">{skill.value}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full dark:bg-gray-700">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${skill.value}%`,
                    backgroundColor: SKILLS_COLORS[index],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}