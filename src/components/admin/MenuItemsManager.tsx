import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, X, Image } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
}

const MenuItemsManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('main');
  const [available, setAvailable] = useState(true);
  
  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (error: any) {
      toast.error('Error loading menu items: ' + error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setCategory('main');
    setAvailable(true);
    setEditingItem(null);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setImageUrl(item.image_url);
    setCategory(item.category);
    setAvailable(item.available);
    setShowForm(true);
  };
  
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !item.available })
        .eq('id', item.id);
      
      if (error) throw error;
      
      setMenuItems(menuItems.map(mi => 
        mi.id === item.id ? { ...mi, available: !mi.available } : mi
      ));
      
      toast.success(`${item.name} is now ${!item.available ? 'available' : 'unavailable'}`, { duration: 2000 });
    } catch (error: any) {
      toast.error('Error updating item: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      setMenuItems(menuItems.filter(mi => mi.id !== item.id));
      toast.success(`${item.name} deleted successfully`, { duration: 2000 });
    } catch (error: any) {
      toast.error('Error deleting item: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!name || !description || !price || !imageUrl || !category) {
        toast.error('All fields are required', { duration: 2000 });
        return;
      }
      
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error('Price must be a positive number', { duration: 2000 });
        return;
      }
      
      const menuItemData = {
        name,
        description,
        price: priceNum,
        image_url: imageUrl,
        category,
        available
      };
      
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id ? { ...item, ...menuItemData } : item
        ));
        
        toast.success(`${name} updated successfully`, { duration: 2000 });
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(menuItemData)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setMenuItems([...menuItems, data[0]]);
        }
        
        toast.success(`${name} added successfully`, { duration: 2000 });
      }
      
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      toast.error('Error saving menu item: ' + error.message, { duration: 2000 });
    }
  };
  
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        )}
      </div>
      
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
                    placeholder="Item name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="19.99"
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
                    placeholder="Item description"
                    required
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input 
                    id="image_url" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="main">Main Courses</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-70' : ''}`}>
              <div className="aspect-video relative overflow-hidden bg-muted">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
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
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {item.category}
                  </span>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleToggleAvailability(item)}
                      title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {item.available ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteItem(item)}
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

export default MenuItemsManager;
