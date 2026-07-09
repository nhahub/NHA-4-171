/* ============================================================
   CarSparePartSys — API Module
   Central REST API client. All fetch calls with JWT auth,
   error handling, and configurable base URL.
   ============================================================ */

// ── Configuration ──
const LOCAL_FRONTEND_PORTS = ['3000', '5173', '4200'];
const API_BASE_URL = LOCAL_FRONTEND_PORTS.includes(window.location.port) && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:8085/api'
  : '/api';

// ── Core request helper ──
async function request(method, endpoint, body = null, isFormData = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {};

  // Attach JWT if available
  const token = localStorage.getItem('csps_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set content type for JSON (skip for FormData)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { method, headers };
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle no-content responses
    if (response.status === 204) return null;

    // Parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // Throw on non-2xx
    if (!response.ok) {
      let msg = '';
      if (data && typeof data === 'object') {
        msg = data.message || data.Message || data.title || data.Title || '';
        const errors = data.errors || data.Errors;
        if (errors && typeof errors === 'object') {
          const errorMsgs = [];
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMsgs.push(...messages);
            } else if (typeof messages === 'string') {
              errorMsgs.push(messages);
            }
          });
          if (errorMsgs.length > 0) {
            msg = (msg ? msg + ' ' : '') + errorMsgs.join(' ');
          }
        }
      } else if (typeof data === 'string' && data.trim()) {
        msg = data;
      }

      if (!msg) {
        msg = `Request failed`;
      }
      
      // Log to console for debugging
      console.error('API Request Failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        data,
        parsedMessage: msg
      });

      const error = new Error(`${msg} (Status: ${response.status})`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw API errors, wrap network errors
    if (err.status) throw err;
    const networkError = new Error('Network error. Please check your connection.');
    networkError.status = 0;
    throw networkError;
  }
}

// ================================================================
//  AUTH
// ================================================================
const AuthAPI = {
  login: (credentials) => request('POST', '/auth/login', credentials),
  register: (data) => request('POST', '/auth/register', data),
  refreshToken: (refreshToken) => request('POST', '/auth/refresh-token', { refreshToken }),
  getProfile: () => request('GET', '/auth/profile'),
  updateProfile: (data) => request('PUT', '/auth/profile', data),
};

