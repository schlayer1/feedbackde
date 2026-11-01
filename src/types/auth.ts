// src/types/auth.ts - Standard nach school-student-auth der Heimbürgeschule Kahla

export type UserRole = 'student' | 'teacher' | null;

export type SchoolClass = '9a' | '9b' | '9c' | '10a' | '10b' | '10c' | string;

export interface StudentProfile {
  studentCode: string; // z.B. "LMUE"
  studentName: string; // z.B. "Lukas Müller"
  schoolClass: SchoolClass;
  createdAt: string;
}

export interface AuthContextType {
  role: UserRole;
  studentCode: string;
  studentName: string;
  schoolClass: SchoolClass;
  isLoading: boolean;
  loginAsStudent: (code: string) => Promise<boolean>;
  registerAndLoginStudent: (name: string, schoolClass: SchoolClass) => Promise<string>;
  loginAsTeacher: (passcode: string) => Promise<boolean>;
  logout: () => void;
  updateStudentClass: (newClass: SchoolClass) => void;
}
