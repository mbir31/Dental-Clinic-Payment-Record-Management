# Dental Clinic Record & Precision Printing System

> An offline-first, privacy-focused Clinical Management and Physical Print Calibration Suite designed specifically for dental practices, oral surgeons, and medical clinics.

---

## 🌟 Key Capabilities

### 🦷 Clinical Treatment & Billing Management
- **11-Visit Structured Ledger**: Track multi-stage treatments, appointment dates, procedure notes, and payments in a clean tabular view.
- **Tooth Numbering Shortcuts**: Built-in support for universal tooth notation and interactive tooth selection.
- **Procedure Quick-Codes**: Configurable shorthand codes for rapid procedure logging and auto-pricing during busy clinical hours.
- **Real-Time Financial Calculations**: Subtotal, percentage-based or flat discount calculation, tax rate application, and grand total tracking.

### 🖨️ Precision Physical Print Engine
- **Millimeter-Level Paper Calibration**: Fine-tune top/left margins (`mm`), row height (`mm`), font sizes (`pt`), and column width percentages (`colWidthDate`, `colWidthProc`, `colWidthPay`) to align printed text with existing physical forms or pre-printed letterheads.
- **Dual Printing Modes**:
  - **Print Update**: Selectively prints only the newest treatment row onto an existing physical patient card without re-printing past entries.
  - **Print Full Record**: Prints a complete clinical summary invoice, including clinic headers, patient metadata, complete visit table, and doctor signature block.
- **Pre-Printed Letterhead Mode**: Toggle clinic header visibility to allow printing directly onto official clinic paper without overlapping text.
- **Interactive Print Preview Modal**: Full-screen layout simulation with dashed alignment grids before committing to physical paper.

### 🔒 Privacy & Offline Data Sovereignty
- **100% Client-Side Execution**: No external server dependencies, cloud storage, or third-party telemetry. Patient health records remain entirely local to your device.
- **Live File System Sync (Chrome / Edge)**: Connect a local JSON database file using the Web File System Access API for immediate background updates upon saving or printing entries.
- **Standalone Single-File (.html) Export**: Export the entire application as a single portable HTML file that runs anywhere—even from a USB drive without an internet connection or web server.
- **Data Protection & Backup**: Dedicated JSON database backup, full system restoration, and password-protected record deletion.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Build System**: Vite 6 + `vite-plugin-singlefile`
- **Storage Engines**: LocalStorage, IndexedDB, and Web File System Access API

---

## 🚀 Getting Started

### Option 1: Zero Installation (Standalone Offline App)
1. Export or download the `Dental_Clinic_Offline_App.html` file from the Settings panel.
2. Double-click the `.html` file to launch the application directly in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).
3. No Node.js runtime, server setup, or internet access required.

### Option 2: Local Development Setup

#### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`

#### Installation Steps
```bash
# Clone the repository
git clone https://github.com/your-username/dental-clinic-record-system.git

# Navigate into the project directory
cd dental-clinic-record-system

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Build Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite local development server on port `3000`. |
| `npm run build` | Compiles production assets into the `dist/` directory. |
| `npm run lint` | Runs TypeScript type checker (`tsc --noEmit`). |
| `npm run preview` | Previews the compiled production build locally. |

---

## 📐 Physical Print Calibration Guide

To ensure alignment when printing on pre-printed ledger sheets or cardstock:

1. Open **Settings** → **Print & Alignment Settings**.
2. Measure your pre-printed physical sheet using a ruler in millimeters (`mm`).
3. Set the parameters:
   - **Top Margin (`mm`)**: Distance from the top edge of paper to the first line.
   - **Left Margin (`mm`)**: Distance from the left paper border.
   - **Row Spacing (`mm`)**: Height reserved per visit row.
   - **Column Widths (%)**: Adjust relative widths for `Date`, `Procedure`, and `Payment`.
4. Click **👁 Print Preview** on any patient profile to verify alignment using the interactive overlay before sending to the physical printer.

---

## 📁 Project Structure

```text
├── index.html                   # Application entry HTML wrapper
├── package.json                 # Node dependencies and build scripts
├── vite.config.ts               # Vite configuration with single-file bundling
├── src/
│   ├── main.tsx                 # Application mounting entry point
│   ├── App.tsx                  # Root state controller & print viewport manager
│   ├── data.ts                  # Single-file HTML generator and data helpers
│   ├── index.css                # Global Tailwind CSS definitions and print styles
│   ├── types.ts                 # TypeScript type interfaces (Patient, Visit, Settings)
│   └── components/
│       ├── ClinicalTable.tsx    # Treatment ledger editor & shorthand input handling
│       ├── ToothChart.tsx       # Interactive adult & pediatric odontogram selector
│       ├── PrintPreviewModal.tsx# Real-time A4 print alignment preview
│       ├── SettingsPanel.tsx    # Clinic branding, calibration & backup tools
│       ├── PatientSearch.tsx    # Fast indexed patient search & registration
│       └── PasswordModal.tsx    # Security verification modal for protected actions
```

---

## 🤝 Contributing

Contributions, feature requests, and improvements are welcome! Feel free to open an issue or submit a pull request.

1. Fork the Repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source software provided under the [MIT License](LICENSE).
