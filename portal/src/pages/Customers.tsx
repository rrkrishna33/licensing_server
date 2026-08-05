import { useEffect, useState, type FormEvent } from 'react';
import { getCustomers, createCustomer } from '../api/customers';
import Modal from '../components/Modal';
import type { Customer } from '../types';

function fmt(d: string) {
  return new Date(d).toLocaleDateString();
}

export default function Customers() {
  const [rows, setRows]         = useState<Customer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');

  function load() {
    setLoading(true);
    getCustomers()
      .then((res) => setRows(res.data.customers))
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openModal() {
    setName(''); setEmail(''); setPhone(''); setFormErr(''); setOpen(true);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormErr('');
    setSaving(true);
    try {
      await createCustomer({ name, contactEmail: email || undefined, contactPhone: phone || undefined });
      setOpen(false);
      load();
    } catch {
      setFormErr('Failed to create customer. Check inputs.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Customers</h1>
        <button onClick={openModal} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Customer
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
                {['ID', 'Name', 'Email', 'Phone', 'Created'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No customers yet.</td></tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.contact_email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{c.contact_phone ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{fmt(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="New Customer" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={(e) => { void handleCreate(e); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {formErr && <p className="text-red-600 text-sm">{formErr}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
