
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Bed, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { useState, useEffect, useMemo, useCallback } from "react";
import { defaultHostels, defaultMessData, type Hostel } from "@/lib/hostel";
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

type MessData = {
    status: string;
    nextMeal: string;
}

export function HostelDashboard() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [messData, setMessData] = useState<MessData>({ status: 'Inactive', nextMeal: 'N/A' });
  const { toast } = useToast();

  const loadData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedHostels = localStorage.getItem('hostelsData');
        setHostels(storedHostels ? JSON.parse(storedHostels) : defaultHostels);
        
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
    if (!localStorage.getItem('hostelsData')) {
        localStorage.setItem('hostelsData', JSON.stringify(defaultHostels));
    }
    if (!localStorage.getItem('hostelMessData')) {
        localStorage.setItem('hostelMessData', JSON.stringify(defaultMessData));
    }


    const handleStorageChange = (event: StorageEvent) => {
      if (['hostelsData', 'hostelMessData'].includes(event.key || '')) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);


  const { totalRooms, occupiedRooms, totalCapacity, hostelStudentCount } = useMemo(() => {
    const allRooms = hostels.flatMap(h => h.rooms);
    const totalCap = allRooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupiedCount = allRooms.reduce((acc, room) => acc + room.occupants.length, 0);
    
    // Get unique student IDs from all rooms across all hostels
    const studentIds = new Set(allRooms.flatMap(room => room.occupants));

    return { 
        totalRooms: allRooms.length,
        occupiedRooms: allRooms.filter(r => r.occupants.length > 0).length,
        totalCapacity: totalCap,
        hostelStudentCount: studentIds.size,
    };
  }, [hostels]);

  const chartData = useMemo(() => {
    const allRooms = hostels.flatMap(h => h.rooms);
    const floors = [...new Set(allRooms.map(r => r.floor))].sort((a, b) => a - b);
    return floors.map(floorNum => {
        const roomsOnFloor = allRooms.filter(r => r.floor === floorNum);
        const occupiedCount = roomsOnFloor.reduce((acc, room) => acc + room.occupants.length, 0);
        const totalCapacityOnFloor = roomsOnFloor.reduce((acc, room) => acc + room.capacity, 0);
        return {
            floor: `Floor ${floorNum}`,
            occupied: occupiedCount,
            available: totalCapacityOnFloor - occupiedCount,
        }
    });
  }, [hostels]);

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
