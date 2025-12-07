import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { ProjectBoard } from './pages/ProjectBoard';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { Notifications } from './pages/Notifications';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          
          <Route path="/projects/:projectId" element={
            <Layout>
              <ProjectBoard />
            </Layout>
          } />

          <Route path="/teams" element={
             <Layout>
               <Teams />
             </Layout>
          } />

          <Route path="/teams/:teamId" element={
             <Layout>
               <TeamDetail />
             </Layout>
          } />

          <Route path="/notifications" element={
             <Layout>
               <Notifications />
             </Layout>
          } />

          <Route path="/profile" element={
             <Layout>
               <div className="p-10 text-center">
                 <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
                 <p className="text-slate-500 mt-2">Update your personal information here.</p>
                 <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md inline-block text-yellow-800">
                    Work in Progress
                 </div>
               </div>
             </Layout>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

export default App;