import React, { useState, useEffect } from 'react';
import { Patient, Visit, AppSettings } from '../types';
import ToothSelectorModal from './ToothSelectorModal';

const TOOTH_NAMES: Record<string, string> = {
  '#18': 'Upper Right 3rd Molar (Wisdom)',
  '#17': 'Upper Right 2nd Molar',
  '#16': 'Upper Right 1st Molar',
  '#15': 'Upper Right 2nd Premolar',
  '#14': 'Upper Right 1st Premolar',
  '#13': 'Upper Right Canine (Eye Tooth)',
  '#12': 'Upper Right Lateral Incisor',
  '#11': 'Upper Right Central Incisor',
  '#21': 'Upper Left Central Incisor',
  '#22': 'Upper Left Lateral Incisor',
  '#23': 'Upper Left Canine (Eye Tooth)',
  '#24': 'Upper Left 1st Premolar',
  '#25': 'Upper Left 2nd Premolar',
  '#26': 'Upper Left 1st Molar',
  '#27': 'Upper Left 2nd Molar',
  '#28': 'Upper Left 3rd Molar (Wisdom)',
  '#48': 'Lower Right 3rd Molar (Wisdom)',
  '#47': 'Lower Right 2nd Molar',
  '#46': 'Lower Right 1st Molar',
  '#45': 'Lower Right 2nd Premolar',
  '#44': 'Lower Right 1st Premolar',
  '#43': 'Lower Right Canine (Eye Tooth)',
  '#42': 'Lower Right Lateral Incisor',
  '#41': 'Lower Right Central Incisor',
  '#31': 'Lower Left Central Incisor',
  '#32': 'Lower Left Lateral Incisor',
  '#33': 'Lower Left Canine (Eye Tooth)',
  '#34': 'Lower Left 1st Premolar',
  '#35': 'Lower Left 2nd Premolar',
  '#36': 'Lower Left 1st Molar',
  '#37': 'Lower Left 2nd Molar',
  '#38': 'Lower Left 3rd Molar (Wisdom)',
  // Child
  '#55': 'Deciduous Upper Right 2nd Molar',
  '#54': 'Deciduous Upper Right 1st Molar',
  '#53': 'Deciduous Upper Right Canine',
  '#52': 'Deciduous Upper Right Lateral Incisor',
  '#51': 'Deciduous Upper Right Central Incisor',
  '#61': 'Deciduous Upper Left Central Incisor',
  '#62': 'Deciduous Upper Left Lateral Incisor',
  '#63': 'Deciduous Upper Left Canine',
  '#64': 'Deciduous Upper Left 1st Molar',
  '#65': 'Deciduous Upper Left 2nd Molar',
  '#85': 'Deciduous Lower Right 2nd Molar',
  '#84': 'Deciduous Lower Right 1st Molar',
  '#83': 'Deciduous Lower Right Canine',
  '#82': 'Deciduous Lower Right Lateral Incisor',
  '#81': 'Deciduous Lower Right Central Incisor',
  '#71': 'Deciduous Lower Left Central Incisor',
  '#72': 'Deciduous Lower Left Lateral Incisor',
  '#73': 'Deciduous Lower Left Canine',
  '#74': 'Deciduous Lower Left 1st Molar',
  '#75': 'Deciduous Lower Left 2nd Molar',
};

interface ClinicalTableProps {
  patient: Patient;
  settings: AppSettings;
  onSave: (visits: Visit[], totalPayment: number, status: 'running' | 'completed', discount: number, tax: number) => void;
  onPrint: (mode: 'update' | 'full', activeVisits: Visit[], isCompleted: boolean) => void;
  onPrintPreview: (activeVisits: Visit[], isCompleted: boolean, discount?: number, tax?: number) => void;
  onBack: () => void;
}

