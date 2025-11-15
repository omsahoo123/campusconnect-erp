
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
      { id: 'A-101', floor: 1, capacity: 2, occupants: [] },
      { id: 'A-102', floor: 1, capacity: 2, occupants: [] },
      { id: 'B-201', floor: 2, capacity: 2, occupants: [] },
    ]
  },
  {
    id: "H02",
    name: "St. Teresa Hostel",
    gender: "Female",
    rooms: [
      { id: 'A-101', floor: 1, capacity: 2, occupants: [] },
      { id: 'A-102', floor: 1, capacity: 2, occupants: [] },
      { id: 'B-201', floor: 2, capacity: 2, occupants: [] },
    ]
  }
];


// This is now derived from defaultRooms occupants
export const defaultHostelStudents: string[] = [];

// This will now be calculated from the rooms data, but we can keep it for other components if needed.
export const defaultRoomStatusData = [
  { floor: "Floor 1", occupied: 0, total: 6 }, // Based on 3 rooms of 2 capacity
  { floor: "Floor 2", occupied: 0, total: 4 }, // Based on 2 rooms of 2 capacity
  { floor: "Floor 3", occupied: 0, total: 3 }, // Based on 1 room of 3 capacity
];

export const defaultMessData = {
    status: "Active",
    nextMeal: "Lunch",
};
