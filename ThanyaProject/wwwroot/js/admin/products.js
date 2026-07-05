/* ============================================================
   CarSparePartSys — Admin Products Logic
   ============================================================ */

let filterState = { search: '', categoryId: '', supplierId: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  const addIcon = document.getElementById('add-icon');
  if (addIcon) addIcon.innerHTML = UI.Icons.plus;

  // Event Listeners for Filters
  document.getElementById('products-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('products-search-input').value.trim();
    filterState.page = 1;
    loadProducts();
  }, 350));

  document.getElementById('filter-category-select')?.addEventListener('change', (e) => {
    filterState.categoryId = e.target.value;
    filterState.page = 1;
    loadProducts();
  });

  document.getElementById('filter-supplier-select')?.addEventListener('change', (e) => {
    filterState.supplierId = e.target.value;
    filterState.page = 1;
    loadProducts();
  });

  // Pre-load reference lists, then query products
  initializeDropdowns().then(() => {
    loadProducts();
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

async function initializeDropdowns() {
  try {
    const [cats, sups] = await Promise.all([
      AdminAPI.Categories.getAll(),
      AdminAPI.Suppliers.getAll('', 1, 100),
    ]);

    const catList = Array.isArray(cats) ? cats : [];
    const supList = sups?.items || [];

    // Filter selectors
    const catFilter = document.getElementById('filter-category-select');
    const supFilter = document.getElementById('filter-supplier-select');

    // Drawer form selectors
    const catForm = document.getElementById('product-category');
    const supForm = document.getElementById('product-supplier');

    // Clear and append options
    const populateSelect = (select, list, keyId, keyName, placeholder) => {
      if (!select) return;
      select.innerHTML = `<option value="">${placeholder}</option>`;
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[keyId];
        opt.textContent = item[keyName];
        select.appendChild(opt);
      });
    };

    populateSelect(catFilter, catList, 'categoryId', 'categoryName', 'All Categories');
    populateSelect(supFilter, supList, 'supplierId', 'supplierName', 'All Suppliers');
    populateSelect(catForm, catList, 'categoryId', 'categoryName', 'Select Category');
    populateSelect(supForm, supList, 'supplierId', 'supplierName', 'Select Supplier');
  } catch (err) {
    console.error('Error loading dropdown lists:', err);
  }
}

