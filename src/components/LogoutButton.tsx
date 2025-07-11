import React from 'react';
import { Button } from '@/components/ui/button';
import { useGmail } from '@/context/GmailContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

export const LogoutButton = () => {
  const { disconnectGmail } = useGmail();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Disconnect Gmail first
      await disconnectGmail();
      
      // Then logout from the app
      logout();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="border-red-500/30 text-red-300 hover:bg-red-500/20"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
};