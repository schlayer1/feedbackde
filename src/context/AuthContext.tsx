// src/context/AuthContext.tsx - AuthContext gemäß Heimbürgeschule-Standard
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, UserRole, SchoolClass, StudentProfile } from '../types/auth';
import { generateStudentCode, normalizeCode, MASTER_TEACHER_PASSWORDS } from '../services/schoolStudentAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'fbs_auth_role',
  CODE: 'fbs_auth_student_code',
  NAME: 'fbs_auth_student_name',
  CLASS: 'fbs_auth_school_class',
  PROFILES: 'fbs_known_student_profiles',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [studentCode, setStudentCode] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [schoolClass, setSchoolClass] = useState<SchoolClass>('9a');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialisiere Auth aus localStorage
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
      const savedCode = localStorage.getItem(STORAGE_KEYS.CODE) || '';
      const savedName = localStorage.getItem(STORAGE_KEYS.NAME) || '';
      const savedClass = localStorage.getItem(STORAGE_KEYS.CLASS) || '9a';

      if (savedRole === 'student' && savedCode) {
        setRole('student');
        setStudentCode(savedCode);
        setStudentName(savedName);
        setSchoolClass(savedClass);
      } else if (savedRole === 'teacher') {
        setRole('teacher');
      }
    } catch (e) {
      console.warn('Fehler beim Laden des Auth-Zustands:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getKnownProfiles = (): Record<string, StudentProfile> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveProfile = (profile: StudentProfile) => {
    try {
      const profiles = getKnownProfiles();
      profiles[profile.studentCode] = profile;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Profil konnte nicht gespeichert werden:', e);
    }
  };

  const loginAsStudent = async (code: string): Promise<boolean> => {
    const cleanCode = normalizeCode(code);
    if (!cleanCode) return false;

    const profiles = getKnownProfiles();
    const existing = profiles[cleanCode];

    const finalName = existing ? existing.studentName : `Schüler ${cleanCode}`;
    const finalClass = existing ? existing.schoolClass : (cleanCode.startsWith('10') ? '10a' : '9a');

    setRole('student');
    setStudentCode(cleanCode);
    setStudentName(finalName);
    setSchoolClass(finalClass);

    localStorage.setItem(STORAGE_KEYS.ROLE, 'student');
    localStorage.setItem(STORAGE_KEYS.CODE, cleanCode);
    localStorage.setItem(STORAGE_KEYS.NAME, finalName);
    localStorage.setItem(STORAGE_KEYS.CLASS, finalClass);

    if (!existing) {
      saveProfile({
        studentCode: cleanCode,
        studentName: finalName,
        schoolClass: finalClass,
        createdAt: new Date().toISOString()
      });
    }

    return true;
  };

  const registerAndLoginStudent = async (name: string, chosenClass: SchoolClass): Promise<string> => {
    const generated = generateStudentCode(name);
    if (!generated) throw new Error('Bitte gib einen gültigen Namen ein.');

    const cleanName = name.trim();
    setRole('student');
    setStudentCode(generated);
    setStudentName(cleanName);
    setSchoolClass(chosenClass);

    localStorage.setItem(STORAGE_KEYS.ROLE, 'student');
    localStorage.setItem(STORAGE_KEYS.CODE, generated);
    localStorage.setItem(STORAGE_KEYS.NAME, cleanName);
    localStorage.setItem(STORAGE_KEYS.CLASS, chosenClass);

    saveProfile({
      studentCode: generated,
      studentName: cleanName,
      schoolClass: chosenClass,
      createdAt: new Date().toISOString()
    });

    return generated;
  };

  const loginAsTeacher = async (passcode: string): Promise<boolean> => {
    const cleanPass = passcode.trim().toLowerCase();
    if (MASTER_TEACHER_PASSWORDS.includes(cleanPass)) {
      setRole('teacher');
      localStorage.setItem(STORAGE_KEYS.ROLE, 'teacher');
      return true;
    }
    return false;
  };

  const updateStudentClass = (newClass: SchoolClass) => {
    setSchoolClass(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASS, newClass);
    if (studentCode) {
      const profiles = getKnownProfiles();
      if (profiles[studentCode]) {
        profiles[studentCode].schoolClass = newClass;
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      }
    }
  };

  const logout = () => {
    setRole(null);
    setStudentCode('');
    setStudentName('');
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.CODE);
    localStorage.removeItem(STORAGE_KEYS.NAME);
    localStorage.removeItem(STORAGE_KEYS.CLASS);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        studentCode,
        studentName,
        schoolClass,
        isLoading,
        loginAsStudent,
        registerAndLoginStudent,
        loginAsTeacher,
        logout,
        updateStudentClass
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return context;
};
