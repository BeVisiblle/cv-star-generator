'use client';
import React, { useState } from 'react';
import LightboxModal from '@/components/viewer/LightboxModal';
import PdfInlineViewer from '@/components/viewer/PdfInlineViewer';
import { UploadedAttachment, humanFileSize } from '@/lib/uploads';
import { FileText } from 'lucide-react';

export default function FilePreview({ files }: { files: UploadedAttachment[] }) {
  const images = files.filter(f => f.mime_type.startsWith('image/'));
  const pdfs = files.filter(f => f.mime_type === 'application/pdf');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageUrls = images.map(i => i.url);

  return (
    <div className="space-y-3">
      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <button key={img.id} className="relative rounded-md overflow-hidden group" onClick={() => setLightboxIndex(idx)} aria-label="Bild öffnen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Bild" className="h-32 w-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-border/60 group-hover:ring-2" />
            </button>
          ))}
        </div>
      )}

      {/* PDFs */}
      {pdfs.map(pdf => (
        <div key={pdf.id} className="rounded-md border">
          <div className="px-3 py-2 text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> {pdf.storage_path.split('/').pop()} <span className="text-xs text-muted-foreground">· {pdf.size_bytes ? humanFileSize(pdf.size_bytes) : 'PDF'}</span>
          </div>
          <PdfInlineViewer url={pdf.url} height={420} />
        </div>
      ))}

      <LightboxModal open={lightboxIndex !== null} images={imageUrls} index={lightboxIndex ?? 0} onClose={() => setLightboxIndex(null)} />
    </div>
  );
}