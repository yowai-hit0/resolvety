'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities, mockTags } from '@/lib/mockData';
import { Ticket, TicketStatus, Comment, Tag, Attachment, TicketEvent } from '@/types';
import Icon, { faArrowLeft, faEdit, faCheck, faTimes, faLock, faFile, faHistory, faFileAlt, faImage, faPlus, faUpload, faTrash } from '@/app/components/Icon';

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
  
  const commentCount = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < commentCount; i++) {
    const author = agents[Math.floor(Math.random() * agents.length)];
    const isInternal = Math.random() > 0.6;
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
  const tagCount = Math.floor(Math.random() * 3) + 1;
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
  const users = mockUsers.filter(u => u.role === 'admin' || u.role === 'agent');
  const fileTypes = [
    { mime: 'image/jpeg', ext: 'jpg', icon: faImage },
    { mime: 'image/png', ext: 'png', icon: faImage },
    { mime: 'audio/mpeg', ext: 'mp3', icon: faFileAlt },
    { mime: 'video/mp4', ext: 'mp4', icon: faFileAlt },
    { mime: 'application/pdf', ext: 'pdf', icon: faFileAlt },
  ];

  const attachmentCount = Math.floor(Math.random() * 3);

  for (let i = 0; i < attachmentCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const filename = `file-${ticketId}-${i}.${fileType.ext}`;
    const size = Math.floor(Math.random() * (5 * 1024 * 1024)) + 100 * 1024;
    const date = new Date();
    date.setDate(date.getDate() - (attachmentCount - i));

    attachments.push({
      id: ticketId * 1000 + i + 1,
      original_filename: filename,
      stored_filename: `/mock-files/${filename}`,
      mime_type: fileType.mime,
      size: size,
      uploaded_at: date.toISOString(),
      ticket_id: ticketId,
      uploaded_by_id: user.id,
      uploaded_by: user,
    });
  }
  return attachments;
};

// Mock ticket events/history
const generateMockEvents = (ticket: Ticket): TicketEvent[] => {
  const events: TicketEvent[] = [];
  const users = mockUsers.filter(u => u.role === 'admin' || u.role === 'agent');
  
  events.push({
    id: ticket.id * 10000 + 1,
    ticket_id: ticket.id,
    user_id: ticket.created_by_id,
    change_type: 'ticket_created',
    new_value: ticket.subject,
    created_at: ticket.created_at,
    user: ticket.created_by,
  });
  
  const statusChanges: TicketStatus[] = ['Assigned', 'In_Progress', 'Resolved', 'Closed'];
  let currentStatus = ticket.status;
  for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
    const newStatus = statusChanges[Math.floor(Math.random() * statusChanges.length)];
    if (newStatus !== currentStatus) {
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date(ticket.created_at);
      date.setDate(date.getDate() + i + 1);
      events.push({
        id: ticket.id * 10000 + 2 + i,
        ticket_id: ticket.id,
        user_id: user.id,
        change_type: 'status_changed',
        old_value: currentStatus,
        new_value: newStatus,
        created_at: date.toISOString(),
        user: user,
      });
      currentStatus = newStatus;
    }
  }

  if (ticket.assignee_id) {
    const user = users[Math.floor(Math.random() * users.length)];
    const date = new Date(ticket.created_at);
    date.setDate(date.getDate() + 1);
    events.push({
      id: ticket.id * 10000 + 10,
      ticket_id: ticket.id,
      user_id: user.id,
      change_type: 'assignee_changed',
      old_value: 'Unassigned',
      new_value: ticket.assignee?.first_name + ' ' + ticket.assignee?.last_name,
      created_at: date.toISOString(),
      user: user,
    });
  }
  
  return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (typeof bytes !== 'number') return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Attachment Item Component
