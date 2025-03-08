
import React from 'react';

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
      <div className="flex space-x-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
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
  );
};

export default MenuCategoryFilter;
