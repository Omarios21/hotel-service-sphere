
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text, sourceLanguage, targetLanguages } = await req.json();
    
    if (!text || !targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating from ${sourceLanguage} to ${targetLanguages.join(', ')}`);
    
    const prompt = `
You are a professional translator. Please translate the following text from ${sourceLanguage || "the detected language"} to the requested languages. 
Return a JSON object with language codes as keys and translations as values.

Text to translate: "${text}"

Translate to the following languages:
${targetLanguages.map(lang => `- ${lang}`).join('\n')}

Format your response as a valid JSON object like this:
{
  "en": "English translation",
  "fr": "French translation",
  ...
}
Only return the JSON object, nothing else.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional translator that only returns valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Translation service error', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    let translations = {};
    
    try {
      // Try to parse the content as JSON directly
      const content = data.choices[0].message.content.trim();
      translations = JSON.parse(content);
      console.log('Parsed translations:', Object.keys(translations));
    } catch (parseError) {
      console.error('Failed to parse translation JSON:', parseError);
      // If direct parsing fails, try to extract JSON from the response
      const match = data.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          translations = JSON.parse(match[0]);
          console.log('Extracted translations:', Object.keys(translations));
        } catch (extractError) {
          console.error('Failed to extract JSON:', extractError);
          return new Response(
            JSON.stringify({ error: 'Failed to parse translation response' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'No valid JSON found in translation response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
