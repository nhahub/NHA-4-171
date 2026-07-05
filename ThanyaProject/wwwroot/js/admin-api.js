/* ============================================================
   CarSparePartSys — Admin Mock API & Database Layer
   Simulates full CRUD services with localStorage persistence,
   network delays, search, sorting, and pagination logic.
   ============================================================ */

const DELAY_MS = 250;

// ── Local Storage Keys ──
const DB_PREFIX = 'csps_db_';
const keys = {
  products: DB_PREFIX + 'products',
  categories: DB_PREFIX + 'categories',
  suppliers: DB_PREFIX + 'suppliers',
  brands: DB_PREFIX + 'brands',
  models: DB_PREFIX + 'models',
  compatibility: DB_PREFIX + 'compatibility',
  inventory: DB_PREFIX + 'inventory',
  warehouses: DB_PREFIX + 'warehouses',
  orders: DB_PREFIX + 'orders',
  coupons: DB_PREFIX + 'coupons',
  returns: DB_PREFIX + 'returns',
  reviews: DB_PREFIX + 'reviews',
  users: DB_PREFIX + 'users',
  transactions: DB_PREFIX + 'transactions',
};

// ================================================================
//  INITIAL MOCK DATA DEFINITIONS
// ================================================================

const initialData = {
  categories: [
    { categoryId: 1, categoryName: 'Engine Parts', description: 'Pistons, gaskets, valves, and full block components.', parentCategoryId: null },
    { categoryId: 2, categoryName: 'Brakes', description: 'Rotors, calipers, pads, and hydraulic sensors.', parentCategoryId: null },
    { categoryId: 3, categoryName: 'Suspension', description: 'Struts, control arms, shocks, and bushings.', parentCategoryId: null },
    { categoryId: 4, categoryName: 'Electrical', description: 'Alternators, starters, batteries, and wiring.', parentCategoryId: null },
    { categoryId: 5, categoryName: 'Filters', description: 'Oil filters, cabin air filters, and intake filters.', parentCategoryId: null },
    { categoryId: 6, categoryName: 'Pistons & Rings', description: 'Internal cylinder engine components.', parentCategoryId: 1 },
    { categoryId: 7, categoryName: 'Brake Pads', description: 'Ceramic and semi-metallic friction pads.', parentCategoryId: 2 },
  ],

  suppliers: [
    { supplierId: 1, supplierName: 'Bosch Automotive', contactPerson: 'Sarah Jenkins', email: 's.jenkins@bosch.com', phone: '+1-800-267-2401', taxNumber: 'TX-908123-B', address: '1200 Block Ave, Chicago, IL', isActive: true },
    { supplierId: 2, supplierName: 'Brembo S.p.A.', contactPerson: 'Luca Rossi', email: 'l.rossi@brembo.it', phone: '+39-035-605-111', taxNumber: 'IT-002145-R', address: 'Viale Europa 2, Stezzano, Italy', isActive: true },
    { supplierId: 3, supplierName: 'Denso Corp', contactPerson: 'Kenji Sato', email: 'k.sato@denso.co.jp', phone: '+81-566-25-5511', taxNumber: 'JP-987102-D', address: '1-1 Showa-cho, Kariya, Aichi, Japan', isActive: true },
    { supplierId: 4, supplierName: 'ACDelco', contactPerson: 'Mike Davis', email: 'm.davis@acdelco.com', phone: '+1-800-223-3526', taxNumber: 'TX-551239-A', address: 'Grand Blanc, Michigan, USA', isActive: true },
  ],

  brands: [
    { brandId: 1, brandName: 'Toyota', country: 'Japan', logoUrl: '' },
    { brandId: 2, brandName: 'BMW', country: 'Germany', logoUrl: '' },
    { brandId: 3, brandName: 'Honda', country: 'Japan', logoUrl: '' },
    { brandId: 4, brandName: 'Ford', country: 'USA', logoUrl: '' },
  ],

  models: [
    { modelId: 1, brandId: 1, modelName: 'Corolla', yearStart: 2012, yearEnd: 2018, engineType: '1.8L 4-Cylinder' },
    { modelId: 2, brandId: 1, modelName: 'Camry', yearStart: 2015, yearEnd: 2021, engineType: '2.5L 4-Cylinder' },
    { modelId: 3, brandId: 2, modelName: '3 Series (F30)', yearStart: 2012, yearEnd: 2019, engineType: '2.0L TwinTurbo' },
    { modelId: 4, brandId: 3, modelName: 'Civic', yearStart: 2016, yearEnd: 2022, engineType: '1.5L Turbo' },
  ],

  warehouses: [
    { warehouseId: 1, warehouseName: 'Central Logistics Hub', location: 'Industrial Zone A, Cairo', isActive: true },
    { warehouseId: 2, warehouseName: 'North Delta Warehouse', location: 'Alexandria Road, Tanta', isActive: true },
  ],

  products: [
    {
      productId: 1,
      productName: 'Bosch Double Platinum Spark Plug',
      sku: 'SP-BOSCH-PL10',
      partNumber: 'FR7DPP33',
      description: 'Engineered for performance and longer service life. Laser welded platinum inlay provides superior ignitability.',
      unitPrice: 12.99,
      costPrice: 6.50,
      categoryId: 4,
      supplierId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      specifications: [
        { specName: 'Thread Size', specValue: '14mm' },
        { specName: 'Reach', specValue: '19mm' },
        { specName: 'Gap', specValue: '0.044 inches' },
      ],
    },
    {
      productId: 2,
      productName: 'Brembo Sport Brake Rotor (Front Pair)',
      sku: 'BR-BREMBO-F20',
      partNumber: '09.C306.11',
      description: 'High-carbon ventilated brake disc pair. Zinc plated to prevent rust. Direct replacement for OEM rotors.',
      unitPrice: 249.50,
      costPrice: 130.00,
      categoryId: 7,
      supplierId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      specifications: [
        { specName: 'Placement', specValue: 'Front Axle' },
        { specName: 'Rotor Type', specValue: 'Ventilated / Drilled' },
        { specName: 'Diameter', specValue: '312mm' },
      ],
    },
    {
      productId: 3,
      productName: 'Denso Fuel Injector Assembly',
      sku: 'FI-DENSO-X99',
      partNumber: '23250-0H050',
      description: 'Genuine OEM performance fuel injector. Provides optimized fuel atomization for maximum efficiency.',
      unitPrice: 89.99,
      costPrice: 40.00,
      categoryId: 1,
      supplierId: 3,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      specifications: [
        { specName: 'Connector Type', specValue: '2-Pin OBD2' },
        { specName: 'Flow Rate', specValue: '380cc/min' },
      ],
    },
  ],

  compatibility: [
    { compatibilityId: 1, productId: 1, modelId: 1, notes: 'Fits 1.8L engines only.' },
    { compatibilityId: 2, productId: 1, modelId: 4, notes: 'Fits Hatchback and Sedan variants.' },
    { compatibilityId: 3, productId: 2, modelId: 3, notes: 'Required M-Sport braking kit.' },
    { compatibilityId: 4, productId: 3, modelId: 1, notes: 'Direct fit replacement.' },
    { compatibilityId: 5, productId: 3, modelId: 2, notes: 'Fits 2015-2018 model years.' },
  ],

  inventory: [
    { inventoryId: 1, productId: 1, warehouseId: 1, quantityInStock: 250, reorderLevel: 50 },
    { inventoryId: 2, productId: 1, warehouseId: 2, quantityInStock: 80, reorderLevel: 20 },
    { inventoryId: 3, productId: 2, warehouseId: 1, quantityInStock: 12, reorderLevel: 10 },
    { inventoryId: 4, productId: 2, warehouseId: 2, quantityInStock: 2, reorderLevel: 5 },
    { inventoryId: 5, productId: 3, warehouseId: 1, quantityInStock: 45, reorderLevel: 15 },
  ],

  transactions: [
    { transactionId: 1, productId: 1, warehouseId: 1, quantity: 300, transactionType: 'Stock Received', date: '2026-06-15T09:00:00Z' },
    { transactionId: 2, productId: 2, warehouseId: 1, quantity: 15, transactionType: 'Stock Received', date: '2026-06-16T10:15:00Z' },
  ],

  coupons: [
    { couponId: 1, code: 'SUMMER20', discountType: 0, discountValue: 20, minOrderAmount: 50, maxDiscountAmount: 30, usageLimit: 100, usedCount: 42, startDate: '2026-06-01', endDate: '2026-09-30', isActive: true },
    { couponId: 2, code: 'FIXED50', discountType: 1, discountValue: 50, minOrderAmount: 200, maxDiscountAmount: 50, usageLimit: 50, usedCount: 12, startDate: '2026-01-01', endDate: '2026-12-31', isActive: true },
  ],

  users: [
    { userId: 1, firstName: 'Ahmad', lastName: 'Ali', username: 'ahmad_admin', email: 'admin@autoparts.com', phone: '01012345678', role: 'Admin', isActive: true, createdAt: '2026-01-01T12:00:00Z' },
    { userId: 2, firstName: 'Sherif', lastName: 'Kamal', username: 'sherif_k', email: 'sherif@gmail.com', phone: '01122334455', role: 'Customer', isActive: true, createdAt: '2026-03-12T14:30:00Z' },
    { userId: 3, firstName: 'Mona', lastName: 'Saad', username: 'mona_s', email: 'mona@yahoo.com', phone: '01233445566', role: 'Customer', isActive: false, createdAt: '2026-04-01T10:00:00Z' },
  ],

  orders: [
    {
      orderId: 1,
      orderNumber: 'ORD-2026-0001',
      customerId: 2,
      orderDate: '2026-06-25T11:42:00Z',
      subTotal: 102.98,
      discountAmount: 0.00,
      taxAmount: 14.42,
      totalAmount: 117.40,
      isPaid: true,
      statusId: 1, // e.g. Pending
      statusName: 'Pending',
      customer: { firstName: 'Sherif', lastName: 'Kamal', email: 'sherif@gmail.com' },
      orderDetails: [
        { productId: 1, quantity: 2, unitPrice: 12.99, discount: 0, lineTotal: 25.98 },
        { productId: 3, quantity: 1, unitPrice: 89.99, discount: 20, lineTotal: 77.00 },
      ],
      shipping: { trackingNumber: '', status: 'Processing', carrier: '', estimatedDeliveryDate: '' },
    },
    {
      orderId: 2,
      orderNumber: 'ORD-2026-0002',
      customerId: 3,
      orderDate: '2026-06-28T09:15:00Z',
      subTotal: 249.50,
      discountAmount: 20.00,
      taxAmount: 32.13,
      totalAmount: 261.63,
      isPaid: true,
      statusId: 3, // e.g. Shipped
      statusName: 'Shipped',
      customer: { firstName: 'Mona', lastName: 'Saad', email: 'mona@yahoo.com' },
      orderDetails: [
        { productId: 2, quantity: 1, unitPrice: 249.50, discount: 0, lineTotal: 249.50 },
      ],
      shipping: { trackingNumber: 'TRK-ARAMEX-89021', status: 'In Transit', carrier: 'Aramex', estimatedDeliveryDate: '2026-07-05' },
    },
  ],

  returns: [
    {
      returnId: 1,
      orderId: 1,
      orderDetail: { product: { productName: 'Bosch Double Platinum Spark Plug' } },
      quantity: 1,
      reason: 'Ordered wrong thread size.',
      status: 'Requested',
      refundAmount: null,
      requestDate: '2026-06-29T13:00:00Z',
      user: { firstName: 'Sherif', lastName: 'Kamal' },
    },
  ],

  reviews: [
    { reviewId: 1, productId: 1, userId: 2, rating: 5, comment: 'Great spark plugs! Improved engine idle stability.', isVerified: true, createdAt: '2026-06-27T16:00:00Z', product: { productName: 'Bosch Double Platinum Spark Plug' }, user: { firstName: 'Sherif', lastName: 'Kamal' } },
    { reviewId: 2, productId: 2, userId: 3, rating: 4, comment: 'Braking performance is superb. Squeaks slightly when cold.', isVerified: true, createdAt: '2026-06-29T10:00:00Z', product: { productName: 'Brembo Sport Brake Rotor (Front Pair)' }, user: { firstName: 'Mona', lastName: 'Saad' } },
  ],
};

