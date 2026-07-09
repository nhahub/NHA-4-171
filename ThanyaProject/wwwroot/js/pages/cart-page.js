/* ============================================================
   CarSparePartSys — Cart Page Logic
   ============================================================ */

let cartItems = [];
let appliedCoupon = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('breadcrumb').innerHTML = UI.renderBreadcrumb([
    { label: 'Home', url: '/index.html' },
    { label: 'Shopping Cart' },
  ]);

  if (!Auth.isLoggedIn()) {
    document.getElementById('cart-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">${UI.Icons.cart}</div>
        <h3 class="empty-state__title">Please log in</h3>
        <p class="empty-state__message">You need to be logged in to view your cart.</p>
        <a href="/login.html" class="btn btn--primary">Login</a>
      </div>`;
    return;
  }

  loadCart();
});

async function loadCart() {
  const content = document.getElementById('cart-content');
  UI.renderSkeletons(content, 'list', 3);

  try {
    const cart = await API.Cart.get();
    cartItems = cart?.cartItems || cart?.items || [];

    if (cartItems.length === 0) {
      UI.renderEmptyState(content, 'cart');
      return;
    }

    const storedCoupon = sessionStorage.getItem('applied_coupon');
    if (storedCoupon) {
      try {
        appliedCoupon = JSON.parse(storedCoupon);
      } catch (e) {
        appliedCoupon = null;
      }
    }

    renderCart();
  } catch (err) {
    UI.renderEmptyState(content, 'cart');
  }
}

function renderCart() {
  const content = document.getElementById('cart-content');
  const summary = Cart.calculateCartSummary(cartItems, appliedCoupon);

  content.innerHTML = `
    <div class="cart-page">
      <div class="cart-items">
        ${cartItems.map((item, i) => {
          const product = item.product || {};
          const img = product.imageUrl || product.images?.[0]?.imageUrl || '';
          const price = item.unitPrice || product.unitPrice || 0;
          const lineTotal = price * item.quantity;
          return `
          <div class="cart-item" data-index="${i}">
            <img src="${img || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%231C2333%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'}" alt="${product.productName || 'Product'}" class="cart-item__image" />
            <div class="cart-item__body">
              <a href="/product-details.html?id=${item.productId}" class="cart-item__name">${product.productName || 'Product'}</a>
              <span class="cart-item__sku">SKU: ${product.sku || 'N/A'}</span>
              <div class="cart-item__bottom">
                <div class="qty-input">
                  <button class="qty-input__btn" onclick="updateItemQty(${item.cartItemId}, ${item.quantity - 1})">${UI.Icons.minus}</button>
                  <input type="number" class="qty-input__value" value="${item.quantity}" min="1" onchange="updateItemQty(${item.cartItemId}, this.value)" />
                  <button class="qty-input__btn" onclick="updateItemQty(${item.cartItemId}, ${item.quantity + 1})">${UI.Icons.plus}</button>
                </div>
                <span class="cart-item__price">${formatPrice(lineTotal)}</span>
              </div>
            </div>
            <button class="cart-item__remove" onclick="removeItem(${item.cartItemId})" title="Remove item">${UI.Icons.trash}</button>
          </div>`;
        }).join('')}
      </div>

      <div class="cart-summary">
        <h3 class="cart-summary__title">Order Summary</h3>

        <div class="cart-summary__row">
          <span class="cart-summary__row-label">Subtotal (${cartItems.length} items)</span>
          <span class="cart-summary__row-value">${formatPrice(summary.subtotal)}</span>
        </div>

        <!-- Coupon -->
        <div class="coupon-form">
          <input type="text" class="coupon-form__input" id="coupon-input" placeholder="Coupon code" value="${appliedCoupon?.code || ''}" />
          <button class="btn btn--outline btn--sm" onclick="applyCoupon()">${appliedCoupon ? 'Change' : 'Apply'}</button>
        </div>

        ${appliedCoupon ? `
        <div class="cart-summary__row cart-summary__row--discount">
          <span class="cart-summary__row-label">Discount (${appliedCoupon.code})</span>
          <span class="cart-summary__row-value">-${formatPrice(summary.discount)}</span>
        </div>` : ''}

        <div class="cart-summary__row">
          <span class="cart-summary__row-label">Tax</span>
          <span class="cart-summary__row-value">${formatPrice(summary.tax)}</span>
        </div>

        <div class="cart-summary__row cart-summary__row--total">
          <span class="cart-summary__row-label">Total</span>
          <span class="cart-summary__row-value">${formatPrice(summary.total)}</span>
        </div>

        <a href="/checkout.html" class="btn btn--primary btn--lg" style="width:100%;margin-top:var(--space-5)">
          Proceed to Checkout
        </a>
      </div>
    </div>`;
}

async function updateItemQty(itemId, newQty) {
  newQty = parseInt(newQty, 10);
  if (newQty < 1) {
    removeItem(itemId);
    return;
  }
  try {
    await API.Cart.updateItem(itemId, newQty);
    await loadCart();
    Cart.updateCartBadge();
  } catch (err) {
    UI.handleApiError(err);
  }
}
window.updateItemQty = updateItemQty;

async function removeItem(itemId) {
  try {
    await API.Cart.removeItem(itemId);
    UI.showToast('Item removed from cart.', 'success');
    await loadCart();
    Cart.updateCartBadge();
  } catch (err) {
    UI.handleApiError(err);
  }
}
window.removeItem = removeItem;

async function applyCoupon() {
  const code = document.getElementById('coupon-input')?.value.trim();
  if (!code) {
    UI.showToast('Please enter a coupon code.', 'warning');
    return;
  }
  try {
    const coupon = await API.Coupons.validate(code);
    appliedCoupon = coupon;
    sessionStorage.setItem('applied_coupon', JSON.stringify(coupon));
    UI.showToast(`Coupon "${code}" applied!`, 'success');
    renderCart();
  } catch (err) {
    appliedCoupon = null;
    sessionStorage.removeItem('applied_coupon');
    UI.showToast(err.message || 'Invalid or expired coupon.', 'error');
    renderCart();
  }
}
window.applyCoupon = applyCoupon;
