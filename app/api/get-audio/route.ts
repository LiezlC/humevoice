import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get chat_id from query parameters
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chat_id');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Missing chat_id parameter' },
        { status: 400 }
      );
    }

    // Get Hume API key from environment
    const humeApiKey = process.env.HUME_API_KEY;
    if (!humeApiKey) {
      console.error('HUME_API_KEY not set in environment');
      return NextResponse.json(
        { error: 'Server configuration error: HUME_API_KEY not set' },
        { status: 500 }
      );
    }

    // Call Hume's Audio Reconstruction API
    const humeUrl = `https://api.hume.ai/v0/evi/chats/${chatId}/audio`;

    console.log(`Fetching audio for chat_id: ${chatId}`);

    const response = await fetch(humeUrl, {
      method: 'GET',
      headers: {
        'X-Hume-Api-Key': humeApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hume API error (${response.status}):`, errorText);

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Audio recording not found for this conversation' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch audio from Hume API' },
        { status: response.status }
      );
    }

    // Hume returns a signed URL
    const data = await response.json();

    console.log(`✅ Successfully retrieved audio URL for chat_id: ${chatId}`);

    return NextResponse.json({
      audioUrl: data.url,
      expiresIn: '60 minutes'
    });

  } catch (error) {
    console.error('Error fetching audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
