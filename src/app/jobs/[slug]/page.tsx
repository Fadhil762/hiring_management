'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/lib/types';
import Link from 'next/link';
import { use } from 'react';

export default function JobDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle both Promise and direct params for Next.js compatibility
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log('Looking for job with slug:', resolvedParams.slug);
        const { data, error: dbError } = await supabase
          .from('jobs')
          .select('*')
          .eq('slug', resolvedParams.slug)
          .single();
        
        if (dbError) {
          console.error('Database error:', dbError);
          setError(dbError.message);
        }
        
        console.log('Found job:', data);
        setJob(data);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-600">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <div className="text-5xl mb-3">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">This position may have been removed or the link is incorrect</p>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors mb-6">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to all jobs</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {job.department && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{job.department}</span>
                    </div>
                  )}
                  {job.salary_display && job.salary_display !== '—' && (
                    <div className="flex items-center gap-1.5 text-gray-900">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">{job.salary_display}</span>
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                    <span className="capitalize">{job.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            {job.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this role</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            )}

            {/* Apply CTA */}
            <div className="pt-6 border-t border-gray-200">
              {job.status === 'active' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/apply/${job.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Apply for this position
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    View other jobs
                  </Link>
                </div>
              ) : (
                <div className="text-center px-6 py-4 bg-gray-100 text-gray-600 font-medium rounded-lg">
                  Applications for this position are currently closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
