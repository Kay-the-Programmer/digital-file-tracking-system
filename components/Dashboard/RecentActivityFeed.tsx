import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { RecentActivity } from '../../services/api';
import { ICONS } from '../../constants';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  isLoading: boolean;
  error?: string | null;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'case':
      return <ICONS.CASES className="h-5 w-5 text-teal-400" />;
    case 'file':
      return <ICONS.FILES className="h-5 w-5 text-blue-400" />;
    case 'user':
      return <ICONS.ADMIN className="h-5 w-5 text-yellow-400" />;
    default:
      return <div className="w-5 h-5" />;
  }
};

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, isLoading, error }) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-white mb-4">Recent Activities</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : error ? (
         <div className="flex justify-center items-center h-48 text-red-400 bg-red-900/30 rounded-lg p-4">
          <p>{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No recent activities to display.</p>
      ) : (
        <ul className="divide-y divide-gray-700">
          {activities.map((activity) => (
            <li key={activity.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 mr-3 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm text-gray-200">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              {activity.link && (
                <Link to={activity.link} className="text-sm text-teal-400 hover:text-teal-300 hover:underline font-medium ml-4 transition-colors">
                  View
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default RecentActivityFeed;