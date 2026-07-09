/* ============================================================
   CarSparePartSys — Account Page Logic
   Tabbed dashboard: Profile, Addresses, Orders, Invoices,
   Returns, Wishlist, Reviews.
   ============================================================ */

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'addresses', label: 'Addresses', icon: 'mapPin' },
  { id: 'orders', label: 'Orders', icon: 'package' },
  { id: 'invoices', label: 'Invoices', icon: 'invoice' },
  { id: 'wishlist', label: 'Wishlist', icon: 'heart' },
  { id: 'reviews', label: 'My Reviews', icon: 'star' },
];

let activeTab = 'profile';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;

  document.getElementById('breadcrumb').innerHTML = UI.renderBreadcrumb([
    { label: 'Home', url: '/index.html' },
    { label: 'My Account' },
  ]);

  // Set active tab from URL
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (tabParam && TABS.find(t => t.id === tabParam)) {
    activeTab = tabParam;
  }

  // Render header
  const user = Auth.getUser();
  const header = document.getElementById('account-header');
  if (header && user) {
    header.innerHTML = `
      <h1 class="account-page__name">${user.firstName || ''} ${user.lastName || ''}</h1>
      <p class="account-page__email">${user.email || ''}</p>`;
  }

  renderTabs();
  loadTabContent(activeTab);
});

function renderTabs() {
  const list = document.getElementById('tabs-list');
  if (!list) return;

  list.innerHTML = TABS.map(tab => `
    <button class="tabs__item ${tab.id === activeTab ? 'is-active' : ''}" data-tab="${tab.id}" onclick="switchTab('${tab.id}')">
      <span style="width:18px;height:18px">${UI.Icons[tab.icon] || ''}</span>
      ${tab.label}
    </button>
  `).join('');
}

function switchTab(tabId) {
  activeTab = tabId;
  // Update active state
  document.querySelectorAll('.tabs__item').forEach(t => t.classList.remove('is-active'));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('is-active');
  // Update URL
  window.history.replaceState(null, '', `/account.html?tab=${tabId}`);
  loadTabContent(tabId);
}
window.switchTab = switchTab;

async function loadTabContent(tabId) {
  const content = document.getElementById('tab-content');
  if (!content) return;

  UI.renderSkeletons(content, 'list', 3);

  try {
    switch (tabId) {
      case 'profile': await renderProfile(content); break;
      case 'addresses': await renderAddresses(content); break;
      case 'orders': await renderOrders(content); break;
      case 'invoices': await renderInvoices(content); break;
      case 'returns': await renderReturns(content); break;
      case 'wishlist': await renderWishlist(content); break;
      case 'reviews': await renderReviews(content); break;
    }
  } catch (err) {
    content.innerHTML = `<div class="alert alert--error"><span class="alert__icon">${UI.Icons.close}</span>Failed to load data. Please try again.</div>`;
  }
}

// ================================================================
//  PROFILE TAB
// ================================================================
async function renderProfile(container) {
  let user = Auth.getUser();
  try {
    user = await API.Auth.getProfile();
    Auth.saveUser(user);
  } catch {}

  if (!user) { container.innerHTML = '<p class="text--muted">Unable to load profile.</p>'; return; }

  container.innerHTML = `
    <div class="card" style="max-width:600px">
      <h3 class="card__title" style="margin-bottom:var(--space-6)">Profile Information</h3>
      <form id="profile-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name</label><input class="form-input" name="firstName" value="${user.firstName || ''}" /></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" name="lastName" value="${user.lastName || ''}" /></div>
        </div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" name="email" value="${user.email || ''}" type="email" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="phone" value="${user.phone || ''}" type="tel" /></div>
        <div class="form-group"><label class="form-label">Username</label><input class="form-input" value="${user.username || ''}" disabled style="opacity:0.5" /></div>
        <div class="form-group"><label class="form-label">Member Since</label><input class="form-input" value="${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}" disabled style="opacity:0.5" /></div>
        <button type="submit" class="btn btn--primary" style="align-self:flex-start">Save Changes</button>
      </form>
    </div>`;

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await API.Auth.updateProfile(Object.fromEntries(fd.entries()));
      UI.showToast('Profile updated!', 'success');
    } catch (err) { UI.handleApiError(err); }
  });
}

