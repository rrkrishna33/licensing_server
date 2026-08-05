import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLicenses, createLicense } from '../api/licenses';
import { getCustomers } from '../api/customers';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import type { License, Customer } from '../types';

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

export default function Licenses() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState<License[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');

  const [customerId, setCustomerId] = useState('');
  const [productName, setProductName] = useState('Gellsoft Billing Software');
  const [maxMachines, setMaxMachines] = useState('1');
  const [validDays, setValidDays]     = useState('365');

  function load() {
    setLoading(true);
    Promise.all([getLicenses(), getCustomers()])
      .then(([lic, cust]) => {
        setRows(lic.data.licenses);
        setCustomers(cust.data.customers);
        if (cust.data.customers.length > 0) setCustomerId(String(cust.data.customers[0].id));
      })
      .catch(() => setError('Failed to load licenses.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openModal() {
    setProductName('Gellsoft Billing Software');
    setMaxMachines('1'); setValidDays('365'); setFormErr(''); setOpen(true);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormErr('');
    setSaving(true);
    try {
      await createLicense({
        customerId: Number(customerId),
        productName,
        maxMachines: Number(maxMachines),
        validDays: Number(validDays)
      });
      setOpen(false);
      load();
    } catch {
      setFormErr('Failed to generate license. Check inputs.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Licenses</h1>
        <button onClick={openModal} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Generate License
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Key', 'Product', 'Customer', 'Status', 'Machines', 'Expires', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No licenses yet.</td></tr>
              )}
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{l.license_key}</td>
                  <td className="px-4 py-3 text-slate-700">{l.product_name}</td>
                  <td className="px-4 py-3 text-slate-500">{l.customer_name}</td>
                  <td className="px-4 py-3"><Badge value={l.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{l.active_machine_count} / {l.max_machines}</td>
                  <td className="px-4 py-3 text-slate-400">{fmt(l.expires_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => void navigate(`/licenses/${l.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Generate License" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={(e) => { void handleCreate(e); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Machines</label>
              <input type="number" min="1" max="50" value={maxMachines} onChange={(e) => setMaxMachines(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid Days</label>
              <input type="number" min="1" max="3650" value={validDays} onChange={(e) => setValidDays(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {formErr && <p className="text-red-600 text-sm">{formErr}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saving ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
