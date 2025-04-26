import React, { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './auth/authContext';
import Loader from './components/Loader';
import { Spinner, Center, Box } from '@chakra-ui/react';
import { useAuth } from './auth/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Donations = lazy(() => import('./pages/Donations'));
const Admin = lazy(() => import('./pages/Admin'));
const FieldWorker = lazy(() => import('./pages/FieldWorker'));
const AidReceived = lazy(() => import('./pages/AidReceived'));
const IPFSFiles = lazy(() => import('./pages/IPFSFiles'));
const Landing = lazy(() => import('./pages/Landing'));
const AidDistribution = lazy(() => import('./pages/AidDistribution'));
const DonorTracking = lazy(() => import('./pages/DonorTracking'));
const RefugeeAccess = lazy(() => import('./pages/RefugeeAccess'));
const FieldWorkers = lazy(() => import('./pages/FieldWorkers'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
  </Center>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { user } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Box>{children}</Box>;
};

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { user } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated || user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Box>{children}</Box>;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field-worker"
            element={
              <ProtectedRoute>
                <FieldWorker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aid-received"
            element={
              <ProtectedRoute>
                <AidReceived />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <IPFSFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aid-distribution"
            element={
              <ProtectedRoute>
                <AidDistribution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor-tracking"
            element={
              <ProtectedRoute>
                <DonorTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/refugee-access"
            element={
              <ProtectedRoute>
                <RefugeeAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field-workers"
            element={
              <ProtectedRoute>
                <FieldWorkers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;