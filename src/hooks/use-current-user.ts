
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { userProfiles } from '@/lib/data';

export type UserRole = "admin" | "teacher" | "student" | "finance";

const isBrowser = typeof window !== "undefined";

export function useCurrentUser() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  useEffect(() => {
    if (isUserLoading || isAdminRoleLoading) {
        setIsLoaded(false);
        return;
    }

    if (!user) {
        setRole(null);
        setIsLoaded(true);
        return;
    }

    if (adminRoleDoc) {
        setRole('admin');
        setIsLoaded(true);
        return;
    }

    // Fallback for non-admin roles based on email
    const userEmail = user.email;
    if (userEmail) {
        if (userEmail === userProfiles.teacher.email) {
            setRole('teacher');
        } else if (userEmail === userProfiles.student.email) {
            setRole('student');
        } else if (userEmail === userProfiles.finance.email) {
            setRole('finance');
        } else {
            setRole(null); // No matching role
        }
    } else {
        setRole(null);
    }
    
    setIsLoaded(true);

  }, [user, isUserLoading, adminRoleDoc, isAdminRoleLoading]);


  return { role, isLoaded };
}
