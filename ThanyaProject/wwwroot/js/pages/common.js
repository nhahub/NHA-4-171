/* ============================================================
   CarSparePartSys — Common Page Logic
   Injects navbar and footer HTML, initializes search,
   mobile menu, mega-menu, cart badge, and auth state.
   Loaded on every page.
   ============================================================ */

// ================================================================
//  NAVBAR HTML
// ================================================================

function getNavbarHTML() {
  return `
  <nav class="navbar" id="navbar">
    <div class="navbar__inner">
      <!-- Logo -->
      <a href="/index.html" class="navbar__logo">
        <span class="navbar__logo-icon">${UI.Icons.gear}</span>
        <span class="navbar__logo-text">Auto<span>Parts</span></span>
      </a>

      <!-- Search bar -->
      <div class="navbar__search" id="navbar-search">
        <span class="navbar__search-icon">${UI.Icons.search}</span>
        <input
          type="text"
          class="navbar__search-input"
          id="search-input"
          placeholder="Search parts, brands, models..."
          autocomplete="off"
          aria-label="Search products"
        />
        <div class="navbar__search-results" id="search-results"></div>
      </div>

      <!-- Navigation -->
      <div class="navbar__nav" id="navbar-nav">
        <!-- Categories mega-menu trigger -->
        <button class="navbar__nav-link" id="categories-trigger" aria-expanded="false" aria-haspopup="true">
          <span class="navbar__nav-icon">${UI.Icons.grid}</span>
          Categories
          <span style="width:14px;height:14px">${UI.Icons.chevronDown}</span>
        </button>

        <!-- Wishlist -->
        <a href="/account.html?tab=wishlist" class="navbar__nav-link" title="Wishlist">
          <span class="navbar__nav-icon">${UI.Icons.heart}</span>
          <span class="hide-mobile">Wishlist</span>
        </a>

        <!-- Cart -->
        <a href="/cart.html" class="navbar__nav-link" title="Cart" style="position:relative">
          <span class="navbar__nav-icon">${UI.Icons.cart}</span>
          <span class="hide-mobile">Cart</span>
          <span class="navbar__badge" id="cart-badge"></span>
        </a>

        <!-- Auth: Login/Register links (shown when logged out) -->
        <div id="auth-links" style="display:flex;gap:4px;align-items:center">
          <a href="/login.html" class="btn btn--ghost btn--sm">Login</a>
          <a href="/register.html" class="btn btn--primary btn--sm">Register</a>
        </div>

        <!-- Auth: User dropdown (shown when logged in) -->
        <div class="navbar__user-menu" id="user-menu" style="display:none">
          <button class="navbar__nav-link" id="user-menu-trigger">
            <span class="avatar avatar--sm">U</span>
            <span style="width:14px;height:14px">${UI.Icons.chevronDown}</span>
          </button>
          <div class="navbar__user-dropdown" id="user-dropdown">
            <a href="/account.html" class="navbar__user-dropdown-item">
              <span style="width:16px;height:16px">${UI.Icons.user}</span>
              My Account
            </a>
            <a href="/account.html?tab=orders" class="navbar__user-dropdown-item">
              <span style="width:16px;height:16px">${UI.Icons.package}</span>
              Orders
            </a>
            <a href="/account.html?tab=wishlist" class="navbar__user-dropdown-item">
              <span style="width:16px;height:16px">${UI.Icons.heart}</span>
              Wishlist
            </a>
            <a href="/admin/dashboard.html" class="navbar__user-dropdown-item" data-admin-link style="display:none">
              <span style="width:16px;height:16px">${UI.Icons.shieldCheck}</span>
              Admin Dashboard
            </a>
            <div class="navbar__user-dropdown-divider"></div>
            <button class="navbar__user-dropdown-item navbar__user-dropdown-item--danger" onclick="Auth.handleLogout()">
              <span style="width:16px;height:16px">${UI.Icons.logout}</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile toggle -->
      <button class="navbar__mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">
        ${UI.Icons.menu}
      </button>
    </div>

    <!-- Mega menu -->
    <div class="mega-menu" id="mega-menu">
      <div class="mega-menu__grid" id="mega-menu-grid">
        <!-- Categories loaded dynamically -->
      </div>
    </div>
  </nav>`;
}

// ================================================================
//  FOOTER HTML
// ================================================================

