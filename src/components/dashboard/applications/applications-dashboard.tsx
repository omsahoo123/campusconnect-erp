"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const mockStudentApps = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.d@example.com', program: 'B.Sc. Computer Science', applicationDate: '2024-07-20', status: 'Pending' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.s@example.com', program: 'B.A. History', applicationDate: '2024-07-19', status: 'Pending' },
];

const mockTeacherApps = [
    { id: '3', firstName: 'Peter', lastName: 'Jones', email: 'peter.j@example.com', subject: 'Mathematics', applicationDate: '2024-07-18', status: 'Pending' },
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

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
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
          <CardTitle>Pending Student Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {studentLoading ? renderSkeleton() : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentApps && studentApps.length > 0 ? (
                  studentApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.program}</TableCell>
                      <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => handleApprove('student', app.id, `${app.firstName} ${app.lastName}`)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('student', app.id, `${app.firstName} ${app.lastName}`)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No pending student applications.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Teacher Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherLoading ? renderSkeleton() : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherApps && teacherApps.length > 0 ? (
                  teacherApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.subject}</TableCell>
                      <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => handleApprove('teacher', app.id, `${app.firstName} ${app.lastName}`)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('teacher', app.id, `${app.firstName} ${app.lastName}`)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No pending teacher applications.</TableCell>
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
