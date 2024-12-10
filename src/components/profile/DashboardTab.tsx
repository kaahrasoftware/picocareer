import React from "react";
import { CircularProgress } from "@/components/ui/circular-progress";

export function DashboardTab() {
  const careerConsiderations = [
    { label: "Bioprocess Eng.", percentage: 98, color: "#F97316" },
    { label: "Pharmaceutical Eng.", percentage: 89, color: "#0EA5E9" },
    { label: "Biomedical Eng.", percentage: 81, color: "#8B5CF6" },
  ];

  const transferableSkills = [
    { label: "Data Science", percentage: 92, color: "#FEC6A1" },
    { label: "Pharmacology", percentage: 89, color: "#9b87f5" },
    { label: "Biotechnology", percentage: 87, color: "#DC2626" },
    { label: "Computer Engineering", percentage: 72, color: "#0EA5E9" },
  ];

  const skills = [
    "biochemical engineering",
    "microbiology",
    "Bioreactor",
    "Genetic engineering",
    "GMP",
    "MATLAB",
    "AutoCAD",
    "Computational modeling",
    "Mathematical modeling",
    "Engineer-in-Training",
    "Six Sigma",
    "Data analysis",
  ];

  return (
    <div className="space-y-12 p-4">
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-200">Career Considerations</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {careerConsiderations.map((career) => (
            <CircularProgress
              key={career.label}
              percentage={career.percentage}
              color={career.color}
              size={career.percentage >= 95 ? "lg" : career.percentage >= 85 ? "md" : "sm"}
              label={career.label}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-semibold text-gray-200">Transferable Skills</h2>
          <p className="text-gray-400 mt-2">
            Percentile of your current skills you can transfer to other majors
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {transferableSkills.map((skill) => (
            <CircularProgress
              key={skill.label}
              percentage={skill.percentage}
              color={skill.color}
              size="md"
              label={skill.label}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-200">Skills & Technologies</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-4">
          {skills.map((skill) => (
            <div key={skill} className="text-left">
              <span className="text-sm text-gray-300">{skill}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}