function getFooterHTML() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <!-- Brand -->
        <div class="footer__brand">
          <div class="footer__brand-logo">
            <span style="width:28px;height:28px;color:var(--accent)">${UI.Icons.gear}</span>
            Auto<span style="color:var(--accent)">Parts</span>
          </div>
          <p class="footer__brand-desc">
            Your trusted source for quality car spare parts. Engineered for performance, built for reliability.
          </p>
          <div class="footer__social">
            <a href="#" class="footer__social-link" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" class="footer__social-link" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.28-.03-.56-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" class="footer__social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="footer__section-title">Quick Links</h4>
          <a href="/index.html" class="footer__link">Home</a>
          <a href="/products.html" class="footer__link">All Products</a>
          <a href="/cart.html" class="footer__link">Shopping Cart</a>
          <a href="/account.html" class="footer__link">My Account</a>
          <a href="/account.html?tab=orders" class="footer__link">Track Order</a>
        </div>

        <!-- Categories -->
        <div>
          <h4 class="footer__section-title">Categories</h4>
          <a href="/products.html?category=brakes" class="footer__link">Brakes</a>
          <a href="/products.html?category=engine" class="footer__link">Engine Parts</a>
          <a href="/products.html?category=suspension" class="footer__link">Suspension</a>
          <a href="/products.html?category=electrical" class="footer__link">Electrical</a>
          <a href="/products.html?category=filters" class="footer__link">Filters</a>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="footer__section-title">Newsletter</h4>
          <p class="footer__brand-desc" style="margin-bottom: var(--space-4)">
            Get the latest deals and new arrivals straight to your inbox.
          </p>
          <div class="footer__newsletter">
            <form class="footer__newsletter-form" id="newsletter-form" onsubmit="event.preventDefault(); UI.showToast('Thanks for subscribing!', 'success');">
              <input type="email" class="footer__newsletter-input" placeholder="Enter your email" required aria-label="Email for newsletter" />
              <button type="submit" class="btn btn--primary btn--sm">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <span>&copy; ${new Date().getFullYear()} AutoParts. All rights reserved.</span>
        <span>Crafted with precision for car enthusiasts.</span>
      </div>
    </div>
  </footer>`;
}

// ================================================================
//  INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Inject Navbar ──
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.outerHTML = getNavbarHTML();
  }

  // ── Inject Footer ──
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = getFooterHTML();
  }

  // ── Initialize Auth State ──
  Auth.updateNavbarAuthState();

  // ── Initialize Cart Badge ──
  Cart.updateCartBadge();

  // ── Mobile menu toggle ──
  const mobileToggle = document.getElementById('mobile-toggle');
  const navbarNav = document.getElementById('navbar-nav');
  if (mobileToggle && navbarNav) {
    mobileToggle.addEventListener('click', () => {
      navbarNav.classList.toggle('is-active');
      const isOpen = navbarNav.classList.contains('is-active');
      mobileToggle.innerHTML = isOpen ? UI.Icons.close : UI.Icons.menu;
    });
  }

  // ── User dropdown toggle ──
  const userMenuTrigger = document.getElementById('user-menu-trigger');
  const userDropdown = document.getElementById('user-dropdown');
  if (userMenuTrigger && userDropdown) {
    userMenuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('is-active');
    });
    document.addEventListener('click', () => {
      userDropdown.classList.remove('is-active');
    });
  }

  // ── Categories mega-menu ──
  const categoriesTrigger = document.getElementById('categories-trigger');
  const megaMenu = document.getElementById('mega-menu');
  if (categoriesTrigger && megaMenu) {
    let categoriesLoaded = false;

    categoriesTrigger.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isOpen = megaMenu.classList.toggle('is-active');
      categoriesTrigger.setAttribute('aria-expanded', isOpen);

      // Lazy-load categories on first open
      if (isOpen && !categoriesLoaded) {
        categoriesLoaded = true;
        try {
          const categories = await API.Categories.getAll();
          renderMegaMenu(categories);
        } catch {
          // Fallback: show placeholder categories
          renderMegaMenuFallback();
        }
      }
    });

    document.addEventListener('click', () => {
      megaMenu.classList.remove('is-active');
      categoriesTrigger.setAttribute('aria-expanded', 'false');
    });

    megaMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  // ── Search autocomplete ──
  initSearchAutocomplete();
});

// ================================================================
//  MEGA MENU RENDERING
// ================================================================

function renderMegaMenu(categories) {
  const grid = document.getElementById('mega-menu-grid');
  if (!grid || !categories) return;

  // Group: top-level categories (parentCategoryId === null)
  const topLevel = Array.isArray(categories)
    ? categories.filter((c) => !c.parentCategoryId)
    : [];

  if (topLevel.length === 0) {
    renderMegaMenuFallback();
    return;
  }

  grid.innerHTML = topLevel
    .slice(0, 8)
    .map((cat) => {
      const subs = categories.filter((c) => c.parentCategoryId === cat.categoryId);
      return `
      <div class="mega-menu__category">
        <a href="/products.html?categoryId=${cat.categoryId}" class="mega-menu__category-title">${cat.categoryName}</a>
        ${subs
          .slice(0, 6)
          .map(
            (sub) =>
              `<a href="/products.html?categoryId=${sub.categoryId}" class="mega-menu__link">${sub.categoryName}</a>`
          )
          .join('')}
        ${subs.length > 6 ? `<a href="/products.html?categoryId=${cat.categoryId}" class="mega-menu__link" style="color:var(--accent)">View all →</a>` : ''}
      </div>`;
    })
    .join('');
}

function renderMegaMenuFallback() {
  const grid = document.getElementById('mega-menu-grid');
  if (!grid) return;
  const fallbackCategories = [
    { name: 'Engine Parts', items: ['Pistons', 'Gaskets', 'Timing Belts', 'Oil Pumps', 'Spark Plugs'] },
    { name: 'Brakes', items: ['Brake Pads', 'Rotors', 'Calipers', 'Brake Fluid', 'ABS Sensors'] },
    { name: 'Suspension', items: ['Shock Absorbers', 'Springs', 'Control Arms', 'Bushings', 'Struts'] },
    { name: 'Electrical', items: ['Batteries', 'Alternators', 'Starters', 'Sensors', 'Wiring'] },
  ];

  grid.innerHTML = fallbackCategories
    .map(
      (cat) => `
      <div class="mega-menu__category">
        <span class="mega-menu__category-title">${cat.name}</span>
        ${cat.items.map((item) => `<a href="/products.html" class="mega-menu__link">${item}</a>`).join('')}
      </div>`
    )
    .join('');
}

// ================================================================
//  SEARCH AUTOCOMPLETE
// ================================================================

function initSearchAutocomplete() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      results.classList.remove('is-active');
      results.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const data = await API.Products.search(query);
        const products = Array.isArray(data) ? data : data?.items || data?.products || [];

        if (products.length === 0) {
          results.innerHTML = `
            <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:var(--fs-sm)">
              No products found for "${query}"
            </div>`;
          results.classList.add('is-active');
          return;
        }

        results.innerHTML = products
          .slice(0, 6)
          .map(
            (p) => `
          <a href="/product-details.html?id=${p.productId}" class="search-result-item">
            <img src="${p.imageUrl || p.images?.[0]?.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;%3E%3Crect fill=&quot;%231C2333&quot; width=&quot;100&quot; height=&quot;100&quot;/%3E%3C/svg%3E'}" 
                 alt="${p.productName}" 
                 class="search-result-item__image" />
            <div class="search-result-item__info">
              <div class="search-result-item__name">${p.productName}</div>
              <div class="search-result-item__price">${formatPrice(p.unitPrice)}</div>
            </div>
          </a>`
          )
          .join('');

        // Add "View all" link
        results.innerHTML += `
          <a href="/products.html?search=${encodeURIComponent(query)}" 
             class="search-result-item" style="justify-content:center;color:var(--accent);font-weight:500;font-size:var(--fs-sm)">
            View all results for "${query}" →
          </a>`;

        results.classList.add('is-active');
      } catch {
        results.classList.remove('is-active');
      }
    }, 300);
  });

  // Handle Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
      }
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#navbar-search')) {
      results.classList.remove('is-active');
    }
  });

  // Close on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      results.classList.remove('is-active');
      input.blur();
    }
  });
}

// ================================================================
//  PRODUCT CARD RENDERING HELPER
// ================================================================

/**
 * Render a product card HTML string.
 * @param {Object} product - Product data
 * @returns {string} Product card HTML
 */
function renderProductCard(product) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.imageUrl || product.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%231C2333%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236B7685%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E';

  // Calculate average rating
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Check stock
  const inventories = product.inventories || [];
  const totalStock = inventories.reduce((sum, inv) => sum + (inv.quantityInStock || 0), 0);
  const inStock = totalStock > 0;

  return `
    <div class="product-card" data-product-id="${product.productId}">
      <div class="product-card__image-wrapper">
        <img src="${imageUrl}" alt="${product.productName}" class="product-card__image" loading="lazy" />
        <div class="product-card__badges">
          ${inStock
            ? '<span class="badge badge--stock">In Stock</span>'
            : '<span class="badge badge--out-of-stock">Out of Stock</span>'}
        </div>
        <button class="product-card__wishlist" onclick="event.preventDefault(); Cart.addToWishlist(${product.productId})" title="Add to Wishlist">
          ${UI.Icons.heart}
        </button>
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${product.category?.categoryName || ''}</span>
        <h3 class="product-card__name">
          <a href="/product-details.html?id=${product.productId}">${product.productName}</a>
        </h3>
        <div class="product-card__rating">
          ${UI.renderStars(avgRating)}
          <span class="product-card__rating-count">(${reviews.length})</span>
        </div>
      </div>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(product.unitPrice)}</span>
        <button class="product-card__add-cart" onclick="event.preventDefault(); Cart.addToCart(${product.productId})" title="Add to Cart" ${!inStock ? 'disabled' : ''}>
          ${UI.Icons.cart}
        </button>
      </div>
    </div>`;
}

// Make renderProductCard globally available
window.renderProductCard = renderProductCard;
