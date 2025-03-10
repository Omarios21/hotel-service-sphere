
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Set video element when stream is available
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.onloadedmetadata = () => {
        setCameraReady(true);
      };
    }
    
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const startCamera = async () => {
    try {
      // Reset camera ready state
      setCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      setVideoStream(stream);
      setShowCamera(true);
      return stream;
    } catch (error: any) {
      toast.error('Error accessing camera: ' + error.message);
      console.error('Error accessing camera:', error);
      return null;
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    return new Promise<File | null>((resolve) => {
      if (!videoRef.current || !cameraReady) {
        toast.error('Camera not initialized or not ready');
        console.error('Video reference or camera not ready:', { 
          videoRef: !!videoRef.current, 
          cameraReady 
        });
        resolve(null);
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const context = canvas.getContext('2d');
        if (!context) {
          toast.error('Could not create canvas context');
          resolve(null);
          return;
        }
        
        // Draw the current video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error('Failed to capture image');
            resolve(null);
            return;
          }
          
          // Create a File object from the blob
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.9);
      } catch (error: any) {
        toast.error('Error capturing photo: ' + error.message);
        console.error('Error capturing photo:', error);
        resolve(null);
      }
    });
  };

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
    uploadImageToSupabase,
    startCamera,
    stopCamera,
    capturePhoto,
    showCamera,
    videoRef,
    videoStream,
    cameraReady
  };
};
