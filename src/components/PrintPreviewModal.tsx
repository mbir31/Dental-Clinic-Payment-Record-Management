import React from 'react';
import { Patient, Visit, AppSettings } from '../types';
import YashfinLogo from './YashfinLogo';

interface PrintPreviewModalProps {
  patient: Patient;
  settings: AppSettings;
  activeVisits: Visit[]; // Size 11
  isCompleted: boolean;
  onClose: () => void;
  onPrint: () => void;
  discount?: number;
  tax?: number;
}

export default function PrintPreviewModal({
  patient,
  settings,
  activeVisits,
  isCompleted,
  onClose,
  onPrint,
  discount,
  tax
}: PrintPreviewModalProps) {
  
  // Find index of the latest filled treatment row
  const getLatestFilledRowIndex = () => {
    let latestIndex = -1;
    for (let i = 0; i < activeVisits.length; i++) {
      if (activeVisits[i].procedure.trim() !== '' || activeVisits[i].payment !== '') {
        latestIndex = i;
      }
    }
    return latestIndex;
  };

  const latestIndex = getLatestFilledRowIndex();

  // Apply typography font family safely
  const getFontFamilyStyle = () => {
    switch (settings.print.fontFamily) {
      case 'monospace':
        return 'Courier New, Courier, monospace';
      case 'serif':
        return 'Georgia, "Times New Roman", serif';
      case 'inter':
        return '"Inter", sans-serif';
      case 'space-grotesk':
        return '"Space Grotesk", sans-serif';
      case 'playfair-display':
        return '"Playfair Display", serif';
      case 'georgia':
        return 'Georgia, serif';
      case 'courier-new':
        return '"Courier New", monospace';
      case 'jetbrains-mono':
        return '"JetBrains Mono", monospace';
      case 'arial':
        return 'Arial, sans-serif';
      case 'times-new-roman':
        return '"Times New Roman", serif';
      default:
        return 'Inter, ui-sans-serif, system-ui, sans-serif';
    }
  };

  // Custom colors and settings from options
  const colorHeader = settings.print.colorHeader || '#000000';
  const colorTable = settings.print.colorTable || '#000000';
  const colorFooter = settings.print.colorFooter || '#000000';
  const colorTotal = settings.print.colorTotal || '#000000';
  const colorTeeth = settings.print.colorTeeth || '#000000';
  const showSignature = settings.print.showSignature || false;
  const signatureText = settings.print.signatureText || "Doctor's Signature / Initial";
  const printTitle = settings.branding.printTitle || 'CLINICAL RECORD';

  const subtotal = calculateTotal(activeVisits);
  const discountAmount = discount ?? patient.discount ?? 0;
  const taxRate = tax ?? patient.tax ?? 0;
  const taxAmount = Math.round((subtotal - discountAmount) * (taxRate / 100));
  const grandTotal = subtotal - discountAmount + taxAmount;
  const currency = settings.print.currencySymbol || 'BDT';

  // Rule: In print update/preview mode, clinic header and metadata are always hidden.
  const showHeader = false;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">🖨 Print Layout Alignment Guide (A4)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Interactive spatial calibration. Grayed rows are guides and will be blank on print.</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>

        {/* Scaled A4 Preview Sheet Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          
          {/* Simulated A4 Paper */}
          <div
            id="simulated-a4-paper"
            className="bg-white shadow-lg text-black relative select-none"
            style={{
              width: '210mm',
              minHeight: '297mm',
              paddingTop: `${settings.print.marginTop}mm`,
              paddingLeft: `${settings.print.marginLeft}mm`,
              paddingRight: '15mm',
              fontSize: `${settings.print.fontSize}pt`,
              fontFamily: getFontFamilyStyle(),
              lineHeight: '1.2'
            }}
          >
            
            {/* Branding Header (Only printed on first visit or full logs, and ONLY if treatment is completed) */}
            <div style={{ visibility: showHeader ? 'visible' : 'hidden', height: showHeader ? 'auto' : '0px', overflow: 'hidden' }}>
              <div className="border-b border-black pb-4 mb-6 flex justify-between items-center" style={{ color: colorHeader }}>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">{settings.branding.name}</h1>
                  <p className="text-xs italic opacity-60">{settings.branding.subtitle || 'Dental Clinical Records'}</p>
                </div>
                {settings.branding.logo ? (
                  <img
                    className="max-h-12 max-w-[120px] object-contain"
                    src={settings.branding.logo}
                    alt="Logo"
                  />
                ) : (
                  <YashfinLogo size={56} className="w-14 h-14" />
                )}
              </div>
            </div>

            {!showHeader && (
              // Empty placeholder keeping identical layout height offset for non-first or non-completed visits
              <div className="h-[70px] border-b border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold select-none mb-6">
                Header Area (Hidden for subsequent row alignment / Treatment is Running)
              </div>
            )}

            {/* Patient Credentials */}
            <div style={{ visibility: showHeader ? 'visible' : 'hidden', height: showHeader ? 'auto' : '0px', overflow: 'hidden' }}>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm" style={{ color: colorHeader }}>
                <div><strong>Patient Name:</strong> {patient.name}</div>
                <div className="text-right"><strong>Registration No:</strong> <span className="font-mono font-bold">{patient.regNumber}</span></div>
              </div>
            </div>

            {!showHeader && (
              <div className="h-[24px] border-b border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold mb-6">
                Patient Credentials (Hidden for subsequent row alignment / Treatment is Running)
              </div>
            )}

            {/* Clinical Record Table */}
            <table className="w-full border-collapse border-none">
              <thead>
                {/* Row 1: Merged Title */}
                <tr
                  className="border-none"
                  style={{
                    height: `${settings.print.rowSpacing}mm`,
                    visibility: showHeader ? 'visible' : 'hidden'
                  }}
                >
                  <th colSpan={3} className="text-center font-extrabold text-base tracking-widest pb-2 border-none animate-fade-in" style={{ color: colorHeader }}>
                    {printTitle}
                  </th>
                </tr>
                {/* Row 2: Headers */}
                <tr
                  className={showHeader ? "border-b border-black" : "border-none"}
                  style={{
                    height: `${settings.print.rowSpacing}mm`,
                    visibility: showHeader ? 'visible' : 'hidden'
                  }}
                >
                  <th className="text-left py-1 font-bold border-none" style={{ width: `${settings.print.colWidthDate}%`, color: colorHeader }}>DATE</th>
                  <th className="text-left py-1 font-bold border-none" style={{ width: `${settings.print.colWidthProc}%`, color: colorHeader }}>PROCEDURE</th>
                  <th className="text-right py-1 font-bold border-none" style={{ width: `${settings.print.colWidthPay}%`, color: colorHeader }}>PAYMENT</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows 3-13 (11 treatment rows) */}
                {activeVisits.map((v, idx) => {
                  // In re-print mode, only show the latest filled row
                  const isPrintedRow = idx === latestIndex;
                  const rowStyle = !isPrintedRow
                    ? {
                        height: `${settings.print.rowSpacing}mm`,
                        backgroundColor: '#f8fafc',
                        outline: '1px dashed rgba(148, 163, 184, 0.35)',
                        opacity: 0.3,
                        color: colorTable
                      }
                    : {
                        height: `${settings.print.rowSpacing}mm`,
                        color: colorTable
                      };

                  const isFilled = v.procedure.trim() !== '' || v.payment !== '';

                  return (
                    <tr key={idx} style={rowStyle} className="border-none">
                      <td className="py-1 border-none font-mono" style={{ width: `${settings.print.colWidthDate}%` }}>
                        {isFilled ? (v.date || '') : ''}
                      </td>
                      <td className="py-1 border-none" style={{ width: `${settings.print.colWidthProc}%` }}>
                        <span>{v.procedure || ''}</span>
                        {v.teeth && (
                          <span className="ml-2 font-mono text-xs font-black px-1 py-0.5 rounded bg-slate-50" style={{ color: colorTeeth }}>
                            [Teeth: {v.teeth}]
                          </span>
                        )}
                      </td>
                      <td className="py-1 border-none text-right font-mono" style={{ width: `${settings.print.colWidthPay}%` }}>
                        {v.payment !== '' ? parseFloat(v.payment.toString()).toLocaleString() : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Row helper inside preview */}
            <div className="mt-6 p-3 border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-xs font-bold text-center select-none no-print rounded animate-fade-in">
              🔒 Total Invoice Summary & Signatures are hidden during Print Update.
              <p className="text-[10px] font-normal text-slate-400 mt-1">They are only printed when performing a "PRINT FULL RECORD".</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-500 max-w-md">
            <strong>Calibration Tip:</strong> Adjust top/left margins and row spacing in Settings to align perfectly with lines on your physical clinic records cards.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onPrint}
              className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 hover:shadow-md cursor-pointer text-sm"
            >
              Print Calibration Slip
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Calculate sum total
function calculateTotal(visits: Visit[]) {
  let sum = 0;
  visits.forEach((v) => {
    if (v.payment !== '' && !isNaN(Number(v.payment))) {
      sum += Number(v.payment);
    }
  });
  return sum;
}
