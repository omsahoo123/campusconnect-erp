
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CircleDollarSign, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { feeCollectionData as defaultFeeData, defaultTransactions, defaultStudentFees } from "@/lib/finance";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";

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

type Transaction = {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
};

type StudentFee = {
    total: number;
    paid: number;
    due: number;
};

type StudentFees = {
    [studentId: string]: StudentFee;
};


export function FinanceDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [studentFees, setStudentFees] = useState<StudentFees>({});

    const loadData = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                const storedTransactions = localStorage.getItem('transactions');
                setTransactions(storedTransactions ? JSON.parse(storedTransactions) : defaultTransactions);

                const storedFees = localStorage.getItem('studentFees');
                setStudentFees(storedFees ? JSON.parse(storedFees) : defaultStudentFees);
            }
        } catch (error) {
            console.error("Failed to load finance data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        loadData();
        const handleStorageChange = (event: StorageEvent) => {
            if (['transactions', 'studentFees'].includes(event.key || '')) {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);


    const { totalRevenue, totalExpenses, outstandingFees, netProfit } = useMemo(() => {
        const revenue = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
            
        const outstanding = Object.values(studentFees).reduce((acc, fee) => acc + fee.due, 0);

        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            outstandingFees: outstanding,
            netProfit: revenue - expenses,
        };
    }, [transactions, studentFees]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };
    
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);
    }, [transactions]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Finance Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingFees)}</div>
            <p className="text-xs text-muted-foreground">from all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
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
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                        {transaction.type === 'income' ? 
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'dd MMM yyyy')}</p>
                    </div>
                    <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
