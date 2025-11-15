
"use client";

import React, { useEffect } from 'react';
import { useCurrentUser } from "@/hooks/use-current-user";
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { UserNav } from "./user-nav";
import { Icons } from '../icons';
import { usePathname, useRouter } from 'next/navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { role, isLoaded } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !role) {
      router.push("/login");
    }
  }, [role, isLoaded, router]);

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/staff/')) return "Staff Profile";
    if (pathname.startsWith('/dashboard/students/')) return "Student Profile";
    if (pathname.startsWith('/dashboard/students')) return "Students";
    if (pathname.startsWith('/dashboard/admissions')) return "Admissions";
    if (pathname.startsWith('/dashboard/staff')) return "Staff";
    if (pathname.startsWith('/dashboard/applications')) return "Applications";
    if (pathname.startsWith('/dashboard/settings')) return "Settings";
    if (pathname.startsWith('/dashboard/courses')) return "Courses";
    if (pathname.startsWith('/dashboard/attendance')) return "Attendance";
    if (pathname.startsWith('/dashboard/holidays')) return "Holiday Management";
    return "Dashboard";
  }

  if (!isLoaded || !role) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Icons.logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className='p-4'>
            <div className="flex items-center gap-2" data-testid="sidebar-header">
                <Icons.logo className="h-8 w-8 shrink-0 text-sidebar-primary" />
                <span className="text-lg font-semibold text-sidebar-foreground truncate">CampusConnect</span>
            </div>
        </SidebarHeader>
        <SidebarNav role={role} />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:flex" />
          <h1 className="text-lg font-semibold md:text-xl font-headline">{getPageTitle()}</h1>
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
