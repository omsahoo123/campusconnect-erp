
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { defaultHostels, type Hostel } from "@/lib/hostel"
import { studentsData as defaultStudentsData, type Student } from "@/lib/data"
import { X, Plus } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

type HostelStudentInfo = {
  studentId: string
  studentName: string
  hostelId: string
  hostelName: string
  roomId: string
}

export default function HostelStudentsPage() {
  const { toast } = useToast()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [studentToAssign, setStudentToAssign] = useState<string>("")

  const loadData = useCallback(() => {
    const storedHostels = localStorage.getItem('hostelsData')
    const storedStudents = localStorage.getItem('studentsData')
    
    let currentHostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : defaultHostels;
    
    setHostels(currentHostels)
    
    let students: Student[] = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
    
    // De-duplicate students to prevent key errors
    const uniqueStudentIds = new Set<string>();
    const uniqueStudents = students.filter(student => {
        if (uniqueStudentIds.has(student.id)) {
            return false;
        }
        uniqueStudentIds.add(student.id);
        return true;
    });

    setAllStudents(uniqueStudents);

    // One-time migration to ensure Om is assigned
    const omAssigned = currentHostels.some(h => h.rooms.some(r => r.occupants.includes('STU001')));
    if (!omAssigned) {
        const updatedHostels = currentHostels.map(h => {
            if (h.id === 'H01') { // St. Patrick Hostel
                return {
                    ...h,
                    rooms: h.rooms.map(r => {
                        if (r.id === 'A-101' && !r.occupants.includes('STU001')) {
                            return { ...r, occupants: [...r.occupants, 'STU001'] };
                        }
                        return r;
                    })
                }
            }
            return h;
        });
        setHostels(updatedHostels);
        localStorage.setItem('hostelsData', JSON.stringify(updatedHostels));
        window.dispatchEvent(new Event('storage'));
    }

  }, [])

  useEffect(() => {
    loadData()
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'hostelsData' || event.key === 'studentsData') {
        loadData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadData])

  const residentStudents = useMemo<HostelStudentInfo[]>(() => {
    const residents: HostelStudentInfo[] = []
    hostels.forEach(hostel => {
      hostel.rooms.forEach(room => {
        room.occupants.forEach(studentId => {
          const student = allStudents.find(s => s.id === studentId)
          if (student) {
            residents.push({
              studentId: student.id,
              studentName: student.name,
              hostelId: hostel.id,
              hostelName: hostel.name,
              roomId: room.id,
            })
          }
        })
      })
    })
    return residents.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [hostels, allStudents])
  
  const allAssignedStudentIds = useMemo(() => new Set(residentStudents.map(r => r.studentId)), [residentStudents]);

  const unassignedStudents = useMemo(() => {
    return allStudents.filter(s => !allAssignedStudentIds.has(s.id));
  }, [allStudents, allAssignedStudentIds]);


  const handleRemoveStudent = (resident: HostelStudentInfo) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === resident.hostelId) {
        return {
          ...h,
          rooms: h.rooms.map(r => {
            if (r.id === resident.roomId) {
              return { ...r, occupants: r.occupants.filter(id => id !== resident.studentId) }
            }
            return r
          })
        }
      }
      return h
    })
    setHostels(updatedHostels)
    localStorage.setItem('hostelsData', JSON.stringify(updatedHostels))
    window.dispatchEvent(new Event('storage'))
    toast({ variant: "destructive", title: "Student Removed", description: `${resident.studentName} has been unassigned from room ${resident.roomId}.` })
  }

  const handleAssignStudent = () => {
    if (!studentToAssign) {
        toast({ variant: 'destructive', title: "No Student Selected" });
        return;
    }
    
    const student = allStudents.find(s => s.id === studentToAssign);
    if (!student) return;

    let assigned = false;
    const studentGender = student.gender === 'male' ? 'Male' : 'Female';

    const updatedHostels = [...hostels];

    for (const hostel of updatedHostels) {
        if (hostel.gender === studentGender) {
            for (const room of hostel.rooms) {
                if (room.occupants.length < room.capacity) {
                    room.occupants.push(student.id);
                    assigned = true;
                    toast({ title: "Student Assigned", description: `${student.name} has been assigned to Room ${room.id} in ${hostel.name}.` });
                    break;
                }
            }
        }
        if (assigned) break;
    }

    if (assigned) {
        setHostels(updatedHostels);
        localStorage.setItem('hostelsData', JSON.stringify(updatedHostels));
        window.dispatchEvent(new Event('storage'));
        setStudentToAssign("");
    } else {
        toast({ variant: 'destructive', title: "Assignment Failed", description: `No vacant rooms available in any ${studentGender} hostel.` });
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Student to Hostel</CardTitle>
          <CardDescription>Quickly assign an unassigned student to the next available room.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto sm:flex-1">
                    <Label htmlFor="student-select">Select Student</Label>
                    <Select value={studentToAssign} onValueChange={setStudentToAssign}>
                        <SelectTrigger id="student-select">
                            <SelectValue placeholder="Select an unassigned student" />
                        </SelectTrigger>
                        <SelectContent>
                            {unassignedStudents.length > 0 ? (
                                unassignedStudents.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name} ({student.gender})</SelectItem>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-muted-foreground">No unassigned students available.</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAssignStudent} disabled={!studentToAssign} className="w-full sm:w-auto self-end">
                    <Plus className="mr-2 h-4 w-4" /> Assign to Available Room
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Hostel Residents</CardTitle>
          <CardDescription>A list of all students currently residing in hostels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room No.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentStudents.length > 0 ? (
                residentStudents.map((resident) => (
                  <TableRow key={resident.studentId}>
                    <TableCell className="font-medium">{resident.studentName}</TableCell>
                    <TableCell>{resident.studentId}</TableCell>
                    <TableCell>{resident.hostelName}</TableCell>
                    <TableCell>{resident.roomId}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4 text-destructive" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will unassign {resident.studentName} from their room. You can re-assign them later.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveStudent(resident)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No students are currently assigned to any hostel room.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
