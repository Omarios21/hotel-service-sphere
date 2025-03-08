
import React from 'react';
import { motion } from 'framer-motion';
import MenuItem, { MenuItemType } from '../MenuItem';

interface MenuGridProps {
  items: MenuItemType[];
  isLoading: boolean;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuGrid: React.FC<MenuGridProps> = ({ items, isLoading, onAddToCart }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin-slow h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No items available in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MenuItem item={item} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </div>
  );
};

export default MenuGrid;
