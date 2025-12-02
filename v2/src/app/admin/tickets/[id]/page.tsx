'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities, mockTags } from '@/lib/mockData';
import { Ticket, TicketStatus, Comment, Tag, Attachment, TicketEvent } from '@/types';
import Icon, { faArrowLeft, faEdit, faCheck, faTimes, faLock, faImage, faFile, faTrash, faUpload } from '@/app/components/Icon';

const STATUS_OPTIONS: { value: TicketStatus; label: string; class: string }[] = [
  { value: 'New', label: 'New', class: 'status-new' },
  { value: 'Assigned', label: 'Assigned', class: 'status-open' },
  { value: 'In_Progress', label: 'In Progress', class: 'status-open' },
  { value: 'On_Hold', label: 'On Hold', class: 'status-open' },
  { value: 'Resolved', label: 'Resolved', class: 'status-resolved' },
  { value: 'Closed', label: 'Closed', class: 'status-closed' },
  { value: 'Reopened', label: 'Reopened', class: 'status-open' },
];

// Mock comments for tickets
const generateMockComments = (ticketId: number): Comment[] => {
  const comments: Comment[] = [];
  const agents = mockUsers.filter(u => u.role === 'agent' || u.role === 'admin');
  
  // Add 2-5 comments per ticket
  const commentCount = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < commentCount; i++) {
    const author = agents[Math.floor(Math.random() * agents.length)];
    const isInternal = Math.random() > 0.6; // 40% internal comments
    const date = new Date();
    date.setDate(date.getDate() - (commentCount - i));
    
    comments.push({
      id: ticketId * 100 + i + 1,
      content: isInternal 
        ? `Internal note: ${['Following up on this issue', 'Need to escalate', 'Waiting for customer response', 'Resolved internally'][Math.floor(Math.random() * 4)]}`
        : `Customer response: ${['Thank you for the update', 'This is still an issue', 'Can you provide more details?', 'Issue resolved, thank you!'][Math.floor(Math.random() * 4)]}`,
      is_internal: isInternal,
      created_at: date.toISOString(),
      ticket_id: ticketId,
      author_id: author.id,
      author: author,
    });
  }
  
  return comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

// Mock tags for tickets
const generateMockTags = (ticketId: number): Tag[] => {
  const tagCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
  const selectedTags: Tag[] = [];
  const availableTags = [...mockTags];
  
  for (let i = 0; i < tagCount && availableTags.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableTags.length);
    selectedTags.push(availableTags.splice(randomIndex, 1)[0]);
  }
  
  return selectedTags;
};

// Mock attachments for tickets
const generateMockAttachments = (ticketId: number): Attachment[] => {
  const attachments: Attachment[] = [];
  const attachmentCount = Math.floor(Math.random() * 4); // 0-3 attachments
  
  const fileTypes = [
    { type: 'image', mime: 'image/jpeg', ext: 'jpg', name: 'screenshot' },
    { type: 'image', mime: 'image/png', ext: 'png', name: 'error-log' },
    { type: 'audio', mime: 'audio/mpeg', ext: 'mp3', name: 'recording' },
    { type: 'video', mime: 'video/mp4', ext: 'mp4', name: 'demo' },
  ];
  
  for (let i = 0; i < attachmentCount; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const uploadedBy = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const date = new Date();
    date.setDate(date.getDate() - (attachmentCount - i));
    
    attachments.push({
      id: ticketId * 1000 + i + 1,
      original_filename: `${fileType.name}-${ticketId}-${i + 1}.${fileType.ext}`,
      stored_filename: `https://via.placeholder.com/400x300?text=${fileType.name}`,
      mime_type: fileType.mime,
      size: fileType.type === 'image' ? 1024 * 500 : 1024 * 1024 * 5, // 500KB for images, 5MB for media
      uploaded_at: date.toISOString(),
      ticket_id: ticketId,
      uploaded_by_id: uploadedBy.id,
      uploaded_by: uploadedBy,
    });
  }
  
  return attachments;
};