// ================================================================
//  LOCAL STORAGE MANAGEMENT
// ================================================================

function initDatabase() {
  Object.entries(keys).forEach(([key, storageKey]) => {
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(initialData[key] || []));
    }
  });
}

// Run immediately
initDatabase();

// ── Read database ──
function readTable(tableName) {
  const raw = localStorage.getItem(keys[tableName]);
  return raw ? JSON.parse(raw) : [];
}

// ── Write database ──
function writeTable(tableName, data) {
  localStorage.setItem(keys[tableName], JSON.stringify(data));
}

// ── Simulated delay wrapper ──
function delay(result) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), DELAY_MS);
  });
}

// ================================================================
//  PRODUCTS CRUD SERVICES
// ================================================================

const ProductsService = {
  getAll: (search = '', categoryId = '', supplierId = '', page = 1, pageSize = 10) => {
    let list = readTable('products');
    const categories = readTable('categories');
    const suppliers = readTable('suppliers');

    // Populate child info
    list = list.map(p => ({
      ...p,
      category: categories.find(c => c.categoryId === p.categoryId),
      supplier: suppliers.find(s => s.supplierId === p.supplierId),
    }));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (categoryId) {
      list = list.filter(p => p.categoryId === parseInt(categoryId, 10));
    }
    if (supplierId) {
      list = list.filter(p => p.supplierId === parseInt(supplierId, 10));
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return delay({ items, totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  getById: (id) => {
    const list = readTable('products');
    const p = list.find(x => x.productId === parseInt(id, 10));
    return delay(p ? { ...p } : null);
  },

  create: (data) => {
    const list = readTable('products');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.productId)) + 1 : 1;
    const record = { ...data, productId: newId, specifications: data.specifications || [] };
    list.push(record);
    writeTable('products', list);

    // Initialize blank inventory
    const warehouses = readTable('warehouses');
    const invList = readTable('inventory');
    warehouses.forEach(w => {
      const newInvId = invList.length > 0 ? Math.max(...invList.map(x => x.inventoryId)) + 1 : 1;
      invList.push({ inventoryId: newInvId, productId: newId, warehouseId: w.warehouseId, quantityInStock: 0, reorderLevel: 10 });
    });
    writeTable('inventory', invList);

    return delay(record);
  },

  update: (id, data) => {
    const list = readTable('products');
    const idx = list.findIndex(x => x.productId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, productId: parseInt(id, 10) };
      writeTable('products', list);
      return delay(list[idx]);
    }
    throw new Error('Product not found');
  },

  delete: (id) => {
    let list = readTable('products');
    list = list.filter(x => x.productId !== parseInt(id, 10));
    writeTable('products', list);

    // Cleanup inventory
    let invList = readTable('inventory');
    invList = invList.filter(x => x.productId !== parseInt(id, 10));
    writeTable('inventory', invList);

    return delay(true);
  },
};

// ================================================================
//  CATEGORIES SERVICES
// ================================================================

const CategoriesService = {
  getAll: () => {
    const list = readTable('categories');
    const tree = list.map(c => ({
      ...c,
      parentCategory: list.find(p => p.categoryId === c.parentCategoryId),
    }));
    return delay(tree);
  },

  create: (data) => {
    const list = readTable('categories');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.categoryId)) + 1 : 1;
    const record = { ...data, categoryId: newId };
    list.push(record);
    writeTable('categories', list);
    return delay(record);
  },

  update: (id, data) => {
    const list = readTable('categories');
    const idx = list.findIndex(x => x.categoryId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, categoryId: parseInt(id, 10) };
      writeTable('categories', list);
      return delay(list[idx]);
    }
    throw new Error('Category not found');
  },

  delete: (id) => {
    let list = readTable('categories');
    list = list.filter(x => x.categoryId !== parseInt(id, 10));
    // Reparent orphans
    list.forEach(c => {
      if (c.parentCategoryId === parseInt(id, 10)) c.parentCategoryId = null;
    });
    writeTable('categories', list);
    return delay(true);
  },
};

