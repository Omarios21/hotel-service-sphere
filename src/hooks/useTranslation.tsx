
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Translation {
  [langCode: string]: string;
}

export const useTranslation = () => {
  const [translating, setTranslating] = useState(false);

  /**
   * Automatically translate text to all enabled languages
   * @param text The text to translate
   * @param sourceLanguage Optional source language code (if known)
   * @returns Object with translations for each language
   */
  const translateText = async (
    text: string, 
    sourceLanguage?: string
  ): Promise<Translation | null> => {
    if (!text) return null;
    
    setTranslating(true);
    try {
      // Get enabled languages from the database
      const { data: languageData, error: langError } = await supabase
        .from('language_settings')
        .select('code, enabled')
        .eq('enabled', true);
      
      if (langError) throw langError;
      
      // Create array of target languages
      const targetLanguages = languageData?.map(lang => lang.code) || ['en', 'fr', 'es'];
      
      // Call our Supabase Edge Function for translation
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          sourceLanguage,
          targetLanguages
        }
      });
      
      if (error) throw error;
      
      if (!data?.translations) {
        throw new Error('No translations returned');
      }
      
      toast.success('Text translated successfully', { duration: 2000 });
      return data.translations;
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('Error translating text: ' + error.message, { duration: 2000 });
      return null;
    } finally {
      setTranslating(false);
    }
  };

  return {
    translating,
    translateText
  };
};
