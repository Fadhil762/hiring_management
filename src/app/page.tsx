"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useJobsStore } from '@/store/jobsStore';

export default function Home(){
  const { jobs, fetchJobs} = useJobsStore();
  useEffect(() => { fetchJobs();}, [fetchJobs]);
  
  const activeJobs = jobs.filter(j => j.status === 'active');
  
  return(
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Careers at Rakamin</h1>
            <p className="text-lg text-gray-600 mb-6">
              Join our team and help us build the future of hiring management. 
              We&apos;re looking for talented individuals who are passionate about technology and innovation.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700">
                {activeJobs.length}
              </span>
              <span>Open Position{activeJobs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-3">�</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Open Positions</h3>
            <p className="text-gray-600">Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => (
              <div 
                key={job.id} 
                className="bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {job.department && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{job.department}</span>
                          </div>
                        )}
                        
                        {job.salary_display && job.salary_display !== '—' && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-gray-900">{job.salary_display}</span>
                          </div>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Link 
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        View & Apply
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}