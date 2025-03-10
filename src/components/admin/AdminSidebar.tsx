
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  Receipt, 
  UtensilsCrossed, 
  Spa, 
  Tent, 
  Calendar, 
  Bell, 
  Users, 
  Settings,
  Globe
} from 'lucide-react';

interface AdminSidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  collapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  onNavigate, 
  activeSection,
  collapsed 
}) => {
  const menuItems = [
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      id: 'clearing-history', 
      name: 'Clearing History', 
      icon: <Receipt className="h-5 w-5" /> 
    },
    { 
      id: 'menu-items', 
      name: 'Menu Items', 
      icon: <UtensilsCrossed className="h-5 w-5" /> 
    },
    { 
      id: 'spa-services', 
      name: 'Spa Services', 
      icon: <Spa className="h-5 w-5" /> 
    },
    { 
      id: 'activities', 
      name: 'Activities', 
      icon: <Tent className="h-5 w-5" /> 
    },
    { 
      id: 'spa-calendar', 
      name: 'Spa Calendar', 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: <Bell className="h-5 w-5" /> 
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      id: 'languages', 
      name: 'Languages', 
      icon: <Globe className="h-5 w-5" /> 
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  return (
    <aside className="h-full bg-background border-r border-border p-2 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="mb-6 p-2">
          <h1 className={cn(
            "font-bold transition-all duration-200",
            collapsed ? "text-xs text-center" : "text-xl"
          )}>
            {collapsed ? "Admin" : "Hotel Admin"}
          </h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeSection === item.id ? "bg-accent text-accent-foreground" : "text-foreground",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
