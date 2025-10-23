'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import Image from 'next/image';
import Link from 'next/link';
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/jobs/${resolvedParams.slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to job</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
          {job.department && (
            <p className="text-gray-600 mt-1">{job.department}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Photo Capture Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
            <p className="text-sm text-gray-600 mt-1">Take a professional photo for your application</p>
          </div>
          
          <div className="p-6">
            {!photo ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
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
                    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                      {isProcessing ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span>Capturing...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span>{fingerCount} finger{fingerCount !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-blue-900">
                    <strong>Tip:</strong> Enable gesture detection and show 1 → 2 → 3 fingers to auto-capture
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button 
                    onClick={capture} 
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture Photo
                  </button>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoCapture} 
                      onChange={e=>setAutoCapture(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Enable gesture auto-capture</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border-2 border-teal-200">
                  <Image src={photo!} alt="preview" width={1280} height={720} className="w-full" unoptimized />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Photo captured
                  </div>
                </div>
                <button 
                  onClick={() => setPhoto(null)} 
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Photo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Application Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Application Information</h2>
              <p className="text-sm text-gray-600 mt-1">Please fill in all required fields marked with <span className="text-red-600">*</span></p>
            </div>

            <div className="p-6">
              {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-green-900 mb-1">Success!</div>
                    <div className="text-sm text-green-800">{successMessage}</div>
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-red-900 mb-1">Error</div>
                    <div className="text-sm text-red-800">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Group fields by section */}
              {(() => {
                const personalFields = fields.filter(f => ['full_name', 'email', 'phone_number', 'date_of_birth', 'gender', 'domicile'].includes(f.key));
                const professionalFields = fields.filter(f => ['linkedin_link', 'portfolio_link', 'resume_link'].includes(f.key));
                const additionalFields = fields.filter(f => ['expected_salary', 'available_start_date', 'cover_letter'].includes(f.key));
                const otherFields = fields.filter(f => 
                  !['full_name', 'email', 'phone_number', 'date_of_birth', 'gender', 'domicile', 
                     'linkedin_link', 'portfolio_link', 'resume_link', 
                     'expected_salary', 'available_start_date', 'cover_letter'].includes(f.key)
                );

                const renderField = (f: typeof fields[0]) => {
                  const fieldErr = (errors as FormErrors)[f.key];
                  const hasError = !!fieldErr?.message;
                  const base = 'w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors text-gray-900 bg-white placeholder:text-gray-400';
                  const errorClass = hasError ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-gray-300 focus:ring-teal-100 focus:border-teal-500';
                  const keyLower = f.key.toLowerCase();
                  
                  let inputType = 'text';
                  if (keyLower.includes('email')) inputType = 'email';
                  else if (keyLower.includes('phone')) inputType = 'tel';
                  else if (keyLower.includes('date') || keyLower === 'available_start_date') inputType = 'date';
                  else if (keyLower.includes('link') || keyLower.includes('url')) inputType = 'url';
                  else if (keyLower.includes('salary')) inputType = 'number';

                  const isTextarea = keyLower.includes('cover_letter') || keyLower.includes('description') || keyLower.includes('bio');
                  const isFullWidth = isTextarea;

                  return (
                    <div key={f.key} className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}>
                      <label className="text-sm font-semibold text-gray-700">
                        {f.label ?? f.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        {f.validation?.required && <span className="text-red-600"> *</span>}
                      </label>
                      {isTextarea ? (
                        <textarea 
                          {...register(f.key)} 
                          className={`${base} ${errorClass} resize-none`} 
                          rows={4} 
                          placeholder={`Enter your ${f.label ?? f.key.replace(/_/g, ' ')}`} 
                        />
                      ) : (
                        <input 
                          {...register(f.key)} 
                          type={inputType} 
                          className={`${base} ${errorClass}`} 
                          placeholder={`Enter your ${f.label ?? f.key.replace(/_/g, ' ')}`} 
                        />
                      )}
                      {hasError && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {String(fieldErr?.message)}
                        </p>
                      )}
                    </div>
                  );
                };

                return (
                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    {personalFields.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {personalFields.map(renderField)}
                        </div>
                      </div>
                    )}

                    {/* Professional Information Section */}
                    {professionalFields.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {professionalFields.map(renderField)}
                        </div>
                      </div>
                    )}

                    {/* Additional Information Section */}
                    {additionalFields.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {additionalFields.map(renderField)}
                        </div>
                      </div>
                    )}

                    {/* Other Fields (if any custom fields exist) */}
                    {otherFields.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Additional Requirements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {otherFields.map(renderField)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              type="submit"
              disabled={submitting} 
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Submit Application</span>
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => { reset(); setPhoto(null); setSuccessMessage(null); setErrorMessage(null); }} 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