export default function ClinicalTable({
  patient,
  settings,
  onSave,
  onPrint,
  onPrintPreview,
  onBack
}: ClinicalTableProps) {
  // Always size 11 representing treatment rows (Rows 3 to 13 of the 14-row layout)
  const [visits, setVisits] = useState<Visit[]>([]);
  const [allowEditPrinted, setAllowEditPrinted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(patient.status === 'completed');
  const [activeSuggestionRow, setActiveSuggestionRow] = useState<number | null>(null);
  const [procedureSearchText, setProcedureSearchText] = useState('');

  // Discount and Tax States
  const [discount, setDiscount] = useState<number>(patient.discount || 0);
  const [tax, setTax] = useState<number>(patient.tax || 0);

  // Tooth Filter States
  const [activeToothFilter, setActiveToothFilter] = useState<string | null>(null);
  const [hideUnrelatedRows, setHideUnrelatedRows] = useState(false);
  const [activeToothType, setActiveToothType] = useState<'adult' | 'child'>('adult');

  // Tooth selection states
  const [isToothModalOpen, setIsToothModalOpen] = useState(false);
  const [activeToothRowIdx, setActiveToothRowIdx] = useState<number | null>(null);

  const handleOpenToothModal = (index: number) => {
    setActiveToothRowIdx(index);
    setIsToothModalOpen(true);
  };

  const handleApplyTeeth = (teeth: string) => {
    if (activeToothRowIdx !== null) {
      const updated = [...visits];
      updated[activeToothRowIdx].teeth = teeth;
      setVisits(updated);
    }
  };

  const doesRowMatchToothFilter = (v: Visit, filter: string | null) => {
    if (!filter) return true;
    if (!v.teeth) return false;
    const cleanFilter = filter.replace('#', '').trim();
    const parts = v.teeth.split(',').map(t => t.trim().replace('#', ''));
    return parts.includes(cleanFilter);
  };

  // Helper: Get today's date formatted as DD/MM/YYYY
  const getTodayFormattedDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Synchronize when active patient loads
  useEffect(() => {
    if (patient) {
      const clonedVisits = JSON.parse(JSON.stringify(patient.visits)) as Visit[];
      // Fill or truncate to exactly 11 slots
      while (clonedVisits.length < 11) {
        clonedVisits.push({
          date: getTodayFormattedDate(),
          procedure: '',
          payment: '',
          printed: false
        });
      }
      setVisits(clonedVisits.slice(0, 11));
      setIsCompleted(patient.status === 'completed');
      setDiscount(patient.discount || 0);
      setTax(patient.tax || 0);
      setAllowEditPrinted(false);
      setActiveSuggestionRow(null);
      setActiveToothFilter(null);
      setHideUnrelatedRows(false);
    }
  }, [patient]);

  // Find index of the latest filled row in the active visits
  const getLatestFilledRowIndex = (currentVisits: Visit[]) => {
    let latestIndex = -1;
    for (let i = 0; i < currentVisits.length; i++) {
      if (currentVisits[i].procedure.trim() !== '' || currentVisits[i].payment !== '') {
        latestIndex = i;
      }
    }
    return latestIndex;
  };

  // Find index of the first empty row
  const getFirstEmptyRowIndex = () => {
    for (let i = 0; i < visits.length; i++) {
      if (visits[i].procedure.trim() === '' && visits[i].payment === '') {
        return i;
      }
    }
    return -1;
  };

  // Recalculate BDT Total
  const calculateTotal = (currentVisits: Visit[]) => {
    let sum = 0;
    currentVisits.forEach((v) => {
      if (v.payment !== '' && !isNaN(Number(v.payment))) {
        sum += Number(v.payment);
      }
    });
    return sum;
  };

  const subtotal = calculateTotal(visits);
  const taxAmount = Math.round((subtotal - discount) * (tax / 100));
  const grandTotal = subtotal - discount + taxAmount;

  const handleDateChange = (index: number, val: string) => {
    const updated = [...visits];
    updated[index].date = val;
    setVisits(updated);
  };

  const handleProcedureChange = (index: number, val: string) => {
    const updated = [...visits];
    updated[index].procedure = val;

    // Check for Shorthand expansion!
    const shorthands = settings.shorthands || [];
    const trimmedVal = val.trim().toUpperCase();
    const foundShorthand = shorthands.find(s => s.key === trimmedVal);

    if (foundShorthand && (val.endsWith(' ') || val === foundShorthand.key)) {
      updated[index].procedure = foundShorthand.text;
      if (foundShorthand.price !== '') {
        updated[index].payment = foundShorthand.price;
      }
      setVisits(updated);
      setProcedureSearchText(foundShorthand.text);
      return;
    }

    setVisits(updated);
    setProcedureSearchText(val);
  };

  const handlePaymentChange = (index: number, val: string) => {
    const updated = [...visits];
    if (val === '') {
      updated[index].payment = '';
    } else {
      const num = parseFloat(val);
      updated[index].payment = isNaN(num) || num < 0 ? 0 : num;
    }
    setVisits(updated);
  };

  const selectSuggestion = (index: number, val: string) => {
    const updated = [...visits];
    updated[index].procedure = val;
    setVisits(updated);
    setActiveSuggestionRow(null);
  };

  const handleSave = () => {
    const status = isCompleted ? 'completed' : 'running';
    onSave(visits, grandTotal, status, discount, tax);
  };

  const handlePrintUpdateClick = () => {
    const latestIdx = getLatestFilledRowIndex(visits);
    if (latestIdx === -1) {
      alert('Your clinical record has no treatment rows to print!');
      return;
    }

    const unsaved = JSON.stringify(patient.visits) !== JSON.stringify(visits) || 
                    (patient.status === 'completed' !== isCompleted) ||
                    (patient.discount !== discount) ||
                    (patient.tax !== tax);
    if (unsaved) {
      const ok = confirm('You have unsaved changes in the table (visits, discount, tax, or status)! Print without saving? (Highly recommended to click Cancel and SAVE first).');
      if (!ok) return;
    }

    onPrint('update', visits, isCompleted);
  };

  const handlePrintFullClick = () => {
    const latestIdx = getLatestFilledRowIndex(visits);
    if (latestIdx === -1) {
      alert('Your clinical record has no treatment rows to print!');
      return;
    }

    const unsaved = JSON.stringify(patient.visits) !== JSON.stringify(visits) || 
                    (patient.status === 'completed' !== isCompleted) ||
                    (patient.discount !== discount) ||
                    (patient.tax !== tax);
    if (unsaved) {
      const ok = confirm('You have unsaved changes in the table (visits, discount, tax, or status)! Print without saving? (Highly recommended to click Cancel and SAVE first).');
      if (!ok) return;
    }

    onPrint('full', visits, isCompleted);
  };

  // Suggestion filters
  const filteredSuggestions = settings.suggestions.filter(s => 
    s.toLowerCase().includes(procedureSearchText.toLowerCase().trim())
  );
  const suggestionsToDisplay = filteredSuggestions.length > 0 ? filteredSuggestions : settings.suggestions;

  const nextEmptyRow = getFirstEmptyRowIndex();

  return (
    <div id="screen-clinical-table" className="w-full max-w-5xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
      
      {/* Table Header Row info */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-sm font-semibold text-slate-500 block font-mono" id="clinical-table-reg-subtitle">
            Registration No: <strong className="text-slate-800">{patient.regNumber}</strong>
          </span>
          <h2 className="text-2xl font-bold text-slate-800" id="clinical-table-name-title">
            Patient: {patient.name}
          </h2>
          {nextEmptyRow !== -1 && (
            <span className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded font-medium inline-block mt-1">
              💡 Next blank row: Row {nextEmptyRow + 1}
            </span>
          )}
        </div>
        <button
          onClick={onBack}
          className="text-sm font-medium text-sky-600 hover:underline cursor-pointer"
        >
          ← Back to Patients
        </button>
      </div>

      {/* 🦷 Central Tooth Position Selector helper bar (placed before inputs & table) */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 select-none">🦷</span>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              Tooth Position Selector
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Interactive Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select adult (1-8) or child (A-E) teeth positions across 4 quadrants to display distinctly on printable records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Apply to row:</label>
          <select
            id="global-tooth-row-select"
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer min-w-[120px]"
            onChange={(e) => {
              const val = e.target.value;
              if (val !== "") {
                handleOpenToothModal(Number(val));
                e.target.value = ""; // Reset after trigger
              }
            }}
          >
            <option value="">-- Choose Row --</option>
            {visits.map((v, i) => (
              <option key={i} value={i}>
                Row {i + 1} {v.procedure ? `(${v.procedure.substring(0, 15)}${v.procedure.length > 15 ? '...' : ''})` : '[Blank]'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const targetIdx = activeToothRowIdx !== null ? activeToothRowIdx : (getFirstEmptyRowIndex() !== -1 ? getFirstEmptyRowIndex() : 0);
              handleOpenToothModal(targetIdx);
            }}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <span>✨</span> Select Teeth Positions
          </button>
        </div>
      </div>

      {/* 📊 Interactive Visual Dental Chart & History Filter */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🦷</span> Interactive Visual Dental Chart
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any tooth to filter the clinical table history below. Highlighted teeth have active records.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setActiveToothType('adult')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeToothType === 'adult'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Permanent (Adult)
            </button>
            <button
              type="button"
              onClick={() => setActiveToothType('child')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeToothType === 'child'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deciduous (Child)
            </button>
          </div>
        </div>

        {/* Visual Chart Grid */}
        <div className="relative mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto select-none">
          {/* Vertical Midline */}
          <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-sky-500/20 pointer-events-none -translate-x-1/2 z-10 hidden sm:block"></div>
          {/* Horizontal Midline */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-sky-500/20 pointer-events-none -translate-y-1/2 z-10 hidden sm:block"></div>

          <div className="min-w-[640px] flex flex-col gap-6">
            {/* UPPER DENTITION */}
            <div className="grid grid-cols-2 gap-8 relative">
              {/* UPPER RIGHT (UR) */}
              <div className="flex justify-end gap-1.5 pr-2">
                <span className="absolute left-1 top-1 text-[9px] font-black tracking-wider text-slate-500 uppercase">Upper Right (UR)</span>
                {(activeToothType === 'adult' 
                  ? ['18', '17', '16', '15', '14', '13', '12', '11']
                  : ['55', '54', '53', '52', '51']
                ).map((tCode) => {
                  const displayCode = `#${tCode}`;
                  // Helper function inside scope
                  const getToothRecordCount = (tc: string) => {
                    const rc = tc.replace('#', '').trim();
                    return visits.filter(v => {
                      if (!v.teeth) return false;
                      return v.teeth.split(',').map(x => x.trim().replace('#', '')).includes(rc);
                    }).length;
                  };
                  const count = getToothRecordCount(displayCode);
                  const isFiltered = activeToothFilter === displayCode;
                  return (
                    <button
                      key={tCode}
                      type="button"
                      title={`${displayCode}: ${TOOTH_NAMES[displayCode] || ''}`}
                      onClick={() => setActiveToothFilter(isFiltered ? null : displayCode)}
                      className={`relative w-9 h-11 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        isFiltered
                          ? 'bg-sky-500 border-sky-400 text-white scale-105 ring-2 ring-sky-300'
                          : count > 0
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{tCode}</span>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full min-w-[14px] text-center shadow-md">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* UPPER LEFT (UL) */}
              <div className="flex justify-start gap-1.5 pl-2 border-l border-slate-800 sm:border-none">
                <span className="absolute right-1 top-1 text-[9px] font-black tracking-wider text-slate-500 uppercase">Upper Left (UL)</span>
                {(activeToothType === 'adult'
                  ? ['21', '22', '23', '24', '25', '26', '27', '28']
                  : ['61', '62', '63', '64', '65']
                ).map((tCode) => {
                  const displayCode = `#${tCode}`;
                  const getToothRecordCount = (tc: string) => {
                    const rc = tc.replace('#', '').trim();
                    return visits.filter(v => {
                      if (!v.teeth) return false;
                      return v.teeth.split(',').map(x => x.trim().replace('#', '')).includes(rc);
                    }).length;
                  };
                  const count = getToothRecordCount(displayCode);
                  const isFiltered = activeToothFilter === displayCode;
                  return (
                    <button
                      key={tCode}
                      type="button"
                      title={`${displayCode}: ${TOOTH_NAMES[displayCode] || ''}`}
                      onClick={() => setActiveToothFilter(isFiltered ? null : displayCode)}
                      className={`relative w-9 h-11 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        isFiltered
                          ? 'bg-sky-500 border-sky-400 text-white scale-105 ring-2 ring-sky-300'
                          : count > 0
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{tCode}</span>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full min-w-[14px] text-center shadow-md">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOWER DENTITION */}
            <div className="grid grid-cols-2 gap-8 relative border-t border-slate-900 pt-6">
              {/* LOWER RIGHT (LR) */}
              <div className="flex justify-end gap-1.5 pr-2">
                <span className="absolute left-1 bottom-1 text-[9px] font-black tracking-wider text-slate-500 uppercase">Lower Right (LR)</span>
                {(activeToothType === 'adult'
                  ? ['48', '47', '46', '45', '44', '43', '42', '41']
                  : ['85', '84', '83', '82', '81']
                ).map((tCode) => {
                  const displayCode = `#${tCode}`;
                  const getToothRecordCount = (tc: string) => {
                    const rc = tc.replace('#', '').trim();
                    return visits.filter(v => {
                      if (!v.teeth) return false;
                      return v.teeth.split(',').map(x => x.trim().replace('#', '')).includes(rc);
                    }).length;
                  };
                  const count = getToothRecordCount(displayCode);
                  const isFiltered = activeToothFilter === displayCode;
                  return (
                    <button
                      key={tCode}
                      type="button"
                      title={`${displayCode}: ${TOOTH_NAMES[displayCode] || ''}`}
                      onClick={() => setActiveToothFilter(isFiltered ? null : displayCode)}
                      className={`relative w-9 h-11 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        isFiltered
                          ? 'bg-sky-500 border-sky-400 text-white scale-105 ring-2 ring-sky-300'
                          : count > 0
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{tCode}</span>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full min-w-[14px] text-center shadow-md">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* LOWER LEFT (LL) */}
              <div className="flex justify-start gap-1.5 pl-2 border-l border-slate-800 sm:border-none">
                <span className="absolute right-1 bottom-1 text-[9px] font-black tracking-wider text-slate-500 uppercase">Lower Left (LL)</span>
                {(activeToothType === 'adult'
                  ? ['31', '32', '33', '34', '35', '36', '37', '38']
                  : ['71', '72', '73', '74', '75']
                ).map((tCode) => {
                  const displayCode = `#${tCode}`;
                  const getToothRecordCount = (tc: string) => {
                    const rc = tc.replace('#', '').trim();
                    return visits.filter(v => {
                      if (!v.teeth) return false;
                      return v.teeth.split(',').map(x => x.trim().replace('#', '')).includes(rc);
                    }).length;
                  };
                  const count = getToothRecordCount(displayCode);
                  const isFiltered = activeToothFilter === displayCode;
                  return (
                    <button
                      key={tCode}
                      type="button"
                      title={`${displayCode}: ${TOOTH_NAMES[displayCode] || ''}`}
                      onClick={() => setActiveToothFilter(isFiltered ? null : displayCode)}
                      className={`relative w-9 h-11 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        isFiltered
                          ? 'bg-sky-500 border-sky-400 text-white scale-105 ring-2 ring-sky-300'
                          : count > 0
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{tCode}</span>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full min-w-[14px] text-center shadow-md">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Indicator / Status Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
            {activeToothFilter ? (
              <span>
                Filtering table: <strong className="text-sky-300 font-mono text-[13px]">{activeToothFilter}</strong>
                <span className="text-slate-400 font-normal"> - {TOOTH_NAMES[activeToothFilter] || 'Selected Tooth'}</span>
              </span>
            ) : (
              <span className="text-slate-400">
                No active filter. Showing all clinical treatment records.
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {activeToothFilter && (
              <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideUnrelatedRows}
                  onChange={(e) => setHideUnrelatedRows(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                Hide other rows in editing list
              </label>
            )}
            {activeToothFilter && (
              <button
                type="button"
                onClick={() => {
                  setActiveToothFilter(null);
                  setHideUnrelatedRows(false);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-bold transition-all text-[11px] cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 14-Row Clinical Record Table Frame */}
      <div className="overflow-x-auto border border-slate-300 rounded-lg">
        <table className="w-full border-collapse bg-white text-sm" id="clinical-table-el">
          <thead>
            {/* Row 1: Merged title CLINICAL RECORD */}
            <tr>
              <th colSpan={3} className="bg-slate-800 text-white font-extrabold text-center text-base tracking-wider py-3 border-b border-slate-800">
                CLINICAL RECORD
              </th>
            </tr>
            {/* Row 2: Header slots */}
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
              <th className="py-2.5 px-4 text-left border-r border-slate-200 font-sans" style={{ width: `${settings.print.colWidthDate}%` }}>
                DATE
              </th>
              <th className="py-2.5 px-4 text-left border-r border-slate-200 font-sans" style={{ width: `${settings.print.colWidthProc}%` }}>
                PROCEDURE
              </th>
              <th className="py-2.5 px-4 text-right font-sans" style={{ width: `${settings.print.colWidthPay}%` }}>
                PAYMENT (BDT)
              </th>
            </tr>
          </thead>
          <tbody id="clinical-table-tbody">
            {/* Rows 3-13 (11 treatment rows) */}
            {visits.map((visit, index) => {
              const isRowPrinted = visit.printed === true;
              const isLocked = isRowPrinted && !allowEditPrinted;
              const matchesFilter = doesRowMatchToothFilter(visit, activeToothFilter);

                if (activeToothFilter && hideUnrelatedRows && !matchesFilter) {
                  return null;
                }

                const isHighlighted = activeToothFilter && matchesFilter;
                const isDimmed = activeToothFilter && !matchesFilter;

                return (
                  <tr
                    key={index}
                    className={`border-b border-slate-200 transition-all ${
                      isRowPrinted ? 'bg-slate-100/70' : index === nextEmptyRow ? 'bg-sky-50/20' : 'hover:bg-slate-50/50'
                    } ${isHighlighted ? 'bg-sky-50/60 border-l-4 border-l-sky-500' : ''} ${isDimmed ? 'opacity-40' : ''}`}
                  >
                  {/* Date Column */}
                  <td className="p-2 border-r border-slate-200" style={{ width: `${settings.print.colWidthDate}%` }}>
                    <input
                      type="text"
                      value={visit.date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      disabled={isLocked}
                      placeholder="DD/MM/YYYY"
                      className="w-full bg-transparent border-none outline-none font-mono text-slate-800 focus:ring-0 placeholder-slate-300 disabled:text-slate-400 font-medium"
                    />
                  </td>

                  {/* Procedure Column */}
                  <td className="p-2 border-r border-slate-200 relative" style={{ width: `${settings.print.colWidthProc}%` }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={visit.procedure}
                          onChange={(e) => handleProcedureChange(index, e.target.value)}
                          onFocus={() => {
                            if (!isLocked) {
                              setActiveSuggestionRow(index);
                              setProcedureSearchText(visit.procedure);
                            }
                          }}
                          onBlur={() => {
                            // Delay closing popup so user can register click
                            setTimeout(() => setActiveSuggestionRow(null), 200);
                          }}
                          disabled={isLocked}
                          placeholder="Double-click or type to view procedure suggestions..."
                          className="w-full bg-transparent border-none outline-none text-slate-800 focus:ring-0 placeholder-slate-300 disabled:text-slate-400 font-medium"
                        />

                        {/* Suggestions popup */}
                        {activeSuggestionRow === index && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-md shadow-xl z-50 max-h-44 overflow-y-auto">
                            {suggestionsToDisplay.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                onMouseDown={() => selectSuggestion(index, s)}
                                className="p-2 hover:bg-sky-50 hover:text-sky-700 cursor-pointer text-xs font-semibold text-slate-600 transition-colors"
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Row-specific Tooth Button & Badge */}
                      <div className="flex items-center gap-1.5 shrink-0 select-none">
                        {visit.teeth && (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono shadow-2xs">
                            {visit.teeth}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenToothModal(index)}
                          disabled={isLocked}
                          className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Select Tooth Position"
                        >
                          🦷
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Payment Column */}
                  <td className="p-2" style={{ width: `${settings.print.colWidthPay}%` }}>
                    <input
                      type="number"
                      min="0"
                      value={visit.payment === '' ? '' : visit.payment}
                      onChange={(e) => handlePaymentChange(index, e.target.value)}
                      disabled={isLocked}
                      placeholder="0"
                      className="w-full bg-transparent border-none outline-none font-mono text-slate-800 text-right focus:ring-0 placeholder-slate-300 disabled:text-slate-400 font-bold"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {/* Subtotal Row */}
            <tr className="bg-slate-50 border-t border-slate-300">
              <td colSpan={2} className="py-2.5 px-4 text-right text-slate-500 font-semibold border-r border-slate-200">
                SUBTOTAL:
              </td>
              <td colSpan={1} className="py-2.5 px-4 text-right text-slate-700 font-mono font-bold">
                {settings.print.currencySymbol || 'BDT'} {subtotal.toLocaleString()}
              </td>
            </tr>

            {/* Discount Row */}
            <tr className="bg-slate-50/50">
              <td colSpan={2} className="py-2 px-4 text-right text-slate-500 font-semibold border-r border-slate-200">
                DISCOUNT ({settings.print.currencySymbol || 'BDT'}):
              </td>
              <td colSpan={1} className="py-2 px-4 text-right text-emerald-800 font-mono">
                <input
                  type="number"
                  min="0"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDiscount(isNaN(val) || val < 0 ? 0 : val);
                  }}
                  placeholder="0"
                  className="w-28 bg-transparent border-b border-slate-300 text-right outline-none font-bold text-emerald-700 focus:border-emerald-500 font-mono py-0.5"
                />
              </td>
            </tr>

            {/* Tax Row */}
            <tr className="bg-slate-50/50">
              <td colSpan={2} className="py-2 px-4 text-right text-slate-500 font-semibold border-r border-slate-200">
                TAX (%):
              </td>
              <td colSpan={1} className="py-2 px-4 text-right text-slate-700 font-mono">
                <div className="flex items-center justify-end gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tax === 0 ? '' : tax}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTax(isNaN(val) || val < 0 ? 0 : val);
                    }}
                    placeholder="0"
                    className="w-16 bg-transparent border-b border-slate-300 text-right outline-none font-bold text-slate-700 focus:border-sky-500 font-mono py-0.5"
                  />
                  <span>%</span>
                  <span className="text-xs text-slate-400">({settings.print.currencySymbol || 'BDT'} {taxAmount.toLocaleString()})</span>
                </div>
              </td>
            </tr>

            {/* Grand Total Row */}
            <tr className="bg-slate-100 font-extrabold border-t border-slate-400">
              <td colSpan={2} className="py-3 px-4 text-right text-slate-700 border-r border-slate-200 uppercase tracking-wide">
                Grand Total Payment Received:
              </td>
              <td colSpan={1} className="py-3 px-4 text-right text-sky-700 font-mono text-lg font-black" id="clinical-table-total-val">
                {settings.print.currencySymbol || 'BDT'} {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Row Edit Unlock Feature */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md p-3 w-fit">
        <input
          type="checkbox"
          id="allow-edit-printed-cb"
          checked={allowEditPrinted}
          onChange={(e) => setAllowEditPrinted(e.target.checked)}
          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
        />
        <label htmlFor="allow-edit-printed-cb" className="font-semibold text-slate-600 cursor-pointer">
          🔓 Allow editing previously printed rows (marked in gray)
        </label>
      </div>

      {/* Footer controls & printing buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 flex-wrap gap-4">
        <div>
          <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer text-lg">
            <input
              type="checkbox"
              id="completed-status-cb"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-5 h-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
            />
            ☑ TREATMENT COMPLETED
          </label>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            💾 SAVE RECORD
          </button>
          
          <button
            onClick={() => onPrintPreview(visits, isCompleted, discount, tax)}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            👁 PRINT PREVIEW
          </button>

          <button
            onClick={handlePrintUpdateClick}
            className="px-4 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 active:scale-95 transition-all cursor-pointer"
          >
            🖨 PRINT UPDATE
          </button>

          <button
            onClick={handlePrintFullClick}
            className="px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            🖨 PRINT FULL RECORD
          </button>
        </div>
      </div>

      <ToothSelectorModal
        isOpen={isToothModalOpen}
        onClose={() => {
          setIsToothModalOpen(false);
          setActiveToothRowIdx(null);
        }}
        initialSelection={activeToothRowIdx !== null ? (visits[activeToothRowIdx]?.teeth || '') : ''}
        onApply={handleApplyTeeth}
        rowLabel={activeToothRowIdx !== null ? `Row ${activeToothRowIdx + 1}` : undefined}
      />
    </div>
  );
}
