
import { staffData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Briefcase, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StaffProfilePage({ params }: { params: { staffId: string } }) {
  const staff = staffData.find(s => s.id === params.staffId);

  if (!staff) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'teacher-avatar')?.imageUrl || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/staff">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={staff.name} />
            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{staff.name}</h1>
          <p className="text-muted-foreground">{staff.id}</p>
          <Badge className="mt-2" variant={staff.status === "Active" ? "default" : "secondary"}>
            {staff.status}
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
            <a href={`mailto:${staff.email}`} className="text-sm hover:underline">{staff.email}</a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">(123) 456-7890</span>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Department</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">{staff.department}</p>
        </CardContent>
      </Card>
    </div>
  );
}
