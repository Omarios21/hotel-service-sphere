
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  UtensilsCrossed, 
  Flower2, 
  Tent, 
  Calendar, 
  Bell, 
  Users, 
  Settings,
  Globe,
  Hotel
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  
  const menuItems = [
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      id: 'menu-items', 
      name: 'Menu Items', 
      icon: <UtensilsCrossed className="h-5 w-5" /> 
    },
    { 
      id: 'spa-services', 
      name: 'Spa Services', 
      icon: <Flower2 className="h-5 w-5" /> 
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
    <aside className="h-full bg-card border-r border-border p-2 overflow-y-auto shadow-sm transition-colors duration-300">
      <div className="flex flex-col h-full">
        <div className="mb-6 p-2">
          <div className={cn(
            "font-bold transition-all duration-200 flex items-center",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <Hotel className={cn("text-primary", collapsed ? "h-8 w-8" : "h-6 w-6 mr-2")} />
            {!collapsed && <span className="text-xl">Hotel Admin</span>}
          </div>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-md transition-all duration-200",
                    "hover:bg-primary/10",
                    activeSection === item.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className={cn(
                      "ml-3 transition-opacity",
                      activeSection === item.id ? "font-medium" : ""
                    )}>
                      {item.name}
                    </span>
                  )}
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
