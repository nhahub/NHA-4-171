/* ============================================================
   CarSparePartSys — Cart Module
   Cart state management, currency formatting utility,
   and navbar badge updates.
   ============================================================ */

// ================================================================
//  CURRENCY FORMATTING
// ================================================================

/**
 * Format a numeric amount as USD currency string.
 * @param {number} amount - The price value
 * @returns {string} Formatted string like "$149.99"
 */
function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ================================================================
//  CART BADGE
// ================================================================

/** Update the cart item count badge in the navbar */
async function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  if (!Auth.isLoggedIn()) {
    badge.textContent = '';
    return;
  }

  try {
    const cart = await API.Cart.get();
    const count = cart?.cartItems?.length || cart?.items?.length || 0;
    badge.textContent = count > 0 ? count : '';
  } catch {
    badge.textContent = '';
  }
}

// ================================================================
//  CART SUMMARY CALCULATIONS
// ================================================================

/**
 * Calculate cart summary totals.
 * @param {Array} items - Cart items with { quantity, product: { unitPrice } }
 * @param {Object|null} coupon - Applied coupon object
 * @returns {Object} { subtotal, discount, tax, total }
 */
function calculateCartSummary(items, coupon = null) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.unitPrice || item.product?.unitPrice || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 0 || coupon.discountType === 'Percentage') {
      // Percentage discount
      discount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discount = coupon.discountValue;
    }
  }

  // Simple tax calculation (can be adjusted)
  const taxRate = 0.14; // 14% tax
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  return {
    subtotal: Math.max(0, subtotal),
    discount: Math.max(0, discount),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
  };
}

// ================================================================
//  ADD TO CART (with optimistic UI + toast)
// ================================================================

/**
 * Add a product to cart with feedback.
 * @param {number} productId
 * @param {number} quantity
 */
async function addToCart(productId, quantity = 1) {
  if (!Auth.isLoggedIn()) {
    UI.showToast('Please log in to add items to your cart.', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
    return false;
  }

  try {
    await API.Cart.addItem(productId, quantity);
    await updateCartBadge();
    UI.showToast('Item added to cart!', 'success');
    return true;
  } catch (err) {
    UI.handleApiError(err);
    return false;
  }
}

/**
 * Add product to wishlist with feedback.
 * @param {number} productId
 */
async function addToWishlist(productId) {
  if (!Auth.isLoggedIn()) {
    UI.showToast('Please log in to save items to your wishlist.', 'info');
    return false;
  }

  try {
    await API.Wishlist.add(productId);
    UI.showToast('Added to wishlist!', 'success');
    return true;
  } catch (err) {
    if (err.status === 409) {
      UI.showToast('Already in your wishlist.', 'info');
    } else {
      UI.handleApiError(err);
    }
    return false;
  }
}

/**
 * Remove product from wishlist.
 * @param {number} wishlistId
 */
async function removeFromWishlist(wishlistId) {
  try {
    await API.Wishlist.remove(wishlistId);
    UI.showToast('Removed from wishlist!', 'success');
    
    // Check if we are on account page, reload tab content
    if (window.location.pathname.includes('account.html') && typeof loadTabContent === 'function') {
      loadTabContent('wishlist');
    } else {
      window.location.reload();
    }
    return true;
  } catch (err) {
    UI.handleApiError(err);
    return false;
  }
}

// ── Export ──
window.Cart = {
  formatPrice,
  updateCartBadge,
  calculateCartSummary,
  addToCart,
  addToWishlist,
  removeFromWishlist,
};

// Also export formatPrice as a global for convenience
window.formatPrice = formatPrice;