function AttachmentItem({ attachment, onPreview, onRemove, loading }: { attachment: Attachment; onPreview: (url: string) => void; onRemove?: (id: number) => void; loading: boolean }) {
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
  const ticketId = params?.id ? parseInt(params.id as string) : null;
  const [currentAgent, setCurrentAgent] = useState<{ id: number } | null>(null);
  
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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    status: '' as TicketStatus | '',
    priority_id: '' as number | '',
    tag_ids: [] as number[],
  });

  // Get current agent
  useEffect(() => {
    try {
      const authRaw = sessionStorage.getItem('resolveitAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw) as { id?: number; role?: string } | null;
        if (auth?.role === 'agent' && auth?.id) {
          setCurrentAgent({ id: auth.id });
        }
      }
      if (!currentAgent) {
        const firstAgent = mockUsers.find(u => u.role === 'agent');
        if (firstAgent) {
          setCurrentAgent({ id: firstAgent.id });
        }
      }
    } catch (error) {
      console.error('Error loading agent info', error);
      const firstAgent = mockUsers.find(u => u.role === 'agent');
      if (firstAgent) {
        setCurrentAgent({ id: firstAgent.id });
      }
    }
  }, []);

  useEffect(() => {
    if (!ticketId || !currentAgent) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const foundTicket = mockTickets.find(t => t.id === ticketId && t.assignee_id === currentAgent.id);
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
          tag_ids: mockTags.map(t => t.id),
        });
      } else {
        setTicket(null);
      }
      setLoading(false);
    }, 800);
  }, [ticketId, currentAgent]);

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

  const handleSaveChanges = () => {
    if (!ticket) return;
    setSaving(true);
    
    setTimeout(() => {
      const updatedTicket = {
        ...ticket,
        status: editData.status as TicketStatus,
        priority_id: editData.priority_id as number,
        priority: mockPriorities.find(p => p.id === editData.priority_id),
      };
      setTicket(updatedTicket);
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
      tag_ids: tags.map(t => t.id),
    });
    setEditMode(false);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return;
    
    setSaving(true);
    
    setTimeout(() => {
      const newComment: Comment = {
        id: comments.length + 1,
        content: comment,
        is_internal: false, // Agents can only add external comments
        created_at: new Date().toISOString(),
        ticket_id: ticket.id,
        author_id: currentAgent?.id || 1,
        author: mockUsers.find(u => u.id === currentAgent?.id) || mockUsers[0],
      };
      
      setComments(prev => [...prev, newComment]);
      setComment('');
      setSaving(false);
    }, 300);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    
    setTimeout(() => {
      const newAttachments: Attachment[] = files.map((file, index) => {
        const type: 'image' | 'audio' | 'video' | 'file' = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('audio/') ? 'audio' : 
                         file.type.startsWith('video/') ? 'video' : 'file';
        const url = URL.createObjectURL(file);
        return {
          id: attachments.length + index + 1,
          original_filename: file.name,
          stored_filename: url,
          mime_type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          ticket_id: ticketId!,
          uploaded_by_id: currentAgent?.id || 1,
          uploaded_by: mockUsers.find(u => u.id === currentAgent?.id) || mockUsers[0],
        };
      });
      
      setAttachments(prev => [...prev, ...newAttachments]);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 500);
  };

  const handleRemoveAttachment = (idToRemove: number) => {
    setAttachments(prev => prev.filter(att => att.id !== idToRemove));
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

  if (loading || !currentAgent) {
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
                className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                onClick={handleSaveChanges}
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
              className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                      {mockPriorities.map((p) => (
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
                    {mockTags.map((tag) => (
                      <label
                        key={tag.id}
                        className={`px-3 py-1.5 rounded-sm text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          editData.tag_ids.includes(tag.id)
                            ? 'text-white border border-primary-500'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={editData.tag_ids.includes(tag.id) ? { backgroundColor: '#0f36a5', borderColor: '#0f36a5' } : undefined}
                      >
                        <input
                          type="checkbox"
                          checked={editData.tag_ids.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          disabled={saving}
                          className="sr-only"
                        />
                        {editData.tag_ids.includes(tag.id) && <Icon icon={faCheck} size="xs" />}
                        {tag.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
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
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
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
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex-shrink-0 z-10 flex items-center justify-center">
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

