/* ============================================================
   CarSparePartSys — Homepage Logic
   Loads brands carousel, categories grid, featured products,
   and hero interactions.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Inject Icons ──
  injectIcons();

  // ── Hero search ──
  initHeroSearch();

  // ── Load data sections ──
  loadBrands();
  loadCategories();
  loadFeaturedProducts();
});

// ================================================================
//  INJECT ICONS INTO PLACEHOLDERS
// ================================================================

function injectIcons() {
  const iconMap = {
    'hero-badge-icon': UI.Icons.shieldCheck,
    'hero-search-icon': UI.Icons.search,
    'icon-chevron-right': UI.Icons.chevronRight,
    'icon-browse-all': UI.Icons.chevronRight,
    'icon-prev': UI.Icons.chevronLeft,
    'icon-next': UI.Icons.chevronRight,
    'feat-icon-1': UI.Icons.shieldCheck,
    'feat-icon-2': UI.Icons.truck,
    'feat-icon-3': UI.Icons.wrench,
    'feat-icon-4': UI.Icons.returnIcon,
  };

  Object.entries(iconMap).forEach(([id, svg]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  });
}

// ================================================================
//  HERO SEARCH
// ================================================================

function initHeroSearch() {
  const input = document.getElementById('hero-search-input');
  const btn = document.getElementById('hero-search-btn');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) window.location.href = `/products.html?search=${encodeURIComponent(q)}`;
      }
    });
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const q = input?.value.trim();
      if (q) window.location.href = `/products.html?search=${encodeURIComponent(q)}`;
    });
  }
}

// ================================================================
//  BRANDS CAROUSEL
// ================================================================

async function loadBrands() {
  const track = document.getElementById('brands-track');
  if (!track) return;

  // Show skeleton
  track.innerHTML = Array(8)
    .fill(0)
    .map(
      () => `
    <div class="brand-card" style="pointer-events:none">
      <div class="skeleton" style="width:56px;height:56px;border-radius:50%"></div>
      <div class="skeleton skeleton--text-sm" style="width:60px"></div>
    </div>`
    )
    .join('');

  try {
    const brands = await API.CarBrands.getAll();
    const brandList = Array.isArray(brands) ? brands : brands?.items || [];

    if (brandList.length === 0) {
      // Fallback brands
      renderFallbackBrands(track);
      return;
    }

    track.innerHTML = brandList
      .map(
        (brand) => `
      <a href="/products.html?brandId=${brand.brandId}" class="brand-card">
        ${
          brand.logoUrl
            ? `<img src="${brand.logoUrl}" alt="${brand.brandName}" class="brand-card__logo" />`
            : `<div class="avatar avatar--xl" style="background:var(--bg-tertiary);color:var(--accent)">${brand.brandName.charAt(0)}</div>`
        }
        <span class="brand-card__name">${brand.brandName}</span>
      </a>`
      )
      .join('');
  } catch {
    renderFallbackBrands(track);
  }

  // Carousel navigation
  initCarouselNav(track);
}

function renderFallbackBrands(track) {
  const fallback = ['Toyota', 'BMW', 'Mercedes', 'Honda', 'Ford', 'Hyundai', 'Nissan', 'Chevrolet', 'Kia', 'Audi'];
  track.innerHTML = fallback
    .map(
      (name) => `
    <a href="/products.html" class="brand-card">
      <div class="avatar avatar--xl" style="background:var(--bg-tertiary);color:var(--accent)">${name.charAt(0)}</div>
      <span class="brand-card__name">${name}</span>
    </a>`
    )
    .join('');
}

function initCarouselNav(track) {
  const prevBtn = document.getElementById('brands-prev');
  const nextBtn = document.getElementById('brands-next');
  const scrollAmount = 300;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
}

// ================================================================
//  CATEGORIES GRID
// ================================================================

async function loadCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  // Show skeleton
  grid.innerHTML = Array(6)
    .fill(0)
    .map(
      () => `
    <div class="category-card" style="pointer-events:none">
      <div class="skeleton" style="width:48px;height:48px;border-radius:8px"></div>
      <div class="skeleton skeleton--text" style="width:80px"></div>
      <div class="skeleton skeleton--text-sm" style="width:40px"></div>
    </div>`
    )
    .join('');

  try {
    const categories = await API.Categories.getAll();
    const catList = Array.isArray(categories) ? categories : categories?.items || [];
    const topLevel = catList.filter((c) => !c.parentCategoryId);

    if (topLevel.length === 0) {
      renderFallbackCategories(grid);
      return;
    }

    const categoryIcons = [UI.Icons.gear, UI.Icons.wrench, UI.Icons.truck, UI.Icons.package, UI.Icons.tag, UI.Icons.shieldCheck];

    grid.innerHTML = topLevel
      .slice(0, 8)
      .map(
        (cat, i) => `
      <a href="/products.html?categoryId=${cat.categoryId}" class="category-card">
        <div class="category-card__icon">${categoryIcons[i % categoryIcons.length]}</div>
        <span class="category-card__name">${cat.categoryName}</span>
        <span class="category-card__count">${cat.products?.length || cat.productCount || ''} ${cat.products?.length || cat.productCount ? 'parts' : ''}</span>
      </a>`
      )
      .join('');
  } catch {
    renderFallbackCategories(grid);
  }
}

function renderFallbackCategories(grid) {
  const fallback = [
    { name: 'Engine Parts', icon: UI.Icons.gear },
    { name: 'Brakes', icon: UI.Icons.shieldCheck },
    { name: 'Suspension', icon: UI.Icons.truck },
    { name: 'Electrical', icon: UI.Icons.wrench },
    { name: 'Filters', icon: UI.Icons.filter },
    { name: 'Body Parts', icon: UI.Icons.package },
  ];

  grid.innerHTML = fallback
    .map(
      (cat) => `
    <a href="/products.html" class="category-card">
      <div class="category-card__icon">${cat.icon}</div>
      <span class="category-card__name">${cat.name}</span>
    </a>`
    )
    .join('');
}

// ================================================================
//  FEATURED PRODUCTS
// ================================================================

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  // Show skeleton cards
  UI.renderSkeletons(grid, 'card', 8);

  try {
    let products;
    try {
      const data = await API.Products.getFeatured();
      products = Array.isArray(data) ? data : data?.items || data?.products || [];
    } catch {
      // Fallback to regular products
      const data = await API.Products.getAll({ pageSize: 8 });
      products = Array.isArray(data) ? data : data?.items || data?.products || [];
    }

    if (products.length === 0) {
      UI.renderEmptyState(grid, 'search');
      return;
    }

    grid.innerHTML = products.map((p) => renderProductCard(p)).join('');
  } catch {
    // Show fallback placeholder cards
    grid.innerHTML = Array(8)
      .fill(0)
      .map(
        (_, i) => `
      <div class="product-card">
        <div class="product-card__image-wrapper">
          <div style="width:100%;height:100%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
            <span style="width:48px;height:48px">${UI.Icons.gear}</span>
          </div>
          <div class="product-card__badges">
            <span class="badge badge--stock">In Stock</span>
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__category">Auto Parts</span>
          <h3 class="product-card__name"><a href="/products.html">Sample Product ${i + 1}</a></h3>
          <div class="product-card__rating">
            ${UI.renderStars(4)}
            <span class="product-card__rating-count">(12)</span>
          </div>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">$99.99</span>
          <button class="product-card__add-cart" title="Add to Cart">${UI.Icons.cart}</button>
        </div>
      </div>`
      )
      .join('');
  }
}
