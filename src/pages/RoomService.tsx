
import React, { useState } from 'react';
import Layout from '../components/Layout';
import MenuItem, { MenuItemType } from '../components/MenuItem';
import { motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

const RoomService: React.FC = () => {
  const [cart, setCart] = useState<{ item: MenuItemType; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample menu items
  const menuItems: MenuItemType[] = [
    {
      id: '1',
      name: 'Continental Breakfast',
      description: 'Assorted pastries, fresh fruit, yogurt, and coffee or tea',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      name: 'Avocado Toast',
      description: 'Sourdough bread with avocado, poached eggs, and microgreens',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1603046891744-76e6481cf539?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Romaine lettuce with parmesan, croutons, and caesar dressing',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      name: 'Grilled Salmon',
      description: 'Fresh salmon with seasonal vegetables and lemon butter sauce',
      price: 32.99,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      name: 'Truffle Pasta',
      description: 'Homemade pasta with truffle cream sauce and parmesan',
      price: 28.99,
      image: 'https://images.unsplash.com/photo-1663591971243-5a66eaa102cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '6',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with ganache and berries',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'main', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' }
  ];
  
  const [activeCategory, setActiveCategory] = useState('all');
  
  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.item.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        toast.success(`Updated ${item.name} quantity in cart`);
        return updatedCart;
      } else {
        // Add new item to cart
        toast.success(`Added ${item.name} to cart`);
        return [...prevCart, { item, quantity }];
      }
    });
  };
  
  const handleRemoveFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    toast.info('Item removed from cart');
  };
  
  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
  };
  
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setIsSubmitting(false);
      toast.success('Your order has been placed successfully!');
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary">Room Service</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Order delicious meals and refreshments directly to your room
          </p>
        </motion.div>
        
        {/* Categories */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MenuItem item={item} onAddToCart={handleAddToCart} />
            </motion.div>
          ))}
        </div>
        
        {/* Cart button */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-10"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="font-medium">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
              <span className="font-bold">${calculateTotal().toFixed(2)}</span>
            </button>
          </motion.div>
        )}
        
        {/* Cart sidebar */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-background h-full overflow-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Order</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {cart.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-8">
                      {cart.map(cartItem => (
                        <div 
                          key={cartItem.item.id}
                          className="flex justify-between items-center py-3 border-b border-border"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{cartItem.item.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-muted-foreground">
                                ${cartItem.item.price.toFixed(2)} × {cartItem.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-4">
                              ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveFromCart(cartItem.item.id)}
                              className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-muted transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-border pt-4 mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Service charge (10%)</span>
                        <span className="font-medium">${(calculateTotal() * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg mt-4">
                        <span>Total</span>
                        <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-lg font-medium text-center transition-all
                        ${isSubmitting 
                          ? 'bg-muted text-muted-foreground cursor-wait' 
                          : 'bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground">
                      Add some delicious items from the menu
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomService;
