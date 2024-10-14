import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

const ProtectedRoutes = ({ adminOnly = false }) => {
  const { user, userRole, loading } = useContext(AuthContext); // Access user role from AuthContext

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking authentication
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if the user is not authenticated
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/login" />; // Redirect if user is not an admin but trying to access admin route
  }

  return <Outlet />; // Render the protected routes (admin or student)
};

export default ProtectedRoutes;
