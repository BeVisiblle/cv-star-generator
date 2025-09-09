'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function PdfInlineViewer({ url, height = 480 }: { url: string; height?: number }) {
  return (
    <div className="px-3 pb-3">
      <div className="rounded-md overflow-hidden border">
        {/* Fallback auf <iframe>, wenn <embed> blockiert ist */}
        <object data={url} type="application/pdf" width="100%" height={height} className="hidden md:block" aria-label="PDF Vorschau">
          <iframe src={url} width="100%" height={height} />
        </object>
        <div className="md:hidden text-sm text-muted-foreground p-3">PDF Vorschau ist auf kleinen Bildschirmen eingeschränkt.</div>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        PDF in neuem Tab öffnen <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}