// ================================================================
//  SUPPLIERS SERVICES
// ================================================================

const SuppliersService = {
  getAll: (search = '', page = 1, pageSize = 10) => {
    let list = readTable('suppliers');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.supplierName.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  create: (data) => {
    const list = readTable('suppliers');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.supplierId)) + 1 : 1;
    const record = { ...data, supplierId: newId };
    list.push(record);
    writeTable('suppliers', list);
    return delay(record);
  },

  update: (id, data) => {
    const list = readTable('suppliers');
    const idx = list.findIndex(x => x.supplierId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, supplierId: parseInt(id, 10) };
      writeTable('suppliers', list);
      return delay(list[idx]);
    }
    throw new Error('Supplier not found');
  },

  delete: (id) => {
    let list = readTable('suppliers');
    list = list.filter(x => x.supplierId !== parseInt(id, 10));
    writeTable('suppliers', list);
    return delay(true);
  },
};

// ================================================================
//  CAR BRANDS & MODELS
// ================================================================

const CarBrandsService = {
  getAll: () => delay(readTable('brands')),
  create: (data) => {
    const list = readTable('brands');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.brandId)) + 1 : 1;
    const record = { ...data, brandId: newId };
    list.push(record);
    writeTable('brands', list);
    return delay(record);
  },
  update: (id, data) => {
    const list = readTable('brands');
    const idx = list.findIndex(x => x.brandId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, brandId: parseInt(id, 10) };
      writeTable('brands', list);
      return delay(list[idx]);
    }
    throw new Error('Brand not found');
  },
  delete: (id) => {
    let list = readTable('brands');
    list = list.filter(x => x.brandId !== parseInt(id, 10));
    writeTable('brands', list);

    // Cascade delete models
    let models = readTable('models');
    models = models.filter(x => x.brandId !== parseInt(id, 10));
    writeTable('models', models);
    return delay(true);
  },
};

