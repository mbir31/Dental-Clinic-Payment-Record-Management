import React, { useState, useEffect } from 'react';
import { Patient, Visit, AppSettings } from './types';
import { DEFAULT_SETTINGS, generateOfflineHtml } from './data';
import HomeMenu from './components/HomeMenu';
import AllPatients from './components/AllPatients';
import SearchEntry from './components/SearchEntry';
import NewPatient from './components/NewPatient';
import ClinicalTable from './components/ClinicalTable';
import SettingsPanel from './components/SettingsPanel';
import PrintPreviewModal from './components/PrintPreviewModal';
import PasswordPrompt from './components/PasswordPrompt';
import YashfinLogo from './components/YashfinLogo';
import {
  isFileSystemAccessSupported,
  saveHandleToIndexedDB,
  getHandleFromIndexedDB,
  clearHandleFromIndexedDB,
  verifyPermission,
  writeDatabaseToFile
} from './utils/dbSync';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Navigation Screens
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [previousScreen, setPreviousScreen] = useState<string>('home');
  
  // Active selected patient record states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  
  // Password prompt triggers
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [passwordSuccessCallback, setPasswordSuccessCallback] = useState<(() => void) | null>(null);
  
  // Printing states
  const [printMode, setPrintMode] = useState<'update' | 'full'>('update');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [printIsCompleted, setPrintIsCompleted] = useState(false);
  const [previewDiscount, setPreviewDiscount] = useState<number | undefined>(undefined);
  const [previewTax, setPreviewTax] = useState<number | undefined>(undefined);

  // Live File Sync States
  const [liveSyncHandle, setLiveSyncHandle] = useState<any>(null);
  const [liveSyncStatus, setLiveSyncStatus] = useState<string>('Not Connected');

  // Load database from LocalStorage & restore Live File Sync Handle from IndexedDB
  useEffect(() => {
    const storedPatients = localStorage.getItem('dental_patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    } else {
      // Seed with sample structure if empty
      setPatients([]);
    }

    const storedSettings = localStorage.getItem('dental_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      localStorage.setItem('dental_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    // Try to restore sync handle
    async function loadSyncHandle() {
      if (!isFileSystemAccessSupported()) {
        setLiveSyncStatus('Not supported by this browser (Use Chrome, Edge, or Opera on Desktop)');
        return;
      }
      try {
        const storedHandle = await getHandleFromIndexedDB();
        if (storedHandle) {
          setLiveSyncHandle(storedHandle);
          const hasPerm = await storedHandle.queryPermission({ mode: 'readwrite' });
          if (hasPerm === 'granted') {
            setLiveSyncStatus(`Synced with: ${storedHandle.name}`);
          } else {
            setLiveSyncStatus(`Reconnect required: Click to sync with ${storedHandle.name}`);
          }
        }
      } catch (err) {
        console.error('Error loading sync handle from IndexedDB:', err);
      }
    }
    loadSyncHandle();
  }, []);

  // Trigger automatic file sync on data changes (debounced to group rapid changes)
  useEffect(() => {
    if (!liveSyncHandle) return;

    async function syncData() {
      try {
        const hasPerm = await liveSyncHandle!.queryPermission({ mode: 'readwrite' });
        if (hasPerm === 'granted') {
          await writeDatabaseToFile(liveSyncHandle!, patients, settings);
          setLiveSyncStatus(`Synced with: ${liveSyncHandle!.name}`);
        } else {
          setLiveSyncStatus(`Reconnect required: Click to sync with ${liveSyncHandle!.name}`);
        }
      } catch (err) {
        console.error('Failed to sync to file:', err);
      }
    }

    const timer = setTimeout(() => {
      syncData();
    }, 500);

    return () => clearTimeout(timer);
  }, [patients, settings, liveSyncHandle]);

  const handleSetupLiveSync = async () => {
    if (!isFileSystemAccessSupported()) {
      alert('The File System Access API is not supported in your browser. Please use a Chromium-based desktop browser like Chrome, Edge, or Opera.');
      return;
    }

    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isIframe) {
      alert(
        "⚠️ Browser Security Limitation:\n\n" +
        "You are currently viewing this app inside a preview iframe.\n" +
        "Modern web browsers block direct File System Access APIs inside iframes for security.\n\n" +
        "To use Live Sync:\n" +
        "1. Click the 'Open in a new tab' button at the top-right of the preview window.\n" +
        "2. Open Settings and connect your live sync file there!\n\n" +
        "Alternatively, you can use the '📥 BACKUP DATABASE' button above to manually download your logs anytime."
      );
      return;
    }

    try {
      // If there is already a handle but it requires reconnection, request permission directly
      if (liveSyncHandle) {
        const hasPermission = await verifyPermission(liveSyncHandle, true);
        if (hasPermission) {
          setLiveSyncStatus(`Synced with: ${liveSyncHandle.name}`);
          await writeDatabaseToFile(liveSyncHandle, patients, settings);
          alert(`Reconnected successfully! Live sync has resumed with ${liveSyncHandle.name}.`);
          return;
        }
      }

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'Smile_Dental_Backup.json',
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
      });

      const hasPermission = await verifyPermission(handle, true);
      if (hasPermission) {
        await saveHandleToIndexedDB(handle);
        setLiveSyncHandle(handle);
        setLiveSyncStatus(`Synced with: ${handle.name}`);
        await writeDatabaseToFile(handle, patients, settings);
        alert(`Successfully connected! Live sync has started with ${handle.name}. Every change you make will now write to this file instantly.`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error setting up live sync:', err);
        if (err.name === 'SecurityError' || err.message?.includes('sub frame') || err.message?.includes('cross origin')) {
          alert(
            "⚠️ Browser Security Restriction:\n\n" +
            "Direct File System Access is blocked in sub-frames/iframes.\n" +
            "Please open the application in a new tab using the top-right button to use the live sync feature, or use standard manual backups instead."
          );
        } else {
          alert('Failed to set up live sync: ' + err.message);
        }
      }
    }
  };

  const handleDisconnectLiveSync = async () => {
    try {
      await clearHandleFromIndexedDB();
      setLiveSyncHandle(null);
      setLiveSyncStatus('Not Connected');
      alert('Live sync has been disconnected.');
    } catch (err: any) {
      console.error('Error disconnecting live sync:', err);
    }
  };

  const savePatients = (updatedPatients: Patient[]) => {
    setPatients(updatedPatients);
    localStorage.setItem('dental_patients', JSON.stringify(updatedPatients));
  };

  const handleNavigate = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  // Safe wrapper to require password
  const requireAdminPassword = (onAuthorized: () => void) => {
    setPasswordSuccessCallback(() => onAuthorized);
    setIsPasswordPromptOpen(true);
  };

  // Registers a new patient with empty visit slots
  const handleRegisterPatient = (name: string, regNumber: string) => {
    const initialVisits = Array.from({ length: 11 }, () => ({
      date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
      procedure: '',
      payment: '' as number | '',
      printed: false
    }));

    const newPatient: Patient = {
      id: `patient_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      regNumber,
      status: 'running',
      visits: initialVisits,
      totalPayment: 0,
      createdAt: Date.now()
    };

    const updated = [...patients, newPatient];
    savePatients(updated);
    
    // Open clinical record screen immediately
    setSelectedPatientId(newPatient.id);
    setActiveVisits(initialVisits);
    setCurrentScreen('clinical-table');
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      // Ensure we have exactly 11 slots
      const clonedVisits = JSON.parse(JSON.stringify(patient.visits)) as Visit[];
      while (clonedVisits.length < 11) {
        clonedVisits.push({
          date: new Date().toLocaleDateString('en-GB'),
          procedure: '',
          payment: '',
          printed: false
        });
      }
      setActiveVisits(clonedVisits.slice(0, 11));
      setCurrentScreen('clinical-table');
    }
  };

  // Clinical record updater
  const handleSaveClinicalRecord = (
    visits: Visit[],
    totalPayment: number,
    status: 'running' | 'completed',
    discount?: number,
    tax?: number
  ) => {
    if (!selectedPatientId) return;

    const updatedPatients = patients.map((p) => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          visits,
          totalPayment,
          status,
          discount: discount !== undefined ? discount : p.discount,
          tax: tax !== undefined ? tax : p.tax
        };
      }
      return p;
    });

    savePatients(updatedPatients);
    alert('Patient record saved successfully!');
    
    // Refresh state
    const currentPatient = updatedPatients.find(p => p.id === selectedPatientId);
    if (currentPatient) {
      setActiveVisits(currentPatient.visits);
    }
  };

  // Trigger print operations
  const handleTriggerPrint = (mode: 'update' | 'full', visitsToPrint: Visit[], isCompleted: boolean) => {
    setPrintMode(mode);
    setActiveVisits(visitsToPrint);
    setPrintIsCompleted(isCompleted);

    // Give react time to populate print frame before executing print dial
    setTimeout(() => {
      // Save print flags to local record
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        const latestIdx = getLatestFilledRowIndex(visitsToPrint);
        const updatedVisits = visitsToPrint.map((v, idx) => {
          if (v.procedure.trim() !== '' || v.payment !== '') {
            if (mode === 'full' || idx === latestIdx) {
              return { ...v, printed: true };
            }
          }
          return v;
        });

        const totalSum = calculateTotal(updatedVisits);
        const updatedPatients = patients.map((p) => {
          if (p.id === selectedPatientId) {
            return {
              ...p,
              visits: updatedVisits,
              totalPayment: totalSum,
              status: isCompleted ? 'completed' : 'running'
            };
          }
          return p;
        });

        savePatients(updatedPatients);
        setActiveVisits(updatedVisits);
      }

      window.print();
    }, 150);
  };

  // Print Preview triggers
  const handleOpenPreview = (visitsToPreview: Visit[], isCompleted: boolean, discount?: number, tax?: number) => {
    setActiveVisits(visitsToPreview);
    setPrintIsCompleted(isCompleted);
    setPreviewDiscount(discount);
    setPreviewTax(tax);
    setShowPreviewModal(true);
  };

  // Settings modification saver
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dental_settings', JSON.stringify(newSettings));
  };

  // Full Database Reset Wiping
  const handleResetDatabase = () => {
    const doubleCheck = confirm('WIPING ALL CLINIC DATA PERMANENTLY: Are you absolutely sure? This cannot be undone.');
    if (doubleCheck) {
      localStorage.clear();
      setPatients([]);
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('dental_settings', JSON.stringify(DEFAULT_SETTINGS));
      setCurrentScreen('home');
      alert('Clinic database cleared successfully. Default configurations restored.');
    }
  };

  // Backup Sync Imports
  const handleImportBackup = (importedPatients: Patient[], importedSettings: AppSettings) => {
    savePatients(importedPatients);
    setSettings(importedSettings);
    localStorage.setItem('dental_settings', JSON.stringify(importedSettings));
  };

  // Get current active patient object
  const activePatient = patients.find(p => p.id === selectedPatientId);

  // Helper inside loop for total
  const calculateTotal = (visitsList: Visit[]) => {
    let sum = 0;
    visitsList.forEach((v) => {
      if (v.payment !== '' && !isNaN(Number(v.payment))) {
        sum += Number(v.payment);
      }
    });
    return sum;
  };

  // Latest filled row index finder
  const getLatestFilledRowIndex = (visitsList: Visit[]) => {
    let latestIndex = -1;
    for (let i = 0; i < visitsList.length; i++) {
      if (visitsList[i].procedure.trim() !== '' || visitsList[i].payment !== '') {
        latestIndex = i;
      }
    }
    return latestIndex;
  };

  const activeLatestIndex = getLatestFilledRowIndex(activeVisits);

  const printSubtotal = calculateTotal(activeVisits);
  const printDiscountAmount = activePatient ? (activePatient.discount || 0) : 0;
  const printTaxRate = activePatient ? (activePatient.tax || 0) : 0;
  const printTaxAmount = Math.round((printSubtotal - printDiscountAmount) * (printTaxRate / 100));
  const printGrandTotal = printSubtotal - printDiscountAmount + printTaxAmount;
  const printCurrency = settings.print.currencySymbol || 'BDT';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Application Header Bar */}
      <header className="bg-white border-b border-slate-200/80 shadow-sm px-6 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          {settings.branding.logo ? (
            <img
              src={settings.branding.logo}
              alt="Logo"
              className="max-h-12 max-w-[120px] object-contain"
            />
          ) : (
            <YashfinLogo size={44} className="w-11 h-11 border border-slate-200/60 rounded-lg shadow-sm bg-white" />
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {settings.branding.name}
            </h1>
            {settings.branding.subtitle && (
              <p className="text-sky-600 text-xs font-bold tracking-wide">
                {settings.branding.subtitle}
              </p>
            )}
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              Dental Clinic Database
            </p>
          </div>
        </div>

        <button
          onClick={() => requireAdminPassword(() => setCurrentScreen('settings'))}
          className="px-4 py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-sm transition-all cursor-pointer flex items-center gap-2"
        >
          ⚙ Settings Panel
        </button>
      </header>

      {/* Main Content Area Container */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl no-print">
        {currentScreen === 'home' && (
          <HomeMenu onNavigate={handleNavigate} />
        )}

        {currentScreen === 'all-patients' && (
          <AllPatients
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'search-entry' && (
          <SearchEntry
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'new-entry' && (
          <NewPatient
            patients={patients}
            onRegisterPatient={handleRegisterPatient}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'update-entry' && (
          <SearchEntry
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNavigateHome={() => setCurrentScreen('home')}
            title="📝 Select Patient to Update"
            placeholder="Search by patient name or reg number to update record..."
          />
        )}

        {currentScreen === 'clinical-table' && activePatient && (
          <ClinicalTable
            patient={activePatient}
            settings={settings}
            onSave={handleSaveClinicalRecord}
            onPrint={handleTriggerPrint}
            onPrintPreview={handleOpenPreview}
            onBack={() => {
              if (previousScreen === 'all-patients' || previousScreen === 'search-entry' || previousScreen === 'update-entry') {
                setCurrentScreen(previousScreen);
              } else {
                setCurrentScreen('home');
              }
            }}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsPanel
            settings={settings}
            patients={patients}
            onSaveSettings={handleSaveSettings}
            onResetDatabase={handleResetDatabase}
            onNavigateHome={() => setCurrentScreen('home')}
            onImportBackup={handleImportBackup}
            liveSyncStatus={liveSyncStatus}
            onSetupLiveSync={handleSetupLiveSync}
            onDisconnectLiveSync={handleDisconnectLiveSync}
          />
        )}
      </main>

      {/* ============================================== */}
      {/* PASSWORD PROMPT MODAL                           */}
      {/* ============================================== */}
      {isPasswordPromptOpen && (
        <PasswordPrompt
          adminPin={settings.adminPin}
          onSuccess={() => {
            setIsPasswordPromptOpen(false);
            if (passwordSuccessCallback) passwordSuccessCallback();
          }}
          onCancel={() => {
            setIsPasswordPromptOpen(false);
            setPasswordSuccessCallback(null);
          }}
        />
      )}

      {/* ============================================== */}
      {/* INTERACTIVE PRINT PREVIEW MODAL                */}
      {/* ============================================== */}
      {showPreviewModal && activePatient && (
        <PrintPreviewModal
          patient={activePatient}
          settings={settings}
          activeVisits={activeVisits}
          isCompleted={printIsCompleted}
          discount={previewDiscount}
          tax={previewTax}
          onClose={() => setShowPreviewModal(false)}
          onPrint={() => {
            setShowPreviewModal(false);
            handleTriggerPrint('update', activeVisits, printIsCompleted);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* HIDDEN PRINT-ONLY CONTAINER FOR PHYSICAL A4 CALIBRATION */}
      {/* ======================================================== */}
      {activePatient && (
        <div
          id="printable-area"
          className="print-only text-black"
          style={{
            paddingTop: `${settings.print.marginTop}mm`,
            paddingLeft: `${settings.print.marginLeft}mm`,
            paddingRight: '15mm',
            fontSize: `${settings.print.fontSize}pt`,
            fontFamily: (() => {
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
                  return 'Arial, sans-serif';
              }
            })(),
            lineHeight: '1.2'
          }}
        >
          
          {/* Case 1: Header and credentials print ONLY in full logs print mode */}
          {printMode === 'full' ? (
            <>
              <div className="border-b border-black pb-4 mb-6 flex justify-between items-center" style={{ color: settings.print.colorHeader || '#000000' }}>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">{settings.branding.name}</h1>
                  <p className="text-xs italic opacity-70">{settings.branding.subtitle || 'Clinical Receipts & Alignment'}</p>
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
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm" style={{ color: settings.print.colorHeader || '#000000' }}>
                <div><strong>Patient Name:</strong> {activePatient.name}</div>
                <div className="text-right"><strong>Registration No:</strong> <span className="font-mono font-bold">{activePatient.regNumber}</span></div>
              </div>
            </>
          ) : (
            // Spacer maintaining position index for re-print overlay
            <>
              <div className="h-[70px] mb-6"></div>
              <div className="h-[24px] mb-6"></div>
            </>
          )}

          {/* Clinical Record Table */}
          <table className="w-full border-collapse border-none">
            <thead>
              {/* Row 1: CLINICAL RECORD MERGED TITLE */}
              <tr
                style={{ height: `${settings.print.rowSpacing}mm`, color: settings.print.colorHeader || '#000000' }}
                className={printMode === 'full' ? 'print-visible' : 'print-invisible'}
              >
                <th colSpan={3} className="text-center font-extrabold text-base tracking-widest pb-2 border-none">
                  {settings.branding.printTitle || 'CLINICAL RECORD'}
                </th>
              </tr>
              {/* Row 2: Header Columns */}
              <tr
                className={`${printMode === 'full' ? 'border-b border-black print-visible' : 'border-none print-invisible'}`}
                style={{ height: `${settings.print.rowSpacing}mm`, color: settings.print.colorHeader || '#000000' }}
              >
                <th className="text-left py-1 font-bold border-none" style={{ width: `${settings.print.colWidthDate}%` }}>DATE</th>
                <th className="text-left py-1 font-bold border-none" style={{ width: `${settings.print.colWidthProc}%` }}>PROCEDURE</th>
                <th className="text-right py-1 font-bold border-none" style={{ width: `${settings.print.colWidthPay}%` }}>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {/* Rows 3-13 (11 treatment rows) */}
              {activeVisits.map((v, idx) => {
                let showRow = false;

                if (printMode === 'full') {
                  showRow = true;
                } else if (printMode === 'update') {
                  // Only print the latest row
                  showRow = (idx === activeLatestIndex);
                }

                const isFilled = v.procedure.trim() !== '' || v.payment !== '';

                return (
                  <tr
                    key={idx}
                    style={{ height: `${settings.print.rowSpacing}mm`, color: settings.print.colorTable || '#000000' }}
                    className={`border-none ${showRow ? 'print-visible' : 'print-invisible'}`}
                  >
                    <td className="py-1 border-none font-mono" style={{ width: `${settings.print.colWidthDate}%` }}>
                      {isFilled ? (v.date || '') : ''}
                    </td>
                    <td className="py-1 border-none" style={{ width: `${settings.print.colWidthProc}%` }}>
                      <span>{v.procedure || ''}</span>
                      {v.teeth && (
                        <span className="ml-2 font-mono text-xs font-black" style={{ color: settings.print.colorTeeth || '#000000' }}>
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

          {/* Total Payment received. Printed ONLY if complete checkbox ticked AND in full print mode */}
          {printIsCompleted && printMode === 'full' ? (
            <div
              className="mt-4 border-t border-black pt-2 flex flex-col gap-1 font-extrabold text-xs print-visible"
              style={{ color: settings.print.colorTotal || '#000000' }}
            >
              {printDiscountAmount > 0 || printTaxRate > 0 ? (
                <>
                  <div className="flex justify-between font-bold" style={{ opacity: 0.75 }}>
                    <span>SUBTOTAL:</span>
                    <span className="font-mono">{printCurrency} {printSubtotal.toLocaleString()}</span>
                  </div>
                  {printDiscountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>DISCOUNT:</span>
                      <span className="font-mono">- {printCurrency} {printDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {printTaxRate > 0 && (
                    <div className="flex justify-between font-bold" style={{ opacity: 0.75 }}>
                      <span>TAX ({printTaxRate}%):</span>
                      <span className="font-mono">+ {printCurrency} {printTaxAmount.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : null}
              <div className="flex justify-between font-extrabold text-sm border-t border-black/20 pt-1 mt-1">
                <span>TREATMENT COMPLETED & TOTAL PAYMENT RECEIVED:</span>
                <span className="font-mono">{printCurrency} = {printGrandTotal.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-2 border border-dashed border-slate-200 text-slate-400 text-xs font-semibold text-center select-none print-invisible">
              Total Payment Row (Only prints on "PRINT FULL RECORD" when Completed)
            </div>
          )}

          {/* Signature Block */}
          {settings.print.showSignature && (
            <div 
              className={`mt-12 flex justify-end ${printIsCompleted && printMode === 'full' ? 'print-visible' : 'print-invisible'}`}
            >
              <div className="text-center" style={{ color: settings.print.colorTable || '#000000' }}>
                <div className="border-b border-black w-48 mb-1"></div>
                <div className="text-xs font-bold font-sans">
                  {settings.print.signatureText || "Doctor's Signature / Initial"}
                </div>
              </div>
            </div>
          )}

          {/* Footer branding */}
          {settings.branding.footerText && (
            <div 
              className={`mt-12 border-t border-dashed border-slate-300 pt-4 text-center text-xs font-sans ${
                printIsCompleted && printMode === 'full' ? 'print-visible' : 'print-invisible'
              }`}
              style={{ color: settings.print.colorFooter || '#000000' }}
            >
              {settings.branding.footerText}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
