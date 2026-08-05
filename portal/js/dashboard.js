requireAuth();

async function loadStats() {
  const grid = document.getElementById('statsGrid');
  try {
    const { stats } = await apiFetch('/admin/stats');
    grid.innerHTML = `
      <div class="stat-card"><div class="s-label">Total Customers</div><div class="s-value blue">${stats.totalCustomers}</div></div>
      <div class="stat-card"><div class="s-label">Total Licenses</div><div class="s-value blue">${stats.totalLicenses}</div></div>
      <div class="stat-card"><div class="s-label">Active Licenses</div><div class="s-value green">${stats.activeLicenses}</div></div>
      <div class="stat-card"><div class="s-label">Suspended</div><div class="s-value amber">${stats.suspendedLicenses}</div></div>
      <div class="stat-card"><div class="s-label">Cancelled</div><div class="s-value red">${stats.cancelledLicenses}</div></div>
      <div class="stat-card"><div class="s-label">Active Activations</div><div class="s-value blue">${stats.activeActivations}</div></div>
    `;
  } catch (err) {
    grid.innerHTML = `<p class="error-msg" style="padding:.5rem">${err.message}</p>`;
  }
}

loadStats();
