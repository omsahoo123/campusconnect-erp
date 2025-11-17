
"use client"

import { useState, useEffect } from "react";
import { staffData as defaultStaffData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Briefcase, ArrowLeft } from "lucide-react";
import { notFound, useRouter, useParams } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Staff } from "@/components/dashboard/staff/staff-table";

export default function StaffProfilePage() {
  const router = useRouter();
  const params = useParams<{ staffId: string }>();
  const staffIdFromUrl = params.staffId;
  const { toast } = useToast();
  
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedStaff = localStorage.getItem('staffData');
    const data = storedStaff ? JSON.parse(storedStaff) : defaultStaffData;
    const currentStaff = data.find((s: Staff) => s.id === staffIdFromUrl);
    setStaff(currentStaff);
  }, [staffIdFromUrl]);

  const handleSave = () => {
    if (!staff) return;

    const storedStaff = localStorage.getItem('staffData');
    const staffData = storedStaff ? JSON.parse(storedStaff) : defaultStaffData;
    const updatedStaff = staffData.map((s: Staff) => 
        s.id === staffIdFromUrl ? staff : s
    );
    localStorage.setItem('staffData', JSON.stringify(updatedStaff));
    window.dispatchEvent(new Event('storage'));
    
    toast({
        title: "Profile Updated",
        description: `${staff.name}'s profile has been updated.`,
    });
    setIsEditing(false);
  };

  if (staff === undefined) {
      return <div>Loading...</div>;
  }

  if (!staff) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'teacher-avatar')?.imageUrl || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/staff">
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
            <AvatarImage src={avatarUrl} alt={staff.name} />
            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
        </Avatar>
        <div>
            {isEditing ? (
                 <Input className="text-3xl font-bold mb-2" value={staff.name || ''} onChange={(e) => setStaff({...staff, name: e.target.value })} />
            ) : (
                 <h1 className="text-3xl font-bold">{staff.name}</h1>
            )}
            
            <p className="text-muted-foreground">{staff.id}</p>
          
            {isEditing ? (
              <Select value={staff.status} onValueChange={(value: "Active" | "On Leave" | "Inactive") => setStaff({...staff, status: value})}>
                  <SelectTrigger className="w-[180px] mt-2">
                      <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
              </Select>
            ) : (
               <Badge className="mt-2" variant={staff.status === "Active" ? "default" : "secondary"}>
                    {staff.status}
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
                <Input value={staff.email || ''} onChange={(e) => setStaff({...staff, email: e.target.value})} />
            ) : (
                <a href={`mailto:${staff.email}`} className="text-sm hover:underline">{staff.email}</a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
             {isEditing ? (
                <Input value={staff.phone || ''} onChange={(e) => setStaff({...staff, phone: e.target.value})} />
            ) : (
                <span className="text-sm">{staff.phone}</span>
            )}
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Department</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
             {isEditing ? (
                <Input value={staff.department || ''} onChange={(e) => setStaff({...staff, department: e.target.value})} />
            ) : (
                <p className="text-sm font-medium">{staff.department}</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
