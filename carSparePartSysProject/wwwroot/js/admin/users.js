/* ============================================================
   CarSparePartSys — Admin Users Moderation Logic
   ============================================================ */

let filterState = { search: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('users-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('users-search-input').value.trim();
    filterState.page = 1;
    loadUsers();
  }, 350));

  loadUsers();
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadUsers() {
  const tbody = document.getElementById('users-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:95px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Users.getAll(filterState.search, filterState.page, filterState.pageSize);
    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text--center" style="padding:var(--space-8)">
            <div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3)">
              <span style="font-size:2rem">👥</span>
              <p class="text--muted">${filterState.search ? 'No users match your search.' : 'No users found. The Users API endpoint may not be implemented yet.'}</p>
            </div>
          </td>
        </tr>`;
      const pag = document.getElementById('users-pagination');
      if (pag) pag.innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map((u, idx) => {
      const activeBadge = u.isActive 
        ? '<span class="badge badge--success">Active</span>' 
        : '<span class="badge badge--error">Deactivated</span>';

      const toggleText = u.isActive ? 'Deactivate' : 'Activate';
      const toggleClass = u.isActive ? 'btn--danger' : 'btn--primary';

      const seqNum = (filterState.page - 1) * filterState.pageSize + idx + 1;

      return `
        <tr>
          <td>${seqNum}</td>
          <td><strong>${u.firstName || ''} ${u.lastName || ''}</strong></td>
          <td><code>${u.username || '—'}</code></td>
          <td>${u.email || '—'}</td>
          <td>${u.phone || '—'}</td>
          <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
          <td>
            <select class="form-select" style="padding:4px 8px; height:32px; font-size:12px; min-width:110px;" onchange="changeUserRole(${u.userId}, this.value)">
              <option value="Customer" ${u.role === 'Customer' ? 'selected' : ''}>Customer</option>
              <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin</option>
            </select>
          </td>
          <td>${activeBadge}</td>
          <td>
            <button class="btn btn--sm ${toggleClass}" style="padding: 4px 10px; font-size:11px;" onclick="toggleUserActive(${u.userId})">
              ${toggleText}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text--center text--danger" style="padding:var(--space-8)">Failed to load users directory. ${err?.message || ''}</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('users-pagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="pagination__btn" ${filterState.page <= 1 ? 'disabled' : ''} onclick="changePage(${filterState.page - 1})">${UI.Icons.chevronLeft}</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination__btn ${i === filterState.page ? 'is-active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  html += `<button class="pagination__btn" ${filterState.page >= totalPages ? 'disabled' : ''} onclick="changePage(${filterState.page + 1})">${UI.Icons.chevronRight}</button>`;
  container.innerHTML = html;
}

window.changePage = function(page) {
  filterState.page = page;
  loadUsers();
};

window.resetFilters = function() {
  document.getElementById('users-search-input').value = '';
  filterState = { ...filterState, search: '', page: 1 };
  loadUsers();
};

// ================================================================
//  MODERATE CONTROLS MAPPING
// ================================================================

window.changeUserRole = async function(id, newRole) {
  try {
    await AdminAPI.Users.updateRole(id, newRole);
    UI.showToast(`User role updated to ${newRole}!`, 'success');
    loadUsers();
  } catch (err) {
    UI.handleApiError(err);
  }
};

window.toggleUserActive = async function(id) {
  try {
    await AdminAPI.Users.toggleActive(id);
    UI.showToast('User account status toggled!', 'success');
    loadUsers();
  } catch (err) {
    UI.handleApiError(err);
  }
};
