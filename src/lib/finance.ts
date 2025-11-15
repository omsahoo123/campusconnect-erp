
export const feeCollectionData = [
  { month: "Jan", collected: 4000, pending: 2400 },
  { month: "Feb", collected: 3000, pending: 1398 },
  { month: "Mar", collected: 5000, pending: 9800 },
  { month: "Apr", collected: 2780, pending: 3908 },
  { month: "May", collected: 1890, pending: 4800 },
  { month: "Jun", collected: 2390, pending: 3800 },
  { month: "Jul", collected: 3490, pending: 4300 },
];

export const transactions = [
    { id: "TRN001", type: "income" as const, description: "Tuition Fee from STU001", amount: 1500, date: "2024-07-20T10:00:00Z" },
    { id: "TRN002", type: "expense" as const, description: "Stationery Supplies", amount: 45.50, date: "2024-07-20T02:00:00Z" },
    { id: "TRN003", type: "income" as const, description: "Hostel Fee from STU002", amount: 800, date: "2024-07-19T14:00:00Z" },
    { id: "TRN004", type: "expense" as const, description: "Internet Bill", amount: 250, date: "2024-07-18T11:00:00Z" },
];

export const studentFees = {
    "STU001": { total: 1500, paid: 1500, due: 0 },
    "STU002": { total: 1500, paid: 700, due: 800 },
    "STU003": { total: 1500, paid: 0, due: 1500 },
};
