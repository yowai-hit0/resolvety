'use client';

import { Attachment } from '@/types';
import Icon, { faImage, faFileAlt, faTimes, faTrash } from './Icon';

interface AttachmentItemProps {
  attachment: Attachment;
  onPreview?: (url: string) => void;
  onRemove?: (id: number) => void;
  loading?: boolean;
  showRemove?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || bytes === 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (mimeType: string): 'image' | 'audio' | 'video' | 'file' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'file';
};

export default function AttachmentItem({
  attachment,
  onPreview,
  onRemove,
  loading = false,
  showRemove = false,
}: AttachmentItemProps) {
  const fileType = getFileType(attachment.mime_type);
  
  let fileIcon = faFileAlt;
  if (fileType === 'image') fileIcon = faImage;
  // For audio/video, we use faFileAlt (can be enhanced later with specific icons)

  const handleClick = () => {
    if (onPreview && !loading) {
      onPreview(attachment.stored_filename);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !loading) {
      onRemove(attachment.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-3 text-xs group relative">
      {(onPreview || fileType === 'image') && (
        <button
          className="block w-full"
          onClick={handleClick}
          disabled={loading}
          aria-label={`Preview ${attachment.original_filename}`}
        >
          {fileType === 'image' ? (
            <img
              src={attachment.stored_filename}
              alt={attachment.original_filename}
              className="w-full h-24 object-cover rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-full h-24 bg-gray-50 rounded-sm flex items-center justify-center">
              <Icon icon={fileIcon} className="text-gray-600" size="2x" />
            </div>
          )}
        </button>
      )}
      
      {!onPreview && fileType !== 'image' && (
        <div className="w-full h-24 bg-gray-50 rounded-sm flex items-center justify-center">
          <Icon icon={fileIcon} className="text-gray-600" size="2x" />
        </div>
      )}

      <div className="mt-2 truncate font-medium text-gray-800">
        {attachment.original_filename}
      </div>
      <div className="text-xs text-gray-500">
        {formatFileSize(attachment.size || 0)} • {new Date(attachment.uploaded_at).toLocaleDateString()}
      </div>

      {(showRemove || onRemove) && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          aria-label={`Remove ${attachment.original_filename}`}
        >
          <Icon icon={faTrash || faTimes} size="xs" />
        </button>
      )}
    </div>
  );
}

