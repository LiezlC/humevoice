import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage } = await request.json();

    if (!text || !sourceLanguage) {
      return NextResponse.json(
        { error: 'Missing text or sourceLanguage' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set - skipping translation');
      return NextResponse.json({
        translatedText: `[Translation unavailable - Original ${sourceLanguage} text]\n\n${text}`
      });
    }

    const languageNames: { [key: string]: string } = {
      pt: 'Portuguese',
      af: 'Afrikaans',
      sw: 'Swahili'
    };

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
            content: `You are a professional translator. Translate the following text from ${languageNames[sourceLanguage] || sourceLanguage} to English. Maintain the conversational format with "User:" and "Agent:" labels. Keep the meaning accurate and natural.`
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
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content;

    if (!translatedText) {
      throw new Error('No translation returned from API');
    }

    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    const { text, sourceLanguage } = await request.json();
    return NextResponse.json({
      translatedText: `[Translation failed - Original ${sourceLanguage} text]\n\n${text}`
    });
  }
}
