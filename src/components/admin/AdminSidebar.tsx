
import React, { useState } from 'react';
import { 
  CreditCard, ShoppingCart, Spa, CalendarRange, BellRing, 
  Users, Settings, Menu, X, History, Activity, 
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  authenticated: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  onNavigate, 
  activeSection,
  authenticated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // Group sections by access level
  const publicSections = [
    { id: 'menu-items', name: t('admin.sections.menuItems'), icon: ShoppingCart, color: 'bg-orange-100 text-orange-700' },
    { id: 'spa-services', name: t('admin.sections.spaServices'), icon: Spa, color: 'bg-purple-100 text-purple-700' },
    { id: 'activities', name: t('admin.sections.activities'), icon: Activity, color: 'bg-blue-100 text-blue-700' },
  ];
  
  const privateSections = [
    { id: 'transactions', name: t('admin.sections.transactions'), icon: CreditCard, color: 'bg-green-100 text-green-700' },
    { id: 'clearing-history', name: t('admin.sections.clearingHistory'), icon: History, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'spa-calendar', name: t('admin.sections.spaCalendar'), icon: CalendarRange, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'notifications', name: t('admin.sections.notifications'), icon: BellRing, color: 'bg-red-100 text-red-700' },
    { id: 'users', name: t('admin.sections.users'), icon: Users, color: 'bg-teal-100 text-teal-700' },
    { id: 'settings', name: t('admin.sections.settings'), icon: Settings, color: 'bg-slate-100 text-slate-700' },
  ];
  
  const handleNavigation = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };
  
  const renderSectionButton = (section: any) => (
    <button
      key={section.id}
      onClick={() => handleNavigation(section.id)}
      className={cn(
        "flex items-center w-full px-3 py-2 mb-1 rounded-lg transition-colors text-left",
        activeSection === section.id 
          ? `${section.color} font-medium` 
          : "hover:bg-muted"
      )}
    >
      <section.icon className="h-5 w-5 mr-3" />
      <span>{section.name}</span>
      {activeSection === section.id && (
        <ChevronRight className="h-4 w-4 ml-auto" />
      )}
    </button>
  );
  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 p-2 rounded-full bg-primary text-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Public Sections */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground px-3">
              {t('admin.general')}
            </h3>
            <div className="space-y-1">
              {publicSections.map(renderSectionButton)}
            </div>
          </div>
          
          {/* Private Sections (Only show if authenticated) */}
          {authenticated && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground px-3">
                {t('admin.management')}
              </h3>
              <div className="space-y-1">
                {privateSections.map(renderSectionButton)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
