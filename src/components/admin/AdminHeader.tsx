
import React from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onSignOut: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut }) => {
  return (
    <header className="bg-white border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hotel Admin Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
