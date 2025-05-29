
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InstitutionMembersProps {
  institutionId: string;
}

export function InstitutionMembers({ institutionId }: InstitutionMembersProps) {
  // Since institution_members table doesn't exist, show placeholder
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members</h2>
        <Button disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member (Coming Soon)
        </Button>
      </div>

      <div className="text-center py-12">
        <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">Institution members feature is coming soon</h3>
        <p className="text-muted-foreground">This feature will be available in a future update.</p>
      </div>
    </div>
  );
}
