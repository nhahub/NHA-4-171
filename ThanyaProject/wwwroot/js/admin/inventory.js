/* ============================================================
   CarSparePartSys — Admin Inventory & Stock Logic
   ============================================================ */

let filterState = { search: '', warehouseId: '', page: 1, pageSize: 8 };

document.addEventListener('DOMContentLoaded', () => {
  const addIcon = document.getElementById('add-icon');
  if (addIcon) addIcon.innerHTML = UI.Icons.plus;

  document.getElementById('inventory-search')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('inventory-search').value.trim();
    filterState.page = 1;
    loadInventory();
  }, 350));

  document.getElementById('inventory-warehouse-filter')?.addEventListener('change', (e) => {
    filterState.warehouseId = e.target.value;
    filterState.page = 1;
    loadInventory();
  });

  loadWarehouses().then(() => {
    loadInventory();
    loadTransactions();
  });
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

// ================================================================
//  WAREHOUSE CRUD
// ================================================================

async function loadWarehouses() {
  const tbody = document.getElementById('warehouses-list');
  const filter = document.getElementById('inventory-warehouse-filter');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text--center">${UI.Icons.gear} Loading...</td></tr>`;

  try {
    const list = await AdminAPI.Warehouses.getAll();
    
    // Populate filter dropdown
    if (filter) {
      filter.innerHTML = '<option value="">All Warehouses</option>';
      list.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.warehouseId;
        opt.textContent = w.warehouseName;
        filter.appendChild(opt);
      });
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text--center text--muted" style="padding:var(--space-4)">No warehouses found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(w => `
      <tr>
        <td>${w.warehouseId}</td>
        <td><strong>${w.warehouseName}</strong></td>
        <td><span class="text--sm text--muted">${w.location || '—'}</span></td>
        <td>${w.isActive ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--error">No</span>'}</td>
        <td class="admin-table-actions">
          <button class="btn btn--icon btn--ghost" onclick="openWarehouseDrawer(${w.warehouseId})" title="Edit">${UI.Icons.edit}</button>
        </td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="text--danger text--center">Failed to load warehouses.</td></tr>`;
  }
}

window.openWarehouseDrawer = async function(id = null) {
  const backdrop = document.getElementById('warehouse-drawer-backdrop');
  const title = document.getElementById('wh-drawer-title');
  const form = document.getElementById('warehouse-edit-form');

  form.reset();
  document.getElementById('warehouse-id-input').value = '';

  if (id) {
    title.textContent = 'Edit Warehouse';
    try {
      const list = await AdminAPI.Warehouses.getAll();
      const w = list.find(x => x.warehouseId === id);
      if (w) {
        document.getElementById('warehouse-id-input').value = w.warehouseId;
        document.getElementById('warehouse-name').value = w.warehouseName;
        document.getElementById('warehouse-location').value = w.location || '';
        document.getElementById('warehouse-active').checked = w.isActive;
      }
    } catch {
      UI.showToast('Failed to load warehouse details.', 'error');
      return;
    }
  } else {
    title.textContent = 'Add Warehouse';
  }

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeWarehouseDrawer = function(e) {
  if (e && e.target !== document.getElementById('warehouse-drawer-backdrop')) return;
  const backdrop = document.getElementById('warehouse-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveWarehouse = async function() {
  const form = document.getElementById('warehouse-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-warehouse-btn');
  btn.classList.add('is-loading');

  const id = document.getElementById('warehouse-id-input').value;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.isActive = document.getElementById('warehouse-active').checked;

  try {
    if (id) {
      await AdminAPI.Warehouses.update(id, data);
      UI.showToast('Warehouse updated!', 'success');
    } else {
      await AdminAPI.Warehouses.create(data);
      UI.showToast('Warehouse created!', 'success');
    }
    closeWarehouseDrawer();
    loadWarehouses();
    loadInventory();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

// ================================================================
//  INVENTORY LIST
// ================================================================

async function loadInventory() {
  const tbody = document.getElementById('inventory-list');
  if (!tbody) return;

  tbody.innerHTML = Array(4).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Inventory.getAll(
      filterState.search,
      filterState.warehouseId,
      filterState.page,
      filterState.pageSize
    );

    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text--center text--muted" style="padding:var(--space-6)">No inventory entries.</td></tr>`;
      document.getElementById('inventory-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(inv => {
      const stock = inv.quantityInStock;
      const reorder = inv.reorderLevel;
      
      let statusBadge = '<span class="badge badge--success">Good</span>';
      if (stock === 0) {
        statusBadge = '<span class="badge badge--error">Out of Stock</span>';
      } else if (stock <= reorder / 2) {
        statusBadge = '<span class="badge badge--error">Critical</span>';
      } else if (stock <= reorder) {
        statusBadge = '<span class="badge badge--warning">Low Stock</span>';
      }

      return `
        <tr>
          <td>${inv.inventoryId}</td>
          <td><strong>${inv.product?.productName || 'Product #' + inv.productId}</strong></td>
          <td><code>${inv.product?.sku || '—'}</code></td>
          <td>${inv.warehouse?.warehouseName || '—'}</td>
          <td style="font-weight:bold">${stock}</td>
          <td>${reorder}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn--outline btn--sm" onclick="openAdjustmentModal(${inv.productId}, ${inv.warehouseId})">
              Adjust
            </button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text--danger text--center">Failed to load inventory levels.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('inventory-pagination');
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
  loadInventory();
};

// ================================================================
//  STOCK TRANSACTION LOGS
// ================================================================

async function loadTransactions() {
  const tbody = document.getElementById('transactions-list');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text--center text--muted">Loading logs...</td></tr>`;

  try {
    const list = await AdminAPI.Inventory.getTransactions();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text--center text--muted">No transactions logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.slice(0, 8).map(t => {
      const qtySign = t.quantity >= 0 ? `+${t.quantity}` : `${t.quantity}`;
      const qtyClass = t.quantity >= 0 ? 'text--accent' : 'text--danger';
      const time = new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td><span class="text--xs text--muted">${time}</span></td>
          <td style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>${t.product?.productName || 'Product'}</strong></td>
          <td>${t.warehouse?.warehouseName || 'Warehouse'}</td>
          <td><span class="${qtyClass} text--bold">${qtySign}</span></td>
          <td><span class="text--xs text--muted">${t.transactionType}</span></td>
        </tr>
      `;
    }).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="text--danger text--center">Failed to load transaction log.</td></tr>`;
  }
}

// ================================================================
//  QUICK STOCK ADJUSTMENT MODAL
// ================================================================

window.openAdjustmentModal = async function(preselectProductId = null, preselectWarehouseId = null) {
  const productsResult = await AdminAPI.Products.getAll('', '', '', 1, 100);
  const products = productsResult?.items || [];
  const warehouses = await AdminAPI.Warehouses.getAll();

  UI.openModal({
    title: 'Quick Stock Adjustment',
    content: `
      <form id="adjustment-form" style="display:flex; flex-direction:column; gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label form-label--required">Select Product</label>
          <select class="form-select" name="productId" id="adjust-prod-id" required>
            ${products.map(p => `<option value="${p.productId}" ${p.productId === preselectProductId ? 'selected' : ''}>${p.productName} (${p.sku})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label form-label--required">Warehouse Location</label>
          <select class="form-select" name="warehouseId" id="adjust-wh-id" required>
            ${warehouses.map(w => `<option value="${w.warehouseId}" ${w.warehouseId === preselectWarehouseId ? 'selected' : ''}>${w.warehouseName}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label form-label--required">Adjustment Quantity</label>
            <input type="number" class="form-input" name="quantity" id="adjust-qty" placeholder="e.g. 50 or -20" required />
          </div>
          <div class="form-group">
            <label class="form-label form-label--required">Transaction Type</label>
            <select class="form-select" name="transactionType" required>
              <option value="Stock Received">Stock Received (+)</option>
              <option value="Adjustment">Manual Adjustment</option>
              <option value="Lost">Lost/Damaged (-)</option>
              <option value="Sale">Sale Fulfillment (-)</option>
            </select>
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn--primary" id="submit-adjust-btn" onclick="submitAdjustment()">Apply Adjustment</button>
    `,
  });
};

window.submitAdjustment = async function() {
  const form = document.getElementById('adjustment-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('submit-adjust-btn');
  btn.classList.add('is-loading');

  const pId = parseInt(document.getElementById('adjust-prod-id').value, 10);
  const wId = parseInt(document.getElementById('adjust-wh-id').value, 10);
  const qty = parseInt(document.getElementById('adjust-qty').value, 10);
  const type = form.querySelector('[name="transactionType"]').value;

  try {
    await AdminAPI.Inventory.updateStock(pId, wId, qty, type);
    UI.showToast('Stock levels adjusted!', 'success');
    UI.closeModal();
    loadInventory();
    loadTransactions();
  } catch (err) {
    UI.handleApiError(err);
  }
};
