import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      active ? 'bg-blue-100 text-primary font-medium' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, teams, projects, notifications } = useData();
  const location = useLocation();
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({ 't1': true, 't2': true });

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleTeam = (teamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800">Jira Lite</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            to="/dashboard" 
            active={location.pathname === '/dashboard'}
            label="Dashboard" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            } 
          />
          <SidebarItem 
            to="/teams" 
            active={location.pathname === '/teams'}
            label="Teams" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
          />
          
          <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            MY TEAMS
          </div>
          
          {teams.map(team => (
            <div key={team.id} className="mb-2">
              <div 
                className="flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                onClick={(e) => toggleTeam(team.id, e)}
              >
                <span>{team.name}</span>
                <svg className={`w-4 h-4 transition-transform ${expandedTeams[team.id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              {expandedTeams[team.id] && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 mt-1 space-y-1">
                  {projects.filter(p => p.teamId === team.id).map(p => (
                    <Link 
                      key={p.id}
                      to={`/projects/${p.id}`} 
                      className={`block px-3 py-1.5 text-sm rounded-md truncate transition-colors ${
                        location.pathname === `/projects/${p.id}` 
                          ? 'text-primary bg-blue-50 font-medium' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {p.name}
                    </Link>
                  ))}
                  <Link to={`/teams/${team.id}`} className="block px-3 py-1.5 text-xs text-slate-400 hover:text-primary mt-1">
                    + View Team Details
                  </Link>
                </div>
              )}
            </div>
          ))}

          <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-md text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors">
            <span>+ Create Team</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md transition-colors">
            <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-slate-200 flex items-center justify-between px-6">
          {/* Mobile Menu Button (Hidden on Desktop) */}
          <button className="md:hidden p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative w-64 hidden sm:block">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
             <Link to="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
               {unreadCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white animate-pulse"></span>
               )}
             </Link>
             <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-primary">
                Logout
             </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};