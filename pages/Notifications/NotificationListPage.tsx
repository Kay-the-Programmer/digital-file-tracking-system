
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ICONS } from '../../constants';

const NotificationListPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  const handleMarkOneRead = async (id: string) => {
    markAsRead(id); // Optimistic update
    await api.markNotificationAsRead(id).catch(err => console.error(err));
  };
  
  const handleMarkAllRead = async () => {
    markAllAsRead(); // Optimistic update
    // In real app, call an API endpoint to mark all as read
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'read') return notifications.filter(n => n.read_status);
    if (filter === 'unread') return notifications.filter(n => !n.read_status);
    return notifications;
  }, [notifications, filter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button onClick={handleMarkAllRead} disabled={!notifications.some(n => !n.read_status)}>Mark All As Read</Button>
      </div>
      
      <Card>
        <div className="flex justify-end mb-4">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        
        {filteredNotifications.length > 0 ? (
          <ul className="space-y-3">
            {filteredNotifications.map(notif => (
              <li
                key={notif.id}
                className={`p-4 rounded-lg flex items-center justify-between transition-colors ${
                  notif.read_status ? 'bg-gray-800/50' : 'bg-gray-700'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-medium ${notif.read_status ? 'text-gray-400' : 'text-white'}`}>
                    {notif.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                   {notif.link && (
                    <Link to={notif.link} className="text-sm text-teal-400 hover:underline mt-1 inline-block">
                        View Details
                    </Link>
                  )}
                </div>
                {!notif.read_status && (
                  <Button size="sm" onClick={() => handleMarkOneRead(notif.id)}>
                    Mark as Read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No notifications match the current filter.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationListPage;
