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
    const { data, error } = await supabase
      .from('candidates')
      .select('id, candidate_attributes (key,label,value,"order")')
      .eq('job_id', jobId);

    if (error || !data) return;

    type SupabaseCandidate = { id: string; candidate_attributes: CandidateAttr[] };
    const rows = (data as SupabaseCandidate[]).map((c) => ({ id: c.id, attributes: c.candidate_attributes }));
    set({ rows });
  },
}));