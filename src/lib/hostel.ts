
export type Room = {
  id: string;
  floor: number;
  capacity: number;
  occupants: string[]; // student IDs
};

export type Hostel = {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  rooms: Room[];
}

// Simplified default rooms for demonstration
export const defaultHostels: Hostel[] = [
  {
    id: "H01",
    name: "St. Patrick Hostel",
    gender: "Male",
    rooms: [
      { id: 'A-101', floor: 1, capacity: 2, occupants: ["STU001"] },
      { id: 'A-102', floor: 1, capacity: 2, occupants: [] },
      { id: 'B-201', floor: 2, capacity: 2, occupants: [] },
    ]
  },
  {
    id: "H02",
    name: "St. Teresa Hostel",
    gender: "Female",
    rooms: [
      { id: 'A-101', floor: 1, capacity: 2, occupants: ["STU002"] },
      { id: 'A-102', floor: 1, capacity: 2, occupants: [] },
      { id: 'B-201', floor: 2, capacity: 2, occupants: [] },
    ]
  }
];

export const defaultMessData = {
    status: "Active",
    nextMeal: "Lunch",
};
