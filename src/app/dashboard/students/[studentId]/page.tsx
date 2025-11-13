"use client";

import { studentsData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage({ params }: { params: { studentId: string } }) {
  const router = useRouter();
  const student = studentsData.find(s => s.id === params.studentId);

  if (!student) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'student-avatar')?.imageUrl || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
      </div>

      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={student.name} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.id}</p>
          <Badge className="mt-2" variant={student.status === "Active" ? "default" : student.status === "Suspended" ? "destructive" : "secondary"}>
            {student.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <a href={`mailto:${student.email}`} className="text-sm hover:underline">{student.email}</a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">(123) 456-7890</span>
          </div>
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Joined on {new Date(student.joinDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-medium">B.Sc. Computer Science</p>
            <p className="text-sm text-muted-foreground">Semester 3</p>
        </CardContent>
      </Card>
    </div>
  );
}
