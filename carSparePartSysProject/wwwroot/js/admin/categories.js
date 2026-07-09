/* ============================================================
   CarSparePartSys — Admin Categories Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const addIcon = document.getElementById('add-icon');
  if (addIcon) addIcon.innerHTML = UI.Icons.plus;

  loadCategories();
});

async function loadCategories() {
  const treeContainer = document.getElementById('categories-tree-list');
  if (!treeContainer) return;

  treeContainer.innerHTML = `<div style="padding:var(--space-6)">${UI.renderSkeletons(treeContainer, 'list', 3)}</div>`;

  try {
    const list = await AdminAPI.Categories.getAll();
    
    // Populate parent selection dropdown in edit drawer
    populateParentDropdown(list);

    const topLevel = list.filter(c => !c.parentCategoryId);
    if (topLevel.length === 0) {
      treeContainer.innerHTML = `<p class="text--muted text--center" style="padding:var(--space-8)">No categories defined.</p>`;
      return;
    }

    const renderNode = (node, depth = 0) => {
      const children = list.filter(c => c.parentCategoryId === node.categoryId);
      const chevron = children.length > 0 ? `<span style="width:16px;height:16px;color:var(--text-muted)">${UI.Icons.chevronDown}</span>` : '';
      const depthPaddings = depth * 24;

      let html = `
        <div style="margin-left:${depthPaddings}px; margin-bottom:var(--space-2)">
          <div class="admin-cat-node">
            <div class="admin-cat-node__info">
              ${chevron}
              <strong>${node.categoryName}</strong>
              ${node.description ? `<span class="text--xs text--muted" style="margin-left:var(--space-3)">— ${node.description}</span>` : ''}
            </div>
            <div class="admin-table-actions">
              <button class="btn btn--icon btn--ghost" onclick="openCategoryDrawer(${node.categoryId})" title="Edit">${UI.Icons.edit}</button>
              <button class="btn btn--icon btn--ghost" onclick="deleteCategory(${node.categoryId})" title="Delete">${UI.Icons.trash}</button>
            </div>
          </div>
        </div>
      `;

      if (children.length > 0) {
        html += `<div>${children.map(child => renderNode(child, depth + 1)).join('')}</div>`;
      }
      return html;
    };

    treeContainer.innerHTML = topLevel.map(node => renderNode(node, 0)).join('');
  } catch (err) {
    treeContainer.innerHTML = `<div class="alert alert--error">Failed to load categories.</div>`;
  }
}

function populateParentDropdown(categories, excludeId = null) {
  const select = document.getElementById('category-parent');
  if (!select) return;

  select.innerHTML = '<option value="">None (Top-Level)</option>';
  categories.forEach(c => {
    if (excludeId && c.categoryId === parseInt(excludeId, 10)) return;
    const opt = document.createElement('option');
    opt.value = c.categoryId;
    opt.textContent = c.categoryName;
    select.appendChild(opt);
  });
}

window.openCategoryDrawer = async function(id = null) {
  const backdrop = document.getElementById('category-drawer-backdrop');
  const title = document.getElementById('drawer-title');
  const form = document.getElementById('category-edit-form');

  form.reset();
  document.getElementById('category-id-input').value = '';

  // Load all categories for parent selector dropdown
  const list = await AdminAPI.Categories.getAll();
  populateParentDropdown(list, id);

  if (id) {
    title.textContent = 'Edit Category';
    const category = list.find(c => c.categoryId === parseInt(id, 10));
    if (category) {
      document.getElementById('category-id-input').value = category.categoryId;
      document.getElementById('category-name').value = category.categoryName;
      document.getElementById('category-desc').value = category.description || '';
      document.getElementById('category-parent').value = category.parentCategoryId || '';
      document.getElementById('category-image-url').value = category.imageUrl || '';
    }
  } else {
    title.textContent = 'Add Category';
  }

  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeCategoryDrawer = function(e) {
  if (e && e.target !== document.getElementById('category-drawer-backdrop')) return;
  const backdrop = document.getElementById('category-drawer-backdrop');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = '';
};

window.saveCategory = async function() {
  const form = document.getElementById('category-edit-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('save-category-btn');
  btn.classList.add('is-loading');

  const id = document.getElementById('category-id-input').value;
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.parentCategoryId = data.parentCategoryId ? parseInt(data.parentCategoryId, 10) : null;

  try {
    if (id) {
      await AdminAPI.Categories.update(id, data);
      UI.showToast('Category updated!', 'success');
    } else {
      await AdminAPI.Categories.create(data);
      UI.showToast('Category created!', 'success');
    }
    closeCategoryDrawer();
    loadCategories();
  } catch (err) {
    UI.handleApiError(err);
  } finally {
    btn.classList.remove('is-loading');
  }
};

window.deleteCategory = function(id) {
  showConfirmModal('Delete Category', 'Delete this category? Subcategories will be reparented to Top-Level.', async () => {
    await AdminAPI.Categories.delete(id);
    UI.showToast('Category deleted.', 'success');
    loadCategories();
  });
};
