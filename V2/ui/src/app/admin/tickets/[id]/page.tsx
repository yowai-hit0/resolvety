'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TicketsAPI, UsersAPI, PrioritiesAPI, CategoriesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Ticket, TicketStatus, Comment, Category, Attachment, TicketEvent, User, TicketPriority } from '@/types';
import Icon, { faArrowLeft, faEdit, faCheck, faTimes, faLock, faImage, faFile, faTrash, faUpload } from '@/app/components/Icon';
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

// Removed generateMockComments - using API data instead

// Removed generateMockTags - using API data instead

// Removed generateMockAttachments - using API data instead

// Events will come from the API response (ticket.ticket_events)

export default function TicketDetailPage() {
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
    assignee_id: '' as string | '',
    category_ids: [] as string[],
  });

  // Get agents and admins for assignee dropdown
  const [agents, setAgents] = useState<User[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Fetch users, priorities, and categories
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [usersList, prioritiesList, categoriesList] = await Promise.all([
          UsersAPI.list({ take: 1000 }).catch(() => ({ data: [] })),
          PrioritiesAPI.list().catch(() => []),
          CategoriesAPI.list().catch(() => []),
        ]);
        
        setAgents((usersList.data || usersList || []).filter((u: User) => u.role === 'agent' || u.role === 'admin'));
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
        
        setTicket(ticketData);
        setComments(ticketData.comments || []);
        setCategories(ticketData.categories?.map((tc: any) => tc.category || tc) || []);
        setAttachments(ticketData.attachments || []);
        setEvents(ticketData.ticket_events || []);
        
        setEditData({
          status: ticketData.status,
          priority_id: ticketData.priority_id || '',
          assignee_id: ticketData.assignee_id || '',
          category_ids: ticketData.categories?.map((tc: any) => (tc.category || tc).id) || [],
        });
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        router.push('/admin/tickets');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId, router]);

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
      if (editData.assignee_id !== ticket.assignee_id) {
        updateData.assignee_id = editData.assignee_id || undefined;
      }
      if (JSON.stringify(editData.category_ids.sort()) !== JSON.stringify((ticket.categories || []).map((tc: any) => (tc.category || tc).id).sort())) {
        updateData.category_ids = editData.category_ids;
      }
      
      if (Object.keys(updateData).length > 0) {
        const updatedTicket = await TicketsAPI.update(ticketId, updateData);
        setTicket(updatedTicket);
        setCategories(updatedTicket.categories?.map((tc: any) => tc.category || tc) || []);
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!ticket) return;
    setEditData({
      status: ticket.status,
      priority_id: ticket.priority_id || '',
      assignee_id: ticket.assignee_id || '',
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
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
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
      alert('Only image, audio, and video files are allowed');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload files one by one (backend may support multiple, but we'll do one at a time for now)
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
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    
    try {
      await TicketsAPI.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment. Please try again.');
    }
  };

  const getFileType = (mimeType: string): 'image' | 'audio' | 'video' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'image';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatEventType = (changeType: string): string => {
    return changeType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return <TicketDetailSkeleton />;
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
          <Icon icon={faArrowLeft} size="sm" />
          Back to Tickets
        </Link>
        <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Ticket not found</p>
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
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
            <Icon icon={faArrowLeft} size="sm" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
            <p className="text-sm text-gray-600 mt-1">{ticket.ticket_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: '#0f36a5' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon={faCheck} size="sm" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: '#0f36a5' }}
            >
              <Icon icon={faEdit} size="sm" />
              Edit Ticket
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Ticket Information */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Ticket Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Code</label>
                  <div className="font-mono text-primary-500 font-medium">{ticket.ticket_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  {editMode ? (
                    <select
                      value={editData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value as TicketStatus)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="font-medium text-lg text-gray-900">{ticket.subject}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
                    <div className="text-sm text-gray-900">{ticket.priority?.name || 'Not set'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  {editMode ? (
                    <select
                      value={editData.assignee_id}
                      onChange={(e) => handleFieldChange('assignee_id', e.target.value ? Number(e.target.value) : '')}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.first_name} {a.last_name} ({a.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((tag) => (
                      <label
                        key={tag.id}
                        className={`px-3 py-1.5 rounded-sm text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          editData.category_ids.includes(tag.id)
                            ? 'text-white border border-primary-500'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={editData.category_ids.includes(tag.id) ? { backgroundColor: '#0f36a5', borderColor: '#0f36a5' } : undefined}
                      >
                        <input
                          type="checkbox"
                          checked={editData.category_ids.includes(tag.id)}
                          onChange={() => toggleCategory(tag.id)}
                          disabled={saving}
                          className="sr-only"
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((tag) => (
                        <span key={tag.id} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-sm text-sm text-gray-700">
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No categories</span>
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
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-sm text-gray-900">{ticket.requester_name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-sm text-gray-900">{ticket.requester_email || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="text-sm text-gray-900">{ticket.requester_phone || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="text-sm text-gray-900">{ticket.location || 'Not provided'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Description</h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {ticket.description || 'No description provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Comments */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Comments</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {displayedComments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm">No comments yet</p>
                ) : (
                  displayedComments.map((c) => (
                    <div
                      key={c.id}
                      className={`border rounded-sm p-3 ${
                        c.is_internal
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>
                          {c.author?.first_name} {c.author?.last_name} ({c.author?.email}) • {formatTimeAgo(c.created_at)}
                        </span>
                        {c.is_internal && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Icon icon={faLock} size="xs" />
                            Internal
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{c.content}</div>
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
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    Internal note
                  </label>
                  <button
                    onClick={handleAddComment}
                    disabled={saving || !comment.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    style={{ backgroundColor: '#0f36a5' }}
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
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Attachments</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-sm hover:bg-gray-200 cursor-pointer text-sm text-gray-700 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Icon icon={faUpload} size="sm" />
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </label>
                <span className="ml-3 text-xs text-gray-500">
                  Images (5MB), Audio/Video (50MB)
                </span>
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {attachments.map((attachment) => {
                    const fileType = getFileType(attachment.mime_type);
                    return (
                      <div key={attachment.id} className="border border-gray-200 rounded-sm p-3 text-xs group relative">
                        <button
                          onClick={() => setPreviewUrl(attachment.stored_filename)}
                          className="block w-full"
                          disabled={uploading}
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
                            <div className="w-full h-24 bg-gray-100 rounded-sm flex items-center justify-center">
                              {fileType === 'audio' ? (
                                <Icon icon={faFile} className="text-gray-600" size="lg" />
                              ) : fileType === 'video' ? (
                                <Icon icon={faImage} className="text-gray-600" size="lg" />
                              ) : (
                                <Icon icon={faFile} className="text-gray-600" size="lg" />
                              )}
                            </div>
                          )}
                        </button>
                        <div className="mt-2 truncate text-gray-900">{attachment.original_filename}</div>
                        <div className="text-xs text-gray-500">
                          {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'}
                        </div>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          disabled={uploading}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <Icon icon={faTrash} size="xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No attachments</p>
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">History</h2>
            </div>
            <div className="p-6">
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No history yet</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="relative pl-6 pb-4">
                      {/* Timeline line */}
                      {index < events.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1.5 w-4 h-4 bg-primary-500 rounded-full border-2 border-white"></div>
                      {/* Event content */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {formatEventType(event.change_type)}
                          </span>
                          {event.old_value && event.new_value && (
                            <span className="text-xs text-gray-500">
                              ({event.old_value} → {event.new_value})
                            </span>
                          )}
                          {!event.old_value && event.new_value && (
                            <span className="text-xs text-gray-500">{event.new_value}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(event.created_at)} • {event.user ? `${event.user.first_name} ${event.user.last_name}` : 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 text-sm text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="bg-white rounded-sm p-4">
              {getFileType(attachments.find(a => a.stored_filename === previewUrl)?.mime_type || '') === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[80vh] object-contain rounded-sm"
                />
              ) : getFileType(attachments.find(a => a.stored_filename === previewUrl)?.mime_type || '') === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-[80vh] rounded-sm"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio
                  src={previewUrl}
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

