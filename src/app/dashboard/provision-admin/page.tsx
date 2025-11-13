
'use client';

import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

export default function ProvisionAdminPage() {
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // 'loading', 'prompt', 'provisioning', 'success', 'error'
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        setStatus('prompt');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  const handleProvision = async () => {
    if (!user) {
      setError('You must be logged in to perform this action.');
      setStatus('error');
      return;
    }
    
    setStatus('provisioning');
    
    try {
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      await setDoc(adminRoleRef, {
        firstName: "Admin",
        lastName: "User",
        email: user.email,
        id: user.uid,
      });
      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <div className="flex justify-center items-center"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
      case 'prompt':
        return (
          <>
            <CardDescription>
              Click the button below to grant your current user ({user?.email}) administrative privileges. This will create the necessary role document in Firestore.
            </CardDescription>
            <div className="flex justify-center pt-4">
              <Button onClick={handleProvision}>Grant Admin Role</Button>
            </div>
          </>
        );
      case 'provisioning':
        return (
          <div className="flex items-center justify-center gap-2">
            <Icons.spinner className="h-5 w-5 animate-spin" />
            <p>Provisioning admin role...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <p className="text-green-600 font-medium">Admin role successfully granted!</p>
            <p className="text-sm text-muted-foreground mt-2">You can now access all admin features.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
          </div>
        );
      case 'error':
         return (
          <div className="text-center">
            <p className="text-destructive font-medium">Failed to grant admin role.</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={handleProvision} variant="outline" className="mt-4">Try Again</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start pt-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Provision Admin Role</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
