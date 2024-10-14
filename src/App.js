import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegistrationForm from "./pages/RegistrationForm";
import LoginForm from "./pages/LoginForm";
import AdminDashboard from "./pages/admin/AdminDashboard"; // Correct path
import BrowseFood from "./pages/student/BrowseFood"; // Correct path
import { AuthProvider } from "./contexts/AuthContext"; // Wrap with Auth Context
import ProtectedRoutes from "./components/ProtectedRoutes"; // Route protection
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          
          {/* Protect admin routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductManagement />} /> 
            <Route path="/admin/orders" element={<OrderManagement />} /> 
            <Route path="/admin/users" element={<UserManagement />} /> 
          </Route>

          {/* Protect student route */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/student/browse" element={<BrowseFood />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
