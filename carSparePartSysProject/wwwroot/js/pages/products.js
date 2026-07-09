/* ============================================================
   CarSparePartSys — Products Listing Page Logic
   Loads products with filters, sorting, pagination, and URL
   query parameter synchronization.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  injectPageIcons();
  initFilters();
  initSortAndView();
  loadFilterOptions();
  loadProductsFromURL();
});

// ── Current filter state ──
let currentFilters = {
  categoryId: '',
  brandId: '',
  modelId: '',
  supplierId: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  page: 1,
  pageSize: 12,
  search: '',
};

// ================================================================
//  ICONS
// ================================================================

function injectPageIcons() {
  const iconMap = {
    'filter-icon': UI.Icons.filter,
    'filter-icon-sidebar': UI.Icons.filter,
    'toggle-categories': UI.Icons.chevronDown,
    'toggle-compatibility': UI.Icons.chevronDown,
    'toggle-price': UI.Icons.chevronDown,
    'toggle-supplier': UI.Icons.chevronDown,
    'view-grid-icon': UI.Icons.grid,
    'view-list-icon': UI.Icons.list,
  };
  Object.entries(iconMap).forEach(([id, svg]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  });
}

// ================================================================
//  PARSE URL PARAMS
// ================================================================

function loadProductsFromURL() {
  const params = new URLSearchParams(window.location.search);
  currentFilters.categoryId = params.get('categoryId') || '';
  currentFilters.brandId = params.get('brandId') || '';
  currentFilters.modelId = params.get('modelId') || '';
  currentFilters.supplierId = params.get('supplierId') || '';
  currentFilters.minPrice = params.get('minPrice') || '';
  currentFilters.maxPrice = params.get('maxPrice') || '';
  currentFilters.sort = params.get('sort') || 'newest';
  currentFilters.page = parseInt(params.get('page') || '1', 10);
  currentFilters.search = params.get('search') || '';

  // Set form values
  document.getElementById('sort-select').value = currentFilters.sort;
  if (currentFilters.minPrice) document.getElementById('price-min').value = currentFilters.minPrice;
  if (currentFilters.maxPrice) document.getElementById('price-max').value = currentFilters.maxPrice;
  if (currentFilters.brandId) document.getElementById('filter-brand').value = currentFilters.brandId;
  if (currentFilters.supplierId) document.getElementById('filter-supplier-select').value = currentFilters.supplierId;

  // Show search query
  if (currentFilters.search) {
    const display = document.getElementById('search-query-display');
    if (display) display.textContent = ` for "${currentFilters.search}"`;
  }

  // Render breadcrumb
  const breadcrumbItems = [{ label: 'Home', url: '/index.html' }, { label: 'Products' }];
  const bc = document.getElementById('breadcrumb');
  if (bc) bc.innerHTML = UI.renderBreadcrumb(breadcrumbItems);

  loadProducts();
}

// ================================================================
//  LOAD PRODUCTS
// ================================================================

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  // Show skeletons
  UI.renderSkeletons(grid, 'card', currentFilters.pageSize);

  try {
    const data = await API.Products.getAll(currentFilters);
    const products = Array.isArray(data) ? data : data?.items || data?.products || [];
    const totalCount = data?.totalCount || data?.total || products.length;
    const totalPages = data?.totalPages || Math.ceil(totalCount / currentFilters.pageSize) || 1;

    if (countEl) countEl.textContent = totalCount;

    if (products.length === 0) {
      UI.renderEmptyState(grid, 'search');
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = products.map((p) => renderProductCard(p)).join('');
    renderPagination(currentFilters.page, totalPages);
  } catch (err) {
    UI.renderEmptyState(grid, 'search');
    document.getElementById('pagination').innerHTML = '';
  }

  updateURL();
}

// ================================================================
//  FILTER OPTIONS LOADING
// ================================================================

async function loadFilterOptions() {
  // Load categories
  try {
    const cats = await API.Categories.getAll();
    const catList = Array.isArray(cats) ? cats : cats?.items || [];
    renderCategoryTree(catList);
  } catch {
    // Leave empty
  }

  // Load car brands
  try {
    const brands = await API.CarBrands.getAll();
    const brandList = Array.isArray(brands) ? brands : brands?.items || [];
    const select = document.getElementById('filter-brand');
    if (select) {
      brandList.forEach((b) => {
        const opt = document.createElement('option');
        opt.value = b.brandId;
        opt.textContent = b.brandName;
        if (String(b.brandId) === currentFilters.brandId) opt.selected = true;
        select.appendChild(opt);
      });
    }
  } catch {
    // Leave empty
  }

  // Load suppliers
  try {
    const suppliers = await API.Suppliers.getAll();
    const supList = Array.isArray(suppliers) ? suppliers : suppliers?.items || [];
    const select = document.getElementById('filter-supplier-select');
    if (select) {
      supList.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.supplierId;
        opt.textContent = s.supplierName;
        if (String(s.supplierId) === currentFilters.supplierId) opt.selected = true;
        select.appendChild(opt);
      });
    }
  } catch {
    // Leave empty
  }
}

function renderCategoryTree(categories) {
  const container = document.getElementById('filter-categories');
  if (!container) return;

  const topLevel = categories.filter((c) => !c.parentCategoryId);

  container.innerHTML = topLevel
    .map((cat) => {
      const children = categories.filter((c) => c.parentCategoryId === cat.categoryId);
      const isActive = String(cat.categoryId) === currentFilters.categoryId;
      return `
        <div class="category-tree__item ${isActive ? 'is-active' : ''}" data-category-id="${cat.categoryId}">
          ${cat.categoryName}
        </div>
        ${children.length > 0
          ? `<div class="category-tree__children">${children
              .map((child) => {
                const childActive = String(child.categoryId) === currentFilters.categoryId;
                return `<div class="category-tree__item ${childActive ? 'is-active' : ''}" data-category-id="${child.categoryId}">${child.categoryName}</div>`;
              })
              .join('')}</div>`
          : ''
        }`;
    })
    .join('');

  // Bind clicks
  container.querySelectorAll('[data-category-id]').forEach((el) => {
    el.addEventListener('click', () => {
      currentFilters.categoryId = el.dataset.categoryId;
      currentFilters.page = 1;
      // Update active states
      container.querySelectorAll('.category-tree__item').forEach((i) => i.classList.remove('is-active'));
      el.classList.add('is-active');
      loadProducts();
    });
  });
}

// ================================================================
//  FILTER INITIALIZATION
// ================================================================

function initFilters() {
  // Mobile toggle
  const toggle = document.getElementById('filters-mobile-toggle');
  const sidebar = document.getElementById('filters-sidebar');
  const overlay = document.getElementById('filters-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const isActive = sidebar.classList.toggle('is-active');
      overlay?.classList.toggle('is-active');
      if (isActive) {
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else {
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('is-active');
      overlay.classList.remove('is-active');
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    });
  }

  // Filter group toggles
  document.querySelectorAll('[data-toggle]').forEach((header) => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.toggle;
      const body = document.getElementById(targetId);
      const icon = header.querySelector('.filter-group__toggle');
      if (body) body.classList.toggle('is-collapsed');
      if (icon) icon.classList.toggle('is-open');
    });
  });

  // Brand → Model cascade
  const brandSelect = document.getElementById('filter-brand');
  const modelSelect = document.getElementById('filter-model');
  if (brandSelect) {
    brandSelect.addEventListener('change', async () => {
      currentFilters.brandId = brandSelect.value;
      currentFilters.modelId = '';
      currentFilters.page = 1;

      if (brandSelect.value && modelSelect) {
        modelSelect.disabled = false;
        modelSelect.innerHTML = '<option value="">All Models</option>';
        try {
          const models = await API.CarBrands.getModels(brandSelect.value);
          const modelList = Array.isArray(models) ? models : models?.items || [];
          modelList.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.modelId;
            opt.textContent = `${m.modelName} (${m.yearStart}${m.yearEnd ? '–' + m.yearEnd : '+'})`;
            modelSelect.appendChild(opt);
          });
        } catch {
          // Leave empty
        }
      } else if (modelSelect) {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Select Brand First</option>';
      }

      loadProducts();
    });
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      currentFilters.modelId = modelSelect.value;
      currentFilters.page = 1;
      loadProducts();
    });
  }

  // Price apply
  const applyPrice = document.getElementById('apply-price');
  if (applyPrice) {
    applyPrice.addEventListener('click', () => {
      currentFilters.minPrice = document.getElementById('price-min')?.value || '';
      currentFilters.maxPrice = document.getElementById('price-max')?.value || '';
      currentFilters.page = 1;
      loadProducts();
    });
  }

  // Supplier
  const supplierSelect = document.getElementById('filter-supplier-select');
  if (supplierSelect) {
    supplierSelect.addEventListener('change', () => {
      currentFilters.supplierId = supplierSelect.value;
      currentFilters.page = 1;
      loadProducts();
    });
  }

  // Clear all filters
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentFilters = { ...currentFilters, categoryId: '', brandId: '', modelId: '', supplierId: '', minPrice: '', maxPrice: '', search: '', page: 1 };
      document.getElementById('price-min').value = '';
      document.getElementById('price-max').value = '';
      document.getElementById('filter-brand').value = '';
      document.getElementById('filter-model').value = '';
      document.getElementById('filter-model').disabled = true;
      document.getElementById('filter-supplier-select').value = '';
      document.querySelectorAll('.category-tree__item').forEach((i) => i.classList.remove('is-active'));
      document.getElementById('search-query-display').textContent = '';
      loadProducts();
    });
  }
}

// ================================================================
//  SORT & VIEW
// ================================================================

function initSortAndView() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      currentFilters.page = 1;
      loadProducts();
    });
  }

  const viewGrid = document.getElementById('view-grid');
  const viewList = document.getElementById('view-list');
  const grid = document.getElementById('products-grid');

  if (viewGrid) {
    viewGrid.addEventListener('click', () => {
      viewGrid.classList.add('is-active');
      viewList?.classList.remove('is-active');
      if (grid) grid.style.gridTemplateColumns = '';
    });
  }
  if (viewList) {
    viewList.addEventListener('click', () => {
      viewList.classList.add('is-active');
      viewGrid?.classList.remove('is-active');
      if (grid) grid.style.gridTemplateColumns = '1fr';
    });
  }
}

// ================================================================
//  PAGINATION
// ================================================================

function renderPagination(currentPage, totalPages) {
  const container = document.getElementById('pagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  html += `<button class="pagination__btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">${UI.Icons.chevronLeft}</button>`;

  // Page numbers
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) {
    html += `<button class="pagination__btn" onclick="goToPage(1)">1</button>`;
    if (start > 2) html += `<span class="pagination__btn" style="pointer-events:none">...</span>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination__btn ${i === currentPage ? 'is-active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (end < totalPages) {
    if (end < totalPages - 1) html += `<span class="pagination__btn" style="pointer-events:none">...</span>`;
    html += `<button class="pagination__btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  html += `<button class="pagination__btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">${UI.Icons.chevronRight}</button>`;

  container.innerHTML = html;
}

function goToPage(page) {
  currentFilters.page = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToPage = goToPage;

// ================================================================
//  URL SYNC
// ================================================================

function updateURL() {
  const params = new URLSearchParams();
  Object.entries(currentFilters).forEach(([key, val]) => {
    if (val && val !== '' && key !== 'pageSize') {
      params.set(key, val);
    }
  });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
}
