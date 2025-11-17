
export type StudentApplication = {
  id: string;
  name: string;
  grade: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  status: 'Pending';
  email: string;
  phone: string;
}

export type TeacherApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  coverLetter: string;
  status: 'Pending';
}
