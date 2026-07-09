/* ============================================================
   CarSparePartSys — Admin Dashboard Logic
   Manage: Products, Categories, Suppliers, CarBrands/Models,
   Orders (status update), Coupons, Returns, Warehouses.
   ============================================================ */

let currentAdminSection = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  // Admin guard
  if (!Auth.requireAdmin()) return;

  // Inject sidebar icons
  const iconMap = ['barChart', 'package', 'grid', 'truck', 'gear', 'invoice', 'tag', 'returnIcon', 'warehouse'];
  document.querySelectorAll('.sidebar-icon').forEach((el, i) => {
    el.innerHTML = UI.Icons[iconMap[i]] || UI.Icons.gear;
  });

  loadAdminSection('dashboard');
});

function switchAdminSection(section, el) {
  currentAdminSection = section;
  document.querySelectorAll('.admin-sidebar__link').forEach(l => l.classList.remove('is-active'));
  if (el) el.classList.add('is-active');
  loadAdminSection(section);
}
window.switchAdminSection = switchAdminSection;

async function loadAdminSection(section) {
  const content = document.getElementById('admin-content');
  if (!content) return;

  UI.renderSkeletons(content, 'list', 3);

  try {
    switch (section) {
      case 'dashboard': await renderAdminDashboard(content); break;
      case 'products': await renderAdminProducts(content); break;
      case 'categories': await renderAdminCategories(content); break;
      case 'suppliers': await renderAdminSuppliers(content); break;
      case 'brands': await renderAdminBrands(content); break;
      case 'orders': await renderAdminOrders(content); break;
      case 'coupons': await renderAdminCoupons(content); break;
      case 'returns': await renderAdminReturns(content); break;
      case 'warehouses': await renderAdminWarehouses(content); break;
      default: content.innerHTML = '<p>Section not found.</p>';
    }
  } catch (err) {
    content.innerHTML = `<div class="alert alert--error">${UI.Icons.close} Failed to load data: ${err.message}</div>`;
  }
}

