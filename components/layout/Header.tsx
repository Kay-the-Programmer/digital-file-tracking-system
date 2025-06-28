
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ICONS, ROUTES } from '../../constants';
import NotificationBell from '../Notifications/NotificationBell';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-gray-800 border-b border-gray-700 flex items-center justify-end px-6 space-x-4">
      <NotificationBell />
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700"
        >
          <span className="font-semibold">{user ? `${user.first_name} ${user.last_name}` : 'User'}</span>
          <ICONS.CHEVRON_DOWN className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              <ICONS.USER_CIRCLE className="h-5 w-5 mr-3" />
              My Profile
            </Link>
            <div className="my-1 border-t border-gray-600"></div>
            <button
              onClick={() => { logout(); setDropdownOpen(false); }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              <ICONS.LOGOUT className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
