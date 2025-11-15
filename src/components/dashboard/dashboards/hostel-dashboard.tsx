
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Bed, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { useState, useEffect, useMemo, useCallback } from "react";
import { defaultRooms, defaultHostelStudents, defaultMessData, type Room } from "@/lib/hostel";
import { useToast } from "@/hooks/use-toast";
import { studentsData as allStudentsData } from "@/lib/data";

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

type MessData = {
    status: string;
    nextMeal: string;
}

export function HostelDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messData, setMessData] = useState<MessData>({ status: 'Inactive', nextMeal: 'N/A' });
  const { toast } = useToast();

  const loadData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedRooms = localStorage.getItem('hostelRooms');
        setRooms(storedRooms ? JSON.parse(storedRooms) : defaultRooms);
        
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
    if (!localStorage.getItem('hostelRooms')) {
        localStorage.setItem('hostelRooms', JSON.stringify(defaultRooms));
    }
    if (!localStorage.getItem('hostelMessData')) {
        localStorage.setItem('hostelMessData', JSON.stringify(defaultMessData));
    }


    const handleStorageChange = (event: StorageEvent) => {
      if (['hostelRooms', 'hostelMessData'].includes(event.key || '')) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);


  const { totalRooms, occupiedRooms, totalCapacity, hostelStudentCount } = useMemo(() => {
    const totalCap = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupiedCount = rooms.reduce((acc, room) => acc + room.occupants.length, 0);
    
    // Get unique student IDs from all rooms
    const studentIds = new Set(rooms.flatMap(room => room.occupants));

    return { 
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter(r => r.occupants.length > 0).length,
        totalCapacity: totalCap,
        hostelStudentCount: studentIds.size,
    };
  }, [rooms]);

  const chartData = useMemo(() => {
    const floors = [...new Set(rooms.map(r => r.floor))];
    return floors.map(floorNum => {
        const roomsOnFloor = rooms.filter(r => r.floor === floorNum);
        const occupiedCount = roomsOnFloor.reduce((acc, room) => acc + room.occupants.length, 0);
        const totalCapacityOnFloor = roomsOnFloor.reduce((acc, room) => acc + room.capacity, 0);
        return {
            floor: `Floor ${floorNum}`,
            occupied: occupiedCount,
            available: totalCapacityOnFloor - occupiedCount,
        }
    });
  }, [rooms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Hostel Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">{totalRooms} rooms available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostelStudentCount} / {totalCapacity}</div>
            <p className="text-xs text-muted-foreground">{totalCapacity > 0 ? (hostelStudentCount / totalCapacity * 100).toFixed(0) : 0}% occupancy rate</p>
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
          <CardTitle>Bed Occupancy by Floor</CardTitle>
          <CardDescription>A breakdown of bed status across different floors.</CardDescription>
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
