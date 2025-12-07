import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { TeamDetail as TeamDetailType } from '../types';

export const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, projects, fetchTeamDetail, fetchProjects, createProject, isLoading, isAuthenticated } = useData();
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'MEMBERS' | 'SETTINGS'>('PROJECTS');
  const [teamDetail, setTeamDetail] = useState<TeamDetailType | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const numericTeamId = teamId ? parseInt(teamId, 10) : undefined;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch team detail
  useEffect(() => {
    if (numericTeamId && isAuthenticated) {
      fetchTeamDetail(numericTeamId).then(detail => {
        setTeamDetail(detail);
      });
      fetchProjects(numericTeamId);
    }
  }, [numericTeamId, isAuthenticated, fetchTeamDetail, fetchProjects]);

  if (isLoading || !teamDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const team = teams.find(t => t.id === numericTeamId);
  const teamProjects = projects.filter(p => p.team_id === numericTeamId);

  if (!team) return <div>Team not found</div>;

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !numericTeamId) return;
    
    setIsCreating(true);
    await createProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      team_id: numericTeamId
    });
    setIsCreating(false);
    setShowCreateProject(false);
    setNewProjectName('');
    setNewProjectDesc('');
    fetchProjects(numericTeamId);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/teams" className="text-sm text-slate-500 hover:text-primary mb-2 inline-block">← Back to Teams</Link>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
             {team.name[0]}
          </div>
          {team.name}
        </h1>
        <p className="text-slate-500 mt-2 ml-14">Team workspace for collaboration</p>
      </div>

      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('PROJECTS')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PROJECTS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Projects
          </button>
          <button 
            onClick={() => setActiveTab('MEMBERS')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'MEMBERS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Members
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SETTINGS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamProjects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-primary transition-colors">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary">{project.name}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-2">{project.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                   <span className="text-xs text-slate-400">
                     Created {new Date(project.created_at).toLocaleDateString()}
                   </span>
                   <span className="text-xs font-medium text-primary">Open Board →</span>
                </div>
              </div>
            </Link>
          ))}
          <button 
            onClick={() => setShowCreateProject(true)}
            className="flex items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary hover:text-primary hover:bg-blue-50 transition-colors"
          >
            + Create New Project
          </button>
        </div>
      )}

      {activeTab === 'MEMBERS' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teamDetail.members.map(member => (
                <tr key={member.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                         {member.user_name?.[0] || '?'}
                       </div>
                       <div className="ml-3">
                         <div className="text-sm font-medium text-slate-900">{member.user_name}</div>
                         <div className="text-sm text-slate-500">{member.user_email}</div>
                       </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                     }`}>
                        {member.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button className="text-slate-400 hover:text-slate-600">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
             <button className="text-sm text-primary font-medium hover:underline">+ Invite Member</button>
          </div>
        </div>
      )}
      
      {activeTab === 'SETTINGS' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-2xl">
           <h3 className="text-lg font-medium text-slate-900 mb-4">Team Settings</h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Team Name</label>
                <input type="text" defaultValue={team.name} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div className="pt-4">
                 <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Save Changes</button>
              </div>
              
              <div className="border-t border-slate-200 pt-6 mt-6">
                 <h4 className="text-danger font-medium mb-2">Danger Zone</h4>
                 <button className="text-danger border border-danger px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50">Delete Team</button>
              </div>
           </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateProject(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};