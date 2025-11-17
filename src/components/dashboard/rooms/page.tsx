
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { defaultHostels, type Hostel, type Room } from "@/lib/hostel"
import { studentsData as allStudentsData } from "@/lib/data"
import { Users, X, Plus, Edit, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function RoomsPage() {
  const { toast } = useToast();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [studentToAdd, setStudentToAdd] = useState<string>("");
  
  // State for dialogs
  const [dialogOpen, setDialogOpen] = useState<"assign" | "addHostel" | "editHostel" | "addRoom" | "editRoom" | null>(null);
  const [newHostelName, setNewHostelName] = useState("");
  const [newHostelGender, setNewHostelGender] = useState<"Male" | "Female">("Male");
  const [editedHostelName, setEditedHostelName] = useState("");
  const [newRoom, setNewRoom] = useState({ id: "", floor: "1", capacity: "2" });
  const [editedRoom, setEditedRoom] = useState<Room | null>(null);

  const loadData = useCallback(() => {
    const storedHostels = localStorage.getItem('hostelsData');
    if (storedHostels) {
        const parsedHostels: Hostel[] = JSON.parse(storedHostels);
        setHostels(parsedHostels);
        if (selectedHostelId === null && parsedHostels.length > 0) {
            const maleHostel = parsedHostels.find(h => h.gender === 'Male');
            if (maleHostel) setSelectedHostelId(maleHostel.id);
        } else if (selectedHostelId && !parsedHostels.some(h => h.id === selectedHostelId)) {
            // if the selected hostel was deleted, reset selection
            const currentTabGender = hostels.find(h => h.id === selectedHostelId)?.gender || 'Male';
            const sameGenderHostels = parsedHostels.filter(h => h.gender === currentTabGender);
            setSelectedHostelId(sameGenderHostels.length > 0 ? sameGenderHostels[0].id : null);
        }

    } else {
        localStorage.setItem('hostelsData', JSON.stringify(defaultHostels));
        setHostels(defaultHostels);
        if (defaultHostels.length > 0) {
            const maleHostel = defaultHostels.find(h => h.gender === 'Male');
             if (maleHostel) setSelectedHostelId(maleHostel.id);
        }
    }
  }, [selectedHostelId, hostels]);

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

  // Student assignment logic
  const getStudentName = (studentId: string) => allStudentsData.find(s => s.id === studentId)?.name || "Unknown Student";

  const handleAssignStudent = () => {
    if (!selectedHostel || !selectedRoom || !studentToAdd) return;
    if (selectedRoom.occupants.length >= selectedRoom.capacity) {
        toast({ variant: "destructive", title: "Room Full", description: "This room has reached its maximum capacity." });
        return;
    }

    const updatedHostels = hostels.map(h => 
        h.id === selectedHostel.id ? { ...h, rooms: h.rooms.map(r => r.id === selectedRoom.id ? { ...r, occupants: [...r.occupants, studentToAdd] } : r) } : h
    );
    updateHostels(updatedHostels);
    setSelectedRoom(prev => prev ? { ...prev, occupants: [...prev.occupants, studentToAdd] } : null);
    setStudentToAdd("");
    toast({ title: "Student Assigned" });
  };
  
  const handleRemoveStudent = (studentId: string) => {
    if (!selectedHostel || !selectedRoom) return;
    const updatedHostels = hostels.map(h =>
        h.id === selectedHostel.id ? { ...h, rooms: h.rooms.map(r => r.id === selectedRoom.id ? { ...r, occupants: r.occupants.filter(id => id !== studentId) } : r) } : h
    );
    updateHostels(updatedHostels);
    setSelectedRoom(prev => prev ? { ...prev, occupants: prev.occupants.filter(id => id !== studentId) } : null);
    toast({ variant: "destructive", title: "Student Removed" });
  };

  // Hostel CRUD
  const handleAddHostel = () => {
    if (!newHostelName.trim()) {
        toast({ variant: 'destructive', title: "Hostel name cannot be empty."});
        return;
    }
    const newHostel: Hostel = { id: `H${Date.now()}`, name: newHostelName, gender: newHostelGender, rooms: [] };
    const updatedHostels = [...hostels, newHostel];
    updateHostels(updatedHostels);
    setNewHostelName("");
    setDialogOpen(null);
    toast({ title: "Hostel Added", description: `${newHostel.name} has been created.`});
    handleTabChange(newHostelGender);
    setSelectedHostelId(newHostel.id);
  }

  const handleEditHostel = () => {
    if (!selectedHostelId || !editedHostelName.trim()) {
        toast({ variant: 'destructive', title: "Hostel name cannot be empty."});
        return;
    }
    const updatedHostels = hostels.map(h => h.id === selectedHostelId ? { ...h, name: editedHostelName } : h);
    updateHostels(updatedHostels);
    setDialogOpen(null);
    toast({ title: "Hostel Updated", description: "Hostel name has been updated." });
  }

  const handleDeleteHostel = () => {
    if (!selectedHostelId) return;
    const hostelToDelete = hostels.find(h => h.id === selectedHostelId);
    if (hostelToDelete && hostelToDelete.rooms.some(r => r.occupants.length > 0)) {
        toast({ variant: 'destructive', title: "Cannot Delete", description: "Hostel must be empty before deletion."});
        return;
    }
    const updatedHostels = hostels.filter(h => h.id !== selectedHostelId);
    updateHostels(updatedHostels);
    toast({ variant: 'destructive', title: "Hostel Deleted" });
    const sameGenderHostels = updatedHostels.filter(h => h.gender === hostelToDelete?.gender);
    setSelectedHostelId(sameGenderHostels.length > 0 ? sameGenderHostels[0].id : null);
  }

  // Room CRUD
  const handleAddRoom = () => {
    if (!selectedHostelId || !newRoom.id.trim()) {
        toast({ variant: 'destructive', title: "Room number is required." });
        return;
    }
    const roomExists = selectedHostel?.rooms.some(r => r.id.toLowerCase() === newRoom.id.toLowerCase());
    if (roomExists) {
        toast({ variant: 'destructive', title: "Room Exists", description: "A room with this number already exists." });
        return;
    }
    const roomToAdd: Room = { id: newRoom.id, floor: parseInt(newRoom.floor), capacity: parseInt(newRoom.capacity), occupants: [] };
    const updatedHostels = hostels.map(h => h.id === selectedHostelId ? { ...h, rooms: [...h.rooms, roomToAdd] } : h);
    updateHostels(updatedHostels);
    setNewRoom({ id: "", floor: "1", capacity: "2" });
    setDialogOpen(null);
    toast({ title: "Room Added", description: `Room ${roomToAdd.id} has been added.` });
  }
  
  const handleUpdateRoom = () => {
      if (!selectedHostelId || !editedRoom) return;
      
      // Check if ID is being changed to one that already exists
      if (editedRoom.id !== selectedRoom?.id && selectedHostel?.rooms.some(r => r.id === editedRoom.id)) {
          toast({ variant: "destructive", title: "Room Exists", description: "A room with this number already exists." });
          return;
      }
      
      const updatedHostels = hostels.map(h => 
          h.id === selectedHostelId ? { ...h, rooms: h.rooms.map(r => r.id === selectedRoom?.id ? editedRoom : r) } : h
      );
      updateHostels(updatedHostels);
      setEditedRoom(null);
      setSelectedRoom(null);
      setDialogOpen(null);
      toast({ title: "Room Updated" });
  }

  const handleDeleteRoom = (roomId: string) => {
    if (!selectedHostelId) return;
    const roomToDelete = selectedHostel?.rooms.find(r => r.id === roomId);
    if (roomToDelete && roomToDelete.occupants.length > 0) {
        toast({ variant: 'destructive', title: "Cannot Delete", description: "Room must be empty before deletion."});
        return;
    }
    const updatedHostels = hostels.map(h => h.id === selectedHostelId ? { ...h, rooms: h.rooms.filter(r => r.id !== roomId) } : h);
    updateHostels(updatedHostels);
    toast({ variant: 'destructive', title: "Room Deleted" });
  }

  // Memos and computed values
  const getStatus = (room: Room) => {
    if (room.occupants.length === 0) return { label: "Vacant", variant: "secondary" as const };
    if (room.occupants.length < room.capacity) return { label: "Partially Occupied", variant: "outline" as const };
    return { label: "Fully Occupied", variant: "default" as const };
  };

  const selectedHostel = useMemo(() => hostels.find(h => h.id === selectedHostelId), [hostels, selectedHostelId]);
  
  const allAssignedStudents = useMemo(() => hostels.flatMap(hostel => hostel.rooms.flatMap(room => room.occupants)), [hostels]);

  const availableStudents = useMemo(() => {
    if (!selectedHostel) return [];
    const requiredGender = selectedHostel.gender.toLowerCase();
    return allStudentsData.filter(student => !allAssignedStudents.includes(student.id) && student.gender.toLowerCase() === requiredGender);
  }, [allAssignedStudents, selectedHostel]);

  const handleTabChange = (gender: 'Male' | 'Female') => {
      const firstHostelOfGender = hostels.find(h => h.gender === gender);
      setSelectedHostelId(firstHostelOfGender?.id || null);
  }
  
  const maleHostels = hostels.filter(h => h.gender === 'Male');
  const femaleHostels = hostels.filter(h => h.gender === 'Female');

  function renderHostelContent(hostelList: Hostel[], gender: 'Male' | 'Female') {
      return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedHostelId || ""} onValueChange={setSelectedHostelId}>
                    <SelectTrigger className="flex-1 min-w-[200px]">
                        <SelectValue placeholder="Select a hostel" />
                    </SelectTrigger>
                    <SelectContent>
                        {hostelList.length > 0 ? hostelList.map(h => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        )) : <div className="p-4 text-sm text-muted-foreground">No hostels in this category.</div>}
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setNewHostelGender(gender); setDialogOpen("addHostel"); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Hostel
                    </Button>
                    {selectedHostel && (
                        <>
                            <Button variant="outline" size="icon" onClick={() => { setEditedHostelName(selectedHostel.name); setDialogOpen("editHostel"); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete {selectedHostel.name} and all its rooms. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteHostel}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            {selectedHostel && hostelList.some(h => h.id === selectedHostel.id) ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{selectedHostel.name}</CardTitle>
                            <CardDescription>An overview of all rooms and their occupancy.</CardDescription>
                        </div>
                        <Button onClick={() => setDialogOpen("addRoom")}><Plus className="h-4 w-4 mr-2"/> Add Room</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room No.</TableHead><TableHead>Floor</TableHead><TableHead>Capacity</TableHead><TableHead>Occupancy</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
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
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedRoom(room); setDialogOpen("assign"); }}>
                                            <Users className="h-4 w-4 mr-2" /> Manage
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedRoom(room); setEditedRoom({...room}); setDialogOpen("editRoom"); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete Room?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete Room {room.id}? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            ) : (
                 <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">Please select or create a hostel to view rooms.</p></CardContent></Card>
            )}
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">Create hostels and manage room assignments.</p>
      </div>
      
      <Tabs defaultValue="boys" className="w-full" onValueChange={(value) => handleTabChange(value === 'boys' ? 'Male' : 'Female')}>
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boys">Boys' Hostels</TabsTrigger>
              <TabsTrigger value="girls">Girls' Hostels</TabsTrigger>
          </TabsList>
          <TabsContent value="boys">{renderHostelContent(maleHostels, 'Male')}</TabsContent>
          <TabsContent value="girls">{renderHostelContent(femaleHostels, 'Female')}</TabsContent>
      </Tabs>
      
      {/* Dialog for Assigning Students */}
      <Dialog open={dialogOpen === 'assign'} onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}>
        <DialogContent className="sm:max-w-md">
           {selectedRoom && (
             <>
                <DialogHeader><DialogTitle>Manage Room {selectedRoom.id}</DialogTitle><DialogDescription>Assign or remove students. Capacity: {selectedRoom.occupants.length}/{selectedRoom.capacity}</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <h4 className="font-medium text-sm mb-2">Occupants</h4>
                        <div className="space-y-2">
                           {selectedRoom.occupants.length > 0 ? (selectedRoom.occupants.map(studentId => (
                                <div key={studentId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <span className="text-sm">{getStudentName(studentId)}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStudent(studentId)}><X className="h-4 w-4 text-destructive" /></Button>
                                </div>))) : (<p className="text-sm text-muted-foreground text-center py-2">This room is vacant.</p>)}
                        </div>
                    </div>
                    {selectedRoom.occupants.length < selectedRoom.capacity && (
                        <div>
                             <h4 className="font-medium text-sm mb-2">Assign Student</h4>
                             <div className="flex gap-2">
                                <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                                    <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                                    <SelectContent>{availableStudents.length > 0 ? (availableStudents.map(student => (<SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>))) : (<div className="p-4 text-sm text-muted-foreground">No unassigned students.</div>)}</SelectContent>
                                </Select>
                                <Button onClick={handleAssignStudent} disabled={!studentToAdd}><Plus className="h-4 w-4" /><span className="sr-only">Assign</span></Button>
                             </div>
                        </div>
                    )}
                </div>
                 <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose></DialogFooter>
             </>
           )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Adding Hostel */}
      <Dialog open={dialogOpen === 'addHostel'} onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}>
          <DialogContent><DialogHeader><DialogTitle>Add New Hostel</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label htmlFor="hostelName">Hostel Name</Label><Input id="hostelName" value={newHostelName} onChange={(e) => setNewHostelName(e.target.value)} /></div>
                <div><Label>Gender</Label><Input value={newHostelGender} readOnly disabled /></div>
              </div>
              <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleAddHostel}>Add Hostel</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Dialog for Editing Hostel */}
      <Dialog open={dialogOpen === 'editHostel'} onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}>
          <DialogContent><DialogHeader><DialogTitle>Edit Hostel Name</DialogTitle></DialogHeader>
              <div className="py-4">
                  <Label htmlFor="editedHostelName">Hostel Name</Label>
                  <Input id="editedHostelName" value={editedHostelName} onChange={(e) => setEditedHostelName(e.target.value)} />
              </div>
              <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleEditHostel}>Save Changes</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Dialog for Adding Room */}
      <Dialog open={dialogOpen === 'addRoom'} onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}>
          <DialogContent><DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div><Label>Room Number</Label><Input value={newRoom.id} onChange={(e) => setNewRoom(prev => ({...prev, id: e.target.value}))} placeholder="e.g., A-101" /></div>
                <div><Label>Floor</Label><Input type="number" value={newRoom.floor} onChange={(e) => setNewRoom(prev => ({...prev, floor: e.target.value}))} /></div>
                <div><Label>Capacity</Label><Input type="number" value={newRoom.capacity} onChange={(e) => setNewRoom(prev => ({...prev, capacity: e.target.value}))} /></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleAddRoom}>Add Room</Button></DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Dialog for Editing Room */}
      <Dialog open={dialogOpen === 'editRoom'} onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}>
        <DialogContent>
          {editedRoom && (
            <>
              <DialogHeader><DialogTitle>Edit Room {selectedRoom?.id}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                  <div><Label>Room Number</Label><Input value={editedRoom.id} onChange={(e) => setEditedRoom(prev => prev ? {...prev, id: e.target.value} : null)} /></div>
                  <div><Label>Floor</Label><Input type="number" value={editedRoom.floor} onChange={(e) => setEditedRoom(prev => prev ? {...prev, floor: parseInt(e.target.value) || 1} : null)} /></div>
                  <div><Label>Capacity</Label><Input type="number" value={editedRoom.capacity} onChange={(e) => setEditedRoom(prev => prev ? {...prev, capacity: parseInt(e.target.value) || 1} : null)} /></div>
              </div>
              <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleUpdateRoom}>Save Changes</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

    