async function loadProducts() {
  const tbody = document.getElementById('products-list');
  if (!tbody) return;

  // Table Skeletons
  tbody.innerHTML = Array(5).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:30px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:40px; height:40px; border-radius:4px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Products.getAll(
      filterState.search,
      filterState.categoryId,
      filterState.supplierId,
      filterState.page,
      filterState.pageSize
    );

    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text--center text--muted" style="padding:var(--space-8)">No products found.</td></tr>`;
      document.getElementById('products-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(p => {
      const img = p.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Crect fill=%22%231C2333%22 width=%2240%22 height=%2240%22/%3E%3C/svg%3E';
      return `
        <tr>
          <td>${p.productId}</td>
          <td><img src="${img}" alt="" style="width:36px; height:36px; object-fit:cover; border-radius:4px; background:var(--bg-tertiary);" /></td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${p.productName}"><strong>${p.productName}</strong></td>
          <td><code>${p.sku}</code></td>
          <td>${p.partNumber || '—'}</td>
          <td class="text--accent text--bold">${formatPrice(p.unitPrice)}</td>
          <td>${p.category?.categoryName || '—'}</td>
          <td>${p.supplier?.supplierName || '—'}</td>
          <td>${p.isActive ? '<span class="badge badge--success">Active</span>' : '<span class="badge badge--error">Inactive</span>'}</td>
          <td class="admin-table-actions">
            <button class="btn btn--icon btn--ghost" onclick="openProductDrawer(${p.productId})" title="Edit">${UI.Icons.edit}</button>
            <button class="btn btn--icon btn--ghost" onclick="deleteProduct(${p.productId})" title="Delete">${UI.Icons.trash}</button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" class="text--center text--danger" style="padding:var(--space-8)">Failed to load products.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('products-pagination');
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
  loadProducts();
};

window.resetFilters = function() {
  document.getElementById('products-search-input').value = '';
  document.getElementById('filter-category-select').value = '';
  document.getElementById('filter-supplier-select').value = '';
  filterState = { ...filterState, search: '', categoryId: '', supplierId: '', page: 1 };
  loadProducts();
};

// ================================================================
//  PRODUCT DRAWER LOGIC
// ================================================================

window.openProductDrawer = async function(id = null) {
  const backdrop = document.getElementById('product-drawer-backdrop');
  const title = document.getElementById('drawer-title');
  const form = document.getElementById('product-edit-form');
  const container = document.getElementById('specs-rows-container');

  form.reset();
  container.innerHTML = '';
  document.getElementById('product-id-input').value = '';

  if (id) {
    title.textContent = 'Edit Product';
    try {
      const p = await AdminAPI.Products.getById(id);
      if (p) {
        document.getElementById('product-id-input').value = p.productId;
        document.getElementById('product-name').value = p.productName;
        document.getElementById('product-sku').value = p.sku;
        document.getElementById('product-part-no').value = p.partNumber || '';
        document.getElementById('product-desc').value = p.description || '';
        document.getElementById('product-price').value = p.unitPrice;
        document.getElementById('product-cost').value = p.costPrice || '';
        document.getElementById('product-category').value = p.categoryId;
        document.getElementById('product-supplier').value = p.supplierId;
        document.getElementById('product-image-url').value = p.imageUrl || '';
        document.getElementById('product-active').checked = p.isActive;

        // Load specs
        if (p.specifications && p.specifications.length > 0) {
          p.specifications.forEach(s => addSpecRow(s.specName, s.specValue));
        }
      }
    } catch (err) {
      UI.showToast('Failed to load product details.', 'error');
      return;
    }
  } else {
    title.textContent = 'Add Product';
  }

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeProductDrawer = function(e) {
  if (e && e.target !== document.getElementById('product-drawer-backdrop')) return;
  const backdrop = document.getElementById('product-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

// ── Specifications dynamic rows ──
window.addSpecRow = function(name = '', value = '') {
  const container = document.getElementById('specs-rows-container');
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <input type="text" class="form-input" placeholder="Name (e.g. Thread)" value="${name}" required name="specName" />
    <input type="text" class="form-input" placeholder="Value (e.g. 14mm)" value="${value}" required name="specValue" />
    <button type="button" class="btn btn--icon btn--danger" onclick="this.closest('.dynamic-row').remove()" title="Delete row">
      ${UI.Icons.trash}
    </button>
  `;
  container.appendChild(row);
};

window.saveProduct = async function() {
  const form = document.getElementById('product-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-product-btn');
  btn.classList.add('is-loading');

  const id = document.getElementById('product-id-input').value;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  data.unitPrice = parseFloat(data.unitPrice);
  data.costPrice = data.costPrice ? parseFloat(data.costPrice) : null;
  data.categoryId = parseInt(data.categoryId, 10);
  data.supplierId = parseInt(data.supplierId, 10);
  data.isActive = document.getElementById('product-active').checked;

  // Gather specs key/value pairs
  const specNames = Array.from(document.querySelectorAll('#specs-rows-container input[name="specName"]')).map(el => el.value.trim());
  const specValues = Array.from(document.querySelectorAll('#specs-rows-container input[name="specValue"]')).map(el => el.value.trim());
  data.specifications = specNames.map((name, i) => ({ specName: name, specValue: specValues[i] })).filter(s => s.specName && s.specValue);

  try {
    if (id) {
      await AdminAPI.Products.update(id, data);
      UI.showToast('Product updated successfully!', 'success');
    } else {
      await AdminAPI.Products.create(data);
      UI.showToast('Product created successfully!', 'success');
    }
    closeProductDrawer();
    loadProducts();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteProduct = function(id) {
  showConfirmModal('Delete Product', 'Are you sure you want to permanently delete this product? All inventory entries linked to it will also be deleted.', async () => {
    await AdminAPI.Products.delete(id);
    UI.showToast('Product deleted.', 'success');
    loadProducts();
  });
};
