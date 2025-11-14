
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { studentsData as defaultStudentsData } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";


interface StudentApplication {
  id: string;
  name: string;
  grade: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  status: 'Pending';
  email: string;
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

export function ApplicationsDashboard() {
  const { toast } = useToast();
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [teacherApps, setTeacherApps] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<TeacherApplication | null>(null);

  const loadApplications = useCallback(() => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedStudentApps = localStorage.getItem('studentApplications');
        setStudentApps(storedStudentApps ? JSON.parse(storedStudentApps) : []);
        
        const storedTeacherApps = localStorage.getItem('teacherApplications');
        setTeacherApps(storedTeacherApps ? JSON.parse(storedTeacherApps) : []);
      }
    } catch (error) {
      console.error("Failed to parse applications from localStorage", error);
      setStudentApps([]);
      setTeacherApps([]);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load applications from local storage.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadApplications();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentApplications' || event.key === 'teacherApplications') {
        loadApplications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadApplications]);


  const handleApprove = (type: 'student' | 'teacher', id: string, name: string, appData?: StudentApplication) => {
    if (type === 'student' && appData) {
      // Add to main students list
      const storedStudentsString = localStorage.getItem('studentsData');
      const currentStudents = storedStudentsString ? JSON.parse(storedStudentsString) : defaultStudentsData;
      
      const newStudent = {
        id: `STU${Date.now()}`.slice(0, 6),
        name: appData.name,
        email: appData.email,
        joinDate: new Date().toISOString(),
        status: "Active" as const
      };

      const updatedStudents = [...currentStudents, newStudent];
      localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
      window.dispatchEvent(new Event('storage')); // Manually trigger storage event for other components

      // Remove from applications
      const updatedApps = studentApps.filter(app => app.id !== id);
      setStudentApps(updatedApps);
      localStorage.setItem('studentApplications', JSON.stringify(updatedApps));

      toast({
        title: "Application Approved",
        description: `${name}'s application has been approved and they have been added to the student list.`,
      });

    } else if (type === 'teacher') {
      const updatedApps = teacherApps.filter(app => app.id !== id);
      setTeacherApps(updatedApps);
      localStorage.setItem('teacherApplications', JSON.stringify(updatedApps));
      toast({
        title: "Application Approved",
        description: `${name}'s application has been approved.`,
      });
    }
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
  };

  return (
    <div className="space-y-8">
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
                      <Button size="sm" onClick={() => handleApprove('student', app.id, app.name, app)}>Approve</Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Pending Job Applications</CardTitle>
          <CardDescription>Review and process new teacher applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedApp(null)}>
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
                          <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedApp(app)}>View</Button>
                        </DialogTrigger>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'Pending' ? 'secondary' : 'default'}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" onClick={() => handleApprove('teacher', app.id, app.name)}>Approve</Button>
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
            {selectedApp && (
              <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                      <DialogTitle>Job Application: {selectedApp.name}</DialogTitle>
                      <DialogDescription>
                          {selectedApp.subject} - {selectedApp.experience} experience
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Email</h4>
                          <p className="col-span-3">{selectedApp.email}</p>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Phone</h4>
                          <p className="col-span-3">{selectedApp.phone}</p>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <h4 className="text-right font-semibold col-span-1">Qualification</h4>
                          <p className="col-span-3">{selectedApp.qualification}</p>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                          <h4 className="text-right font-semibold col-span-1">Cover Letter</h4>
                          <ScrollArea className="h-48 col-span-3 rounded-md border p-4">
                             <p className="text-sm whitespace-pre-wrap">{selectedApp.coverLetter}</p>
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
