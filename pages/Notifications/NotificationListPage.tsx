
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ICONS } from '../../constants';

const NotificationListPage: React.FC = () => {
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkOneRead = async (id: string) => {
    markAsRead(id); // Optimistic update
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      // Could revert the optimistic update here if needed
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead(); // Optimistic update
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      // Could revert the optimistic update here if needed
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'read') return notifications.filter(n => n.read_status);
    if (filter === 'unread') return notifications.filter(n => !n.read_status);
    return notifications;
  }, [notifications, filter]);

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredNotifications.length === 0) {
      return <div className="text-center py-10 text-gray-500">No notifications match the current filter.</div>;
    }
    return (
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
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            onClick={handleRefresh} 
            isLoading={refreshing}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            onClick={handleMarkAllRead} 
            disabled={!notifications.some(n => !n.read_status) || loading}
          >
            Mark All As Read
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex justify-end mb-4">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            disabled={loading}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {renderContent()}
      </Card>
    </div>
  );
};

export default NotificationListPage;
