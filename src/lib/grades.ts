
export type StudentGrade = {
  course: string;
  grade: string;
  attendance: number;
};

export type StudentGradesData = {
  [studentId: string]: StudentGrade[];
};

// This data is now just the default. The app will use localStorage.
export const studentGradesData: StudentGradesData = {
  // Grades for Om Sahoo (osahoo9178@gmail.com)
  "STU001": [
    { course: "Calculus I", grade: "N/A", attendance: 100 },
    { course: "Linear Algebra", grade: "N/A", attendance: 100 },
    { course: "Advanced Statistics", grade: "N/A", attendance: 100 },
  ]
};
