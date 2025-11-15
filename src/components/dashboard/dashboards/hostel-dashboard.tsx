
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Bed, Utensils, PersonStanding } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { defaultHostels, defaultMessData, type Hostel } from "@/lib/hostel";
import { useToast } from "@/hooks/use-toast";

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


  const { boysHostelStats, girlsHostelStats } = useMemo(() => {
    const calculateStats = (gender: 'Male' | 'Female') => {
        const genderHostels = hostels.filter(h => h.gender === gender);
        const allRooms = genderHostels.flatMap(h => h.rooms);
        const totalCapacity = allRooms.reduce((acc, room) => acc + room.capacity, 0);
        const occupiedCount = allRooms.reduce((acc, room) => acc + room.occupants.length, 0);
        const studentIds = new Set(allRooms.flatMap(room => room.occupants));

        return {
            totalRooms: allRooms.length,
            totalCapacity: totalCapacity,
            studentCount: studentIds.size,
            occupancyRate: totalCapacity > 0 ? Math.round((studentIds.size / totalCapacity) * 100) : 0,
        };
    }

    return { 
        boysHostelStats: calculateStats('Male'),
        girlsHostelStats: calculateStats('Female'),
    };
  }, [hostels]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Hostel Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Boys' Hostels</CardTitle>
                <CardDescription>Occupancy and capacity overview.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4">
                    <Home className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Capacity</p>
                        <p className="text-2xl font-bold">{boysHostelStats.totalCapacity}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Bed className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Occupancy</p>
                        <p className="text-2xl font-bold">{boysHostelStats.occupancyRate}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Students</p>
                        <p className="text-2xl font-bold">{boysHostelStats.studentCount}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Girls' Hostels</CardTitle>
                <CardDescription>Occupancy and capacity overview.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                 <div className="flex items-center gap-4">
                    <Home className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Capacity</p>
                        <p className="text-2xl font-bold">{girlsHostelStats.totalCapacity}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Bed className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Occupancy</p>
                        <p className="text-2xl font-bold">{girlsHostelStats.occupancyRate}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Students</p>
                        <p className="text-2xl font-bold">{girlsHostelStats.studentCount}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mess Management</CardTitle>
                <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{messData.status}</div>
                <p className="text-sm text-muted-foreground">Next meal: {messData.nextMeal}</p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
