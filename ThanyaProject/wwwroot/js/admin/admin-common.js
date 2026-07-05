/* ============================================================
   CarSparePartSys — Admin Common Shared Utilities
   Admin routing guard, sidebar builder, mobile navigation toggle,
   and dynamic modal details helper.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Role Guard Verification ──
  const allowed = Auth.requireAdmin('/admin/login.html');
  if (!allowed) return;

  // ── Inject Mobile Toggle & Sidebar layout if containers exist ──
  setupAdminSidebar();
  setupMobileToggle();
});

// ================================================================
//  INJECT ADMIN SIDEBAR HTML
// ================================================================

function setupAdminSidebar() {
  const sidebarContainer = document.getElementById('admin-sidebar');
  if (!sidebarContainer) return;

  const currentPath = window.location.pathname;

  const getActive = (path) => currentPath.includes(path) ? 'is-active' : '';

  sidebarContainer.className = 'admin-sidebar';
  sidebarContainer.innerHTML = `
    <a href="/admin/dashboard.html" class="admin-sidebar__brand">
      <span style="width:24px;height:24px;color:var(--accent)">${UI.Icons.gear}</span>
      Auto<span>Admin</span>
    </a>

    <nav class="admin-sidebar__nav">
      <div class="admin-sidebar__section-title">Overview</div>
      <a href="/admin/dashboard.html" class="admin-sidebar__link ${getActive('dashboard.html')}">
        <span style="width:18px;height:18px">${UI.Icons.barChart}</span>
        Dashboard
      </a>

      <div class="admin-sidebar__section-title">Catalog</div>
      <a href="/admin/products.html" class="admin-sidebar__link ${getActive('products.html')}">
        <span style="width:18px;height:18px">${UI.Icons.package}</span>
        Products
      </a>
      <a href="/admin/categories.html" class="admin-sidebar__link ${getActive('categories.html')}">
        <span style="width:18px;height:18px">${UI.Icons.grid}</span>
        Categories
      </a>
      <a href="/admin/suppliers.html" class="admin-sidebar__link ${getActive('suppliers.html')}">
        <span style="width:18px;height:18px">${UI.Icons.truck}</span>
        Suppliers
      </a>
      <a href="/admin/car-catalog.html" class="admin-sidebar__link ${getActive('car-catalog.html')}">
        <span style="width:18px;height:18px">${UI.Icons.wrench}</span>
        Car Catalog
      </a>

      <div class="admin-sidebar__section-title">Sales</div>
      <a href="/admin/orders.html" class="admin-sidebar__link ${getActive('orders.html')}">
        <span style="width:18px;height:18px">${UI.Icons.invoice}</span>
        Orders
      </a>
      <a href="/admin/coupons.html" class="admin-sidebar__link ${getActive('coupons.html')}">
        <span style="width:18px;height:18px">${UI.Icons.tag}</span>
        Coupons
      </a>
      <a href="/admin/returns.html" class="admin-sidebar__link ${getActive('returns.html')}">
        <span style="width:18px;height:18px">${UI.Icons.returnIcon}</span>
        Returns Queue
      </a>

      <div class="admin-sidebar__section-title">Operations</div>
      <a href="/admin/inventory.html" class="admin-sidebar__link ${getActive('inventory.html')}">
        <span style="width:18px;height:18px">${UI.Icons.warehouse}</span>
        Inventory
      </a>
      <a href="/admin/reviews.html" class="admin-sidebar__link ${getActive('reviews.html')}">
        <span style="width:18px;height:18px">${UI.Icons.star}</span>
        Moderation
      </a>
      <a href="/admin/users.html" class="admin-sidebar__link ${getActive('users.html')}">
        <span style="width:18px;height:18px">${UI.Icons.users}</span>
        Users
      </a>
    </nav>

    <div class="admin-sidebar__footer">
      <a href="/index.html" class="admin-sidebar__link">
        <span style="width:18px;height:18px">${UI.Icons.home}</span>
        Storefront
      </a>
      <button class="admin-sidebar__link admin-sidebar__link--danger" onclick="Auth.handleLogout()" style="border:none;background:transparent;width:100%;text-align:left;">
        <span style="width:18px;height:18px;color:var(--error)">${UI.Icons.logout}</span>
        Log Out
      </button>
    </div>
  `;
}

// ================================================================
//  MOBILE LAYOUT TOGGLE
// ================================================================

function setupMobileToggle() {
  const container = document.querySelector('.admin-layout');
  if (!container) return;

  // Insert Mobile Header Bar before main content if missing
  let mobileBar = document.querySelector('.admin-mobile-bar');
  if (!mobileBar) {
    mobileBar = document.createElement('div');
    mobileBar.className = 'admin-mobile-bar';
    mobileBar.innerHTML = `
      <a href="/admin/dashboard.html" class="navbar__logo">
        <span class="navbar__logo-icon">${UI.Icons.gear}</span>
        <span class="navbar__logo-text">Auto<span>Admin</span></span>
      </a>
      <button class="admin-mobile-bar__toggle" id="admin-sidebar-toggle" aria-label="Toggle admin menu">
        ${UI.Icons.menu}
      </button>
    `;
    container.insertBefore(mobileBar, container.firstChild);
  }

  // Sidebar slide-in toggle events
  const toggleBtn = document.getElementById('admin-sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('is-active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#admin-sidebar') && !e.target.closest('#admin-sidebar-toggle')) {
        sidebar.classList.remove('is-active');
      }
    });
  }
}

// ================================================================
//  MODAL / CONFIRMATION HELPER
// ================================================================

/**
 * Custom Confirmation Modal helper.
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function showConfirmModal(title, message, onConfirm) {
  UI.openModal({
    title: title,
    content: `<p class="text--sm" style="color:var(--text-secondary);line-height:var(--lh-relaxed)">${message}</p>`,
    footer: `
      <button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn--danger" id="confirm-modal-ok-btn">Confirm</button>
    `,
  });

  const confirmBtn = document.getElementById('confirm-modal-ok-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.classList.add('is-loading');
      try {
        await onConfirm();
        UI.closeModal();
      } catch (err) {
        UI.handleApiError(err);
        confirmBtn.classList.remove('is-loading');
      }
    });
  }
}

window.showConfirmModal = showConfirmModal;
