
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { defaultHostels, type Hostel, type Room } from "@/lib/hostel"
import { studentsData as defaultStudentsData, type Student } from "@/lib/data"
import { X, Plus, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
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
  
  // State for "Quick Assign" card
  const [studentToAssign, setStudentToAssign] = useState<string>("")
  
  // State for "Manage" dialog
  const [selectedResident, setSelectedResident] = useState<HostelStudentInfo | null>(null);
  const [newRoomId, setNewRoomId] = useState<string>("");

  const loadData = useCallback(() => {
    const storedHostels = localStorage.getItem('hostelsData');
    const storedStudents = localStorage.getItem('studentsData');
    
    setHostels(storedHostels ? JSON.parse(storedHostels) : defaultHostels);
    
    let students: Student[] = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
    // FIX: De-duplicate students to prevent crash from bad data in localStorage
    const uniqueStudentIds = new Set();
    const uniqueStudents = students.filter(student => {
        if (uniqueStudentIds.has(student.id)) {
            return false;
        }
        uniqueStudentIds.add(student.id);
        return true;
    });
    setAllStudents(uniqueStudents);

  }, []);

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
  
  const updateHostels = (updatedHostels: Hostel[]) => {
    setHostels(updatedHostels);
    localStorage.setItem('hostelsData', JSON.stringify(updatedHostels));
    window.dispatchEvent(new Event('storage'));
  };

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

  const handleQuickAssign = () => {
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
        updateHostels(updatedHostels);
        setStudentToAssign("");
    } else {
        toast({ variant: 'destructive', title: "Assignment Failed", description: `No vacant rooms available in any ${studentGender} hostel.` });
    }
  }

  const handleUnassignStudent = () => {
    if (!selectedResident) return;
    const { studentId, hostelId, roomId, studentName } = selectedResident;

    const updatedHostels = hostels.map(h => {
        if (h.id === hostelId) {
            const updatedRooms = h.rooms.map(r => {
                if (r.id === roomId) {
                    return { ...r, occupants: r.occupants.filter(id => id !== studentId) };
                }
                return r;
            });
            return { ...h, rooms: updatedRooms };
        }
        return h;
    });

    updateHostels(updatedHostels);
    toast({ variant: "destructive", title: "Student Unassigned", description: `${studentName} has been removed from their room.` });
    closeManageDialog();
  }
  
  const handleRoomChange = () => {
      if (!selectedResident || !newRoomId) return;
      const { studentId, hostelId, roomId: oldRoomId, studentName } = selectedResident;
      
      // 1. Remove from old room
      const tempHostels = hostels.map(h => {
        if (h.id === hostelId) {
            const updatedRooms = h.rooms.map(r => {
                if (r.id === oldRoomId) {
                    return { ...r, occupants: r.occupants.filter(id => id !== studentId) };
                }
                return r;
            });
            return { ...h, rooms: updatedRooms };
        }
        return h;
    });
      
      // 2. Add to new room
      const finalHostels = tempHostels.map(h => {
          if (h.id === hostelId) {
              const updatedRooms = h.rooms.map(r => {
                  if (r.id === newRoomId) {
                      return { ...r, occupants: [...r.occupants, studentId] };
                  }
                  return r;
              });
              return { ...h, rooms: updatedRooms };
          }
          return h;
      });
      
      updateHostels(finalHostels);
      toast({ title: "Room Changed", description: `${studentName} has been moved to room ${newRoomId}.` });
      closeManageDialog();
  }

  const openManageDialog = (resident: HostelStudentInfo) => {
      setSelectedResident(resident);
      setNewRoomId("");
  }
  
  const closeManageDialog = () => {
      setSelectedResident(null);
      setNewRoomId("");
  }

  const availableRoomsForMove = useMemo(() => {
    if (!selectedResident) return [];
    const hostel = hostels.find(h => h.id === selectedResident.hostelId);
    if (!hostel) return [];
    return hostel.rooms.filter(r => r.id !== selectedResident.roomId && r.occupants.length < r.capacity);
  }, [selectedResident, hostels]);

  return (
    <div className="space-y-6">
      <Dialog onOpenChange={(isOpen) => !isOpen && closeManageDialog()}>
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
                  <Button onClick={handleQuickAssign} disabled={!studentToAssign} className="w-full sm:w-auto self-end">
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
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => openManageDialog(resident)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Manage
                           </Button>
                         </DialogTrigger>
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
        
        {selectedResident && (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage {selectedResident.studentName}</DialogTitle>
                    <DialogDescription>
                        Currently in Room {selectedResident.roomId}, {selectedResident.hostelName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Change Room</Label>
                        <div className="flex gap-2">
                             <Select value={newRoomId} onValueChange={setNewRoomId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoomsForMove.length > 0 ? (
                                        availableRoomsForMove.map(room => (
                                            <SelectItem key={room.id} value={room.id}>
                                                Room {room.id} ({room.capacity - room.occupants.length} spots)
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-sm text-muted-foreground">No other rooms available.</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleRoomChange} disabled={!newRoomId}>Move Student</Button>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <Label className="font-medium">Danger Zone</Label>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full justify-start mt-2">
                                    <X className="mr-2 h-4 w-4" /> Unassign from Hostel
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will unassign {selectedResident.studentName} from their room, making them an unassigned student. You can re-assign them later.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUnassignStudent}>Unassign</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

    