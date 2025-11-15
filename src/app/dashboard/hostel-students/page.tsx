
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { defaultHostels, type Hostel } from "@/lib/hostel"
import { studentsData as defaultStudentsData, type Student } from "@/lib/data"
import { X } from "lucide-react"
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

type HostelStudentInfo = {
  studentId: string
  studentName: string
  hostelId: string
  hostelName: string
  roomId: string
}

export default function HostelStudentsPage() {
  const { toast } = useToast()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])

  const loadData = useCallback(() => {
    const storedHostels = localStorage.getItem('hostelsData')
    const storedStudents = localStorage.getItem('studentsData')
    
    let currentHostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : defaultHostels;

    // One-time data migration/check
    const isOmSahooAssigned = currentHostels.some(h => h.rooms.some(r => r.occupants.includes("STU001")));
    if (!isOmSahooAssigned) {
        const boysHostel = currentHostels.find(h => h.gender === 'Male');
        if (boysHostel) {
            const firstRoom = boysHostel.rooms[0];
            if (firstRoom && firstRoom.capacity > firstRoom.occupants.length) {
                firstRoom.occupants.push("STU001");
                localStorage.setItem('hostelsData', JSON.stringify(currentHostels));
            }
        }
    }
    
    setHostels(currentHostels)
    setAllStudents(storedStudents ? JSON.parse(storedStudents) : defaultStudentsData)
  }, [])

  useEffect(() => {
    loadData()
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'hostelsData' || event.key === 'studentsData') {
        loadData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadData])

  const residentStudents = useMemo<HostelStudentInfo[]>(() => {
    const residents: HostelStudentInfo[] = []
    hostels.forEach(hostel => {
      hostel.rooms.forEach(room => {
        room.occupants.forEach(studentId => {
          const student = allStudents.find(s => s.id === studentId)
          if (student) {
            residents.push({
              studentId: student.id,
              studentName: student.name,
              hostelId: hostel.id,
              hostelName: hostel.name,
              roomId: room.id,
            })
          }
        })
      })
    })
    return residents.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [hostels, allStudents])

  const handleRemoveStudent = (resident: HostelStudentInfo) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === resident.hostelId) {
        return {
          ...h,
          rooms: h.rooms.map(r => {
            if (r.id === resident.roomId) {
              return { ...r, occupants: r.occupants.filter(id => id !== resident.studentId) }
            }
            return r
          })
        }
      }
      return h
    })
    setHostels(updatedHostels)
    localStorage.setItem('hostelsData', JSON.stringify(updatedHostels))
    window.dispatchEvent(new Event('storage'))
    toast({ variant: "destructive", title: "Student Removed", description: `${resident.studentName} has been unassigned from room ${resident.roomId}.` })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hostel Residents</CardTitle>
          <CardDescription>A list of all students currently residing in hostels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room No.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentStudents.length > 0 ? (
                residentStudents.map((resident) => (
                  <TableRow key={resident.studentId}>
                    <TableCell className="font-medium">{resident.studentName}</TableCell>
                    <TableCell>{resident.studentId}</TableCell>
                    <TableCell>{resident.hostelName}</TableCell>
                    <TableCell>{resident.roomId}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4 text-destructive" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will unassign {resident.studentName} from their room. You can re-assign them later.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveStudent(resident)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No students are currently assigned to any hostel room.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
