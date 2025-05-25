
import { DollarSign, ExternalLink, Globe, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { School } from "@/types/database/schools";

interface SchoolTuitionTabProps {
  school: School;
}

export function SchoolTuitionTab({ school }: SchoolTuitionTabProps) {
  const renderExternalLink = (url: string | null, label: string, icon: React.ReactNode, variant: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" = "outline", colorClass?: string) => {
    if (!url) return null;
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant, size: "sm" }),
          "gap-2 whitespace-nowrap transition-all hover:shadow-md",
          colorClass
        )}
      >
        {icon}
        <span>{label}</span>
        <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
      </a>
    );
  };

  if (school.tuition_fees && Object.keys(school.tuition_fees).length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-500" />
          Tuition & Fees Information
        </h2>
        
        <div className="bg-gradient-to-br from-green-50/80 to-emerald-100/80 border border-green-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-100/80">
                  <th className="px-6 py-3 text-left font-medium text-green-800">Program</th>
                  <th className="px-6 py-3 text-left font-medium text-green-800">Tuition</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(school.tuition_fees as Record<string, string>).map(([program, fee], index) => (
                  <tr 
                    key={program} 
                    className={cn(
                      "border-t border-green-200/70 hover:bg-green-100/50",
                      index % 2 === 0 ? "bg-green-50/50" : "bg-transparent"
                    )}
                  >
                    <td className="px-6 py-4 capitalize">{program.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 font-medium text-green-800">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-50 to-blue-100/80 border border-cyan-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-cyan-600" />
            Financial Resources
          </h3>
          <div className="space-y-3">
            {renderExternalLink(
              school.financial_aid_url,
              "Financial Aid Information",
              <DollarSign className="h-4 w-4" />,
              "default",
              "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-none"
            )}
            
            {renderExternalLink(
              school.international_students_url,
              "International Student Aid",
              <Globe className="h-4 w-4" />,
              "default",
              "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none"
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
      <h3 className="text-lg font-medium">No tuition information available</h3>
      <p className="text-muted-foreground">This institution hasn't provided detailed tuition information yet.</p>
      
      {school.financial_aid_url && (
        <div className="mt-6">
          <Button asChild variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-200">
            <a href={school.financial_aid_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              Visit Financial Aid Website <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
