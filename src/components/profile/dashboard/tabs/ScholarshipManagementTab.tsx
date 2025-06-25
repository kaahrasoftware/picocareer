
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScholarshipsDataTable } from "./scholarship/ScholarshipsDataTable";
import { ScholarshipFormDialog } from "./scholarship/ScholarshipFormDialog";
import { ScholarshipDetailsDialog } from "./scholarship/ScholarshipDetailsDialog";
import type { ScholarshipDetails } from "@/types/database/scholarships";

export function ScholarshipManagementTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleEditScholarship = (scholarship: ScholarshipDetails) => {
    setSelectedScholarship(scholarship);
    setIsEditDialogOpen(true);
  };

  const handleViewScholarship = (scholarship: ScholarshipDetails) => {
    setSelectedScholarship(scholarship);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDetailsDialogOpen(false);
    setSelectedScholarship(null);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseDialog();
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scholarships Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Scholarship
        </Button>
      </div>
      
      <ScholarshipsDataTable 
        key={refreshKey}
        onEditScholarship={handleEditScholarship}
        onViewScholarship={handleViewScholarship}
        onDataChange={handleDataChange}
      />

      {/* Add Scholarship Dialog */}
      {isAddDialogOpen && (
        <ScholarshipFormDialog 
          open={isAddDialogOpen} 
          onClose={handleCloseDialog} 
          onSuccess={handleSuccess}
          mode="add" 
        />
      )}

      {/* Edit Scholarship Dialog */}
      {isEditDialogOpen && selectedScholarship && (
        <ScholarshipFormDialog 
          open={isEditDialogOpen} 
          onClose={handleCloseDialog} 
          onSuccess={handleSuccess}
          mode="edit" 
          scholarship={selectedScholarship} 
        />
      )}

      {/* Scholarship Details Dialog */}
      {selectedScholarship && (
        <ScholarshipDetailsDialog
          scholarship={selectedScholarship}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onScholarshipUpdated={handleDataChange}
        />
      )}
    </div>
  );
}
