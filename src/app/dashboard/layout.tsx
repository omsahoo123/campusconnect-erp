import { MainLayout } from "@/components/dashboard/main-layout";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>
}