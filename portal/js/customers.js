requireAuth();

let currentCustomerId = null;

/* ── List ── */

async function loadCustomers() {
  const tbody = document.getElementById('customersBody');
  try {
    const { customers } = await apiFetch('/admin/customers');
    document.getElementById('customerCount').textContent = `Customers (${customers.length})`;
    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No customers yet.</td></tr>';
      return;
    }
    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>${c.id}</td>
        <td><button class="link-btn" onclick="showDetail(${c.id})">${esc(c.name)}</button></td>
        <td>${esc(c.contact_email || '—')}</td>
        <td>${esc(c.contact_phone || '—')}</td>
        <td>${formatDate(c.created_at)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="showDetail(${c.id})">View</button></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loader" style="color:var(--danger)">${err.message}</td></tr>`;
  }
}

/* ── Detail ── */

async function showDetail(id) {
  currentCustomerId = id;
  document.getElementById('listView').classList.add('hidden');
  document.getElementById('detailView').classList.remove('hidden');

  const grid = document.getElementById('detailGrid');
  const licensesBody = document.getElementById('customerLicensesBody');
  grid.innerHTML = '<div class="loader" style="grid-column:1/-1">Loading…</div>';
  licensesBody.innerHTML = '<tr><td colspan="5" class="loader">Loading…</td></tr>';

  try {
    const { customer } = await apiFetch(`/admin/customers/${id}`);
    document.getElementById('detailName').textContent = customer.name;
    grid.innerHTML = `
      <div class="detail-item"><div class="dt">ID</div><div class="dd">${customer.id}</div></div>
      <div class="detail-item"><div class="dt">Name</div><div class="dd">${esc(customer.name)}</div></div>
      <div class="detail-item"><div class="dt">Email</div><div class="dd">${esc(customer.contact_email || '—')}</div></div>
      <div class="detail-item"><div class="dt">Phone</div><div class="dd">${esc(customer.contact_phone || '—')}</div></div>
      <div class="detail-item"><div class="dt">Created</div><div class="dd">${formatDate(customer.created_at)}</div></div>
    `;
  } catch (err) {
    grid.innerHTML = `<div class="error-msg" style="grid-column:1/-1">${err.message}</div>`;
  }

  try {
    const { licenses } = await apiFetch('/admin/licenses');
    const mine = licenses.filter(l => l.customer_id === id);
    if (!mine.length) {
      licensesBody.innerHTML = '<tr><td colspan="5" class="empty">No licenses for this customer.</td></tr>';
    } else {
      licensesBody.innerHTML = mine.map(l => `
        <tr>
          <td class="mono">${esc(l.license_key)}</td>
          <td>${esc(l.product_name)}</td>
          <td>${statusBadge(l.status)}</td>
          <td>${l.active_machine_count} / ${l.max_machines}</td>
          <td>${formatDate(l.expires_at)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    licensesBody.innerHTML = `<tr><td colspan="5" class="error-msg">${err.message}</td></tr>`;
  }

  document.getElementById('newLicenseForCustomerBtn').onclick = openLicenseModal;
}

function showList() {
  currentCustomerId = null;
  document.getElementById('detailView').classList.add('hidden');
  document.getElementById('listView').classList.remove('hidden');
  loadCustomers();
}

/* ── Create customer modal ── */

function openCreateModal() {
  document.getElementById('createForm').reset();
  document.getElementById('createError').textContent = '';
  document.getElementById('createModal').classList.remove('hidden');
  document.getElementById('cName').focus();
}

function closeCreateModal() {
  document.getElementById('createModal').classList.add('hidden');
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('createBtn');
  const errEl = document.getElementById('createError');
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Creating…';

  const body = { name: document.getElementById('cName').value.trim() };
  const email = document.getElementById('cEmail').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  if (email) body.contactEmail = email;
  if (phone) body.contactPhone = phone;

  try {
    await apiFetch('/admin/customers', { method: 'POST', body: JSON.stringify(body) });
    closeCreateModal();
    loadCustomers();
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create';
  }
});

/* ── Generate license modal ── */

function openLicenseModal() {
  document.getElementById('licenseForm').reset();
  document.getElementById('licenseError').textContent = '';
  document.getElementById('licenseModal').classList.remove('hidden');
  document.getElementById('lProduct').focus();
}

function closeLicenseModal() {
  document.getElementById('licenseModal').classList.add('hidden');
}

document.getElementById('licenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('licenseBtn');
  const errEl = document.getElementById('licenseError');
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    await apiFetch('/admin/licenses', {
      method: 'POST',
      body: JSON.stringify({
        customerId: currentCustomerId,
        productName: document.getElementById('lProduct').value.trim(),
        maxMachines: parseInt(document.getElementById('lMachines').value, 10) || 1,
        validDays: parseInt(document.getElementById('lDays').value, 10) || 365
      })
    });
    closeLicenseModal();
    showDetail(currentCustomerId);
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

loadCustomers();
