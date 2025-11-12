import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint for saving individual grievance fields in real-time during conversation
 * Called by Hume EVI tool use handlers
 */
export async function POST(request: NextRequest) {
  try {
    const { grievanceId, fieldName, fieldValue } = await request.json();

    if (!grievanceId || !fieldName || fieldValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: grievanceId, fieldName, fieldValue' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase credentials not set');
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials not set' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log(`📝 Saving field "${fieldName}" for grievance ${grievanceId}`);
    console.log(`   Value: ${fieldValue}`);

    // Validate field name to prevent SQL injection
    const allowedFields = [
      'submitter_name',
      'submitter_contact',
      'incident_date',
      'incident_location',
      'people_involved',
      'category',
      'urgency',
      'description'
    ];

    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json(
        { error: `Invalid field name: ${fieldName}` },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      [fieldName]: fieldValue,
      updated_at: new Date().toISOString()
    };

    // Update the specific field
    const { data, error: updateError } = await supabase
      .from('labor_grievances')
      .update(updateData)
      .eq('id', grievanceId)
      .select();

    if (updateError) {
      console.error('❌ Database update failed:', updateError.message);
      return NextResponse.json(
        {
          error: 'Failed to update database',
          details: updateError.message,
          success: false
        },
        { status: 500 }
      );
    }

    console.log(`✅ Field "${fieldName}" saved successfully`);

    return NextResponse.json({
      success: true,
      fieldName,
      fieldValue,
      message: `Saved ${fieldName} successfully`
    });

  } catch (error: any) {
    console.error('❌ Save field error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save field',
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
