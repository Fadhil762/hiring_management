"use client";

import { useEffect } from 'react';
import { useCandidatesStore } from '@/store/candidatesStore';
import CandidatesTable from '@/components/CandidatesTable';
import Link from 'next/link';
import { use } from 'react';

export default function CandidatePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
	// Handle both Promise and direct params for Next.js 16 compatibility
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const { rows, fetchByJob } = useCandidatesStore();

	useEffect(() => { 
		console.log('🎯 Candidate page mounted with job ID:', resolvedParams.id);
		fetchByJob(resolvedParams.id); 
	}, [resolvedParams.id, fetchByJob]);

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/20 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
				{/* Header */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<Link href="/admin/jobs" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-3 transition-colors">
								<span>←</span>
								<span>Back to Jobs</span>
							</Link>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Management</h1>
							<p className="text-gray-600">Review and manage all applications for this position</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="px-4 py-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
								<div className="text-2xl font-bold text-teal-700">{rows.length}</div>
								<div className="text-xs text-teal-600 font-medium">Total Applications</div>
							</div>
						</div>
					</div>
				</div>

				{/* Table Container */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<CandidatesTable rows={rows} />
				</div>
			</div>
		</main>
	);
}
