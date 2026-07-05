/* ============================================================
   CarSparePartSys — Product Detail Page Logic
   Loads product info, gallery, specs, compatibility,
   reviews, and related products.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    window.location.href = '/products.html';
    return;
  }

  loadProduct(productId);
});

async function loadProduct(productId) {
  const container = document.getElementById('product-detail');
  if (!container) return;

  // Show skeleton
  container.innerHTML = `
    <div class="gallery">
      <div class="skeleton skeleton--image" style="aspect-ratio:1;border-radius:8px"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        ${Array(4).fill('<div class="skeleton" style="width:72px;height:72px;border-radius:6px"></div>').join('')}
      </div>
    </div>
    <div class="product-info">
      <div class="skeleton skeleton--text-sm" style="width:100px"></div>
      <div class="skeleton skeleton--title" style="width:80%"></div>
      <div class="skeleton skeleton--text" style="width:60%"></div>
      <div class="skeleton" style="width:120px;height:36px;border-radius:6px;margin-top:12px"></div>
      <div class="skeleton skeleton--text" style="width:100%;margin-top:16px"></div>
      <div class="skeleton skeleton--text" style="width:90%"></div>
      <div class="skeleton skeleton--text" style="width:80%"></div>
    </div>`;

  try {
    const product = await API.Products.getById(productId);
    renderProductDetail(product);

    // Load reviews
    loadReviews(productId);

    // Load related products
    loadRelatedProducts(product.categoryId, productId);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">${UI.Icons.package}</div>
        <h3 class="empty-state__title">Product Not Found</h3>
        <p class="empty-state__message">This product may have been removed or is no longer available.</p>
        <a href="/products.html" class="btn btn--primary">Browse Products</a>
      </div>`;
  }
}

function renderProductDetail(product) {
  const container = document.getElementById('product-detail');

  // Breadcrumb
  const bcEl = document.getElementById('breadcrumb');
  if (bcEl) {
    bcEl.innerHTML = UI.renderBreadcrumb([
      { label: 'Home', url: '/index.html' },
      { label: 'Products', url: '/products.html' },
      { label: product.category?.categoryName || 'Category', url: `/products.html?categoryId=${product.categoryId}` },
      { label: product.productName },
    ]);
  }

  // Page title
  document.title = `${product.productName} — AutoParts`;

  // Images
  const images = product.images || [];
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });
  const mainImage = sortedImages[0]?.imageUrl || product.imageUrl || '';
  const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%231C2333%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236B7685%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E';

  // Stock
  const inventories = product.inventories || [];
  const totalStock = inventories.reduce((sum, inv) => sum + (inv.quantityInStock || 0), 0);
  const inStock = totalStock > 0;

  // Average rating
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  // Specifications
  const specs = product.specifications || [];

  // Compatibility
  const compat = product.partCompatibilities || [];

  container.innerHTML = `
    <!-- Gallery -->
    <div class="gallery">
      <div class="gallery__main">
        <img src="${mainImage || placeholderImg}" alt="${product.productName}" class="gallery__main-image" id="main-image" />
      </div>
      ${sortedImages.length > 1 ? `
      <div class="gallery__thumbs">
        ${sortedImages.map((img, i) => `
          <button class="gallery__thumb ${i === 0 ? 'is-active' : ''}" data-image-url="${img.imageUrl}" onclick="switchImage(this)">
            <img src="${img.imageUrl}" alt="Thumbnail ${i + 1}" />
          </button>
        `).join('')}
      </div>` : ''}
    </div>

    <!-- Product Info -->
    <div class="product-info">
      <span class="product-info__category">${product.category?.categoryName || ''}</span>
      <h1 class="product-info__name">${product.productName}</h1>

      <div class="product-info__meta">
        <div class="product-card__rating">
          ${UI.renderStars(avgRating)}
          <span class="rating__value">${avgRating.toFixed(1)}</span>
          <span class="product-card__rating-count">(${reviews.length} reviews)</span>
        </div>
        ${inStock
          ? '<span class="badge badge--stock">In Stock</span>'
          : '<span class="badge badge--out-of-stock">Out of Stock</span>'}
      </div>

      <div class="product-info__price-block">
        <span class="price price--lg">${formatPrice(product.unitPrice)}</span>
      </div>

      <div class="product-info__meta">
        <span class="product-info__sku">SKU: <span>${product.sku || 'N/A'}</span></span>
        ${product.partNumber ? `<span class="product-info__sku">Part #: <span>${product.partNumber}</span></span>` : ''}
      </div>

      ${product.description ? `<p class="product-info__desc">${product.description}</p>` : ''}

      <!-- Add to Cart Actions -->
      <div class="product-info__actions">
        <div class="qty-input" id="qty-input">
          <button class="qty-input__btn" onclick="changeQty(-1)">${UI.Icons.minus}</button>
          <input type="number" class="qty-input__value" id="product-qty" value="1" min="1" max="99" />
          <button class="qty-input__btn" onclick="changeQty(1)">${UI.Icons.plus}</button>
        </div>
        <button class="btn btn--primary btn--lg" id="add-to-cart-btn" onclick="handleAddToCart(${product.productId})" ${!inStock ? 'disabled' : ''}>
          ${UI.Icons.cart} Add to Cart
        </button>
        <button class="product-info__wishlist-btn" id="wishlist-btn" onclick="Cart.addToWishlist(${product.productId})" title="Add to Wishlist">
          ${UI.Icons.heart}
        </button>
      </div>

      <!-- Specifications -->
      ${specs.length > 0 ? `
      <div style="margin-top:var(--space-4)">
        <h3 style="font-size:var(--fs-md);margin-bottom:var(--space-3)">Specifications</h3>
        <table class="specs-table">
          ${specs.map(s => `<tr><td>${s.specName}</td><td>${s.specValue}</td></tr>`).join('')}
        </table>
      </div>` : ''}

      <!-- Vehicle Compatibility -->
      ${compat.length > 0 ? `
      <div class="compatibility-section">
        <h3 class="compatibility-section__title">
          ${UI.Icons.truck} Vehicle Compatibility
        </h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Model</th>
                <th>Years</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${compat.map(c => `
                <tr>
                  <td>${c.carModel?.brand?.brandName || ''}</td>
                  <td>${c.carModel?.modelName || ''}</td>
                  <td>${c.carModel?.yearStart || ''}${c.carModel?.yearEnd ? '–' + c.carModel.yearEnd : '+'}</td>
                  <td>${c.notes || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}
    </div>`;
}

// ── Image gallery switch ──
function switchImage(thumb) {
  const mainImg = document.getElementById('main-image');
  if (mainImg && thumb.dataset.imageUrl) {
    mainImg.src = thumb.dataset.imageUrl;
    document.querySelectorAll('.gallery__thumb').forEach(t => t.classList.remove('is-active'));
    thumb.classList.add('is-active');
  }
}
window.switchImage = switchImage;

// ── Quantity control ──
function changeQty(delta) {
  const input = document.getElementById('product-qty');
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, Math.min(99, val + delta));
  input.value = val;
}
window.changeQty = changeQty;

// ── Add to cart ──
async function handleAddToCart(productId) {
  const qty = parseInt(document.getElementById('product-qty')?.value, 10) || 1;
  const btn = document.getElementById('add-to-cart-btn');
  if (btn) btn.classList.add('is-loading');
  await Cart.addToCart(productId, qty);
  if (btn) btn.classList.remove('is-loading');
}
window.handleAddToCart = handleAddToCart;

// ================================================================
//  REVIEWS
// ================================================================

async function loadReviews(productId) {
  const section = document.getElementById('reviews-section');
  if (!section) return;

  try {
    const data = await API.Reviews.getByProduct(productId);
    const reviews = Array.isArray(data) ? data : data?.items || [];

    section.style.display = 'block';

    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-header__title">Customer Reviews</h2>
      </div>

      ${reviews.length > 0 ? `
      <div class="reviews-summary">
        <div class="reviews-summary__avg">
          <div class="reviews-summary__number">${avgRating.toFixed(1)}</div>
          ${UI.renderStars(avgRating)}
          <div class="reviews-summary__total">${reviews.length} reviews</div>
        </div>
      </div>` : ''}

      <div id="reviews-list">
        ${reviews.length > 0
          ? reviews.map(r => `
          <div class="review-card">
            <div class="review-card__header">
              <div class="avatar avatar--sm">${(r.user?.firstName?.[0] || 'U').toUpperCase()}</div>
              <div>
                <div class="review-card__user">${r.user?.firstName || 'User'} ${r.user?.lastName || ''}</div>
                <div class="review-card__date">${new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              ${UI.renderStars(r.rating)}
              ${r.isVerified ? `<span class="review-card__verified">${UI.Icons.check} Verified</span>` : ''}
            </div>
            <p class="review-card__comment">${r.comment || ''}</p>
          </div>`).join('')
          : '<p class="text--muted" style="padding:var(--space-4)">No reviews yet. Be the first to review this product!</p>'
        }
      </div>

      <!-- Review Form -->
      ${Auth.isLoggedIn() ? `
      <div class="review-form">
        <h3 class="review-form__title">Write a Review</h3>
        <form id="review-form" onsubmit="submitReview(event, ${productId})">
          <div class="form-group">
            <label class="form-label">Rating</label>
            ${UI.renderStarSelector('rating', 0)}
          </div>
          <div class="form-group" style="margin-top:var(--space-4)">
            <label class="form-label" for="review-comment">Your Review</label>
            <textarea class="form-textarea" id="review-comment" name="comment" placeholder="Share your experience with this product..." rows="4"></textarea>
          </div>
          <button type="submit" class="btn btn--primary" style="margin-top:var(--space-4)">Submit Review</button>
        </form>
      </div>` : `
      <div class="card" style="text-align:center;margin-top:var(--space-6)">
        <p class="text--muted" style="margin-bottom:var(--space-3)">Please log in to write a review.</p>
        <a href="/login.html" class="btn btn--outline">Login</a>
      </div>`}`;
  } catch {
    section.style.display = 'block';
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-header__title">Customer Reviews</h2>
      </div>
      <p class="text--muted">Unable to load reviews at this time.</p>`;
  }
}

async function submitReview(event, productId) {
  event.preventDefault();
  const form = event.target;
  const rating = parseInt(form.querySelector('input[name="rating"]')?.value, 10);
  const comment = form.querySelector('[name="comment"]')?.value?.trim();

  if (!rating || rating < 1 || rating > 5) {
    UI.showToast('Please select a rating.', 'warning');
    return;
  }

  try {
    await API.Reviews.create(productId, { rating, comment });
    UI.showToast('Review submitted successfully!', 'success');
    loadReviews(productId);
  } catch (err) {
    UI.handleApiError(err);
  }
}
window.submitReview = submitReview;

// ================================================================
//  RELATED PRODUCTS
// ================================================================

async function loadRelatedProducts(categoryId, currentProductId) {
  const section = document.getElementById('related-products');
  if (!section || !categoryId) return;

  try {
    const data = await API.Products.getAll({ categoryId, pageSize: 4 });
    const products = (Array.isArray(data) ? data : data?.items || [])
      .filter(p => String(p.productId) !== String(currentProductId))
      .slice(0, 4);

    if (products.length === 0) return;

    section.style.display = 'block';
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-header__title">Related Products</h2>
        <a href="/products.html?categoryId=${categoryId}" class="section-header__action">
          View All ${UI.Icons.chevronRight}
        </a>
      </div>
      <div class="featured-products">
        ${products.map(p => renderProductCard(p)).join('')}
      </div>`;
  } catch {
    // Silently fail
  }
}
