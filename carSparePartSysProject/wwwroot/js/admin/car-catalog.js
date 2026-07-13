/* ============================================================
   CarSparePartSys — Admin Car Catalog & Mapping Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadBrands();
  loadModels();
  initializeMappingWorkspace();
});

// ================================================================
//  BRANDS LOGIC
// ================================================================

async function loadBrands() {
  const tbody = document.getElementById('brands-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const list = await AdminAPI.CarBrands.getAll();
    populateBrandDropdowns(list);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text--center text--muted" style="padding:var(--space-6)">No brands found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((b, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${b.brandName}</strong></td>
        <td>${b.country || '—'}</td>
        <td class="admin-table-actions">
          <button class="btn btn--icon btn--ghost" onclick="openBrandDrawer(${b.brandId})" title="Edit">${UI.Icons.edit}</button>
          <button class="btn btn--icon btn--ghost" onclick="deleteBrand(${b.brandId})" title="Delete">${UI.Icons.trash}</button>
        </td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="4" class="text--danger text--center">Failed to load brands.</td></tr>`;
  }
}

function populateBrandDropdowns(brands) {
  const select = document.getElementById('model-brand-id');
  if (select) {
    select.innerHTML = '<option value="">Select Brand</option>';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.brandId;
      opt.textContent = b.brandName;
      select.appendChild(opt);
    });
  }
}

window.openBrandDrawer = async function(id = null) {
  const backdrop = document.getElementById('brand-drawer-backdrop');
  const title = document.getElementById('brand-drawer-title');
  const form = document.getElementById('brand-edit-form');

  form.reset();
  document.getElementById('brand-id-input').value = '';

  if (id) {
    title.textContent = 'Edit Brand';
    try {
      const list = await AdminAPI.CarBrands.getAll();
      const b = list.find(x => x.brandId === id);
      if (b) {
        document.getElementById('brand-id-input').value = b.brandId;
        document.getElementById('brand-name').value = b.brandName;
        document.getElementById('brand-country').value = b.country || '';
        document.getElementById('brand-logo').value = b.logoUrl || '';
      }
    } catch {
      UI.showToast('Failed to load brand.', 'error');
      return;
    }
  } else {
    title.textContent = 'Add Brand';
  }

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeBrandDrawer = function(e) {
  if (e && e.target !== document.getElementById('brand-drawer-backdrop')) return;
  const backdrop = document.getElementById('brand-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveBrand = async function() {
  const form = document.getElementById('brand-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-brand-btn');
  btn.classList.add('is-loading');

  const id = document.getElementById('brand-id-input').value;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  try {
    if (id) {
      await AdminAPI.CarBrands.update(id, data);
      UI.showToast('Brand updated!', 'success');
    } else {
      await AdminAPI.CarBrands.create(data);
      UI.showToast('Brand created!', 'success');
    }
    closeBrandDrawer();
    loadBrands();
    loadModels(); // Refresh brands in model lists
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteBrand = function(id) {
  showConfirmModal('Delete Brand', 'Delete this brand? All linked models and vehicle compatibilities will be deleted too.', async () => {
    await AdminAPI.CarBrands.delete(id);
    UI.showToast('Brand and models deleted.', 'success');
    loadBrands();
    loadModels();
    loadCompatibilityMappings();
  });
};

// ================================================================
//  MODELS LOGIC
// ================================================================

async function loadModels() {
  const tbody = document.getElementById('models-list');
  if (!tbody) return;

  tbody.innerHTML = Array(3).fill(0).map(() => `
    <tr>
      <td><div class="skeleton" style="width:20px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:100px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:60px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:80px; height:18px;"></div></td>
      <td><div class="skeleton" style="width:40px; height:24px;"></div></td>
    </tr>
  `).join('');

  try {
    const list = await AdminAPI.CarModels.getAll();
    populateModelDropdown(list);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text--center text--muted" style="padding:var(--space-6)">No models found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${m.modelName}</strong></td>
        <td>${m.brand?.brandName || '—'}</td>
        <td>${m.yearStart}${m.yearEnd ? '–' + m.yearEnd : '+'}</td>
        <td>${m.engineType || '—'}</td>
        <td class="admin-table-actions">
          <button class="btn btn--icon btn--ghost" onclick="deleteModel(${m.modelId})" title="Delete">${UI.Icons.trash}</button>
        </td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="text--danger text--center">Failed to load models.</td></tr>`;
  }
}

function populateModelDropdown(models) {
  const select = document.getElementById('compat-model-select');
  if (select) {
    select.innerHTML = '<option value="">Choose model...</option>';
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.modelId;
      opt.textContent = `${m.brand?.brandName || 'Vehicle'} ${m.modelName} (${m.yearStart}${m.yearEnd ? '–' + m.yearEnd : '+'})`;
      select.appendChild(opt);
    });
  }
}

window.openModelDrawer = function() {
  const backdrop = document.getElementById('model-drawer-backdrop');
  document.getElementById('model-edit-form').reset();
  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeModelDrawer = function(e) {
  if (e && e.target !== document.getElementById('model-drawer-backdrop')) return;
  const backdrop = document.getElementById('model-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveModel = async function() {
  const form = document.getElementById('model-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-model-btn');
  btn.classList.add('is-loading');

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.brandId = parseInt(data.brandId, 10);
  data.yearStart = parseInt(data.yearStart, 10);
  data.yearEnd = data.yearEnd ? parseInt(data.yearEnd, 10) : null;

  try {
    await AdminAPI.CarModels.create(data);
    UI.showToast('Model added successfully!', 'success');
    closeModelDrawer();
    loadModels();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteModel = function(id) {
  showConfirmModal('Delete Model', 'Delete this car model and all associated mappings?', async () => {
    await AdminAPI.CarModels.delete(id);
    UI.showToast('Model deleted.', 'success');
    loadModels();
    loadCompatibilityMappings();
  });
};

// ================================================================
//  COMPATIBILITY WORKSPACE LOGIC
// ================================================================

async function initializeMappingWorkspace() {
  // Load products list for dropdown option
  try {
    const prodResult = await AdminAPI.Products.getAll('', '', '', 1, 100);
    const prodSelect = document.getElementById('compat-product-select');
    if (prodSelect) {
      prodSelect.innerHTML = '<option value="">Choose product...</option>';
      (prodResult?.items || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.productId;
        opt.textContent = `${p.productName} (${p.sku})`;
        prodSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Error loading products list for compatibility mapping:', err);
  }

  loadCompatibilityMappings();
}

async function loadCompatibilityMappings() {
  const tbody = document.getElementById('mappings-list');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text--center" style="padding:var(--space-6)">${UI.Icons.gear} Loading...</td></tr>`;

  try {
    const list = await AdminAPI.Compatibility.getAll();
    const productsRes = await AdminAPI.Products.getAll('', '', '', 1, 100);
    const products = productsRes?.items || [];
    const models = await AdminAPI.CarModels.getAll();

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text--center text--muted" style="padding:var(--space-6)">No compatibility mappings created yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((c, idx) => {
      const p = products.find(prod => prod.productId === c.productId);
      const m = models.find(mod => mod.modelId === c.modelId);
      
      const pName = p ? p.productName : 'Product #' + c.productId;
      const pSku = p ? p.sku : '—';
      const vName = m ? `${m.brand?.brandName || ''} ${m.modelName} (${m.yearStart}${m.yearEnd ? '–' + m.yearEnd : '+'})` : 'Vehicle #' + c.modelId;

      return `
        <tr>
          <td>${idx + 1}</td>
          <td style="max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;"><strong>${pName}</strong></td>
          <td><code>${pSku}</code></td>
          <td>${vName}</td>
          <td><span class="text--xs text--muted">${c.notes || '—'}</span></td>
          <td>
            <button class="btn btn--icon btn--ghost" onclick="deleteCompatLink(${c.compatibilityId})" title="Delete Link">
              ${UI.Icons.trash}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="text--danger text--center">Failed to load compatibility list.</td></tr>`;
  }
}

window.saveCompatLink = async function(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.productId = parseInt(data.productId, 10);
  data.modelId = parseInt(data.modelId, 10);

  try {
    await AdminAPI.Compatibility.create(data);
    UI.showToast('Compatibility mapped successfully!', 'success');
    form.reset();
    loadCompatibilityMappings();
  } catch (err) {
    UI.handleApiError(err);
  }
};

window.deleteCompatLink = function(id) {
  showConfirmModal('Delete Compatibility Mapping', 'Remove this product compatibility link?', async () => {
    await AdminAPI.Compatibility.delete(id);
    UI.showToast('Mapping removed.', 'success');
    loadCompatibilityMappings();
  });
};
