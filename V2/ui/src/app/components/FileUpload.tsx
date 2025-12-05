'use client';

import { useRef, useState, useCallback } from 'react';
import Icon, { faUpload, faTimes, faImage, faFileAlt } from './Icon';

export interface UploadedFile {
  url: string;
  type: 'image' | 'audio' | 'video' | 'file';
  file: File;
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  showPreview?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (file: File): 'image' | 'audio' | 'video' | 'file' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'file';
};

export default function FileUpload({
  accept = 'image/*,audio/*,video/*',
  multiple = true,
  maxSize,
  onFilesChange,
  onUpload,
  uploadedFiles: externalFiles,
  disabled = false,
  loading = false,
  className = '',
  label = 'Attachments',
  showPreview = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const files = externalFiles || internalFiles;

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validate file sizes
    if (maxSize) {
      const oversizedFiles = fileArray.filter(f => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert(`Some files exceed the maximum size of ${formatFileSize(maxSize)}`);
        return;
      }
    }

    const newFiles: UploadedFile[] = fileArray.map(file => {
      const type = getFileType(file);
      const url = URL.createObjectURL(file);
      return {
        url,
        type,
        file,
        preview: type === 'image' ? url : undefined,
      };
    });

    if (externalFiles === undefined) {
      // Internal state management
      setInternalFiles(prev => [...prev, ...newFiles]);
    }

    // Call onFilesChange callback
    if (onFilesChange) {
      const allFiles = externalFiles ? [...externalFiles, ...newFiles] : [...internalFiles, ...newFiles];
      onFilesChange(allFiles);
    }

    // Call onUpload callback if provided
    if (onUpload) {
      try {
        await onUpload(fileArray);
      } catch (error) {
        console.error('Upload error:', error);
        // Remove files on error
        if (externalFiles === undefined) {
          setInternalFiles(prev => prev.filter(f => !newFiles.includes(f)));
        }
      }
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxSize, onFilesChange, onUpload, externalFiles, internalFiles]);

  const handleRemove = useCallback((fileToRemove: UploadedFile) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(fileToRemove.url);

    if (externalFiles === undefined) {
      setInternalFiles(prev => prev.filter(f => f.url !== fileToRemove.url));
    }

    if (onFilesChange) {
      const updatedFiles = files.filter(f => f.url !== fileToRemove.url);
      onFilesChange(updatedFiles);
    }
  }, [files, onFilesChange, externalFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className={className}>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled || loading}
            className="hidden"
            id="file-upload-input"
          />
          <label
            htmlFor="file-upload-input"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-sm hover:bg-gray-200 cursor-pointer text-sm text-gray-700 transition-colors ${
              disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Icon icon={faUpload} size="sm" />
            {loading ? 'Uploading...' : 'Upload Files'}
          </label>
          {maxSize && (
            <span className="text-xs text-gray-500">
              Max size: {formatFileSize(maxSize)}
            </span>
          )}
        </div>
      </div>

      {showPreview && files.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-sm">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === 'image' && file.preview ? (
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-sm border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-sm border border-gray-200 flex items-center justify-center">
                  <Icon
                    icon={file.type === 'audio' || file.type === 'video' ? faFileAlt : faFileAlt}
                    className="text-gray-600"
                    size="lg"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(file)}
                disabled={loading}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                aria-label={`Remove ${file.file.name}`}
              >
                <Icon icon={faTimes} size="xs" />
              </button>
              {uploadProgress[file.file.name] !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                  {uploadProgress[file.file.name]}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && !showPreview && (
        <div className="text-xs text-gray-500">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

