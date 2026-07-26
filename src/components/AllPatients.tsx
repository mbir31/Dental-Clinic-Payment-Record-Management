import React, { useState } from 'react';
import { Patient } from '../types';

interface AllPatientsProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigateHome: () => void;
}

type FilterStatus = 'all' | 'running' | 'completed';

export default function AllPatients({ patients, onSelectPatient, onNavigateHome }: AllPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Normalize search values
  const query = searchQuery.toLowerCase().trim();

  // Filter patients based on both status tabs and search query
  const filteredPatients = patients.filter((p) => {
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch = query
      ? p.name.toLowerCase().includes(query) || p.regNumber.toLowerCase().includes(query)
      : true;
    return matchesStatus && matchesSearch;
  });

  // Sort patients: newest created first
  const sortedPatients = [...filteredPatients].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div id="screen-all-patients" className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>👥</span> All Patient Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse registered patients, filter by status, or search names and ID cards
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-sm font-medium text-sky-600 hover:underline cursor-pointer self-start sm:self-center"
        >
          ← Back to Menu
        </button>
      </div>

      {/* Search & Filter bar combo */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800 bg-slate-50 placeholder-slate-400 text-sm font-medium"
            placeholder="Quick search by patient name or registration number..."
          />
        </div>
        
        {/* Filter status buttons */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 ALL PATIENTS
          </button>
          <button
            onClick={() => setStatusFilter('running')}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'running'
                ? 'bg-sky-600 text-white shadow-sm border border-sky-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⏳ ONGOING PATIENTS
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ✅ COMPLETED PATIENTS
          </button>
        </div>
      </div>

      {sortedPatients.length === 0 ? (
        <div className="text-center py-12 text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          {patients.length === 0 ? (
            <span>No patients registered yet. Click "NEW ENTRY" from the home menu to register your first patient.</span>
          ) : (
            <span>No patient records match the selected status or search term. Try resetting your filters.</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedPatients.map((patient) => (
            <div
              id={`patient-row-${patient.id}`}
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="group border border-slate-200 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-sky-500 hover:bg-sky-50/30 active:bg-sky-50/60 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                  {patient.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Registration No: <strong className="text-slate-700">{patient.regNumber}</strong>
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
  );
}
