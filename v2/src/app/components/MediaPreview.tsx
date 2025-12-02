'use client';

import Icon, { faTimes, faFileAlt } from './Icon';

interface MediaPreviewProps {
  url: string;
  onClose: () => void;
  filename?: string;
}

export default function MediaPreview({ url, onClose, filename }: MediaPreviewProps) {
  const getFileType = (url: string): 'image' | 'audio' | 'video' | 'file' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) return 'audio';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    return 'file';
  };

  const fileType = getFileType(url);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-2 bg-white text-gray-700 rounded-sm hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <Icon icon={faTimes} size="lg" />
          </button>
        </div>

        {fileType === 'image' && (
          <img
            src={url}
            alt={filename || 'Preview'}
            className="w-full max-h-[80vh] object-contain rounded-sm bg-white"
          />
        )}

        {fileType === 'video' && (
          <video
            src={url}
            controls
            className="w-full max-h-[80vh] rounded-sm bg-black"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {fileType === 'audio' && (
          <div className="w-full max-w-md mx-auto bg-white p-4 rounded-sm">
            {filename && (
              <div className="text-sm font-medium text-gray-900 mb-3 text-center">
                {filename}
              </div>
            )}
            <audio
              src={url}
              controls
              className="w-full"
              preload="metadata"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        )}

        {fileType === 'file' && (
          <div className="w-full max-h-[80vh] flex items-center justify-center bg-white rounded-sm p-8">
            <div className="text-center">
              <Icon icon={faFileAlt} className="text-gray-400 mx-auto mb-4" size="4x" />
              <p className="text-gray-600 mb-2">Preview not available for this file type</p>
              {filename && (
                <p className="text-sm text-gray-500">{filename}</p>
              )}
              <a
                href={url}
                download={filename}
                className="mt-4 inline-block px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm"
                style={{ backgroundColor: '#0f36a5' }}
                onClick={(e) => e.stopPropagation()}
              >
                Download File
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