// ================================================================
//  DASHBOARD OVERVIEW
// ================================================================
async function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="admin-content__header">
      <h1 class="admin-content__title">Dashboard</h1>
    </div>
    <div class="admin-stats" id="admin-stats">
      <div class="admin-stat-card"><div class="admin-stat-card__label">Total Products</div><div class="admin-stat-card__value" id="stat-total-products">—</div></div>
      <div class="admin-stat-card"><div class="admin-stat-card__label">Total Orders</div><div class="admin-stat-card__value" id="stat-total-orders">—</div></div>
      <div class="admin-stat-card"><div class="admin-stat-card__label">Categories</div><div class="admin-stat-card__value" id="stat-total-cats">—</div></div>
      <div class="admin-stat-card"><div class="admin-stat-card__label">Car Brands</div><div class="admin-stat-card__value" id="stat-total-brands">—</div></div>
    </div>
    <div class="card"><p class="text--muted text--center" style="padding:var(--space-8)">Welcome to the Admin Dashboard. Use the sidebar to manage your store.</p></div>`;

  // Load stats in parallel
  try {
    const [products, orders, categories, brands] = await Promise.allSettled([
      API.Products.getAll({ pageSize: 1 }),
      API.Orders.getAllAdmin({ pageSize: 1 }),
      API.Categories.getAll(),
      API.CarBrands.getAll(),
    ]);
    const setVal = (id, data) => { const el = document.getElementById(id); if (el) el.textContent = data?.totalCount || (Array.isArray(data) ? data.length : data?.items?.length) || '0'; };
    setVal('stat-total-products', products.value);
    setVal('stat-total-orders', orders.value);
    setVal('stat-total-cats', categories.value);
    setVal('stat-total-brands', brands.value);
  } catch {}
}

// ================================================================
//  ADMIN PRODUCTS
// ================================================================
async function renderAdminProducts(container) {
  const data = await API.Products.getAll({ pageSize: 50 });
  const products = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header">
      <h1 class="admin-content__title">Products</h1>
      <button class="btn btn--primary btn--sm" onclick="showProductModal()">${UI.Icons.plus} Add Product</button>
    </div>
    <div class="table-responsive">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Name</th><th>SKU</th><th>Price</th><th>Category</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.productId}</td>
              <td style="max-width:200px">${p.productName}</td>
              <td><code>${p.sku}</code></td>
              <td class="text--accent">${formatPrice(p.unitPrice)}</td>
              <td>${p.category?.categoryName || '—'}</td>
              <td>${p.isActive ? '<span class="badge badge--success">Active</span>' : '<span class="badge badge--error">Inactive</span>'}</td>
              <td class="admin-table-actions">
                <button class="btn btn--icon btn--ghost" title="Edit" onclick="showProductModal(${p.productId})">${UI.Icons.edit}</button>
                <button class="btn btn--icon btn--ghost" title="Delete" onclick="deleteProduct(${p.productId})">${UI.Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

window.showProductModal = function(id = null) {
  UI.openModal({
    title: id ? 'Edit Product' : 'Add Product',
    content: `
      <form id="product-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-group"><label class="form-label form-label--required">Product Name</label><input class="form-input" name="productName" required /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">SKU</label><input class="form-input" name="sku" required /></div>
          <div class="form-group"><label class="form-label">Part Number</label><input class="form-input" name="partNumber" /></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" name="description" rows="3"></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">Unit Price</label><input class="form-input" name="unitPrice" type="number" step="0.01" required /></div>
          <div class="form-group"><label class="form-label">Cost Price</label><input class="form-input" name="costPrice" type="number" step="0.01" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">Category ID</label><input class="form-input" name="categoryId" type="number" required /></div>
          <div class="form-group"><label class="form-label">Supplier ID</label><input class="form-input" name="supplierId" type="number" /></div>
        </div>
        <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" /></div>
        <div class="form-check"><input type="checkbox" name="isActive" checked /><label>Active</label></div>
      </form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveProduct(${id})">${id ? 'Update' : 'Create'}</button>`,
    wide: true,
  });
};

window.saveProduct = async function(id) {
  const form = document.getElementById('product-form');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.isActive = form.querySelector('[name="isActive"]').checked;
  data.unitPrice = parseFloat(data.unitPrice);
  data.costPrice = data.costPrice ? parseFloat(data.costPrice) : null;
  data.categoryId = parseInt(data.categoryId);
  data.supplierId = data.supplierId ? parseInt(data.supplierId) : null;

  try {
    if (id) await API.Products.update(id, data);
    else await API.Products.create(data);
    UI.closeModal();
    UI.showToast(id ? 'Product updated!' : 'Product created!', 'success');
    loadAdminSection('products');
  } catch (err) { UI.handleApiError(err); }
};

