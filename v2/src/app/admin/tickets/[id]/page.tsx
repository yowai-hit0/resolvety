'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities, mockTags } from '@/lib/mockData';
import { Ticket, TicketStatus, Comment, Tag } from '@/types';
import Icon, { faArrowLeft, faEdit, faCheck, faTimes, faLock } from '@/app/components/Icon';

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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id ? parseInt(params.id as string) : null;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  
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
        setTags(generateMockTags(ticketId));
        setEditData({
          status: foundTicket.status,
          priority_id: foundTicket.priority_id,
          assignee_id: foundTicket.assignee_id || '',
          tag_ids: generateMockTags(ticketId).map(t => t.id),
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
        </div>
      </div>
    </div>
  );
}

