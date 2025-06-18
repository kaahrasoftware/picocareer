
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SchoolsDataTable } from "./SchoolsDataTable";
import { SchoolFormDialog } from "./SchoolFormDialog";
import type { School } from "@/types/database/schools";

export function SchoolsManagementTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedSchool(null);
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
        <h2 className="text-2xl font-bold">Schools Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add School
        </Button>
      </div>
      
      <SchoolsDataTable 
        key={refreshKey}
        onEditSchool={handleEditSchool} 
        onDataChange={handleDataChange}
      />

      {/* Add School Dialog */}
      {isAddDialogOpen && (
        <SchoolFormDialog 
          open={isAddDialogOpen} 
          onClose={handleCloseDialog} 
          onSuccess={handleSuccess}
          mode="add" 
        />
      )}

      {/* Edit School Dialog */}
      {isEditDialogOpen && selectedSchool && (
        <SchoolFormDialog 
          open={isEditDialogOpen} 
          onClose={handleCloseDialog} 
          onSuccess={handleSuccess}
          mode="edit" 
          school={selectedSchool} 
        />
      )}
    </div>
  );
}
