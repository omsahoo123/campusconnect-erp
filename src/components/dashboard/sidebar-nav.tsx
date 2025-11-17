
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type UserRole } from "@/hooks/use-current-user";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, GraduationCap, Briefcase, Banknote, BookOpen, Settings, FileText, CalendarCheck, CalendarDays, Home } from "lucide-react";
import React from "react";

const navItems = {
  admin: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/applications", icon: <FileText />, label: "Applications", tooltip: "Applications" },
    { href: "/dashboard/students", icon: <Users />, label: "Students", tooltip: "Students" },
    { href: "/dashboard/staff", icon: <Briefcase />, label: "Staff", tooltip: "Staff" },
    { href: "/dashboard/admissions", icon: <GraduationCap />, label: "Admissions", tooltip: "Admissions" },
    { href: "/dashboard/finance", icon: <Banknote />, label: "Finance", tooltip: "Finance" },
    { href: "/dashboard/holidays", icon: <CalendarDays />, label: "Holidays", tooltip: "Holidays" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
  teacher: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/courses", icon: <BookOpen />, label: "My Courses", tooltip: "Courses" },
    { href: "/dashboard/students", icon: <Users />, label: "My Students", tooltip: "Students" },
    { href: "/dashboard/attendance", icon: <CalendarCheck />, label: "Attendance", tooltip: "Attendance" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
  student: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/courses", icon: <BookOpen />, label: "My Courses", tooltip: "Courses" },
    { href: "/dashboard/grades", icon: <GraduationCap />, label: "Grades", tooltip: "Grades" },
    { href: "/dashboard/finance", icon: <Banknote />, label: "Fees", tooltip: "Fees" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Profile", tooltip: "Profile" },
  ],
  finance: [
    { href: "/dashboard/finance", icon: <Banknote />, label: "Fee Management", tooltip: "Fee Management" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
  hostel: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/rooms", icon: <Home />, label: "Rooms", tooltip: "Rooms" },
    { href: "/dashboard/hostel-students", icon: <Users />, label: "Students", tooltip: "Students" },
    { href: "/dashboard/mess", icon: <GraduationCap />, label: "Mess", tooltip: "Mess" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
};

interface SidebarNavProps {
  role: UserRole;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <SidebarContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                tooltip={item.tooltip}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
