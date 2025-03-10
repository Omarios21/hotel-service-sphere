
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  location: string;
  image: string;
}

export const useActivities = () => {
  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('available', true)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        return data.map(activity => ({
          id: activity.id,
          name: activity.name,
          description: activity.description,
          price: activity.price,
          duration: activity.duration,
          location: activity.location,
          image: activity.image
        }));
      } else {
        return getFallbackActivities();
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      return getFallbackActivities();
    }
  }, []);
  
  const { data: activities = [], isLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    refetchOnWindowFocus: false
  });
  
  useEffect(() => {
    // Set up real-time listener for activities table
    const channel = supabase
      .channel('activities_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activities' 
        }, 
        (payload) => {
          console.log('Received real-time update for activities:', payload);
          refetchActivities();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchActivities]);
  
  const getFallbackActivities = (): Activity[] => {
    return [
      {
        id: '1',
        name: 'Guided Nature Hike',
        description: 'Explore the beautiful natural surroundings with our experienced guide.',
        duration: '2 hours',
        price: 25,
        location: 'Hotel Entrance',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: '2',
        name: 'Yoga Class',
        description: 'Start your day with relaxation and inner peace through our morning yoga session.',
        duration: '1 hour',
        price: 15,
        location: 'Wellness Center',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
      },
      {
        id: '3',
        name: 'Wine Tasting',
        description: 'Sample fine local wines guided by our sommelier.',
        duration: '1.5 hours',
        price: 40,
        location: 'Restaurant Bar',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
      }
    ];
  };
  
  return {
    activities,
    isLoading,
    refetchActivities
  };
};
