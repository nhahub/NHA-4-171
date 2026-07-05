/* ============================================================
   CarSparePartSys — Admin Dashboard Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  injectKpiIcons();
  loadDashboardStats();
});

function injectKpiIcons() {
  const icons = {
    'kpi-icon-rev': UI.Icons.invoice,
    'kpi-icon-ord': UI.Icons.cart,
    'kpi-icon-stock': UI.Icons.warehouse,
    'kpi-icon-ret': UI.Icons.returnIcon,
  };
  Object.entries(icons).forEach(([id, svg]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  });
}

async function loadDashboardStats() {
  try {
    // ── Fetch orders & calculate metrics ──
    const ordersResult = await AdminAPI.Orders.getAllAdmin('', '', 1, 100);
    const orders = ordersResult?.items || [];
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // Update KPIs
    document.getElementById('kpi-revenue').textContent = formatPrice(totalRevenue);
    document.getElementById('kpi-orders').textContent = totalOrders;

    // ── Fetch inventory & check low stock ──
    const inventoryResult = await AdminAPI.Inventory.getAll('', '', 1, 100);
    const inventory = inventoryResult?.items || [];
    const lowStockCount = inventory.filter(i => i.quantityInStock <= i.reorderLevel).length;
    document.getElementById('kpi-lowstock').textContent = lowStockCount;

    // Adjust low stock indicator color
    const lowstockTrend = document.getElementById('kpi-lowstock-trend');
    if (lowStockCount > 0 && lowstockTrend) {
      lowstockTrend.className = 'kpi-card__trend kpi-card__trend--down';
      lowstockTrend.textContent = `▲ ${lowStockCount} items`;
    } else if (lowstockTrend) {
      lowstockTrend.className = 'kpi-card__trend kpi-card__trend--up';
      lowstockTrend.textContent = 'Normal';
    }

    // ── Fetch return requests ──
    const returnsResult = await AdminAPI.Returns.getAllAdmin('', 1, 100);
    const returns = returnsResult?.items || [];
    const pendingReturns = returns.filter(r => r.status === 'Requested').length;
    document.getElementById('kpi-returns').textContent = pendingReturns;

    // ── Render recent orders ──
    renderRecentOrders(orders.slice(0, 5));
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-list');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text--center text--muted" style="padding:var(--space-6)">No recent orders.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
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
          <a href="/admin/orders.html?search=${o.orderNumber}" class="btn btn--icon btn--ghost" style="padding:4px;" title="View Details">
            ${UI.Icons.eye}
          </a>
        </td>
      </tr>
    `;
  }).join('');
}