// ================================================================
//  ADDRESSES TAB
// ================================================================
async function renderAddresses(container) {
  const data = await API.Addresses.getAll();
  const addresses = Array.isArray(data) ? data : data?.items || [];

  if (addresses.length === 0) {
    UI.renderEmptyState(container, 'addresses');
    container.innerHTML += `<div style="text-align:center;margin-top:var(--space-4)"><button class="btn btn--primary" onclick="showAddAddressModalAccount()">Add Address</button></div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6)">
      <h3>My Addresses</h3>
      <button class="btn btn--primary btn--sm" onclick="showAddAddressModalAccount()">${UI.Icons.plus} Add Address</button>
    </div>
    <div class="grid grid--2">
      ${addresses.map(a => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-3)">
            <strong>${a.fullName}</strong>
            <div style="display:flex;gap:var(--space-2)">
              ${a.isDefault ? '<span class="badge badge--default">Default</span>' : `<button class="btn btn--ghost btn--sm" onclick="setDefault(${a.addressId})">Set Default</button>`}
              <button class="btn btn--icon btn--ghost" onclick="deleteAddress(${a.addressId})" title="Delete">${UI.Icons.trash}</button>
            </div>
          </div>
          <p class="text--sm" style="color:var(--text-secondary)">${a.street}, ${a.city}${a.state ? ', ' + a.state : ''} ${a.postalCode || ''}<br/>${a.country}</p>
          <p class="text--xs text--muted" style="margin-top:var(--space-2)">${a.phone}</p>
        </div>
      `).join('')}
    </div>`;
}

window.showAddAddressModalAccount = function() {
  UI.openModal({
    title: 'Add New Address',
    content: `
      <form id="add-address-form-acc" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">Full Name</label><input class="form-input" name="fullName" required /></div>
          <div class="form-group"><label class="form-label form-label--required">Phone</label><input class="form-input" name="phone" required /></div>
        </div>
        <div class="form-group"><label class="form-label form-label--required">Street</label><input class="form-input" name="street" required /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">City</label><input class="form-input" name="city" required /></div>
          <div class="form-group"><label class="form-label">State</label><input class="form-input" name="state" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Postal Code</label><input class="form-input" name="postalCode" /></div>
          <div class="form-group"><label class="form-label form-label--required">Country</label><input class="form-input" name="country" required /></div>
        </div>
      </form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveAddressAccount()">Save</button>`,
  });
};

window.saveAddressAccount = async function() {
  const form = document.getElementById('add-address-form-acc');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.type = "Shipping";
  try {
    await API.Addresses.create(data);
    UI.closeModal();
    UI.showToast('Address added!', 'success');
    loadTabContent('addresses');
  } catch (err) { UI.handleApiError(err); }
};

window.setDefault = async function(id) {
  try {
    await API.Addresses.setDefault(id);
    UI.showToast('Default address updated.', 'success');
    loadTabContent('addresses');
  } catch (err) { UI.handleApiError(err); }
};

window.deleteAddress = async function(id) {
  if (!confirm('Are you sure you want to delete this address?')) return;
  try {
    await API.Addresses.delete(id);
    UI.showToast('Address deleted.', 'success');
    loadTabContent('addresses');
  } catch (err) { UI.handleApiError(err); }
};

