import React, { useState, useEffect } from 'react';

interface ToothSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelection: string;
  onApply: (teeth: string) => void;
  rowLabel?: string;
}

// Format internal code (e.g. UL4, C-UR-A) to FDI/User display format (#24, #5A)
export function formatToothCode(code: string): string {
  // Adult
  if (code.startsWith('UR')) return `#1${code.substring(2)}`;
  if (code.startsWith('UL')) return `#2${code.substring(2)}`;
  if (code.startsWith('LL')) return `#3${code.substring(2)}`;
  if (code.startsWith('LR')) return `#4${code.substring(2)}`;
  
  // Child
  if (code.startsWith('C-UR-')) return `#5${code.substring(5)}`;
  if (code.startsWith('C-UL-')) return `#6${code.substring(5)}`;
  if (code.startsWith('C-LL-')) return `#7${code.substring(5)}`;
  if (code.startsWith('C-LR-')) return `#8${code.substring(5)}`;
  
  return code;
}

// Parse display/FDI format (#24, #5A) back to internal code (UL4, C-UR-A)
export function parseToothCode(formatted: string): string {
  const trimmed = formatted.trim();
  if (!trimmed) return '';
  
  const clean = trimmed.startsWith('#') ? trimmed.substring(1) : trimmed;
  if (clean.length < 2) return trimmed;

  const quadrant = clean.charAt(0);
  const tooth = clean.substring(1);

  if (quadrant === '1') return `UR${tooth}`;
  if (quadrant === '2') return `UL${tooth}`;
  if (quadrant === '3') return `LL${tooth}`;
  if (quadrant === '4') return `LR${tooth}`;
  if (quadrant === '5') return `C-UR-${tooth}`;
  if (quadrant === '6') return `C-UL-${tooth}`;
  if (quadrant === '7') return `C-LL-${tooth}`;
  if (quadrant === '8') return `C-LR-${tooth}`;

  return trimmed;
}

