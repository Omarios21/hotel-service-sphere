
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Check, X, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar from './SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LanguageSetting {
  code: string;
  name: string;
  enabled: boolean;
}

const defaultLanguages: LanguageSetting[] = [
  { code: 'en', name: 'English', enabled: true },
  { code: 'fr', name: 'Français', enabled: true },
  { code: 'es', name: 'Español', enabled: true },
  { code: 'de', name: 'Deutsch', enabled: false },
  { code: 'nl', name: 'Nederlands', enabled: false },
  { code: 'it', name: 'Italiano', enabled: false },
  { code: 'zh', name: 'Chinese (中文)', enabled: false },
  { code: 'ja', name: 'Japanese (日本語)', enabled: false },
  { code: 'ko', name: 'Korean (한국어)', enabled: false },
  { code: 'ar', name: 'Arabic (العربية)', enabled: false },
];

const LanguageManager: React.FC = () => {
  const [languages, setLanguages] = useState<LanguageSetting[]>(defaultLanguages);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchLanguageSettings();
  }, []);

  const fetchLanguageSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('language_settings')
        .select('*');
      
      if (error) {
        console.error('Error fetching languages:', error);
        setLanguages(defaultLanguages);
      } else if (data && Array.isArray(data) && data.length > 0) {
        setLanguages(data as LanguageSetting[]);
      } else {
        // S'il n'y a pas de données, initialisez avec les valeurs par défaut
        await saveLanguageSettings(defaultLanguages);
      }
    } catch (error: any) {
      console.error('Error loading language settings:', error);
      toast.error('Error loading language settings', { duration: 2000 });
      setLanguages(defaultLanguages);
    } finally {
      setLoading(false);
    }
  };

  const saveLanguageSettings = async (langSettings: LanguageSetting[]) => {
    try {
      setSaving(true);
      
      // Batch the upsert operation
      const { error } = await supabase
        .from('language_settings')
        .upsert(langSettings);
      
      if (error) throw error;
      
      setLanguages(langSettings);
      toast.success('Language settings saved', { duration: 2000 });
    } catch (error: any) {
      console.error('Error saving language settings:', error);
      toast.error('Error saving language settings', { duration: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLanguage = (code: string) => {
    const updatedLanguages = languages.map(lang => 
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    );
    setLanguages(updatedLanguages);
  };

  const handleSaveChanges = () => {
    saveLanguageSettings(languages);
  };

  const handleAddLanguage = () => {
    if (!newLangCode || !newLangName) {
      toast.error('Language code and name are required', { duration: 2000 });
      return;
    }
    
    if (languages.some(lang => lang.code === newLangCode)) {
      toast.error('Language code already exists', { duration: 2000 });
      return;
    }
    
    const updatedLanguages = [
      ...languages,
      { code: newLangCode, name: newLangName, enabled: true }
    ];
    
    setLanguages(updatedLanguages);
    setNewLangCode('');
    setNewLangName('');
    setShowAddForm(false);
    
    saveLanguageSettings(updatedLanguages);
  };

  const filteredLanguages = useMemo(() => {
    return languages.filter(lang => {
      const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lang.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'enabled') return matchesSearch && lang.enabled;
      if (activeTab === 'disabled') return matchesSearch && !lang.enabled;
      
      return matchesSearch;
    });
  }, [languages, searchQuery, activeTab]);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6).fill(0).map((_, index) => (
        <Card key={`skeleton-${index}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Language Settings</h2>
        
        <div className="flex gap-2">
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          )}
          <Button 
            onClick={handleSaveChanges} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="langCode">Language Code</Label>
                <Input
                  id="langCode"
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  placeholder="en"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="langName">Language Name</Label>
                <Input
                  id="langName"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="English"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLanguage}>
                Add Language
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <SearchBar 
          placeholder="Search languages..." 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLanguages.map((lang) => (
            <Card key={lang.code} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.code}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`enable-${lang.code}`}
                      checked={lang.enabled}
                      onCheckedChange={() => handleToggleLanguage(lang.code)}
                    />
                    <Label htmlFor={`enable-${lang.code}`} className="text-sm">
                      {lang.enabled ? (
                        <span className="flex items-center text-green-500">
                          <Check className="h-4 w-4 mr-1" /> Enabled
                        </span>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-1" /> Disabled
                        </span>
                      )}
                    </Label>
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

export default LanguageManager;
