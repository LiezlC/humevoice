import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface LaborGrievance {
  id: string;
  conversation_id?: string;
  language: string;
  transcript?: string;
  submitter_name?: string;
  submitter_contact?: string;
  incident_date?: string;
  incident_location?: string;
  people_involved?: string;
  category?: string;
  description: string;
  urgency?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
