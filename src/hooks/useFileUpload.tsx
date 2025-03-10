
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(data.path);
      
      toast.success('Image uploaded successfully');
      return urlData.publicUrl;
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadImageToSupabase
  };
};
