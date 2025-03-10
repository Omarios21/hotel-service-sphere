
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

// Setup OpenAI configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''

interface RequestBody {
  text: string;
  sourceLang?: string;
  targetLangs: string[];
}

interface TranslationResponse {
  translations: Record<string, string>;
  detectedLanguage?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false },
      }
    )

    // Verify request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const requestData: RequestBody = await req.json()
    const { text, sourceLang, targetLangs } = requestData

    if (!text || !targetLangs || targetLangs.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get available languages
    const { data: langSettings, error: langError } = await supabase
      .from('language_settings')
      .select('*')
      .eq('enabled', true)

    if (langError) {
      console.error('Error fetching language settings:', langError)
      return new Response(JSON.stringify({ error: 'Error fetching language settings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Filter requested target languages to only use enabled ones
    const enabledCodes = langSettings?.map(lang => lang.code) || []
    const validTargetLangs = targetLangs.filter(code => enabledCodes.includes(code))

    if (validTargetLangs.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid target languages provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use a lightweight model for translations
    const model = "gpt-3.5-turbo"

    // Detect language if not provided
    let detectedLanguage = sourceLang
    if (!detectedLanguage) {
      const detectResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a language detection tool. Respond only with the ISO language code of the text. For example: 'en', 'fr', 'es', etc."
            },
            {
              role: "user",
              content: `Detect the language of this text: "${text}"`
            }
          ],
          temperature: 0.1,
        })
      })

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json()
        console.error('OpenAI detection API error:', errorData)
        return new Response(JSON.stringify({ error: 'Language detection failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const detectData = await detectResponse.json()
      detectedLanguage = detectData.choices[0].message.content.trim().toLowerCase()
      
      // Remove quotes if present
      if (detectedLanguage.startsWith('"') && detectedLanguage.endsWith('"')) {
        detectedLanguage = detectedLanguage.slice(1, -1)
      }
      
      console.log(`Detected language: ${detectedLanguage}`)
    }

    // Skip translation if target language is the same as source
    const translationsNeeded = validTargetLangs.filter(lang => lang !== detectedLanguage)
    
    // Initialize translations object with original text for the source language
    const translations: Record<string, string> = {}
    if (detectedLanguage) {
      translations[detectedLanguage] = text
    }

    // If there are languages to translate to
    if (translationsNeeded.length > 0) {
      const translationPrompt = `Translate the following text from ${detectedLanguage} to these languages: ${translationsNeeded.join(', ')}. 
      Format: Provide only a JSON object with language codes as keys and translations as values.
      Text to translate: "${text}"`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a translation tool. Respond ONLY with a valid JSON object containing the translations, nothing else."
            },
            {
              role: "user",
              content: translationPrompt
            }
          ],
          temperature: 0.1,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OpenAI API error:', errorData)
        return new Response(JSON.stringify({ error: 'Translation failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const data = await response.json()
      const translationResponse = data.choices[0].message.content
      
      try {
        // Extract JSON if it's wrapped in code blocks
        let jsonStr = translationResponse
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim()
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim()
        }
        
        const translationResult = JSON.parse(jsonStr)
        
        // Merge results
        Object.assign(translations, translationResult)
      } catch (error) {
        console.error('Error parsing translation response:', error, translationResponse)
        return new Response(JSON.stringify({ 
          error: 'Error parsing translation response',
          raw: translationResponse
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Return the translations
    const result: TranslationResponse = {
      translations,
      detectedLanguage
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
