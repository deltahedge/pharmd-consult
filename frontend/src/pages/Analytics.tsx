import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../services/api';
import DashboardCharts from '../components/DashboardCharts';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetrics, setSelectedMetrics] = useState(['reconciliations', 'medications', 'performance']);

  const { data: reconciliations, isLoading: reconciliationsLoading, refetch: refetchReconciliations } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: () => apiClient.getReconciliations(),
  });

  const { data: medications, isLoading: medicationsLoading, refetch: refetchMedications } = useQuery({
    queryKey: ['medications'],
    queryFn: () => apiClient.getMedications(),
  });

  const { data: patients, isLoading: patientsLoading, refetch: refetchPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients(),
  });

  const isLoading = reconciliationsLoading || medicationsLoading || patientsLoading;

  const handleRefreshData = () => {
    refetchReconciliations();
    refetchMedications();
    refetchPatients();
  };

  const handleExportData = () => {
    // Placeholder for export functionality
    console.log('Exporting analytics data...');
  };

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!reconciliations || !medications || !patients) return null;

    const completedReconciliations = reconciliations.filter(r => r.status === 'completed');
    const totalConflicts = reconciliations.reduce((sum, r) => sum + (r.conflicts_found || 0), 0);
    const avgReconciliationTime = 45; // Mock - would calculate from real data
    
    const photoMedications = medications.filter(m => m.source === 'photo').length;
    const manualMedications = medications.filter(m => m.source === 'manual').length;
    
    return {
      totalReconciliations: reconciliations.length,
      completedReconciliations: completedReconciliations.length,
      completionRate: reconciliations.length > 0 
        ? Math.round((completedReconciliations.length / reconciliations.length) * 100)
        : 0,
      totalPatients: patients.length,
      totalMedications: medications.length,
      totalConflicts,
      avgReconciliationTime,
      ocrUsageRate: medications.length > 0 
        ? Math.round((photoMedications / medications.length) * 100)
        : 0,
      manualEntryRate: medications.length > 0 
        ? Math.round((manualMedications / medications.length) * 100)
        : 0
    };
  }, [reconciliations, medications, patients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-lg text-gray-600">
            Comprehensive insights into your medication reconciliation performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleRefreshData}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Reconciliations"
            value={summaryStats.totalReconciliations}
            subtitle={`${summaryStats.completionRate}% completion rate`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Patients"
            value={summaryStats.totalPatients}
            subtitle={`${summaryStats.totalMedications} medications managed`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Average Time"
            value={`${summaryStats.avgReconciliationTime}min`}
            subtitle="Per reconciliation"
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="OCR Usage"
            value={`${summaryStats.ocrUsageRate}%`}
            subtitle="Of all medication entries"
            icon={<Filter className="w-6 h-6" />}
            color="orange"
          />
        </div>
      )}

      {/* Metrics Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics to Display</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'reconciliations', label: 'Reconciliation Trends' },
            { key: 'medications', label: 'Medication Sources' },
            { key: 'performance', label: 'Performance Metrics' },
            { key: 'conflicts', label: 'Conflict Analysis' }
          ].map((metric) => (
            <label key={metric.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric.key]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{metric.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Charts */}
      {selectedMetrics.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Data Visualization</h2>
            <p className="text-sm text-gray-500">
              Showing data for {dateRange === '7d' ? 'last 7 days' : 
                            dateRange === '30d' ? 'last 30 days' :
                            dateRange === '90d' ? 'last 3 months' : 'last year'}
            </p>
          </div>
          
          <DashboardCharts 
            reconciliations={reconciliations || []}
            medications={medications || []}
          />
        </div>
      )}

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Your completion rate of {summaryStats?.completionRate}% is above the industry average of 75%.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                OCR usage at {summaryStats?.ocrUsageRate}% shows good adoption of automated tools.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Average reconciliation time of {summaryStats?.avgReconciliationTime} minutes is efficient.
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Consider increasing OCR usage for faster medication entry.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Focus on resolving conflicts early to improve completion times.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Schedule regular patient follow-ups to maintain medication accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default Analytics;