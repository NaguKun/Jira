import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { TeamDetail } from '../types';

export const Teams: React.FC = () => {
  const navigate = useNavigate();
  const { teams, projects, currentUser, isLoading, isAuthenticated, fetchTeams, createTeam, fetchTeamDetail } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [teamDetails, setTeamDetails] = useState<Record<number, TeamDetail>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch team details to get member info
  useEffect(() => {
    const loadTeamDetails = async () => {
      for (const team of teams) {
        if (!teamDetails[team.id]) {
          const detail = await fetchTeamDetail(team.id);
          if (detail) {
            setTeamDetails(prev => ({ ...prev, [team.id]: detail }));
          }
        }
      }
    };
    if (teams.length > 0) {
      loadTeamDetails();
    }
  }, [teams, fetchTeamDetail]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreating(true);
    const team = await createTeam(newTeamName.trim());
    setIsCreating(false);
    
    if (team) {
      setShowCreateModal(false);
      setNewTeamName('');
      fetchTeams();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
           <p className="text-slate-500">Manage your teams and members.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-blue-700"
        >
           + Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => {
           const teamProjects = projects.filter(p => p.team_id === team.id);
           const detail = teamDetails[team.id];
           const myRole = detail?.members.find(m => m.user_id === currentUser?.id)?.role;
           const memberCount = detail?.members.length || 0;
           
           return (
             <div key={team.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                     {team.name[0]}
                   </div>
                   {myRole && (
                     <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                        myRole === 'OWNER' ? 'bg-purple-100 text-purple-700' : 
                        myRole === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                     }`}>
                       {myRole}
                     </span>
                   )}
                 </div>
                 
                 <h2 className="text-xl font-bold text-slate-900 mb-2">{team.name}</h2>
                 <p className="text-sm text-slate-500 mb-6 min-h-[40px]">Team workspace</p>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="text-center">
                     <p className="text-lg font-bold text-slate-800">{memberCount}</p>
                     <p className="text-xs text-slate-400 uppercase">Members</p>
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-bold text-slate-800">{teamProjects.length}</p>
                     <p className="text-xs text-slate-400 uppercase">Projects</p>
                   </div>
                   <Link 
                     to={`/teams/${team.id}`} 
                     className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-blue-50 rounded-md transition-colors"
                   >
                     View Details →
                   </Link>
                 </div>
               </div>
               <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center">
                  <div className="flex -space-x-2">
                    {detail?.members.slice(0, 5).map(m => (
                       <div 
                         key={m.user_id}
                         className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                         title={m.user_name}
                       >
                         {m.user_name?.[0] || '?'}
                       </div>
                    ))}
                    {memberCount > 5 && (
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                         +{memberCount - 5}
                       </div>
                    )}
                  </div>
               </div>
             </div>
           );
        })}

        {/* Create Team Card Placeholder */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group h-full min-h-[280px]"
        >
           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary mb-4 transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
           </div>
           <span className="text-slate-500 font-medium group-hover:text-primary">Create New Team</span>
        </button>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Team</h2>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={isCreating || !newTeamName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};