/* ============================================================
   CarSparePartSys — Admin Reviews Moderation Logic
   ============================================================ */

let filterState = { search: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reviews-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('reviews-search-input').value.trim();
    filterState.page = 1;
    loadReviews();
  }, 350));

  loadReviews();
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

async function loadReviews() {
  const tbody = document.getElementById('reviews-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:90px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:120px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:70px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:160px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Reviews.getAllAdmin(filterState.search, filterState.page, filterState.pageSize);
    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text--center text--muted" style="padding:var(--space-8)">No reviews found.</td></tr>`;
      document.getElementById('reviews-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(r => {
      const verifiedBtn = r.isVerified 
        ? `<button class="btn btn--sm btn--outline" onclick="toggleVerify(${r.reviewId})">${UI.Icons.check} Verified</button>`
        : `<button class="btn btn--sm btn--secondary" onclick="toggleVerify(${r.reviewId})">Unverified</button>`;

      return `
        <tr>
          <td>${r.reviewId}</td>
          <td>${r.user?.firstName || 'User'} ${r.user?.lastName || ''}</td>
          <td style="max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <a href="/product-details.html?id=${r.productId}" target="_blank" style="color:var(--accent); font-weight:bold;">${r.product?.productName || 'Product'}</a>
          </td>
          <td>${UI.renderStars(r.rating)}</td>
          <td style="max-width:240px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${r.comment}">${r.comment || '—'}</td>
          <td>${verifiedBtn}</td>
          <td>${new Date(r.createdAt).toLocaleDateString()}</td>
          <td class="admin-table-actions">
            <button class="btn btn--icon btn--ghost" onclick="deleteReview(${r.reviewId})" title="Delete Inappropriate Review">
              ${UI.Icons.trash}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text--center text--danger" style="padding:var(--space-8)">Failed to load reviews list.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('reviews-pagination');
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
  loadReviews();
};

window.resetFilters = function() {
  document.getElementById('reviews-search-input').value = '';
  filterState = { ...filterState, search: '', page: 1 };
  loadReviews();
};

// ================================================================
//  MODERATE REVIEW DETAILS
// ================================================================

window.toggleVerify = async function(id) {
  try {
    await AdminAPI.Reviews.verifyToggle(id);
    UI.showToast('Verified status toggled!', 'success');
    loadReviews();
  } catch (err) {
    UI.handleApiError(err);
  }
};

window.deleteReview = function(id) {
  showConfirmModal('Moderate Review', 'Delete this customer review? This operation is permanent.', async () => {
    await AdminAPI.Reviews.delete(id);
    UI.showToast('Review permanently deleted.', 'success');
    loadReviews();
  });
};
