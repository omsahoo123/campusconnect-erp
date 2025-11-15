
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  KeyRound,
  Copy
} from "lucide-react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { staffData as defaultStaffData } from "@/lib/data"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Label } from "@/components/ui/label"

export type Staff = {
  id: string
  name: string
  email: string
  department: string
  status: "Active" | "On Leave" | "Inactive"
}

type GeneratedCredential = {
    email: string,
    password?: string
}

const getStatusVariant = (status: Staff["status"]) => {
  switch (status) {
    case "Active":
      return "default"
    case "On Leave":
    case "Inactive":
      return "secondary"
    default:
      return "outline"
  }
}

const getColumns = (
  { router, toast, handleDelete, handleStatusChange, handleGenerateCredentials }:
  { 
    router: any, 
    toast: any, 
    handleDelete: (id: string) => void, 
    handleStatusChange: (id: string, status: Staff["status"]) => void,
    handleGenerateCredentials: (staff: Staff) => void
  }
): ColumnDef<Staff>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
   {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div>{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as Staff["status"];
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const staff = row.original

      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(staff.id)
                  toast({ title: "Copied!", description: "Staff ID copied to clipboard." })
                }}
              >
                Copy staff ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/dashboard/staff/${staff.id}`)}>
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateCredentials(staff)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Generate Credentials
              </DropdownMenuItem>
              <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusChange(staff.id, "Active")}
                  disabled={staff.status === "Active"}
                >
                  Mark as Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(staff.id, "Inactive")}
                  disabled={staff.status === "Inactive"}
                >
                  Mark as Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(staff.id, "On Leave")}
                  disabled={staff.status === "On Leave"}
                >
                  Mark as On Leave
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  Delete staff member
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                staff member's record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => handleDelete(staff.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    },
  },
]

export function StaffTable() {
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useCurrentUser();
  const [data, setData] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [generatedCredential, setGeneratedCredential] = React.useState<GeneratedCredential | null>(null);

  const loadStaff = React.useCallback(() => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedStaff = localStorage.getItem('staffData');
        if (storedStaff) {
          setData(JSON.parse(storedStaff));
        } else {
          localStorage.setItem('staffData', JSON.stringify(defaultStaffData));
          setData(defaultStaffData);
        }
      }
    } catch (error) {
      console.error("Failed to load staff from localStorage", error);
      setData(defaultStaffData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStaff();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'staffData') {
        loadStaff();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadStaff]);


  const handleDelete = (staffId: string) => {
    const updatedStaff = data.filter(staff => staff.id !== staffId);
    setData(updatedStaff);
    localStorage.setItem('staffData', JSON.stringify(updatedStaff));
    toast({
      title: "Staff Deleted",
      description: `Staff member with ID ${staffId} has been removed.`,
    });
  };

  const handleStatusChange = (staffId: string, newStatus: Staff["status"]) => {
    const updatedStaff = data.map(staff =>
      staff.id === staffId ? { ...staff, status: newStatus } : staff
    );
    setData(updatedStaff);
    localStorage.setItem('staffData', JSON.stringify(updatedStaff));
    toast({
      title: "Status Updated",
      description: `Staff member ${staffId} has been marked as ${newStatus}.`,
    });
  };

  const handleGenerateCredentials = (staff: Staff) => {
    if (role !== 'admin') {
        toast({ variant: 'destructive', title: "Permission Denied", description: "Only admins can generate credentials for staff." });
        return;
    }

    const storedCredentialsString = localStorage.getItem('userCredentials');
    const storedCredentials = storedCredentialsString ? JSON.parse(storedCredentialsString) : [];
    
    const existingUser = storedCredentials.find((cred: any) => cred.email === staff.email);
    
    let password;
    if (existingUser && existingUser.password) {
        password = existingUser.password;
    } else {
        password = Math.random().toString(36).slice(-8);
    }

    const credential = { email: staff.email, password: password, role: 'teacher' };
    
    const existingUserIndex = storedCredentials.findIndex((cred: any) => cred.email === staff.email);
    if (existingUserIndex > -1) {
        storedCredentials[existingUserIndex] = credential;
    } else {
        storedCredentials.push(credential);
    }

    localStorage.setItem('userCredentials', JSON.stringify(storedCredentials));
    setGeneratedCredential(credential);
  };

  const columns = getColumns({router, toast, handleDelete, handleStatusChange, handleGenerateCredentials});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleDeleteSelected = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    const updatedStaff = data.filter(staff => !selectedIds.includes(staff.id));
    setData(updatedStaff);
    localStorage.setItem('staffData', JSON.stringify(updatedStaff));
    table.resetRowSelection();
    toast({
      title: "Staff Members Deleted",
      description: `${selectedIds.length} staff member(s) have been removed.`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Password has been copied to clipboard.' });
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="ml-4">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected staff records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleDeleteSelected}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
            {isLoading ? (
               <TableRow>
                  <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  >
                  Loading staff...
                  </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog open={!!generatedCredential} onOpenChange={(isOpen) => !isOpen && setGeneratedCredential(null)}>
        {generatedCredential && (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generated Credentials</DialogTitle>
                    <DialogDescription>
                        These are the temporary login credentials. Please share them securely.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={generatedCredential.email} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="flex items-center gap-2">
                            <Input id="password" value={generatedCredential.password} readOnly />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedCredential.password || '')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

    

    