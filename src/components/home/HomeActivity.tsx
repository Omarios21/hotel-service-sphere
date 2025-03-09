
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Gem, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'ongoing';
}

interface HomeActivityProps {
  activity: Activity;
}

const HomeActivity: React.FC<HomeActivityProps> = ({ activity }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <motion.div 
      whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      className={`p-4 rounded-xl border border-slate-100 flex justify-between items-center ${
        activity.status === 'ongoing' 
          ? 'bg-primary/5 border-primary/10' 
          : 'bg-white/60 dark:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
          activity.status === 'ongoing' 
            ? 'bg-primary/10' 
            : 'bg-slate-50 dark:bg-white/5'
        }`}>
          {activity.status === 'ongoing' ? (
            <Gem className="h-6 w-6 text-primary/80" />
          ) : (
            <Star className="h-6 w-6 text-slate-400/80" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-primary">{activity.title}</h3>
            {activity.status === 'ongoing' && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {t('status.ongoing')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-light mt-1">
            <span>{activity.time}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 inline-block" /> 
              {activity.location}
            </span>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="text-primary/70 hover:text-primary hover:bg-primary/5 rounded-full"
        onClick={() => navigate('/activities')}
        aria-label={t('button.view')}
      >
        <Eye className="h-5 w-5" />
      </Button>
    </motion.div>
  );
};

export default HomeActivity;
