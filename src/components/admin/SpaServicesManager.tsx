import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Clock, Check, X, Image, Upload, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import SearchBar from './SearchBar';

interface SpaService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  available: boolean;
}

const SpaServicesManager: React.FC = () => {
  const [spaServices, setSpaServices] = useState<SpaService[]>([]);
  const [filteredServices, setFilteredServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<SpaService | null>(null);
  const { formatPrice } = useLanguage();
  const { uploading, uploadImageToSupabase, startCamera, stopCamera, capturePhoto, showCamera, setVideoRef } = useFileUpload();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60 minutes');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    fetchSpaServices();
  }, []);
  
  useEffect(() => {
    filterServices();
  }, [searchTerm, spaServices]);
  
  const filterServices = () => {
    if (!searchTerm) {
      setFilteredServices(spaServices);
      return;
    }
    
    const search = searchTerm.toLowerCase();
    const filtered = spaServices.filter(service => 
      service.name.toLowerCase().includes(search) || 
      service.description.toLowerCase().includes(search) ||
      service.duration.toLowerCase().includes(search)
    );
    
    setFilteredServices(filtered);
  };
  
  const fetchSpaServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spa_services')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setSpaServices(data || []);
      setFilteredServices(data || []);
    } catch (error: any) {
      toast.error('Error loading spa services: ' + error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('60 minutes');
    setImageUrl('');
    setAvailable(true);
    setEditingService(null);
  };
  
  const handleEditService = (service: SpaService) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price.toString());
    setDuration(service.duration);
    setImageUrl(service.image);
    setAvailable(service.available);
    setShowForm(true);
  };
  
  const handleToggleAvailability = async (service: SpaService) => {
    try {
      const { error } = await supabase
        .from('spa_services')
        .update({ available: !service.available })
        .eq('id', service.id);
      
      if (error) throw error;
      
      setSpaServices(spaServices.map(s => 
        s.id === service.id ? { ...s, available: !s.available } : s
      ));
      
      toast.success(`${service.name} is now ${!service.available ? 'available' : 'unavailable'}`, { duration: 2000 });
    } catch (error: any) {
      toast.error('Error updating service: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleDeleteService = async (service: SpaService) => {
    if (!confirm(`Are you sure you want to delete ${service.name}?`)) return;
    
    try {
      const { error } = await supabase
        .from('spa_services')
        .delete()
        .eq('id', service.id);
      
      if (error) throw error;
      
      setSpaServices(spaServices.filter(s => s.id !== service.id));
      toast.success(`${service.name} deleted successfully`, { duration: 2000 });
    } catch (error: any) {
      toast.error('Error deleting service: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const url = await uploadImageToSupabase(file);
    
    if (url) {
      setImageUrl(url);
      setShowImageDialog(false);
    }
  };
  
  const handleStartCamera = async () => {
    await startCamera();
    if (videoRef.current) {
      setVideoRef(videoRef.current);
    }
  };
  
  const handleCapturePhoto = async () => {
    const file = await capturePhoto();
    if (file) {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setImageUrl(url);
        stopCamera();
        setShowImageDialog(false);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!name || !description || !price || !imageUrl || !duration) {
        toast.error('All fields are required', { duration: 2000 });
        return;
      }
      
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error('Price must be a positive number', { duration: 2000 });
        return;
      }
      
      const serviceData = {
        name,
        description,
        price: priceNum,
        duration,
        image: imageUrl,
        available
      };
      
      if (editingService) {
        const { error } = await supabase
          .from('spa_services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
        
        setSpaServices(spaServices.map(service => 
          service.id === editingService.id ? { ...service, ...serviceData } : service
        ));
        
        toast.success(`${name} updated successfully`, { duration: 2000 });
      } else {
        const { data, error } = await supabase
          .from('spa_services')
          .insert(serviceData)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSpaServices([...spaServices, data[0]]);
        }
        
        toast.success(`${name} added successfully`, { duration: 2000 });
      }
      
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      toast.error('Error saving spa service: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Spa Services</h2>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        )}
      </div>
      
      {!showForm && (
        <div className="mb-6">
          <SearchBar 
            placeholder="Search services by name, description or duration..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      )}
      
      {showForm && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Service name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Service description"
                    required
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60 minutes"
                    required
                  />
                </div>
                
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="image" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowImageDialog(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 relative w-full max-w-[200px] aspect-video bg-muted rounded-md overflow-hidden">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showImageDialog} onOpenChange={(open) => {
        setShowImageDialog(open);
        if (!open) stopCamera();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {showCamera ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => stopCamera()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={uploading}
                  >
                    {uploading ? 'Processing...' : 'Take Photo'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload from device</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={uploading}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleStartCamera}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take a Photo
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Upload an image for the service. Recommended size: 500x300 pixels.
                </p>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImageDialog(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {spaServices.length === 0 
              ? 'No spa services found. Add your first service to get started.' 
              : 'No services match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className={`overflow-hidden ${!service.available ? 'opacity-70' : ''}`}>
              <div className="aspect-video relative overflow-hidden bg-muted">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <span className="font-medium">{formatPrice(service.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                    <Clock className="h-3 w-3" /> {service.duration}
                  </span>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleToggleAvailability(service)}
                      title={service.available ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {service.available ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpaServicesManager;
