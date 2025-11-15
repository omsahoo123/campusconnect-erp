
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/hooks/use-current-user";
import { Icons } from "@/components/icons";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { userProfiles } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // User wants to type email and password manually
    // setEmail(userProfiles[role].email);
    // setPassword("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        let isAuthenticated = false;
        let loggedInRole: UserRole | null = null;

        // Check hardcoded profiles first
        for (const role in userProfiles) {
            const user = userProfiles[role as UserRole];
            if (user.email === email && password === "password") {
                isAuthenticated = true;
                loggedInRole = role as UserRole;
                break;
            }
        }
        
        // If not found, check generated credentials in localStorage
        if (!isAuthenticated) {
            const storedCredentialsString = localStorage.getItem('userCredentials');
            const storedCredentials = storedCredentialsString ? JSON.parse(storedCredentialsString) : [];
            const foundUser = storedCredentials.find((cred: any) => cred.email === email && cred.password === password);
            if (foundUser) {
                 isAuthenticated = true;
                 loggedInRole = foundUser.role;
            }
        }

        if (isAuthenticated && loggedInRole) {
            localStorage.setItem("userRole", loggedInRole);
            localStorage.setItem("isLoggedIn", "true");

            toast({
                title: "Login Successful",
                description: `Welcome!`,
            });

            router.push("/dashboard");
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password.",
            });
        }

        setIsLoading(false);
    }, 1000);
  };


  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
             <Icons.logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">CampusConnect ERP</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="role">Role (for pre-filled users)</Label>
              <Select onValueChange={(value) => handleRoleChange(value as UserRole)} defaultValue={selectedRole}>
                  <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="user@campus.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Icons.spinner className="animate-spin" /> : "Sign In"}
          </Button>
          <Separator className="my-2" />
            <div className="w-full space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Are you a new applicant?</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/admissions">Student Admission</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/apply">Teacher Application</Link>
                    </Button>
                </div>
            </div>
        </CardFooter>
      </form>
    </Card>
  );
}
