'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TicketsAPI, PrioritiesAPI, CategoriesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Ticket, TicketStatus, Comment, Category, Attachment, TicketEvent, TicketPriority } from '@/types';
import Icon, { faArrowLeft, faEdit, faCheck, faTimes, faLock, faFile, faHistory, faFileAlt, faImage, faPlus, faUpload, faTrash } from '@/app/components/Icon';
import { toast } from '@/app/components/Toaster';
import { TicketDetailSkeleton } from '@/app/components/Skeleton';

const STATUS_OPTIONS: { value: TicketStatus; label: string; class: string }[] = [
  { value: 'New', label: 'New', class: 'status-new' },
  { value: 'Assigned', label: 'Assigned', class: 'status-open' },
  { value: 'In_Progress', label: 'In Progress', class: 'status-open' },
  { value: 'On_Hold', label: 'On Hold', class: 'status-open' },
  { value: 'Resolved', label: 'Resolved', class: 'status-resolved' },
  { value: 'Closed', label: 'Closed', class: 'status-closed' },
  { value: 'Reopened', label: 'Reopened', class: 'status-open' },
];

// Removed mock data functions - using API data instead

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (typeof bytes !== 'number') return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Attachment Item Component
function AttachmentItem({ attachment, onPreview, onRemove, loading }: { attachment: Attachment; onPreview: (url: string) => void; onRemove?: (id: string) => void; loading: boolean }) {
  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  };

  const fileType = getFileType(attachment.mime_type);
  let fileIcon: any;
  switch (fileType) {
    case 'image': fileIcon = faImage; break;
    case 'audio': fileIcon = faFileAlt; break;
    case 'video': fileIcon = faFileAlt; break;
    default: fileIcon = faFileAlt; break;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-3 text-xs group relative">
      <button 
        className="block w-full" 
        onClick={() => onPreview(attachment.stored_filename)}
        disabled={loading}
      >
        {fileType === 'image' ? (
          <img 
            src={attachment.stored_filename} 
            alt={attachment.original_filename} 
            className="w-full h-24 object-cover rounded-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.svg';
            }}
          />
        ) : (
          <div className="w-full h-24 bg-gray-50 rounded-sm flex items-center justify-center">
            <Icon icon={fileIcon} className="text-gray-600" size="2x" />
          </div>
        )}
      </button>
      <div className="mt-2 truncate font-medium text-gray-800">{attachment.original_filename}</div>
      <div className="text-xs text-gray-500">
        {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'} • {new Date(attachment.uploaded_at).toLocaleDateString()}
      </div>
      
      {onRemove && (
        <button 
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(attachment.id)} 
          disabled={loading}
        >
          <Icon icon={faTimes} size="xs" />
        </button>
      )}
    </div>
  );
}

// Media Preview Component
function MediaPreview({ url }: { url: string }) {
  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) return 'audio';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'file';
  };

  const fileType = getFileType(url);

  if (fileType === 'image') {
    return <img src={url} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-sm" />;
  } else if (fileType === 'video') {
    return (
      <video 
        src={url} 
        controls 
        className="w-full max-h-[80vh] rounded-sm"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    );
  } else if (fileType === 'audio') {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-100 p-4 rounded-sm">
        <audio 
          src={url} 
          controls 
          className="w-full"
          preload="metadata"
        >
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  } else {
    return (
      <div className="w-full max-h-[80vh] flex items-center justify-center bg-gray-100 rounded-sm p-4">
        <div className="text-center">
          <Icon icon={faFileAlt} className="text-gray-400 mx-auto mb-4" size="4x" />
          <p className="text-gray-600">Preview not available for this file type</p>
        </div>
      </div>
    );
  }
}

