
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface OpportunityRow {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  status: string;
}

interface OpportunitiesDataTableProps {
  searchQuery: string;
  selectedType: string;
  selectedLocation: string;
}

export function OpportunitiesDataTable({ 
  searchQuery, 
  selectedType, 
  selectedLocation 
}: OpportunitiesDataTableProps) {
  const [opportunities] = useState<OpportunityRow[]>([]);

  // Mock data for now since we don't have the actual opportunities table
  const mockOpportunities: OpportunityRow[] = [
    {
      id: "1",
      title: "Software Engineer",
      company: "Tech Corp",
      type: "Full-time",
      location: "San Francisco",
      status: "Active"
    },
    {
      id: "2", 
      title: "Product Manager",
      company: "StartupCo",
      type: "Contract",
      location: "Remote",
      status: "Active"
    }
  ];

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || opportunity.type.toLowerCase() === selectedType.toLowerCase();
    const matchesLocation = selectedLocation === "all" || opportunity.location.toLowerCase() === selectedLocation.toLowerCase();
    
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="pl-9"
            value={searchQuery}
            readOnly
          />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium">
          <div>Title</div>
          <div>Company</div>
          <div>Type</div>
          <div>Location</div>
          <div>Status</div>
        </div>
        
        {filteredOpportunities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No opportunities found
          </div>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="grid grid-cols-5 gap-4 p-4 border-t">
              <div className="font-medium">{opportunity.title}</div>
              <div>{opportunity.company}</div>
              <div>{opportunity.type}</div>
              <div>{opportunity.location}</div>
              <div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {opportunity.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
