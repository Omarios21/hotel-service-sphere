
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
      className="border-[#BC9A6A]/20 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-black/60"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-full bg-[#BC9A6A]/10 text-[#BC9A6A]">
                {icon}
              </div>
              <h3 className="font-medium text-lg text-white font-playfair">{title}</h3>
            </div>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
          <div className="bg-[#BC9A6A]/10 rounded-full p-1">
            <ChevronRight className="text-[#BC9A6A] h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