// ================================================================
//  PRODUCTS
// ================================================================
const ProductsAPI = {
  /**
   * @param {Object} filters - { categoryId, brandId, modelId, supplierId, minPrice, maxPrice, sort, page, pageSize, search }
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    const qs = params.toString();
    return request('GET', `/products${qs ? '?' + qs : ''}`);
  },

  getById: (id) => request('GET', `/products/${id}`),

  search: (query) => request('GET', `/products/search?q=${encodeURIComponent(query)}`),

  getFeatured: () => request('GET', '/products/featured'),

  getByCategory: (categoryId, page = 1) =>
    request('GET', `/products?categoryId=${categoryId}&page=${page}`),

  // Admin
  create: (data) => request('POST', '/products', data),
  update: (id, data) => request('PUT', `/products/${id}`, data),
  delete: (id) => request('DELETE', `/products/${id}`),
};

// ================================================================
//  CATEGORIES
// ================================================================
const CategoriesAPI = {
  getAll: () => request('GET', '/categories'),
  getById: (id) => request('GET', `/categories/${id}`),
  // Admin
  create: (data) => request('POST', '/categories', data),
  update: (id, data) => request('PUT', `/categories/${id}`, data),
  delete: (id) => request('DELETE', `/categories/${id}`),
};

// ================================================================
//  CAR BRANDS & MODELS
// ================================================================
const CarBrandsAPI = {
  getAll: () => request('GET', '/carbrands'),
  getById: (id) => request('GET', `/carbrands/${id}`),
  getModels: (brandId) => request('GET', `/carbrands/${brandId}/models`),
  // Admin
  create: (data) => request('POST', '/carbrands', data),
  update: (id, data) => request('PUT', `/carbrands/${id}`, data),
  delete: (id) => request('DELETE', `/carbrands/${id}`),
};

const CarModelsAPI = {
  getAll: () => request('GET', '/carmodels'),
  create: (data) => request('POST', '/carmodels', data),
  update: (id, data) => request('PUT', `/carmodels/${id}`, data),
  delete: (id) => request('DELETE', `/carmodels/${id}`),
};

// ================================================================
//  CART
// ================================================================
const CartAPI = {
  get: () => request('GET', '/cart'),
  addItem: (productId, quantity = 1) =>
    request('POST', '/cart/items', { productId, quantity }),
  updateItem: (itemId, quantity) =>
    request('PUT', `/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => request('DELETE', `/cart/items/${itemId}`),
  clear: () => request('DELETE', '/cart'),
};

// ================================================================
//  WISHLIST
// ================================================================
const WishlistAPI = {
  getAll: () => request('GET', '/wishlist'),
  add: (productId) => request('POST', '/wishlist', { productId }),
  remove: (id) => request('DELETE', `/wishlist/${id}`),
};

// ================================================================
//  ORDERS
// ================================================================
const OrdersAPI = {
  getAll: () => request('GET', '/orders'),
  getById: (id) => request('GET', `/orders/${id}`),
  create: (data) => request('POST', '/orders', data),
  // Admin
  updateStatus: (id, statusId, cancelReason = null) => {
    const body = { statusId };
    if (cancelReason) body.cancelReason = cancelReason;
    return request('PUT', `/orders/${id}/status`, body);
  },
  updatePaymentStatus: (id, isPaid) =>
    request('PUT', `/orders/${id}/payment-status`, { isPaid }),
  getAllAdmin: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params.append(key, val);
    });
    const qs = params.toString();
    return request('GET', `/orders/admin${qs ? '?' + qs : ''}`);
  },
};

// ================================================================
//  COUPONS
// ================================================================
const CouponsAPI = {
  validate: (code) => request('POST', '/coupons/validate', { code }),
  // Admin
  getAll: () => request('GET', '/coupons'),
  create: (data) => request('POST', '/coupons', data),
  update: (id, data) => request('PUT', `/coupons/${id}`, data),
  delete: (id) => request('DELETE', `/coupons/${id}`),
};

// ================================================================
//  ADDRESSES
// ================================================================
const AddressesAPI = {
  getAll: () => request('GET', '/addresses'),
  getById: (id) => request('GET', `/addresses/${id}`),
  create: (data) => request('POST', '/addresses', data),
  update: (id, data) => request('PUT', `/addresses/${id}`, data),
  delete: (id) => request('DELETE', `/addresses/${id}`),
  setDefault: (id) => request('PUT', `/addresses/${id}/default`),
};

// ================================================================
//  PAYMENT METHODS
// ================================================================
const PaymentMethodsAPI = {
  getAll: () => request('GET', '/paymentmethods'),
  // Admin
  create: (data) => request('POST', '/paymentmethods', data),
  update: (id, data) => request('PUT', `/paymentmethods/${id}`, data),
};

// ================================================================
//  REVIEWS
// ================================================================
const ReviewsAPI = {
  getByProduct: (productId) => request('GET', `/products/${productId}/reviews`),
  create: (productId, data) => request('POST', `/products/${productId}/reviews`, data),
  getUserReviews: () => request('GET', '/reviews/mine'),
  delete: (id) => request('DELETE', `/reviews/${id}`),
  getAllAdmin: () => request('GET', '/reviews/admin'),
  toggleVerify: (id) => request('PUT', `/reviews/${id}/toggle-verify`),
};

// ================================================================
//  INVOICES
// ================================================================
const InvoicesAPI = {
  getByOrder: (orderId) => request('GET', `/orders/${orderId}/invoice`),
  download: (orderId) => request('GET', `/orders/${orderId}/invoice/download`),
};

// ================================================================
//  RETURNS
// ================================================================
const ReturnsAPI = {
  getAll: () => request('GET', '/returns'),
  create: (data) => request('POST', '/returns', data),
  // Admin
  updateStatus: (id, data) => request('PUT', `/returns/${id}`, data),
  getAllAdmin: () => request('GET', '/returns/admin'),
};

// ================================================================
//  SHIPPING
// ================================================================
const ShippingAPI = {
  getByOrder: (orderId) => request('GET', `/orders/${orderId}/shipping`),
};

// ================================================================
//  SUPPLIERS
// ================================================================
const SuppliersAPI = {
  getAll: () => request('GET', '/suppliers'),
  // Admin
  create: (data) => request('POST', '/suppliers', data),
  update: (id, data) => request('PUT', `/suppliers/${id}`, data),
  delete: (id) => request('DELETE', `/suppliers/${id}`),
};

// ================================================================
//  INVENTORY & WAREHOUSES
// ================================================================
const InventoryAPI = {
  getByProduct: (productId) => request('GET', `/inventory/product/${productId}`),
  // Admin
  update: (id, data) => request('PUT', `/inventory/${id}`, data),
  getTransactions: () => request('GET', '/inventory/transactions'),
  adjustStock: (data) => request('POST', '/inventory/adjust', data),
};

const WarehousesAPI = {
  getAll: () => request('GET', '/warehouses'),
  create: (data) => request('POST', '/warehouses', data),
  update: (id, data) => request('PUT', `/warehouses/${id}`, data),
};

// ================================================================
//  ORDER STATUSES (Admin)
// ================================================================
const OrderStatusesAPI = {
  getAll: () => request('GET', '/orderstatuses'),
  create: (data) => request('POST', '/orderstatuses', data),
  update: (id, data) => request('PUT', `/orderstatuses/${id}`, data),
};

// ================================================================
//  COMPATIBILITY
// ================================================================
const CompatibilityAPI = {
  getAll: () => request('GET', '/compatibility'),
  create: (data) => request('POST', '/compatibility', data),
  delete: (id) => request('DELETE', `/compatibility/${id}`),
};

// ── Export all API modules ──
window.API = {
  Auth: AuthAPI,
  Products: ProductsAPI,
  Categories: CategoriesAPI,
  CarBrands: CarBrandsAPI,
  CarModels: CarModelsAPI,
  Cart: CartAPI,
  Wishlist: WishlistAPI,
  Orders: OrdersAPI,
  Coupons: CouponsAPI,
  Addresses: AddressesAPI,
  PaymentMethods: PaymentMethodsAPI,
  Reviews: ReviewsAPI,
  Invoices: InvoicesAPI,
  Returns: ReturnsAPI,
  Shipping: ShippingAPI,
  Suppliers: SuppliersAPI,
  Inventory: InventoryAPI,
  Warehouses: WarehousesAPI,
  OrderStatuses: OrderStatusesAPI,
  Compatibility: CompatibilityAPI,
};
