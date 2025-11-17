
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, Activity, FileText } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useAppData } from "@/context/app-data-provider";

const chartConfig: ChartConfig = {
    admissions: {
      label: "New Admissions",
      color: "hsl(var(--primary))",
    },
};

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'NEW_STUDENT': return <Users className="h-4 w-4" />;
        case 'NEW_TEACHER': return <Briefcase className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
}

const getActivityMessage = (item: any) => {
    switch (item.type) {
        case 'NEW_STUDENT': return `New student <span class="font-medium">${item.payload.name}</span> was enrolled.`;
        case 'NEW_TEACHER': return `New teacher <span class="font-medium">${item.payload.name}</span> was hired.`;
        case 'SYSTEM_START': return `System started up successfully.`;
        default: return 'An unknown activity occurred.';
    }
}

export function AdminDashboard() {
  const { students, staff, studentApplications, teacherApplications, activityLog } = useAppData();

  const admissionsData = useMemo(() => {
    const monthlyAdmissions: { [key: string]: number } = {};

    students.forEach(student => {
        try {
            const joinDate = parseISO(student.joinDate);
            const month = joinDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyAdmissions[month] = (monthlyAdmissions[month] || 0) + 1;
        } catch (error) {
            console.error(`Invalid joinDate for student ${student.id}: ${student.joinDate}`);
        }
    });

    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    }).reverse();
    
    return last6Months.map(monthStr => ({
        month: monthStr.split(' ')[0], // just 'Jan', 'Feb' etc.
        admissions: monthlyAdmissions[monthStr] || 0
    }));

  }, [students]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">Active and on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Student Apps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{studentApplications.length}</div>
            <p className="text-xs text-muted-foreground">New admissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Teacher Apps</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{teacherApplications.length}</div>
            <p className="text-xs text-muted-foreground">New job applications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Admissions Overview</CardTitle>
            <CardDescription>New student admissions over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={admissionsData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="admissions" fill="var(--color-admissions)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent system-wide events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activityLog.slice(0, 5).map((item, index) => (
                     <div key={index} className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                            {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: getActivityMessage(item) }}></p>
                             <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
