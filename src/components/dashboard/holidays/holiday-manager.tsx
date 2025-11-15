
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { holidays as defaultHolidays } from "@/lib/data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Holiday = {
    date: string;
    name: string;
};

export function HolidayManager() {
    const { toast } = useToast();
    const { role } = useCurrentUser();
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [newHolidayName, setNewHolidayName] = useState("");
    const [newHolidayDate, setNewHolidayDate] = useState("");
    
    const loadHolidays = useCallback(() => {
        const storedHolidays = localStorage.getItem('holidays');
        setHolidays(storedHolidays ? JSON.parse(storedHolidays) : defaultHolidays);
    }, []);

    useEffect(() => {
        loadHolidays();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'holidays') {
                loadHolidays();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadHolidays]);

    const handleAddHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHolidayName || !newHolidayDate) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please provide both a name and a date." });
            return;
        }

        const newHoliday = { date: newHolidayDate, name: newHolidayName };
        const updatedHolidays = [...holidays, newHoliday].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setHolidays(updatedHolidays);
        localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
        window.dispatchEvent(new Event('storage'));


        setNewHolidayName("");
        setNewHolidayDate("");
        toast({ title: "Holiday Added", description: `${newHolidayName} has been added to the calendar.` });
    };

    const handleDeleteHoliday = (date: string) => {
        const updatedHolidays = holidays.filter(holiday => holiday.date !== date);
        
        setHolidays(updatedHolidays);
        localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
        window.dispatchEvent(new Event('storage'));

        toast({ variant: "destructive", title: "Holiday Removed", description: "The holiday has been removed." });
    };
    
    if (role !== 'admin') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Permission Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Holiday</CardTitle>
                    <CardDescription>Add a new holiday to the academic calendar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddHoliday} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="holiday-name">Holiday Name</Label>
                            <Input
                                id="holiday-name"
                                value={newHolidayName}
                                onChange={(e) => setNewHolidayName(e.target.value)}
                                placeholder="e.g., Summer Break"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="holiday-date">Date</Label>
                            <Input
                                id="holiday-date"
                                type="date"
                                value={newHolidayDate}
                                onChange={(e) => setNewHolidayDate(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Add Holiday</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Holiday List</CardTitle>
                    <CardDescription>Current list of all official holidays.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holidays.length > 0 ? (
                                    holidays.map((holiday) => (
                                        <TableRow key={holiday.date}>
                                            <TableCell>{new Date(holiday.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })}</TableCell>
                                            <TableCell className="font-medium">{holiday.name}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the holiday.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteHoliday(holiday.date)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No holidays have been added.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
