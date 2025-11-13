import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CircleDollarSign, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { feeCollectionData } from "@/lib/data";

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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,142.60</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,980.00</div>
            <p className="text-xs text-muted-foreground">from 52 students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$33,089.29</div>
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
                <AreaChart data={feeCollectionData} accessibilityLayer>
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
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Tuition Fee from STU001</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">+$1,500.00</p>
            </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Stationery Supplies</p>
                    <p className="text-xs text-muted-foreground">8 hours ago</p>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">-$45.50</p>
            </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Hostel Fee from STU002</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">+$800.00</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Internet Bill</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">-$250.00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
