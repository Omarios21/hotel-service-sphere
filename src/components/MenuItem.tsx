
import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  available?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };
  
  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    // Simulate API call
    setTimeout(() => {
      onAddToCart(item, quantity);
      setIsAddingToCart(false);
      setQuantity(1);
    }, 500);
  };
  
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-base">{item.name}</h3>
          <span className="font-medium text-primary">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button 
              onClick={handleDecrement}
              className="p-2 bg-secondary hover:bg-secondary/80 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
            <button 
              onClick={handleIncrement}
              className="p-2 bg-secondary hover:bg-secondary/80 transition-colors"
              disabled={quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isAddingToCart 
                ? 'bg-muted text-muted-foreground cursor-wait' 
                : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
