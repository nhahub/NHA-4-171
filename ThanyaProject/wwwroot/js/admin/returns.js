/* ============================================================
   CarSparePartSys — Admin Returns Logic
   ============================================================ */

let filterState = { search: '', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('returns-search-input')?.addEventListener('input', debounce(() => {
    filterState.search = document.getElementById('returns-search-input').value.trim();
    filterState.page = 1;
    loadReturns();
  }, 350));

  loadReturns();
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

async function loadReturns() {
  const tbody = document.getElementById('returns-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:140px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:30px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:120px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:70px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const res = await AdminAPI.Returns.getAllAdmin(filterState.search, filterState.page, filterState.pageSize);
    const items = res?.items || [];
    const totalCount = res?.totalCount || 0;
    const totalPages = res?.totalPages || 1;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text--center text--muted" style="padding:var(--space-8)">No return requests found.</td></tr>`;
      document.getElementById('returns-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = items.map(r => {
      let statusClass = 'warning';
      if (r.status === 'Approved' || r.status === 'Refunded') statusClass = 'success';
      if (r.status === 'Rejected') statusClass = 'error';
      const statusBadge = `<span class="badge badge--${statusClass}">${r.status}</span>`;

      const refundVal = r.refundAmount !== null ? formatPrice(r.refundAmount) : '—';

      return `
        <tr>
          <td>#${r.returnId}</td>
          <td>${r.user?.firstName || 'User'} ${r.user?.lastName || ''}</td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>${r.orderDetail?.product?.productName || 'Product'}</strong></td>
          <td>${r.quantity}</td>
          <td><span class="text--xs text--secondary" title="${r.reason}">${r.reason || '—'}</span></td>
          <td>${new Date(r.requestDate).toLocaleDateString()}</td>
          <td>${statusBadge}</td>
          <td class="text--accent text--bold">${refundVal}</td>
          <td>
            <button class="btn btn--outline btn--sm" onclick="openProcessReturnModal(${r.returnId}, '${r.status}', ${r.refundAmount || 0})">
              Moderate
            </button>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text--center text--danger" style="padding:var(--space-8)">Failed to load returns queue.</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('returns-pagination');
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
  loadReturns();
};

window.resetFilters = function() {
  document.getElementById('returns-search-input').value = '';
  filterState = { ...filterState, search: '', page: 1 };
  loadReturns();
};

// ================================================================
//  MODERATE PROCESSING MODAL
// ================================================================

window.openProcessReturnModal = function(id, currentStatus, currentRefund) {
  UI.openModal({
    title: `Process RMA Request #${id}`,
    content: `
      <form id="process-return-form" style="display:flex; flex-direction:column; gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label form-label--required">RMA Status</label>
          <select class="form-select" id="rma-status-select" required>
            <option value="Requested" ${currentStatus === 'Requested' ? 'selected' : ''}>Requested (Pending)</option>
            <option value="Approved" ${currentStatus === 'Approved' ? 'selected' : ''}>Approve Return</option>
            <option value="Refunded" ${currentStatus === 'Refunded' ? 'selected' : ''}>Refunded (Completed)</option>
            <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>Reject Return</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Refund Amount ($)</label>
          <input type="number" class="form-input" id="rma-refund-amount" step="0.01" min="0" value="${currentRefund || ''}" placeholder="Leave blank if not refunded yet" />
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn--primary" id="save-rma-btn" onclick="submitRmaUpdate(${id})">Save Decision</button>
    `,
  });
};

window.submitRmaUpdate = async function(id) {
  const status = document.getElementById('rma-status-select').value;
  const refundAmount = document.getElementById('rma-refund-amount').value || null;

  const btn = document.getElementById('save-rma-btn');
  btn.classList.add('is-loading');

  try {
    await AdminAPI.Returns.updateStatus(id, status, refundAmount);
    UI.showToast('Return request updated successfully!', 'success');
    UI.closeModal();
    loadReturns();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};
