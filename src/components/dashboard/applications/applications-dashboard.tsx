
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { studentsData as defaultStudentsData, staffData as defaultStaffData } from "@/lib/data";
import { type Student } from "@/components/dashboard/students/student-table";
import { type Hostel, type Room, defaultHostels } from "@/lib/hostel";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface StudentApplication {
  id: string;
  name: string;
  grade: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  status: 'Pending';
  email: string;
  phone: string;
}

interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  coverLetter: string;
  status: 'Pending';
}

type ActivityLogItem = {
    type: 'NEW_STUDENT' | 'NEW_TEACHER';
    payload: {
        name: string;
    };
    timestamp: string;
}

const logActivity = (item: ActivityLogItem) => {
    const logString = localStorage.getItem('activityLog');
    const log = logString ? JSON.parse(logString) : [];
    log.push(item);
    localStorage.setItem('activityLog', JSON.stringify(log));
    window.dispatchEvent(new Event('storage'));
}

export function ApplicationsDashboard() {
  const { toast } = useToast();
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [teacherApps, setTeacherApps] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudentApp, setSelectedStudentApp] = useState<StudentApplication | null>(null);
  const [selectedTeacherApp, setSelectedTeacherApp] = useState<TeacherApplication | null>(null);

  const [assignHostel, setAssignHostel] = useState(false);
  const [allHostels, setAllHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedStudentApps = localStorage.getItem('studentApplications');
        setStudentApps(storedStudentApps ? JSON.parse(storedStudentApps) : []);
        
        const storedTeacherApps = localStorage.getItem('teacherApplications');
        setTeacherApps(storedTeacherApps ? JSON.parse(storedTeacherApps) : []);

        const storedHostels = localStorage.getItem('hostelsData');
        setAllHostels(storedHostels ? JSON.parse(storedHostels) : defaultHostels);
      }
    } catch (error) {
      console.error("Failed to parse applications from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load data from local storage.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();

    const handleStorageChange = (event: StorageEvent) => {
      if (['studentApplications', 'teacherApplications', 'hostelsData'].includes(event.key || '')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);


  const handleApproveStudent = () => {
    if (!selectedStudentApp) return;

    // Add to main students list
    const storedStudentsString = localStorage.getItem('studentsData');
    const currentStudents = storedStudentsString ? JSON.parse(storedStudentsString) : defaultStudentsData;
    
    const newStudent: Student = {
      id: `STU${Date.now()}`.slice(0, 6),
      name: selectedStudentApp.name,
      email: selectedStudentApp.email,
      phone: selectedStudentApp.phone,
      gender: selectedStudentApp.gender,
      joinDate: new Date().toISOString(),
      status: "Active" as const
    };

    const updatedStudents = [...currentStudents, newStudent];
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    
    logActivity({ type: 'NEW_STUDENT', payload: { name: selectedStudentApp.name }, timestamp: new Date().toISOString() });

    // Handle hostel assignment
    if (assignHostel && selectedHostel && selectedRoom) {
      const updatedHostels = allHostels.map(h => {
        if (h.id === selectedHostel) {
          return {
            ...h,
            rooms: h.rooms.map(r => {
              if (r.id === selectedRoom) {
                return { ...r, occupants: [...r.occupants, newStudent.id] };
              }
              return r;
            })
          }
        }
        return h;
      });
      localStorage.setItem('hostelsData', JSON.stringify(updatedHostels));
    }

    // Remove from applications
    const updatedApps = studentApps.filter(a => a.id !== selectedStudentApp.id);
    setStudentApps(updatedApps);
    localStorage.setItem('studentApplications', JSON.stringify(updatedApps));

    toast({
      title: "Application Approved",
      description: `${selectedStudentApp.name}'s application has been approved and they have been added to the student list.`,
    });

    closeStudentDialog();
    window.dispatchEvent(new Event('storage'));
  };

  const handleApproveTeacher = (app: TeacherApplication) => {
    // Add to main staff list
    const storedStaffString = localStorage.getItem('staffData');
    const currentStaff = storedStaffString ? JSON.parse(storedStaffString) : defaultStaffData;

    const newStaff = {
      id: `TCH${Date.now()}`.slice(0, 6),
      name: app.name,
      email: app.email,
      department: app.subject,
      status: "Active" as const
    };

    const updatedStaff = [...currentStaff, newStaff];
    localStorage.setItem('staffData', JSON.stringify(updatedStaff));
    
    logActivity({ type: 'NEW_TEACHER', payload: { name: app.name }, timestamp: new Date().toISOString() });

    // Remove from applications
    const updatedApps = teacherApps.filter(a => a.id !== app.id);
    setTeacherApps(updatedApps);
    localStorage.setItem('teacherApplications', JSON.stringify(updatedApps));
    toast({
      title: "Application Approved",
      description: `${app.name}'s application has been approved and they have been added to the staff list.`,
    });
     window.dispatchEvent(new Event('storage'));
  };

  const handleReject = (type: 'student' | 'teacher', id: string, name: string) => {
    if (type === 'student') {
        const updatedApps = studentApps.filter(app => app.id !== id);
        setStudentApps(updatedApps);
        localStorage.setItem('studentApplications', JSON.stringify(updatedApps));
    } else {
        const updatedApps = teacherApps.filter(app => app.id !== id);
        setTeacherApps(updatedApps);
        localStorage.setItem('teacherApplications', JSON.stringify(updatedApps));
    }
    toast({
      variant: "destructive",
      title: "Application Rejected",
      description: `${name}'s application has been rejected.`,
    });
    window.dispatchEvent(new Event('storage'));
  };

  const openStudentDialog = (app: StudentApplication) => {
    setSelectedStudentApp(app);
  }

  const closeStudentDialog = () => {
    setSelectedStudentApp(null);
    setAssignHostel(false);
    setSelectedHostel('');
    setSelectedRoom('');
  }
  
  const genderFilteredHostels = useMemo(() => {
      if (!selectedStudentApp) return [];
      const studentGender = selectedStudentApp.gender === 'male' ? 'Male' : 'Female';
      return allHostels.filter(h => h.gender === studentGender);
  }, [selectedStudentApp, allHostels]);
  
  const availableRooms = useMemo(() => {
      if (!selectedHostel) return [];
      const hostel = allHostels.find(h => h.id === selectedHostel);
      return hostel ? hostel.rooms.filter(r => r.occupants.length < r.capacity) : [];
  }, [selectedHostel, allHostels]);


  return (
    <div className="space-y-8">
       <Dialog onOpenChange={(isOpen) => !isOpen && closeStudentDialog()}>
          <Card>
            <CardHeader>
              <CardTitle>Pending Admission Requests</CardTitle>
              <CardDescription>Review and process new student applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Skeleton className="h-8 w-20 inline-block" />
                          <Skeleton className="h-8 w-20 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : studentApps.length > 0 ? (
                    studentApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell className="capitalize">{app.gender}</TableCell>
                        <TableCell>{new Date(app.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => openStudentDialog(app)}>Approve</Button>
                          </DialogTrigger>
                          <Button size="sm" variant="outline" onClick={() => handleReject('student', app.id, app.name)}>Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No pending admission requests.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           {selectedStudentApp && (
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Approve Admission</DialogTitle>
                      <DialogDescription>
                          Review details for {selectedStudentApp.name} and approve their admission.
                      </DialogDescription>
                  </DialogHeader>
                   <div className="py-4 space-y-4">
                      <p><strong>Name:</strong> {selectedStudentApp.name}</p>
                      <p><strong>Email:</strong> {selectedStudentApp.email}</p>
                      <p><strong>Gender:</strong> <span className="capitalize">{selectedStudentApp.gender}</span></p>

                      <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="assignHostel" checked={assignHostel} onCheckedChange={(checked) => setAssignHostel(!!checked)} />
                        <Label htmlFor="assignHostel">Assign to a hostel</Label>
                      </div>

                      {assignHostel && (
                          <div className="grid gap-4 sm:grid-cols-2">
                              <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Hostel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {genderFilteredHostels.map(hostel => (
                                          <SelectItem key={hostel.id} value={hostel.id}>{hostel.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedHostel}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Room" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {availableRooms.map(room => (
                                          <SelectItem key={room.id} value={room.id}>
                                              Room {room.id} ({room.capacity - room.occupants.length} spots left)
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleApproveStudent}>Approve Admission</Button>
                  </DialogFooter>
              </DialogContent>
           )}
       </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Pending Job Applications</CardTitle>
          <CardDescription>Review and process new teacher applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedTeacherApp(null)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-20 inline-block" />
                        <Skeleton className="h-8 w-20 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : teacherApps.length > 0 ? (
                  teacherApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.subject}</TableCell>
                      <TableCell>{app.experience}</TableCell>
                      <TableCell>
                        <DialogTrigger asChild>
                          <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedTeacherApp(app)}>View</Button>
                        </DialogTrigger>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'Pending' ? 'secondary' : 'default'}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" onClick={() => handleApproveTeacher(app)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject('teacher', app.id, app.name)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No pending job applications.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {selectedTeacherApp && (
              <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                      <DialogTitle>Job Application: {selectedTeacherApp.name}</DialogTitle>
                      <DialogDescription>
                          {selectedTeacherApp.subject} - {selectedTeacherApp.experience} experience
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Email</h4>
                          <p className="col-span-3">{selectedTeacherApp.email}</p>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Phone</h4>
                          <p className="col-span-3">{selectedTeacherApp.phone}</p>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Qualification</h4>
                          <p className="col-span-3">{selectedTeacherApp.qualification}</p>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                          <h4 className="text-right font-semibold col-span-1">Cover Letter</h4>
                          <ScrollArea className="h-48 col-span-3 rounded-md border p-4">
                             <p className="text-sm whitespace-pre-wrap">{selectedTeacherApp.coverLetter}</p>
                          </ScrollArea>
                      </div>
                  </div>
              </DialogContent>
            )}
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
