import { useEffect, useState } from 'react';
import { getStats } from '../api/dashboard';
import StatCard from '../components/StatCard';
import type { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!stats)  return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers"      value={stats.totalCustomers}      color="text-indigo-600" />
        <StatCard title="Total Licenses"       value={stats.totalLicenses}       color="text-indigo-600" />
        <StatCard title="Active Licenses"      value={stats.activeLicenses}      color="text-green-600" />
        <StatCard title="Active Machines"      value={stats.totalActiveMachines} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Suspended Licenses"  value={stats.suspendedLicenses}  color="text-yellow-600" />
        <StatCard title="Expired Licenses"    value={stats.expiredLicenses}    color="text-gray-500" />
        <StatCard title="Cancelled Licenses"  value={stats.cancelledLicenses}  color="text-red-600" />
      </div>
    </div>
  );
}
