
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { type AllStudentFees, type Payment, defaultStudentFees } from '@/lib/finance';
import { ArrowLeft, CreditCard, Landmark, CircleDot, Loader2 } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

function PaymentGateway() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const studentId = searchParams.get('studentId');
    const amountStr = searchParams.get('amount');
    const type = searchParams.get('type') as 'Tuition' | 'Hostel' | null;

    const [amount, setAmount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (amountStr) {
            setAmount(parseFloat(amountStr));
        }
        if (!studentId || !amountStr || !type) {
             toast({ variant: 'destructive', title: 'Invalid Payment Request' });
             router.push('/dashboard/finance');
        }
    }, [amountStr, studentId, type, router, toast]);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing delay
        setTimeout(() => {
            if (studentId && amount && type) {
                const newPayment: Payment = {
                    id: `PAY${Date.now()}`,
                    type: type,
                    amount: amount,
                    date: new Date().toISOString(),
                };

                const storedFees = localStorage.getItem('studentFees');
                const allFees: AllStudentFees = storedFees ? JSON.parse(storedFees) : defaultStudentFees;

                if (allFees[studentId]) {
                    allFees[studentId].payments.push(newPayment);
                    localStorage.setItem('studentFees', JSON.stringify(allFees));
                    window.dispatchEvent(new Event('storage'));
                    
                    toast({ title: "Payment Successful", description: `${formatCurrency(amount)} has been paid towards ${type} fees.` });
                    router.push('/dashboard/finance');
                } else {
                     toast({ variant: 'destructive', title: 'Payment Failed', description: 'Student fee record not found.' });
                }
            }
            setIsProcessing(false);
        }, 2000);
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/finance">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Fees
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Complete Your Payment</CardTitle>
                    <CardDescription>You are paying {formatCurrency(amount)} for {type} fees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4" /> Card</TabsTrigger>
                            <TabsTrigger value="netbanking"><Landmark className="mr-2 h-4 w-4" /> Net Banking</TabsTrigger>
                            <TabsTrigger value="upi"><CircleDot className="mr-2 h-4 w-4" /> UPI</TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="pt-6">
                           <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input id="card-number" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry</Label>
                                        <Input id="expiry" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input id="cvv" placeholder="123" />
                                    </div>
                                    <div className="space-y-2 col-span-3">
                                        <Label htmlFor="card-name">Name on Card</Label>
                                        <Input id="card-name" placeholder="John Doe" />
                                    </div>
                                </div>
                           </div>
                        </TabsContent>
                        <TabsContent value="netbanking" className="pt-6">
                            <div className="space-y-4">
                               <p className="text-sm text-muted-foreground">Select your bank from a list (demo).</p>
                               <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline">HDFC Bank</Button>
                                    <Button variant="outline">ICICI Bank</Button>
                                    <Button variant="outline">State Bank of India</Button>
                                    <Button variant="outline">Axis Bank</Button>
                                    <Button variant="outline">Kotak Mahindra</Button>
                                    <Button variant="outline">More...</Button>
                               </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="upi" className="pt-6">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="upi-id">UPI ID</Label>
                                    <Input id="upi-id" placeholder="yourname@bank" />
                                </div>
                                <p className="text-center text-sm text-muted-foreground">OR</p>
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white border rounded-md">
                                        <p className="text-center font-mono text-sm">[Scan QR Code]</p>
                                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                                            <p className="text-xs">QR</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter>
                     <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                            `Pay ${formatCurrency(amount)}`
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function PayFeePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentGateway />
        </Suspense>
    )
}
