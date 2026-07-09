/* ============================================================
   CarSparePartSys — UI Module
   Toast notifications, modals, skeleton loaders, empty states,
   breadcrumbs, star ratings, error handlers, and button ripples.
   ============================================================ */

// ================================================================
//  SVG ICON HELPER
// ================================================================

const Icons = {
  // Using inline SVG strings for zero-dependency icons
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  heartFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  returnIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  invoice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  barChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

// ================================================================
//  TOAST NOTIFICATIONS
// ================================================================

/** Ensure toast container exists */
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message - The message to display
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {number} duration - Auto-dismiss duration in ms (default 4000)
 */
function showToast(message, type = 'success', duration = 4000) {
  const container = ensureToastContainer();

  const iconMap = {
    success: Icons.check,
    error: Icons.close,
    warning: '⚠',
    info: 'ℹ',
  };

  const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${iconMap[type]}</span>
    <div class="toast__content">
      <div class="toast__title">${titleMap[type]}</div>
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" onclick="this.closest('.toast').remove()">${Icons.close}</button>
  `;

  container.appendChild(toast);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('is-removing');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}

// ================================================================
//  MODALS
// ================================================================

/**
 * Open a modal with custom content.
 * @param {Object} options - { title, content (HTML string), footer (HTML string), wide }
 */
function openModal({ title = '', content = '', footer = '', wide = false } = {}) {
  // Remove existing modal
  closeModal();

  const modal = document.createElement('div');
  modal.className = 'modal is-active';
  modal.id = 'app-modal';
  modal.innerHTML = `
    <div class="modal__overlay" onclick="UI.closeModal()"></div>
    <div class="modal__content" style="${wide ? 'max-width: 720px;' : ''}">
      ${title ? `
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close" onclick="UI.closeModal()">${Icons.close}</button>
      </div>` : ''}
      <div class="modal__body">${content}</div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Close on Escape
  const handler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handler);
    }
  };
  document.addEventListener('keydown', handler);
}

/** Close the active modal */
function closeModal() {
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// ================================================================
//  SKELETON LOADERS
// ================================================================

/**
 * Render skeleton loader placeholders.
 * @param {HTMLElement} container - Target container
 * @param {'card'|'list'|'text'} type - Skeleton type
 * @param {number} count - Number of skeletons to render
 */
function renderSkeletons(container, type = 'card', count = 8) {
  let html = '';

  if (type === 'card') {
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton-card__image"></div>
          <div class="skeleton-card__body">
            <div class="skeleton skeleton--text-sm"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-lg"></div>
          </div>
          <div class="skeleton-card__footer">
            <div class="skeleton" style="width:60px;height:20px;border-radius:4px"></div>
            <div class="skeleton" style="width:36px;height:36px;border-radius:6px"></div>
          </div>
        </div>`;
    }
  } else if (type === 'list') {
    for (let i = 0; i < count; i++) {
      html += `
        <div style="display:flex;gap:16px;padding:16px;border-bottom:1px solid var(--border)">
          <div class="skeleton" style="width:80px;height:80px;border-radius:8px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton skeleton--text-lg"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm"></div>
          </div>
        </div>`;
    }
  } else if (type === 'text') {
    for (let i = 0; i < count; i++) {
      html += `<div class="skeleton skeleton--text" style="width:${70 + Math.random() * 30}%"></div>`;
    }
  }

  container.innerHTML = html;
}

// ================================================================
//  EMPTY STATES
// ================================================================

const emptyStateConfig = {
  cart: {
    title: 'Your cart is empty',
    message: 'Looks like you haven\'t added any parts yet. Start browsing to find what you need!',
    cta: { text: 'Browse Products', url: '/products.html' },
    icon: Icons.cart,
  },
  search: {
    title: 'No results found',
    message: 'We couldn\'t find any parts matching your search. Try different keywords or browse categories.',
    cta: { text: 'View All Products', url: '/products.html' },
    icon: Icons.search,
  },
  wishlist: {
    title: 'Your wishlist is empty',
    message: 'Save parts you like by clicking the heart icon on any product.',
    cta: { text: 'Explore Products', url: '/products.html' },
    icon: Icons.heart,
  },
  orders: {
    title: 'No orders yet',
    message: 'You haven\'t placed any orders yet. Find the perfect parts for your vehicle!',
    cta: { text: 'Start Shopping', url: '/products.html' },
    icon: Icons.package,
  },
  reviews: {
    title: 'No reviews yet',
    message: 'You haven\'t written any reviews yet. Share your experience with other car enthusiasts!',
    cta: null,
    icon: Icons.star,
  },
  returns: {
    title: 'No return requests',
    message: 'You don\'t have any return requests.',
    cta: null,
    icon: Icons.returnIcon,
  },
  addresses: {
    title: 'No saved addresses',
    message: 'Add a shipping address to speed up your checkout process.',
    cta: null,
    icon: Icons.mapPin,
  },
  generic: {
    title: 'Nothing here',
    message: 'There\'s nothing to display at the moment.',
    cta: { text: 'Go Home', url: '/index.html' },
    icon: Icons.package,
  },
};

/**
 * Render an empty state illustration.
 * @param {HTMLElement} container
 * @param {'cart'|'search'|'wishlist'|'orders'|'reviews'|'returns'|'addresses'|'generic'} type
 */
function renderEmptyState(container, type = 'generic') {
  const config = emptyStateConfig[type] || emptyStateConfig.generic;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">${config.icon}</div>
      <h3 class="empty-state__title">${config.title}</h3>
      <p class="empty-state__message">${config.message}</p>
      ${config.cta ? `<a href="${config.cta.url}" class="btn btn--primary">${config.cta.text}</a>` : ''}
    </div>
  `;
}

// ================================================================
//  BREADCRUMBS
// ================================================================

/**
 * Render breadcrumb navigation.
 * @param {Array<{label: string, url?: string}>} items
 * @returns {string} Breadcrumb HTML string
 */
function renderBreadcrumb(items) {
  if (!items || items.length === 0) return '';

  const crumbs = items.map((item, i) => {
    const isLast = i === items.length - 1;
    const separator = isLast ? '' : `<span class="breadcrumb__separator">${Icons.chevronRight}</span>`;
    if (isLast) {
      return `<span class="breadcrumb__item is-active">${item.label}</span>`;
    }
    return `<span class="breadcrumb__item"><a href="${item.url || '#'}">${item.label}</a></span>${separator}`;
  });

  return `<nav class="breadcrumb" aria-label="Breadcrumb">${crumbs.join('')}</nav>`;
}

// ================================================================
//  STAR RATING
// ================================================================

/**
 * Render star rating display.
 * @param {number} rating - Rating value (0-5)
 * @param {number} maxStars - Maximum stars
 * @returns {string} Stars HTML string
 */
function renderStars(rating, maxStars = 5) {
  let html = '<div class="rating">';
  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      html += `<span class="rating__star is-filled">${Icons.starFilled}</span>`;
    } else if (i - 0.5 <= rating) {
      html += `<span class="rating__star is-half">${Icons.starFilled}</span>`;
    } else {
      html += `<span class="rating__star">${Icons.star}</span>`;
    }
  }
  html += '</div>';
  return html;
}

