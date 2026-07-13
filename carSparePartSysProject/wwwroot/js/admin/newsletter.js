/* ============================================================
   Admin — Newsletter Subscriptions
   ============================================================ */

let allSubscriptions = [];
let filteredSubscriptions = [];
const PAGE_SIZE = 15;
let currentPage = 1;

// ── Load subscriptions ──
async function loadSubscriptions() {
  const tbody = document.getElementById('newsletter-list');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-6)">Loading...</td></tr>';

  try {
    const token = localStorage.getItem('csps_token');
    const response = await fetch('/api/newsletter/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load subscriptions');
    }
    
    allSubscriptions = await response.json();
    filteredSubscriptions = [...allSubscriptions];
    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error('Error loading subscriptions:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-6);color:var(--error)">Failed to load subscriptions.</td></tr>';
  }
}

// ── Render table ──
function renderTable() {
  const tbody = document.getElementById('newsletter-list');
  if (!tbody) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredSubscriptions.slice(start, start + PAGE_SIZE);

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-6);opacity:0.6">No subscriptions found.</td></tr>';
    renderPagination();
    return;
  }

  tbody.innerHTML = pageItems.map((sub, idx) => {
    const date = new Date(sub.subscribedAt || sub.SubscribedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const isContacted = sub.isContacted || sub.IsContacted || false;
    const id = sub.id || sub.Id;
    const seqNum = (currentPage - 1) * PAGE_SIZE + idx + 1;

    return `<tr>
      <td>${seqNum}</td>
      <td><strong>${sub.email || sub.Email}</strong></td>
      <td>${date}</td>
      <td>
        <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
          <input type="checkbox" ${isContacted ? 'checked' : ''} 
                 onchange="toggleContact(${id}, this.checked)"
                 style="width:18px;height:18px;cursor:pointer" />
          <span style="font-size:0.85rem;color:${isContacted ? 'var(--success)' : 'var(--text-secondary)'}">
            ${isContacted ? 'Yes' : 'No'}
          </span>
        </label>
      </td>
      <td>
        <button class="btn btn--sm btn--error" onclick="deleteSubscription(${id})" title="Delete">
          Delete
        </button>
      </td>
    </tr>`;
  }).join('');

  renderPagination();
}

// ── Pagination ──
function renderPagination() {
  const container = document.getElementById('newsletter-pagination');
  if (!container) return;
  
  const totalPages = Math.ceil(filteredSubscriptions.length / PAGE_SIZE);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn btn--sm ${i === currentPage ? 'btn--primary' : 'btn--secondary'}" 
                     onclick="goToPage(${i})">${i}</button> `;
  }
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

// ── Toggle contact status ──
async function toggleContact(id, isContacted) {
  try {
    const token = localStorage.getItem('csps_token');
    const response = await fetch(`/api/newsletter/subscriptions/${id}/contact`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ IsContacted: isContacted })
    });
    
    if (!response.ok) throw new Error('Failed to update');

    // Update local data
    const sub = allSubscriptions.find(s => (s.id || s.Id) === id);
    if (sub) {
      sub.isContacted = isContacted;
      sub.IsContacted = isContacted;
    }
    
    UI.showToast(isContacted ? 'Marked as contacted' : 'Marked as not contacted', 'success');
    renderTable();
  } catch (err) {
    console.error('Error toggling contact:', err);
    UI.showToast('Failed to update contact status.', 'error');
    loadSubscriptions(); // Refresh to revert UI
  }
}

// ── Delete subscription ──
async function deleteSubscription(id) {
  if (!confirm('Are you sure you want to delete this subscription?')) return;

  try {
    const token = localStorage.getItem('csps_token');
    const response = await fetch(`/api/newsletter/subscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    UI.showToast('Subscription deleted.', 'success');
    loadSubscriptions();
  } catch (err) {
    console.error('Error deleting subscription:', err);
    UI.showToast('Failed to delete subscription.', 'error');
  }
}

// ── Search/filter ──
function filterSubscriptions() {
  const searchInput = document.getElementById('newsletter-search-input');
  const query = (searchInput?.value || '').trim().toLowerCase();
  
  if (!query) {
    filteredSubscriptions = [...allSubscriptions];
  } else {
    filteredSubscriptions = allSubscriptions.filter(sub => {
      const email = (sub.email || sub.Email || '').toLowerCase();
      return email.includes(query);
    });
  }
  
  currentPage = 1;
  renderTable();
}

function resetFilters() {
  const searchInput = document.getElementById('newsletter-search-input');
  if (searchInput) searchInput.value = '';
  filteredSubscriptions = [...allSubscriptions];
  currentPage = 1;
  renderTable();
}

// ── Expose functions ──
window.toggleContact = toggleContact;
window.deleteSubscription = deleteSubscription;
window.goToPage = goToPage;
window.resetFilters = resetFilters;
window.filterSubscriptions = filterSubscriptions;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadSubscriptions();
  
  // Live search
  const searchInput = document.getElementById('newsletter-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterSubscriptions);
  }
});
