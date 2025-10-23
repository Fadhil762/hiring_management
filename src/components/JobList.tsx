import JobCard from './JobCard';
import type { Job } from '@/lib/types';

export default function JobList({ jobs }: { jobs: Job[] }){
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {jobs.map(j=> <JobCard key={j.id} job={j} />)}
    </div>
  );
}
