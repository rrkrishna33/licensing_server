requireAuth();

let currentLicenseId = null;

/* ── List ── */

async function loadLicenses() {
  const tbody = document.getElementById('licensesBody');
  try {
    const { licenses } = await apiFetch('/admin/licenses');
    document.getElementById('licenseCount').textContent = `Licenses (${licenses.length})`;
    if (!licenses.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty">No licenses yet.</td></tr>';
      return;
    }
    tbody.innerHTML = licenses.map(l => `
      <tr>
        <td class="mono"><button class="link-btn" onclick="showDetail(${l.id})">${esc(l.license_key)}</button></td>
        <td>${esc(l.product_name)}</td>
        <td>${esc(l.customer_name)}</td>
        <td>${statusBadge(l.status)}</td>
        <td>${l.active_machine_count} / ${l.max_machines}</td>
        <td>${formatDate(l.expires_at)}</td>
        <td>${formatDate(l.created_at)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="showDetail(${l.id})">View</button></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="loader" style="color:var(--danger)">${err.message}</td></tr>`;
  }
}

/* ── Detail ── */

async function showDetail(id) {
  currentLicenseId = id;
  document.getElementById('listView').classList.add('hidden');
  document.getElementById('detailView').classList.remove('hidden');
  document.getElementById('detailGrid').innerHTML = '<div class="loader" style="grid-column:1/-1">Loading…</div>';
  document.getElementById('activationsBody').innerHTML = '<tr><td colspan="5" class="loader">Loading…</td></tr>';
  document.getElementById('statusActions').innerHTML = '';

  try {
    const { license } = await apiFetch(`/admin/licenses/${id}`);
    document.getElementById('detailKey').textContent = license.license_key;

    document.getElementById('detailGrid').innerHTML = `
      <div class="detail-item"><div class="dt">ID</div><div class="dd">${license.id}</div></div>
      <div class="detail-item"><div class="dt">Product</div><div class="dd">${esc(license.product_name)}</div></div>
      <div class="detail-item"><div class="dt">Customer</div><div class="dd">${esc(license.customer_name)}</div></div>
      <div class="detail-item"><div class="dt">Status</div><div class="dd">${statusBadge(license.status)}</div></div>
      <div class="detail-item"><div class="dt">Max Machines</div><div class="dd">${license.max_machines}</div></div>
      <div class="detail-item"><div class="dt">Expires</div><div class="dd">${formatDate(license.expires_at)}</div></div>
      <div class="detail-item"><div class="dt">Created</div><div class="dd">${formatDate(license.created_at)}</div></div>
      <div class="detail-item"><div class="dt">Updated</div><div class="dd">${formatDate(license.updated_at)}</div></div>
    `;

    renderStatusActions(license.status);

    const acts = license.activations || [];
    const activationsBody = document.getElementById('activationsBody');
    if (!acts.length) {
      activationsBody.innerHTML = '<tr><td colspan="5" class="empty">No activations yet.</td></tr>';
    } else {
      activationsBody.innerHTML = acts.map(a => `
        <tr>
          <td class="mono">${esc(a.machine_id)}</td>
          <td>${esc(a.app_version || '—')}</td>
          <td>${a.is_active ? '<span class="badge badge-active">yes</span>' : '<span class="badge badge-expired">no</span>'}</td>
          <td>${formatDate(a.first_activated_at)}</td>
          <td>${formatDate(a.last_seen_at)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    document.getElementById('detailGrid').innerHTML = `<div class="error-msg" style="grid-column:1/-1">${err.message}</div>`;
  }
}

function renderStatusActions(currentStatus) {
  const container = document.getElementById('statusActions');
  const transitions = {
    active:    [{ label: 'Suspend', status: 'suspended', cls: 'btn-warning' }, { label: 'Cancel', status: 'cancelled', cls: 'btn-danger' }],
    suspended: [{ label: 'Reactivate', status: 'active', cls: 'btn-success' }, { label: 'Cancel', status: 'cancelled', cls: 'btn-danger' }],
    cancelled: [{ label: 'Reactivate', status: 'active', cls: 'btn-success' }]
  };
  const actions = transitions[currentStatus] || [];
  container.innerHTML = actions.map(a =>
    `<button class="btn ${a.cls} btn-sm" onclick="changeStatus('${a.status}')">${a.label}</button>`
  ).join('');
}

async function changeStatus(status) {
  try {
    await apiFetch(`/admin/licenses/${currentLicenseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showDetail(currentLicenseId);
  } catch (err) {
    alert(err.message);
  }
}

function showList() {
  currentLicenseId = null;
  document.getElementById('detailView').classList.add('hidden');
  document.getElementById('listView').classList.remove('hidden');
  loadLicenses();
}

/* ── Create license modal ── */

async function openCreateModal() {
  document.getElementById('createForm').reset();
  document.getElementById('createError').textContent = '';
  document.getElementById('createModal').classList.remove('hidden');

  const select = document.getElementById('lCustomer');
  select.innerHTML = '<option value="">Loading…</option>';
  try {
    const { customers } = await apiFetch('/admin/customers');
    if (!customers.length) {
      select.innerHTML = '<option value="">No customers found</option>';
    } else {
      select.innerHTML = customers.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    }
  } catch {
    select.innerHTML = '<option value="">Failed to load customers</option>';
  }
  document.getElementById('lProduct').focus();
}

function closeCreateModal() {
  document.getElementById('createModal').classList.add('hidden');
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('createBtn');
  const errEl = document.getElementById('createError');
  errEl.textContent = '';

  const customerId = parseInt(document.getElementById('lCustomer').value, 10);
  if (!customerId) { errEl.textContent = 'Please select a customer.'; return; }

  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    await apiFetch('/admin/licenses', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        productName: document.getElementById('lProduct').value.trim(),
        maxMachines: parseInt(document.getElementById('lMachines').value, 10) || 1,
        validDays: parseInt(document.getElementById('lDays').value, 10) || 365
      })
    });
    closeCreateModal();
    loadLicenses();
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate';
  }
});

/* ── Helpers ── */

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

loadLicenses();
