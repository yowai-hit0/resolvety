'use client';

import { useState, useEffect } from 'react';
import { mockTags, mockPriorities } from '@/lib/mockData';
import { Tag, TicketPriority } from '@/types';
import Icon, { faEdit, faTrash, faCheck, faTimes, faPlus } from '@/app/components/Icon';

type TabType = 'tags' | 'priorities';

export default function AdminTagsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tags');
  const [tags, setTags] = useState<Tag[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tags state
  const [tagName, setTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  
  // Priorities state
  const [priorityName, setPriorityName] = useState('');
  const [editingPriorityId, setEditingPriorityId] = useState<number | null>(null);
  const [editingPriorityName, setEditingPriorityName] = useState('');

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setTags([...mockTags]);
      setPriorities([...mockPriorities]);
      setLoading(false);
    }, 300);
  }, []);

  // Tags handlers
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    
    const newTag: Tag = {
      id: Math.max(...tags.map(t => t.id), 0) + 1,
      name: tagName.trim(),
    };
    
    setTags(prev => [...prev, newTag]);
    setTagName('');
  };

  const handleEditTag = (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setEditingTagId(tagId);
      setEditingTagName(tag.name);
    }
  };

  const handleSaveTag = (tagId: number) => {
    if (!editingTagName.trim()) return;
    
    setTags(prev => prev.map(t => 
      t.id === tagId ? { ...t, name: editingTagName.trim() } : t
    ));
    setEditingTagId(null);
    setEditingTagName('');
  };

  const handleCancelTagEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
  };

  const handleDeleteTag = (tagId: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(prev => prev.filter(t => t.id !== tagId));
    }
  };

  // Priorities handlers
  const handleCreatePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityName.trim()) return;
    
    const newPriority: TicketPriority = {
      id: Math.max(...priorities.map(p => p.id), 0) + 1,
      name: priorityName.trim(),
    };
    
    setPriorities(prev => [...prev, newPriority]);
    setPriorityName('');
  };

  const handleEditPriority = (priorityId: number) => {
    const priority = priorities.find(p => p.id === priorityId);
    if (priority) {
      setEditingPriorityId(priorityId);
      setEditingPriorityName(priority.name);
    }
  };

  const handleSavePriority = (priorityId: number) => {
    if (!editingPriorityName.trim()) return;
    
    setPriorities(prev => prev.map(p => 
      p.id === priorityId ? { ...p, name: editingPriorityName.trim() } : p
    ));
    setEditingPriorityId(null);
    setEditingPriorityName('');
  };

  const handleCancelPriorityEdit = () => {
    setEditingPriorityId(null);
    setEditingPriorityName('');
  };

  const handleDeletePriority = (priorityId: number) => {
    if (confirm('Are you sure you want to delete this priority?')) {
      setPriorities(prev => prev.filter(p => p.id !== priorityId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories & Priorities</h1>
        <p className="text-sm text-gray-600 mt-1">Manage ticket categories and priority levels</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'tags'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={activeTab === 'tags' ? { borderColor: '#0f36a5', color: '#0f36a5' } : undefined}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'priorities'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={activeTab === 'priorities' ? { borderColor: '#0f36a5', color: '#0f36a5' } : undefined}
          >
            Priorities
          </button>
        </div>
      </div>

      {/* Categories Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Create Tag Form */}
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <form onSubmit={handleCreateTag} className="flex gap-2">
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="New category name"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!tagName.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: '#0f36a5' }}
              >
                <Icon icon={faPlus} size="sm" />
                Add Category
              </button>
            </form>
          </div>

          {/* Tags List */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {tags.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No categories created yet
                </div>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="p-4 flex items-center gap-3">
                    {editingTagId === tag.id ? (
                      <>
                        <input
                          type="text"
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTag(tag.id)}
                          disabled={!editingTagName.trim()}
                          className="px-3 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                          style={{ backgroundColor: '#0f36a5' }}
                        >
                          <Icon icon={faCheck} size="sm" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelTagEdit}
                          className="px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faTimes} size="sm" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-gray-900">{tag.name}</span>
                        <button
                          onClick={() => handleEditTag(tag.id)}
                          className="px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faEdit} size="sm" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="px-3 py-2 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 text-sm text-red-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faTrash} size="sm" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Priorities Tab */}
      {activeTab === 'priorities' && (
        <div className="space-y-6">
          {/* Create Priority Form */}
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <form onSubmit={handleCreatePriority} className="flex gap-2">
              <input
                type="text"
                value={priorityName}
                onChange={(e) => setPriorityName(e.target.value)}
                placeholder="New priority name"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!priorityName.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: '#0f36a5' }}
              >
                <Icon icon={faPlus} size="sm" />
                Add Priority
              </button>
            </form>
          </div>

          {/* Priorities List */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Priorities</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {priorities.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No priorities created yet
                </div>
              ) : (
                priorities.map((priority) => (
                  <div key={priority.id} className="p-4 flex items-center gap-3">
                    {editingPriorityId === priority.id ? (
                      <>
                        <input
                          type="text"
                          value={editingPriorityName}
                          onChange={(e) => setEditingPriorityName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePriority(priority.id)}
                          disabled={!editingPriorityName.trim()}
                          className="px-3 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                          style={{ backgroundColor: '#0f36a5' }}
                        >
                          <Icon icon={faCheck} size="sm" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelPriorityEdit}
                          className="px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faTimes} size="sm" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-gray-900">{priority.name}</span>
                        <button
                          onClick={() => handleEditPriority(priority.id)}
                          className="px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faEdit} size="sm" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePriority(priority.id)}
                          className="px-3 py-2 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 text-sm text-red-700 transition-colors flex items-center gap-2"
                        >
                          <Icon icon={faTrash} size="sm" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