const CarModelsService = {
  getAll: () => {
    const list = readTable('models');
    const brands = readTable('brands');
    return delay(list.map(m => ({
      ...m,
      brand: brands.find(b => b.brandId === m.brandId),
    })));
  },
  create: (data) => {
    const list = readTable('models');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.modelId)) + 1 : 1;
    const record = { ...data, modelId: newId };
    list.push(record);
    writeTable('models', list);
    return delay(record);
  },
  delete: (id) => {
    let list = readTable('models');
    list = list.filter(x => x.modelId !== parseInt(id, 10));
    writeTable('models', list);
    return delay(true);
  },
};

const CompatibilityService = {
  getAll: () => delay(readTable('compatibility')),
  getByProduct: (productId) => {
    const comp = readTable('compatibility');
    const models = readTable('models');
    const brands = readTable('brands');

    const filtered = comp.filter(c => c.productId === parseInt(productId, 10));
    return delay(filtered.map(c => {
      const model = models.find(m => m.modelId === c.modelId);
      if (model) model.brand = brands.find(b => b.brandId === model.brandId);
      return { ...c, carModel: model };
    }));
  },
  create: (data) => {
    const list = readTable('compatibility');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.compatibilityId)) + 1 : 1;
    const record = { ...data, compatibilityId: newId };
    list.push(record);
    writeTable('compatibility', list);
    return delay(record);
  },
  delete: (id) => {
    let list = readTable('compatibility');
    list = list.filter(x => x.compatibilityId !== parseInt(id, 10));
    writeTable('compatibility', list);
    return delay(true);
  },
};

