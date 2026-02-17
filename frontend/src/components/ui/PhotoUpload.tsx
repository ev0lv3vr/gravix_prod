'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  helperText?: string;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/tiff',
];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff'];

export function PhotoUpload({
  photos,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  helperText,
}: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAcceptedType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
      if (!isAcceptedType) {
        return `Unsupported format: ${file.name}. Use JPG, PNG, HEIC, or TIF.`;
      }
      if (file.size > maxSizeBytes) {
        return `File too large: ${file.name}. Max ${maxSizeMB}MB.`;
      }
      return null;
    },
    [maxSizeBytes, maxSizeMB]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxFiles - photos.length;
      if (remaining <= 0) {
        setErrorMessage(`Maximum ${maxFiles} photos reached.`);
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (validFiles.length >= remaining) break;
        const err = validateFile(file);
        if (err) {
          setErrorMessage(err);
          setTimeout(() => setErrorMessage(null), 3000);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onChange([...photos, ...validFiles]);
        setErrorMessage(null);
      }
    },
    [photos, onChange, maxFiles, validateFile]
  );

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasPhotos = photos.length > 0;

  return (
    <div>
      {/* Uploaded state: thumbnails */}
      {hasPhotos && (
        <div className="bg-[#1E293B] border border-[#374151] rounded-lg p-3 mb-0">
          <div className="flex flex-wrap items-center gap-3">
            {photos.map((file, i) => (
              <div key={`${file.name}-${i}`} className="relative w-16 h-16 rounded-md overflow-hidden group flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#0F1629]/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* + Add more button */}
            {photos.length < maxFiles && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-16 h-16 rounded-md border-2 border-dashed border-[#374151] hover:border-[#3B82F6]/50 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-[#64748B]" />
              </button>
            )}
          </div>

          {/* Success line */}
          <p className="text-[13px] text-[#3B82F6] mt-2">
            ✓ {photos.length} photo{photos.length !== 1 ? 's' : ''} — visual AI analysis enabled
          </p>
        </div>
      )}

      {/* Drop zone (shown when room for more, or no photos) */}
      {!hasPhotos && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg py-4 px-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all',
            dragActive
              ? 'border-[#3B82F6] bg-[#3B82F6]/5'
              : 'border-[#374151] hover:border-[#3B82F6]/50'
          )}
        >
          {dragActive ? (
            <p className="text-sm text-[#3B82F6] font-medium">📷 Drop to upload</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#64748B]" />
                <Camera className="w-5 h-5 text-[#64748B]" />
              </div>
              <p className="text-sm text-[#94A3B8] text-center">
                📷 Drag photos here or click to upload
              </p>
              <p className="text-xs text-[#64748B] text-center">
                {helperText || `Fracture surfaces, cross-sections, macro shots — up to ${maxFiles} images for visual AI analysis`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error toast */}
      {errorMessage && (
        <p className="mt-1.5 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
