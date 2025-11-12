#!/usr/bin/env node
/**
 * Extract structured data from labor grievance transcripts
 * Uses Claude API to parse transcripts and populate database fields
 *
 * Usage: node extract-grievance-fields.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin access
);

/**
 * Extract structured fields from transcript using Claude
 */
async function extractFields(transcript, language) {
  const prompt = `You are analyzing a labor grievance transcript. Extract the following information and return it as valid JSON:

{
  "submitter_name": "The worker's name if provided, otherwise null",
  "submitter_contact": "Email or phone number if provided, otherwise null",
  "incident_date": "When the issue started (e.g., 'Early March 2024', 'August 2024', '6 weeks ago'), otherwise null",
  "incident_location": "Specific location/department (e.g., 'Processing Plant B, Palma district', 'Security sector'), otherwise null",
  "people_involved": "Names of supervisors/managers mentioned (e.g., 'Supervisor Carlos', 'Roberto, Operations Manager'), otherwise null",
  "category": "One of: wages, overtime, safety, discrimination, harassment, working_conditions, other",
  "description": "2-3 sentence summary in English of the main issue"
}

IMPORTANT: 
- Return ONLY valid JSON, no other text
- Use null for missing information, not empty strings
- Description should be concise and factual
- Category must be one of the specified options

Transcript (Language: ${language}):
${transcript}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;
    
    // Try to parse JSON (handle potential markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }
    
    const extracted = JSON.parse(jsonText);
    
    console.log('✓ Extracted fields:', JSON.stringify(extracted, null, 2));
    return extracted;
    
  } catch (error) {
    console.error('✗ Error extracting fields:', error.message);
    return null;
  }
}

/**
 * Process a single grievance record
 */
async function processGrievance(grievance) {
  console.log(`\nProcessing grievance ${grievance.id}...`);
  console.log(`Language: ${grievance.language}`);
  console.log(`Created: ${grievance.created_at}`);
  
  // Check if already processed
  if (grievance.submitter_name || grievance.category) {
    console.log('⊘ Already processed, skipping');
    return { success: true, skipped: true };
  }
  
  // Extract fields
  const extracted = await extractFields(grievance.transcript, grievance.language);
  
  if (!extracted) {
    return { success: false, error: 'Extraction failed' };
  }
  
  // Update database
  try {
    const { error } = await supabase
      .from('labor_grievances')
      .update({
        submitter_name: extracted.submitter_name,
        submitter_contact: extracted.submitter_contact,
        incident_date: extracted.incident_date,
        incident_location: extracted.incident_location,
        people_involved: extracted.people_involved,
        category: extracted.category,
        description: extracted.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', grievance.id);
    
    if (error) {
      console.error('✗ Database update failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✓ Database updated successfully');
    return { success: true, extracted };
    
  } catch (error) {
    console.error('✗ Database update failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Labor Grievance Field Extractor');
  console.log('='.repeat(60));
  
  // Check environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('✗ ANTHROPIC_API_KEY not set');
    process.exit(1);
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('✗ Supabase credentials not set');
    process.exit(1);
  }
  
  console.log('✓ Environment configured');
  console.log();
  
  // Fetch unprocessed grievances
  console.log('Fetching grievances from database...');
  
  const { data: grievances, error } = await supabase
    .from('labor_grievances')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('✗ Failed to fetch grievances:', error.message);
    process.exit(1);
  }
  
  if (!grievances || grievances.length === 0) {
    console.log('⊘ No grievances found');
    process.exit(0);
  }
  
  console.log(`✓ Found ${grievances.length} grievance(s)`);
  
  // Process each grievance
  const results = {
    total: grievances.length,
    processed: 0,
    skipped: 0,
    failed: 0
  };
  
  for (const grievance of grievances) {
    const result = await processGrievance(grievance);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.success) {
      results.processed++;
    } else {
      results.failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('Summary:');
  console.log(`  Total grievances: ${results.total}`);
  console.log(`  Processed: ${results.processed}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  Failed: ${results.failed}`);
  console.log('='.repeat(60));
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
