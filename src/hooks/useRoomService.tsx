
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MenuItemType } from '@/components/MenuItem';
import { supabase } from '@/integrations/supabase/client';

export const useRoomService = () => {
  const [cart, setCart] = useState<{ item: MenuItemType; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'checkout' | 'card' | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'main', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' }
  ];

  // Fetch menu items from database
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('name');
        
        if (error) throw error;
        
        // Transform data to match MenuItemType
        const transformedData = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image_url,
          category: item.category
        }));
        
        setMenuItems(transformedData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu items', { duration: 2000 });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);
  
  // Store cart in localStorage and dispatch event for header badge
  useEffect(() => {
    localStorage.setItem('roomServiceCart', JSON.stringify(cart));
    // Dispatch event for header to update cart badge
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);
  
  // Listen for cart open event
  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    
    window.addEventListener('openCart', handleOpenCart);
    
    // Check if we should open cart on load (from navigation)
    const shouldOpenCart = sessionStorage.getItem('openCartOnLoad');
    if (shouldOpenCart === 'true') {
      setIsCartOpen(true);
      sessionStorage.removeItem('openCartOnLoad');
    }
    
    return () => {
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, []);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('roomServiceCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing saved cart', e);
      }
    }
  }, []);

  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.item.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        toast.success(`Updated ${item.name} quantity in cart`, {
          duration: 2000 // 2 seconds duration
        });
        return updatedCart;
      } else {
        // Add new item to cart
        toast.success(`Added ${item.name} to cart`, {
          duration: 2000 // 2 seconds duration
        });
        return [...prevCart, { item, quantity }];
      }
    });
  };
  
  const handleRemoveFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    toast.info('Item removed from cart', {
      duration: 2000 // 2 seconds duration
    });
  };
  
  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
  };
  
  const handleSubmitOrder = () => {
    if (cart.length === 0 || !paymentMethod) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setIsSubmitting(false);
      setPaymentMethod(null);
      
      // Clear localStorage cart
      localStorage.removeItem('roomServiceCart');
      
      // Update cart badge
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success('Your order has been placed successfully!', {
        duration: 2000 // 2 seconds duration
      });
    }, 1500);
  };
  
  // Filter menu items by category
  const filteredMenuItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return {
    cart,
    isCartOpen,
    setIsCartOpen,
    isSubmitting,
    paymentMethod,
    setPaymentMethod,
    menuItems,
    isLoading,
    activeCategory,
    setActiveCategory,
    categories,
    filteredMenuItems,
    handleAddToCart,
    handleRemoveFromCart,
    calculateTotal,
    handleSubmitOrder
  };
};
