import React, { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services';
import { KPI, RecentActivity } from '../types';
import KPICard from '../components/Dashboard/KPICard';
import RecentActivityFeed from '../components/Dashboard/RecentActivityFeed';


const DashboardPage: React.FC = () => {
    // Get the user from your auth store
    const { user, isAuthenticated } = useAuthStore();

    const [kpis, setKpis] = useState<KPI[] | null>(null);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [kpisError, setKpisError] = useState<string | null>(null);

    const [activities, setActivities] = useState<RecentActivity[] | null>(null);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [activitiesError, setActivitiesError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch data if the user is authenticated.
        if (isAuthenticated) {
            const fetchKpis = async () => {
                try {
                    setKpisError(null);
                    setLoadingKpis(true);
                    const kpiData = await dashboardService.getKPIs();
                    setKpis(kpiData);
                } catch (error) {
                    console.error("Failed to fetch KPIs", error);
                    setKpisError("Failed to load key metrics.");
                    // --- FIX: We no longer call logout() here. We just show an error. ---
                } finally {
                    setLoadingKpis(false);
                }
            };

            const fetchActivities = async () => {
                try {
                    setActivitiesError(null);
                    setLoadingActivities(true);
                    const activityData = await dashboardService.getRecentActivity();
                    setActivities(activityData);
                } catch (error) {
                    console.error("Failed to fetch activities", error);
                    setActivitiesError("Failed to load recent activities.");
                    // --- FIX: We no longer call logout() here. We just show an error. ---
                } finally {
                    setLoadingActivities(false);
                }
            };

            fetchKpis();
            fetchActivities();
        }
    }, [isAuthenticated]); // The dependency array is correct.

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back, {user ? `${user.first_name} ${user.last_name}` : ''}!</h1>
                <p className="mt-2 text-lg text-gray-400">Here's a snapshot of your work and recent system activity.</p>
            </div>

            <div className="space-y-8">
                {/* KPIs Section */}
                <div>
                    {loadingKpis ? (
                        <div className="flex justify-center items-center h-32"><Spinner size="lg" /></div>
                    ) : kpisError ? (
                        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg">{kpisError}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {kpis?.map((kpi) => (
                                <KPICard
                                    key={kpi.id}
                                    label={kpi.label}
                                    value={kpi.value}
                                    unit={kpi.unit}
                                    description={kpi.description}
                                    color={kpi.color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activities Section */}
                <div>
                    <RecentActivityFeed activities={activities || []} isLoading={loadingActivities} error={activitiesError} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
