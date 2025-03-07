
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  title, 
  description, 
  icon, 
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-primary">
              {icon}
            </div>
            <h3 className="font-medium text-lg">{title}</h3>
          </div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <ChevronRight className="text-muted-foreground h-5 w-5" />
      </div>
    </motion.div>
  );
};

export default ServiceCard;
