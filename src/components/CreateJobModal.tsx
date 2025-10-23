import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CreateJobModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'active'|'inactive'|'draft'>('draft');

  type FieldMode = 'mandatory' | 'optional' | 'off';
  const [fields, setFields] = useState<{ key: string; mode: FieldMode }[]>([
    { key: 'full_name', mode: 'mandatory' },
    { key: 'photo_profile', mode: 'optional' },
    { key: 'gender', mode: 'optional' },
    { key: 'domicile', mode: 'optional' },
    { key: 'email', mode: 'mandatory' },
    { key: 'phone_number', mode: 'mandatory' },
    { key: 'linkedin_link', mode: 'optional' },
    { key: 'date_of_birth', mode: 'off' },
  ]);

  const save = async () => {
    if (!title || !slug) return alert('Title and slug required');
    
    // Build salary display string
    const salaryDisplay = salaryMin && salaryMax 
      ? `${currency} ${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()}`
      : '—';
    
    const { data: job, error } = await supabase.from('jobs').insert({ 
      title, 
      slug, 
      description: description || null,
      department: department || null,
      status, 
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      currency,
      salary_display: salaryDisplay 
    }).select('*').single();
    
    if (error || !job) return alert('Failed to create job');

  const config: { application_form: { sections: { title: string; fields: Record<string, unknown>[] }[] } } = {
      application_form: {
        sections: [{ title: 'Minimum Profile Information Required', fields: fields.map(f => ({ key: f.key, validation: f.mode==='mandatory' ? { required: true } : f.mode==='optional' ? { required: false } : undefined })) }]
      }
    };

    await supabase.from('job_configs').insert({ job_id: job.id, config });
    onCreated(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Job</h2>
              <p className="text-teal-50 mt-1">Fill in the details to post a new position</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </div>
            
            <div className="grid grid-cols-2 gap-6 pl-10">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  placeholder="e.g. Senior Frontend Engineer" 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL) <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono text-sm" 
                  placeholder="e.g. senior-frontend-engineer" 
                  value={slug} 
                  onChange={e=>setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <input 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  placeholder="e.g. Engineering" 
                  value={department} 
                  onChange={e=>setDepartment(e.target.value)} 
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none" 
                  placeholder="Describe the role, responsibilities, and requirements..." 
                  rows={4}
                  value={description} 
                  onChange={e=>setDescription(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">2</span>
              Compensation
            </div>
            
            <div className="grid grid-cols-2 gap-6 pl-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">💵 Minimum Salary</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  placeholder="50000" 
                  value={salaryMin} 
                  onChange={e=>setSalaryMin(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Maximum Salary</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  placeholder="80000" 
                  value={salaryMax} 
                  onChange={e=>setSalaryMax(e.target.value)} 
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white" 
                  value={currency} 
                  onChange={e=>setCurrency(e.target.value)}
                >
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                  <option value="IDR">🇮🇩 IDR (Rp)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">3</span>
              Job Status
            </div>
            <div className="flex gap-3 pl-10">
              {(['draft','active','inactive'] as const).map(s => (
                <button 
                  key={s} 
                  onClick={()=>setStatus(s)}
                  className={`px-6 py-3 border-2 rounded-xl capitalize font-semibold transition-all ${
                    status===s
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-700 shadow-lg scale-105' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-teal-400 hover:bg-teal-50'
                  }`}
                >
                  {s === 'active' && '✅'} {s === 'draft' && '📝'} {s === 'inactive' && '⏸️'} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Application Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">4</span>
              Application Form Configuration
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 border-2 border-gray-200 rounded-2xl p-6 pl-10">
              <p className="text-sm text-gray-600 mb-4">Configure which fields are required, optional, or hidden in the application form</p>
              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div key={f.key} className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-semibold text-gray-800 capitalize flex-1">{f.key.replace(/_/g, ' ')}</div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { const v = [...fields]; v[idx] = { ...v[idx], mode: 'mandatory' }; setFields(v); }} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          f.mode==='mandatory' 
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md scale-105' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-teal-400 hover:bg-teal-50'
                        }`}
                      >
                        ✓ Mandatory
                      </button>
                      <button 
                        onClick={() => { const v = [...fields]; v[idx] = { ...v[idx], mode: 'optional' }; setFields(v); }} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          f.mode==='optional' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        ~ Optional
                      </button>
                      <button 
                        onClick={() => { const v = [...fields]; v[idx] = { ...v[idx], mode: 'off' }; setFields(v); }} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          f.mode==='off' 
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md scale-105' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        × Off
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={save} 
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all"
          >
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
}
