
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { defaultHostels, type Hostel, type Room } from "@/lib/hostel"
import { studentsData as allStudentsData } from "@/lib/data"
import { Users, X, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RoomsPage() {
  const { toast } = useToast();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [studentToAdd, setStudentToAdd] = useState<string>("");

  const loadData = useCallback(() => {
    const storedHostels = localStorage.getItem('hostelsData');
    if (storedHostels) {
        const parsedHostels = JSON.parse(storedHostels);
        setHostels(parsedHostels);
        // Set initial selected hostel if not already set
        if (!selectedHostelId && parsedHostels.length > 0) {
            const maleHostel = parsedHostels.find((h: Hostel) => h.gender === 'Male');
            if (maleHostel) setSelectedHostelId(maleHostel.id);
        }
    } else {
        localStorage.setItem('hostelsData', JSON.stringify(defaultHostels));
        setHostels(defaultHostels);
        if (defaultHostels.length > 0) {
            const maleHostel = defaultHostels.find(h => h.gender === 'Male');
             if (maleHostel) setSelectedHostelId(maleHostel.id);
        }
    }
  }, [selectedHostelId]);

  useEffect(() => {
    loadData();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'hostelsData') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const updateHostels = (updatedHostels: Hostel[]) => {
    setHostels(updatedHostels);
    localStorage.setItem('hostelsData', JSON.stringify(updatedHostels));
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

  const selectedHostel = useMemo(() => {
    return hostels.find(h => h.id === selectedHostelId);
  }, [hostels, selectedHostelId]);

  const allAssignedStudents = useMemo(() => {
    return hostels.flatMap(hostel => hostel.rooms.flatMap(room => room.occupants));
  }, [hostels]);

  const availableStudents = useMemo(() => {
    if (!selectedHostel) return [];
    const requiredGender = selectedHostel.gender.toLowerCase();
    return allStudentsData.filter(student => 
        !allAssignedStudents.includes(student.id) && student.gender.toLowerCase() === requiredGender
    );
  }, [allAssignedStudents, selectedHostel]);

  const handleAssignStudent = () => {
    if (!selectedHostel || !selectedRoom || !studentToAdd) return;
    if (selectedRoom.occupants.length >= selectedRoom.capacity) {
        toast({ variant: "destructive", title: "Room Full", description: "This room has reached its maximum capacity." });
        return;
    }

    const updatedHostels = hostels.map(hostel => {
        if (hostel.id === selectedHostel.id) {
            const updatedRooms = hostel.rooms.map(room => {
                 if (room.id === selectedRoom.id) {
                    return { ...room, occupants: [...room.occupants, studentToAdd] };
                }
                return room;
            })
            return { ...hostel, rooms: updatedRooms };
        }
        return hostel;
    });

    updateHostels(updatedHostels);
    // Refresh selected room state from the new hostel data
    const newSelectedHostel = updatedHostels.find(h => h.id === selectedHostelId);
    if(newSelectedHostel) {
        setSelectedRoom(newSelectedHostel.rooms.find(r => r.id === selectedRoom.id) || null);
    }
    setStudentToAdd("");
    toast({ title: "Student Assigned", description: `${getStudentName(studentToAdd)} has been assigned to room ${selectedRoom.id}.` });
  };
  
  const handleRemoveStudent = (studentId: string) => {
    if (!selectedHostel || !selectedRoom) return;

     const updatedHostels = hostels.map(hostel => {
        if (hostel.id === selectedHostel.id) {
             const updatedRooms = hostel.rooms.map(room => {
                if (room.id === selectedRoom.id) {
                    return { ...room, occupants: room.occupants.filter(id => id !== studentId) };
                }
                return room;
            });
            return { ...hostel, rooms: updatedRooms };
        }
        return hostel;
    });

    updateHostels(updatedHostels);
     // Refresh selected room state from the new hostel data
    const newSelectedHostel = updatedHostels.find(h => h.id === selectedHostelId);
    if(newSelectedHostel) {
        setSelectedRoom(newSelectedHostel.rooms.find(r => r.id === selectedRoom.id) || null);
    }
    toast({ variant: "destructive", title: "Student Removed", description: `${getStudentName(studentId)} has been removed from the room.` });
  };
  
  const handleTabChange = (gender: 'Male' | 'Female') => {
      const firstHostelOfGender = hostels.find(h => h.gender === gender);
      if(firstHostelOfGender) {
          setSelectedHostelId(firstHostelOfGender.id);
      } else {
          setSelectedHostelId(null);
      }
  }
  
  const maleHostels = hostels.filter(h => h.gender === 'Male');
  const femaleHostels = hostels.filter(h => h.gender === 'Female');

  function renderHostelContent(hostelList: Hostel[]) {
      return (
          <div className="space-y-4">
            <Select value={selectedHostelId || ""} onValueChange={setSelectedHostelId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Select a hostel" />
                </SelectTrigger>
                <SelectContent>
                    {hostelList.length > 0 ? hostelList.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    )) : <div className="p-4 text-sm text-muted-foreground">No hostels in this category.</div>}
                </SelectContent>
            </Select>

            {selectedHostel && hostelList.some(h => h.id === selectedHostel.id) ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedHostel.name}</CardTitle>
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
                        {selectedHostel.rooms.map((room) => {
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
            ) : (
                 <Card>
                     <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Please select a hostel to view room details.</p>
                     </CardContent>
                 </Card>
            )}
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">View and manage hostel room assignments.</p>
      </div>
      
      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRoom(null)}>
        <Tabs defaultValue="boys" className="w-full" onValueChange={(value) => handleTabChange(value === 'boys' ? 'Male' : 'Female')}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="boys">Boys' Hostels</TabsTrigger>
                <TabsTrigger value="girls">Girls' Hostels</TabsTrigger>
            </TabsList>
            <TabsContent value="boys">
                {renderHostelContent(maleHostels)}
            </TabsContent>
            <TabsContent value="girls">
                {renderHostelContent(femaleHostels)}
            </TabsContent>
        </Tabs>
      
        <DialogContent className="sm:max-w-md">
           {selectedRoom && (
             <>
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
             </>
           )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
