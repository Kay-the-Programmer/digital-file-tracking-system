import { KPI, RecentActivity } from '@/types.ts';
import { apiRequest } from '@/services';

// Dashboard Service
export const dashboardService = {
    // API implementations
    getKPIs: () => apiRequest<KPI[]>('GET', '/dashboard/kpis/'),
    getRecentActivity: () => apiRequest<RecentActivity[]>('GET', '/dashboard/recent-activity/')
};

export default dashboardService;