export default function ToothSelectorModal({
  isOpen,
  onClose,
  initialSelection,
  onApply,
  rowLabel
}: ToothSelectorModalProps) {
  // Store selected teeth as a Set of strings (e.g., "UR3", "child-UL-B")
  const [selectedTeeth, setSelectedTeeth] = useState<Set<string>>(new Set());

  // Parse initial selection on open
  useEffect(() => {
    if (isOpen) {
      const set = new Set<string>();
      if (initialSelection) {
        initialSelection.split(',').forEach(item => {
          const trimmed = item.trim();
          if (trimmed) {
            const parsed = parseToothCode(trimmed);
            if (parsed) set.add(parsed);
          }
        });
      }
      setSelectedTeeth(set);
    }
  }, [isOpen, initialSelection]);

  if (!isOpen) return null;

  const toggleTooth = (toothCode: string) => {
    const next = new Set(selectedTeeth);
    if (next.has(toothCode)) {
      next.delete(toothCode);
    } else {
      next.add(toothCode);
    }
    setSelectedTeeth(next);
  };

  const handleClear = () => {
    setSelectedTeeth(new Set());
  };

  const handleApply = () => {
    const sorted = Array.from(selectedTeeth).sort((a: string, b: string) => {
      // Custom sort to make UR, UL, LR, LL order clean
      const getPriority = (code: string) => {
        if (code.startsWith('UR')) return 1;
        if (code.startsWith('UL')) return 2;
        if (code.startsWith('LR')) return 3;
        if (code.startsWith('LL')) return 4;
        if (code.startsWith('C-UR')) return 5;
        if (code.startsWith('C-UL')) return 6;
        if (code.startsWith('C-LR')) return 7;
        if (code.startsWith('C-LL')) return 8;
        return 9;
      };
      return getPriority(a) - getPriority(b) || a.localeCompare(b);
    });
    const formatted = sorted.map(formatToothCode);
    onApply(formatted.join(', '));
    onClose();
  };

  // Quadrant data helper
  const adultUR = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const adultUL = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const adultLR = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const adultLL = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const childUR = ['E', 'D', 'C', 'B', 'A'];
  const childUL = ['A', 'B', 'C', 'D', 'E'];
  const childLR = ['E', 'D', 'C', 'B', 'A'];
  const childLL = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in no-print">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>🦷</span> Dental Tooth Position Selector
            </h3>
            {rowLabel && (
              <p className="text-xs text-slate-300 mt-0.5">
                Assigning to: <strong className="text-sky-300">{rowLabel}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-xl transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Section 1: Adult Teeth (Permanents) */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                1. Adult Teeth (Permanent Dentition - 1 to 8)
              </h4>
            </div>

            {/* Dental Cross Grid representing 4 quadrants */}
            <div className="grid grid-cols-2 gap-2 relative bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-xl mx-auto">
              
              {/* Vertical Dental Cross line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 -translate-x-1/2 pointer-events-none"></div>
              {/* Horizontal Dental Cross line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300 -translate-y-1/2 pointer-events-none"></div>

              {/* Upper Right Quadrant (Screen Top-Left) */}
              <div className="pb-3 pr-3 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">UPPER RIGHT (UR)</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {adultUR.map(num => {
                    const code = `UR${num}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Upper Right ${num}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upper Left Quadrant (Screen Top-Right) */}
              <div className="pb-3 pl-3 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">UPPER LEFT (UL)</span>
                <div className="flex flex-wrap gap-1 justify-start">
                  {adultUL.map(num => {
                    const code = `UL${num}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Upper Left ${num}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lower Right Quadrant (Screen Bottom-Left) */}
              <div className="pt-3 pr-3 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">LOWER RIGHT (LR)</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {adultLR.map(num => {
                    const code = `LR${num}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Lower Right ${num}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lower Left Quadrant (Screen Bottom-Right) */}
              <div className="pt-3 pl-3 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">LOWER LEFT (LL)</span>
                <div className="flex flex-wrap gap-1 justify-start">
                  {adultLL.map(num => {
                    const code = `LL${num}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Lower Left ${num}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Child Teeth (Deciduous) */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                2. Child Teeth (Deciduous Dentition - A to E)
              </h4>
            </div>

            {/* Dental Cross Grid representing 4 child quadrants */}
            <div className="grid grid-cols-2 gap-2 relative bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-xl mx-auto">
              
              {/* Vertical Dental Cross line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 -translate-x-1/2 pointer-events-none"></div>
              {/* Horizontal Dental Cross line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300 -translate-y-1/2 pointer-events-none"></div>

              {/* Upper Right Quadrant (Screen Top-Left) */}
              <div className="pb-3 pr-3 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CHILD UPPER RIGHT (C-UR)</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {childUR.map(letter => {
                    const code = `C-UR-${letter}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Child Upper Right ${letter}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upper Left Quadrant (Screen Top-Right) */}
              <div className="pb-3 pl-3 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CHILD UPPER LEFT (C-UL)</span>
                <div className="flex flex-wrap gap-1 justify-start">
                  {childUL.map(letter => {
                    const code = `C-UL-${letter}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Child Upper Left ${letter}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lower Right Quadrant (Screen Bottom-Left) */}
              <div className="pt-3 pr-3 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CHILD LOWER RIGHT (C-LR)</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {childLR.map(letter => {
                    const code = `C-LR-${letter}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Child Lower Right ${letter}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lower Left Quadrant (Screen Bottom-Right) */}
              <div className="pt-3 pl-3 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CHILD LOWER LEFT (C-LL)</span>
                <div className="flex flex-wrap gap-1 justify-start">
                  {childLL.map(letter => {
                    const code = `C-LL-${letter}`;
                    const isSelected = selectedTeeth.has(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTooth(code)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title={`Child Lower Left ${letter}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm font-semibold text-slate-600">
            Selected: {selectedTeeth.size > 0 ? (
              <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded font-mono text-xs font-bold">
                {Array.from(selectedTeeth).map(formatToothCode).join(', ')}
              </span>
            ) : (
              <span className="text-slate-400 italic">None</span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-100 cursor-pointer text-sm transition-all"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 cursor-pointer text-sm transition-all shadow-md"
            >
              Apply Position
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
