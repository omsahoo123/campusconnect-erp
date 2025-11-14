"use client"

import { useState, useEffect } from "react";
import { studentsData as defaultStudentsData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/components/dashboard/students/student-table";

export default function StudentProfilePage({ params }: { params: { studentId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedStudents = localStorage.getItem('studentsData');
    const data = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
    setStudentsData(data);
    const currentStudent = data.find((s: Student) => s.id === params.studentId);
    setStudent(currentStudent);
  }, [params.studentId]);

  const handleSave = () => {
    if (!student) return;

    const updatedStudents = studentsData.map(s => s.id === student.id ? student : s);
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    
    toast({
        title: "Profile Updated",
        description: `${student.name}'s profile has been updated.`,
    });
    setIsEditing(false);
    // Force a re-render by updating state
    setStudent({...student}); 
  };
  
  if (student === undefined) {
      return <div>Loading...</div>
  }

  if (!student) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'student-avatar')?.imageUrl || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/students">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
      </div>

      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={student.name} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
            {isEditing ? (
                 <Input className="text-3xl font-bold" value={student.name} onChange={(e) => setStudent({...student, name: e.target.value })} />
            ) : (
                 <h1 className="text-3xl font-bold">{student.name}</h1>
            )}
         
          <p className="text-muted-foreground">{student.id}</p>
          {isEditing ? (
              <Select value={student.status} onValueChange={(value: "Active" | "Inactive" | "Suspended") => setStudent({...student, status: value})}>
                  <SelectTrigger className="w-[180px] mt-2">
                      <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
              </Select>
          ) : (
             <Badge className="mt-2" variant={student.status === "Active" ? "default" : student.status === "Suspended" ? "destructive" : "secondary"}>
                {student.status}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            {isEditing ? (
                <Input value={student.email} onChange={(e) => setStudent({...student, email: e.target.value})} />
            ) : (
                <a href={`mailto:${student.email}`} className="text-sm hover:underline">{student.email}</a>
            )}
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
