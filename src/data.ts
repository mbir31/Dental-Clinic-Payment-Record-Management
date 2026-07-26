import { AppSettings } from './types';

export const DEFAULT_SUGGESTIONS = [
  'Scaling & Polishing',
  'Composite Restoration (Front Tooth)',
  'Composite Restoration (Back Tooth)',
  'GIC Restoration (Glass Ionomer)',
  'Simple Tooth Extraction',
  'Surgical Tooth Extraction',
  'Root Canal Treatment (RCT)',
  'Porcelain Ceramic Crown',
  'Zirconia Premium Crown',
  'Dental X-Ray (Periapical)',
  'Deep Scaling & Curettage',
  'Temporary Sedative Filling',
  'Orthodontic Braces Adjustment',
  'Removable Partial Denture',
  'Complete Acrylic Denture'
];

export const DEFAULT_SETTINGS: AppSettings = {
  print: {
    marginTop: 25,         // 25mm
    marginLeft: 20,        // 20mm
    rowSpacing: 12,        // 12mm
    fontSize: 11,          // 11pt
    fontFamily: 'sans-serif',
    colWidthDate: 20,      // 20%
    colWidthProc: 60,      // 60%
    colWidthPay: 20,       // 20%
    colorHeader: '#000000',
    colorTable: '#000000',
    colorFooter: '#000000',
    colorTotal: '#000000',
    colorTeeth: '#000000',
    showSignature: false,
    signatureText: "Doctor's Signature / Initial",
    currencySymbol: 'BDT'
  },
  branding: {
    name: 'Dr. Munabbir Ul Haque',
    subtitle: 'Yashfin Health Point',
    logo: '',              // Empty by default
    footerText: 'Thank you for choosing Dr. Munabbir Ul Haque. Wish you a healthy smile!',
    printTitle: 'CLINICAL RECORD'
  },
  suggestions: DEFAULT_SUGGESTIONS,
  shorthands: [
    { key: 'CR', text: 'Composite Restoration (Front Tooth)', price: 1500 },
    { key: 'RCT', text: 'Root Canal Treatment (RCT)', price: 4000 },
    { key: 'S&P', text: 'Scaling & Polishing', price: 1500 },
    { key: 'EXT', text: 'Simple Tooth Extraction', price: 1000 }
  ],
  adminPin: '1234'
};

/**
 * Generates the full offline self-contained HTML file.
 * It contains exactly the same CSS and vanilla JavaScript logic
 * to work 100% offline with zero external dependencies or CDN links!
 */
