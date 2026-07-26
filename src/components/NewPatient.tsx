import React, { useState } from 'react';
import { Patient } from '../types';

interface NewPatientProps {
  patients: Patient[];
  onRegisterPatient: (name: string, regNumber: string) => void;
  onNavigateHome: () => void;
}

export default function NewPatient({ patients, onRegisterPatient, onNavigateHome }: NewPatientProps) {
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const trimmedReg = regNumber.trim();

    if (!trimmedName || !trimmedReg) {
      setErrorMessage('Both fields are required.');
      return;
    }

    // Check uniqueness (case insensitive)
    const exists = patients.some(
      (p) => p.regNumber.toLowerCase() === trimmedReg.toLowerCase()
    );

    if (exists) {
      setErrorMessage('Registration number already exists! Please use a unique number.');
      return;
    }

    setErrorMessage('');
    onRegisterPatient(trimmedName, trimmedReg);
    
    // Clear form inputs
    setName('');
    setRegNumber('');
  };

  return (
    <div id="screen-new-patient" className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>➕</span> New Patient Registration
        </h2>
        <button
          onClick={onNavigateHome}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form id="new-patient-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="new-patient-name">
            Patient Full Name
          </label>
          <input
            id="new-patient-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
            placeholder="Enter patient full name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="new-patient-reg">
            Registration Number
          </label>
          <input
            id="new-patient-reg"
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-medium text-slate-800"
            placeholder="Enter unique registration number..."
            required
          />
          {errorMessage && (
            <div id="new-patient-reg-error" className="text-rose-600 text-xs font-semibold mt-2 bg-rose-50 border border-rose-100 p-2 rounded">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="submit-new-patient"
            type="submit"
            className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 cursor-pointer flex items-center gap-2"
          >
            Create Record & Open Clinical Table
          </button>
        </div>
      </form>
    </div>
  );
}