export default function AgentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const ticketId = params?.id as string | undefined;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    status: '' as TicketStatus | '',
    priority_id: '' as string | '',
    category_ids: [] as string[],
  });

  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Fetch priorities and categories
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [prioritiesList, categoriesList] = await Promise.all([
          PrioritiesAPI.list().catch(() => []),
          CategoriesAPI.list().catch(() => []),
        ]);
        
        setPriorities(prioritiesList || []);
        setAllCategories(categoriesList || []);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    
    fetchDropdownData();
  }, []);

  // Fetch ticket data
  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const ticketData = await TicketsAPI.get(ticketId);
        
        // Verify the ticket is assigned to the current agent
        if (currentUser && ticketData.assignee_id && String(ticketData.assignee_id) !== String(currentUser.id)) {
          router.push('/agent/tickets');
          return;
        }
        
        setTicket(ticketData);
        setComments(ticketData.comments || []);
        setCategories(ticketData.categories?.map((tc: any) => tc.category || tc) || []);
        setAttachments(ticketData.attachments || []);
        setEvents(ticketData.ticket_events || []);
        
        setEditData({
          status: ticketData.status,
          priority_id: ticketData.priority_id || '',
          category_ids: ticketData.categories?.map((tc: any) => (tc.category || tc).id) || [],
        });
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        router.push('/agent/tickets');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId, currentUser, router]);

  const handleFieldChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setEditData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleSave = async () => {
    if (!ticket || !ticketId) return;
    
    setSaving(true);
    
    try {
      const updateData: any = {};
      if (editData.status && editData.status !== ticket.status) {
        updateData.status = editData.status;
      }
      if (editData.priority_id && editData.priority_id !== ticket.priority_id) {
        updateData.priority_id = editData.priority_id;
      }
      if (JSON.stringify(editData.category_ids.sort()) !== JSON.stringify((ticket.categories || []).map((tc: any) => (tc.category || tc).id).sort())) {
        updateData.category_ids = editData.category_ids;
      }
      
      if (Object.keys(updateData).length > 0) {
        const updatedTicket = await TicketsAPI.update(ticketId, updateData);
        setTicket(updatedTicket);
        setCategories(updatedTicket.categories?.map((tc: any) => tc.category || tc) || []);
        toast.success('Ticket updated successfully!');
      } else {
        toast.info('No changes to save');
      }
      
      setEditMode(false);
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update ticket. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!ticket) return;
    setEditData({
      status: ticket.status,
      priority_id: ticket.priority_id || '',
      category_ids: (ticket.categories || []).map((tc: any) => (tc.category || tc).id),
    });
    setEditMode(false);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket || !ticketId) return;
    
    setSaving(true);
    
    try {
      const newComment = await TicketsAPI.addComment(ticketId, {
        content: comment,
        is_internal: isInternal,
      });
      
      setComments(prev => [...prev, newComment]);
      setComment('');
      setIsInternal(false);
      toast.success(isInternal ? 'Internal comment added successfully' : 'Comment added successfully');
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to add comment. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !ticket || !ticketId) return;
    
    // Validate media files
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('audio/') || 
      file.type.startsWith('video/')
    );
    
    if (mediaFiles.length !== files.length) {
      toast.warning('Only image, audio, and video files are allowed');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload files one by one
      for (const file of mediaFiles) {
        // For now, we'll need to upload the file to a storage service first
        // This is a placeholder - actual implementation depends on your file storage setup
        const attachmentData = {
          original_filename: file.name,
          stored_filename: file.name, // This should be the URL from your storage service
          mime_type: file.type,
          size: file.size,
        };
        
        const newAttachment = await TicketsAPI.addAttachment(ticketId, attachmentData);
        setAttachments(prev => [...prev, newAttachment]);
      }
      toast.success(`Successfully uploaded ${mediaFiles.length} file(s)`);
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to upload file. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!ticketId) return;
    
    try {
      await TicketsAPI.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast.success('Attachment deleted successfully');
    } catch (error: any) {
      console.error('Failed to remove attachment:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to remove attachment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <TicketDetailSkeleton />;
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link href="/agent/tickets" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
          <Icon icon={faArrowLeft} size="sm" />
          Back to Tickets
        </Link>
        <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Ticket not found or you don't have access to this ticket</p>
        </div>
      </div>
    );
  }

  const displayedComments = showAllComments ? comments : comments.slice(-3);
  const hasMoreComments = comments.length > 3;
  const statusClass = STATUS_OPTIONS.find(s => s.value === ticket.status)?.class || 'status-new';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/agent/tickets" className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
            <Icon icon={faArrowLeft} className="text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.ticket_code}</h1>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button 
                className="btn btn-secondary text-sm"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                onClick={handleSave}
                disabled={saving}
                style={{ backgroundColor: '#0f36a5' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <button 
              className="btn btn-secondary text-sm flex items-center gap-2"
              onClick={() => setEditMode(true)}
            >
              <Icon icon={faEdit} size="sm" />
              Edit Ticket
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Ticket Info, Requester, Description) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Ticket Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Ticket Code</label>
                  <div className="font-mono text-primary-500 font-medium">{ticket.ticket_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  {editMode ? (
                    <select
                      value={editData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`status-badge ${statusClass}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
                <div className="font-medium text-lg text-gray-900">{ticket.subject}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  {editMode ? (
                    <select
                      value={editData.priority_id}
                      onChange={(e) => handleFieldChange('priority_id', e.target.value ? Number(e.target.value) : '')}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    >
                      <option value="">Select Priority</option>
                      {priorities.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-sm text-sm inline-block">
                      {ticket.priority?.name || 'N/A'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Assignee</label>
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-sm text-sm inline-block">
                    {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Categories</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((tag) => (
                      <label
                        key={tag.id}
                        className={`px-3 py-1.5 rounded-sm text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          editData.category_ids.includes(String(tag.id))
                            ? 'text-white border border-primary-500'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={editData.category_ids.includes(String(tag.id)) ? { backgroundColor: '#0f36a5', borderColor: '#0f36a5' } : undefined}
                      >
                        <input
                          type="checkbox"
                          checked={editData.category_ids.includes(String(tag.id))}
                          onChange={() => toggleCategory(String(tag.id))}
                          disabled={saving}
                          className="sr-only"
                        />
                        {editData.category_ids.includes(String(tag.id)) && <Icon icon={faCheck} size="xs" />}
                        {tag.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((tag) => (
                        <span key={tag.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-sm text-sm">
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No categories assigned</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requester Information */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Requester Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <div className="text-gray-800">{ticket.requester_name || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="text-gray-800">{ticket.requester_email || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <div className="text-gray-800">{ticket.requester_phone || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <div className="text-gray-800">{ticket.location || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Description</h2>
            </div>
            <div className="p-6">
              {ticket.description ? (
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Comments, Attachments, History) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Comments */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Comments</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {displayedComments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet.</p>
                ) : (
                  displayedComments.map((c) => (
                    <div
                      key={c.id}
                      className={`border rounded-sm p-3 ${
                        c.is_internal
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>
                          {c.author?.first_name} {c.author?.last_name} • {formatDate(c.created_at)}
                        </span>
                        {c.is_internal && (
                          <span className="flex items-center gap-1 text-blue-700">
                            <Icon icon={faLock} size="xs" /> Internal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {hasMoreComments && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Show all {comments.length} comments
                </button>
              )}

              {showAllComments && hasMoreComments && (
                <button
                  onClick={() => setShowAllComments(false)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Show fewer comments
                </button>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <textarea
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm min-h-[80px] resize-y"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={saving || !comment.trim()}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Comment'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon={faFile} size="sm" /> Attachments
              </h2>
              {editMode && (
                <label 
                  htmlFor="file-upload" 
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                >
                  <Icon icon={faPlus} size="xs" /> Add Files
                  <input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    accept="image/*,audio/*,video/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    ref={fileInputRef}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <div className="p-6">
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading files...
                </div>
              )}
              {attachments.length === 0 && !uploading ? (
                <p className="text-gray-500 text-center py-4">No attachments yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {attachments.map((att) => (
                    <AttachmentItem 
                      key={att.id} 
                      attachment={att} 
                      onPreview={setPreviewUrl} 
                      onRemove={editMode ? handleRemoveAttachment : undefined}
                      loading={uploading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon={faHistory} size="sm" /> History
              </h2>
            </div>
            <div className="p-6">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No history available.</p>
              ) : (
                <div className="space-y-4 relative">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 relative">
                      {index < events.length - 1 && (
                        <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div 
                        className="w-5 h-5 rounded-full flex-shrink-0 z-10 flex items-center justify-center"
                        style={{ backgroundColor: '#0f36a5' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">
                          {event.change_type.replace(/_/g, ' ')}
                          {event.old_value && event.new_value && (
                            <span className="text-gray-600 ml-2">
                              (<span className="font-normal">{event.old_value}</span> → <span className="font-normal">{event.new_value}</span>)
                            </span>
                          )}
                          {!event.old_value && event.new_value && (
                            <span className="text-gray-600 ml-2">
                              (<span className="font-normal">{event.new_value}</span>)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(event.created_at)} • {event.user ? `${event.user.first_name} ${event.user.last_name}` : 'System'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setPreviewUrl(null)} 
                className="p-2 bg-white text-gray-700 rounded-sm hover:bg-gray-100 transition-colors"
              >
                <Icon icon={faTimes} size="lg" />
              </button>
            </div>
            <MediaPreview url={previewUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

