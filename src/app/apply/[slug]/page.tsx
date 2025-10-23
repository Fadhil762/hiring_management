'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { zodSchemaFromFields, visibleFields } from '@/lib/form';
import { useGestureDetection } from '@/hooks/useGestureDetection';
import type { Job, JobConfig, ApplicationField } from '@/lib/types';
import { use } from 'react';

export default function ApplyPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle both Promise and direct params for Next.js compatibility
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [job, setJob] = useState<Job | null>(null);
  const [fields, setFields] = useState<ApplicationField[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [autoCapture, setAutoCapture] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: job } = await supabase.from('jobs').select('*').eq('slug', resolvedParams.slug).single();
      setJob(job);
      if (!job) return;
      const { data: cfg } = await supabase.from('job_configs').select('config').eq('job_id', job.id).single();
      const config = (cfg?.config as JobConfig);
      const allFields = config.application_form.sections[0].fields;
      setFields(visibleFields(allFields));
    })();
  }, [resolvedParams.slug]);

  const schema = useMemo(() => zodSchemaFromFields(fields), [fields]);

  const { register, handleSubmit, setError, formState: { errors }, reset } = useForm<Record<string, unknown>>();

  type FormErrors = Record<string, { message?: string } | undefined>;

  // Webcam and gesture detection
  const webcamRef = useRef<Webcam | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const capture = useCallback(() => {
    const current = webcamRef.current;
    if (!current) {
      console.log('Webcam ref not available');
      return;
    }
    const shot = current.getScreenshot();
    if (shot) {
      console.log('Photo captured successfully!');
      setPhoto(shot);
    } else {
      console.log('Failed to capture screenshot');
    }
  }, []);

  const { fingerCount, isProcessing } = useGestureDetection(videoElement, autoCapture, capture);

  // Set video element when webcam is ready
  useEffect(() => {
    const checkVideo = () => {
      if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
        console.log('Video element ready, initializing gesture detection');
        setVideoElement(webcamRef.current.video);
      }
    };

    // Check immediately
    checkVideo();

    // Also check periodically in case video loads after component mount
    const interval = setInterval(checkVideo, 500);

    return () => clearInterval(interval);
  }, [autoCapture]); // Re-run when autoCapture changes

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (values: Record<string, unknown>) => {
    if (!job) return;
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate with Zod schema first
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = (issue.path || []).join('.') || '_root';
        setError(path as unknown as string, { type: issue.code, message: issue.message });
      });
      setSubmitting(false);
      return;
    }

    try {
      // create candidate
      const { data: cand, error: candErr } = await supabase.from('candidates').insert({ job_id: job.id }).select('id').single();
      if (candErr || !cand?.id) throw new Error('Failed creating candidate');

      const attrs = Object.entries(values).map(([key, value], i) => ({
        candidate_id: cand.id, key, label: key, value: String(value), order: i + 1
      }));
      // include photo_profile if exists
      if (photo) attrs.push({ candidate_id: cand.id, key: 'photo_profile', label: 'Photo', value: photo, order: 0 });
      // applied at
      attrs.push({ candidate_id: cand.id, key: 'applied_at', label: 'Applied At', value: new Date().toISOString(), order: 999 });

      const { error: attrErr } = await supabase.from('candidate_attributes').insert(attrs);
      if (attrErr) throw attrErr;

      setSuccessMessage('✅ Your application has been submitted successfully.');
      reset();
      setPhoto(null);
    } catch (err: unknown) {
      function errMessage(e: unknown): string {
        if (!e) return 'Submission failed';
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null && 'message' in e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (e as any).message ?? 'Submission failed';
        }
        return 'Submission failed';
      }
      setErrorMessage(errMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading application form...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-teal-100 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Job Application</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
          {job.department && (
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
              🏢 {job.department}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Photo Capture Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-teal-50/30 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">1</span>
              <h2 className="text-xl font-bold text-gray-900">Profile Photo</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1 ml-10">Capture your profile photo using our gesture detection feature</p>
          </div>
          
          <div className="p-6">
            {!photo ? (
              <div className="space-y-5">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                  <Webcam 
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg" 
                    className="w-full"
                    videoConstraints={{ 
                      width: 1280, 
                      height: 720, 
                      facingMode: 'user' 
                    }}
                    onUserMedia={() => {
                      console.log('Webcam ready');
                    }}
                    onUserMediaError={(error) => {
                      console.error('Webcam error:', error);
                    }}
                  />
                  {autoCapture && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-black/80 to-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg border border-white/10">
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                          <div>
                            <div className="text-sm font-bold">Capturing...</div>
                            <div className="text-xs text-green-200">Please wait</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                          <div>
                            <div className="text-sm font-bold">Detecting Gesture</div>
                            <div className="text-xs text-gray-200">{fingerCount} finger{fingerCount !== 1 ? 's' : ''} detected</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl flex-shrink-0">
                      💡
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 mb-1">Gesture Detection Guide</div>
                      <p className="text-sm text-blue-800">Enable auto-capture below, then show your fingers in this sequence: <strong>1 → 2 → 3</strong> to automatically capture your photo!</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={capture} 
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    📸 Capture Photo
                  </button>
                  <label className="inline-flex items-center gap-3 text-sm cursor-pointer bg-gray-50 px-5 py-3 rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all">
                    <input 
                      type="checkbox" 
                      checked={autoCapture} 
                      onChange={e=>setAutoCapture(e.target.checked)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="font-semibold text-gray-700">Enable Gesture Auto-Capture</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-teal-200">
                  <Image src={photo!} alt="preview" width={1280} height={720} className="w-full" unoptimized />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg flex items-center gap-2">
                    <span className="text-xl">✓</span> Photo Captured
                  </div>
                </div>
                <button 
                  onClick={() => setPhoto(null)} 
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Application Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-teal-50/30 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">2</span>
                <h2 className="text-xl font-bold text-gray-900">Application Information</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1 ml-10">Please fill in all required fields marked with <span className="text-red-500">*</span></p>
            </div>

            <div className="p-6 space-y-6">
              {successMessage && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-bold mb-1">Success!</div>
                    <div className="text-sm">{successMessage}</div>
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <div className="font-bold mb-1">Error</div>
                    <div className="text-sm">{errorMessage}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(f => (
                  <div key={f.key} className={`space-y-2 ${(() => {
                    const keyLower = f.key.toLowerCase();
                    return keyLower.includes('description') || keyLower.includes('bio') || keyLower.includes('cover') ? 'md:col-span-2' : '';
                  })()}`}>
                    <label className="text-sm font-bold text-gray-700">
                      {f.label ?? f.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {f.validation?.required && <span className="text-red-500">*</span>}
                    </label>
                    {(() => {
                      const fieldErr = (errors as FormErrors)[f.key];
                      const hasError = !!fieldErr?.message;
                      const base = 'w-full rounded-xl border-2 px-4 py-3 focus:outline-none focus:ring-2 transition-all';
                      const errorClass = hasError ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-teal-200 focus:border-teal-500';
                      const keyLower = f.key.toLowerCase();
                      const inputType = keyLower.includes('email') ? 'email' : keyLower.includes('phone') ? 'tel' : keyLower.includes('date') ? 'date' : keyLower.includes('linkedin') ? 'url' : 'text';

                      if (keyLower.includes('description') || keyLower.includes('bio') || keyLower.includes('cover')) {
                        return (
                          <>
                            <textarea {...register(f.key)} className={`${base} ${errorClass} resize-none`} rows={4} />
                            {hasError && <p className="text-sm text-red-600 font-medium flex items-center gap-1"><span>⚠️</span>{String(fieldErr?.message)}</p>}
                          </>
                        );
                      }

                      return (
                        <>
                          <input {...register(f.key)} type={inputType} className={`${base} ${errorClass}`} />
                          {hasError && <p className="text-sm text-red-600 font-medium flex items-center gap-1"><span>⚠️</span>{String(fieldErr?.message)}</p>}
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Submit Section */}
          <div className="flex items-center gap-4">
            <button 
              type="submit"
              disabled={submitting} 
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Submit Application
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => { reset(); setPhoto(null); setSuccessMessage(null); setErrorMessage(null); }} 
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
