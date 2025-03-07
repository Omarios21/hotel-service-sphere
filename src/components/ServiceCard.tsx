
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
      className="border-none shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/60 dark:to-gray-800/60"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {icon}
              </div>
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <div className="bg-primary/5 rounded-full p-1">
            <ChevronRight className="text-primary h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
