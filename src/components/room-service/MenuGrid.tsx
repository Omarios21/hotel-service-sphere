
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MenuItem, { MenuItemType } from '../MenuItem';
import MenuItemDetails from './MenuItemDetails';

interface MenuGridProps {
  items: MenuItemType[];
  isLoading: boolean;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuGrid: React.FC<MenuGridProps> = ({ items, isLoading, onAddToCart }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  
  // When items change, trigger animation
  useEffect(() => {
    if (!isLoading && items.length > 0) {
      setAnimateItems(true);
      
      // Reset animation state after a short delay
      const timer = setTimeout(() => {
        setAnimateItems(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [items, isLoading]);
  
  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    // Clear selected item after animation completes
    setTimeout(() => setSelectedItem(null), 300);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin-slow h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-muted-foreground font-light">No items available in this category.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              // Add a pulse animation when items update
              ...(animateItems ? { 
                boxShadow: ['0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 8px rgba(59, 130, 246, 0.5)', '0px 0px 0px rgba(59, 130, 246, 0)']
              } : {})
            }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => handleItemClick(item)}
            className="cursor-pointer"
          >
            <MenuItem item={item} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </div>
      
      <MenuItemDetails
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default MenuGrid;
