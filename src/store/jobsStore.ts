import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { Job, JobConfig } from '@/lib/types';

type JobsState = {
  jobs: Job[];
  currentConfig: Record<string, JobConfig>;
  loading: boolean;
  fetchJobs: () => Promise<void>;
  fetchJobConfig: (jobId: string) => Promise<JobConfig | null>;
};

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  currentConfig: {},
  loading: false,
  fetchJobs: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error && data) set({ jobs: data });
    set({ loading: false });
  },
  fetchJobConfig: async (jobId) => {
    const { data, error } = await supabase.from('job_configs').select('config').eq('job_id', jobId).single();
    if (error || !data) return null;
    const cfg = data.config as JobConfig;
    set((s) => ({ currentConfig: { ...s.currentConfig, [jobId]: cfg } }));
    return cfg;
  },
}));