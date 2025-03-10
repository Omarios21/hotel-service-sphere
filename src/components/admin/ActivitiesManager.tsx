import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Clock, Check, X, Image, Upload, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import SearchBar from './SearchBar';

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  image: string;
  available: boolean;
}

const ActivitiesManager: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const { formatPrice } = useLanguage();
  const { 
    uploading, 
    uploadImageToSupabase, 
    startCamera, 
    stopCamera, 
    capturePhoto, 
    showCamera, 
    setVideoRef 
  } = useFileUpload();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('2 hours');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  useEffect(() => {
    filterActivities();
  }, [searchTerm, activities]);
  
  const filterActivities = () => {
    if (!searchTerm) {
      setFilteredActivities(activities);
      return;
    }
    
    const search = searchTerm.toLowerCase();
    const filtered = activities.filter(activity => 
      activity.name.toLowerCase().includes(search) || 
      activity.description.toLowerCase().includes(search) ||
      activity.location.toLowerCase().includes(search) ||
      activity.duration.toLowerCase().includes(search)
    );
    
    setFilteredActivities(filtered);
  };
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setActivities(data || []);
      setFilteredActivities(data || []);
    } catch (error: any) {
      toast.error('Error loading activities: ' + error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('2 hours');
    setLocation('');
    setImageUrl('');
    setAvailable(true);
    setEditingActivity(null);
  };
  
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setName(activity.name);
    setDescription(activity.description);
    setPrice(activity.price.toString());
    setDuration(activity.duration);
    setLocation(activity.location);
    setImageUrl(activity.image);
    setAvailable(activity.available);
    setShowForm(true);
  };
  
  const handleToggleAvailability = async (activity: Activity) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ available: !activity.available })
        .eq('id', activity.id);
      
      if (error) throw error;
      
      setActivities(activities.map(a => 
        a.id === activity.id ? { ...a, available: !a.available } : a
      ));
      
      toast.success(`${activity.name} is now ${!activity.available ? 'available' : 'unavailable'}`, { duration: 2000 });
      
      window.dispatchEvent(new Event('activitiesUpdated'));
    } catch (error: any) {
      toast.error('Error updating activity: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleDeleteActivity = async (activity: Activity) => {
    if (!confirm(`Are you sure you want to delete ${activity.name}?`)) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activity.id);
      
      if (error) throw error;
      
      setActivities(activities.filter(a => a.id !== activity.id));
      toast.success(`${activity.name} deleted successfully`, { duration: 2000 });
      
      window.dispatchEvent(new Event('activitiesUpdated'));
    } catch (error: any) {
      toast.error('Error deleting activity: ' + error.message, { duration: 2000 });
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
      if (!name || !description || !price || !location || !imageUrl || !duration) {
        toast.error('All fields are required', { duration: 2000 });
        return;
      }
      
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error('Price must be a positive number', { duration: 2000 });
        return;
      }
      
      const activityData = {
        name,
        description,
        price: priceNum,
        duration,
        location,
        image: imageUrl,
        available
      };
      
      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivity.id);
        
        if (error) throw error;
        
        setActivities(activities.map(activity => 
          activity.id === editingActivity.id ? { ...activity, ...activityData } : activity
        ));
        
        toast.success(`${name} updated successfully`, { duration: 2000 });
        
        window.dispatchEvent(new Event('activitiesUpdated'));
      } else {
        const { data, error } = await supabase
          .from('activities')
          .insert(activityData)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActivities([...activities, data[0]]);
        }
        
        toast.success(`${name} added successfully`, { duration: 2000 });
        
        window.dispatchEvent(new Event('activitiesUpdated'));
      }
      
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      toast.error('Error saving activity: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Activities</h2>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Activity
          </Button>
        )}
      </div>
      
      {!showForm && (
        <div className="mb-6">
          <SearchBar 
            placeholder="Search activities by name, description, location..."
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
                    placeholder="Activity name"
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
                    placeholder="Activity description"
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
                    placeholder="2 hours"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Hotel lobby"
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
                  {editingActivity ? 'Update Activity' : 'Add Activity'}
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
                  Upload an image for the activity. Recommended size: 500x300 pixels.
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
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activities.length === 0 
              ? 'No activities found. Add your first activity to get started.' 
              : 'No activities match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className={`overflow-hidden ${!activity.available ? 'opacity-70' : ''}`}>
              <div className="aspect-video relative overflow-hidden bg-muted">
                {activity.image ? (
                  <img 
                    src={activity.image} 
                    alt={activity.name}
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
                  <h3 className="font-medium">{activity.name}</h3>
                  <span className="font-medium">{formatPrice(activity.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                    <Clock className="h-3 w-3" /> {activity.duration}
                  </span>
                  <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                    <MapPin className="h-3 w-3" /> {activity.location}
                  </span>
                </div>
                <div className="flex justify-end space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleToggleAvailability(activity)}
                    title={activity.available ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {activity.available ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleEditActivity(activity)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDeleteActivity(activity)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesManager;
