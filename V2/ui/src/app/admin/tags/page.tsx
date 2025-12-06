'use client';

import { useState, useEffect } from 'react';
import { CategoriesAPI, PrioritiesAPI } from '@/lib/api';
import { Category, TicketPriority } from '@/types';
import Icon, { faEdit, faTrash, faCheck, faTimes, faPlus } from '@/app/components/Icon';
import { TableSkeleton, Skeleton } from '@/app/components/Skeleton';
import { useToast } from '@/app/components/Toaster';

type TabType = 'tags' | 'priorities';

export default function AdminTagsPage() {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('tags');
  const [tags, setTags] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tags state
  const [tagName, setTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  
  // Priorities state
  const [priorityName, setPriorityName] = useState('');
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [editingPriorityName, setEditingPriorityName] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, prioritiesData] = await Promise.all([
          CategoriesAPI.list(),
          PrioritiesAPI.list(),
        ]);
        
        setTags(categoriesData || []);
        setPriorities(prioritiesData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        show('Failed to load categories and priorities', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [show]);

  // Tags handlers
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    
    try {
      const newTag = await CategoriesAPI.create({ name: tagName.trim() });
      setTags(prev => [...prev, newTag]);
      setTagName('');
      show('Category created successfully', 'success');
    } catch (error) {
      console.error('Failed to create category:', error);
      show('Failed to create category', 'error');
    }
  };

  const handleEditTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setEditingTagId(tagId);
      setEditingTagName(tag.name);
    }
  };

  const handleSaveTag = async (tagId: string) => {
    if (!editingTagName.trim()) return;
    
    try {
      const updatedTag = await CategoriesAPI.update(tagId, { name: editingTagName.trim() });
      setTags(prev => prev.map(t => 
        t.id === tagId ? updatedTag : t
      ));
      setEditingTagId(null);
      setEditingTagName('');
      show('Category updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update category:', error);
      show('Failed to update category', 'error');
    }
  };

  const handleCancelTagEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await CategoriesAPI.delete(tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));
      show('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete category:', error);
      show('Failed to delete category', 'error');
    }
  };

  // Priorities handlers
  const handleCreatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityName.trim()) return;
    
    try {
      const newPriority = await PrioritiesAPI.create({ 
        name: priorityName.trim(),
        sort_order: 0,
      });
      setPriorities(prev => [...prev, newPriority]);
      setPriorityName('');
      show('Priority created successfully', 'success');
    } catch (error) {
      console.error('Failed to create priority:', error);
      show('Failed to create priority', 'error');
    }
  };

  const handleEditPriority = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    if (priority) {
      setEditingPriorityId(priorityId);
      setEditingPriorityName(priority.name);
    }
  };

  const handleSavePriority = async (priorityId: string) => {
    if (!editingPriorityName.trim()) return;
    
    try {
      const priority = priorities.find(p => p.id === priorityId);
      const updatedPriority = await PrioritiesAPI.update(priorityId, { 
        name: editingPriorityName.trim(),
        sort_order: priority?.sort_order || 0,
      });
      setPriorities(prev => prev.map(p => 
        p.id === priorityId ? updatedPriority : p
      ));
      setEditingPriorityId(null);
      setEditingPriorityName('');
      show('Priority updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update priority:', error);
      show('Failed to update priority', 'error');
    }
  };

  const handleCancelPriorityEdit = () => {
    setEditingPriorityId(null);
    setEditingPriorityName('');
  };

  const handleDeletePriority = async (priorityId: string) => {
    if (!confirm('Are you sure you want to delete this priority?')) return;
    
    try {
      await PrioritiesAPI.delete(priorityId);
      setPriorities(prev => prev.filter(p => p.id !== priorityId));
      show('Priority deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete priority:', error);
      show('Failed to delete priority', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <TableSkeleton rows={5} cols={2} showHeader={false} />
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <TableSkeleton rows={5} cols={2} showHeader={false} />
          </div>
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
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
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
                          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
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
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
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
                          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
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

