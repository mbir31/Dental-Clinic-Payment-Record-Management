import React, { useState } from 'react';
import { Patient } from '../types';

interface SearchEntryProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigateHome: () => void;
  title?: string;
  placeholder?: string;
}

export default function SearchEntry({
  patients,
  onSelectPatient,
  onNavigateHome,
  title = "🔍 Search Patient Records",
  placeholder = "Type patient name or registration number to filter..."
}: SearchEntryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize search values
  const query = searchQuery.toLowerCase().trim();
  
  // Filter matches live
  const matchedPatients = query
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.regNumber.toLowerCase().includes(query)
      ).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div id="screen-search" className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {title}
        </h2>
        <button
          onClick={onNavigateHome}
          className="text-sm font-medium text-sky-600 hover:underline cursor-pointer"
        >
          ← Back to Menu
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          Enter Name or Registration Number
        </label>
        <input
          id="patient-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800 bg-slate-50 placeholder-slate-400 font-medium"
          placeholder={placeholder}
          autoFocus
        />
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
          {query ? `Search Results (${matchedPatients.length})` : 'Type above to see matching records'}
        </h3>

        {query === '' ? (
          <div className="text-center py-8 text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-lg">
            A list of matching records will appear here as you type.
          </div>
        ) : matchedPatients.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-medium bg-rose-50/50 border border-dashed border-rose-100 rounded-lg">
            No matching patient records found. Verify the name or registration number.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matchedPatients.map((patient) => (
              <div
                id={`search-result-${patient.id}`}
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className="group border border-slate-200 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-sky-500 hover:bg-sky-50/30 active:bg-sky-50/60 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                    {patient.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Reg. Number: <strong className="text-slate-700">{patient.regNumber}</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Payment</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      BDT {patient.totalPayment.toLocaleString()}
                    </span>
                  </div>
                  
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      patient.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