/**
 * Render interactive star rating selector.
 * @param {string} inputName - Name for the hidden input
 * @param {number} currentValue - Current selected value
 * @returns {string} Interactive rating HTML
 */
function renderStarSelector(inputName = 'rating', currentValue = 0) {
  let html = `<div class="rating rating--interactive" data-rating-selector>`;
  html += `<input type="hidden" name="${inputName}" value="${currentValue}">`;
  for (let i = 1; i <= 5; i++) {
    const filled = i <= currentValue;
    html += `<span class="rating__star ${filled ? 'is-filled' : ''}" data-value="${i}">${filled ? Icons.starFilled : Icons.star}</span>`;
  }
  html += '</div>';
  return html;
}

// ================================================================
//  ERROR HANDLING
// ================================================================

/**
 * Handle API errors with appropriate toasts and redirects.
 * @param {Error} error - Error object with .status property
 */
function handleApiError(error) {
  const status = error?.status;

  switch (status) {
    case 401:
      showToast('Please log in to continue.', 'error');
      Auth.removeToken();
      Auth.removeUser();
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
      break;
    case 403:
      showToast('You don\'t have permission to perform this action.', 'error');
      break;
    case 404:
      showToast('The requested resource was not found.', 'error');
      break;
    case 409:
      showToast(error.message || 'Conflict: this resource already exists.', 'warning');
      break;
    case 422:
      showToast(error.message || 'Invalid data. Please check your input.', 'error');
      break;
    case 500:
      showToast('Server error. Please try again later.', 'error');
      break;
    case 0:
      showToast('Network error. Please check your connection.', 'error');
      break;
    default:
      showToast(error.message || 'Something went wrong. Please try again.', 'error');
  }
}

// ================================================================
//  BUTTON RIPPLE EFFECT
// ================================================================

/** Initialize ripple effect on all .btn elements */
function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'btn__ripple';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// ================================================================
//  STAR RATING INTERACTIVITY
// ================================================================

/** Initialize interactive star selectors */
function initStarSelectors() {
  document.addEventListener('click', (e) => {
    const star = e.target.closest('[data-rating-selector] [data-value]');
    if (!star) return;

    const container = star.closest('[data-rating-selector]');
    const value = parseInt(star.dataset.value, 10);
    const input = container.querySelector('input[type="hidden"]');

    if (input) input.value = value;

    // Update visual state
    container.querySelectorAll('.rating__star').forEach((s) => {
      const v = parseInt(s.dataset.value, 10);
      if (v <= value) {
        s.classList.add('is-filled');
        s.innerHTML = Icons.starFilled;
      } else {
        s.classList.remove('is-filled');
        s.innerHTML = Icons.star;
      }
    });
  });
}

// ================================================================
//  INITIALIZATION
// ================================================================

/** Run on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  initButtonRipples();
  initStarSelectors();
});

// ── Export ──
window.UI = {
  Icons,
  showToast,
  openModal,
  closeModal,
  renderSkeletons,
  renderEmptyState,
  renderBreadcrumb,
  renderStars,
  renderStarSelector,
  handleApiError,
};
