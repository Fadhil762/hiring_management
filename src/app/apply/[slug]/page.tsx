'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import type { Job } from '@/lib/types';
import { use } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WebcamCapture to avoid SSR issues
const WebcamCapture = dynamic(() => import('@/components/WebcamCapture'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading camera...</div>
});

export default function ApplyPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [job, setJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    (async () => {
      const { data: job } = await supabase.from('jobs').select('*').eq('slug', resolvedParams.slug).single();
      setJob(job);
    })();
  }, [resolvedParams.slug]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamCapture = (imageData: string) => {
    // Convert base64 to file
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
        setPhotoPreview(imageData);
      });
  };

  const onSubmit = async (data: Record<string, string>) => {
    if (!job) return;

    setSubmitting(true);

    try {
      let profilePicture = null;
      
      // Upload photo if provided
      if (photoFile) {
        const fileName = `${Date.now()}_${photoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('candidate-photos')
          .upload(fileName, photoFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('candidate-photos')
            .getPublicUrl(fileName);
          profilePicture = urlData.publicUrl;
        }
      }

      // Insert application directly into applications table
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone_number,
          gender: data.gender,
          linkedin: data.linkedin_link,
          domicile: data.domicile,
          profile_picture: profilePicture,
        });

      if (applicationError) throw applicationError;

      setShowSuccess(true);
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <span className="text-8xl">🎉</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎉 Your application was sent!
          </h2>
          <p className="text-gray-600 mb-2">
            Congratulations! You&apos;ve taken the first step towards a rewarding career at Rakamin.
          </p>
          <p className="text-gray-600 mb-6">
            We look forward to learning more about you during the application process.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Apply {job.title} at Rakamin</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <span className="text-red-600 text-sm">* Required</span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Photo Profile
            </label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Preview" width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-teal-300 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Take Picture</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Upload a file or use your webcam with auto-gesture capture ✋
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <span className="text-red-600 text-sm font-medium">Required</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name*
            </label>
            <input
              {...register('full_name', { required: 'This field is required' })}
              type="text"
              placeholder="Enter your full name"
              className={`w-full px-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400`}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pronoun (gender)*
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  {...register('gender', { required: 'This field is required' })}
                  type="radio"
                  value="She/her (Female)"
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">She/her (Female)</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  {...register('gender', { required: 'This field is required' })}
                  type="radio"
                  value="He/him (Male)"
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">He/him (Male)</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domicile*
            </label>
            <select
              {...register('domicile', { required: 'This field is required' })}
              className={`w-full px-3 py-2 border ${errors.domicile ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900`}
            >
              <option value="">Choose your domicile</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Medan">Medan</option>
              <option value="Semarang">Semarang</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number*
            </label>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white w-24 text-gray-900">
                <option value="+62">🇮🇩 +62</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input
                {...register('phone_number', { required: 'This field is required' })}
                type="tel"
                placeholder="81XXXXXXXXX"
                className={`flex-1 px-3 py-2 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400`}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              {...register('email', { 
                required: 'This field is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter your email in the format: name@example.com'
                }
              })}
              type="email"
              placeholder="Enter your email address"
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{String(errors.email.message)}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Linkedin*
            </label>
            <input
              {...register('linkedin_link', { required: 'This field is required' })}
              type="url"
              placeholder="https://linkedin.com/in/username"
              className={`w-full px-3 py-2 border ${errors.linkedin_link ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400`}
            />
            {errors.linkedin_link && (
              <p className="text-xs text-gray-500 mt-1">Please copy paste your Linkedin URL, example: https://www.linkedin.com/in/username</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Webcam Modal */}
      {showWebcam && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
}
