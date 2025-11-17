
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CircleDollarSign, Wallet, Home, Hourglass } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { feeCollectionData as defaultFeeData, defaultStudentFees, Payment } from "@/lib/finance";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { type AllStudentFees } from "@/lib/finance";
import { studentsData as defaultStudentsData } from "@/lib/data";


const chartConfig: ChartConfig = {
    collected: {
        label: "Collected",
        color: "hsl(var(--chart-1))",
    },
    pending: {
        label: "Pending",
        color: "hsl(var(--chart-2))",
    },
};

export function FinanceDashboard() {
    const [allFees, setAllFees] = useState<AllStudentFees>({});

    const loadData = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                const storedFees = localStorage.getItem('studentFees');
                setAllFees(storedFees ? JSON.parse(storedFees) : defaultStudentFees);
            }
        } catch (error) {
            console.error("Failed to load finance data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        loadData();
        
        const handleStorageChange = (event: StorageEvent) => {
             if (event.key === 'studentFees') {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadData]);


    const { 
        totalTuition, 
        totalHostel,
        pendingTuition,
        pendingHostel
    } = useMemo(() => {
        const stats = {
            totalTuition: 0,
            totalHostel: 0,
            paidTuition: 0,
            paidHostel: 0
        };

        for (const studentId in allFees) {
            const feeRecord = allFees[studentId];
            stats.totalTuition += feeRecord.totalTuition;
            stats.totalHostel += feeRecord.totalHostelFee;
            
            feeRecord.payments.forEach(payment => {
                if (payment.type === 'Tuition') {
                    stats.paidTuition += payment.amount;
                } else if (payment.type === 'Hostel') {
                    stats.paidHostel += payment.amount;
                }
            });
        }
        
        return {
            totalTuition: stats.totalTuition,
            totalHostel: stats.totalHostel,
            pendingTuition: stats.totalTuition - stats.paidTuition,
            pendingHostel: stats.totalHostel - stats.paidHostel,
        };
    }, [allFees]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    
    const recentTransactions = useMemo(() => {
        const allPayments: (Payment & { studentName: string })[] = [];
        const studentList = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('studentsData') || '[]') : defaultStudentsData;
        
        for (const studentId in allFees) {
            const student = studentList.find((s: any) => s.id === studentId);
            const studentName = student ? student.name : 'Unknown Student';
            allFees[studentId].payments.forEach(p => {
                allPayments.push({ ...p, studentName });
            });
        }

        return allPayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);
    }, [allFees]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Finance Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tuition Fee</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTuition)}</div>
            <p className="text-xs text-muted-foreground">Expected from all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hostel Fee</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalHostel)}</div>
            <p className="text-xs text-muted-foreground">Expected from residents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tuition Fee</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingTuition)}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Hostel Fee</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingHostel)}</div>
            <p className="text-xs text-muted-foreground">Across all residents</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
            <CardDescription>Collected vs. pending fees for the current semester.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={defaultFeeData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="collected"
                    type="natural"
                    fill="var(--color-collected)"
                    fillOpacity={0.4}
                    stroke="var(--color-collected)"
                    stackId="a"
                  />
                   <Area
                    dataKey="pending"
                    type="natural"
                    fill="var(--color-pending)"
                    fillOpacity={0.4}
                    stroke="var(--color-pending)"
                    stackId="a"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {recentTransactions.length > 0 ? recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center gap-3">
                    <div className={'p-2 rounded-full bg-green-100 dark:bg-green-900/50'}>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{transaction.type} Fee from {transaction.studentName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'dd MMM yyyy')}</p>
                    </div>
                    <p className={'text-sm font-medium text-green-600 dark:text-green-400'}>
                        +{formatCurrency(transaction.amount)}
                    </p>
                </div>
             )) : (
                <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground text-sm">No recent payments found.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