export function generateOfflineHtml(initialPatientsData: string = '[]', initialSettingsData: string = ''): string {
  const finalSettings = initialSettingsData || JSON.stringify(DEFAULT_SETTINGS);
  
  let currentPin = '1234';
  try {
    const parsed = initialSettingsData ? JSON.parse(initialSettingsData) : DEFAULT_SETTINGS;
    currentPin = parsed.adminPin || '1234';
  } catch (e) {
    console.error(e);
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dental Clinic Record & Payment (Offline App)</title>
  <style>
    /* Clean CSS Reset & Modern Typography Styling */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
    }
    
    /* Layout */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    
    /* Navigation Bar */
    header {
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .clinic-logo-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .clinic-logo-img {
      max-height: 48px;
      max-width: 120px;
      object-fit: contain;
    }
    .clinic-name-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.025em;
    }
    .settings-btn-link {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.5rem 0.875rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #334155;
    }
    .settings-btn-link:hover {
      background: #e2e8f0;
    }

    /* Home Grid */
    .home-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .home-card-btn {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 2.5rem 1.5rem;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease-in-out;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .home-card-btn:hover {
      border-color: #0284c7;
      box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.1);
      transform: translateY(-2px);
    }
    .home-card-icon {
      font-size: 2rem;
    }

    /* Screen Management */
    .screen-view {
      display: none;
    }
    .screen-view.active-screen {
      display: block;
    }

    /* Form Fields & Inputs */
    .card-panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      margin-top: 1.5rem;
    }
    .form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .back-to-home-link {
      font-size: 0.875rem;
      color: #0284c7;
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
    }
    .back-to-home-link:hover {
      text-decoration: underline;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 0.375rem;
    }
    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      color: #0f172a;
      background: #ffffff;
    }
    .form-input:focus {
      outline: 2px solid #0284c7;
      border-color: transparent;
    }
    .form-error-msg {
      color: #dc2626;
      font-size: 0.825rem;
      margin-top: 0.25rem;
      display: none;
    }
    
    /* Primary buttons */
    .action-btn-primary {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .action-btn-primary:hover {
      background: #0369a1;
    }
    .action-btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .action-btn-secondary:hover {
      background: #e2e8f0;
    }
    .action-btn-danger {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .action-btn-danger:hover {
      background: #b91c1c;
    }

    /* Lists and Search results */
    .patient-list-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .patient-row-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .patient-row-item:hover {
      border-color: #0284c7;
      background: #f0f9ff;
    }
    .patient-info-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .patient-name-span {
      font-weight: 700;
      color: #0f172a;
    }
    .patient-reg-span {
      font-size: 0.825rem;
      color: #64748b;
      font-family: monospace;
    }
    .patient-info-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .patient-price-span {
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
    }
    .status-badge {
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.running {
      background-color: #fef3c7;
      color: #d97706;
    }
    .status-badge.completed {
      background-color: #dcfce7;
      color: #15803d;
    }

    /* Clinical Record 14-Row Table Styling */
    .clinical-record-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
      background: #ffffff;
    }
    .clinical-record-table th, .clinical-record-table td {
      border: 1px solid #cbd5e1;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }
    .clinical-record-table th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #334155;
      text-align: left;
    }
    .clinical-record-table .header-merged-row {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 800;
      text-align: center;
      font-size: 1.125rem;
      letter-spacing: 0.05em;
    }
    .clinical-record-table .total-merged-row {
      background-color: #f8fafc;
      font-weight: 700;
      text-align: right;
    }
    .table-date-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .table-procedure-cell {
      position: relative;
    }
    .table-procedure-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
    }
    .table-payment-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      font-family: monospace;
      font-size: 0.875rem;
      text-align: right;
    }
    .table-payment-input::-webkit-outer-spin-button,
    .table-payment-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    /* Auto-suggestions popup dropdown */
    .suggestions-popup {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      z-index: 50;
      max-height: 180px;
      overflow-y: auto;
      display: none;
    }
    .suggestion-item {
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      font-size: 0.825rem;
      color: #334155;
    }
    .suggestion-item:hover {
      background: #f0f9ff;
      color: #0284c7;
      font-weight: 600;
    }
    
    /* Footer layout of Table Screen */
    .table-footer-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .completed-checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: #334155;
      font-size: 1rem;
      cursor: pointer;
    }
    .completed-checkbox-input {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }
    .print-buttons-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .allow-edit-row-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.825rem;
      color: #64748b;
      margin-top: 0.75rem;
    }
    
    /* Settings layout and tabs */
    .settings-grid-panel {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .settings-nav-sidebar {
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border-radius: 8px;
    }
    .settings-nav-tab {
      padding: 0.625rem 0.875rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      color: #475569;
      text-align: left;
      border: none;
      background: transparent;
    }
    .settings-nav-tab.active-tab {
      background: #0284c7;
      color: #ffffff;
    }
    .settings-tab-content-view {
      display: none;
    }
    .settings-tab-content-view.active-content {
      display: block;
    }

    /* Suggestion manager */
    .suggestions-edit-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 250px;
      overflow-y: auto;
      margin-bottom: 1rem;
      border: 1px solid #cbd5e1;
      padding: 0.5rem;
      border-radius: 6px;
    }
    .suggestion-edit-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 0.375rem 0.625rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .suggestion-delete-btn {
      color: #dc2626;
      background: transparent;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 1.125rem;
      padding: 0 0.25rem;
    }
    .suggestion-add-form {
      display: flex;
      gap: 0.5rem;
    }

    /* Print Preview Modal Container */
    .modal-backdrop-preview {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.55);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-backdrop-preview.active-modal {
      display: flex;
    }
    .preview-modal-panel {
      background: #ffffff;
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
    }
    .preview-modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .preview-modal-scroll-area {
      padding: 1.5rem;
      overflow-y: auto;
      background-color: #f1f5f9;
      flex-grow: 1;
      display: flex;
      justify-content: center;
    }
    .preview-modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    /* Mock printed page inside modal */
    .mock-printed-paper {
      background-color: #ffffff;
      box-shadow: 0 10px 15px rgba(0,0,0,0.1);
      width: 210mm; /* A4 width */
      min-height: 297mm; /* A4 height */
      position: relative;
      color: #000000;
    }
    
    /* Branding and print fields */
    .print-logo-preview {
      max-height: 64px;
      max-width: 160px;
      object-fit: contain;
    }
    
    /* Password Dialog */
    .password-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.4);
      z-index: 120;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .password-modal-panel {
      background: #ffffff;
      border-radius: 10px;
      padding: 1.5rem;
      width: 320px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    /* Print only element (hidden on screen by default) */
    #printable-area {
      display: none;
    }
    
    /* Keep hidden elements blank but maintaining layout height */
    .print-invisible {
      visibility: hidden !important;
      border: none !important;
      border-color: transparent !important;
      background: transparent !important;
      box-shadow: none !important;
      outline: none !important;
    }
    .print-visible {
      visibility: visible !important;
    }
    
    /* Dotted overlay styling for preview */
    .preview-table-cell {
      border: 1px dashed rgba(100, 116, 139, 0.35);
      padding: 0.5rem;
    }
    
    /* Print alignment rules matching standard margins */
    @media print {
      header, .container, .modal-backdrop-preview, .password-modal-backdrop {
        display: none !important;
      }
      #printable-area {
        display: block !important;
      }
      .print-cell-hidden {
        visibility: hidden !important;
      }
      .print-cell-visible {
        visibility: visible !important;
      }
      .print-invisible {
        visibility: hidden !important;
        border: none !important;
        border-color: transparent !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }
      .print-visible {
        visibility: visible !important;
      }
      .print-no-borders td, .print-no-borders th {
        border: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header class="no-print">
    <div class="clinic-logo-wrapper">
      <img id="header-logo-el" class="clinic-logo-img" style="display: none;" src="" alt="Clinic Logo">
      <div style="display: flex; flex-direction: column;">
        <span id="header-clinic-name-el" class="clinic-name-text">Dr. Munabbir Ul Haque</span>
        <span id="header-clinic-subtitle-el" style="font-size: 0.75rem; color: #64748b; font-weight: 500;">Yashfin Health Point</span>
      </div>
    </div>
    <button class="settings-btn-link" id="settings-trigger-btn">
      ⚙ Settings Panel
    </button>
  </header>

  <!-- Main Work Area -->
  <main class="container no-print">
    
    <!-- FIRST SCREEN: HOME MENU -->
    <section id="screen-home" class="screen-view active-screen">
      <h2 style="text-align: center; margin-top: 1.5rem; color: #475569; font-weight: 500;">Dental Patient Records Management System</h2>
      <div class="home-grid">
        <button class="home-card-btn" onclick="navigateTo('screen-all-patients')">
          <span class="home-card-icon">👥</span>
          ALL PATIENTS
        </button>
        <button class="home-card-btn" onclick="navigateTo('screen-search')">
          <span class="home-card-icon">🔍</span>
          SEARCH ENTRY
        </button>
        <button class="home-card-btn" onclick="navigateTo('screen-new-patient')">
          <span class="home-card-icon">➕</span>
          NEW ENTRY
        </button>
        <button class="home-card-btn" onclick="navigateTo('screen-update-flow')">
          <span class="home-card-icon">📝</span>
          UPDATE ENTRY
        </button>
      </div>
    </section>

    <!-- OPTION 1: ALL PATIENTS SCREEN -->
    <section id="screen-all-patients" class="screen-view">
      <div class="card-panel">
        <div class="form-title">
          <span>👥 All Patients List</span>
          <a class="back-to-home-link" onclick="navigateTo('screen-home')">← Back to Menu</a>
        </div>
        <div id="all-patients-list" class="patient-list-container">
          <!-- Dynamic contents populated by JavaScript -->
        </div>
      </div>
    </section>

    <!-- OPTION 2: SEARCH ENTRY SCREEN -->
    <section id="screen-search" class="screen-view">
      <div class="card-panel">
        <div class="form-title">
          <span>🔍 Search Patient Records</span>
          <a class="back-to-home-link" onclick="navigateTo('screen-home')">← Back to Menu</a>
        </div>
        <div class="form-group">
          <label class="form-label">Search Patient by Name or Registration Number</label>
          <input type="text" id="patient-search-input" class="form-input" placeholder="Type name or registration number to filter..." oninput="filterSearchResults()">
        </div>
        <div id="search-patients-list" class="patient-list-container">
          <!-- Filtered patient list -->
        </div>
      </div>
    </section>

    <!-- OPTION 3: NEW ENTRY FLOW (Step 1 Name & ID) -->
    <section id="screen-new-patient" class="screen-view">
      <div class="card-panel" style="max-width: 600px; margin: 2rem auto 0 auto;">
        <div class="form-title">
          <span>➕ New Patient Registration</span>
          <a class="back-to-home-link" onclick="navigateTo('screen-home')">Cancel</a>
        </div>
        <form id="new-patient-form" onsubmit="handleNewPatientSubmit(event)">
          <div class="form-group">
            <label class="form-label" for="new-patient-name">Patient Full Name</label>
            <input type="text" id="new-patient-name" class="form-input" placeholder="Enter patient name" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-patient-reg">Registration Number</label>
            <input type="text" id="new-patient-reg" class="form-input" placeholder="Enter registration number (must be unique)" required>
            <div id="new-patient-reg-error" class="form-error-msg">Registration number already exists! Please use a unique number.</div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem;">
            <button type="button" class="action-btn-secondary" onclick="navigateTo('screen-home')">Cancel</button>
            <button type="submit" class="action-btn-primary">Create Record & Open Clinical Table</button>
          </div>
        </form>
      </div>
    </section>

    <!-- UPDATE FLOW LAUNCHER (Search and Select Patient to Open Table) -->
    <section id="screen-update-flow" class="screen-view">
      <div class="card-panel">
        <div class="form-title">
          <span>📝 Select Patient to Update Record</span>
          <a class="back-to-home-link" onclick="navigateTo('screen-home')">← Back to Menu</a>
        </div>
        <div class="form-group">
          <label class="form-label">Search Patient to Open clinical record</label>
          <input type="text" id="update-search-input" class="form-input" placeholder="Type patient name or registration number to update..." oninput="filterUpdateSearchResults()">
        </div>
        <div id="update-patients-list" class="patient-list-container">
          <!-- Clickable search results -->
        </div>
      </div>
    </section>

    <!-- CLINICAL TABLE SCREEN (USED FOR NEW TREATMENT AND VIEW/UPDATE DETAILS) -->
    <section id="screen-clinical-table" class="screen-view">
      <div class="card-panel">
        <div class="form-title">
          <div>
            <span style="font-size: 1.125rem; color: #475569; font-weight: 500; display: block;" id="clinical-table-reg-subtitle">Reg. No: 1042</span>
            <span id="clinical-table-name-title">Patient: Mr. John Doe</span>
          </div>
          <a class="back-to-home-link" onclick="returnToProperScreen()">← Back to Patients</a>
        </div>

        <div style="overflow-x: auto;">
          <table class="clinical-record-table" id="clinical-table-el">
            <thead>
              <!-- Row 1 (Merged 3 columns): CLINICAL RECORD -->
              <tr>
                <th colspan="3" class="header-merged-row">CLINICAL RECORD</th>
              </tr>
              <!-- Row 2: Headers -->
              <tr>
                <th style="width: 20%;" id="th-date-width">DATE</th>
                <th style="width: 60%;" id="th-proc-width">PROCEDURE</th>
                <th style="width: 20%; text-align: right;" id="th-pay-width">PAYMENT (BDT)</th>
              </tr>
            </thead>
            <tbody id="clinical-table-tbody">
              <!-- Rows 3-13 (11 treatment rows) will be populated dynamically -->
            </tbody>
            <tfoot>
              <!-- Row 14: Total Row -->
              <tr>
                <td colspan="2" class="total-merged-row">TREATMENT COMPLETED & TOTAL PAYMENT RECEIVED:</td>
                <td style="text-align: right; font-weight: 800; font-family: monospace;" id="clinical-table-total-val">BDT = 0</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="allow-edit-row-wrapper">
          <input type="checkbox" id="allow-edit-printed-cb" onchange="toggleAllowEditPrintedRows()">
          <label for="allow-edit-printed-cb" style="cursor: pointer; font-weight: 600;">🔓 Allow editing previously printed rows</label>
        </div>

        <div class="table-footer-controls">
          <div>
            <label class="completed-checkbox-wrapper">
              <input type="checkbox" class="completed-checkbox-input" id="completed-status-cb" onchange="toggleCompletedCheckbox()">
              ☑ TREATMENT COMPLETED
            </label>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="print-buttons-row">
              <button class="action-btn-secondary" onclick="handleSaveClick()">💾 SAVE RECORD</button>
              <button class="action-btn-secondary" onclick="handlePrintPreview()">👁 PRINT PREVIEW</button>
              <button class="action-btn-primary" onclick="handlePrintUpdate()">🖨 PRINT UPDATE</button>
              <button class="action-btn-primary" style="background-color: #1e293b;" onclick="handlePrintFullRecord()">🖨 PRINT FULL RECORD</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SETTINGS PANEL SCREEN -->
    <section id="screen-settings" class="screen-view">
      <div class="card-panel">
        <div class="form-title">
          <span>⚙ Settings Panel</span>
          <a class="back-to-home-link" onclick="navigateTo('screen-home')">← Back to Menu</a>
        </div>
        
        <div class="settings-grid-panel">
          
          <!-- Sidebar Nav Tabs -->
          <div class="settings-nav-sidebar">
            <button class="settings-nav-tab active-tab" onclick="switchSettingsTab('settings-tab-print', this)">🖨 Print Layout</button>
            <button class="settings-nav-tab" onclick="switchSettingsTab('settings-tab-branding', this)">🏥 Clinic Branding</button>
            <button class="settings-nav-tab" onclick="switchSettingsTab('settings-tab-procedures', this)">🦷 Suggestions</button>
            <button class="settings-nav-tab" onclick="switchSettingsTab('settings-tab-backup', this)">💾 Backup & Sync</button>
            <button class="settings-nav-tab" style="color: #dc2626;" onclick="switchSettingsTab('settings-tab-reset', this)">⚠️ Reset Database</button>
          </div>

          <!-- Tab 1: Print Layout Settings -->
          <div class="settings-tab-content-view active-content" id="settings-tab-print">
            <h3 style="margin-bottom: 1rem; font-weight: 700; color: #334155;">Print Layout Calibration</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Top Margin (mm)</label>
                <input type="number" id="setting-margin-top" class="form-input" min="0" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Left Margin (mm)</label>
                <input type="number" id="setting-margin-left" class="form-input" min="0" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Row Height / Spacing (mm)</label>
                <input type="number" id="setting-row-spacing" class="form-input" min="1" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Font Size (pt)</label>
                <input type="number" id="setting-font-size" class="form-input" min="6" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Font Family</label>
                <select id="setting-font-family" class="form-input" onchange="savePrintSettings()">
                  <option value="sans-serif">Modern Sans-Serif</option>
                  <option value="serif">Classic Serif</option>
                  <option value="monospace">Tabular Monospace</option>
                </select>
              </div>
            </div>
            <h4 style="margin: 1rem 0 0.5rem 0; font-weight: 700; color: #475569; font-size: 0.875rem;">Print Column Width Allocation (%)</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Date Column Width (%)</label>
                <input type="number" id="setting-col-width-date" class="form-input" min="5" max="80" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Procedure Column Width (%)</label>
                <input type="number" id="setting-col-width-proc" class="form-input" min="5" max="80" onchange="savePrintSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Payment Column Width (%)</label>
                <input type="number" id="setting-col-width-pay" class="form-input" min="5" max="80" onchange="savePrintSettings()">
              </div>
            </div>
            <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">Note: The sum of the columns should equal 100% for proper grid layout alignment.</p>
          </div>

          <!-- Tab 2: Branding Settings -->
          <div class="settings-tab-content-view" id="settings-tab-branding">
            <h3 style="margin-bottom: 1rem; font-weight: 700; color: #334155;">Clinic Branding & Headers</h3>
            <div class="form-group">
              <label class="form-label">Clinic Name</label>
              <input type="text" id="setting-clinic-name" class="form-input" oninput="saveBrandingSettings()">
            </div>
            <div class="form-group">
              <label class="form-label">Clinic Subtitle</label>
              <input type="text" id="setting-clinic-subtitle" class="form-input" oninput="saveBrandingSettings()">
            </div>
            <div class="form-group">
              <label class="form-label">Clinic Logo (PNG/JPEG - Max 500KB)</label>
              <input type="file" id="setting-clinic-logo-input" class="form-input" accept="image/*" onchange="uploadClinicLogo(event)">
              <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                <img id="setting-logo-preview" style="max-height: 40px; display: none; object-fit: contain;" src="" alt="Preview">
                <button type="button" id="setting-logo-delete-btn" class="action-btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; display: none;" onclick="deleteClinicLogo()">Remove Logo</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Printed Receipt Footer Text</label>
              <input type="text" id="setting-clinic-footer" class="form-input" oninput="saveBrandingSettings()">
            </div>
          </div>

          <!-- Tab 3: Procedure Suggestions -->
          <div class="settings-tab-content-view" id="settings-tab-procedures">
            <h3 style="margin-bottom: 1rem; font-weight: 700; color: #334155;">Default Procedure Suggestions</h3>
            <div class="suggestions-edit-list" id="settings-suggestions-list">
              <!-- Interactive list -->
            </div>
            <div class="suggestion-add-form">
              <input type="text" id="new-suggestion-input" class="form-input" placeholder="Type a new procedure suggestion...">
              <button class="action-btn-primary" onclick="addProcedureSuggestion()">Add</button>
            </div>
          </div>

          <!-- Tab 4: Backup & Sync -->
          <div class="settings-tab-content-view" id="settings-tab-backup">
            <h3 style="margin-bottom: 1rem; font-weight: 700; color: #334155;">Backup Database & Sync</h3>
            <p style="font-size: 0.875rem; color: #475569; margin-bottom: 1.5rem;">Saves all patients and records locally to your computer. Use these buttons to back up or restore data to another PC.</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="action-btn-primary" onclick="exportDataBackup()">📥 EXPORT BACKUP (.json)</button>
              <button class="action-btn-secondary" style="position: relative;" onclick="document.getElementById('import-file-selector').click()">
                📤 IMPORT BACKUP (.json)
                <input type="file" id="import-file-selector" style="display: none;" accept=".json" onchange="importDataBackup(event)">
              </button>
            </div>
          </div>

          <!-- Tab 5: Reset App -->
          <div class="settings-tab-content-view" id="settings-tab-reset">
            <h3 style="margin-bottom: 1rem; font-weight: 700; color: #dc2626;">⚠️ Dangerous Operation</h3>
            <p style="font-size: 0.875rem; color: #475569; margin-bottom: 1.5rem;">This will permanently wipe all patient records, visits, payments, and custom suggestions from local storage. This action is irreversible.</p>
            <button class="action-btn-danger" onclick="triggerWipeDatabase()">☠️ CLEAR ALL DATABASE DATA</button>
          </div>

        </div>
      </div>
    </section>

  </main>

  <!-- POPUP INTERACTIVE PRINT PREVIEW MODAL -->
  <div class="modal-backdrop-preview no-print" id="print-preview-modal-backdrop">
    <div class="preview-modal-panel">
      <div class="preview-modal-header">
        <h3 style="font-weight: 700; color: #0f172a;" id="print-preview-title">🖨 Print Layout Alignment Guide (A4)</h3>
        <button class="action-btn-secondary" style="padding: 0.25rem 0.75rem;" onclick="closePrintPreview()">Close Preview</button>
      </div>
      <div class="preview-modal-scroll-area">
        <div class="mock-printed-paper" id="mock-printed-paper-area">
          <!-- Populated dynamically with exact layout guidelines matching the settings -->
        </div>
      </div>
      <div class="preview-modal-footer">
        <p style="font-size: 0.75rem; color: #64748b; align-self: center; margin-right: auto;">⚠️ Preceding hidden rows are styled faintly for overlay calibration. Only fully visible rows will print.</p>
        <button class="action-btn-secondary" onclick="closePrintPreview()">Cancel</button>
        <button class="action-btn-primary" id="print-now-btn">Print on Paper</button>
      </div>
    </div>
  </div>

  <!-- PASSWORD PROMPT DIALOG -->
  <div class="password-modal-backdrop no-print" id="password-modal">
    <div class="password-modal-panel">
      <h4 style="font-weight: 700; margin-bottom: 0.75rem;">🔒 Enter Admin Password</h4>
      <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 1rem;">Default admin password is <strong style="color: #0f172a;">${currentPin}</strong></p>
      <input type="password" id="password-input-field" class="form-input" style="margin-bottom: 1.25rem;" placeholder="••••">
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button class="action-btn-secondary" style="padding: 0.375rem 0.75rem; font-size: 0.825rem;" onclick="cancelPasswordDialog()">Cancel</button>
        <button class="action-btn-primary" style="padding: 0.375rem 0.75rem; font-size: 0.825rem;" onclick="submitPasswordDialog()">Submit</button>
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- REAL-TIME PRINTING OVERLAY (A4 SIZE INVISIBLES)-->
  <!-- ============================================== -->
  <div class="print-only" id="printable-area">
    <!-- Structurally populated prior to calling window.print() -->
  </div>

  <!-- Real JavaScript Logic -->
  <script>
    // Global State Engine
    let patients = [];
    let settings = ${finalSettings};
    
    // UI tracking state
    let activeScreen = 'screen-home';
    let previousScreen = 'screen-home';
    let selectedPatientId = null;
    let tableVisits = []; // Active visit state for current loaded patient (always size 11)
    let passwordSuccessCallback = null;
    let activeInputRowIndex = null;

    // Load initial data
    function initDatabase() {
      const storedPatients = localStorage.getItem('dental_patients');
      if (storedPatients) {
        patients = JSON.parse(storedPatients);
      } else {
        patients = ${initialPatientsData};
        localStorage.setItem('dental_patients', JSON.stringify(patients));
      }

      const storedSettings = localStorage.getItem('dental_settings');
      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      } else {
        localStorage.setItem('dental_settings', JSON.stringify(settings));
      }

      applyClinicBrandingToHeader();
      populateAllPatientsList();
      populateSearchList();
      populateUpdateFlowList();
    }

    function savePatientsToLocalStorage() {
      localStorage.setItem('dental_patients', JSON.stringify(patients));
    }

    function applyClinicBrandingToHeader() {
      const nameEl = document.getElementById('header-clinic-name-el');
      const subtitleEl = document.getElementById('header-clinic-subtitle-el');
      const logoEl = document.getElementById('header-logo-el');
      
      nameEl.textContent = settings.branding.name;
      
      if (settings.branding.subtitle) {
        subtitleEl.textContent = settings.branding.subtitle;
        subtitleEl.style.display = 'block';
      } else {
        subtitleEl.textContent = '';
        subtitleEl.style.display = 'none';
      }
      
      if (settings.branding.logo) {
        logoEl.src = settings.branding.logo;
        logoEl.style.display = 'inline-block';
      } else {
        logoEl.src = '';
        logoEl.style.display = 'none';
      }
    }

    // Navigation System
    function navigateTo(screenId) {
      document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active-screen'));
      const activeEl = document.getElementById(screenId);
      if (activeEl) {
        activeEl.classList.add('active-screen');
        previousScreen = activeScreen;
        activeScreen = screenId;
      }
      
      // Auto focus or scroll reset
      window.scrollTo(0, 0);

      // Refresh list contents on screen show
      if (screenId === 'screen-all-patients') {
        populateAllPatientsList();
      } else if (screenId === 'screen-search') {
        document.getElementById('patient-search-input').value = '';
        filterSearchResults();
      } else if (screenId === 'screen-update-flow') {
        document.getElementById('update-search-input').value = '';
        filterUpdateSearchResults();
      } else if (screenId === 'screen-settings') {
        loadSettingsInputs();
      }
    }

    function returnToProperScreen() {
      if (previousScreen === 'screen-all-patients' || previousScreen === 'screen-search' || previousScreen === 'screen-update-flow') {
        navigateTo(previousScreen);
      } else {
        navigateTo('screen-home');
      }
    }

    // LIST POPULATORS
    function populateAllPatientsList() {
      const listContainer = document.getElementById('all-patients-list');
      listContainer.innerHTML = '';

      // Sorted newest patient created first
      const sortedPatients = [...patients].sort((a, b) => b.createdAt - a.createdAt);

      if (sortedPatients.length === 0) {
        listContainer.innerHTML = \`<div style="text-align: center; padding: 2rem; color: #64748b; font-style: italic;">No patients registered yet. Click "NEW ENTRY" or "ALL PATIENTS" to begin.</div>\`;
        return;
      }

      sortedPatients.forEach(p => {
        listContainer.appendChild(createPatientListItemHTML(p));
      });
    }

    function createPatientListItemHTML(patient) {
      const row = document.createElement('div');
      row.className = 'patient-row-item';
      row.onclick = () => openPatientClinicalRecord(patient.id);

      row.innerHTML = \`
        <div class="patient-info-left">
          <span class="patient-name-span">\${escapeHTML(patient.name)}</span>
          <span class="patient-reg-span">Registration No: \${escapeHTML(patient.regNumber)}</span>
        </div>
        <div class="patient-info-right">
          <span class="patient-price-span">BDT \${patient.totalPayment.toLocaleString()}</span>
          <span class="status-badge \${patient.status}">\${patient.status}</span>
        </div>
      \`;
      return row;
    }

    // Live search query matching
    function filterSearchResults() {
      const searchVal = document.getElementById('patient-search-input').value.toLowerCase().trim();
      const listContainer = document.getElementById('search-patients-list');
      listContainer.innerHTML = '';

      if (!searchVal) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.875rem;">Type above to search...</div>';
        return;
      }

      const matches = patients.filter(p => 
        p.name.toLowerCase().includes(searchVal) || 
        p.regNumber.toLowerCase().includes(searchVal)
      ).sort((a, b) => b.createdAt - a.createdAt);

      if (matches.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.875rem;">No matching patient records found.</div>';
        return;
      }

      matches.forEach(p => {
        listContainer.appendChild(createPatientListItemHTML(p));
      });
    }

    function filterUpdateSearchResults() {
      const searchVal = document.getElementById('update-search-input').value.toLowerCase().trim();
      const listContainer = document.getElementById('update-patients-list');
      listContainer.innerHTML = '';

      const itemsToRender = searchVal 
        ? patients.filter(p => p.name.toLowerCase().includes(searchVal) || p.regNumber.toLowerCase().includes(searchVal))
        : patients;

      const sorted = [...itemsToRender].sort((a, b) => b.createdAt - a.createdAt);

      if (sorted.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.875rem;">No matching patient records found.</div>';
        return;
      }

      sorted.forEach(p => {
        const row = document.createElement('div');
        row.className = 'patient-row-item';
        row.onclick = () => openPatientClinicalRecord(p.id);
        row.innerHTML = \`
          <div class="patient-info-left">
            <span class="patient-name-span">\${escapeHTML(p.name)}</span>
            <span class="patient-reg-span">Reg. Number: \${escapeHTML(p.regNumber)}</span>
          </div>
          <div class="patient-info-right">
            <span class="patient-price-span">BDT \${p.totalPayment.toLocaleString()}</span>
            <span class="status-badge \${p.status}">\${p.status}</span>
          </div>
        \`;
        listContainer.appendChild(row);
      });
    }

    function populateUpdateFlowList() {
      filterUpdateSearchResults();
    }

    // Step 1: Create New Patient
    function handleNewPatientSubmit(event) {
      event.preventDefault();
      const name = document.getElementById('new-patient-name').value.trim();
      const regNum = document.getElementById('new-patient-reg').value.trim();
      
      const errorEl = document.getElementById('new-patient-reg-error');
      
      // RegNumber uniqueness check
      const duplicateExists = patients.some(p => p.regNumber.toLowerCase() === regNum.toLowerCase());
      if (duplicateExists) {
        errorEl.style.display = 'block';
        return;
      }
      
      errorEl.style.display = 'none';
      
      // Initialize visits with exactly 11 slots
      const initialVisits = Array.from({ length: 11 }, () => ({
        date: getTodayFormattedDate(),
        procedure: '',
        payment: '',
        printed: false
      }));

      const newPatientObj = {
        id: 'patient_' + Date.now() + '_' + Math.floor(Math.random()*1000),
        name: name,
        regNumber: regNum,
        status: 'running',
        visits: initialVisits,
        totalPayment: 0,
        createdAt: Date.now()
      };

      patients.push(newPatientObj);
      savePatientsToLocalStorage();

      // Reset form
      document.getElementById('new-patient-name').value = '';
      document.getElementById('new-patient-reg').value = '';

      // Proceed immediately to Clinical table view
      openPatientClinicalRecord(newPatientObj.id);
    }

    // CLINICAL RECORD TABLE HANDLING
    function openPatientClinicalRecord(patientId) {
      selectedPatientId = patientId;
      const patient = patients.find(p => p.id === patientId);
      if (!patient) return;

      // Ensure visits are always of size 11
      tableVisits = JSON.parse(JSON.stringify(patient.visits));
      while (tableVisits.length < 11) {
        tableVisits.push({
          date: getTodayFormattedDate(),
          procedure: '',
          payment: '',
          printed: false
        });
      }

      // Populate text details
      document.getElementById('clinical-table-name-title').textContent = 'Patient: ' + patient.name;
      document.getElementById('clinical-table-reg-subtitle').textContent = 'Reg. No: ' + patient.regNumber;
      document.getElementById('completed-status-cb').checked = (patient.status === 'completed');
      document.getElementById('allow-edit-printed-cb').checked = false;

      // Render the table
      renderClinicalTableBody();
      recalculateTableTotal();
      navigateTo('screen-clinical-table');
    }

    function renderClinicalTableBody() {
      const tbody = document.getElementById('clinical-table-tbody');
      tbody.innerHTML = '';

      const allowEditPrinted = document.getElementById('allow-edit-printed-cb').checked;

      tableVisits.forEach((visit, index) => {
        const isRowPrinted = visit.printed === true;
        const isDisabled = isRowPrinted && !allowEditPrinted;

        const tr = document.createElement('tr');
        if (isRowPrinted) {
          tr.style.backgroundColor = '#f1f5f9';
        }

        // Cell 1: Date (with date-picker dropdown or typing)
        const tdDate = document.createElement('td');
        tdDate.style.width = settings.print.colWidthDate + '%';
        const dateInput = document.createElement('input');
        dateInput.type = 'text';
        dateInput.className = 'table-date-input';
        dateInput.value = visit.date || '';
        dateInput.placeholder = 'DD/MM/YYYY';
        dateInput.disabled = isDisabled;
        dateInput.onchange = (e) => {
          tableVisits[index].date = e.target.value.trim();
        };
        // Add native calendar click helper
        dateInput.onclick = (e) => {
          if (!isDisabled && !dateInput.readOnly) {
            // Trigger customized date picker helper or let standard text typing occur
          }
        };
        tdDate.appendChild(dateInput);

        // Cell 2: Procedure (text input + suggestion popup dropdown)
        const tdProc = document.createElement('td');
        tdProc.className = 'table-procedure-cell';
        tdProc.style.width = settings.print.colWidthProc + '%';
        
        const procInput = document.createElement('input');
        procInput.type = 'text';
        procInput.className = 'table-procedure-input';
        procInput.value = visit.procedure || '';
        procInput.placeholder = 'Double click or start typing for suggestions...';
        procInput.disabled = isDisabled;
        
        // Show suggestions popup
        const popup = document.createElement('div');
        popup.className = 'suggestions-popup';
        popup.id = 'suggestions-popup-' + index;

        procInput.onfocus = () => {
          if (!isDisabled) showProcedureSuggestions(index);
        };
        procInput.oninput = (e) => {
          tableVisits[index].procedure = e.target.value;
          filterActiveSuggestions(index, e.target.value);
        };
        // Hide popup on blur with delay to register suggestion item click
        procInput.onblur = () => {
          setTimeout(() => { popup.style.display = 'none'; }, 200);
        };

        tdProc.appendChild(procInput);
        tdProc.appendChild(popup);

        // Cell 3: Payment
        const tdPay = document.createElement('td');
        tdPay.style.width = settings.print.colWidthPay + '%';
        const payInput = document.createElement('input');
        payInput.type = 'number';
        payInput.min = '0';
        payInput.className = 'table-payment-input';
        payInput.value = visit.payment === '' ? '' : visit.payment;
        payInput.placeholder = '0';
        payInput.disabled = isDisabled;
        payInput.oninput = (e) => {
          const val = e.target.value;
          if (val === '') {
            tableVisits[index].payment = '';
          } else {
            const num = parseFloat(val);
            tableVisits[index].payment = isNaN(num) || num < 0 ? 0 : num;
          }
          recalculateTableTotal();
        };
        tdPay.appendChild(payInput);

        tr.appendChild(tdDate);
        tr.appendChild(tdProc);
        tr.appendChild(tdPay);

        tbody.appendChild(tr);
      });
    }

    function showProcedureSuggestions(rowIndex) {
      const popup = document.getElementById('suggestions-popup-' + rowIndex);
      if (!popup) return;
      
      const inputVal = tableVisits[rowIndex].procedure.toLowerCase().trim();
      popup.innerHTML = '';
      
      const matchedSuggestions = settings.suggestions.filter(s => s.toLowerCase().includes(inputVal));
      const suggestionsToRender = matchedSuggestions.length > 0 ? matchedSuggestions : settings.suggestions;

      suggestionsToRender.forEach(s => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = s;
        item.onclick = () => {
          tableVisits[rowIndex].procedure = s;
          renderClinicalTableBody();
        };
        popup.appendChild(item);
      });
      popup.style.display = 'block';
    }

    function filterActiveSuggestions(rowIndex, typedVal) {
      const popup = document.getElementById('suggestions-popup-' + rowIndex);
      if (!popup) return;
      
      popup.innerHTML = '';
      const matched = settings.suggestions.filter(s => s.toLowerCase().includes(typedVal.toLowerCase().trim()));
      
      if (matched.length === 0) {
        popup.style.display = 'none';
        return;
      }

      matched.forEach(s => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = s;
        item.onclick = () => {
          tableVisits[rowIndex].procedure = s;
          renderClinicalTableBody();
        };
        popup.appendChild(item);
      });
      popup.style.display = 'block';
    }

    function recalculateTableTotal() {
      let total = 0;
      tableVisits.forEach(v => {
        if (v.payment && !isNaN(v.payment)) {
          total += parseFloat(v.payment);
        }
      });
      document.getElementById('clinical-table-total-val').textContent = 'BDT = ' + total.toLocaleString();
      return total;
    }

    function toggleAllowEditPrintedRows() {
      renderClinicalTableBody();
    }

    function toggleCompletedCheckbox() {
      const isCompleted = document.getElementById('completed-status-cb').checked;
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        patient.status = isCompleted ? 'completed' : 'running';
        savePatientsToLocalStorage();
      }
    }

    function handleSaveClick() {
      const patientIndex = patients.findIndex(p => p.id === selectedPatientId);
      if (patientIndex === -1) return;

      const totalPayment = recalculateTableTotal();
      const isCompleted = document.getElementById('completed-status-cb').checked;

      patients[patientIndex].visits = JSON.parse(JSON.stringify(tableVisits));
      patients[patientIndex].totalPayment = totalPayment;
      patients[patientIndex].status = isCompleted ? 'completed' : 'running';

      savePatientsToLocalStorage();
      alert('Record saved successfully!');
      renderClinicalTableBody();
    }

    // PRINTING PROCESSORS & MEDIA ALIGNMENT CONTROLS
    
    // Finds index of the latest filled treatment row
    function getLatestFilledRowIndex() {
      let latestIndex = -1;
      for (let i = 0; i < tableVisits.length; i++) {
        if (tableVisits[i].procedure.trim() !== '' || tableVisits[i].payment !== '') {
          latestIndex = i;
        }
      }
      return latestIndex;
    }

    function generatePrintedPaperHTML(mode) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) return '';

      const latestIndex = getLatestFilledRowIndex();
      const isCompleted = document.getElementById('completed-status-cb').checked;
      const clinicName = settings.branding.name;
      const logoUrl = settings.branding.logo;
      const footerText = settings.branding.footerText;
      const printTitle = settings.branding.printTitle || 'CLINICAL RECORD';

      const isFirstVisit = latestIndex <= 0;

      // Custom element colors
      const colorHeader = settings.print.colorHeader || '#000000';
      const colorTable = settings.print.colorTable || '#000000';
      const colorFooter = settings.print.colorFooter || '#000000';
      const colorTotal = settings.print.colorTotal || '#000000';
      const colorTeeth = settings.print.colorTeeth || '#000000';

      const showSignature = settings.print.showSignature || false;
      const signatureText = settings.print.signatureText || "Doctor's Signature / Initial";

      // Core custom padding/margins based on user Settings
      const getFontFam = () => {
        switch (settings.print.fontFamily) {
          case 'monospace': return 'Courier New, Courier, monospace';
          case 'serif': return 'Georgia, "Times New Roman", serif';
          case 'inter': return '"Inter", sans-serif';
          case 'space-grotesk': return '"Space Grotesk", sans-serif';
          case 'playfair-display': return '"Playfair Display", serif';
          case 'georgia': return 'Georgia, serif';
          case 'courier-new': return '"Courier New", monospace';
          case 'jetbrains-mono': return '"JetBrains Mono", monospace';
          case 'arial': return 'Arial, sans-serif';
          case 'times-new-roman': return '"Times New Roman", serif';
          default: return 'Arial, sans-serif';
        }
      };
      const fontFam = getFontFam();

      let printHTML = \`
        <div style="
          padding-top: \${settings.print.marginTop}mm; 
          padding-left: \${settings.print.marginLeft}mm; 
          padding-right: 15mm; 
          font-family: \${fontFam}; 
          font-size: \${settings.print.fontSize}pt; 
          color: #000000;
          line-height: 1.2;
        ">
      \`;

      // Brand Header & Patient credentials only print in 'full' mode
      const showHeader = (mode === 'full');

      if (showHeader) {
        printHTML += \`
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000000; padding-bottom: 4mm; margin-bottom: 6mm; color: \${colorHeader};">
            <div>
              <h1 style="font-size: 1.5em; font-weight: 800; margin: 0; text-transform: uppercase;">\${escapeHTML(clinicName)}</h1>
              <p style="font-size: 0.8em; margin: 2px 0 0 0; font-style: italic;">\${escapeHTML(settings.branding.subtitle || 'Professional Dental Clinic Records')}</p>
            </div>
            \${logoUrl ? \`<img class="print-logo-preview" src="\${logoUrl}" alt="logo" style="max-height: 48px; max-width: 120px; object-fit: contain;">\` : \`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" style="width: 56px; height: 56px;">
                <circle cx="250" cy="250" r="242" fill="#ffffff" />
                <defs>
                  <path id="topTextPath" d="M 65,250 A 185,185 0 0,1 435,250" fill="none" />
                  <path id="bottomTextPath" d="M 435,250 A 185,185 0 0,0 65,250" fill="none" />
                </defs>
                <circle cx="58" cy="250" r="5" fill="#c08e1a" />
                <circle cx="442" cy="250" r="5" fill="#c08e1a" />
                <text font-family="sans-serif" font-size="17" font-weight="700" fill="#c08e1a">
                  <textPath href="#topTextPath" startOffset="50%" text-anchor="middle">When I am ill, it is ALLAH who cures me.</textPath>
                </text>
                <text font-family="sans-serif" font-size="30" font-weight="900" fill="#00613a" letter-spacing="2">
                  <textPath href="#bottomTextPath" startOffset="50%" text-anchor="middle">YASHFIN HEALTH POINT</textPath>
                </text>
                <polygon points="250,60 255,75 270,68 262,82 277,87 262,92 270,106 255,99 250,114 245,99 230,106 238,92 223,87 238,82 230,68 245,75" fill="#c08e1a" />
                <circle cx="250" cy="155" r="23" fill="#00613a" />
                <path d="M 250,195 C 225,195 190,165 170,138 C 190,162 220,188 250,202 C 280,188 310,162 330,138 C 310,165 275,195 250,195 Z" fill="#00613a" />
                <path d="M 230,200 C 242,235 250,265 250,300 C 250,340 222,375 192,392 C 222,372 250,325 258,285 C 264,248 268,220 273,200 Z" fill="#00613a" />
                <path d="M 183,110 C 145,142 118,205 130,258 C 142,310 190,342 245,302 C 200,325 160,290 154,245 C 148,200 165,145 183,110 Z" fill="#00613a" />
                <path d="M 317,110 C 355,142 382,205 370,258 C 358,310 310,342 255,302 C 300,325 340,290 346,245 C 352,200 335,145 317,110 Z" fill="#00613a" />
                <path d="M 229,215 H 271 V 239 H 295 V 281 H 271 V 305 H 229 V 281 H 205 V 239 H 229 Z" fill="#ffffff" />
                <path d="M 233,219 H 267 V 243 H 291 V 277 H 267 V 301 H 233 V 277 H 209 V 243 H 233 Z" fill="#00613a" />
              </svg>
            \`}
          </div>
          
          <div style="margin-bottom: 6mm; font-size: 1em; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; color: \${colorHeader};">
            <div><strong>Patient Name:</strong> \${escapeHTML(patient.name)}</div>
            <div style="text-align: right;"><strong>Registration No:</strong> <span style="font-family: monospace; font-weight: bold;">\${escapeHTML(patient.regNumber)}</span></div>
          </div>
        \`;
      } else {
        // Leave placeholder spacing so spacing remains absolute
        if (mode === 'preview') {
          printHTML += \`
            <div style="height: 24mm; border: 1px dashed #cbd5e1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: #64748b; margin-bottom: 4mm;" class="no-print-preview-spacing">
              🚫 Header Area (Hidden during Print Update)
            </div>
            <div style="height: 10mm; border: 1px dashed #cbd5e1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: #64748b; margin-bottom: 6mm;" class="no-print-preview-spacing">
              🚫 Patient Credentials (Hidden during Print Update)
            </div>
          \`;
        } else {
          printHTML += \`
            <div style="height: 24mm;" class="no-print-preview-spacing"></div>
            <div style="height: 10mm;" class="no-print-preview-spacing"></div>
          \`;
        }
      }

      // Render the Clinical Table structure
      printHTML += \`
        <table style="width: 100%; border-collapse: collapse; border: none;" class="print-no-borders">
          <thead>
            <!-- Merged Clinical Record Title Header Row -->
            <tr style="height: \${settings.print.rowSpacing}mm; color: \${colorHeader};" class="\${showHeader ? 'print-visible' : 'print-invisible'}">
              <th colspan="3" style="text-align: center; font-weight: 800; border: none; font-size: 1.1em; letter-spacing: 0.05em; padding-bottom: 2mm;">
                \${escapeHTML(printTitle)}
              </th>
            </tr>
            <!-- Headers Row -->
            <tr style="height: \${settings.print.rowSpacing}mm; \${showHeader ? 'border-bottom: 1px solid #000000;' : 'border-bottom: none;'} color: \${colorHeader};" class="\${showHeader ? 'print-visible' : 'print-invisible'}">
              <th style="width: \${settings.print.colWidthDate}%; text-align: left; padding: 1mm 0;">DATE</th>
              <th style="width: \${settings.print.colWidthProc}%; text-align: left; padding: 1mm 0;">PROCEDURE</th>
              <th style="width: \${settings.print.colWidthPay}%; text-align: right; padding: 1mm 0;">PAYMENT</th>
            </tr>
          </thead>
          <tbody>
      \`;

      // Populating the 11 clinical rows with visibility controls
      tableVisits.forEach((v, idx) => {
        let isRowVisible = false;

        if (mode === 'full') {
          isRowVisible = true;
        } else if (mode === 'update') {
          isRowVisible = (idx === latestIndex);
        } else if (mode === 'preview') {
          isRowVisible = true;
        }

        const visibilityClass = isRowVisible ? 'print-visible' : 'print-invisible';
        const rowBgStyle = (mode === 'preview' && !isRowVisible) ? 'background-color: rgba(241, 245, 249, 0.55); outline: 1px dashed rgba(156, 163, 175, 0.4);' : '';
        const isFilled = v.procedure.trim() !== '' || v.payment !== '';

        // Dynamic Height controlled precisely in mm from settings to align on paper
        printHTML += \`
          <tr style="height: \${settings.print.rowSpacing}mm; color: \${colorTable}; \${rowBgStyle}" class="\${visibilityClass}">
            <td style="width: \${settings.print.colWidthDate}%; padding: 1mm 0; font-family: monospace;">
              \${isFilled ? escapeHTML(v.date || '') : ''}
            </td>
            <td style="width: \${settings.print.colWidthProc}%; padding: 1mm 0;">
              <span>\${escapeHTML(v.procedure || '')}</span>
              \${v.teeth ? \`<span style="margin-left: 2mm; font-family: monospace; font-size: 0.8em; font-weight: 900; color: \${colorTeeth};">[Teeth: \${escapeHTML(v.teeth)}]\` : ''}
            </td>
            <td style="width: \${settings.print.colWidthPay}%; text-align: right; padding: 1mm 0; font-family: monospace;">
              \${v.payment !== '' ? parseFloat(v.payment).toLocaleString() : ''}
            </td>
          </tr>
        \`;
      });

      printHTML += \`
          </tbody>
        </table>
      \`;

      // Final Total merged row
      // Visible in full mode, or if treatment is marked complete
      const totalSum = recalculateTableTotal();
      const showTotalRow = isCompleted && (mode === 'full');
      const totalVisibilityClass = showTotalRow ? 'print-visible' : 'print-invisible';

      if (showTotalRow) {
        printHTML += \`
          <div style="
            margin-top: 6mm; 
            border-top: 1px solid #000000; 
            padding-top: 3mm; 
            display: flex; 
            justify-content: space-between; 
            font-weight: 800;
            color: \${colorTotal};
          " class="\${totalVisibilityClass}">
            <span>TREATMENT COMPLETED & TOTAL PAYMENT RECEIVED:</span>
            <span style="font-family: monospace; font-size: 1.1em;">BDT \${totalSum.toLocaleString()}</span>
          </div>
        \`;
      } else if (mode === 'preview') {
        printHTML += \`
          <div style="margin-top: 6mm; padding: 4mm; border: 1px dashed #cbd5e1; background-color: #f8fafc; text-align: center; font-size: 0.8em; color: #64748b;" class="no-print-preview-spacing">
            🔒 Total Invoice Summary & Signatures are hidden during Print Update.
            <div style="font-size: 0.85em; margin-top: 1mm; opacity: 0.8;">They are only printed when performing a "PRINT FULL RECORD".</div>
          </div>
        \`;
      }

      // Signature line option
      if (showSignature) {
        printHTML += \`
          <div style="margin-top: 12mm; display: flex; justify-content: flex-end;" class="\${isCompleted && (mode === 'full') ? 'print-visible' : 'print-invisible'}">
            <div style="text-align: center; color: \${colorTable};">
              <div style="border-bottom: 1px solid #000000; width: 180px; margin-bottom: 4px;"></div>
              <div style="font-size: 0.75em; font-weight: bold; font-family: sans-serif;">\${escapeHTML(signatureText)}</div>
            </div>
          </div>
        \`;
      }

      if (isCompleted && (mode === 'full') && footerText) {
        printHTML += \`
          <div style="margin-top: 15mm; border-top: 1px dashed #cbd5e1; padding-top: 4mm; text-align: center; font-size: 0.8em; color: \${colorFooter};">
            \${escapeHTML(footerText)}
          </div>
        \`;
      }

      printHTML += \`</div>\`;
      return printHTML;
    }

    // Handles actual browser print trigger
    function printRecordNow(mode) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) return;

      const latestIndex = getLatestFilledRowIndex();
      if (latestIndex === -1) {
        alert('Table has no entries to print!');
        return;
      }

      // Check if user has saved changes
      const unsavedChangesExist = JSON.stringify(patient.visits) !== JSON.stringify(tableVisits);
      if (unsavedChangesExist) {
        const confirmPrint = confirm('You have unsaved changes in the table! Print without saving? (Highly recommended to click Cancel and SAVE first).');
        if (!confirmPrint) return;
      }

      // Inject into the hidden print div
      const printableArea = document.getElementById('printable-area');
      printableArea.innerHTML = generatePrintedPaperHTML(mode);

      // Save print flags to visits
      if (mode === 'update' || mode === 'full') {
        tableVisits.forEach((v, index) => {
          if (v.procedure.trim() !== '' || v.payment !== '') {
            // Row is filled, mark as printed
            if (mode === 'full' || index === latestIndex) {
              v.printed = true;
            }
          }
        });
        
        // Auto-save printed flags
        patient.visits = JSON.parse(JSON.stringify(tableVisits));
        savePatientsToLocalStorage();
        renderClinicalTableBody();
      }

      // Open Chrome Print UI
      window.print();
    }

    // INTERACTIVE PRINT PREVIEW MODAL
    function handlePrintPreview() {
      const backdrop = document.getElementById('print-preview-modal-backdrop');
      const mockArea = document.getElementById('mock-printed-paper-area');
      const nowBtn = document.getElementById('print-now-btn');

      mockArea.innerHTML = generatePrintedPaperHTML('preview');
      backdrop.classList.add('active-screen', 'active-modal');

      // Bind printer trigger from inside the preview modal
      nowBtn.onclick = () => {
        closePrintPreview();
        printRecordNow('update');
      };
    }

    function closePrintPreview() {
      const backdrop = document.getElementById('print-preview-modal-backdrop');
      backdrop.classList.remove('active-screen', 'active-modal');
    }

    function handlePrintUpdate() {
      printRecordNow('update');
    }

    function handlePrintFullRecord() {
      printRecordNow('full');
    }


    // SETTINGS CONTROL PANEL LOGIC (PASSWORD: 1234)
    document.getElementById('settings-trigger-btn').onclick = () => {
      promptForPassword(() => {
        navigateTo('screen-settings');
      });
    };

    function promptForPassword(callback) {
      const modal = document.getElementById('password-modal');
      const input = document.getElementById('password-input-field');
      input.value = '';
      modal.style.display = 'flex';
      input.focus();
      passwordSuccessCallback = callback;
    }

    function submitPasswordDialog() {
      const inputVal = document.getElementById('password-input-field').value;
      const modal = document.getElementById('password-modal');

      if (inputVal === (settings.adminPin || '1234')) {
        modal.style.display = 'none';
        if (passwordSuccessCallback) {
          passwordSuccessCallback();
          passwordSuccessCallback = null;
        }
      } else {
        alert('Incorrect password! Check your settings panel.');
        document.getElementById('password-input-field').value = '';
      }
    }

    function cancelPasswordDialog() {
      document.getElementById('password-modal').style.display = 'none';
      passwordSuccessCallback = null;
    }

    // Settings content loaders
    function loadSettingsInputs() {
      document.getElementById('setting-margin-top').value = settings.print.marginTop;
      document.getElementById('setting-margin-left').value = settings.print.marginLeft;
      document.getElementById('setting-row-spacing').value = settings.print.rowSpacing;
      document.getElementById('setting-font-size').value = settings.print.fontSize;
      document.getElementById('setting-font-family').value = settings.print.fontFamily;
      
      document.getElementById('setting-col-width-date').value = settings.print.colWidthDate;
      document.getElementById('setting-col-width-proc').value = settings.print.colWidthProc;
      document.getElementById('setting-col-width-pay').value = settings.print.colWidthPay;

      document.getElementById('setting-clinic-name').value = settings.branding.name;
      document.getElementById('setting-clinic-subtitle').value = settings.branding.subtitle || '';
      document.getElementById('setting-clinic-footer').value = settings.branding.footerText;

      const previewLogo = document.getElementById('setting-logo-preview');
      const deleteLogoBtn = document.getElementById('setting-logo-delete-btn');
      if (settings.branding.logo) {
        previewLogo.src = settings.branding.logo;
        previewLogo.style.display = 'block';
        deleteLogoBtn.style.display = 'block';
      } else {
        previewLogo.style.display = 'none';
        deleteLogoBtn.style.display = 'none';
      }

      renderSettingsSuggestionsList();
    }

    function savePrintSettings() {
      settings.print.marginTop = parseFloat(document.getElementById('setting-margin-top').value) || 0;
      settings.print.marginLeft = parseFloat(document.getElementById('setting-margin-left').value) || 0;
      settings.print.rowSpacing = parseFloat(document.getElementById('setting-row-spacing').value) || 1;
      settings.print.fontSize = parseFloat(document.getElementById('setting-font-size').value) || 8;
      settings.print.fontFamily = document.getElementById('setting-font-family').value;

      settings.print.colWidthDate = parseFloat(document.getElementById('setting-col-width-date').value) || 20;
      settings.print.colWidthProc = parseFloat(document.getElementById('setting-col-width-proc').value) || 60;
      settings.print.colWidthPay = parseFloat(document.getElementById('setting-col-width-pay').value) || 20;

      localStorage.setItem('dental_settings', JSON.stringify(settings));
    }

    function saveBrandingSettings() {
      settings.branding.name = document.getElementById('setting-clinic-name').value;
      settings.branding.subtitle = document.getElementById('setting-clinic-subtitle').value;
      settings.branding.footerText = document.getElementById('setting-clinic-footer').value;
      localStorage.setItem('dental_settings', JSON.stringify(settings));
      applyClinicBrandingToHeader();
    }

    function uploadClinicLogo(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 500000) {
        alert('File size exceeds the 500KB limit! Please upload a smaller image.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        settings.branding.logo = e.target.result;
        localStorage.setItem('dental_settings', JSON.stringify(settings));
        
        applyClinicBrandingToHeader();
        loadSettingsInputs();
      };
      reader.readAsDataURL(file);
    }

    function deleteClinicLogo() {
      settings.branding.logo = '';
      localStorage.setItem('dental_settings', JSON.stringify(settings));
      applyClinicBrandingToHeader();
      loadSettingsInputs();
    }

    function renderSettingsSuggestionsList() {
      const container = document.getElementById('settings-suggestions-list');
      container.innerHTML = '';

      settings.suggestions.forEach((s, idx) => {
        const item = document.createElement('div');
        item.className = 'suggestion-edit-row';
        item.innerHTML = \`
          <span>\${escapeHTML(s)}</span>
          <button class="suggestion-delete-btn" onclick="deleteSuggestion(\${idx})">×</button>
        \`;
        container.appendChild(item);
      });
    }

    function addProcedureSuggestion() {
      const input = document.getElementById('new-suggestion-input');
      const val = input.value.trim();
      if (!val) return;

      if (settings.suggestions.includes(val)) {
        alert('This procedure is already in the suggestion list.');
        return;
      }

      settings.suggestions.push(val);
      localStorage.setItem('dental_settings', JSON.stringify(settings));
      input.value = '';
      renderSettingsSuggestionsList();
    }

    function deleteSuggestion(index) {
      settings.suggestions.splice(index, 1);
      localStorage.setItem('dental_settings', JSON.stringify(settings));
      renderSettingsSuggestionsList();
    }

    function switchSettingsTab(tabId, btnEl) {
      document.querySelectorAll('.settings-tab-content-view').forEach(tab => tab.classList.remove('active-content'));
      document.querySelectorAll('.settings-nav-tab').forEach(btn => btn.classList.remove('active-tab'));
      
      document.getElementById(tabId).classList.add('active-content');
      btnEl.classList.add('active-tab');
    }

    // BACKUP SYSTEM (EXPORTS AND IMPORTS RAW JSON BACKUPS)
    function exportDataBackup() {
      const backupData = {
        patients: patients,
        settings: settings,
        backupTime: Date.now()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "Smile_Dental_Backup_" + getTodayFormattedDate().replace(/\\//g, '_') + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function importDataBackup(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.patients && parsed.settings) {
            const confirmImport = confirm('Importing backup will overwrite all current local data! Are you sure?');
            if (confirmImport) {
              patients = parsed.patients;
              settings = parsed.settings;
              savePatientsToLocalStorage();
              localStorage.setItem('dental_settings', JSON.stringify(settings));
              initDatabase();
              alert('Backup restored successfully!');
            }
          } else {
            alert('Invalid backup file! File structure is incorrect.');
          }
        } catch (error) {
          alert('Failed to parse backup file! Error: ' + error.message);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    }

    // RESET ENTIRE DATABASE WIPE
    function triggerWipeDatabase() {
      const inputPass = prompt('WIPING ALL DATA: Enter admin password to confirm database wipe:');
      if (inputPass === (settings.adminPin || '1234')) {
        const doubleCheck = confirm('Are you absolutely sure you want to delete everything? (All patient visits and settings will be wiped permanent!)');
        if (doubleCheck) {
          localStorage.clear();
          patients = [];
          settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
          localStorage.setItem('dental_settings', JSON.stringify(settings));
          localStorage.setItem('dental_patients', JSON.stringify(patients));
          initDatabase();
          navigateTo('screen-home');
          alert('Database reset successful. App restored to default clean state.');
        }
      } else {
        alert('Incorrect password! Wipe operation aborted.');
      }
    }

    // HELPER FUNCTIONS
    function getTodayFormattedDate() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return dd + '/' + mm + '/' + yyyy;
    }

    function escapeHTML(str) {
      if (!str) return '';
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Auto load app
    window.onload = () => {
      initDatabase();
    };

  </script>
</body>
</html>`;
}
