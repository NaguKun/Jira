import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { COLUMN_CONFIG } from '../constants';
import { IssueModal } from '../components/IssueModal';
import { Status, Issue, Priority } from '../types';

export const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, issues, updateIssueStatus, isLoading, isAuthenticated, fetchIssues, fetchProjects } = useData();
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST' | 'DASHBOARD'>('BOARD');
  const [dataLoaded, setDataLoaded] = useState(false);

  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && numericProjectId && !dataLoaded) {
      Promise.all([
        fetchProjects(),
        fetchIssues(numericProjectId)
      ]).then(() => setDataLoaded(true));
    }
  }, [isAuthenticated, numericProjectId, dataLoaded, fetchProjects, fetchIssues]);

  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const project = projects.find(p => p.id === numericProjectId);
  
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  const projectIssues = issues.filter(i => {
     const matchesProject = i.project_id === numericProjectId;
     const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || String(i.id).includes(search);
     const matchesUser = filterUser === 'all' || i.assignee_id === filterUser;
     const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
     const matchesPriority = filterPriority === 'all' || i.priority === filterPriority;
     return matchesProject && matchesSearch && matchesUser && matchesStatus && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent, issueId: number) => {
    e.dataTransfer.setData('issueId', String(issueId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const issueId = parseInt(e.dataTransfer.getData('issueId'), 10);
    const issue = issues.find(i => i.id === issueId);
    if (issue && issue.status !== status) {
      await updateIssueStatus(issueId, status);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Projects</span>
              <span>/</span>
              <span>{project.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm"
            >
              Create Issue
            </button>
          </div>
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            <button 
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'BOARD' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Board
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('DASHBOARD')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'DASHBOARD' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dashboard
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
             <input 
               type="text" 
               placeholder="Search issues..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm w-full md:w-40 focus:ring-1 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value={Status.BACKLOG}>Backlog</option>
              <option value={Status.IN_PROGRESS}>In Progress</option>
              <option value={Status.REVIEW}>Review</option>
              <option value={Status.DONE}>Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Priority</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.LOW}>Low</option>
            </select>
            <button 
              onClick={() => { setFilterUser('all'); setFilterStatus('all'); setFilterPriority('all'); setSearch(''); }}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: BOARD */}
      {viewMode === 'BOARD' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="h-full flex gap-6 min-w-[1000px]">
            {COLUMN_CONFIG.map(col => {
               const colIssues = projectIssues.filter(i => i.status === col.id);
               return (
                 <div 
                   key={col.id} 
                   className="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg max-h-full border border-slate-200"
                   onDragOver={handleDragOver}
                   onDrop={(e) => handleDrop(e, col.id)}
                 >
                   {/* Column Header */}
                   <div className={`p-3 border-t-4 ${col.color} rounded-t-lg bg-slate-100 flex justify-between items-center`}>
                     <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{col.title}</h3>
                     <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                       {colIssues.length}
                     </span>
                   </div>

                   {/* Column Content */}
                   <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                     {colIssues.map(issue => (
                       <div 
                         key={issue.id}
                         draggable
                         onDragStart={(e) => handleDragStart(e, issue.id)}
                         onClick={() => setSelectedIssueId(issue.id)}
                         className="bg-white p-3 rounded-md shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all group"
                       >
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-slate-500 font-mono group-hover:text-primary">#{issue.id}</span>
                           {issue.priority === Priority.HIGH && <span className="w-2 h-2 rounded-full bg-danger ring-2 ring-red-100" title="High Priority" />}
                           {issue.priority === Priority.MEDIUM && <span className="w-2 h-2 rounded-full bg-warning ring-2 ring-yellow-100" title="Medium Priority" />}
                           {issue.priority === Priority.LOW && <span className="w-2 h-2 rounded-full bg-success ring-2 ring-green-100" title="Low Priority" />}
                         </div>
                         <p className="text-sm font-medium text-slate-800 mb-3 line-clamp-2">{issue.title}</p>
                         <div className="flex justify-between items-center">
                           <div className="flex gap-1 flex-wrap">
                             {(issue.subtasks && issue.subtasks.length > 0) && (
                               <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                 {issue.subtasks.filter(s => s.is_completed).length}/{issue.subtasks.length}
                               </div>
                             )}
                           </div>
                           {issue.assignee_name && (
                             <div 
                               className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm"
                               title={issue.assignee_name}
                             >
                               {issue.assignee_name[0]}
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* VIEW: LIST */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {projectIssues.map(issue => (
                <tr 
                  key={issue.id} 
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">#{issue.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{issue.description?.substring(0, 60)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${issue.status === Status.DONE ? 'bg-green-100 text-green-800' : 
                        issue.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {String(issue.status).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {issue.priority === Priority.HIGH ? <span className="text-danger font-medium">High</span> : 
                     issue.priority === Priority.MEDIUM ? <span className="text-warning">Medium</span> : 
                     <span className="text-success">Low</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {issue.assignee_name ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {issue.assignee_name[0]}
                          </div>
                          <span className="ml-2 text-sm text-slate-600">{issue.assignee_name}</span>
                        </>
                      ) : <span className="text-sm text-slate-400">Unassigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: DASHBOARD */}
      {viewMode === 'DASHBOARD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Status Distribution</h3>
              <div className="space-y-4">
                 {COLUMN_CONFIG.map(col => {
                   const count = projectIssues.filter(i => i.status === col.id).length;
                   const percentage = (count / projectIssues.length) * 100 || 0;
                   return (
                     <div key={col.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{col.title}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                           <div className={`h-2 rounded-full ${col.id === Status.DONE ? 'bg-success' : 'bg-primary'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                     </div>
                   )
                 })}
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Project Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-800">{projectIssues.length}</p>
                    <p className="text-xs text-slate-500 uppercase">Total Issues</p>
                 </div>
                 <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-success">{projectIssues.filter(i => i.status === Status.DONE).length}</p>
                    <p className="text-xs text-green-700 uppercase">Completed</p>
                 </div>
                 <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-danger">{projectIssues.filter(i => i.priority === Priority.HIGH).length}</p>
                    <p className="text-xs text-red-700 uppercase">High Priority</p>
                 </div>
                 <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round((projectIssues.filter(i => i.status === Status.DONE).length / projectIssues.length) * 100) || 0}%</p>
                    <p className="text-xs text-blue-700 uppercase">Completion Rate</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {(selectedIssueId || isCreateModalOpen) && (
        <IssueModal 
          issueId={selectedIssueId || undefined} 
          projectId={numericProjectId}
          onClose={() => {
            setSelectedIssueId(null);
            setIsCreateModalOpen(false);
            // Refresh issues
            if (numericProjectId) {
              fetchIssues(numericProjectId);
            }
          }} 
        />
      )}
    </div>
  );
};