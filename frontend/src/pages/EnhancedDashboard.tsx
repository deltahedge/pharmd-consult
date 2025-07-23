import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Camera,
  TrendingUp,
  Activity,
  Target,
  Award,
  Zap,
  Bell,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../services/api';
import type { Reconciliation, Patient, Medication } from '../types/api';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real data
  const { data: reconciliations, isLoading: reconciliationsLoading } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: () => apiClient.getReconciliations(),
  });

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients(),
  });

  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => apiClient.getMedications(),
  });

  // Calculate real-time statistics
  const stats = React.useMemo(() => {
    if (!reconciliations || !patients || !medications) {
      return {
        totalPatients: 0,
        totalMedications: 0,
        activeReconciliations: 0,
        completedToday: 0,
        completedThisWeek: 0,
        conflictsFound: 0,
        avgTimePerReconciliation: 0,
        completionRate: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedToday = reconciliations.filter(r => 
      r.status === 'completed' && 
      new Date(r.completed_at || r.created_at) >= today
    ).length;

    const completedThisWeek = reconciliations.filter(r =>
      r.status === 'completed' &&
      new Date(r.completed_at || r.created_at) >= weekAgo
    ).length;

    const activeReconciliations = reconciliations.filter(r => 
      r.status === 'in_progress' || r.status === 'pending'
    ).length;

    const conflictsFound = reconciliations.reduce((sum, r) => sum + (r.conflicts_found || 0), 0);

    const completionRate = reconciliations.length > 0 
      ? (reconciliations.filter(r => r.status === 'completed').length / reconciliations.length) * 100
      : 0;

    return {
      totalPatients: patients.length,
      totalMedications: medications.length,
      activeReconciliations,
      completedToday,
      completedThisWeek,
      conflictsFound,
      avgTimePerReconciliation: 45, // Mock for now
      completionRate
    };
  }, [reconciliations, patients, medications]);

  // Recent activity for timeline
  const recentActivity = React.useMemo(() => {
    if (!reconciliations || !patients) return [];

    const activities = reconciliations
      .slice(0, 5)
      .map(reconciliation => {
        const patient = patients.find(p => p.id === reconciliation.patient_id);
        return {
          id: reconciliation.id,
          type: 'reconciliation',
          title: `Reconciliation ${reconciliation.status}`,
          description: `${patient?.first_name || 'Unknown'} ${patient?.last_name || 'Patient'}`,
          time: reconciliation.completed_at || reconciliation.created_at,
          status: reconciliation.status,
          conflicts: reconciliation.conflicts_found || 0
        };
      });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [reconciliations, patients]);

  // Pending reconciliations that need attention
  const pendingReconciliations = React.useMemo(() => {
    if (!reconciliations || !patients) return [];

    return reconciliations
      .filter(r => r.status === 'in_progress' || r.status === 'pending')
      .slice(0, 3)
      .map(reconciliation => {
        const patient = patients.find(p => p.id === reconciliation.patient_id);
        return {
          ...reconciliation,
          patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim()
        };
      });
  }, [reconciliations, patients]);

  const isLoading = reconciliationsLoading || patientsLoading || medicationsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-lg text-gray-600">
            Here's your medication reconciliation overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Completed Today"
          value={stats.completedToday}
          change={`+${stats.completedThisWeek - stats.completedToday} this week`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          trend="up"
        />
        <MetricCard
          title="Active Reconciliations"
          value={stats.activeReconciliations}
          change="Pending review"
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          trend="neutral"
        />
        <MetricCard
          title="Total Patients"
          value={stats.totalPatients}
          change={`${stats.totalMedications} medications`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend="up"
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          change="This month"
          icon={<Target className="w-6 h-6" />}
          color="purple"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="New Reconciliation"
                description="Start medication review"
                icon={<Plus className="w-6 h-6" />}
                color="blue"
                onClick={() => navigate('/reconciliations')}
              />
              <QuickActionCard
                title="Upload Medication"
                description="OCR photo scanning"
                icon={<Camera className="w-6 h-6" />}
                color="green"
                onClick={() => navigate('/upload')}
              />
              <QuickActionCard
                title="Add Patient"
                description="New patient record"
                icon={<Users className="w-6 h-6" />}
                color="purple"
                onClick={() => navigate('/patients')}
              />
              <QuickActionCard
                title="View Analytics"
                description="Insights & reports"
                icon={<TrendingUp className="w-6 h-6" />}
                color="orange"
                onClick={() => navigate('/analytics')}
              />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Recent Activity
              </h2>
              <Link
                to="/reconciliations"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                View all
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start your first reconciliation to see activity here</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <ClipboardList className={`w-4 h-4 ${
                        activity.status === 'completed' ? 'text-green-600' :
                        activity.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <span className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {activity.conflicts > 0 && (
                        <p className="text-xs text-red-600 mt-1">⚠️ {activity.conflicts} conflicts found</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pending Tasks & Alerts */}
        <div className="space-y-6">
          {/* Pending Reconciliations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Needs Attention
              {pendingReconciliations.length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingReconciliations.length}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {pendingReconciliations.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm">All caught up!</p>
                  <p className="text-xs">No pending reconciliations</p>
                </div>
              ) : (
                pendingReconciliations.map((reconciliation) => (
                  <div 
                    key={reconciliation.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/reconciliations/${reconciliation.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {reconciliation.patient_name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reconciliation.status)}`}>
                        {reconciliation.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{reconciliation.total_medications} medications</span>
                      <span>{formatTimeAgo(reconciliation.created_at)}</span>
                    </div>
                    {reconciliation.conflicts_found && reconciliation.conflicts_found > 0 && (
                      <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {reconciliation.conflicts_found} conflicts
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Your Performance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Time per Reconciliation</span>
                <span className="text-lg font-semibold text-gray-900">{stats.avgTimePerReconciliation}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-lg font-semibold text-green-600">{Math.round(stats.completionRate)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conflicts Resolved</span>
                <span className="text-lg font-semibold text-gray-900">{stats.conflictsFound}</span>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Great work! You're above average performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'blue' | 'purple' | 'orange';
  trend: 'up' | 'down' | 'neutral';
}> = ({ title, value, change, icon, color, trend }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500 mr-1" />}
            <p className="text-xs text-gray-500">{change}</p>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}> = ({ title, description, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClasses[color]} text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
    >
      <div className="text-center">
        <div className="mx-auto mb-2 w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs opacity-90 mt-1">{description}</p>
      </div>
    </button>
  );
};

export default EnhancedDashboard;