window.deleteProduct = async function(id) {
  if (!confirm('Delete this product?')) return;
  try { await API.Products.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('products'); }
  catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ADMIN CATEGORIES
// ================================================================
async function renderAdminCategories(container) {
  const data = await API.Categories.getAll();
  const cats = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header">
      <h1 class="admin-content__title">Categories</h1>
      <button class="btn btn--primary btn--sm" onclick="showCategoryModal()">${UI.Icons.plus} Add Category</button>
    </div>
    <div class="table-responsive">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Name</th><th>Parent</th><th>Actions</th></tr></thead>
        <tbody>
          ${cats.map(c => `
            <tr>
              <td>${c.categoryId}</td>
              <td>${c.categoryName}</td>
              <td>${c.parentCategory?.categoryName || c.parentCategoryId || '—'}</td>
              <td class="admin-table-actions">
                <button class="btn btn--icon btn--ghost" onclick="showCategoryModal(${c.categoryId})">${UI.Icons.edit}</button>
                <button class="btn btn--icon btn--ghost" onclick="deleteCategory(${c.categoryId})">${UI.Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

window.showCategoryModal = function(id = null) {
  UI.openModal({
    title: id ? 'Edit Category' : 'Add Category',
    content: `<form id="cat-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <div class="form-group"><label class="form-label form-label--required">Name</label><input class="form-input" name="categoryName" required /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" name="description" rows="2"></textarea></div>
      <div class="form-group"><label class="form-label">Parent Category ID</label><input class="form-input" name="parentCategoryId" type="number" /></div>
      <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" /></div>
    </form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveCategory(${id})">Save</button>`,
  });
};

window.saveCategory = async function(id) {
  const fd = new FormData(document.getElementById('cat-form'));
  const data = Object.fromEntries(fd.entries());
  data.parentCategoryId = data.parentCategoryId ? parseInt(data.parentCategoryId) : null;
  try {
    if (id) await API.Categories.update(id, data); else await API.Categories.create(data);
    UI.closeModal(); UI.showToast('Saved!', 'success'); loadAdminSection('categories');
  } catch (err) { UI.handleApiError(err); }
};

window.deleteCategory = async function(id) {
  if (!confirm('Delete?')) return;
  try { await API.Categories.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('categories'); }
  catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ADMIN SUPPLIERS
// ================================================================
async function renderAdminSuppliers(container) {
  const data = await API.Suppliers.getAll();
  const items = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Suppliers</h1>
      <button class="btn btn--primary btn--sm" onclick="showSupplierModal()">${UI.Icons.plus} Add Supplier</button>
    </div>
    <div class="table-responsive"><table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Email</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>${items.map(s => `<tr><td>${s.supplierId}</td><td>${s.supplierName}</td><td>${s.contactPerson || '—'}</td><td>${s.email || '—'}</td><td>${s.isActive ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--error">No</span>'}</td><td class="admin-table-actions"><button class="btn btn--icon btn--ghost" onclick="showSupplierModal(${s.supplierId})">${UI.Icons.edit}</button><button class="btn btn--icon btn--ghost" onclick="deleteSupplier(${s.supplierId})">${UI.Icons.trash}</button></td></tr>`).join('')}</tbody>
    </table></div>`;
}

window.showSupplierModal = function(id = null) {
  UI.openModal({ title: id ? 'Edit Supplier' : 'Add Supplier',
    content: `<form id="sup-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <div class="form-group"><label class="form-label form-label--required">Name</label><input class="form-input" name="supplierName" required /></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Contact Person</label><input class="form-input" name="contactPerson" /></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" name="email" type="email" /></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="phone" /></div><div class="form-group"><label class="form-label">Tax #</label><input class="form-input" name="taxNumber" /></div></div>
      <div class="form-group"><label class="form-label">Address</label><input class="form-input" name="address" /></div>
      <div class="form-check"><input type="checkbox" name="isActive" checked /><label>Active</label></div>
    </form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveSupplier(${id})">Save</button>`
  });
};

window.saveSupplier = async function(id) {
  const fd = new FormData(document.getElementById('sup-form'));
  const data = Object.fromEntries(fd.entries());
  data.isActive = document.querySelector('#sup-form [name="isActive"]').checked;
  try { if (id) await API.Suppliers.update(id, data); else await API.Suppliers.create(data);
    UI.closeModal(); UI.showToast('Saved!', 'success'); loadAdminSection('suppliers');
  } catch (err) { UI.handleApiError(err); }
};

