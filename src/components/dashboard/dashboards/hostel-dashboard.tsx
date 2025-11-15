
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Bed, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { useState, useEffect, useMemo, useCallback } from "react";
import { defaultRoomStatusData, defaultHostelStudents, defaultMessData } from "@/lib/hostel";
import { useToast } from "@/hooks/use-toast";

const chartConfig: ChartConfig = {
  occupied: {
    label: "Occupied",
    color: "hsl(var(--chart-1))",
  },
  available: {
    label: "Available",
    color: "hsl(var(--chart-2))",
  },
};

type RoomStatus = {
    floor: string;
    occupied: number;
    total: number;
}

type MessData = {
    status: string;
    nextMeal: string;
}

export function HostelDashboard() {
  const [roomStatus, setRoomStatus] = useState<RoomStatus[]>([]);
  const [hostelStudentCount, setHostelStudentCount] = useState(0);
  const [messData, setMessData] = useState<MessData>({ status: 'Inactive', nextMeal: 'N/A' });
  const { toast } = useToast();

  const loadData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedRoomStatus = localStorage.getItem('hostelRoomStatus');
        setRoomStatus(storedRoomStatus ? JSON.parse(storedRoomStatus) : defaultRoomStatusData);
        
        const storedHostelStudents = localStorage.getItem('hostelStudents');
        setHostelStudentCount(storedHostelStudents ? JSON.parse(storedHostelStudents).length : defaultHostelStudents.length);
        
        const storedMessData = localStorage.getItem('hostelMessData');
        setMessData(storedMessData ? JSON.parse(storedMessData) : defaultMessData);

      }
    } catch (error) {
      console.error("Failed to load hostel data from localStorage", error);
       toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load hostel data from local storage.",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadData();

    // Initialize if not present
    if (!localStorage.getItem('hostelRoomStatus')) {
        localStorage.setItem('hostelRoomStatus', JSON.stringify(defaultRoomStatusData));
    }
    if (!localStorage.getItem('hostelStudents')) {
        localStorage.setItem('hostelStudents', JSON.stringify(defaultHostelStudents));
    }
    if (!localStorage.getItem('hostelMessData')) {
        localStorage.setItem('hostelMessData', JSON.stringify(defaultMessData));
    }


    const handleStorageChange = (event: StorageEvent) => {
      if (['hostelRoomStatus', 'hostelStudents', 'hostelMessData'].includes(event.key || '')) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);


  const { totalRooms, occupiedRooms } = useMemo(() => {
    const total = roomStatus.reduce((acc, floor) => acc + floor.total, 0);
    const occupied = roomStatus.reduce((acc, floor) => acc + floor.occupied, 0);
    return { totalRooms: total, occupiedRooms: occupied };
  }, [roomStatus]);

  const chartData = useMemo(() => {
    return roomStatus.map(floor => ({
        ...floor,
        available: floor.total - floor.occupied
    }));
  }, [roomStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Hostel Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">Across all floors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">{totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(0) : 0}% occupancy rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostelStudentCount}</div>
            <p className="text-xs text-muted-foreground">Currently residing in hostel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mess Management</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messData.status}</div>
            <p className="text-xs text-muted-foreground">Next meal: {messData.nextMeal}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Occupancy by Floor</CardTitle>
          <CardDescription>A breakdown of room status across different floors.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="floor" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="occupied" fill="var(--color-occupied)" radius={4} stackId="a" />
                <Bar dataKey="available" fill="var(--color-available)" radius={4} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
