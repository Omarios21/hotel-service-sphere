
import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Bell, 
  Briefcase, 
  Leaf, 
  CreditCard, 
  History,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate, activeSection }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const sidebarItems: SidebarItem[] = [
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: CreditCard, 
      color: 'bg-blue-500'
    },
    { 
      id: 'clearing-history', 
      label: 'Clearing History', 
      icon: History, 
      color: 'bg-purple-500'
    },
    { 
      id: 'menu-items', 
      label: 'Menu Items', 
      icon: ShoppingBag, 
      color: 'bg-orange-500'
    },
    { 
      id: 'spa-services', 
      label: 'Spa Services', 
      icon: Leaf, 
      color: 'bg-green-500'
    },
    { 
      id: 'activities', 
      label: 'Activities', 
      icon: Briefcase, 
      color: 'bg-amber-500'
    },
    { 
      id: 'spa-calendar', 
      label: 'Spa Calendar', 
      icon: Calendar, 
      color: 'bg-indigo-500'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      color: 'bg-red-500'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users, 
      color: 'bg-teal-500'
    },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  const renderSidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-border">
        <h2 className="text-lg font-bold">Hotel Admin</h2>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex items-center w-full px-3 py-3 text-left rounded-md transition-colors group",
              activeSection === item.id 
                ? "bg-slate-100 text-foreground" 
                : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            )}
            onClick={() => handleNavigate(item.id)}
          >
            <div className={cn("mr-3 p-1.5 rounded-md text-white", item.color)}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{item.label}</span>
            {activeSection === item.id && (
              <div className={cn("w-1.5 h-8 rounded-full ml-auto", item.color)} />
            )}
          </button>
        ))}
        
        <button
          className="flex items-center w-full px-3 py-3 mt-6 text-left rounded-md hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/home')}
        >
          <div className="mr-3 p-1.5 rounded-md text-white bg-slate-500">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-medium">Back to App</span>
        </button>
      </nav>
    </>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:block bg-slate-50 border-r border-border h-full">
        <div className="flex flex-col h-full">
          {renderSidebarContent()}
        </div>
      </aside>
      
      {/* Mobile Menu Button */}
      <button 
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu}></div>
          <aside className="fixed right-0 top-0 h-full w-3/4 max-w-xs bg-slate-50 shadow-xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {renderSidebarContent()}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
