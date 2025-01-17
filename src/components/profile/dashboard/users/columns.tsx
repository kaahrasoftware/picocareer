"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Profile } from "@/types/database/profiles";

export const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "user_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("user_type") as string;
      return (
        <Badge variant={type === "mentor" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "onboarding_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("onboarding_status") as string;
      return (
        <Badge 
          variant={
            status === "Approved" 
              ? "success" 
              : status === "Pending" 
                ? "warning" 
                : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return format(new Date(row.getValue("created_at")), "MMM d, yyyy");
    },
  },
  {
    accessorKey: "total_booked_sessions",
    header: "Sessions",
  },
];