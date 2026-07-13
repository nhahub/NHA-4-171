/* ============================================================
   CarSparePartSys — Admin Suppliers Logic
   ============================================================ */

let filterState = { search: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  const addIcon = document.getElementById('add-icon');
  if (addIcon) addIcon.innerHTML = UI.Icons.plus;

  document.getElementById('suppliers-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('suppliers-search-input').value.trim();
    filterState.page = 1;
    loadSuppliers();
  }, 350));

  loadSuppliers();
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

async function loadSuppliers() {
  const tbody = document.getElementById('suppliers-list');
  if (!tbody) return;

  tbody.innerHTML = Array(4).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:110px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Suppliers.getAll(filterState.search, filterState.page, filterState.pageSize);
    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text--center text--muted" style="padding:var(--space-8)">No suppliers found.</td></tr>`;
      document.getElementById('suppliers-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map((s, idx) => {
      const seqNum = (filterState.page - 1) * filterState.pageSize + idx + 1;
      return `
        <tr>
          <td>${seqNum}</td>
          <td><strong>${s.supplierName}</strong></td>
          <td>${s.contactPerson || '—'}</td>
          <td>${s.email || '—'}</td>
          <td>${s.phone || '—'}</td>
          <td><code>${s.taxNumber || '—'}</code></td>
          <td>${s.isActive ? '<span class="badge badge--success">Active</span>' : '<span class="badge badge--error">Inactive</span>'}</td>
          <td class="admin-table-actions">
            <button class="btn btn--icon btn--ghost" onclick="openSupplierDrawer(${s.supplierId})" title="Edit">${UI.Icons.edit}</button>
            <button class="btn btn--icon btn--ghost" onclick="deleteSupplier(${s.supplierId})" title="Delete">${UI.Icons.trash}</button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text--center text--danger" style="padding:var(--space-8)">Failed to load suppliers.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('suppliers-pagination');
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
  loadSuppliers();
};

window.resetFilters = function() {
  document.getElementById('suppliers-search-input').value = '';
  filterState = { ...filterState, search: '', page: 1 };
  loadSuppliers();
};

// ================================================================
//  DRAWER WORKSPACE
// ================================================================

window.openSupplierDrawer = async function(id = null) {
  const backdrop = document.getElementById('supplier-drawer-backdrop');
  const title = document.getElementById('drawer-title');
  const form = document.getElementById('supplier-edit-form');

  form.reset();
  document.getElementById('supplier-id-input').value = '';

  if (id) {
    title.textContent = 'Edit Supplier';
    try {
      // Find directly in our mock db list
      const res = await AdminAPI.Suppliers.getAll('', 1, 100);
      const s = res?.items.find(x => x.supplierId === id);
      if (s) {
        document.getElementById('supplier-id-input').value = s.supplierId;
        document.getElementById('supplier-name').value = s.supplierName;
        document.getElementById('supplier-contact').value = s.contactPerson || '';
        document.getElementById('supplier-email').value = s.email || '';
        document.getElementById('supplier-phone').value = s.phone || '';
        document.getElementById('supplier-tax').value = s.taxNumber || '';
        document.getElementById('supplier-address').value = s.address || '';
        document.getElementById('supplier-active').checked = s.isActive;
      }
    } catch {
      UI.showToast('Failed to load supplier details.', 'error');
      return;
    }
  } else {
    title.textContent = 'Add Supplier';
  }

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeSupplierDrawer = function(e) {
  if (e && e.target !== document.getElementById('supplier-drawer-backdrop')) return;
  const backdrop = document.getElementById('supplier-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveSupplier = async function() {
  const form = document.getElementById('supplier-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-supplier-btn');
  btn.classList.add('is-loading');

  const id = document.getElementById('supplier-id-input').value;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.isActive = document.getElementById('supplier-active').checked;

  try {
    if (id) {
      await AdminAPI.Suppliers.update(id, data);
      UI.showToast('Supplier updated!', 'success');
    } else {
      await AdminAPI.Suppliers.create(data);
      UI.showToast('Supplier added!', 'success');
    }
    closeSupplierDrawer();
    loadSuppliers();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteSupplier = function(id) {
  showConfirmModal('Delete Supplier', 'Are you sure you want to delete this supplier? This action cannot be undone.', async () => {
    await AdminAPI.Suppliers.delete(id);
    UI.showToast('Supplier deleted.', 'success');
    loadSuppliers();
  });
};
