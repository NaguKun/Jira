import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Status } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, issues, projects, isLoading, isAuthenticated, fetchProjects, fetchIssues, toggleFavorite } = useData();
  const [dataLoaded, setDataLoaded] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch data on mount - always fetch to ensure fresh data
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchProjects(), fetchIssues()]).then(() => {
        setDataLoaded(true);
      });
    }
  }, [isAuthenticated, fetchProjects, fetchIssues]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const myIssues = issues.filter(i => i.assignee_id === currentUser.id);
  const dueSoon = myIssues.filter(i => i.status !== Status.DONE).length;
  const done = myIssues.filter(i => i.status === Status.DONE).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name}!</h1>
        <p className="text-slate-500">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Assigned to Me</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{myIssues.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Pending</p>
          <p className="text-3xl font-bold text-warning mt-2">{dueSoon}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Completed</p>
          <p className="text-3xl font-bold text-success mt-2">{done}</p>
        </div>
         <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-lg shadow-md text-white">
          <p className="text-sm font-medium opacity-80 uppercase">Active Projects</p>
          <p className="text-3xl font-bold mt-2">{projects.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Issues */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Assigned to Me</h2>
            {projects.length > 0 && (
              <Link to={`/projects/${projects[0]?.id}`} className="text-sm text-primary font-medium hover:underline">View All</Link>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Summary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {myIssues.slice(0, 5).map(issue => (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{issue.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{issue.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${issue.status === Status.DONE ? 'bg-green-100 text-green-800' : 
                          issue.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {String(issue.status).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {issue.priority === 'HIGH' ? <span className="text-danger">↑ High</span> : 
                       issue.priority === 'LOW' ? <span className="text-success">↓ Low</span> : 
                       <span className="text-warning">= Medium</span>}
                    </td>
                  </tr>
                ))}
                {myIssues.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No issues assigned to you yet. Great job!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">My Projects</h2>
          <div className="space-y-4">
            {[...projects]
              .sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
              .filter(p => !p.is_archived)
              .map(project => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-primary transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <Link to={`/projects/${project.id}`} className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded bg-blue-100 text-primary flex items-center justify-center font-bold">
                      {project.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{project.name}</h3>
                    </div>
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(project.id, project.is_favorite || false);
                    }}
                    className={`p-1.5 rounded-md transition-colors ${
                      project.is_favorite 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-slate-300 hover:text-yellow-500'
                    }`}
                    title={project.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-5 h-5" fill={project.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <Link to={`/projects/${project.id}`}>
                  <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                </Link>
              </div>
            ))}
            {projects.filter(p => !p.is_archived).length === 0 && (
              <div className="text-center text-slate-500 py-8">
                No projects yet. Create a team first, then add projects.
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
             <h3 className="text-indigo-900 font-bold mb-2">✨ AI Tip</h3>
             <p className="text-sm text-indigo-800">
               Use the "Generate with AI" button in the issue creator to automatically expand brief titles into full technical specs.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
