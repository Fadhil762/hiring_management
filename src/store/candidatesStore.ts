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
    console.log('🔍 Fetching applications for job:', jobId);
    
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId);

    console.log('📊 Query result:', { data, error });

    if (error) {
      console.error('❌ Error fetching applications:', error);
      return;
    }
    
    if (!data) {
      console.log('⚠️ No data returned from query');
      return;
    }

    // Transform flat application data into attributes format for table display
    const rows = data.map((app) => {
      const attributes: CandidateAttr[] = [
        { key: 'photo', label: 'Photo Profile', value: app.profile_picture || '', order: 0 },
        { key: 'full_name', label: 'Full Name', value: app.full_name || '', order: 1 },
        { key: 'gender', label: 'Gender', value: app.gender || '', order: 2 },
        { key: 'domicile', label: 'Domicile', value: app.domicile || '', order: 3 },
        { key: 'phone', label: 'Phone', value: app.phone || '', order: 4 },
        { key: 'email', label: 'Email', value: app.email || '', order: 5 },
        { key: 'linkedin', label: 'LinkedIn', value: app.linkedin || '', order: 6 },
      ];
      
      console.log('📝 Processing application:', app);
      return { id: app.id, attributes };
    });
    
    console.log('✅ Final rows:', rows);
    set({ rows });
  },
}));