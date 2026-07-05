/* ============================================================
   CarSparePartSys — Admin Orders Logic
   ============================================================ */

let filterState = { search: '', statusId: '', page: 1, pageSize: 10 };
let currentActiveOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Sync filters from URL query parameter (for direct links, e.g. from Dashboard)
  const params = new URLSearchParams(window.location.search);
  const searchParam = params.get('search');
  if (searchParam) {
    filterState.search = searchParam;
    const input = document.getElementById('orders-search-input');
    if (input) input.value = searchParam;
  }

  document.getElementById('orders-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('orders-search-input').value.trim();
    filterState.page = 1;
    loadOrders();
  }, 350));

  document.getElementById('filter-status-select')?.addEventListener('change', (e) => {
    filterState.statusId = e.target.value;
    filterState.page = 1;
    loadOrders();
  });

  loadOrders();
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

async function loadOrders() {
  const tbody = document.getElementById('orders-list');
  if (!tbody) return;

  tbody.innerHTML = Array(4).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:70px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:40px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Orders.getAllAdmin(
      filterState.search,
      filterState.statusId,
      filterState.page,
      filterState.pageSize
    );

    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text--center text--muted" style="padding:var(--space-8)">No orders found.</td></tr>`;
      document.getElementById('orders-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(o => {
      const isPaidBadge = o.isPaid 
        ? '<span class="badge badge--success">Paid</span>' 
        : '<span class="badge badge--warning">Unpaid</span>';
      
      let statusClass = 'accent';
      if (o.statusName === 'Delivered') statusClass = 'success';
      if (o.statusName === 'Cancelled') statusClass = 'error';
      const statusBadge = `<span class="badge badge--${statusClass}">${o.statusName || 'Processing'}</span>`;

      return `
        <tr>
          <td><strong>${o.orderNumber}</strong></td>
          <td>${o.customer?.firstName || 'User'} ${o.customer?.lastName || ''}</td>
          <td>${new Date(o.orderDate).toLocaleDateString()}</td>
          <td class="text--accent text--bold">${formatPrice(o.totalAmount)}</td>
          <td>${isPaidBadge}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn--icon btn--ghost" onclick="openOrderDrawer(${o.orderId})" title="View Details">
              ${UI.Icons.eye}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text--center text--danger" style="padding:var(--space-8)">Failed to load orders.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('orders-pagination');
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
  loadOrders();
};

window.resetFilters = function() {
  document.getElementById('orders-search-input').value = '';
  document.getElementById('filter-status-select').value = '';
  filterState = { ...filterState, search: '', statusId: '', page: 1 };
  loadOrders();
};

// ================================================================
//  ORDER DETAILS DRAWER
// ================================================================

window.openOrderDrawer = async function(id) {
  currentActiveOrderId = id;
  const backdrop = document.getElementById('order-drawer-backdrop');
  
  try {
    const res = await AdminAPI.Orders.getAllAdmin('', '', 1, 100);
    const order = res?.items.find(x => x.orderId === id);
    if (!order) throw new Error('Order not found');

    // Populate metadata
    document.getElementById('order-drawer-title').textContent = `Order ${order.orderNumber}`;
    document.getElementById('order-detail-no').textContent = order.orderNumber;
    document.getElementById('order-detail-date').textContent = new Date(order.orderDate).toLocaleString();
    document.getElementById('cust-name').textContent = `${order.customer?.firstName || 'User'} ${order.customer?.lastName || ''}`;
    document.getElementById('cust-email').textContent = order.customer?.email || '—';

    // Load items table
    const productsRes = await AdminAPI.Products.getAll('', '', '', 1, 100);
    const products = productsRes?.items || [];

    const itemsBody = document.getElementById('order-detail-items');
    itemsBody.innerHTML = order.orderDetails.map(item => {
      const p = products.find(prod => prod.productId === item.productId);
      const name = p ? p.productName : 'Product #' + item.productId;
      return `
        <tr>
          <td><span style="font-size:12px; font-weight:500;">${name}</span></td>
          <td>${item.quantity}</td>
          <td>${formatPrice(item.unitPrice)}</td>
          <td>${formatPrice(item.lineTotal)}</td>
        </tr>
      `;
    }).join('');

    // Summary calculations
    document.getElementById('order-subtotal').textContent = formatPrice(order.subTotal);
    document.getElementById('order-discount').textContent = `-${formatPrice(order.discountAmount)}`;
    document.getElementById('order-tax').textContent = formatPrice(order.taxAmount);
    document.getElementById('order-total').textContent = formatPrice(order.totalAmount);

    // Shipping form populate
    const s = order.shipping || {};
    document.getElementById('shipping-carrier').value = s.carrier || '';
    document.getElementById('shipping-tracking-no').value = s.trackingNumber || '';
    document.getElementById('shipping-est-date').value = s.estimatedDeliveryDate || '';

    // Status select value
    document.getElementById('order-status-update-select').value = order.statusId;

    // Show Drawer
    backdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    UI.showToast('Failed to load order detail drawer.', 'error');
  }
};

window.closeOrderDrawer = function(e) {
  if (e && e.target !== document.getElementById('order-drawer-backdrop')) return;
  const backdrop = document.getElementById('order-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

// ================================================================
//  MODERATIONS SUBMISSIONS
// ================================================================

window.submitStatusUpdate = async function() {
  if (!currentActiveOrderId) return;
  const select = document.getElementById('order-status-update-select');
  const statusId = parseInt(select.value, 10);
  const statusName = select.options[select.selectedIndex].text;

  try {
    await AdminAPI.Orders.updateStatus(currentActiveOrderId, statusId, statusName);
    UI.showToast('Order status updated!', 'success');
    loadOrders();
  } catch (err) {
    UI.handleApiError(err);
  }
};

window.submitShippingUpdate = async function(e) {
  e.preventDefault();
  if (!currentActiveOrderId) return;

  const form = e.target;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  try {
    await AdminAPI.Orders.updateShipping(currentActiveOrderId, data);
    UI.showToast('Shipping details saved successfully!', 'success');
    loadOrders();
  } catch (err) {
    UI.handleApiError(err);
  }
};
