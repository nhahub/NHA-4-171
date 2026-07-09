/* ============================================================
   CarSparePartSys — Admin Coupons Logic
   ============================================================ */

let filterState = { search: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  const addIcon = document.getElementById('add-icon');
  if (addIcon) addIcon.innerHTML = UI.Icons.plus;

  document.getElementById('coupons-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('coupons-search-input').value.trim();
    filterState.page = 1;
    loadCoupons();
  }, 350));

  loadCoupons();
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

async function loadCoupons() {
  const tbody = document.getElementById('coupons-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:70px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:70px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:40px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Coupons.getAll(filterState.search, filterState.page, filterState.pageSize);
    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text--center text--muted" style="padding:var(--space-8)">No coupons found.</td></tr>`;
      document.getElementById('coupons-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(c => {
      const isPercentage = c.discountType === 'Percentage' || c.discountType === 0 || c.discountType === '0';
      const typeText = isPercentage ? 'Percentage' : 'Fixed Amount';
      const valText = isPercentage ? `${c.discountValue}%` : formatPrice(c.discountValue);
      const minText = c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'None';
      const validity = `${new Date(c.startDate).toLocaleDateString()} – ${new Date(c.endDate).toLocaleDateString()}`;
      const usedStats = `${c.usedCount} used ${c.usageLimit ? '/ ' + c.usageLimit + ' max' : '(unlimited)'}`;
      const activeBadge = c.isActive ? '<span class="badge badge--success">Active</span>' : '<span class="badge badge--error">Inactive</span>';

      return `
        <tr>
          <td><code><strong>${c.code}</strong></code></td>
          <td>${typeText}</td>
          <td class="text--accent text--bold">${valText}</td>
          <td>${minText}</td>
          <td class="text--xs text--muted">${validity}</td>
          <td class="text--xs">${usedStats}</td>
          <td>${activeBadge}</td>
          <td class="admin-table-actions">
            <button class="btn btn--icon btn--ghost" onclick="deleteCoupon(${c.couponId})" title="Delete">${UI.Icons.trash}</button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text--center text--danger" style="padding:var(--space-8)">Failed to load coupons.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('coupons-pagination');
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
  loadCoupons();
};

window.resetFilters = function() {
  document.getElementById('coupons-search-input').value = '';
  filterState = { ...filterState, search: '', page: 1 };
  loadCoupons();
};

// ================================================================
//  DRAWER ACTION CREATION
// ================================================================

window.openCouponDrawer = function() {
  const backdrop = document.getElementById('coupon-drawer-backdrop');
  document.getElementById('coupon-edit-form').reset();
  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeCouponDrawer = function(e) {
  if (e && e.target !== document.getElementById('coupon-drawer-backdrop')) return;
  const backdrop = document.getElementById('coupon-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveCoupon = async function() {
  const form = document.getElementById('coupon-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-coupon-btn');
  btn.classList.add('is-loading');

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  data.code = data.code.toUpperCase();
  data.discountValue = parseFloat(data.discountValue);
  data.minOrderAmount = data.minOrderAmount ? parseFloat(data.minOrderAmount) : null;
  data.maxDiscountAmount = data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null;
  data.usageLimit = data.usageLimit ? parseInt(data.usageLimit, 10) : null;
  data.isActive = document.getElementById('coupon-active').checked;

  try {
    await AdminAPI.Coupons.create(data);
    UI.showToast('Coupon created successfully!', 'success');
    closeCouponDrawer();
    loadCoupons();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteCoupon = function(id) {
  showConfirmModal('Delete Coupon', 'Are you sure you want to permanently delete this coupon code?', async () => {
    await AdminAPI.Coupons.delete(id);
    UI.showToast('Coupon code deleted.', 'success');
    loadCoupons();
  });
};
