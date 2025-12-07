import React, { useState, useEffect } from 'react';
import { Issue, Status, Priority } from '../types';
import { useData } from '../contexts/DataContext';
import { commentsApi } from '../services/api';

interface IssueModalProps {
  issueId?: number;
  projectId?: number;
  onClose: () => void;
}

interface Comment {
  id: number;
  author_id: number;
  author_name?: string;
  content: string;
  created_at: string;
}

export const IssueModal: React.FC<IssueModalProps> = ({ issueId, projectId, onClose }) => {
  const { issues, addIssue, updateIssue, deleteIssue, addComment, currentUser, addSubtask, toggleSubtask } = useData();
  const [formData, setFormData] = useState<Partial<Issue>>({
    title: '',
    description: '',
    status: Status.BACKLOG,
    priority: Priority.MEDIUM,
    labels: [],
    project_id: projectId || 0,
    subtasks: []
  });
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!issueId;
  const currentIssue = issues.find(i => i.id === issueId);

  useEffect(() => {
    if (currentIssue) {
      setFormData(currentIssue);
      // Load comments
      loadComments();
    }
  }, [currentIssue]);

  const loadComments = async () => {
    if (issueId) {
      try {
        const response = await commentsApi.list(issueId);
        setComments(response.data as Comment[]);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  };

  const handleChange = (field: keyof Issue, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.project_id) return;
    setIsLoading(true);

    try {
      if (isEditing && currentIssue) {
        await updateIssue({ ...currentIssue, ...formData } as Issue);
      } else {
        await addIssue({
          title: formData.title,
          description: formData.description,
          status: formData.status || Status.BACKLOG,
          priority: formData.priority || Priority.MEDIUM,
          project_id: formData.project_id,
          creator_id: currentUser?.id || 0,
          assignee_id: formData.assignee_id,
          due_date: formData.due_date,
        } as any);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save issue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isEditing && issueId) {
      await deleteIssue(issueId);
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && issueId) {
      await addComment(issueId, newComment);
      setNewComment('');
      loadComments();
    }
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim() && issueId) {
      await addSubtask(issueId, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
             <span className="text-sm font-mono text-slate-500">{isEditing ? `#${formData.id}` : 'New Issue'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Column */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200">
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Issue summary"
              className="w-full text-2xl font-bold border-none focus:ring-0 placeholder:text-slate-300 mb-4 bg-transparent px-0"
            />

            <div className="mb-6 group relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-slate-50"
                placeholder="Add a detailed description..."
              />
            </div>

            {/* Subtasks */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex justify-between items-center">
                Subtasks
                <span className="text-xs font-normal text-slate-500">
                   {(formData.subtasks || []).filter(s => s.is_completed).length}/{(formData.subtasks || []).length}
                </span>
              </h3>
              <div className="space-y-2 mb-3">
                {(formData.subtasks || []).map(subtask => (
                  <div key={subtask.id} className="flex items-center group">
                     <input 
                       type="checkbox" 
                       checked={subtask.is_completed}
                       onChange={() => isEditing && issueId ? toggleSubtask(issueId, subtask.id) : null}
                       className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                       disabled={!isEditing}
                     />
                     <span className={`ml-3 text-sm ${subtask.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                       {subtask.title}
                     </span>
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={newSubtaskTitle}
                     onChange={(e) => setNewSubtaskTitle(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                     placeholder="Add subtask..."
                     className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary text-sm py-1.5"
                   />
                   <button onClick={handleAddSubtask} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-sm hover:bg-slate-200">Add</button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Activity</h3>
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-1">
                         {comment.author_name?.[0] || '?'}
                       </div>
                       <div className="flex-1">
                         <div className="bg-slate-100 p-3 rounded-md">
                           <span className="text-xs font-bold text-slate-700 block mb-1">
                             {comment.author_name || 'Unknown'}
                           </span>
                           <p className="text-sm text-slate-700">{comment.content}</p>
                         </div>
                         <span className="text-xs text-slate-400 ml-1">
                           {new Date(comment.created_at).toLocaleDateString()}
                         </span>
                       </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {currentUser?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <p className="text-xs text-slate-400 mt-1">Press Enter to post</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="w-full md:w-80 bg-slate-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white"
                >
                  {Object.values(Status).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white"
                >
                  {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                <input 
                  type="date" 
                  value={formData.due_date ? formData.due_date.split('T')[0] : ''}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white"
                />
              </div>
              
              <div className="border-t border-slate-200 pt-6 mt-6">
                <div className="text-xs text-slate-500 space-y-2">
                  <p>Created {formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'Now'}</p>
                  {formData.creator_name && <p>By {formData.creator_name}</p>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          {isEditing ? (
             <button onClick={handleDelete} className="text-danger hover:text-red-800 text-sm font-medium">Delete Issue</button>
          ) : <div></div>}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};