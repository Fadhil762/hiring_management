import Link from 'next/link';
import type { Job } from '@/lib/types';

export default function JobCard({ job }: { job: Job }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const statusIcons = {
    active: '✅',
    inactive: '⏸️',
    draft: '📝',
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-300 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {job.department && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                <span>🏢</span>
                {job.department}
              </span>
            )}
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[job.status]}`}>
          <span>{statusIcons[job.status]}</span>
          <span className="capitalize">{job.status}</span>
        </div>
      </div>

      {job.salary_display && job.salary_display !== '—' && (
        <div className="flex items-center gap-2 mb-4 text-teal-700 font-semibold text-lg">
          <span>💰</span>
          <span>{job.salary_display}</span>
        </div>
      )}

      {job.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Link 
          href={`/admin/jobs/${job.id}/candidate`} 
          className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-sm hover:shadow-md"
        >
          👥 Manage Candidates
        </Link>
      </div>
    </div>
  );
}
