
"use client"

import { useState, useEffect } from "react";
import { studentsData as defaultStudentsData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar as CalendarIcon, ArrowLeft, Trash2, Plus } from "lucide-react";
import { notFound, useRouter, useParams } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/components/dashboard/students/student-table";
import { format, parseISO } from "date-fns";

type Deadline = {
    id: string;
    course: string;
    dueDate: string;
}

type StudentDeadlines = {
    [studentId: string]: Deadline[];
}

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const { toast } = useToast();
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [newDeadline, setNewDeadline] = useState({ course: "", dueDate: "" });


  useEffect(() => {
    const storedStudents = localStorage.getItem('studentsData');
    const data = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
    setStudentsData(data);
    const currentStudent = data.find((s: Student) => s.id === studentId);
    setStudent(currentStudent);

    const storedDeadlines = localStorage.getItem('studentDeadlines');
    if (storedDeadlines) {
        const allDeadlines: StudentDeadlines = JSON.parse(storedDeadlines);
        setDeadlines(allDeadlines[studentId] || []);
    }

  }, [studentId]);

  const updateAllDeadlines = (newStudentDeadlines: StudentDeadlines) => {
    localStorage.setItem('studentDeadlines', JSON.stringify(newStudentDeadlines));
    window.dispatchEvent(new Event('storage'));
  }

  const handleSave = () => {
    if (!student) return;

    const updatedStudents = studentsData.map(s => s.id === student.id ? student : s);
    localStorage.setItem('studentsData', JSON.stringify(updatedStudents));
    window.dispatchEvent(new Event('storage'));
    
    toast({
        title: "Profile Updated",
        description: `${student.name}'s profile has been updated.`,
    });
    setIsEditing(false);
    setStudent({...student}); 
  };
  
  const handleAddDeadline = () => {
      if (!newDeadline.course || !newDeadline.dueDate) {
          toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill out both deadline title and due date.' });
          return;
      }
      const newId = `DLN-${Date.now()}`;
      const deadlineToAdd: Deadline = { ...newDeadline, id: newId };
      const updatedDeadlines = [...deadlines, deadlineToAdd];
      setDeadlines(updatedDeadlines);

      const storedDeadlines = localStorage.getItem('studentDeadlines');
      const allDeadlines: StudentDeadlines = storedDeadlines ? JSON.parse(storedDeadlines) : {};
      allDeadlines[studentId] = updatedDeadlines;
      updateAllDeadlines(allDeadlines);

      setNewDeadline({ course: "", dueDate: "" });
      toast({ title: 'Deadline Added', description: 'New deadline has been added for the student.' });
  }
  
  const handleDeleteDeadline = (deadlineId: string) => {
      const updatedDeadlines = deadlines.filter(d => d.id !== deadlineId);
      setDeadlines(updatedDeadlines);
      
      const storedDeadlines = localStorage.getItem('studentDeadlines');
      const allDeadlines: StudentDeadlines = storedDeadlines ? JSON.parse(storedDeadlines) : {};
      allDeadlines[studentId] = updatedDeadlines;
      updateAllDeadlines(allDeadlines);

      toast({ variant: 'destructive', title: 'Deadline Removed', description: 'The deadline has been removed.' });
  }

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

      <div className="grid md:grid-cols-2 gap-6">
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

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        placeholder="Assignment Title"
                        value={newDeadline.course}
                        onChange={(e) => setNewDeadline({...newDeadline, course: e.target.value})}
                    />
                    <Input 
                        type="date"
                        value={newDeadline.dueDate}
                        onChange={(e) => setNewDeadline({...newDeadline, dueDate: e.target.value})}
                    />
                    <Button onClick={handleAddDeadline} className="sm:w-auto w-full">
                        <Plus className="h-4 w-4 mr-2" /> Add Deadline
                    </Button>
                </div>
                 <div className="space-y-2 pt-4">
                    {deadlines.length > 0 ? (
                        deadlines.map(deadline => (
                            <div key={deadline.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div>
                                    <p className="font-medium">{deadline.course}</p>
                                    <p className="text-sm text-muted-foreground">Due: {format(parseISO(deadline.dueDate), 'do MMMM, yyyy')}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDeadline(deadline.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No deadlines set for this student.</p>
                    )}
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
