import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Track cart items from localStorage
  useEffect(() => {
    const getCartItems = () => {
      const cartData = localStorage.getItem('roomServiceCart');
      if (cartData) {
        try {
          const cart = JSON.parse(cartData);
          const itemCount = cart.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartItemCount(itemCount);
        } catch (e) {
          console.error('Error parsing cart data', e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };
    
    // Initial load
    getCartItems();
    
    // Setup event listener for storage changes
    const handleStorageChange = () => getCartItems();
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const handleCartClick = () => {
    if (location.pathname === '/room-service') {
      // If we're already on the room service page, dispatch an event to open the cart
      window.dispatchEvent(new CustomEvent('openCart'));
    } else {
      // Otherwise navigate to the room service page
      navigate('/room-service');
      // Set a flag in sessionStorage to open cart when page loads
      sessionStorage.setItem('openCartOnLoad', 'true');
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/70 border-b border-border transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/profile')}
              className="flex items-center space-x-1 transition-colors"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
          
          {/* Center area - reserved for future use */}
          <div className="flex-1"></div>
          
          {/* Cart icon */}
          <div className="flex items-center">
            <button 
              onClick={handleCartClick}
              className="relative p-2 mr-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/admin')}
                className="ml-2"
              >
                <Shield className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
