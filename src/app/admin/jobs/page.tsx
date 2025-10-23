"use client";
import { useEffect, useState, useMemo } from 'react';
import { useJobsStore } from '@/store/jobsStore';
import JobList from '@/components/JobList';
import CreateJobModal from '@/components/CreateJobModal';

export default function AdminJobsPage() {
  const { jobs, fetchJobs } = useJobsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'|'draft'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest'|'oldest'|'title-asc'|'title-desc'>('newest');

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const departments = Array.from(new Set(jobs.map(j => j.department).filter(Boolean))) as string[];

  const filteredJobs = useMemo(() => {
    let out = jobs.slice();
    if (statusFilter !== 'all') out = out.filter(j => j.status === statusFilter);
    if (departmentFilter !== 'all') out = out.filter(j => j.department === departmentFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(j => (j.title || '').toLowerCase().includes(q) || (j.department || '').toLowerCase().includes(q));
    }
    if (sortBy === 'newest') out.sort((a,b) => (b.title || '').localeCompare(a.title || ''));
    if (sortBy === 'oldest') out.sort((a,b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'title-asc') out.sort((a,b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'title-desc') out.sort((a,b) => (b.title || '').localeCompare(a.title || ''));
    return out;
  }, [jobs, statusFilter, departmentFilter, query, sortBy]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Vacancies</h1>
              <p className="text-gray-600">Manage and track all job postings</p>
            </div>
            <button 
              onClick={() => setShowCreate(true)} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5"
            >
              <span className="text-xl">+</span>
              Create New Job
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{jobs.length}</div>
              <div className="text-sm text-blue-600 font-medium">Total Jobs</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{jobs.filter(j => j.status === 'active').length}</div>
              <div className="text-sm text-green-600 font-medium">Active</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{jobs.filter(j => j.status === 'draft').length}</div>
              <div className="text-sm text-yellow-600 font-medium">Draft</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{jobs.filter(j => j.status === 'inactive').length}</div>
              <div className="text-sm text-gray-600 font-medium">Inactive</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                  placeholder="🔍 Search jobs by title or department..." 
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-shadow"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setStatusFilter(e.target.value as 'all'|'active'|'inactive'|'draft')} 
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm font-medium text-gray-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">⏸️ Inactive</option>
              <option value="draft">📝 Draft</option>
            </select>

            {/* Department Filter */}
            <select 
              value={departmentFilter} 
              onChange={e=>setDepartmentFilter(e.target.value)} 
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm font-medium text-gray-700 bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(d=> <option key={d} value={d}>🏢 {d}</option>)}
            </select>

            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setSortBy(e.target.value as 'newest'|'oldest'|'title-asc'|'title-desc')} 
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm font-medium text-gray-700 bg-white"
            >
              <option value="newest">🆕 Newest First</option>
              <option value="oldest">🕐 Oldest First</option>
              <option value="title-asc">🔤 A → Z</option>
              <option value="title-desc">🔤 Z → A</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or create a new job posting</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              <span className="text-xl">+</span>
              Create First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </p>
            </div>
            <JobList jobs={filteredJobs} />
          </div>
        )}
      </div>

      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onCreated={fetchJobs} />}
    </main>
  );
}
