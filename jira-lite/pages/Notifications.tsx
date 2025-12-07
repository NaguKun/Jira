import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Notification } from '../types';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, isLoading, isAuthenticated, fetchNotifications } = useData();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Refresh notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const unread = notifications.filter(n => !n.is_read);
  const read = notifications.filter(n => n.is_read);

  return (
    <div className="max-w-3xl mx-auto">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
         {unread.length > 0 && (
           <button 
             onClick={markAllNotificationsRead}
             className="text-sm text-primary hover:underline font-medium"
           >
             Mark all as read
           </button>
         )}
       </div>

       <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Unread</h2>
              <div className="space-y-3">
                 {unread.map(n => (
                   <NotificationCard key={n.id} notification={n} onRead={() => markNotificationRead(n.id)} />
                 ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Earlier</h2>
            <div className="space-y-3">
               {read.map(n => (
                 <NotificationCard key={n.id} notification={n} />
               ))}
               {read.length === 0 && unread.length === 0 && (
                 <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-500">You're all caught up!</p>
                 </div>
               )}
            </div>
          </div>
       </div>
    </div>
  );
};

const NotificationCard: React.FC<{ notification: Notification; onRead?: () => void }> = ({ notification, onRead }) => {
  const isUnread = !notification.is_read;
  
  let bgIcon = 'bg-slate-500';
  let icon = 'ℹ️';

  // Determine icon based on title content
  if (notification.title?.toLowerCase().includes('assign')) {
    icon = '👤';
    bgIcon = 'bg-blue-500';
  } else if (notification.title?.toLowerCase().includes('comment')) {
    icon = '💬';
    bgIcon = 'bg-purple-500';
  } else if (notification.title?.toLowerCase().includes('due')) {
    icon = '⚠️';
    bgIcon = 'bg-yellow-500';
  }

  return (
    <div className={`flex gap-4 p-4 rounded-lg border transition-colors ${isUnread ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
       <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgIcon}`}>
         <span className="text-white">{icon}</span>
       </div>
       <div className="flex-1">
          <p className={`text-sm font-bold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
             {notification.title}
          </p>
          <p className={`text-sm ${isUnread ? 'text-slate-700' : 'text-slate-600'}`}>
             {notification.content}
          </p>
          <p className="text-xs text-slate-400 mt-1">
             {new Date(notification.created_at).toLocaleString()}
          </p>
       </div>
       {isUnread && onRead && (
         <button 
           onClick={onRead}
           className="self-center w-3 h-3 bg-blue-500 rounded-full hover:bg-blue-600" 
           title="Mark as read"
         />
       )}
    </div>
  );
}