import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Licenses from './pages/Licenses';
import LicenseDetail from './pages/LicenseDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/customers"         element={<Customers />} />
          <Route path="/licenses"          element={<Licenses />} />
          <Route path="/licenses/:id"      element={<LicenseDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
