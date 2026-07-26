export interface Visit {
  date: string;       // DD/MM/YYYY
  procedure: string;
  payment: number | ''; // numeric or empty
  printed?: boolean;
  teeth?: string;     // selected teeth string
}

export interface Patient {
  id: string;
  name: string;
  regNumber: string;
  status: 'running' | 'completed';
  visits: Visit[];     // Exactly 11 treatment slots correspond to rows 3-13
  totalPayment: number;
  discount?: number;   // Flat discount amount
  tax?: number;        // Tax percentage (e.g. 5 for 5%)
  createdAt: number;   // Timestamp
}

export interface PrintSettings {
  marginTop: number;     // in mm
  marginLeft: number;    // in mm
  rowSpacing: number;    // in mm
  fontSize: number;      // in pt
  fontFamily: string;    // 'sans-serif' | 'serif' | 'monospace'
  colWidthDate: number;  // %
  colWidthProc: number;  // %
  colWidthPay: number;   // %
  colorHeader?: string;  // Hex color for header text, default: #000000
  colorTable?: string;   // Hex color for table content text, default: #000000
  colorFooter?: string;  // Hex color for footer text, default: #000000
  colorTotal?: string;   // Hex color for total amount line, default: #000000
  colorTeeth?: string;   // Hex color for teeth numbers, default: #000000
  showSignature?: boolean; // Whether to print signature line
  signatureText?: string; // Text under signature line, e.g. "Doctor's Signature / Initial"
  currencySymbol?: string; // e.g. "BDT" or "৳"
}

export interface ClinicBranding {
  name: string;
  subtitle: string;
  logo: string;          // base64 data URI
  footerText: string;
  printTitle?: string;   // Custom title e.g. "CLINICAL RECORD"
}

export interface ShorthandPreset {
  key: string;         // e.g. "CR"
  text: string;        // e.g. "Composite Restoration (Front Tooth)"
  price: number | '';  // e.g. 1500
}

export interface AppSettings {
  print: PrintSettings;
  branding: ClinicBranding;
  suggestions: string[];
  shorthands?: ShorthandPreset[]; // Custom typing presets
  adminPin?: string; // 4-digit numeric password
}
