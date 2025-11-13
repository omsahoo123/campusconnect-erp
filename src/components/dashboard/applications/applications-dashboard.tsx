
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const mockStudentApps: any[] = [
    // { id: '1', name: 'John Doe', grade: 'A', gender: 'Male', date: '2024-07-20', status: 'Pending' },
];

const mockTeacherApps: any[] = [
    // { id: '3', name: 'Peter Jones', subject: 'Mathematics', experience: '5 years', resume: 'View', status: 'Pending' },
];


export function ApplicationsDashboard() {
  const { toast } = useToast();
  const [studentApps, setStudentApps] = useState(mockStudentApps);
  const [teacherApps, setTeacherApps] = useState(mockTeacherApps);
  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const handleApprove = (type: 'student' | 'teacher', id: string, name: string) => {
    if (type === 'student') {
        setStudentApps(prev => prev.filter(app => app.id !== id));
    } else {
        setTeacherApps(prev => prev.filter(app => app.id !== id));
    }
    toast({
      title: "Application Approved",
      description: `${name}'s application has been approved.`,
    });
  };

  const handleReject = (type: 'student' | 'teacher', id: string, name: string) => {
    if (type === 'student') {
        setStudentApps(prev => prev.filter(app => app.id !== id));
    } else {
        setTeacherApps(prev => prev.filter(app => app.id !== id));
    }
    toast({
      variant: "destructive",
      title: "Application Rejected",
      description: `${name}'s application has been rejected.`,
    });
  };

  const renderSkeleton = (isTeacher = false) => (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              {isTeacher && <TableHead><Skeleton className="h-5 w-24" /></TableHead>}
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(2)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    {isTeacher && <TableCell><Skeleton className="h-5 w-full" /></TableCell>}
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Admission Requests</CardTitle>
          <CardDescription>Review and process new student applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentLoading ? renderSkeleton() : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentApps && studentApps.length > 0 ? (
                  studentApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.grade}</TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell>{new Date(app.date).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => handleApprove('student', app.id, app.name)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('student', app.id, app.name)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No pending applications.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Job Applications</CardTitle>
          <CardDescription>Review and process new teacher applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {teacherLoading ? renderSkeleton(true) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Resume/Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherApps && teacherApps.length > 0 ? (
                  teacherApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.subject}</TableCell>
                      <TableCell>{app.experience}</TableCell>
                       <TableCell>
                        <Button variant="link" className="p-0 h-auto">{app.resume}</Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'Pending' ? 'secondary' : 'default'}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => handleApprove('teacher', app.id, app.name)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('teacher', app.id, app.name)}>Reject</Button>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