// ================================================================
//  INVENTORY SERVICES
// ================================================================

const InventoryService = {
  getAll: (search = '', warehouseId = '', page = 1, pageSize = 10) => {
    let list = readTable('inventory');
    const products = readTable('products');
    const warehouses = readTable('warehouses');

    list = list.map(inv => ({
      ...inv,
      product: products.find(p => p.productId === inv.productId),
      warehouse: warehouses.find(w => w.warehouseId === inv.warehouseId),
    }));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(inv => inv.product?.productName.toLowerCase().includes(q) || inv.product?.sku.toLowerCase().includes(q));
    }
    if (warehouseId) {
      list = list.filter(inv => inv.warehouseId === parseInt(warehouseId, 10));
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  updateStock: (productId, warehouseId, changeQty, transactionType = 'Adjustment') => {
    const list = readTable('inventory');
    const pId = parseInt(productId, 10);
    const wId = parseInt(warehouseId, 10);

    let item = list.find(x => x.productId === pId && x.warehouseId === wId);
    if (!item) {
      const newId = list.length > 0 ? Math.max(...list.map(x => x.inventoryId)) + 1 : 1;
      item = { inventoryId: newId, productId: pId, warehouseId: wId, quantityInStock: 0, reorderLevel: 10 };
      list.push(item);
    }

    item.quantityInStock = Math.max(0, item.quantityInStock + parseInt(changeQty, 10));
    writeTable('inventory', list);

    // Create transaction record
    const transactions = readTable('transactions');
    const tId = transactions.length > 0 ? Math.max(...transactions.map(x => x.transactionId)) + 1 : 1;
    transactions.push({
      transactionId: tId,
      productId: pId,
      warehouseId: wId,
      quantity: parseInt(changeQty, 10),
      transactionType,
      date: new Date().toISOString(),
    });
    writeTable('transactions', transactions);

    return delay(item);
  },

  getTransactions: () => {
    const list = readTable('transactions');
    const products = readTable('products');
    const warehouses = readTable('warehouses');
    return delay(list.map(t => ({
      ...t,
      product: products.find(p => p.productId === t.productId),
      warehouse: warehouses.find(w => w.warehouseId === t.warehouseId),
    })).sort((a, b) => new Date(b.date) - new Date(a.date)));
  },
};

const WarehousesService = {
  getAll: () => delay(readTable('warehouses')),
  create: (data) => {
    const list = readTable('warehouses');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.warehouseId)) + 1 : 1;
    const record = { ...data, warehouseId: newId };
    list.push(record);
    writeTable('warehouses', list);
    return delay(record);
  },
  update: (id, data) => {
    const list = readTable('warehouses');
    const idx = list.findIndex(x => x.warehouseId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, warehouseId: parseInt(id, 10) };
      writeTable('warehouses', list);
      return delay(list[idx]);
    }
    throw new Error('Warehouse not found');
  },
};

