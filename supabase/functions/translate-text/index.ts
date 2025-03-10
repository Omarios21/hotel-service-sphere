
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface RequestBody {
  text: string;
  sourceLanguage?: string;
  targetLanguages: string[];
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check that request is a POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the request body
    const body: RequestBody = await req.json();
    const { text, sourceLanguage, targetLanguages } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one target language is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Detect language if not provided
    let detectedLanguage = sourceLanguage;
    if (!detectedLanguage) {
      const detectionResult = await detectLanguage(text);
      detectedLanguage = detectionResult;
    }

    // Translate text to all target languages
    const translations: { [key: string]: string } = {};
    
    // Always include the original text in the source language
    if (detectedLanguage) {
      translations[detectedLanguage] = text;
    }

    // Only translate to languages that are different from the source
    const languagesToTranslate = targetLanguages.filter(lang => lang !== detectedLanguage);

    // Translate to all target languages in parallel
    if (languagesToTranslate.length > 0) {
      const translationPromises = languagesToTranslate.map(targetLang => 
        translateText(text, targetLang, detectedLanguage)
      );
      
      const translationResults = await Promise.all(translationPromises);
      
      // Add results to translations object
      languagesToTranslate.forEach((lang, index) => {
        translations[lang] = translationResults[index];
      });
    }

    return new Response(JSON.stringify({ 
      translations,
      detected_language: detectedLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Translation error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function detectLanguage(text: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a language detection tool. Respond with a two-letter language code only (ISO 639-1), like "en", "fr", "es", etc.'
          },
          {
            role: 'user',
            content: `Detect the language of this text (respond with ISO 639-1 code only, no other words): "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const langCode = data.choices[0]?.message?.content.trim().toLowerCase();
    
    // Validate that it's a 2-letter language code
    if (langCode && /^[a-z]{2}$/.test(langCode)) {
      return langCode;
    } else {
      console.error('Invalid language code detected:', langCode);
      return 'en'; // Default to English if detection fails
    }
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English if detection fails
  }
}

async function translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    const sourceInfo = sourceLang ? `from ${sourceLang}` : '';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the text ${sourceInfo} to ${targetLang}. Only respond with the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.choices[0]?.message?.content.trim() || text;
  } catch (error) {
    console.error(`Translation error to ${targetLang}:`, error);
    return text; // Return original text if translation fails
  }
}
