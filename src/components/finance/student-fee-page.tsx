
"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { studentsData, userProfiles } from "@/lib/data";
import { type AllStudentFees, type StudentFeeStatus, type Payment, defaultStudentFees } from "@/lib/finance";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "../ui/separator";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export function StudentFeePage() {
    const { toast } = useToast();
    const { role } = useCurrentUser();
    const [feeStatus, setFeeStatus] = useState<StudentFeeStatus | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);

    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentType, setPaymentType] = useState<'Tuition' | 'Hostel'>("Tuition");

    const loadData = useCallback(() => {
        if (role === 'student') {
            const studentProfile = studentsData.find(s => s.email === userProfiles.student.email);
            if (studentProfile) {
                setStudentId(studentProfile.id);
                const storedFees = localStorage.getItem('studentFees');
                const allFees: AllStudentFees = storedFees ? JSON.parse(storedFees) : defaultStudentFees;
                setFeeStatus(allFees[studentProfile.id] || null);
            }
        }
    }, [role]);

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [loadData]);
    
    const feeDetails = useMemo(() => {
        if (!feeStatus) return { totalDue: 0, totalPaid: 0, balance: 0, tuitionBalance: 0, hostelBalance: 0 };
        
        const totalPaid = feeStatus.payments.reduce((sum, p) => sum + p.amount, 0);
        const tuitionPaid = feeStatus.payments.filter(p => p.type === 'Tuition').reduce((sum, p) => sum + p.amount, 0);
        const hostelPaid = feeStatus.payments.filter(p => p.type === 'Hostel').reduce((sum, p) => sum + p.amount, 0);
        
        const totalDue = feeStatus.totalTuition + feeStatus.totalHostelFee;
        const balance = totalDue - totalPaid;
        const tuitionBalance = feeStatus.totalTuition - tuitionPaid;
        const hostelBalance = feeStatus.totalHostelFee - hostelPaid;
        
        return { totalDue, totalPaid, balance, tuitionBalance, hostelBalance };
    }, [feeStatus]);
    
    const handleMakePayment = () => {
        if (!studentId || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid payment amount." });
            return;
        }

        const amount = parseFloat(paymentAmount);

        // A simple validation to prevent overpayment
        if (paymentType === 'Tuition' && amount > feeDetails.tuitionBalance) {
             toast({ variant: "destructive", title: "Amount Exceeds Balance", description: `Payment cannot exceed the pending tuition fee of ${formatCurrency(feeDetails.tuitionBalance)}.` });
            return;
        }
        if (paymentType === 'Hostel' && amount > feeDetails.hostelBalance) {
             toast({ variant: "destructive", title: "Amount Exceeds Balance", description: `Payment cannot exceed the pending hostel fee of ${formatCurrency(feeDetails.hostelBalance)}.` });
            return;
        }

        const newPayment: Payment = {
            id: `PAY${Date.now()}`,
            type: paymentType,
            amount: amount,
            date: new Date().toISOString(),
        };

        const storedFees = localStorage.getItem('studentFees');
        const allFees: AllStudentFees = storedFees ? JSON.parse(storedFees) : defaultStudentFees;
        
        if (allFees[studentId]) {
            allFees[studentId].payments.push(newPayment);
            localStorage.setItem('studentFees', JSON.stringify(allFees));
            window.dispatchEvent(new Event('storage'));
            
            toast({ title: "Payment Successful", description: `${formatCurrency(amount)} has been paid towards ${paymentType} fees.` });
            setIsPayDialogOpen(false);
            setPaymentAmount("");
        }
    }


    if (!feeStatus) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fee Details Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your fee information could not be loaded. Please contact administration.</p>
                </CardContent>
            </Card>
        );
    }
    

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Fee Status</h1>
                <p className="text-muted-foreground">Review your fee summary, payment history, and make new payments.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Fee Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                        <Label className="text-muted-foreground">Total Payable</Label>
                        <p className="text-2xl font-bold">{formatCurrency(feeDetails.totalDue)}</p>
                    </div>
                     <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                        <Label className="text-muted-foreground">Total Paid</Label>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(feeDetails.totalPaid)}</p>
                    </div>
                     <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                        <Label className="text-muted-foreground">Outstanding Balance</Label>
                        <p className={`text-2xl font-bold ${feeDetails.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(feeDetails.balance)}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                     <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={feeDetails.balance <= 0}>Pay Now</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Make a Payment</DialogTitle>
                                <DialogDescription>Your outstanding balance is {formatCurrency(feeDetails.balance)}.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <p>Pending Tuition: <span className="font-medium">{formatCurrency(feeDetails.tuitionBalance)}</span></p>
                                    <p>Pending Hostel: <span className="font-medium">{formatCurrency(feeDetails.hostelBalance)}</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="payment-type">Fee Type</Label>
                                         <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'Tuition' | 'Hostel')}>
                                            <SelectTrigger id="payment-type">
                                                <SelectValue placeholder="Select fee type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tuition" disabled={feeDetails.tuitionBalance <= 0}>Tuition</SelectItem>
                                                <SelectItem value="Hostel" disabled={feeDetails.hostelBalance <= 0}>Hostel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount to pay"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleMakePayment}>Proceed to Pay</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                                    <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                                    <th className="p-4 text-left font-medium text-muted-foreground">Transaction ID</th>
                                    <th className="p-4 text-right font-medium text-muted-foreground">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeStatus.payments.length > 0 ? (
                                    feeStatus.payments.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(payment => (
                                        <tr key={payment.id} className="border-b">
                                            <td className="p-4">{format(parseISO(payment.date), "dd MMM, yyyy")}</td>
                                            <td className="p-4"><Badge variant="secondary">{payment.type}</Badge></td>
                                            <td className="p-4 font-mono text-xs">{payment.id}</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(payment.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="h-24 text-center text-muted-foreground">No payments made yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
