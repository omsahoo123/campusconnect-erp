
import { type Student } from './data';

export const feeCollectionData = [
  { month: "Jan", collected: 400000, pending: 240000 },
  { month: "Feb", collected: 300000, pending: 139800 },
  { month: "Mar", collected: 500000, pending: 980000 },
  { month: "Apr", collected: 278000, pending: 390800 },
  { month: "May", collected: 189000, pending: 480000 },
  { month: "Jun", collected: 239000, pending: 380000 },
  { month: "Jul", collected: 349000, pending: 430000 },
];

export const defaultTransactions = [
    { id: 'TRN001', type: 'income' as const, description: 'Tuition Fee - Om Sahoo', amount: 250000, date: new Date().toISOString() },
    { id: 'TRN002', type: 'expense' as const, description: 'Electricity Bill', amount: 30000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'TRN003', type: 'expense' as const, description: 'Stationery Purchase', amount: 15000, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'TRN004', type: 'income' as const, description: 'Tuition Fee - Pramila', amount: 500000, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

export type Payment = {
    id: string;
    type: 'Tuition' | 'Hostel';
    amount: number;
    date: string; // ISO string
};

export type StudentFeeStatus = {
    studentId: string;
    totalTuition: number;
    totalHostelFee: number;
    payments: Payment[];
};

export type AllStudentFees = {
    [studentId: string]: StudentFeeStatus;
};

// Default data for demonstration. The app will use localStorage.
export const defaultStudentFees: AllStudentFees = {
    "STU001": {
        studentId: "STU001",
        totalTuition: 500000,
        totalHostelFee: 150000,
        payments: [
            { id: `PAY${Date.now()}`, type: 'Tuition', amount: 250000, date: new Date().toISOString() }
        ]
    },
    "STU002": {
        studentId: "STU002",
        totalTuition: 500000,
        totalHostelFee: 150000,
        payments: []
    }
};
