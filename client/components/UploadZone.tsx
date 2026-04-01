'use client';

import { useTranslations } from 'next-intl';
import { useDropzone, type Accept } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

interface UploadZoneProps {
  accept: Accept;
  maxFiles: number;
  maxSize: number;
  onDrop: (files: File[]) => void;
  files: File[];
  helpText: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
  accept,
  maxFiles,
  maxSize,
  onDrop,
  files,
  helpText,
}: UploadZoneProps) {
  const t = useTranslations('upload');

  const handleDrop = useCallback(
    (accepted: File[]) => {
      onDrop(accepted);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const isImage = Object.keys(accept).some((k) => k.startsWith('image'));

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'upload-zone-active border-accent-primary'
            : 'border-border-subtle hover:border-border-hover glass-hover'
        } glass`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isDragActive ? 'bg-accent-primary/20' : 'bg-white/5'
            }`}
          >
            <svg
              className={`w-7 h-7 transition-colors duration-300 ${
                isDragActive ? 'text-accent-primary' : 'text-text-muted'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-text-primary text-sm font-medium">{t('dragDrop')}</p>
            <p className="text-text-muted text-xs mt-1">{helpText}</p>
          </div>

          <button
            type="button"
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white border border-border-subtle transition-all duration-200"
          >
            {t('selectFiles')}
          </button>
        </div>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-2"
        >
          {files.map((file, i) => (
            <motion.div
              key={`${file.name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass text-sm"
            >
              {isImage && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!isImage && (
                <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-xs truncate">{file.name}</p>
                <p className="text-text-muted text-xs">{formatFileSize(file.size)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
