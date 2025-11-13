
'use client';

import { useState, useEffect } from 'react';

export type UserRole = "admin" | "teacher" | "student" | "finance";

const isBrowser = typeof window !== "undefined";

export function useCurrentUser() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (isBrowser) {
      const storedRole = localStorage.getItem("userRole") as UserRole;
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (isLoggedIn && storedRole) {
        setRole(storedRole);
      } else {
        setRole(null);
      }
      setIsLoaded(true);
    }
  }, []);

  return { role, isLoaded };
}
