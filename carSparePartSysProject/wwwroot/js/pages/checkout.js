/* ============================================================
   CarSparePartSys — Checkout Page Logic
   Multi-step: select address → payment → review & place order.
   ============================================================ */

let checkoutData = { addresses: [], paymentMethods: [], cartItems: [], selectedAddressId: null, selectedPaymentId: null };
let appliedCoupon = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;

  document.getElementById('breadcrumb').innerHTML = UI.renderBreadcrumb([
    { label: 'Home', url: '/index.html' },
    { label: 'Cart', url: '/cart.html' },
    { label: 'Checkout' },
  ]);

  loadCheckoutData();
});

async function loadCheckoutData() {
  const content = document.getElementById('checkout-content');
  UI.renderSkeletons(content, 'list', 3);

  try {
    const [cart, addresses, paymentMethods] = await Promise.all([
      API.Cart.get(),
      API.Addresses.getAll(),
      API.PaymentMethods.getAll(),
    ]);

    checkoutData.cartItems = cart?.cartItems || cart?.items || [];
    checkoutData.addresses = Array.isArray(addresses) ? addresses : addresses?.items || [];
    checkoutData.paymentMethods = Array.isArray(paymentMethods) ? paymentMethods : paymentMethods?.items || [];

    const storedCoupon = sessionStorage.getItem('applied_coupon');
    if (storedCoupon) {
      try {
        appliedCoupon = JSON.parse(storedCoupon);
      } catch (e) {
        appliedCoupon = null;
      }
    } else {
      appliedCoupon = null;
    }

    if (checkoutData.cartItems.length === 0) {
      UI.renderEmptyState(content, 'cart');
      return;
    }

    // Pre-select default address
    const defaultAddr = checkoutData.addresses.find(a => a.isDefault);
    if (defaultAddr) checkoutData.selectedAddressId = defaultAddr.addressId;
    else if (checkoutData.addresses.length > 0) checkoutData.selectedAddressId = checkoutData.addresses[0].addressId;

    // Pre-select first payment method
    if (checkoutData.paymentMethods.length > 0) checkoutData.selectedPaymentId = checkoutData.paymentMethods[0].paymentMethodId;

    renderCheckout();
  } catch (err) {
    UI.handleApiError(err);
  }
}

