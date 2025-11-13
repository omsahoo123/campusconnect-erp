
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

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("student@campus.edu");
  const [password, setPassword] = useState("password");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const userRole = (Object.keys(userProfiles) as UserRole[]).find(
      (role) => userProfiles[role].email === email
    );

    if (userRole) {
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", userRole);
        window.dispatchEvent(new Event("roleChanged"));
        router.push("/dashboard");
      }
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password.",
        });
    }
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
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
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
