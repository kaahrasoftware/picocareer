
import { HubDepartment } from "@/types/database/hubs";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentGridProps {
  departments: HubDepartment[];
  departmentColors: string[];
  onEdit: (department: HubDepartment) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

export function DepartmentGrid({
  departments,
  departmentColors,
  onEdit,
  onDelete,
  canManage
}: DepartmentGridProps) {
  if (departments?.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No departments yet</h3>
        <p className="text-muted-foreground">Create departments to organize your institution.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments?.map((department, index) => (
        <DepartmentCard
          key={department.id}
          department={department}
          colorClass={departmentColors[index % departmentColors.length]}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}
