
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { api } from '../../services/api';
import { ICONS, ROUTES } from '../../constants';
import Button from '../ui/Button';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const data = await api.fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchInitialNotifications();
  }, [setNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOneAsRead = async (notificationId: string) => {
    markAsRead(notificationId); // Optimistic update
    try {
      await api.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Revert state if API call fails (not implemented for this mock)
    }
  };
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read_status) {
      handleMarkOneAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const recentUnread = notifications.filter(n => !n.read_status).slice(0, 5);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        aria-label="View notifications"
      >
        <ICONS.BELL className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ring-2 ring-gray-800">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && <Button size="sm" variant="secondary" onClick={() => { markAllAsRead(); }}>Mark all as read</Button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentUnread.length > 0 ? (
              recentUnread.map(notif => (
                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50">
                  <p className="text-sm font-medium text-gray-100">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-6">No unread notifications</p>
            )}
          </div>
          <div className="p-2 bg-gray-900/50 text-center">
            <Link to={ROUTES.NOTIFICATIONS} onClick={() => setIsOpen(false)} className="text-sm font-medium text-teal-400 hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
