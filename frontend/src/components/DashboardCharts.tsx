import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Pill, Clock, AlertTriangle } from 'lucide-react';
import type { Reconciliation, Medication } from '../types/api';

interface DashboardChartsProps {
  reconciliations?: Reconciliation[];
  medications?: Medication[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  reconciliations = [], 
  medications = [] 
}) => {
  // Generate reconciliation trend data (last 7 days)
  const reconciliationTrendData = React.useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayReconciliations = reconciliations.filter(r => {
        const reconciliationDate = new Date(r.created_at);
        return reconciliationDate.toDateString() === date.toDateString();
      });
      
      const completed = dayReconciliations.filter(r => r.status === 'completed').length;
      const inProgress = dayReconciliations.filter(r => r.status === 'in_progress').length;
      const pending = dayReconciliations.filter(r => r.status === 'pending').length;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        inProgress,
        pending,
        total: dayReconciliations.length
      });
    }
    
    return last7Days;
  }, [reconciliations]);

  // Medication source distribution
  const medicationSourceData = React.useMemo(() => {
    const sources = medications.reduce((acc, med) => {
      const source = med.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceLabels: Record<string, string> = {
      manual: 'Manual Entry',
      photo: 'Photo OCR',
      pharmacy: 'Pharmacy',
      emr: 'EMR System'
    };

    return Object.entries(sources).map(([source, count]) => ({
      name: sourceLabels[source] || source,
      value: count,
      source
    }));
  }, [medications]);

  // Status distribution for pie chart
  const statusDistribution = React.useMemo(() => {
    const statusCounts = reconciliations.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toLowerCase(),
      value: count,
      status
    }));
  }, [reconciliations]);

  // Performance metrics over time
  const performanceData = React.useMemo(() => {
    const weeklyData = [];
    const weeksBack = 4;
    
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekReconciliations = reconciliations.filter(r => {
        const date = new Date(r.created_at);
        return date >= weekStart && date < weekEnd;
      });
      
      const completed = weekReconciliations.filter(r => r.status === 'completed').length;
      const conflicts = weekReconciliations.reduce((sum, r) => sum + (r.conflicts_found || 0), 0);
      const avgTime = 45; // Mock average time - would be calculated from real data
      
      weeklyData.push({
        week: `Week ${weeksBack - i}`,
        completed,
        conflicts,
        avgTime,
        efficiency: completed > 0 ? Math.round((completed / (completed + conflicts)) * 100) : 100
      });
    }
    
    return weeklyData;
  }, [reconciliations]);

  // Colors for charts
  const CHART_COLORS = {
    primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    status: ['#10B981', '#F59E0B', '#6B7280', '#EF4444'],
    source: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Reconciliation Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Weekly Reconciliation Trend
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reconciliationTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
            <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="In Progress" />
            <Bar dataKey="pending" stackId="a" fill="#6B7280" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Reconciliation Status
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS.status[index % CHART_COLORS.status.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {statusDistribution.map((entry, index) => (
            <div key={entry.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS.status[index % CHART_COLORS.status.length] }}
              />
              <span className="text-sm text-gray-600 capitalize">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-green-500" />
            Medication Sources
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={medicationSourceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Performance Trends
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="conflicts"
              stroke="#EF4444"
              strokeWidth={2}
              name="Conflicts"
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#10B981"
              strokeWidth={2}
              name="Efficiency %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;