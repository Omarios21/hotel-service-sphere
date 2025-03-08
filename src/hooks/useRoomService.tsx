
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
  
  // Delivery follow-up state
  const [isDeliveryTracking, setIsDeliveryTracking] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    estimatedDelivery: { min: string; max: string };
    items: { name: string; quantity: number }[];
    orderTime: string;
  } | null>(null);
  
  // Check for ongoing order in localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('currentRoomServiceOrder');
    if (savedOrder) {
      try {
        setCurrentOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Error parsing saved order', e);
      }
    }
  }, []);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'main', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' }
  ];

  // Fetch menu items from database or use mock data if error
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        
        // Attempt to get data from Supabase
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('name');
        
        if (error) {
          throw error;
        }
        
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
        
        // Use mock data if there's an error with Supabase
        const mockMenuItems: MenuItemType[] = [
          {
            id: '1',
            name: 'Continental Breakfast',
            description: 'A selection of pastries, fresh fruit, yogurt, and coffee or tea.',
            price: 18.5,
            image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'breakfast'
          },
          {
            id: '2',
            name: 'Eggs Benedict',
            description: 'Poached eggs with hollandaise sauce on English muffins with your choice of ham or smoked salmon.',
            price: 21.0,
            image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'breakfast'
          },
          {
            id: '3',
            name: 'Grilled Salmon',
            description: 'Fresh salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
            price: 32.0,
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'main'
          },
          {
            id: '4',
            name: 'Filet Mignon',
            description: 'Premium beef tenderloin cooked to your preference, served with truffle mashed potatoes and red wine reduction.',
            price: 45.0,
            image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'main'
          },
          {
            id: '5',
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
            price: 14.0,
            image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'desserts'
          },
          {
            id: '6',
            name: 'Tiramisu',
            description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.',
            price: 12.0,
            image: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'desserts'
          },
          {
            id: '7',
            name: 'Wine Selection',
            description: 'Choose from our curated selection of red, white, or sparkling wines.',
            price: 28.0,
            image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'drinks'
          },
          {
            id: '8',
            name: 'Premium Cocktails',
            description: 'Handcrafted cocktails prepared by our expert mixologists.',
            price: 16.0,
            image: 'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'drinks'
          }
        ];
        
        setMenuItems(mockMenuItems);
        toast.info('Using sample menu data', { duration: 2000 });
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
    
    // Generate order ID
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    
    // Get estimated delivery time
    const now = new Date();
    const minTime = new Date(now.getTime() + 20 * 60000);
    const maxTime = new Date(now.getTime() + 40 * 60000);
    
    const deliveryEstimate = {
      min: minTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      max: maxTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Create order items
    const orderItems = cart.map(item => ({
      name: item.item.name,
      quantity: item.quantity
    }));
    
    // Create order object
    const orderDetails = {
      orderId,
      estimatedDelivery: deliveryEstimate,
      items: orderItems,
      orderTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Simulate API call
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setIsSubmitting(false);
      setPaymentMethod(null);
      
      // Store order in state and localStorage
      setCurrentOrder(orderDetails);
      localStorage.setItem('currentRoomServiceOrder', JSON.stringify(orderDetails));
      
      // Clear localStorage cart
      localStorage.removeItem('roomServiceCart');
      
      // Update cart badge
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success toast
      toast.success('Your order has been placed successfully!', {
        duration: 2000
      });
      
      // Open delivery tracking
      setIsDeliveryTracking(true);
    }, 1500);
  };

  // Close delivery tracking
  const closeDeliveryTracking = () => {
    setIsDeliveryTracking(false);
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
    handleSubmitOrder,
    isDeliveryTracking,
    setIsDeliveryTracking,
    currentOrder,
    closeDeliveryTracking
  };
};
