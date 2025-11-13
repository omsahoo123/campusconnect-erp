import { useState, useEffect } from 'react';

export type UserRole = "admin" | "teacher" | "student" | "finance";

const isBrowser = typeof window !== "undefined";

export function useCurrentUser() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = () => {
      try {
        const storedRole = localStorage.getItem("userRole") as UserRole | null;
        setRole(storedRole);
      } catch (error) {
        console.error("Failed to access localStorage:", error);
        setRole(null);
      }
    };
    
    handleStorageChange(); // Initial load
    setIsLoaded(true);

    window.addEventListener('storage', handleStorageChange);

    // This is a custom event that can be dispatched from the login form
    const handleRoleChange = () => handleStorageChange();
    window.addEventListener('roleChanged', handleRoleChange);


    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  return { role, isLoaded };
}
