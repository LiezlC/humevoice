/**
 * Translates Portuguese text to English for analysis purposes
 * Using OpenAI API for high-quality translation
 */

export async function translateToEnglish(text: string, sourceLanguage: 'pt' | 'af' | 'sw'): Promise<string> {
  // Check if we have OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set - skipping translation');
    return `[Translation unavailable - Original ${sourceLanguage} text]\n\n${text}`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${getLanguageName(sourceLanguage)} to English. Maintain the conversational format with "User:" and "Agent:" labels. Keep the meaning accurate and natural.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content;

    if (!translatedText) {
      throw new Error('No translation returned from API');
    }

    return translatedText;

  } catch (error) {
    console.error('Translation error:', error);
    // Return original with note if translation fails
    return `[Translation failed - Original ${sourceLanguage} text]\n\n${text}`;
  }
}

function getLanguageName(code: string): string {
  const names: { [key: string]: string } = {
    pt: 'Portuguese',
    af: 'Afrikaans',
    sw: 'Swahili'
  };
  return names[code] || code;
}
