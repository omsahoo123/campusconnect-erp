
"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { studentsData as defaultStudentsData } from "@/lib/data";
import { defaultStudentFees, type AllStudentFees, type StudentFeeStatus, type Payment } from "@/lib/finance";
import { type Student } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export function FeeManagement() {
    const { toast } = useToast();
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allFees, setAllFees] = useState<AllStudentFees>({});
    
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newPayment, setNewPayment] = useState<{ type: 'Tuition' | 'Hostel'; amount: string }>({ type: 'Tuition', amount: '' });

    const loadData = useCallback(() => {
        const storedStudents = localStorage.getItem('studentsData');
        setAllStudents(storedStudents ? JSON.parse(storedStudents) : defaultStudentsData);
        
        const storedFees = localStorage.getItem('studentFees');
        let fees: AllStudentFees = storedFees ? JSON.parse(storedFees) : defaultStudentFees;
        
        // Ensure every student has a fee record
        const students = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
        let feesUpdated = false;
        for (const student of students) {
            if (!fees[student.id]) {
                fees[student.id] = {
                    studentId: student.id,
                    totalTuition: 500000,
                    totalHostelFee: 150000,
                    payments: [],
                };
                feesUpdated = true;
            }
        }
        
        setAllFees(fees);
        if (feesUpdated) {
            localStorage.setItem('studentFees', JSON.stringify(fees));
        }

    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [loadData]);
    
    const updateAllFees = (updatedFees: AllStudentFees) => {
        setAllFees(updatedFees);
        localStorage.setItem('studentFees', JSON.stringify(updatedFees));
        window.dispatchEvent(new Event('storage'));
    }

    const studentFeeSummary = useMemo(() => {
        return allStudents.map(student => {
            const feeData = allFees[student.id] || { totalTuition: 500000, totalHostelFee: 150000, payments: [] };
            const totalPaid = feeData.payments.reduce((sum, p) => sum + p.amount, 0);
            const totalDue = feeData.totalTuition + feeData.totalHostelFee;
            const balance = totalDue - totalPaid;
            
            let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";
            if (balance <= 0) status = "Paid";
            else if (totalPaid > 0) status = "Partial";

            return {
                ...student,
                totalDue,
                totalPaid,
                balance,
                status
            }
        });
    }, [allStudents, allFees]);
    
    const selectedStudentFeeDetails = useMemo(() => {
        if (!selectedStudent) return null;
        return studentFeeSummary.find(s => s.id === selectedStudent.id);
    }, [selectedStudent, studentFeeSummary]);

    const handleOpenDialog = (studentId: string) => {
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
            setSelectedStudent(student);
            setIsDialogOpen(true);
        }
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedStudent(null);
        setNewPayment({ type: 'Tuition', amount: '' });
    }

    const handleRecordPayment = () => {
        if (!selectedStudent || !newPayment.amount || isNaN(parseFloat(newPayment.amount))) {
            toast({ variant: 'destructive', title: "Invalid Amount" });
            return;
        }
        
        const paymentAmount = parseFloat(newPayment.amount);
        const newPaymentRecord: Payment = {
            id: `PAY${Date.now()}`,
            type: newPayment.type,
            amount: paymentAmount,
            date: new Date().toISOString()
        };

        const updatedFees = { ...allFees };
        const studentFeeRecord = updatedFees[selectedStudent.id];
        studentFeeRecord.payments.push(newPaymentRecord);
        
        updateAllFees(updatedFees);

        toast({ title: "Payment Recorded", description: `${formatCurrency(paymentAmount)} recorded for ${selectedStudent.name}.` });
        setNewPayment({ type: 'Tuition', amount: '' });
    };

    const getStatusVariant = (status: "Paid" | "Partial" | "Unpaid") => {
        if (status === "Paid") return "default";
        if (status === "Partial") return "outline";
        return "destructive";
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fee Management</CardTitle>
                    <CardDescription>Manage and track student fee payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Total Due</TableHead>
                                <TableHead>Total Paid</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentFeeSummary.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{formatCurrency(student.totalDue)}</TableCell>
                                    <TableCell>{formatCurrency(student.totalPaid)}</TableCell>
                                    <TableCell className={student.balance > 0 ? "text-destructive font-medium" : ""}>
                                        {formatCurrency(student.balance)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(student.status)}>{student.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(student.id)}>
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md" onInteractOutside={(e) => handleCloseDialog()}>
                    {selectedStudentFeeDetails && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Manage Fees for {selectedStudentFeeDetails.name}</DialogTitle>
                                <DialogDescription>ID: {selectedStudentFeeDetails.id}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div><Label>Total Due</Label><p className="font-bold text-lg">{formatCurrency(selectedStudentFeeDetails.totalDue)}</p></div>
                                    <div><Label>Total Paid</Label><p className="font-bold text-lg text-green-600">{formatCurrency(selectedStudentFeeDetails.totalPaid)}</p></div>
                                    <div><Label>Balance</Label><p className="font-bold text-lg text-destructive">{formatCurrency(selectedStudentFeeDetails.balance)}</p></div>
                                </div>
                                
                                <Separator />

                                <div className="space-y-2">
                                    <Label>Record New Payment</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number"
                                            placeholder="Amount"
                                            value={newPayment.amount}
                                            onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                                        />
                                        <Select value={newPayment.type} onValueChange={value => setNewPayment({...newPayment, type: value as 'Tuition' | 'Hostel' })}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tuition">Tuition</SelectItem>
                                                <SelectItem value="Hostel">Hostel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleRecordPayment}>Record</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Payment History</Label>
                                    <ScrollArea className="h-40 rounded-md border">
                                        <div className="p-4 space-y-2">
                                            {allFees[selectedStudentFeeDetails.id]?.payments.length > 0 ? (
                                                allFees[selectedStudentFeeDetails.id].payments.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(payment => (
                                                <div key={payment.id} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-medium">{payment.type} Fee Payment</p>
                                                        <p className="text-xs text-muted-foreground">{format(parseISO(payment.date), "PPP")}</p>
                                                    </div>
                                                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                                                </div>
                                            ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center pt-10">No payment history.</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}
