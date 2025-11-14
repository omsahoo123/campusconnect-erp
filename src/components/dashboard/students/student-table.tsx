
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  KeyRound,
  Copy,
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
import { studentsData as defaultStudentsData } from "@/lib/data"
import { useCurrentUser } from "@/hooks/use-current-user"

export type Student = {
  id: string
  name: string
  email: string
  joinDate: string
  status: "Active" | "Inactive" | "Suspended"
}

type GeneratedCredential = {
    email: string,
    password?: string
}

const getStatusVariant = (status: Student["status"]) => {
  switch (status) {
    case "Active":
      return "default"
    case "Inactive":
      return "secondary"
    case "Suspended":
      return "destructive"
  }
}

const getColumns = (
    { router, toast, handleDelete, handleStatusChange, handleGenerateCredentials, role }: 
    { 
      router: any, 
      toast: any, 
      handleDelete: (id: string) => void, 
      handleStatusChange: (id: string, status: Student["status"]) => void,
      handleGenerateCredentials: (student: Student) => void,
      role: string | null
    }
  ): ColumnDef<Student>[] => [
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const status = row.getValue("status") as Student["status"];
          return <Badge variant={getStatusVariant(status)}>{status}</Badge>
      },
    },
    {
      accessorKey: "joinDate",
      header: () => <div className="text-right">Join Date</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue("joinDate"))
        const formatted = date.toLocaleDateString('en-GB');
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original

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
                    navigator.clipboard.writeText(student.id)
                    toast({ title: "Copied!", description: "Student ID copied to clipboard." })
                  }}
                >
                  Copy student ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                  View profile
                </DropdownMenuItem>
                { (role === 'admin' || role === 'teacher') &&
                    <DropdownMenuItem onClick={() => handleGenerateCredentials(student)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Generate Credentials
                    </DropdownMenuItem>
                }
                <DropdownMenuSeparator />
                 <DropdownMenuItem
                  onClick={() => handleStatusChange(student.id, "Active")}
                  disabled={student.status === "Active"}
                >
                  Mark as Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(student.id, "Inactive")}
                  disabled={student.status === "Inactive"}
                >
                  Mark as Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(student.id, "Suspended")}
                  disabled={student.status === "Suspended"}
                >
                  Mark as Suspended
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    Delete student
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  student&apos;s record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => handleDelete(student.id)}
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

export function StudentTable() {
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useCurrentUser();
  const [data, setData] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [generatedCredential, setGeneratedCredential] = React.useState<GeneratedCredential | null>(null);

  const loadStudents = React.useCallback(() => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedStudents = localStorage.getItem('studentsData');
        if (storedStudents) {
          setData(JSON.parse(storedStudents));
        } else {
          localStorage.setItem('studentsData', JSON.stringify(defaultStudentsData));
          setData(defaultStudentsData);
        }
      }
    } catch (error) {
      console.error("Failed to load students from localStorage", error);
      setData(defaultStudentsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStudents();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentsData') {
        loadStudents();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadStudents]);

  const handleDelete = (studentId: string) => {
    const updatedStudents = data.filter(student => student.id !== studentId);
    setData(updatedStudents);
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    toast({
      title: "Student Deleted",
      description: `Student with ID ${studentId} has been removed.`,
    });
  };

  const handleStatusChange = (studentId: string, newStatus: Student["status"]) => {
    const updatedStudents = data.map(student =>
        student.id === studentId ? { ...student, status: newStatus } : student
    );
    setData(updatedStudents);
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    toast({
        title: "Status Updated",
        description: `Student ${studentId} has been marked as ${newStatus}.`,
    });
  }

  const handleGenerateCredentials = (student: Student) => {
    if (role !== 'teacher' && role !== 'admin') {
        toast({ variant: 'destructive', title: "Permission Denied", description: "Only teachers or admins can generate credentials." });
        return;
    }
    const password = Math.random().toString(36).slice(-8);
    const credential = { email: student.email, password: password, role: 'student' };

    const storedCredentialsString = localStorage.getItem('userCredentials');
    const storedCredentials = storedCredentialsString ? JSON.parse(storedCredentialsString) : [];
    
    const existingUserIndex = storedCredentials.findIndex((cred: any) => cred.email === student.email);
    if (existingUserIndex > -1) {
        storedCredentials[existingUserIndex].password = password;
    } else {
        storedCredentials.push(credential);
    }

    localStorage.setItem('userCredentials', JSON.stringify(storedCredentials));
    setGeneratedCredential(credential);
  };
  
  const table = useReactTable({
    data,
    columns: getColumns({ router, toast, handleDelete, handleStatusChange, handleGenerateCredentials, role }),
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
    const updatedStudents = data.filter(student => !selectedIds.includes(student.id));
    setData(updatedStudents);
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    table.resetRowSelection();
    toast({
      title: "Students Deleted",
      description: `${selectedIds.length} student(s) have been removed.`,
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
                  selected student records from the servers.
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                  >
                  Loading students...
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
                  colSpan={table.getAllColumns().length}
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
