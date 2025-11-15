
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useCurrentUser } from "@/hooks/use-current-user"
import { userProfiles, studentsData } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Textarea } from "@/components/ui/textarea"
import type { UserRole } from "@/hooks/use-current-user"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { setTheme } = useTheme()
  const { role } = useCurrentUser()
  const { toast } = useToast();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (role) {
      const storedAvatar = localStorage.getItem(`${role}-avatar-url`);
      if (storedAvatar) {
        setAvatarUrl(storedAvatar);
      } else {
        setAvatarUrl(getAvatarUrl(role));
      }
    }
  }, [role]);

  if (!role) {
    return null;
  }

  const profile = userProfiles[role]
  const studentDetails = role === 'student' ? studentsData.find(s => s.email === profile.email) : null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  function getAvatarUrl(role: UserRole) {
    const avatarId = `${role}-avatar`;
    return PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl || '';
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (newAvatarFile && avatarUrl.startsWith('data:')) {
      localStorage.setItem(`${role}-avatar-url`, avatarUrl);
      window.dispatchEvent(new Event('storage')); // To update UserNav
    }
    toast({
      title: "Settings Saved",
      description: "Your profile changes have been saved.",
    });
  }
  
  if (role === 'student' && profile.email !== 'a.johnson@campus.edu') {
      router.push('/dashboard/settings');
      return null;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Make changes to your public information here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} alt={profile.name} />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2">
                    <Label htmlFor="picture">Profile Picture</Label>
                    <Input id="picture" type="file" className="max-w-sm" onChange={handleFileChange} accept="image/*" />
                    <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={profile.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile.email} disabled />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="(123) 456-7890" />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue={studentDetails ? "123 University Ave, City, Country" : "N/A"} />
                </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Select the theme for the dashboard.</p>
                    <div className="flex gap-4 pt-2">
                        <Button variant="outline" onClick={() => setTheme("light")}>Light</Button>
                        <Button onClick={() => setTheme("dark")}>Dark</Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
