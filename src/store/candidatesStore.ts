import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { CandidateAttr } from '@/lib/types';


type Row = { id: string; attributes: CandidateAttr[] };

type State = {
  rows: Row[];
  fetchByJob: (jobId: string) => Promise<void>;
};

export const useCandidatesStore = create<State>((set) => ({
  rows: [],
  fetchByJob: async (jobId) => {
    console.log('🔍 Fetching candidates for job:', jobId);
    
    const { data, error } = await supabase
      .from('candidates')
      .select('id, candidate_attributes (key,label,value,"order")')
      .eq('job_id', jobId);

    console.log('📊 Query result:', { data, error });

    if (error) {
      console.error('❌ Error fetching candidates:', error);
      return;
    }
    
    if (!data) {
      console.log('⚠️ No data returned from query');
      return;
    }

    type SupabaseCandidate = { id: string; candidate_attributes: CandidateAttr[] };
    const rows = (data as SupabaseCandidate[]).map((c) => {
      console.log('📝 Processing candidate:', c);
      return { id: c.id, attributes: c.candidate_attributes || [] };
    });
    
    console.log('✅ Final rows:', rows);
    set({ rows });
  },
}));