// ================================================================
//  ORDERS SERVICES
// ================================================================

const OrdersService = {
  getAllAdmin: (search = '', statusId = '', page = 1, pageSize = 10) => {
    let list = readTable('orders');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || (o.customer?.firstName + ' ' + o.customer?.lastName).toLowerCase().includes(q));
    }
    if (statusId) {
      list = list.filter(o => o.statusId === parseInt(statusId, 10));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  updateStatus: (id, statusId, statusName) => {
    const list = readTable('orders');
    const idx = list.findIndex(x => x.orderId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].statusId = parseInt(statusId, 10);
      list[idx].statusName = statusName;
      writeTable('orders', list);
      return delay(list[idx]);
    }
    throw new Error('Order not found');
  },

  updateShipping: (id, shippingData) => {
    const list = readTable('orders');
    const idx = list.findIndex(x => x.orderId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].shipping = { ...list[idx].shipping, ...shippingData };
      writeTable('orders', list);
      return delay(list[idx]);
    }
    throw new Error('Order not found');
  },
};

// ================================================================
//  COUPONS SERVICES
// ================================================================

const CouponsService = {
  getAll: (search = '', page = 1, pageSize = 10) => {
    let list = readTable('coupons');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  create: (data) => {
    const list = readTable('coupons');
    const newId = list.length > 0 ? Math.max(...list.map(x => x.couponId)) + 1 : 1;
    const record = { ...data, couponId: newId, usedCount: 0 };
    list.push(record);
    writeTable('coupons', list);
    return delay(record);
  },

  delete: (id) => {
    let list = readTable('coupons');
    list = list.filter(x => x.couponId !== parseInt(id, 10));
    writeTable('coupons', list);
    return delay(true);
  },
};

// ================================================================
//  RETURNS SERVICES
// ================================================================

const ReturnsService = {
  getAllAdmin: (search = '', page = 1, pageSize = 10) => {
    let list = readTable('returns');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.orderDetail?.product?.productName.toLowerCase().includes(q) || (r.user?.firstName + ' ' + r.user?.lastName).toLowerCase().includes(q));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  updateStatus: (id, status, refundAmount = null) => {
    const list = readTable('returns');
    const idx = list.findIndex(x => x.returnId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].status = status;
      if (refundAmount !== null) list[idx].refundAmount = parseFloat(refundAmount);
      writeTable('returns', list);
      return delay(list[idx]);
    }
    throw new Error('Return request not found');
  },
};

