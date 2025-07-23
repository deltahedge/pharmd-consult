import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - will be replaced with real API calls
  const stats = {
    totalPatients: 24,
    activeReconciliations: 8,
    completedToday: 12,
    conflictsFound: 3,
  };

  const recentReconciliations = [
    {
      id: 1,
      patient: 'John Doe',
      status: 'completed',
      medications: 8,
      conflicts: 0,
      completedAt: '2 hours ago',
    },
    {
      id: 2,
      patient: 'Jane Smith',
      status: 'in_progress',
      medications: 12,
      conflicts: 2,
      completedAt: null,
    },
    {
      id: 3,
      patient: 'Bob Johnson',
      status: 'pending',
      medications: 5,
      conflicts: 0,
      completedAt: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your medication reconciliations today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Patients
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalPatients}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardList className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Reconciliations
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.activeReconciliations}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Completed Today
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.completedToday}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Conflicts Found
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.conflictsFound}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/patients/new"
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-gray-300 hover:border-primary-400"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">Add Patient</h3>
              <p className="text-xs text-gray-500 mt-1">
                Start a new medication reconciliation
              </p>
            </div>
          </Link>

          <Link
            to="/reconciliations/new"
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">
                New Reconciliation
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Begin medication review process
              </p>
            </div>
          </Link>

          <Link
            to="/patients"
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">View Patients</h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage your patient list
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent reconciliations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Reconciliations
          </h2>
          <Link
            to="/reconciliations"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        <div className="card overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentReconciliations.map((reconciliation) => (
              <li key={reconciliation.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {reconciliation.patient
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {reconciliation.patient}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reconciliation.medications} medications
                        {reconciliation.conflicts > 0 && (
                          <span className="ml-2 text-red-600">
                            • {reconciliation.conflicts} conflicts
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        reconciliation.status
                      )}`}
                    >
                      {getStatusIcon(reconciliation.status)}
                      <span className="ml-1 capitalize">
                        {reconciliation.status.replace('_', ' ')}
                      </span>
                    </span>
                    {reconciliation.completedAt && (
                      <span className="text-sm text-gray-500">
                        {reconciliation.completedAt}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;