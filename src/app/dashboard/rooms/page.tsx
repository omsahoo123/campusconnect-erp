
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { defaultRooms, type Room } from "@/lib/hostel"
import { studentsData as allStudentsData } from "@/lib/data"
import { Users, X, Plus } from "lucide-react"

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [studentToAdd, setStudentToAdd] = useState<string>("");

  const loadData = useCallback(() => {
    const storedRooms = localStorage.getItem('hostelRooms');
    setRooms(storedRooms ? JSON.parse(storedRooms) : defaultRooms);
  }, []);

  useEffect(() => {
    loadData();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'hostelRooms') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const updateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem('hostelRooms', JSON.stringify(updatedRooms));
    window.dispatchEvent(new Event('storage'));
  };

  const getStudentName = (studentId: string) => {
    return allStudentsData.find(s => s.id === studentId)?.name || "Unknown Student";
  };

  const getStatus = (room: Room) => {
    if (room.occupants.length === 0) return { label: "Vacant", variant: "secondary" as const };
    if (room.occupants.length < room.capacity) return { label: "Partially Occupied", variant: "outline" as const };
    return { label: "Fully Occupied", variant: "default" as const };
  };

  const allAssignedStudents = useMemo(() => {
    return rooms.flatMap(room => room.occupants);
  }, [rooms]);

  const availableStudents = useMemo(() => {
    return allStudentsData.filter(student => !allAssignedStudents.includes(student.id));
  }, [allAssignedStudents]);

  const handleAssignStudent = () => {
    if (!selectedRoom || !studentToAdd) return;
    if (selectedRoom.occupants.length >= selectedRoom.capacity) {
        toast({ variant: "destructive", title: "Room Full", description: "This room has reached its maximum capacity." });
        return;
    }

    const updatedRooms = rooms.map(room => {
        if (room.id === selectedRoom.id) {
            return { ...room, occupants: [...room.occupants, studentToAdd] };
        }
        return room;
    });

    updateRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(r => r.id === selectedRoom.id) || null);
    setStudentToAdd("");
    toast({ title: "Student Assigned", description: `${getStudentName(studentToAdd)} has been assigned to room ${selectedRoom.id}.` });
  };
  
  const handleRemoveStudent = (studentId: string) => {
    if (!selectedRoom) return;

     const updatedRooms = rooms.map(room => {
        if (room.id === selectedRoom.id) {
            return { ...room, occupants: room.occupants.filter(id => id !== studentId) };
        }
        return room;
    });

    updateRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find(r => r.id === selectedRoom.id) || null);
    toast({ variant: "destructive", title: "Student Removed", description: `${getStudentName(studentId)} has been removed from the room.` });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">View and manage hostel room assignments.</p>
      </div>

      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRoom(null)}>
        <Card>
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
            <CardDescription>An overview of all rooms and their occupancy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => {
                    const status = getStatus(room);
                    return (
                        <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.id}</TableCell>
                            <TableCell>{room.floor}</TableCell>
                            <TableCell>{room.capacity}</TableCell>
                            <TableCell>{room.occupants.length}</TableCell>
                            <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                            <TableCell className="text-right">
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedRoom(room)}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage
                                    </Button>
                                </DialogTrigger>
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedRoom && (
             <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Room {selectedRoom.id}</DialogTitle>
                    <DialogDescription>
                        Assign or remove students from this room. Capacity: {selectedRoom.occupants.length}/{selectedRoom.capacity}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <h4 className="font-medium text-sm mb-2">Occupants</h4>
                        <div className="space-y-2">
                           {selectedRoom.occupants.length > 0 ? (
                                selectedRoom.occupants.map(studentId => (
                                    <div key={studentId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                        <span className="text-sm">{getStudentName(studentId)}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStudent(studentId)}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                           ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">This room is vacant.</p>
                           )}
                        </div>
                    </div>
                    {selectedRoom.occupants.length < selectedRoom.capacity && (
                        <div>
                             <h4 className="font-medium text-sm mb-2">Assign Student</h4>
                             <div className="flex gap-2">
                                <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.length > 0 ? (
                                            availableStudents.map(student => (
                                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-muted-foreground">No unassigned students.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAssignStudent} disabled={!studentToAdd}>
                                    <Plus className="h-4 w-4" />
                                    <span className="sr-only">Assign</span>
                                </Button>
                             </div>
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                        Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
             </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
