import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to extract structured fields from grievance transcripts
 * Called automatically after each voice conversation ends
 */
export async function POST(request: NextRequest) {
  try {
    const { grievanceId } = await request.json();

    if (!grievanceId) {
      return NextResponse.json(
        { error: 'Missing grievanceId' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not set');
      return NextResponse.json(
        { error: 'Server configuration error: ANTHROPIC_API_KEY not set' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase credentials not set');
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials not set' },
        { status: 500 }
      );
    }

    // Initialize clients
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log(`🔍 Extracting fields for grievance ${grievanceId}`);

    // Fetch the grievance record
    const { data: grievance, error: fetchError } = await supabase
      .from('labor_grievances')
      .select('*')
      .eq('id', grievanceId)
      .single();

    if (fetchError || !grievance) {
      console.error('❌ Failed to fetch grievance:', fetchError);
      return NextResponse.json(
        { error: 'Grievance not found' },
        { status: 404 }
      );
    }

    // Check if already processed (check submitter_name as indicator)
    if (grievance.submitter_name) {
      console.log('⊘ Already processed, skipping');
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Grievance already processed'
      });
    }

    // Use English transcript if available and valid, otherwise use original language
    let transcript = grievance.transcript_en;

    // If translation failed or doesn't exist, use original transcript
    // Claude can analyze Portuguese, Swahili, Afrikaans directly - no translation needed!
    if (!transcript || transcript.includes('[Translation failed]') || transcript.includes('Translation unavailable')) {
      transcript = grievance.transcript;
      console.log('ℹ Using original language transcript (translation not available)');
    }

    if (!transcript || transcript.length < 10) {
      console.error('❌ No valid transcript found');
      return NextResponse.json(
        { error: 'No valid transcript to process' },
        { status: 400 }
      );
    }

    console.log(`📝 Processing transcript (${transcript.length} chars, language: ${grievance.language})`);

    // Extract fields using Claude
    const prompt = `You are analyzing a labor grievance transcript. Extract the following information and return it as valid JSON.

Return a JSON object with these exact fields:
- submitter_name: The worker's name if provided, otherwise null
- submitter_contact: Email or phone number if provided, otherwise null
- incident_date: When the issue started (e.g., 'Early March 2024', 'August 2024', '6 weeks ago'), otherwise null
- incident_location: Specific location/department (e.g., 'Processing Plant B, Palma district', 'Security sector'), otherwise null
- people_involved: Names of supervisors/managers mentioned (e.g., 'Supervisor Carlos', 'Roberto, Operations Manager'), otherwise null
- category: One of: wages, hours, safety, discrimination, harassment, contracts, discipline, union, conditions, training, other
- description: 2-3 sentence summary in English of the main issue
- urgency: One of: high, medium, low (based on severity and immediacy)

CRITICAL: Return ONLY the JSON object, no explanation, no other text whatsoever. Start your response with { and end with }.

Transcript (Language: ${grievance.language}):
${transcript}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'assistant',
          content: '{'
        }
      ]
    });

    // Extract JSON from response
    const firstContent = message.content[0];
    if (firstContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }
    const responseText = firstContent.text;

    // Since we prefilled with '{', we need to add it back
    let jsonText = '{' + responseText.trim();

    // Try to parse JSON (handle potential markdown code blocks or extra text)
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    // Extract JSON object if there's surrounding text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const extracted = JSON.parse(jsonText);

    console.log('✓ Extracted fields:', JSON.stringify(extracted, null, 2));

    // Update database
    const { error: updateError } = await supabase
      .from('labor_grievances')
      .update({
        submitter_name: extracted.submitter_name,
        submitter_contact: extracted.submitter_contact,
        incident_date: extracted.incident_date,
        incident_location: extracted.incident_location,
        people_involved: extracted.people_involved,
        category: extracted.category,
        urgency: extracted.urgency,
        description: extracted.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', grievanceId);

    if (updateError) {
      console.error('✗ Database update failed:', updateError.message);
      return NextResponse.json(
        { error: 'Failed to update database', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Database updated successfully');

    return NextResponse.json({
      success: true,
      extracted
    });

  } catch (error: any) {
    console.error('❌ Field extraction error:', error);
    return NextResponse.json(
      { error: 'Field extraction failed', details: error.message },
      { status: 500 }
    );
  }
}
