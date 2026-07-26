import React from 'react';

interface HomeMenuProps {
  onNavigate: (screen: string) => void;
}

export default function HomeMenu({ onNavigate }: HomeMenuProps) {
  return (
    <div id="screen-home" className="flex flex-col items-center">
      <div className="text-center mt-6 mb-10">
        <h2 className="text-xl font-medium text-slate-500 tracking-wide uppercase">
          Clinic Records Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Select an action to view, record, or calibrate print alignments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        <button
          id="btn-all-patients"
          onClick={() => onNavigate('all-patients')}
          className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
          <span className="text-lg font-bold text-slate-800">ALL PATIENTS</span>
          <span className="text-xs text-slate-400 mt-2">View complete record history</span>
        </button>

        <button
          id="btn-search-entry"
          onClick={() => onNavigate('search-entry')}
          className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
          <span className="text-lg font-bold text-slate-800">SEARCH ENTRY</span>
          <span className="text-xs text-slate-400 mt-2">Live name or Reg. No filtering</span>
        </button>

        <button
          id="btn-new-entry"
          onClick={() => onNavigate('new-entry')}
          className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</div>
          <span className="text-lg font-bold text-slate-800">NEW ENTRY</span>
          <span className="text-xs text-slate-400 mt-2">Register new clinic card</span>
        </button>

        <button
          id="btn-update-entry"
          onClick={() => onNavigate('update-entry')}
          className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
          <span className="text-lg font-bold text-slate-800">UPDATE ENTRY</span>
          <span className="text-xs text-slate-400 mt-2">Append treatments & print slips</span>
        </button>
      </div>
    </div>
  );
}