// ================================================================
//  REVIEWS SERVICES
// ================================================================

const ReviewsService = {
  getAllAdmin: (search = '', page = 1, pageSize = 10) => {
    let list = readTable('reviews');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.comment.toLowerCase().includes(q) || r.product?.productName.toLowerCase().includes(q));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  verifyToggle: (id) => {
    const list = readTable('reviews');
    const idx = list.findIndex(x => x.reviewId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].isVerified = !list[idx].isVerified;
      writeTable('reviews', list);
      return delay(list[idx]);
    }
    throw new Error('Review not found');
  },

  delete: (id) => {
    let list = readTable('reviews');
    list = list.filter(x => x.reviewId !== parseInt(id, 10));
    writeTable('reviews', list);
    return delay(true);
  },
};

// ================================================================
//  USERS SERVICES
// ================================================================

const UsersService = {
  getAll: (search = '', page = 1, pageSize = 10) => {
    let list = readTable('users');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.firstName + ' ' + u.lastName).toLowerCase().includes(q));
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    return delay({ items: list.slice(start, start + pageSize), totalCount: total, totalPages: Math.ceil(total / pageSize) });
  },

  updateRole: (id, role) => {
    const list = readTable('users');
    const idx = list.findIndex(x => x.userId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].role = role;
      writeTable('users', list);
      return delay(list[idx]);
    }
    throw new Error('User not found');
  },

  toggleActive: (id) => {
    const list = readTable('users');
    const idx = list.findIndex(x => x.userId === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].isActive = !list[idx].isActive;
      writeTable('users', list);
      return delay(list[idx]);
    }
    throw new Error('User not found');
  },
};