// Mock ticket events/history
const generateMockEvents = (ticket: Ticket): TicketEvent[] => {
  const events: TicketEvent[] = [];
  const users = mockUsers.filter(u => u.role === 'admin' || u.role === 'agent');
  
  // Ticket created event
  events.push({
    id: ticket.id * 10000 + 1,
    ticket_id: ticket.id,
    user_id: ticket.created_by_id,
    change_type: 'ticket_created',
    new_value: ticket.subject,
    created_at: ticket.created_at,
    user: ticket.created_by,
  });
  
  // Status changes
  if (ticket.status !== 'New') {
    const statusChangeDate = new Date(ticket.created_at);
    statusChangeDate.setHours(statusChangeDate.getHours() + 1);
    events.push({
      id: ticket.id * 10000 + 2,
      ticket_id: ticket.id,
      user_id: ticket.assignee_id || ticket.created_by_id,
      change_type: 'status_changed',
      old_value: 'New',
      new_value: ticket.status,
      created_at: statusChangeDate.toISOString(),
      user: ticket.assignee || ticket.created_by,
    });
  }
  
  // Assignment
  if (ticket.assignee_id) {
    const assignDate = new Date(ticket.created_at);
    assignDate.setHours(assignDate.getHours() + 2);
    events.push({
      id: ticket.id * 10000 + 3,
      ticket_id: ticket.id,
      user_id: ticket.assignee_id,
      change_type: 'assigned',
      new_value: `${ticket.assignee?.first_name} ${ticket.assignee?.last_name}`,
      created_at: assignDate.toISOString(),
      user: ticket.assignee,
    });
  }
  
  // Priority set
  if (ticket.priority_id) {
    const priorityDate = new Date(ticket.created_at);
    priorityDate.setMinutes(priorityDate.getMinutes() + 30);
    events.push({
      id: ticket.id * 10000 + 4,
      ticket_id: ticket.id,
      user_id: ticket.created_by_id,
      change_type: 'priority_changed',
      new_value: ticket.priority?.name || 'Medium',
      created_at: priorityDate.toISOString(),
      user: ticket.created_by,
    });
  }
  
  return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id ? parseInt(params.id as string) : null;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
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
    priority_id: '' as number | '',
    assignee_id: '' as number | '',
    tag_ids: [] as number[],
  });

  // Get agents and admins for assignee dropdown
  const agents = useMemo(() => mockUsers.filter(u => u.role === 'agent' || u.role === 'admin'), []);

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const foundTicket = mockTickets.find(t => t.id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
        setComments(generateMockComments(ticketId));
        const mockTags = generateMockTags(ticketId);
        setTags(mockTags);
        setAttachments(generateMockAttachments(ticketId));
        setEvents(generateMockEvents(foundTicket));
        setEditData({
          status: foundTicket.status,
          priority_id: foundTicket.priority_id,
          assignee_id: foundTicket.assignee_id || '',
          tag_ids: mockTags.map(t => t.id),
        });
      }
      setLoading(false);
    }, 300);
  }, [ticketId]);

  const handleFieldChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId: number) => {
    setEditData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleSave = async () => {
    if (!ticket) return;
    
    setSaving(true);
    
    // Mock API call
    setTimeout(() => {
      setTicket(prev => prev ? {
        ...prev,
        status: editData.status || prev.status,
        priority_id: editData.priority_id || prev.priority_id,
        assignee_id: editData.assignee_id || undefined,
        priority: mockPriorities.find(p => p.id === editData.priority_id) || prev.priority,
        assignee: mockUsers.find(u => u.id === editData.assignee_id) || prev.assignee,
      } : null);
      
      setTags(mockTags.filter(t => editData.tag_ids.includes(t.id)));
      setEditMode(false);
      setSaving(false);
    }, 500);
  };

  const handleCancel = () => {
    if (!ticket) return;
    setEditData({
      status: ticket.status,
      priority_id: ticket.priority_id,
      assignee_id: ticket.assignee_id || '',
      tag_ids: tags.map(t => t.id),
    });
    setEditMode(false);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return;
    
    setSaving(true);
    
    // Mock API call
    setTimeout(() => {
      const newComment: Comment = {
        id: comments.length + 1,
        content: comment,
        is_internal: isInternal,
        created_at: new Date().toISOString(),
        ticket_id: ticket.id,
        author_id: 1, // Mock admin user
        author: mockUsers.find(u => u.role === 'admin') || mockUsers[0],
      };
      
      setComments(prev => [...prev, newComment]);
      setComment('');
      setIsInternal(false);
      setSaving(false);
    }, 300);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !ticket) return;
    
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
    
    // Mock API call
    setTimeout(() => {
      const newAttachments: Attachment[] = mediaFiles.map((file, index) => {
        const uploadedBy = mockUsers.find(u => u.role === 'admin') || mockUsers[0];
        return {
          id: attachments.length + index + 1,
          original_filename: file.name,
          stored_filename: URL.createObjectURL(file),
          mime_type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          ticket_id: ticket.id,
          uploaded_by_id: uploadedBy.id,
          uploaded_by: uploadedBy,
        };
      });
      
      setAttachments(prev => [...prev, ...newAttachments]);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 500);
  };

  const handleRemoveAttachment = (attachmentId: number) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
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
                      {mockPriorities.map((p) => (
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
                    {mockTags.map((tag) => (
                      <label
                        key={tag.id}
                        className={`px-3 py-1.5 rounded-sm text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          editData.tag_ids.includes(tag.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editData.tag_ids.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          disabled={saving}
                          className="sr-only"
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
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

