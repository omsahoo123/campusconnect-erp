
export type StudentGrade = {
  course: string;
  grade: string;
  attendance: number;
};

export type StudentGradesData = {
  [studentId: string]: StudentGrade[];
};

export const studentGradesData: StudentGradesData = {
  // Grades for Alex Johnson (student@campus.edu)
  "STU009": [
    { course: "Calculus I", grade: "B+", attendance: 90 },
    { course: "Linear Algebra", grade: "A-", attendance: 95 },
    { course: "Advanced Statistics", grade: "C+", attendance: 85 },
  ],
  "STU001": [
    { course: "Calculus I", grade: "A+", attendance: 95 },
    { course: "Advanced Statistics", grade: "A", attendance: 98 },
  ],
  "STU002": [
    { course: "Calculus I", grade: "A", attendance: 88 },
    { course: "Linear Algebra", grade: "B", attendance: 91 },
  ],
  "STU003": [
    { course: "Calculus I", grade: "C", attendance: 74 },
    { course: "Advanced Statistics", grade: "C-", attendance: 80 },
  ],
  "STU004": [
    { course: "Calculus I", grade: "A+", attendance: 98 },
    { course: "Linear Algebra", grade: "A+", attendance: 100 },
  ],
   "STU005": [
    { course: "Calculus I", grade: "A-", attendance: 91 },
  ],
   "STU006": [
    { course: "Calculus I", grade: "B", attendance: 85 },
  ],
    "STU007": [
    { course: "Calculus I", grade: "D+", attendance: 92 },
  ],
    "STU008": [
    { course: "Calculus I", grade: "C-", attendance: 78 },
  ],
};
