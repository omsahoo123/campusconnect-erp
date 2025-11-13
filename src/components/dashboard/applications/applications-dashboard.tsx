"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function ApplicationsDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const studentApplicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'student_applications'), where('status', '==', 'Pending'));
  }, [firestore]);
  
  const teacherApplicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'teacher_applications'), where('status', '==', 'Pending'));
  }, [firestore]);

  const { data: studentApps, isLoading: studentLoading } = useCollection(studentApplicationsQuery);
  const { data: teacherApps, isLoading: teacherLoading } = useCollection(teacherApplicationsQuery);
  
  const handleApprove = (collectionName: string, id: string, name: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    updateDocumentNonBlocking(docRef, { status: "Approved" });
    toast({
      title: "Application Approved",
      description: `${name}'s application has been approved.`,
    });
  };

  const handleReject = (collectionName: string, id: string, name: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    updateDocumentNonBlocking(docRef, { status: "Rejected" });
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
                        <Button size="sm" onClick={() => handleApprove('student_applications', app.id, `${app.firstName} ${app.lastName}`)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('student_applications', app.id, `${app.firstName} ${app.lastName}`)}>Reject</Button>
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
                        <Button size="sm" onClick={() => handleApprove('teacher_applications', app.id, `${app.firstName} ${app.lastName}`)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject('teacher_applications', app.id, `${app.firstName} ${app.lastName}`)}>Reject</Button>
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
