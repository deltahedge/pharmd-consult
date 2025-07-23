// React imports are handled by JSX transform
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import EnhancedDashboard from './pages/EnhancedDashboard';
import Patients from './pages/Patients';
import Medications from './pages/Medications';
import MedicationUpload from './pages/MedicationUpload';
import Reconciliations from './pages/Reconciliations';
import ReconciliationDetail from './pages/ReconciliationDetail';
import Analytics from './pages/Analytics';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<EnhancedDashboard />} />
              
              {/* Patient routes */}
              <Route path="/patients" element={<Patients />} />
              
              {/* Medication routes */}
              <Route path="/medications" element={<Medications />} />
              
              {/* OCR Upload routes */}
              <Route path="/upload" element={<MedicationUpload />} />
              
              {/* Reconciliation routes */}
              <Route path="/reconciliations" element={<Reconciliations />} />
              <Route path="/reconciliations/:id" element={<ReconciliationDetail />} />
              
              {/* Analytics routes */}
              <Route path="/analytics" element={<Analytics />} />
              
              <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings page coming soon...</div>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;