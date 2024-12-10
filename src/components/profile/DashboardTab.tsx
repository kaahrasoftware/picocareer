import React from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-8 p-4">
      <section>
        <div className="flex flex-wrap gap-6 justify-start items-center mb-4">
          {careerConsiderations.map((career) => (
            <CircularProgress
              key={career.label}
              percentage={career.percentage}
              color={career.color}
              size="lg"
              label={career.label}
            />
          ))}
        </div>
        <h2 className="text-2xl font-semibold">Career Considerations</h2>
      </section>

      <section>
        <div className="flex flex-wrap gap-6 justify-start items-center mb-4">
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
        <h2 className="text-2xl font-semibold">Transferable Skills</h2>
        <p className="text-gray-400 mt-2">
          Percentile of your current skills you can transfer to other majors
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Skills & Technologies</h2>
        <div className="grid grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2">
              <span className="text-kahra-primary">•</span>
              <span className="text-sm text-gray-300">{skill}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}