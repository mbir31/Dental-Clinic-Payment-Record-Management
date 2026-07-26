import React, { useState } from 'react';
import { AppSettings, Patient, ShorthandPreset } from '../types';
import { generateOfflineHtml } from '../data';

interface SettingsPanelProps {
  settings: AppSettings;
  patients: Patient[];
  onSaveSettings: (settings: AppSettings) => void;
  onResetDatabase: () => void;
  onNavigateHome: () => void;
  onImportBackup: (importedPatients: Patient[], importedSettings: AppSettings) => void;
  liveSyncStatus?: string;
  onSetupLiveSync?: () => void;
  onDisconnectLiveSync?: () => void;
}

type SettingsTab = 'print' | 'branding' | 'suggestions' | 'shorthands' | 'backup' | 'security' | 'reset';

export default function SettingsPanel({
  settings,
  patients,
  onSaveSettings,
  onResetDatabase,
  onNavigateHome,
  onImportBackup,
  liveSyncStatus = 'Not Connected',
  onSetupLiveSync,
  onDisconnectLiveSync
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('print');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [clinicLogo, setClinicLogo] = useState(settings.branding.logo);
  const [pinInput, setPinInput] = useState(settings.adminPin || '1234');
  const [pinError, setPinError] = useState('');

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numeric 4-digit PIN only
    setPinInput(val);
    if (val.length < 4) {
      setPinError('PIN must be exactly 4 numeric digits.');
    } else {
      setPinError('');
      onSaveSettings({
        ...settings,
        adminPin: val
      });
    }
  };

  // Form states matching settings
  const [marginTop, setMarginTop] = useState(settings.print.marginTop);
  const [marginLeft, setMarginLeft] = useState(settings.print.marginLeft);
  const [rowSpacing, setRowSpacing] = useState(settings.print.rowSpacing);
  const [fontSize, setFontSize] = useState(settings.print.fontSize);
  const [fontFamily, setFontFamily] = useState(settings.print.fontFamily);
  const [colWidthDate, setColWidthDate] = useState(settings.print.colWidthDate);
  const [colWidthProc, setColWidthProc] = useState(settings.print.colWidthProc);
  const [colWidthPay, setColWidthPay] = useState(settings.print.colWidthPay);

  const [colorHeader, setColorHeader] = useState(settings.print.colorHeader || '#000000');
  const [colorTable, setColorTable] = useState(settings.print.colorTable || '#000000');
  const [colorFooter, setColorFooter] = useState(settings.print.colorFooter || '#000000');
  const [colorTotal, setColorTotal] = useState(settings.print.colorTotal || '#000000');
  const [colorTeeth, setColorTeeth] = useState(settings.print.colorTeeth || '#000000');
  const [showSignature, setShowSignature] = useState(settings.print.showSignature ?? false);
  const [signatureText, setSignatureText] = useState(settings.print.signatureText || "Doctor's Signature / Initial");
  const [currencySymbol, setCurrencySymbol] = useState(settings.print.currencySymbol || 'BDT');

  // Shorthands input state
  const [newShorthandKey, setNewShorthandKey] = useState('');
  const [newShorthandText, setNewShorthandText] = useState('');
  const [newShorthandPrice, setNewShorthandPrice] = useState<string>('');

  const [clinicName, setClinicName] = useState(settings.branding.name);
  const [clinicSubtitle, setClinicSubtitle] = useState(settings.branding.subtitle || '');
  const [footerText, setFooterText] = useState(settings.branding.footerText);
  const [printTitle, setPrintTitle] = useState(settings.branding.printTitle || 'CLINICAL RECORD');

  // Handle saving print parameters dynamically
  const triggerSavePrint = (updates: Partial<typeof settings.print>) => {
    const updatedPrint = {
      marginTop,
      marginLeft,
      rowSpacing,
      fontSize,
      fontFamily,
      colWidthDate,
      colWidthProc,
      colWidthPay,
      colorHeader,
      colorTable,
      colorFooter,
      colorTotal,
      colorTeeth,
      showSignature,
      signatureText,
      currencySymbol,
      ...updates
    };
    onSaveSettings({
      ...settings,
      print: updatedPrint
    });
  };

  // Handle saving branding parameters
  const triggerSaveBranding = (updates: Partial<typeof settings.branding>) => {
    const updatedBranding = {
      name: clinicName,
      subtitle: clinicSubtitle,
      logo: clinicLogo,
      footerText,
      printTitle,
      ...updates
    };
    onSaveSettings({
      ...settings,
      branding: updatedBranding
    });
  };

  // Suggestion adding/deleting
  const handleAddSuggestion = () => {
    const val = newSuggestion.trim();
    if (!val) return;
    if (settings.suggestions.includes(val)) {
      alert('This procedure already exists in suggestions list!');
      return;
    }
    const updated = [...settings.suggestions, val];
    onSaveSettings({
      ...settings,
      suggestions: updated
    });
    setNewSuggestion('');
  };

  const handleDeleteSuggestion = (idx: number) => {
    const updated = [...settings.suggestions];
    updated.splice(idx, 1);
    onSaveSettings({
      ...settings,
      suggestions: updated
    });
  };

  const handleAddShorthand = () => {
    const key = newShorthandKey.trim().toUpperCase();
    const text = newShorthandText.trim();
    if (!key) {
      alert('Shorthand code cannot be empty!');
      return;
    }
    if (!text) {
      alert('Expanded text description cannot be empty!');
      return;
    }
    
    const currentList = settings.shorthands || [];
    if (currentList.some(s => s.key === key)) {
      alert(`Shorthand code "${key}" already exists!`);
      return;
    }

    const priceNum = newShorthandPrice === '' ? '' : parseFloat(newShorthandPrice);
    const item: ShorthandPreset = {
      key,
      text,
      price: isNaN(Number(priceNum)) ? '' : (priceNum as number | '')
    };

    onSaveSettings({
      ...settings,
      shorthands: [...currentList, item]
    });

    setNewShorthandKey('');
    setNewShorthandText('');
    setNewShorthandPrice('');
  };

  const handleDeleteShorthand = (key: string) => {
    const currentList = settings.shorthands || [];
    const updated = currentList.filter(s => s.key !== key);
    onSaveSettings({
      ...settings,
      shorthands: updated
    });
  };

  // Logo upload Base64 encoding
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert('File size exceeds the 500KB limit! Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setClinicLogo(base64);
      triggerSaveBranding({ logo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = () => {
    setClinicLogo('');
    triggerSaveBranding({ logo: '' });
  };

  // JSON Export Backup
  const handleExportBackup = () => {
    const backupData = {
      patients,
      settings,
      backupTime: Date.now()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smile_Dental_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (importEvent) => {
      try {
        const parsed = JSON.parse(importEvent.target?.result as string);
        if (parsed.patients && parsed.settings) {
          const yes = confirm('Importing backup will completely overwrite all current patient cards and layout settings. Continue?');
          if (yes) {
            onImportBackup(parsed.patients, parsed.settings);
            alert('Database restored successfully from backup!');
            onNavigateHome();
          }
        } else {
          alert('Incorrect backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse file as valid JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  // TRIGGER STANDALONE OFFLINE APP EXPORT
  const handleDownloadOfflineApp = () => {
    // Generate standalone offline self-contained HTML file compiled with current state!
    const htmlContent = generateOfflineHtml(
      JSON.stringify(patients),
      JSON.stringify(settings)
    );
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dental_Clinic_Offline_App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="screen-settings" className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚙</span> Calibration Settings Panel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Calibrate margins, manage backup syncs, or export full offline software</p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-sm font-medium text-sky-600 hover:underline cursor-pointer"
        >
          ← Back to Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 mt-4">
        
        {/* Settings Tab Sidebar */}
        <div className="flex flex-col gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200/60 h-fit">
          <button
            onClick={() => setActiveTab('print')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'print' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            🖨 Print Layout
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'branding' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            🏥 Clinic Branding
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'suggestions' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            🦷 Suggestions
          </button>
          <button
            onClick={() => setActiveTab('shorthands')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'shorthands' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            ⌨️ Shorthand Expander
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'backup' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            💾 Backup & Export
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'security' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            🔑 Security PIN
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-4 py-2 text-left text-sm font-bold rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
              activeTab === 'reset' ? 'bg-red-600 text-white hover:bg-red-700' : ''
            }`}
          >
            ⚠️ Reset Database
          </button>
        </div>

        {/* Tab contents */}
        <div className="min-h-[350px]">
          
          {/* Print Tab */}
          {activeTab === 'print' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-700 pb-2 border-b border-slate-100">
                Print Margin & Alignment Calibration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Top Margin (mm)</label>
                  <input
                    type="number"
                    min="0"
                    value={marginTop}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      setMarginTop(num);
                      triggerSavePrint({ marginTop: num });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Left Margin (mm)</label>
                  <input
                    type="number"
                    min="0"
                    value={marginLeft}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      setMarginLeft(num);
                      triggerSavePrint({ marginLeft: num });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Row Spacing / Height (mm)</label>
                  <input
                    type="number"
                    min="1"
                    value={rowSpacing}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 12;
                      setRowSpacing(num);
                      triggerSavePrint({ rowSpacing: num });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Font Size (pt)</label>
                  <input
                    type="number"
                    min="6"
                    value={fontSize}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 11;
                      setFontSize(num);
                      triggerSavePrint({ fontSize: num });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      triggerSavePrint({ fontFamily: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="sans-serif">Modern Sans-Serif (Default)</option>
                    <option value="serif">Classic Serif (Default)</option>
                    <option value="monospace">Tabular Monospace (Default)</option>
                    <option value="inter">Inter (Clean Sans)</option>
                    <option value="space-grotesk">Space Grotesk (Tech Display)</option>
                    <option value="playfair-display">Playfair Display (Elegant Editorial)</option>
                    <option value="georgia">Georgia (Classic Book)</option>
                    <option value="courier-new">Courier New (Legacy Typewriter)</option>
                    <option value="jetbrains-mono">JetBrains Mono (Modern Coding)</option>
                    <option value="arial">Arial (Standard Clean)</option>
                    <option value="times-new-roman">Times New Roman (Standard Serif)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => {
                      setCurrencySymbol(e.target.value);
                      triggerSavePrint({ currencySymbol: e.target.value });
                    }}
                    placeholder="e.g. BDT, ৳, $, £"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wide mb-3">
                  Column Width Ratio Allocations (%)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Date Col (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="80"
                      value={colWidthDate}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value) || 20;
                        setColWidthDate(num);
                        triggerSavePrint({ colWidthDate: num });
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Procedure Col (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="80"
                      value={colWidthProc}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value) || 60;
                        setColWidthProc(num);
                        triggerSavePrint({ colWidthProc: num });
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Payment Col (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="80"
                      value={colWidthPay}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value) || 20;
                        setColWidthPay(num);
                        triggerSavePrint({ colWidthPay: num });
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                    />
                  </div>
                </div>
                <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                  Sum of values should equal 100% (currently: {colWidthDate + colWidthProc + colWidthPay}%)
                </span>
              </div>

              {/* 🎨 FONT COLORS SELECTION SECTION */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  🎨 Printed Text & Font Colors
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Header text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHeader}
                        onChange={(e) => {
                          setColorHeader(e.target.value);
                          triggerSavePrint({ colorHeader: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600">{colorHeader.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Table Content</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorTable}
                        onChange={(e) => {
                          setColorTable(e.target.value);
                          triggerSavePrint({ colorTable: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600">{colorTable.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Footer text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorFooter}
                        onChange={(e) => {
                          setColorFooter(e.target.value);
                          triggerSavePrint({ colorFooter: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600">{colorFooter.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Total Row line</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorTotal}
                        onChange={(e) => {
                          setColorTotal(e.target.value);
                          triggerSavePrint({ colorTotal: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600">{colorTotal.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Teeth text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorTeeth}
                        onChange={(e) => {
                          setColorTeeth(e.target.value);
                          triggerSavePrint({ colorTeeth: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-600">{colorTeeth.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✍️ INITIALS / SIGNATURES OPTIONS */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  ✍️ Signature / Initial Block
                </h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSignature}
                      onChange={(e) => {
                        setShowSignature(e.target.checked);
                        triggerSavePrint({ showSignature: e.target.checked });
                      }}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                    />
                    Enable Doctor's Signature / Initial Block on Printed Slips
                  </label>

                  {showSignature && (
                    <div className="pl-6 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Signature Designation Label</label>
                      <input
                        type="text"
                        value={signatureText}
                        onChange={(e) => {
                          setSignatureText(e.target.value);
                          triggerSavePrint({ signatureText: e.target.value });
                        }}
                        className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800 text-sm"
                        placeholder="e.g. Doctor's Signature"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-700 pb-2 border-b border-slate-100">
                Clinic Identity & Headers
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => {
                    setClinicName(e.target.value);
                    triggerSaveBranding({ name: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Clinic Subtitle</label>
                <input
                  type="text"
                  value={clinicSubtitle}
                  onChange={(e) => {
                    setClinicSubtitle(e.target.value);
                    triggerSaveBranding({ subtitle: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Printed Slip Footer Greeting</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => {
                    setFooterText(e.target.value);
                    triggerSaveBranding({ footerText: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Printed Record Title (Header of the printed sheet)</label>
                <input
                  type="text"
                  value={printTitle}
                  onChange={(e) => {
                    setPrintTitle(e.target.value);
                    triggerSaveBranding({ printTitle: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  placeholder="e.g. CLINICAL RECORD"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Clinic Logo Image (PNG/JPEG - Max 500KB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none font-medium text-slate-800"
                />
                
                {clinicLogo && (
                  <div className="mt-3 p-3 border border-slate-200 rounded flex items-center justify-between">
                    <img className="max-h-10 object-contain" src={clinicLogo} alt="Logo" />
                    <button
                      onClick={handleDeleteLogo}
                      className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs font-bold hover:bg-rose-100 cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-700 pb-2 border-b border-slate-100">
                Default Treatment Suggestions
              </h3>

              <div className="border border-slate-200 rounded-lg p-2 max-h-56 overflow-y-auto flex flex-col gap-1.5">
                {settings.suggestions.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-150 px-3 py-1.5 rounded">
                    <span className="text-sm font-semibold text-slate-700">{s}</span>
                    <button
                      onClick={() => handleDeleteSuggestion(idx)}
                      className="text-rose-500 hover:text-rose-700 font-extrabold text-base px-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800 text-sm"
                  placeholder="Type a new treatment procedure to save..."
                />
                <button
                  onClick={handleAddSuggestion}
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded hover:bg-sky-700 transition-colors cursor-pointer text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Shorthands Tab */}
          {activeTab === 'shorthands' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-slate-700 pb-1 border-b border-slate-100">
                  ⌨️ Shorthand Text Expander Presets
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Define short codes (e.g. "CR") that expand instantly to long medical procedure descriptions (e.g. "Composite Restoration") and automatically set a default price when you press space/enter or select them!
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-2 max-h-60 overflow-y-auto flex flex-col gap-1.5">
                {(settings.shorthands || []).length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-medium">
                    No custom shorthands defined. Add one below to speed up your treatment entries!
                  </div>
                ) : (
                  (settings.shorthands || []).map((sh, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-150 px-3 py-1.5 rounded">
                      <div>
                        <span className="font-mono bg-slate-200 text-slate-800 text-xs font-bold px-1.5 py-0.5 rounded mr-2 border border-slate-300">
                          {sh.key}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{sh.text}</span>
                        {sh.price !== '' && (
                          <span className="text-xs text-sky-600 font-mono font-bold ml-2">
                            ({currencySymbol} {sh.price.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteShorthand(sh.key)}
                        className="text-rose-500 hover:text-rose-700 font-extrabold text-base px-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Add New Shorthand Preset
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_120px] gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Shorthand Code</label>
                    <input
                      type="text"
                      value={newShorthandKey}
                      onChange={(e) => setNewShorthandKey(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-800 font-mono text-xs"
                      placeholder="e.g. CR"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Expanded Procedure Description</label>
                    <input
                      type="text"
                      value={newShorthandText}
                      onChange={(e) => setNewShorthandText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-800 text-xs"
                      placeholder="e.g. Composite Restoration (Front Tooth)"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Default Price ({currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      value={newShorthandPrice}
                      onChange={(e) => setNewShorthandPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-800 font-mono text-xs"
                      placeholder="e.g. 1500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddShorthand}
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors cursor-pointer text-xs w-fit align-self-end mt-1"
                >
                  Save Shorthand Code
                </button>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-700 pb-2 border-b border-slate-100">
                Local Database Backups
              </h3>
              <p className="text-sm text-slate-500">
                Saves all patient visits and payment histories. Export a JSON file to transfer data to another clinic PC.
              </p>

              <div className="flex gap-4 flex-wrap mt-2">
                <button
                  onClick={handleExportBackup}
                  className="px-5 py-2.5 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 hover:shadow shadow-sky-600/10 cursor-pointer flex items-center gap-1.5 text-sm"
                >
                  📥 EXPORT BACKUP (.json)
                </button>

                <label className="px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-lg hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 text-sm">
                  📤 IMPORT BACKUP (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Live instant local backup file system sync */}
              <div className="border-t border-slate-100 pt-6 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  ⚡ Instant Automatic Local Backup Sync
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  Instantly syncs and writes updated JSON logs directly to a designated file on your local PC or shared folder right after you click save, update, or print! No manual triggers or download popups required.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${liveSyncStatus.includes('Synced') ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                      <span className="text-xs font-bold text-slate-700">Live Folder Sync:</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1 font-medium">{liveSyncStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    {onSetupLiveSync && (
                      <button
                        onClick={onSetupLiveSync}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        🔗 Choose Live Sync File
                      </button>
                    )}
                    {onDisconnectLiveSync && liveSyncStatus !== 'Not Connected' && (
                      <button
                        onClick={onDisconnectLiveSync}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded text-xs transition-all cursor-pointer"
                      >
                        Disconnect Sync
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stands out Export HTML trigger */}
              <div className="border-t border-slate-100 pt-6 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800">
                  📦 Export Complete Standalone Software
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">
                  Downloads this entire clinic system as a single .html file that runs 100% offline without any internet from a flash drive!
                </p>
                <button
                  onClick={handleDownloadOfflineApp}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 hover:shadow shadow-emerald-600/10 cursor-pointer text-sm"
                >
                  📥 DOWNLOAD STANDALONE OFFLINE APP (.html)
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-6 animate-fade-in bg-white p-5 rounded-xl border border-slate-150 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span>🔐</span> Security Passcode PIN
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Protect administrative actions and settings modifications.
                  Your current admin PIN is used whenever anyone clicks Settings or attempts database operations.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Set New 4-Digit PIN</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinInput}
                    onChange={handlePinChange}
                    placeholder="••••"
                    className="w-40 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-center text-xl font-extrabold tracking-widest text-slate-800 shadow-inner bg-slate-50"
                  />
                  <div className="text-xs">
                    {pinError ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1.5">
                        ❌ {pinError}
                      </span>
                    ) : pinInput.length === 4 ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1.5 animate-pulse">
                        ✨ PIN successfully updated & saved!
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Enter 4 numeric digits.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Tab */}
          {activeTab === 'reset' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-rose-600 pb-2 border-b border-rose-100">
                ⚠️ Permanent Database Wipe
              </h3>
              <p className="text-sm text-slate-500">
                This will delete every patient card, registration entry, visit logs, payments, and clinic branding. It cannot be undone.
              </p>

              <button
                onClick={onResetDatabase}
                className="px-5 py-3 bg-rose-600 text-white font-extrabold rounded-lg hover:bg-rose-700 cursor-pointer w-fit text-sm"
              >
                ☠️ WIPE CLINIC DATABASE
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