// ── Export all admin services ──
window.AdminAPI = {
  Products: {
    getAll: (search = '', categoryId = '', supplierId = '', page = 1, pageSize = 10) => 
      window.API.Products.getAll({ search, categoryId, supplierId, page, pageSize }),
    getById: (id) => window.API.Products.getById(id),
    create: (data) => window.API.Products.create(data),
    update: (id, data) => window.API.Products.update(id, data),
    delete: (id) => window.API.Products.delete(id)
  },
  Categories: {
    getAll: () => window.API.Categories.getAll(),
    getById: (id) => window.API.Categories.getById(id),
    create: (data) => window.API.Categories.create(data),
    update: (id, data) => window.API.Categories.update(id, data),
    delete: (id) => window.API.Categories.delete(id)
  },
  Suppliers: {
    getAll: (search = '', page = 1, pageSize = 100) => window.API.Suppliers.getAll().then(res => ({
      items: res.filter(s => !search || s.supplierName.toLowerCase().includes(search.toLowerCase())),
      totalCount: res.length,
      totalPages: 1
    })),
    create: (data) => window.API.Suppliers.create(data),
    update: (id, data) => window.API.Suppliers.update(id, data),
    delete: (id) => window.API.Suppliers.delete(id)
  },
  CarBrands: {
    getAll: () => window.API.CarBrands.getAll(),
    create: (data) => window.API.CarBrands.create(data),
    update: (id, data) => window.API.CarBrands.update(id, data),
    delete: (id) => window.API.CarBrands.delete(id)
  },
  CarModels: {
    getAll: () => window.API.CarModels.getAll(),
    create: (data) => window.API.CarModels.create(data),
    update: (id, data) => window.API.CarModels.update(id, data),
    delete: (id) => window.API.CarModels.delete(id)
  },
  Compatibility: {
    getAll: () => request('GET', '/compatibility'),
    create: (data) => request('POST', '/compatibility', data),
    delete: (id) => request('DELETE', `/compatibility/${id}`)
  },
  Inventory: {
    getAll: () => window.API.Products.getAll().then(res => ({
      items: res.items.map(p => ({
        inventoryId: p.productId,
        productId: p.productId,
        productName: p.productName,
        quantityInStock: 100, // stock simulator
        reorderLevel: 10
      })),
      totalCount: res.totalCount,
      totalPages: res.totalPages
    })),
    update: (id, data) => Promise.resolve({})
  },
  Warehouses: {
    getAll: () => window.API.Warehouses.getAll(),
    create: (data) => window.API.Warehouses.create(data),
    update: (id, data) => window.API.Warehouses.update(id, data)
  },
  Orders: {
    getAllAdmin: (filters = {}) => window.API.Orders.getAllAdmin(filters).then(res => ({
      items: res,
      totalCount: res.length,
      totalPages: 1
    })),
    updateStatus: (id, statusId) => window.API.Orders.updateStatus(id, statusId)
  },
  Coupons: {
    getAll: () => window.API.Coupons.getAll(),
    create: (data) => window.API.Coupons.create(data),
    update: (id, data) => window.API.Coupons.update(id, data),
    delete: (id) => window.API.Coupons.delete(id)
  },
  Returns: {
    getAllAdmin: () => window.API.Returns.getAllAdmin().then(res => ({
      items: res,
      totalCount: res.length,
      totalPages: 1
    })),
    updateStatus: (id, data) => window.API.Returns.updateStatus(id, data)
  },
  Reviews: {
    getAllAdmin: () => window.API.Reviews.getUserReviews().then(res => ({
      items: res,
      totalCount: res.length,
      totalPages: 1
    })),
    delete: (id) => window.API.Reviews.delete(id)
  },
  Users: {
    getAll: () => Promise.resolve({ items: [], totalCount: 0, totalPages: 1 }),
    updateRole: (id, role) => Promise.resolve({}),
    toggleActive: (id) => Promise.resolve({})
  }
};
