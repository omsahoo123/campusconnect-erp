import { MainLayout } from "@/components/dashboard/main-layout";
import { AppDataProvider } from "@/context/app-data-provider";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppDataProvider>
            <MainLayout>{children}</MainLayout>
        </AppDataProvider>
    )
}
