🦷 Dental Clinic Management & Precision Paper Printing System. 
A lightweight, offline-first clinical record management application built for dental practitioners. Designed for fast patient logging, procedure pricing, financial tracking, and precision physical paper alignment for re-feeding paper or clinic index cards.
![alt text](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

![alt text](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![alt text](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![alt text](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![alt text](https://img.shields.io/badge/Offline--First-10B981?style=for-the-badge&logo=pwa&logoColor=white)
🌟 Key Features
📋 Patient & Clinical Record Logging
Row-by-Row Visit Tracking: Log visit dates, procedures performed, tooth numbers, and payment amounts in BDT.
Procedural Shorthands: Fast-fill common dental treatments (e.g., Scaling, Extraction, Root Canal Treatment, Filling, Crowns) with pre-configured default pricing.
Treatment Completion Workflow: Toggle treatment status (Running vs Completed) with automated grand total, discount, and tax calculations.
🖨️ Precision Physical Paper Printing Engine
Print Update Mode (Re-feed Paper Support): Print only newly added treatment rows directly onto existing physical paper cards or sheets without re-printing previous entries or clinic headers.
Print Full Record Mode: Generate a complete A4 clinical record sheet including clinic branding, header, patient details, itemized visits, subtotal breakdown, and doctor signatures.
Millimeter-Level Calibration: Fine-tune top margins, left margins, row heights, font sizes, and header color themes in settings to match pre-printed clinic letterheads or cards.
Real-time Print Preview: Interactive modal with paper layout preview prior to sending to the printer.
💾 Offline-First & Data Sovereignty
100% Local Storage Persistence: Patient logs and clinic settings are saved directly in browser storage.
Instant JSON Auto-Sync: Automatically writes updated backup logs directly to a designated local file folder on save or print.
Standalone Single-File Export: Generate a complete, self-contained Dental_Clinic_Offline_App.html file that runs 100% offline from a USB flash drive without an internet connection or web server.
🛠️ Tech Stack
Frontend Framework: React 18 + TypeScript
Build Tool: Vite
Styling: Tailwind CSS
Icons: Lucide React
🚀 Getting Started
Prerequisites
Node.js (v18.0.0 or higher)
npm or yarn
Installation
Clone the repository:
code
Bash
git clone https://github.com/your-username/dental-clinic-system.git
cd dental-clinic-system
Install dependencies:
code
Bash
npm install
Start the local development server:
code
Bash
npm run dev
Open your browser and navigate to http://localhost:3000.
Build for production:
code
Bash
npm run build
📖 Usage Guide
Search or Register Patient: Use the main search bar by name or registration number.
Add Treatment Visits: Enter date, procedure name, tooth numbers, and payment amount. Use procedure quick-buttons to speed up entry.
Printing Updates:
Click 🖨 PRINT UPDATE to print only the latest session line onto an existing paper card.
Click 🖨 PRINT FULL RECORD when generating an initial sheet or final statement.
Settings & Calibration:
Adjust paper margins (Top Margin, Left Margin, Row Height (mm)).
Customize clinic name, address, phone numbers, and print colors.
Export full JSON backups or download the standalone offline .html application.
📄 License
Distributed under the MIT License. See LICENSE for more information.