window.deleteSupplier = async function(id) {
  if (!confirm('Delete?')) return;
  try { await API.Suppliers.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('suppliers'); }
  catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ADMIN CAR BRANDS
// ================================================================
async function renderAdminBrands(container) {
  const data = await API.CarBrands.getAll();
  const items = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Car Brands & Models</h1>
      <button class="btn btn--primary btn--sm" onclick="showBrandModal()">${UI.Icons.plus} Add Brand</button>
    </div>
    ${items.map(b => `
    <div class="card" style="margin-bottom:var(--space-4)">
      <div class="card__header">
        <h4>${b.brandName} <span class="text--muted text--sm">${b.country || ''}</span></h4>
        <div class="admin-table-actions">
          <button class="btn btn--icon btn--ghost" onclick="showBrandModal(${b.brandId})">${UI.Icons.edit}</button>
          <button class="btn btn--icon btn--ghost" onclick="deleteBrand(${b.brandId})">${UI.Icons.trash}</button>
          <button class="btn btn--sm btn--outline" onclick="showModelModal(${b.brandId})">${UI.Icons.plus} Model</button>
        </div>
      </div>
      ${b.models?.length > 0 ? `<div class="table-responsive"><table class="data-table"><thead><tr><th>Model</th><th>Years</th><th>Engine</th><th>Actions</th></tr></thead><tbody>${b.models.map(m => `<tr><td>${m.modelName}</td><td>${m.yearStart}${m.yearEnd ? '–' + m.yearEnd : '+'}</td><td>${m.engineType || '—'}</td><td class="admin-table-actions"><button class="btn btn--icon btn--ghost" onclick="deleteModel(${m.modelId})">${UI.Icons.trash}</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="text--muted text--sm">No models yet.</p>'}
    </div>`).join('')}`;
}

window.showBrandModal = function(id = null) {
  UI.openModal({ title: id ? 'Edit Brand' : 'Add Brand',
    content: `<form id="brand-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <div class="form-group"><label class="form-label form-label--required">Brand Name</label><input class="form-input" name="brandName" required /></div>
      <div class="form-group"><label class="form-label">Country</label><input class="form-input" name="country" /></div>
      <div class="form-group"><label class="form-label">Logo URL</label><input class="form-input" name="logoUrl" /></div></form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveBrand(${id})">Save</button>`
  });
};

window.saveBrand = async function(id) {
  const fd = new FormData(document.getElementById('brand-form')); const data = Object.fromEntries(fd.entries());
  try { if (id) await API.CarBrands.update(id, data); else await API.CarBrands.create(data);
    UI.closeModal(); UI.showToast('Saved!', 'success'); loadAdminSection('brands');
  } catch (err) { UI.handleApiError(err); }
};
window.deleteBrand = async function(id) { if (!confirm('Delete?')) return; try { await API.CarBrands.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('brands'); } catch (err) { UI.handleApiError(err); } };

window.showModelModal = function(brandId) {
  UI.openModal({ title: 'Add Model',
    content: `<form id="model-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <input type="hidden" name="brandId" value="${brandId}" />
      <div class="form-group"><label class="form-label form-label--required">Model Name</label><input class="form-input" name="modelName" required /></div>
      <div class="form-row"><div class="form-group"><label class="form-label form-label--required">Year Start</label><input class="form-input" name="yearStart" type="number" required /></div><div class="form-group"><label class="form-label">Year End</label><input class="form-input" name="yearEnd" type="number" /></div></div>
      <div class="form-group"><label class="form-label">Engine Type</label><input class="form-input" name="engineType" /></div></form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveModel()">Save</button>`
  });
};
window.saveModel = async function() {
  const fd = new FormData(document.getElementById('model-form')); const data = Object.fromEntries(fd.entries());
  data.brandId = parseInt(data.brandId); data.yearStart = parseInt(data.yearStart); data.yearEnd = data.yearEnd ? parseInt(data.yearEnd) : null;
  try { await API.CarModels.create(data); UI.closeModal(); UI.showToast('Model added!', 'success'); loadAdminSection('brands'); } catch (err) { UI.handleApiError(err); }
};
window.deleteModel = async function(id) { if (!confirm('Delete?')) return; try { await API.CarModels.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('brands'); } catch (err) { UI.handleApiError(err); } };

// ================================================================
//  ADMIN ORDERS
// ================================================================
async function renderAdminOrders(container) {
  const [ordersData, statusData] = await Promise.all([
    API.Orders.getAllAdmin(),
    API.OrderStatuses.getAll(),
  ]);
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.items || [];
  const statuses = Array.isArray(statusData) ? statusData : statusData?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Orders</h1></div>
    <div class="table-responsive"><table class="data-table">
      <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td><strong>${o.orderNumber}</strong></td>
        <td>${o.customer?.firstName || ''} ${o.customer?.lastName || ''}</td>
        <td>${new Date(o.orderDate).toLocaleDateString()}</td>
        <td class="text--accent">${formatPrice(o.totalAmount)}</td>
        <td>${o.isPaid ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--warning">No</span>'}</td>
        <td>
          <select class="form-select" style="min-width:130px;padding:4px 8px;height:32px;font-size:12px" onchange="updateOrderStatus(${o.orderId}, this.value)">
            ${statuses.map(s => `<option value="${s.statusId}" ${s.statusId === o.statusId ? 'selected' : ''}>${s.statusName}</option>`).join('')}
          </select>
        </td>
        <td><a href="/product-details.html" class="btn btn--ghost btn--sm">${UI.Icons.eye}</a></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

window.updateOrderStatus = async function(orderId, statusId) {
  try { await API.Orders.updateStatus(orderId, parseInt(statusId)); UI.showToast('Status updated!', 'success'); }
  catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ADMIN COUPONS
// ================================================================
async function renderAdminCoupons(container) {
  const data = await API.Coupons.getAll();
  const items = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Coupons</h1>
      <button class="btn btn--primary btn--sm" onclick="showCouponModal()">${UI.Icons.plus} Add Coupon</button>
    </div>
    <div class="table-responsive"><table class="data-table">
      <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Valid</th><th>Used</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>${items.map(c => `<tr>
        <td><code>${c.code}</code></td>
        <td>${c.discountType === 0 ? 'Percentage' : 'Fixed'}</td>
        <td>${c.discountType === 0 ? c.discountValue + '%' : formatPrice(c.discountValue)}</td>
        <td>${c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—'}</td>
        <td class="text--xs">${new Date(c.startDate).toLocaleDateString()} – ${new Date(c.endDate).toLocaleDateString()}</td>
        <td>${c.usedCount}${c.usageLimit ? '/' + c.usageLimit : ''}</td>
        <td>${c.isActive ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--error">No</span>'}</td>
        <td class="admin-table-actions"><button class="btn btn--icon btn--ghost" onclick="deleteCoupon(${c.couponId})">${UI.Icons.trash}</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

window.showCouponModal = function() {
  UI.openModal({ title: 'Add Coupon',
    content: `<form id="coupon-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <div class="form-group"><label class="form-label form-label--required">Code</label><input class="form-input" name="code" required style="text-transform:uppercase" /></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Type</label><select class="form-select" name="discountType"><option value="0">Percentage</option><option value="1">Fixed Amount</option></select></div><div class="form-group"><label class="form-label form-label--required">Value</label><input class="form-input" name="discountValue" type="number" step="0.01" required /></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Min Order</label><input class="form-input" name="minOrderAmount" type="number" step="0.01" /></div><div class="form-group"><label class="form-label">Max Discount</label><input class="form-input" name="maxDiscountAmount" type="number" step="0.01" /></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label form-label--required">Start Date</label><input class="form-input" name="startDate" type="date" required /></div><div class="form-group"><label class="form-label form-label--required">End Date</label><input class="form-input" name="endDate" type="date" required /></div></div>
      <div class="form-group"><label class="form-label">Usage Limit</label><input class="form-input" name="usageLimit" type="number" /></div>
      <div class="form-check"><input type="checkbox" name="isActive" checked /><label>Active</label></div></form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveCoupon()">Create</button>`
  });
};
window.saveCoupon = async function() {
  const fd = new FormData(document.getElementById('coupon-form')); const data = Object.fromEntries(fd.entries());
  data.discountType = parseInt(data.discountType); data.discountValue = parseFloat(data.discountValue);
  data.minOrderAmount = data.minOrderAmount ? parseFloat(data.minOrderAmount) : null;
  data.maxDiscountAmount = data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null;
  data.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
  data.isActive = document.querySelector('#coupon-form [name="isActive"]').checked;
  try { await API.Coupons.create(data); UI.closeModal(); UI.showToast('Coupon created!', 'success'); loadAdminSection('coupons'); } catch (err) { UI.handleApiError(err); }
};
window.deleteCoupon = async function(id) { if (!confirm('Delete?')) return; try { await API.Coupons.delete(id); UI.showToast('Deleted.', 'success'); loadAdminSection('coupons'); } catch (err) { UI.handleApiError(err); } };

// ================================================================
//  ADMIN RETURNS
// ================================================================
async function renderAdminReturns(container) {
  const data = await API.Returns.getAllAdmin();
  const items = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Return Requests</h1></div>
    <div class="table-responsive"><table class="data-table">
      <thead><tr><th>ID</th><th>User</th><th>Product</th><th>Qty</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${items.map(r => `<tr>
        <td>#${r.returnId}</td>
        <td>${r.user?.firstName || ''} ${r.user?.lastName || ''}</td>
        <td>${r.orderDetail?.product?.productName || '—'}</td>
        <td>${r.quantity}</td>
        <td class="text--sm">${r.reason}</td>
        <td>
          <select class="form-select" style="min-width:110px;padding:4px 8px;height:32px;font-size:12px" onchange="updateReturnStatus(${r.returnId}, this.value)">
            <option value="Requested" ${r.status === 'Requested' ? 'selected' : ''}>Requested</option>
            <option value="Approved" ${r.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Rejected" ${r.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            <option value="Refunded" ${r.status === 'Refunded' ? 'selected' : ''}>Refunded</option>
          </select>
        </td>
        <td><span class="text--xs text--muted">${new Date(r.requestDate).toLocaleDateString()}</span></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

window.updateReturnStatus = async function(id, status) {
  try { await API.Returns.updateStatus(id, { status }); UI.showToast('Status updated!', 'success'); }
  catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ADMIN WAREHOUSES
// ================================================================
async function renderAdminWarehouses(container) {
  const data = await API.Warehouses.getAll();
  const items = Array.isArray(data) ? data : data?.items || [];

  container.innerHTML = `
    <div class="admin-content__header"><h1 class="admin-content__title">Warehouses</h1>
      <button class="btn btn--primary btn--sm" onclick="showWarehouseModal()">${UI.Icons.plus} Add Warehouse</button>
    </div>
    <div class="table-responsive"><table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>${items.map(w => `<tr>
        <td>${w.warehouseId}</td><td>${w.warehouseName}</td><td>${w.location || '—'}</td>
        <td>${w.isActive ? '<span class="badge badge--success">Yes</span>' : '<span class="badge badge--error">No</span>'}</td>
        <td class="admin-table-actions"><button class="btn btn--icon btn--ghost" onclick="showWarehouseModal(${w.warehouseId})">${UI.Icons.edit}</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

window.showWarehouseModal = function(id = null) {
  UI.openModal({ title: id ? 'Edit Warehouse' : 'Add Warehouse',
    content: `<form id="wh-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
      <div class="form-group"><label class="form-label form-label--required">Name</label><input class="form-input" name="warehouseName" required /></div>
      <div class="form-group"><label class="form-label">Location</label><input class="form-input" name="location" /></div>
      <div class="form-check"><input type="checkbox" name="isActive" checked /><label>Active</label></div></form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveWarehouse(${id})">Save</button>`
  });
};
window.saveWarehouse = async function(id) {
  const fd = new FormData(document.getElementById('wh-form')); const data = Object.fromEntries(fd.entries());
  data.isActive = document.querySelector('#wh-form [name="isActive"]').checked;
  try { if (id) await API.Warehouses.update(id, data); else await API.Warehouses.create(data);
    UI.closeModal(); UI.showToast('Saved!', 'success'); loadAdminSection('warehouses');
  } catch (err) { UI.handleApiError(err); }
};
