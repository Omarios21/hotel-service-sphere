
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MenuItemType } from '../MenuItem';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface MenuItemDetailsProps {
  item: MenuItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuItemDetails: React.FC<MenuItemDetailsProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { formatPrice } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  
  if (!item) return null;
  
  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    onClose();
  };
  
  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };
  
  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">{item.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{item.category}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/80 text-white font-medium px-3 py-1 rounded-full text-sm shadow-md">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">{item.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button 
                onClick={handleDecrement}
                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                disabled={quantity <= 1}
              >
                <span className="sr-only">Decrease</span>
                <span className="h-4 w-4 flex items-center justify-center">−</span>
              </button>
              <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
              <button 
                onClick={handleIncrement}
                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                disabled={quantity >= 10}
              >
                <span className="sr-only">Increase</span>
                <span className="h-4 w-4 flex items-center justify-center">+</span>
              </button>
            </div>
            
            <Button onClick={handleAddToCart}>
              Add to Cart - {formatPrice(item.price * quantity)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDetails;
