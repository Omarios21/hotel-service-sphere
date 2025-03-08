
import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useRoomService } from '@/hooks/useRoomService';
import { Package } from 'lucide-react';

// Room Service Components
import MenuCategoryFilter from '@/components/room-service/MenuCategoryFilter';
import MenuGrid from '@/components/room-service/MenuGrid';
import Cart from '@/components/room-service/Cart';
import CartButton from '@/components/room-service/CartButton';
import DeliveryFollowUp from '@/components/room-service/DeliveryFollowUp';

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
    handleSubmitOrder,
    isDeliveryTracking,
    setIsDeliveryTracking,
    currentOrder,
    closeDeliveryTracking
  } = useRoomService();

  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Room Service</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Order delicious meals and refreshments directly to your room
            </p>
          </div>
          
          {/* Order Tracking Button */}
          {currentOrder && (
            <button
              onClick={() => setIsDeliveryTracking(true)}
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-3 transition-colors"
              title="Track Delivery"
            >
              <Package className="h-5 w-5" />
            </button>
          )}
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
        
        {/* Delivery Follow-up Modal */}
        <DeliveryFollowUp
          isOpen={isDeliveryTracking}
          onClose={closeDeliveryTracking}
          orderDetails={currentOrder || undefined}
        />
      </div>
    </Layout>
  );
};

export default RoomService;
