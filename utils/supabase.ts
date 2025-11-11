import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = 'wages' | 'hours' | 'safety' | 'discrimination' | 'contracts' | 'discipline' | 'union' | 'conditions' | 'training' | 'other';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'new' | 'in_progress' | 'resolved' | 'closed';
export type Language = 'en' | 'af' | 'pt' | 'sw';

export interface LaborGrievance {
  id?: string;
  conversation_id?: string;
  language: Language;
  transcript?: string;
  transcript_en?: string; // English translation of transcript for analysis
  submitter_name?: string;
  submitter_contact?: string;
  incident_date?: string;
  incident_location?: string;
  people_involved?: string;
  category?: Category;
  description: string;
  urgency?: Urgency;
  status?: Status;
  created_at?: string;
  updated_at?: string;
}

export async function saveLaborGrievance(grievance: LaborGrievance) {
  const { data, error } = await supabase
    .from('labor_grievances')
    .insert([grievance])
    .select();

  if (error) {
    console.error('Error saving grievance:', error);
    throw error;
  }

  return data;
}

export async function updateLaborGrievance(id: string, updates: Partial<LaborGrievance>) {
  const { data, error } = await supabase
    .from('labor_grievances')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating grievance:', error);
    throw error;
  }

  return data;
}
