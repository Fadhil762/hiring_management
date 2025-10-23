"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useJobsStore } from '@/store/jobsStore';

export default function Home(){
  const { jobs, fetchJobs} = useJobsStore();
  useEffect(() => { fetchJobs();}, [fetchJobs]);
  
  const activeJobs = jobs.filter(j => j.status === 'active');
  
  return(
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-teal-100 mb-8">Join our team and build your career with us</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-2xl">🎯</span>
              <span className="font-semibold">{activeJobs.length} Open Positions Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Open Positions Yet</h3>
            <p className="text-gray-600">Check back soon for exciting opportunities!</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Open Positions</h2>
              <p className="text-gray-600">Explore opportunities and apply to your perfect role</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeJobs.map(job => (
                <Link 
                  key={job.id} 
                  href={`/jobs/${job.slug}`} 
                  className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-400 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💼</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                      ✅ Active
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {job.title}
                  </h3>

                  {job.department && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>🏢</span>
                      <span className="font-medium">{job.department}</span>
                    </div>
                  )}

                  {job.salary_display && job.salary_display !== '—' && (
                    <div className="flex items-center gap-2 mb-4 text-teal-700 font-semibold">
                      <span>💰</span>
                      <span>{job.salary_display}</span>
                    </div>
                  )}

                  {job.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {job.description}
                    </p>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-teal-600 font-semibold group-hover:text-teal-700 transition-colors">
                      <span>View Details</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}