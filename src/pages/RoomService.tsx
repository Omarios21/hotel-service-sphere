
import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useRoomService } from '@/hooks/useRoomService';

// Room Service Components
import MenuCategoryFilter from '@/components/room-service/MenuCategoryFilter';
import MenuGrid from '@/components/room-service/MenuGrid';
import Cart from '@/components/room-service/Cart';
import CartButton from '@/components/room-service/CartButton';

const RoomService: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    isSubmitting,
    paymentMethod,
    setPaymentMethod,
    isLoading,
    activeCategory,
    setActiveCategory,
    categories,
    filteredMenuItems,
    handleAddToCart,
    handleRemoveFromCart,
    calculateTotal,
    handleSubmitOrder
  } = useRoomService();

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
        
        {/* Categories Filter */}
        <MenuCategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {/* Menu Items Grid */}
        <MenuGrid 
          items={filteredMenuItems}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />
        
        {/* Floating Cart Button */}
        <CartButton 
          cartItems={cart}
          calculateTotal={calculateTotal}
          openCart={() => setIsCartOpen(true)}
        />
        
        {/* Cart Sidebar */}
        <Cart
          isOpen={isCartOpen}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemoveFromCart={handleRemoveFromCart}
          isSubmitting={isSubmitting}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onSubmitOrder={handleSubmitOrder}
        />
      </div>
    </Layout>
  );
};

export default RoomService;
