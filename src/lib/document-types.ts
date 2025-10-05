// Document type constants and utilities
export const VALID_DOC_TYPES = [
  'arbeitszeugnisse',
  'hochschulzeugnisse',
  'letztes_schulzeugnis',
  'zertifikate',
  'referenzen',
  'arbeitsproben',
  'portfolios',
  'sonstige',
] as const;

export type DocType = typeof VALID_DOC_TYPES[number];

export const normalizeDocType = (t?: string): DocType => {
  switch ((t || '').toLowerCase()) {
    case 'arbeitszeugnis': return 'arbeitszeugnisse';
    case 'hochschulzeugnis': return 'hochschulzeugnisse';
    case 'letztes schulzeugnis':
    case 'schulzeugnis': return 'letztes_schulzeugnis';
    case 'zertifikat': return 'zertifikate';
    case 'referenz': return 'referenzen';
    case 'arbeitsprobe': return 'arbeitsproben';
    case 'portfolio': return 'portfolios';
    case 'sonstiges':
    case 'other':
    case 'sonstige': return 'sonstige';
    default: return 'sonstige';
  }
};

export const DOCUMENT_TYPE_LABELS: Record<DocType, string> = {
  'arbeitszeugnisse': 'Arbeitszeugnisse',
  'hochschulzeugnisse': 'Hochschulzeugnisse', 
  'letztes_schulzeugnis': 'Letztes Schulzeugnis',
  'zertifikate': 'Zertifikate & Bescheinigungen',
  'referenzen': 'Referenzen',
  'arbeitsproben': 'Arbeitsproben',
  'portfolios': 'Portfolios',
  'sonstige': 'Sonstige Dokumente',
};

export const DOCUMENT_TYPE_ICONS: Record<DocType, string> = {
  'arbeitszeugnisse': 'text-blue-600',
  'hochschulzeugnisse': 'text-purple-600',
  'letztes_schulzeugnis': 'text-green-600',
  'zertifikate': 'text-orange-600',
  'referenzen': 'text-indigo-600',
  'arbeitsproben': 'text-pink-600',
  'portfolios': 'text-cyan-600',
  'sonstige': 'text-gray-600',
};
