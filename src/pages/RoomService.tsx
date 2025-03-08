
import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useRoomService } from '@/hooks/useRoomService';
import { Package, UtensilsCrossed } from 'lucide-react';

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
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950 rounded-2xl p-8 shadow-md border border-slate-100 dark:border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-light tracking-tight text-primary">Room Service</h1>
              <p className="mt-2 text-lg text-muted-foreground/80 font-light">
                Indulge in exquisite dining delivered directly to your suite
              </p>
            </div>
            
            {/* Order Tracking Button */}
            {currentOrder && (
              <button
                onClick={() => setIsDeliveryTracking(true)}
                className="absolute top-8 right-8 bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-3 transition-colors"
                title="Track Delivery"
              >
                <Package className="h-5 w-5" />
              </button>
            )}
            
            {/* Illustration Element */}
            <div className="absolute -bottom-6 -right-6 opacity-10">
              <UtensilsCrossed className="h-24 w-24 text-primary" />
            </div>
          </div>
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
