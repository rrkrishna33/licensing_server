import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLicense, updateLicenseStatus } from '../api/licenses';
import Badge from '../components/Badge';
import type { LicenseDetail } from '../types';

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString() : '—';
}

const NEXT_STATUS: Record<string, { label: string; value: string; color: string }> = {
  active:    { label: 'Suspend',    value: 'suspended', color: 'bg-yellow-500 hover:bg-yellow-600' },
  suspended: { label: 'Re-Activate', value: 'active',  color: 'bg-green-600 hover:bg-green-700' },
  cancelled: { label: '',           value: '',          color: '' },
  expired:   { label: '',           value: '',          color: '' }
};

export default function LicenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    getLicense(Number(id))
      .then((res) => setLicense(res.data.license))
      .catch(() => setError('Failed to load license.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(newStatus: string) {
    if (!license) return;
    setUpdating(true);
    try {
      await updateLicenseStatus(license.id, newStatus);
      load();
    } catch {
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!license) return;
    if (!window.confirm('Cancel this license? This cannot be undone.')) return;
    setUpdating(true);
    try {
      await updateLicenseStatus(license.id, 'cancelled');
      load();
    } catch {
      setError('Failed to cancel.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!license) return null;

  const action = NEXT_STATUS[license.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => void navigate('/licenses')} className="text-slate-400 hover:text-slate-700 text-sm">← Back</button>
        <h1 className="text-xl font-bold text-slate-800">License Detail</h1>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">License Key</p>
            <p className="font-mono text-base font-semibold text-slate-800">{license.license_key}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge value={license.status} />
            {action?.value && (
              <button
                onClick={() => void handleStatusChange(action.value)}
                disabled={updating}
                className={`${action.color} disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors`}
              >
                {updating ? '…' : action.label}
              </button>
            )}
            {license.status !== 'cancelled' && (
              <button
                onClick={() => void handleCancel()}
                disabled={updating}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel License
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-slate-500 text-xs mb-0.5">Customer</p><p className="font-medium text-slate-800">{license.customer_name}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Product</p><p className="font-medium text-slate-800">{license.product_name}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Max Machines</p><p className="font-medium text-slate-800">{license.max_machines}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Active Machines</p><p className="font-medium text-slate-800">{license.active_machine_count}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Created</p><p className="font-medium text-slate-800">{fmt(license.created_at)}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Expires</p><p className="font-medium text-slate-800">{fmt(license.expires_at)}</p></div>
        </div>
      </div>

      {/* Activations table */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Activation History ({license.activations.length})</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Machine ID', 'App Version', 'Status', 'First Activated', 'Last Seen'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {license.activations.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No activations yet.</td></tr>
              )}
              {license.activations.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{a.machine_id}</td>
                  <td className="px-4 py-3 text-slate-500">{a.app_version ?? '—'}</td>
                  <td className="px-4 py-3"><Badge value={a.is_active} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmt(a.first_activated_at)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmt(a.last_seen_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
