'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/lib/types';
import Link from 'next/link';

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('jobs').select('*').eq('slug', params.slug).single();
      setJob(data);
      setLoading(false);
    })();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500 font-medium">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 border border-gray-100 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Job Not Found</h1>
          <p className="text-gray-600 mb-6">This position may have been removed or the link is incorrect</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
            ← Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors">
          <span>←</span>
          <span>Back to all jobs</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-white">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
                  <span className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-green-300' : 'bg-yellow-300'}`}></span>
                  <span className="text-sm font-semibold capitalize">{job.status}</span>
                </div>
                
                <h1 className="text-4xl font-bold mb-3">{job.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4">
                  {job.department && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="text-xl">🏢</span>
                      <span className="font-semibold">{job.department}</span>
                    </div>
                  )}
                  {job.salary_display && job.salary_display !== '—' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="text-xl">💰</span>
                      <span className="font-semibold">{job.salary_display}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-3xl">💼</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Description */}
            {job.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>About This Role</span>
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </div>
            )}

            {/* Application Process */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>Application Process</span>
              </h3>
              <ol className="space-y-3">
                {[
                  'Click the "Apply Now" button below',
                  'Fill in your personal information',
                  'Take a professional profile photo with gesture detection',
                  'Review and submit your application',
                  'Our team will review and contact you soon'
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-blue-900">
                    <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {job.status === 'active' ? (
                <>
                  <Link
                    href={`/apply/${job.slug}`}
                    className="flex-1 text-center px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5"
                  >
                    🚀 Apply Now
                  </Link>
                  <Link
                    href="/"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors text-center"
                  >
                    View Other Jobs
                  </Link>
                </>
              ) : (
                <div className="flex-1 text-center px-8 py-4 bg-gray-200 text-gray-500 rounded-2xl font-bold text-lg cursor-not-allowed">
                  ⏸️ Applications Currently Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
