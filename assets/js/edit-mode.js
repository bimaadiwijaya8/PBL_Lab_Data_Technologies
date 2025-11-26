/**
 * Edit Mode System - Front-End Visual Editor
 * Provides inline editing capabilities for page elements
 * UI-Only: No backend integration yet
 */

class EditModeSystem {
  constructor() {
    this.isEditMode = false;
    this.currentEditingElement = null;
    this.editableElements = [];
    this.init();
  }

  /**
   * Initialize the edit mode system
   */
  init() {
    this.checkEditModeParam();
    this.setupEventListeners();
    this.registerEditableElements();
  }

  /**
   * Check if edit mode should be activated via URL parameter
   */
  checkEditModeParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    
    if (editParam === 'true') {
      this.activateEditMode();
    }
  }

  /**
   * Activate edit mode
   */
  activateEditMode() {
    this.isEditMode = true;
    document.body.classList.add('edit-mode');
    this.renderEditModeToolbar();
    this.renderBackToDashboardButton();
    this.setupEditableElements();
  }

  /**
   * Deactivate edit mode
   */
  deactivateEditMode() {
    this.isEditMode = false;
    document.body.classList.remove('edit-mode');
    this.removeEditModeToolbar();
    this.removeBackToDashboardButton();
    this.cleanupEditableElements();
  }

  /**
   * Render the edit mode toolbar
   */
  renderEditModeToolbar() {
    if (document.querySelector('.edit-mode-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'edit-mode-toolbar';
    toolbar.innerHTML = `
      <div class="mode-indicator">
        Mode Edit Aktif
      </div>
      <button class="btn-save" id="btn-save-changes">
        💾 Simpan Perubahan
      </button>
      <button class="btn-cancel" id="btn-cancel-edit">
        ✕ Batalkan
      </button>
    `;
    
    document.body.appendChild(toolbar);

    document.getElementById('btn-save-changes').addEventListener('click', () => {
      this.saveChanges();
    });

    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
      this.cancelEdit();
    });
  }

  /**
   * Remove the edit mode toolbar
   */
  removeEditModeToolbar() {
    const toolbar = document.querySelector('.edit-mode-toolbar');
    if (toolbar) {
      toolbar.remove();
    }
  }

  /**
   * Render back to dashboard button
   */
  renderBackToDashboardButton() {
    if (document.querySelector('.back-to-dashboard')) return;

    const button = document.createElement('button');
    button.className = 'back-to-dashboard';
    button.innerHTML = '←';
    button.title = 'Kembali ke Dashboard';
    
    button.addEventListener('click', () => {
      this.backToDashboard();
    });

    document.body.appendChild(button);
  }

  /**
   * Remove back to dashboard button
   */
  removeBackToDashboardButton() {
    const button = document.querySelector('.back-to-dashboard');
    if (button) {
      button.remove();
    }
  }

  /**
   * Register editable elements
   */
  registerEditableElements() {
    // Find all elements with data-editable attribute
    const elements = document.querySelectorAll('[data-editable]');
    this.editableElements = Array.from(elements);
  }

  /**
   * Setup editable elements for edit mode
   */
  setupEditableElements() {
    this.editableElements.forEach(element => {
      element.classList.add('editable-element');
      
      // Create edit icon
      const editIcon = document.createElement('button');
      editIcon.className = 'edit-icon';
      editIcon.innerHTML = '✎';
      editIcon.type = 'button';
      editIcon.title = 'Edit elemen ini';
      
      // Position edit icon
      if (element.style.position === '' || element.style.position === 'static') {
        element.style.position = 'relative';
      }
      
      editIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditPopup(element);
      });
      
      element.appendChild(editIcon);
    });
  }

  /**
   * Cleanup editable elements
   */
  cleanupEditableElements() {
    this.editableElements.forEach(element => {
      element.classList.remove('editable-element');
      const editIcon = element.querySelector('.edit-icon');
      if (editIcon) {
        editIcon.remove();
      }
    });
  }

  /**
   * Open edit popup for an element
   */
  openEditPopup(element) {
    this.currentEditingElement = element;
    
    const elementType = element.getAttribute('data-editable');
    const elementId = element.getAttribute('data-element-id') || 'unknown';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-popup-overlay active';
    overlay.id = 'edit-popup-overlay';
    
    overlay.addEventListener('click', () => {
      this.closeEditPopup();
    });
    
    document.body.appendChild(overlay);

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'edit-popup active';
    popup.id = 'edit-popup';
    
    // Get current element content
    const currentText = element.innerText || element.textContent || '';
    const currentSrc = element.getAttribute('src') || '';
    
    let formHTML = `
      <h3>Edit Elemen</h3>
      <form class="edit-popup-form" id="edit-form">
    `;

    // Build form based on element type
    if (elementType === 'text' || elementType === 'heading') {
      formHTML += `
        <div class="edit-popup-form-group">
          <label for="edit-text">Ubah Teks:</label>
          <textarea id="edit-text" name="text" placeholder="Masukkan teks baru...">${currentText}</textarea>
        </div>
      `;
    }

    if (elementType === 'image') {
      formHTML += `
        <div class="edit-popup-form-group">
          <label for="edit-image">Ubah Gambar:</label>
          <input type="file" id="edit-image" name="image" accept="image/*">
          ${currentSrc ? `<small>Gambar saat ini: ${currentSrc}</small>` : ''}
        </div>
      `;
    }

    if (elementType === 'link') {
      const href = element.getAttribute('href') || '';
      formHTML += `
        <div class="edit-popup-form-group">
          <label for="edit-link-text">Teks Link:</label>
          <input type="text" id="edit-link-text" name="linkText" value="${currentText}">
        </div>
        <div class="edit-popup-form-group">
          <label for="edit-link-href">URL:</label>
          <input type="text" id="edit-link-href" name="linkHref" value="${href}" placeholder="https://...">
        </div>
      `;
    }

    if (elementType === 'button') {
      formHTML += `
        <div class="edit-popup-form-group">
          <label for="edit-button-text">Teks Tombol:</label>
          <input type="text" id="edit-button-text" name="buttonText" value="${currentText}">
        </div>
      `;
    }

    formHTML += `
        <div class="edit-popup-buttons">
          <button type="button" class="cancel-edit" id="btn-cancel-popup">Batalkan</button>
          <button type="button" class="save-edit" id="btn-save-popup">Simpan</button>
        </div>
      </form>
    `;

    popup.innerHTML = formHTML;
    document.body.appendChild(popup);

    // Setup event listeners
    document.getElementById('btn-cancel-popup').addEventListener('click', () => {
      this.closeEditPopup();
    });

    document.getElementById('btn-save-popup').addEventListener('click', () => {
      this.saveElementChanges(element, elementType);
    });

    // Allow Enter key to save in text inputs
    const inputs = popup.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.saveElementChanges(element, elementType);
        }
      });
    });
  }

  /**
   * Close edit popup
   */
  closeEditPopup() {
    const overlay = document.getElementById('edit-popup-overlay');
    const popup = document.getElementById('edit-popup');
    
    if (overlay) overlay.remove();
    if (popup) popup.remove();
    
    this.currentEditingElement = null;
  }

  /**
   * Save changes to an element
   */
  saveElementChanges(element, elementType) {
    const form = document.getElementById('edit-form');
    if (!form) return;

    // Get form values
    const formData = new FormData(form);

    // Apply changes based on element type
    if (elementType === 'text' || elementType === 'heading') {
      const newText = formData.get('text');
      if (newText) {
        element.innerText = newText;
      }
    }

    if (elementType === 'image') {
      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          element.src = e.target.result;
          this.showSuccessMessage('Gambar berhasil diubah (simulasi)');
        };
        reader.readAsDataURL(imageFile);
      }
    }

    if (elementType === 'link') {
      const linkText = formData.get('linkText');
      const linkHref = formData.get('linkHref');
      if (linkText) element.innerText = linkText;
      if (linkHref) element.href = linkHref;
    }

    if (elementType === 'button') {
      const buttonText = formData.get('buttonText');
      if (buttonText) element.innerText = buttonText;
    }

    this.showSuccessMessage('Elemen berhasil diubah (simulasi)');
    this.closeEditPopup();
  }

  /**
   * Save all changes
   */
  saveChanges() {
    this.showSuccessMessage('Semua perubahan disimpan (simulasi - belum ada backend)');
    
    // In a real implementation, this would send data to backend
    setTimeout(() => {
      this.deactivateEditMode();
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 1500);
  }

  /**
   * Cancel edit mode
   */
  cancelEdit() {
    if (confirm('Batalkan mode edit? Perubahan yang belum disimpan akan hilang.')) {
      this.deactivateEditMode();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Back to dashboard
   */
  backToDashboard() {
    if (this.isEditMode) {
      if (confirm('Kembali ke dashboard? Perubahan yang belum disimpan akan hilang.')) {
        // Determine which dashboard to go back to
        const userRole = localStorage.getItem('userRole') || 'admin';
        const dashboardPath = userRole === 'editor' ? 'pages/editor-dashboard.html' : 'pages/admin-dashboard.html';
        window.location.href = dashboardPath;
      }
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'edit-success-message';
    msg.textContent = message;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
      msg.remove();
    }, 3000);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for edit mode activation from other sources
    document.addEventListener('activateEditMode', () => {
      this.activateEditMode();
    });

    document.addEventListener('deactivateEditMode', () => {
      this.deactivateEditMode();
    });
  }
}

// Initialize edit mode system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.editModeSystem = new EditModeSystem();
  });
} else {
  window.editModeSystem = new EditModeSystem();
}
