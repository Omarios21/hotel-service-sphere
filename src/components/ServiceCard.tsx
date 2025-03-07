
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card 
      className="border-none shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-full bg-amber-600/10 text-amber-600">
                {icon}
              </div>
              <h3 className="font-medium text-lg text-amber-800 font-playfair">{title}</h3>
            </div>
            <p className="text-muted-foreground text-sm text-amber-700/70">{description}</p>
          </div>
          <div className="bg-amber-500/10 rounded-full p-1">
            <ChevronRight className="text-amber-600 h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
