
"use client"

import { FinanceDashboard } from "@/components/dashboard/dashboards/finance-dashboard";
import { FeeManagement } from "@/components/finance/fee-management";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function FinancePage() {
    const { role } = useCurrentUser();

    if (role === 'finance') {
        return <FeeManagement />;
    }

    // Default to showing the dashboard for other roles if they land here
    return <FinanceDashboard />;
}
