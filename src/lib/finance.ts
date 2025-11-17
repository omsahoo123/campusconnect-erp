
import { type Student } from './data';

export const feeCollectionData = [
  { month: "Jan", collected: 4000, pending: 2400 },
  { month: "Feb", collected: 3000, pending: 1398 },
  { month: "Mar", collected: 5000, pending: 9800 },
  { month: "Apr", collected: 2780, pending: 3908 },
  { month: "May", collected: 1890, pending: 4800 },
  { month: "Jun", collected: 2390, pending: 3800 },
  { month: "Jul", collected: 3490, pending: 4300 },
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
        totalTuition: 5000,
        totalHostelFee: 2000,
        payments: [
            { id: `PAY${Date.now()}`, type: 'Tuition', amount: 2500, date: new Date().toISOString() }
        ]
    },
    "STU002": {
        studentId: "STU002",
        totalTuition: 5000,
        totalHostelFee: 2000,
        payments: [
            { id: `PAY${Date.now()+1}`, type: 'Tuition', amount: 5000, date: new Date().toISOString() },
            { id: `PAY${Date.now()+2}`, type: 'Hostel', amount: 2000, date: new Date().toISOString() }
        ]
    }
};
