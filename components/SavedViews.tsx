'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Trash2, Plus, Edit3, Check, X } from 'lucide-react';
import { FilterState } from './FiltersBar';

interface SavedView {
  id: string;
  name: string;
  description: string;
  filters: FilterState;
  createdAt: string;
  lastUsed: string;
}

interface SavedViewsProps {
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  isDarkMode: boolean;
}

export default function SavedViews({ currentFilters, onApplyFilters, isDarkMode }: SavedViewsProps) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');

  useEffect(() => {
    loadSavedViews();
  }, []);

  const loadSavedViews = () => {
    const saved = localStorage.getItem('ai-dashboard-saved-views');
    if (saved) {
      setSavedViews(JSON.parse(saved));
    }
  };

  const saveSavedViews = (views: SavedView[]) => {
    localStorage.setItem('ai-dashboard-saved-views', JSON.stringify(views));
    setSavedViews(views);
  };

  const createSavedView = () => {
    if (!newViewName.trim()) return;

    const newView: SavedView = {
      id: Date.now().toString(),
      name: newViewName.trim(),
      description: newViewDescription.trim(),
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    const updatedViews = [...savedViews, newView];
    saveSavedViews(updatedViews);
    
    setIsCreating(false);
    setNewViewName('');
    setNewViewDescription('');
  };

  const applyView = (view: SavedView) => {
    onApplyFilters(view.filters);
    
    // Update last used timestamp
    const updatedViews = savedViews.map(v => 
      v.id === view.id 
        ? { ...v, lastUsed: new Date().toISOString() }
        : v
    );
    saveSavedViews(updatedViews);
  };

  const deleteView = (id: string) => {
    const updatedViews = savedViews.filter(v => v.id !== id);
    saveSavedViews(updatedViews);
  };

  const updateView = (id: string, name: string, description: string) => {
    const updatedViews = savedViews.map(v => 
      v.id === id 
        ? { ...v, name: name.trim(), description: description.trim() }
        : v
    );
    saveSavedViews(updatedViews);
    setEditingId(null);
  };

  const getFilterSummary = (filters: FilterState) => {
    const parts = [];
    if (filters.sourceType) parts.push(`Source: ${filters.sourceType}`);
    if (filters.tags.length > 0) parts.push(`Tags: ${filters.tags.slice(0, 2).join(', ')}${filters.tags.length > 2 ? '...' : ''}`);
    if (filters.hideConsumed) parts.push('Hide consumed');
    if (filters.showBookmarked) parts.push('Show bookmarked');
    parts.push(`Sort: ${filters.sortBy}`);
    return parts.join(' • ');
  };

  const hasActiveFilters = () => {
    return currentFilters.sourceType !== '' || 
           currentFilters.tags.length > 0 || 
           currentFilters.hideConsumed || 
           currentFilters.showBookmarked ||
           currentFilters.sortBy !== 'score';
  };

  return (
    <div className={`rounded-xl border p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Saved Views
          </h2>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={!hasActiveFilters()}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
            hasActiveFilters()
              ? isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              : isDarkMode
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Save Current View
        </button>
      </div>

      {/* Create New View Form */}
      {isCreating && (
        <div className={`p-4 rounded-lg border mb-4 ${
          isDarkMode 
            ? 'bg-gray-700/50 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                View Name
              </label>
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="e.g., AI Research Papers"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description (optional)
              </label>
              <input
                type="text"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                placeholder="Brief description of this view"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div className={`text-xs p-2 rounded ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              Current filters: {getFilterSummary(currentFilters)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={createSavedView}
                disabled={!newViewName.trim()}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                  newViewName.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewViewName('');
                  setNewViewDescription('');
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Views List */}
      {savedViews.length === 0 ? (
        <div className={`text-center py-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No saved views yet</p>
          <p className="text-xs mt-1">Apply some filters and save your first view!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedViews
            .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
            .map((view) => (
              <div
                key={view.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {editingId === view.id ? (
                  <EditViewForm
                    view={view}
                    onSave={(name, description) => updateView(view.id, name, description)}
                    onCancel={() => setEditingId(null)}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {view.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {new Date(view.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                      {view.description && (
                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {view.description}
                        </p>
                      )}
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {getFilterSummary(view.filters)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => applyView(view)}
                        className={`p-1.5 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-blue-400 hover:bg-gray-600' 
                            : 'text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Apply this view"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(view.id)}
                        className={`p-1.5 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:bg-gray-600' 
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Edit view"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteView(view.id)}
                        className={`p-1.5 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-gray-600' 
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title="Delete view"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

interface EditViewFormProps {
  view: SavedView;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

function EditViewForm({ view, onSave, onCancel, isDarkMode }: EditViewFormProps) {
  const [name, setName] = useState(view.name);
  const [description, setDescription] = useState(view.description);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={`w-full px-3 py-2 rounded-lg border text-sm ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(name, description)}
          disabled={!name.trim()}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
            name.trim()
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <Check className="w-3 h-3" />
          Save
        </button>
        <button
          onClick={onCancel}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
            isDarkMode 
              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}
