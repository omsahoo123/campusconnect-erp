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
import { LayoutDashboard, Users, GraduationCap, Briefcase, Banknote, BookOpen, Settings } from "lucide-react";
import React from "react";

const navItems = {
  admin: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/students", icon: <Users />, label: "Students", tooltip: "Students" },
    { href: "/dashboard/staff", icon: <Briefcase />, label: "Staff", tooltip: "Staff" },
    { href: "/dashboard/admissions", icon: <GraduationCap />, label: "Admissions", tooltip: "Admissions" },
    { href: "/dashboard/finance", icon: <Banknote />, label: "Finance", tooltip: "Finance" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
  teacher: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/courses", icon: <BookOpen />, label: "My Courses", tooltip: "Courses" },
    { href: "/dashboard/students", icon: <Users />, label: "My Students", tooltip: "Students" },
    { href: "/dashboard/attendance", icon: <GraduationCap />, label: "Attendance", tooltip: "Attendance" },
    { href: "/dashboard/settings", icon: <Settings />, label: "Settings", tooltip: "Settings" },
  ],
  student: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/courses", icon: <BookOpen />, label: "My Courses", tooltip: "Courses" },
    { href: "/dashboard/grades", icon: <GraduationCap />, label: "Grades", tooltip: "Grades" },
    { href: "/dashboard/fees", icon: <Banknote />, label: "Fees", tooltip: "Fees" },
    { href: "/dashboard/profile", icon: <Users />, label: "Profile", tooltip: "Profile" },
  ],
  finance: [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/dashboard/fee-collection", icon: <Banknote />, label: "Fee Collection", tooltip: "Fee Collection" },
    { href: "/dashboard/expenses", icon: <Users />, label: "Expenses", tooltip: "Expenses" },
    { href: "/dashboard/reports", icon: <GraduationCap />, label: "Reports", tooltip: "Reports" },
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
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === item.href}
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