// ================================================================
//  ORDERS TAB
// ================================================================
async function renderOrders(container) {
  const data = await API.Orders.getAll();
  const orders = Array.isArray(data) ? data : data?.items || [];

  if (orders.length === 0) {
    UI.renderEmptyState(container, 'orders');
    return;
  }

  container.innerHTML = `<h3 style="margin-bottom:var(--space-6)">Order History</h3>` +
    orders.map(o => `
    <div class="order-card">
      <div class="order-card__header" onclick="this.nextElementSibling.classList.toggle('is-active')">
        <div>
          <span class="order-card__number">${o.orderNumber}</span>
          <span class="order-card__date">${new Date(o.orderDate).toLocaleDateString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-3)">
        ${(() => {
            const rawStatus = o.statusName || o.status || 'Pending';
            let label = rawStatus;
            let badgeClass = 'accent';
            if (rawStatus === 'Pending') { label = 'Pending'; badgeClass = 'warning'; }
            else if (rawStatus === 'Processing') { label = 'Processing'; badgeClass = 'accent'; }
            else if (rawStatus === 'Shipped') { label = 'Shipped'; badgeClass = 'info'; }
            else if (rawStatus === 'Delivered') { label = 'Completed'; badgeClass = 'success'; }
            else if (rawStatus === 'Cancelled') { label = 'Cancelled'; badgeClass = 'error'; }
            return `<span class="badge badge--${badgeClass}">${label}</span>`;
          })()}
          ${o.isPaid ? '<span class="badge badge--success">Paid</span>' : '<span class="badge badge--warning">Unpaid</span>'}
          <span class="order-card__total">${formatPrice(o.totalAmount)}</span>
          <span style="width:16px;height:16px;color:var(--text-muted)">${UI.Icons.chevronDown}</span>
        </div>
      </div>
      <div class="order-card__body">
        <div class="table-responsive" style="margin-bottom:var(--space-4)">
          <table class="data-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
            <tbody>
              ${(o.orderDetails || []).map(d => `
                <tr>
                  <td><a href="/product-details.html?id=${d.productId}">${d.product?.productName || 'Product #' + d.productId}</a></td>
                  <td>${d.quantity}</td>
                  <td>${formatPrice(d.unitPrice)}</td>
                  <td>${formatPrice(d.discount)}</td>
                  <td>${formatPrice(d.lineTotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
          <div class="cart-summary__row"><span class="cart-summary__row-label">Subtotal:</span> <span>${formatPrice(o.subTotal)}</span></div>
          <div class="cart-summary__row"><span class="cart-summary__row-label">Discount:</span> <span>-${formatPrice(o.discountAmount)}</span></div>
          <div class="cart-summary__row"><span class="cart-summary__row-label">Tax:</span> <span>${formatPrice(o.taxAmount)}</span></div>
        </div>
        ${o.shipping ? `
        <div class="shipping-tracker" style="margin-top:var(--space-4)">
          <div class="shipping-tracker__icon">${UI.Icons.truck}</div>
          <div class="shipping-tracker__info">
            <div class="shipping-tracker__status">${o.shipping.status || 'Processing'}</div>
            ${o.shipping.trackingNumber ? `<div class="shipping-tracker__tracking">Tracking: ${o.shipping.trackingNumber}</div>` : ''}
            ${o.shipping.estimatedDeliveryDate ? `<div class="text--xs text--muted">Est. delivery: ${new Date(o.shipping.estimatedDeliveryDate).toLocaleDateString()}</div>` : ''}
          </div>
        </div>` : ''}
        ${(o.statusName === 'Cancelled' || o.status === 'Cancelled') ? `
        <div style="margin-top:var(--space-4); background:rgba(var(--error-rgb,239,68,68),0.08); border:1px solid var(--error); border-radius:var(--radius-md); padding:var(--space-4)">
          <div style="font-weight:var(--fw-semibold); color:var(--error); margin-bottom:var(--space-2); display:flex; align-items:center; gap:var(--space-2)">
            <span style="width:16px;height:16px">${UI.Icons.close || '✕'}</span> Order Cancelled
          </div>
          ${o.cancelReason ? `<p class="text--sm" style="color:var(--text-secondary); margin-bottom:var(--space-3)"><strong>Reason:</strong> ${o.cancelReason}</p>` : ''}
          <p class="text--sm" style="color:var(--text-secondary)">
            To dispute this cancellation or for assistance, please contact our support team:
            <a href="mailto:admin@CrSys.com" style="color:var(--accent); font-weight:var(--fw-semibold)">admin@CrSys.com</a>
          </p>
        </div>` : ''}
      </div>
    </div>`).join('');
}

// ================================================================
//  INVOICES TAB
// ================================================================
async function renderInvoices(container) {
  const data = await API.Orders.getAll();
  const orders = (Array.isArray(data) ? data : data?.items || []).filter(o => o.invoice);

  if (orders.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${UI.Icons.invoice}</div><h3 class="empty-state__title">No invoices yet</h3><p class="empty-state__message">Invoices will appear here once orders are processed.</p></div>`;
    return;
  }

  container.innerHTML = `
    <h3 style="margin-bottom:var(--space-6)">Invoices</h3>
    <div class="table-responsive">
      <table class="data-table">
        <thead><tr><th>Invoice #</th><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${orders.map(o => {
            const inv = o.invoice;
            return `<tr>
              <td>${inv.invoiceNumber}</td>
              <td>${o.orderNumber}</td>
              <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
              <td class="text--accent text--bold">${formatPrice(inv.totalAmount)}</td>
              <td>${inv.isPaid ? '<span class="badge badge--success">Paid</span>' : '<span class="badge badge--warning">Unpaid</span>'}</td>
              <td><button class="btn btn--ghost btn--sm" onclick="window.print()" title="Print">${UI.Icons.download} Print</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ================================================================
//  RETURNS TAB
// ================================================================
async function renderReturns(container) {
  const data = await API.Returns.getAll();
  const returns = Array.isArray(data) ? data : data?.items || [];

  if (returns.length === 0) {
    UI.renderEmptyState(container, 'returns');
    return;
  }

  container.innerHTML = `
    <h3 style="margin-bottom:var(--space-6)">Return Requests</h3>
    <div class="table-responsive">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Product</th><th>Qty</th><th>Reason</th><th>Status</th><th>Refund</th><th>Date</th></tr></thead>
        <tbody>
          ${returns.map(r => `
            <tr>
              <td>#${r.returnId}</td>
              <td>${r.orderDetail?.product?.productName || 'N/A'}</td>
              <td>${r.quantity}</td>
              <td>${r.reason}</td>
              <td><span class="badge badge--${r.status === 'Approved' || r.status === 'Refunded' ? 'success' : r.status === 'Rejected' ? 'error' : 'warning'}">${r.status}</span></td>
              <td>${r.refundAmount ? formatPrice(r.refundAmount) : '—'}</td>
              <td>${new Date(r.requestDate).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ================================================================
//  WISHLIST TAB
// ================================================================
async function renderWishlist(container) {
  const data = await API.Wishlist.getAll();
  const items = Array.isArray(data) ? data : data?.items || [];

  if (items.length === 0) {
    UI.renderEmptyState(container, 'wishlist');
    return;
  }

  container.innerHTML = `
    <h3 style="margin-bottom:var(--space-6)">My Wishlist</h3>
    <div class="featured-products">
      ${items.map(item => {
        const p = item.product || item;
        p.wishlistId = item.wishlistId;
        return renderProductCard(p, { isWishlist: true });
      }).join('')}
    </div>`;
}

// ================================================================
//  REVIEWS TAB
// ================================================================
async function renderReviews(container) {
  const data = await API.Reviews.getUserReviews();
  const reviews = Array.isArray(data) ? data : data?.items || [];

  if (reviews.length === 0) {
    UI.renderEmptyState(container, 'reviews');
    return;
  }

  container.innerHTML = `
    <h3 style="margin-bottom:var(--space-6)">My Reviews</h3>
    ${reviews.map(r => `
      <div class="review-card" style="border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-5);margin-bottom:var(--space-4)">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-3)">
          <div>
            <a href="/product-details.html?id=${r.productId}" style="font-weight:var(--fw-semibold)">${r.product?.productName || 'Product'}</a>
            <div style="margin-top:var(--space-1)">${UI.renderStars(r.rating)}</div>
          </div>
          <span class="text--xs text--muted">${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="text--sm" style="color:var(--text-secondary)">${r.comment || ''}</p>
      </div>
    `).join('')}`;
}
