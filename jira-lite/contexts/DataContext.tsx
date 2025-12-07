import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Issue, Project, User, Team, TeamDetail, Notification, 
  Subtask, Comment, Status, Priority 
} from '../types';
import { 
  authApi, teamsApi, projectsApi, issuesApi, commentsApi, notificationsApi 
} from '../services/api';

interface DataContextType {
  // Data
  issues: Issue[];
  projects: Project[];
  users: User[];
  teams: Team[];
  currentUser: User | null;
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  
  // Issue actions
  addIssue: (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'position' | 'labels' | 'subtasks'>) => Promise<Issue | null>;
  updateIssue: (issue: Issue) => Promise<void>;
  updateIssueStatus: (issueId: number, status: string) => Promise<void>;
  deleteIssue: (id: number) => Promise<void>;
  
  // Comment actions
  addComment: (issueId: number, content: string) => Promise<void>;
  
  // Subtask actions
  addSubtask: (issueId: number, title: string) => Promise<void>;
  toggleSubtask: (issueId: number, subtaskId: number) => Promise<void>;
  
  // Notification actions
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  // Data fetching
  fetchProjects: (teamId?: number) => Promise<void>;
  fetchIssues: (projectId?: number) => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchTeamDetail: (teamId: number) => Promise<TeamDetail | null>;
  
  // Team actions
  createTeam: (name: string) => Promise<Team | null>;
  
  // Project actions
  createProject: (data: { name: string; description?: string; team_id: number }) => Promise<Project | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!currentUser;

  // Initialize: check if user is logged in
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authApi.getMe();
          setCurrentUser(response.data as User);
        } catch (error) {
          localStorage.removeItem('access_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Fetch teams when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // ============ FETCH FUNCTIONS ============
  const fetchTeams = useCallback(async () => {
    try {
      const response = await teamsApi.list();
      setTeams(response.data as Team[]);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  }, []);

  const fetchProjects = useCallback(async (teamId?: number) => {
    try {
      const response = await projectsApi.list(teamId);
      setProjects(response.data as Project[]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  }, []);

  const fetchIssues = useCallback(async (projectId?: number) => {
    try {
      const response = await issuesApi.list(projectId ? { project_id: projectId } : undefined);
      setIssues(response.data as Issue[]);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.list();
      setNotifications(response.data as Notification[]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchTeamDetail = useCallback(async (teamId: number): Promise<TeamDetail | null> => {
    try {
      const response = await teamsApi.get(teamId);
      return response.data as TeamDetail;
    } catch (error) {
      console.error('Failed to fetch team detail:', error);
      return null;
    }
  }, []);

  // ============ ISSUE ACTIONS ============
  const addIssue = async (issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'position' | 'labels' | 'subtasks'>): Promise<Issue | null> => {
    try {
      const response = await issuesApi.create({
        title: issueData.title,
        description: issueData.description,
        project_id: issueData.project_id,
        assignee_id: issueData.assignee_id,
        due_date: issueData.due_date,
        priority: issueData.priority as string,
      });
      const newIssue = response.data as Issue;
      setIssues((prev) => [...prev, newIssue]);
      return newIssue;
    } catch (error) {
      console.error('Failed to create issue:', error);
      return null;
    }
  };

  const updateIssue = async (updatedIssue: Issue) => {
    try {
      await issuesApi.update(updatedIssue.id, {
        title: updatedIssue.title,
        description: updatedIssue.description,
        assignee_id: updatedIssue.assignee_id,
        due_date: updatedIssue.due_date,
        status: updatedIssue.status as string,
        priority: updatedIssue.priority,
      });
      setIssues((prev) => prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
    } catch (error) {
      console.error('Failed to update issue:', error);
    }
  };

  const updateIssueStatus = async (issueId: number, status: string) => {
    try {
      await issuesApi.updateStatus(issueId, status);
      setIssues((prev) => prev.map((i) => 
        i.id === issueId ? { ...i, status: status as Status } : i
      ));
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const deleteIssue = async (id: number) => {
    try {
      await issuesApi.delete(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  // ============ COMMENT ACTIONS ============
  const addComment = async (issueId: number, content: string) => {
    try {
      await commentsApi.create({ issue_id: issueId, content });
      // Refresh issues to get updated comments
      await fetchIssues();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // ============ SUBTASK ACTIONS ============
  const addSubtask = async (issueId: number, title: string) => {
    try {
      const response = await issuesApi.createSubtask(issueId, title);
      const newSubtask = response.data as Subtask;
      setIssues(prev => prev.map(i => {
        if (i.id === issueId) {
          return { ...i, subtasks: [...i.subtasks, newSubtask] };
        }
        return i;
      }));
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const toggleSubtask = async (issueId: number, subtaskId: number) => {
    try {
      const issue = issues.find(i => i.id === issueId);
      const subtask = issue?.subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        await issuesApi.updateSubtask(issueId, subtaskId, { is_completed: !subtask.is_completed });
        setIssues(prev => prev.map(i => {
          if (i.id === issueId) {
            return { 
              ...i, 
              subtasks: i.subtasks.map(st => 
                st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
              ) 
            };
          }
          return i;
        }));
      }
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  // ============ NOTIFICATION ACTIONS ============
  const markNotificationRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  // ============ TEAM ACTIONS ============
  const createTeam = async (name: string): Promise<Team | null> => {
    try {
      const response = await teamsApi.create({ name });
      const newTeam = response.data as Team;
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      return null;
    }
  };

  // ============ PROJECT ACTIONS ============
  const createProject = async (data: { name: string; description?: string; team_id: number }): Promise<Project | null> => {
    try {
      const response = await projectsApi.create(data);
      const newProject = response.data as Project;
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{ 
      issues, projects, users, teams, currentUser, notifications, isLoading, isAuthenticated,
      setCurrentUser,
      addIssue, updateIssue, updateIssueStatus, deleteIssue, 
      addComment, addSubtask, toggleSubtask,
      markNotificationRead, markAllNotificationsRead,
      fetchProjects, fetchIssues, fetchTeams, fetchNotifications, fetchTeamDetail,
      createTeam, createProject
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};