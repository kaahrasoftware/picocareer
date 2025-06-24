import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Opportunity {
  id: string;
  title: string;
  description: string;
  company?: { name: string } | null;
  company_name?: string | null;
  location: string;
  type: string;
  salary: string;
  posted_date: string;
  application_deadline: string;
  url: string;
}

interface OpportunitiesDataTableProps {
  data: Opportunity[]
}

export function OpportunitiesDataTable({ data }: OpportunitiesDataTableProps) {
  const columns: ColumnDef<Opportunity>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "company_name",
      header: "Company",
      cell: ({ row }) => {
        const opportunity = row.original;
        // Handle both company object and company_name string
        const companyName = opportunity.company?.name || opportunity.company_name || "Not specified";
        return <span className="font-medium">{companyName}</span>;
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "salary",
      header: "Salary",
    },
    {
      accessorKey: "posted_date",
      header: "Posted Date",
    },
    {
      accessorKey: "application_deadline",
      header: "Application Deadline",
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
