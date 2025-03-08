
import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface MenuCategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const MenuCategoryFilter: React.FC<MenuCategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex space-x-3">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm
              ${activeCategory === category.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MenuCategoryFilter;
