'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAdmin ? '/admin/jobs' : '/'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-gray-900">Rakamin</div>
              <div className="text-xs text-gray-500 -mt-1">Hiring Management</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/jobs"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/admin/jobs'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  📋 Jobs
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  👤 View as Applicant
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🔍 Browse Jobs
                </Link>
                <Link
                  href="/admin/jobs"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
                >
                  👨‍💼 Admin Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
