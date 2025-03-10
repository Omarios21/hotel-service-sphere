
import React from 'react';
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CreditCard,
  Settings,
  Store,
  Users,
  Utensils,
  CalendarDays,
  CheckSquare,
  Bell
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  collapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onNavigate, collapsed }) => {
  const navigationItems = [
    {
      name: 'Transactions',
      icon: <CreditCard className="h-5 w-5" />,
      value: 'transactions',
    },
    {
      name: 'Transaction Clearing',
      icon: <CheckSquare className="h-5 w-5" />,
      value: 'clearing-history',
    },
    {
      name: 'Menu Items',
      icon: <Utensils className="h-5 w-5" />,
      value: 'menu-items',
    },
    {
      name: 'Spa Services',
      icon: <Store className="h-5 w-5" />,
      value: 'spa-services',
    },
    {
      name: 'Activities',
      icon: <BarChart3 className="h-5 w-5" />,
      value: 'activities',
    },
    {
      name: 'Spa Calendar',
      icon: <CalendarDays className="h-5 w-5" />,
      value: 'spa-calendar',
    },
    {
      name: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      value: 'notifications',
    },
    {
      name: 'User Management',
      icon: <Users className="h-5 w-5" />,
      value: 'users',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      value: 'settings',
    },
  ];

  return (
    <div className="h-full bg-slate-800 text-white">
      <div className={cn(
        "h-16 flex items-center border-b border-slate-700 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
        {collapsed && <span className="text-xl font-bold">A</span>}
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navigationItems.map(item => (
          <button
            key={item.value}
            onClick={() => onNavigate(item.value)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              collapsed ? "justify-center" : "justify-start",
              activeSection === item.value
                ? "bg-slate-700 text-white"
                : "hover:bg-slate-700/50 text-slate-300"
            )}
            title={collapsed ? item.name : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
