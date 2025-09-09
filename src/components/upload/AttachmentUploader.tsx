'use client';
import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileImage, FileText } from 'lucide-react';
import { ALLOWED_MIME, MAX_FILE_BYTES, isAllowedFile, humanFileSize, UploadedAttachment, uploadToSupabase } from '@/lib/uploads';
import { cn } from '@/lib/utils';

export type AttachmentUploaderProps = {
  maxFiles?: number;
  accept?: string; // input accept string
  onUploaded?: (items: UploadedAttachment[]) => void;
  uploadFn?: (file: File) => Promise<UploadedAttachment>;
  className?: string;
};

type LocalItem = {
  file: File;
  id: string;
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: number; // 0..100
  error?: string;
  previewUrl?: string; // for images
  uploaded?: UploadedAttachment;
};

export default function AttachmentUploader({
  maxFiles = 6,
  accept = 'image/*,application/pdf',
  onUploaded,
  uploadFn,
  className,
}: AttachmentUploaderProps) {
  const [items, setItems] = useState<LocalItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploader = uploadFn ?? ((f: File) => uploadToSupabase(f, f.type.startsWith('image/') ? 'images' : 'attachments'));

  const remaining = Math.max(0, maxFiles - items.length);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const toAdd: LocalItem[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (!isAllowedFile(file)) {
        toAdd.push({ 
          file, 
          id: crypto.randomUUID(), 
          status: 'error', 
          progress: 0, 
          error: file.size > MAX_FILE_BYTES ? 'Datei ist zu groß' : 'Dateityp wird nicht unterstützt' 
        });
        continue;
      }
      const li: LocalItem = { file, id: crypto.randomUUID(), status: 'queued', progress: 0 };
      if (file.type.startsWith('image/')) {
        li.previewUrl = URL.createObjectURL(file);
      }
      toAdd.push(li);
    }
    setItems(prev => [...prev, ...toAdd]);
  }, [remaining]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const startUpload = useCallback(async () => {
    const queue = items.filter(it => it.status === 'queued');
    const finished: UploadedAttachment[] = [];
    for (const it of queue) {
      setItems(prev => prev.map(p => p.id === it.id ? { ...p, status: 'uploading', progress: 5 } : p));
      try {
        // Note: progress API depends on the underlying upload; we simulate here
        const uploaded = await uploader(it.file);
        finished.push(uploaded);
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, status: 'done', progress: 100, uploaded } : p));
      } catch (err: any) {
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, status: 'error', error: err?.message ?? 'Upload fehlgeschlagen' } : p));
      }
    }
    if (finished.length && onUploaded) onUploaded(finished);
  }, [items, uploader, onUploaded]);

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));

  const hasQueued = items.some(i => i.status === 'queued');

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn('rounded-xl border border-dashed p-4 text-center', remaining ? 'bg-muted/30' : 'bg-muted/60 opacity-80 pointer-events-none')}
        role="group"
        aria-label="Dateiablage"
      >
        <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => addFiles(e.currentTarget.files)} />
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5" aria-hidden />
          <div>
            <div className="font-medium">Dateien hierher ziehen</div>
            <div className="text-xs text-muted-foreground">oder</div>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="mt-2" onClick={() => inputRef.current?.click()} disabled={!remaining}>
          Dateien auswählen ({remaining} frei)
        </Button>
        <div className="mt-2 text-xs text-muted-foreground">Erlaubt: Bilder (JPG, PNG, WEBP, GIF) & PDF • bis {humanFileSize(MAX_FILE_BYTES)}</div>
      </div>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(it => (
            <li key={it.id} className={cn('relative rounded-lg border bg-card p-2')}> 
              <button className="absolute right-1 top-1 p-1 rounded hover:bg-muted" onClick={() => removeItem(it.id)} aria-label="Entfernen">
                <X className="h-4 w-4" />
              </button>
              {it.file.type.startsWith('image/') ? (
                <img src={it.previewUrl} alt={it.file.name} className="h-28 w-full object-cover rounded" />
              ) : (
                <div className="h-28 w-full grid place-items-center rounded bg-muted">
                  {it.file.type === 'application/pdf' ? <FileText className="h-6 w-6" /> : <FileImage className="h-6 w-6" />}
                </div>
              )}
              <div className="mt-2 text-xs truncate" title={it.file.name}>{it.file.name}</div>
              <div className="text-[10px] text-muted-foreground">{humanFileSize(it.file.size)}</div>
              {it.status !== 'error' && (
                <Progress value={it.progress} className="mt-2" />
              )}
              {it.status === 'error' && (
                <div className="mt-2 text-[11px] text-destructive">{it.error}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => setItems([])} disabled={!items.length}>Zurücksetzen</Button>
        <Button size="sm" onClick={startUpload} disabled={!hasQueued}>Hochladen</Button>
      </div>
    </div>
  );
}