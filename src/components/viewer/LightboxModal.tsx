'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LightboxModal({ open, images, index = 0, onClose }: { open: boolean; images: string[]; index?: number; onClose: () => void; }) {
  const [current, setCurrent] = useState(index);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { if (open) { setCurrent(index); setScale(1);} }, [open, index]);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="text-sm text-muted-foreground">{current + 1} / {images.length}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.25))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.25))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Schließen"><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="relative bg-black/90 grid place-items-center" style={{ height: 560 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={images[current]} alt="Bild" style={{ transform: `scale(${scale})` }} className="max-h-full max-w-full transition-transform" />
          {images.length > 1 && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white" onClick={prev} aria-label="Vorheriges Bild"><ChevronLeft className="h-5 w-5" /></button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white" onClick={next} aria-label="Nächstes Bild"><ChevronRight className="h-5 w-5" /></button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}