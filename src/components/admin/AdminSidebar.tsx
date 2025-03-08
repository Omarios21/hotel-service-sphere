
import React from 'react';
import { Home, ShoppingBag, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <aside className="w-64 hidden lg:block bg-slate-50 border-r border-border h-full">
      <div className="flex flex-col h-full">
        <div className="px-6 py-6 border-b border-border">
          <h2 className="text-lg font-bold">Hotel Admin</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/admin')}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Menu Items
          </button>
          
          <button
            className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/home')}
          >
            <Home className="h-5 w-5 mr-3" />
            Back to App
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