function renderCheckout() {
  const content = document.getElementById('checkout-content');
  const summary = Cart.calculateCartSummary(checkoutData.cartItems, appliedCoupon);

  content.innerHTML = `
    <div class="checkout-page">
      <div class="checkout-steps">
        <!-- Step 1: Shipping Address -->
        <div class="checkout-step">
          <div class="checkout-step__header">
            <span class="checkout-step__number is-active">1</span>
            <h3 class="checkout-step__title">Shipping Address</h3>
          </div>
          <div class="checkout-step__body">
            ${checkoutData.addresses.length > 0 ? `
              <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                ${checkoutData.addresses.map(addr => `
                  <label class="address-card ${addr.addressId === checkoutData.selectedAddressId ? 'is-selected' : ''}" onclick="selectAddress(${addr.addressId}, this)">
                    <input type="radio" name="address" value="${addr.addressId}" class="address-card__radio" ${addr.addressId === checkoutData.selectedAddressId ? 'checked' : ''} style="display:none" />
                    <div>
                      <input type="radio" name="address_visible" ${addr.addressId === checkoutData.selectedAddressId ? 'checked' : ''} style="accent-color:var(--accent)" />
                    </div>
                    <div class="address-card__details">
                      <div class="address-card__name">${addr.fullName} ${addr.isDefault ? '<span class="badge badge--default" style="margin-left:8px">Default</span>' : ''}</div>
                      <div class="address-card__address">${addr.street}, ${addr.city}${addr.state ? ', ' + addr.state : ''} ${addr.postalCode || ''}<br/>${addr.country}</div>
                      <div class="address-card__phone">${addr.phone}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            ` : '<p class="text--muted">No saved addresses.</p>'}
            <button class="btn btn--outline btn--sm" style="margin-top:var(--space-4)" onclick="showAddAddressModal()">
              ${UI.Icons.plus} Add New Address
            </button>
          </div>
        </div>

        <!-- Step 2: Payment Method -->
        <div class="checkout-step">
          <div class="checkout-step__header">
            <span class="checkout-step__number is-active">2</span>
            <h3 class="checkout-step__title">Payment Method</h3>
          </div>
          <div class="checkout-step__body">
            ${checkoutData.paymentMethods.length > 0 ? `
              <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                ${checkoutData.paymentMethods.filter(pm => pm.isActive).map(pm => `
                  <label class="address-card ${pm.paymentMethodId === checkoutData.selectedPaymentId ? 'is-selected' : ''}" onclick="selectPayment(${pm.paymentMethodId}, this)">
                    <input type="radio" name="payment" value="${pm.paymentMethodId}" ${pm.paymentMethodId === checkoutData.selectedPaymentId ? 'checked' : ''} style="display:none" />
                    <div>
                      <input type="radio" name="payment_visible" ${pm.paymentMethodId === checkoutData.selectedPaymentId ? 'checked' : ''} style="accent-color:var(--accent)" />
                    </div>
                    <div class="address-card__details">
                      <div class="address-card__name">${pm.methodName}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            ` : '<p class="text--muted">No payment methods available.</p>'}
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="checkout-summary">
        <div class="card">
          <h3 class="card__title" style="margin-bottom:var(--space-5)">Order Summary</h3>
          <div class="checkout-summary__items">
            ${checkoutData.cartItems.map(item => {
              const p = item.product || {};
              const img = p.imageUrl || p.images?.[0]?.imageUrl || '';
              return `
              <div class="checkout-summary-item">
                <img src="${img || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22%3E%3Crect fill=%22%231C2333%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E'}" alt="" class="checkout-summary-item__image" />
                <div class="checkout-summary-item__info">
                  <div class="checkout-summary-item__name">${p.productName || 'Product'}</div>
                  <div class="checkout-summary-item__qty">Qty: ${item.quantity}</div>
                </div>
                <div class="checkout-summary-item__price">${formatPrice((item.unitPrice || p.unitPrice || 0) * item.quantity)}</div>
              </div>`;
            }).join('')}
          </div>

          <div class="cart-summary__row">
            <span class="cart-summary__row-label">Subtotal</span>
            <span class="cart-summary__row-value">${formatPrice(summary.subtotal)}</span>
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

          <button class="btn btn--primary btn--lg" style="width:100%;margin-top:var(--space-6)" id="place-order-btn" onclick="placeOrder()">
            Place Order
          </button>
        </div>
      </div>
    </div>`;
}

function selectAddress(id, el) {
  checkoutData.selectedAddressId = id;
  document.querySelectorAll('.checkout-steps .address-card').forEach(c => c.classList.remove('is-selected'));
  el.classList.add('is-selected');
}
window.selectAddress = selectAddress;

function selectPayment(id, el) {
  checkoutData.selectedPaymentId = id;
  const step = el.closest('.checkout-step__body');
  step.querySelectorAll('.address-card').forEach(c => c.classList.remove('is-selected'));
  el.classList.add('is-selected');
}
window.selectPayment = selectPayment;

function showAddAddressModal() {
  UI.openModal({
    title: 'Add New Address',
    content: `
      <form id="add-address-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">Full Name</label><input class="form-input" name="fullName" required /></div>
          <div class="form-group"><label class="form-label form-label--required">Phone</label><input class="form-input" name="phone" required /></div>
        </div>
        <div class="form-group"><label class="form-label form-label--required">Street</label><input class="form-input" name="street" required /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label form-label--required">City</label><input class="form-input" name="city" required /></div>
          <div class="form-group"><label class="form-label">State</label><input class="form-input" name="state" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Postal Code</label><input class="form-input" name="postalCode" /></div>
          <div class="form-group"><label class="form-label form-label--required">Country</label><input class="form-input" name="country" required /></div>
        </div>
      </form>`,
    footer: `<button class="btn btn--secondary" onclick="UI.closeModal()">Cancel</button><button class="btn btn--primary" onclick="saveNewAddress()">Save Address</button>`,
  });
}
window.showAddAddressModal = showAddAddressModal;

async function saveNewAddress() {
  const form = document.getElementById('add-address-form');
  if (!form) return;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.type = "Shipping";

  if (!data.fullName || !data.phone || !data.street || !data.city || !data.country) {
    UI.showToast('Please fill in all required fields.', 'warning');
    return;
  }

  try {
    await API.Addresses.create(data);
    UI.closeModal();
    UI.showToast('Address added!', 'success');
    loadCheckoutData();
  } catch (err) {
    UI.handleApiError(err);
  }
}
window.saveNewAddress = saveNewAddress;

async function placeOrder() {
  if (!checkoutData.selectedAddressId) {
    UI.showToast('Please select a shipping address.', 'warning');
    return;
  }
  if (!checkoutData.selectedPaymentId) {
    UI.showToast('Please select a payment method.', 'warning');
    return;
  }

  const btn = document.getElementById('place-order-btn');
  if (btn) btn.classList.add('is-loading');

  try {
    const order = await API.Orders.create({
      shippingAddressId: checkoutData.selectedAddressId,
      paymentMethodId: checkoutData.selectedPaymentId,
      couponCode: appliedCoupon ? appliedCoupon.code : null
    });

    sessionStorage.removeItem('applied_coupon');
    UI.showToast('Order placed successfully!', 'success');
    Cart.updateCartBadge();

    setTimeout(() => {
      window.location.href = '/account.html?tab=orders';
    }, 1500);
  } catch (err) {
    UI.handleApiError(err);
    if (btn) btn.classList.remove('is-loading');
  }
}
window.placeOrder = placeOrder;
