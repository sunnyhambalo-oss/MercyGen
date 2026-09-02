// Configuration
const API_BASE = window.location.origin;
let currentContent = {};
let editingItem = null;
let editingSection = null;

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchSection(e.target.dataset.section);
    });
  });

  // Modal
  const modal = document.getElementById('item-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeItemModal();
    }
  });
});

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST' });
    window.location.replace('/login');
  }
}

// ==================== UI Helpers ====================

function redirectIfUnauthorized(response) {
  if (response.status === 401 || response.status === 403) {
    window.location.replace('/login');
    return true;
  }
  return false;
}

function switchSection(sectionName) {
  // Update active nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.section === sectionName) {
      btn.classList.add('active');
    }
  });

  // Show section
  document.querySelectorAll('.section-editor').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionName).classList.add('active');

  // Load content for array sections
  if (['categories', 'clips', 'tribes', 'updates', 'serviceLocations'].includes(sectionName)) {
    renderItemsList(sectionName);
  } else if (sectionName === 'hero' || sectionName === 'mission' || sectionName === 'greatLove') {
    loadSectionForm(sectionName);
  }
}

function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = `notification ${type}`;
  notif.classList.add('show');

  setTimeout(() => {
    notif.classList.remove('show');
  }, 3000);
}

// ==================== Content Loading ====================

async function loadContent() {
  try {
    const response = await fetch(`${API_BASE}/api/content`);
    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Failed to load content');
    currentContent = await response.json();
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function loadSectionForm(sectionName) {
  const section = currentContent[sectionName];
  if (!section) return;

  if (sectionName === 'hero') {
    document.getElementById('hero-eyebrow').value = section.eyebrow || '';
    document.getElementById('hero-title').value = section.title || '';
    document.getElementById('hero-subtitle').value = section.subtitle || '';
    document.getElementById('hero-cta-1-text').value = section.cta?.[0]?.text || '';
    document.getElementById('hero-cta-1-link').value = section.cta?.[0]?.link || '';
    document.getElementById('hero-cta-2-text').value = section.cta?.[1]?.text || '';
    document.getElementById('hero-cta-2-link').value = section.cta?.[1]?.link || '';
  } else if (sectionName === 'mission') {
    document.getElementById('mission-eyebrow').value = section.eyebrow || '';
    document.getElementById('mission-title').value = section.title || '';
    document.getElementById('mission-description').value = section.description || '';
  } else if (sectionName === 'greatLove') {
    document.getElementById('great-love-eyebrow-input').value = section.eyebrow || '';
    document.getElementById('great-love-title-input').value = section.title || '';
    document.getElementById('great-love-description-input').value = section.description || '';
    document.getElementById('great-love-video-input').value = section.video || '';
    document.getElementById('great-love-image-input').value = section.image || '';
  }
}

// ==================== Save Section ====================

async function saveSection(sectionName) {
  try {
    let data;

    if (sectionName === 'hero') {
      data = {
        eyebrow: document.getElementById('hero-eyebrow').value,
        title: document.getElementById('hero-title').value,
        subtitle: document.getElementById('hero-subtitle').value,
        cta: [
          {
            text: document.getElementById('hero-cta-1-text').value,
            link: document.getElementById('hero-cta-1-link').value,
            type: 'primary'
          },
          {
            text: document.getElementById('hero-cta-2-text').value,
            link: document.getElementById('hero-cta-2-link').value,
            type: 'secondary'
          }
        ]
      };
    } else if (sectionName === 'mission') {
      data = {
        eyebrow: document.getElementById('mission-eyebrow').value,
        title: document.getElementById('mission-title').value,
        description: document.getElementById('mission-description').value
      };
    } else if (sectionName === 'greatLove') {
      data = {
        eyebrow: document.getElementById('great-love-eyebrow-input').value,
        title: document.getElementById('great-love-title-input').value,
        description: document.getElementById('great-love-description-input').value,
        video: document.getElementById('great-love-video-input').value,
        image: document.getElementById('great-love-image-input').value
      };
    }

    const response = await fetch(`${API_BASE}/api/content/${sectionName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Failed to save section');
    
    currentContent[sectionName] = data;
    showNotification('Changes saved successfully!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// ==================== Items Management ====================

function renderItemsList(sectionName) {
  const container = document.getElementById(`${sectionName}-list`);
  const items = currentContent[sectionName] || [];

  container.innerHTML = items.map(item => {
    let display = '';
    if (item.name) display = item.name;
    else if (item.title) display = item.title;

    return `
      <div class="item-card">
        <div class="item-card-content">
          <h3>${display}</h3>
          <p>ID: ${item.id}</p>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-primary btn-small" onclick="editItem('${sectionName}', ${item.id})">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteItem('${sectionName}', ${item.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function editItem(sectionName, itemId) {
  editingSection = sectionName;
  const item = currentContent[sectionName].find(i => i.id === itemId);
  editingItem = { ...item };

  openItemModal(sectionName, item);
}

function openItemModal(sectionName, item) {
  const modal = document.getElementById('item-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = `Edit ${sectionName.slice(0, -1)}`;

  let formHTML = '';

  if (sectionName === 'categories') {
    formHTML = `
      <div class="form-group">
        <label>Category Name</label>
        <input type="text" class="form-input item-field" data-field="name" value="${item.name}">
      </div>
      <div class="form-group">
        <label>Link</label>
        <input type="text" class="form-input item-field" data-field="link" value="${item.link}">
      </div>
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Upload New Image</label>
        <div class="file-input-group" onclick="document.getElementById('cat-image-upload').click()">
          <p>Click to upload or drag and drop</p>
          <input type="file" id="cat-image-upload" accept="image/*" onchange="uploadItemFile(event, 'image')">
        </div>
        <img id="item-image-preview" class="image-preview" style="display:none;">
      </div>
    `;
  } else if (sectionName === 'categories') {
    formHTML = `
      <div class="form-group">
        <label>Category Name</label>
        <input type="text" class="form-input item-field" data-field="name" value="${item.name}">
      </div>
      <div class="form-group">
        <label>Link</label>
        <input type="text" class="form-input item-field" data-field="link" value="${item.link}">
      </div>
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Upload New Image</label>
        <div class="file-input-group" onclick="document.getElementById('item-image-upload').click()">
          <p>Click to upload or drag and drop</p>
          <input type="file" id="item-image-upload" accept="image/*" onchange="uploadItemImage(event)">
        </div>
        <img id="item-image-preview" class="image-preview" style="display:none;">
      </div>
    `;
  } else if (sectionName === 'clips') {
    formHTML = `
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Tag</label>
        <input type="text" class="form-input item-field" data-field="tag" value="${item.tag}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
      </div>
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Upload New Image</label>
        <div class="file-input-group" onclick="document.getElementById('clip-image-upload').click()">
          <p>Click to upload image or drag and drop</p>
          <input type="file" id="clip-image-upload" accept="image/*" onchange="uploadItemFile(event, 'image')">
        </div>
      </div>
      <div class="form-group">
        <label>Video Path</label>
        <input type="text" class="form-input item-field" data-field="video" value="${item.video}">
      </div>
      <div class="form-group">
        <label>Upload New Video</label>
        <div class="file-input-group" onclick="document.getElementById('clip-video-upload').click()">
          <p>Click to upload video (MP4, WebM, MOV)</p>
          <input type="file" id="clip-video-upload" accept="video/*" onchange="uploadItemFile(event, 'video')">
        </div>
      </div>
    `;
  } else if (sectionName === 'tribes') {
    formHTML = `
      <div class="form-group">
        <label>Tribe Name</label>
        <input type="text" class="form-input item-field" data-field="name" value="${item.name}">
      </div>
      <div class="form-group">
        <label>Members</label>
        <input type="number" class="form-input item-field" data-field="members" value="${item.members}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
      </div>
      <div class="form-group">
        <label>Likes</label>
        <input type="number" class="form-input item-field" data-field="likes" value="${item.likes}">
      </div>
      <div class="form-group">
        <label>WhatsApp Link</label>
        <input type="text" class="form-input item-field" data-field="whatsapp" value="${item.whatsapp}">
      </div>
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Upload New Image</label>
        <div class="file-input-group" onclick="document.getElementById('tribe-image-upload').click()">
          <p>Click to upload or drag and drop</p>
          <input type="file" id="tribe-image-upload" accept="image/*" onchange="uploadItemFile(event, 'image')">
        </div>
      </div>
    `;
  } else if (sectionName === 'updates') {
    formHTML = `
      <div class="form-group">
        <label>Date</label>
        <input type="text" class="form-input item-field" data-field="date" value="${item.date}">
      </div>
      <div class="form-group">
        <label>Month</label>
        <input type="text" class="form-input item-field" data-field="month" value="${item.month}">
      </div>
      <div class="form-group">
        <label>Tag</label>
        <input type="text" class="form-input item-field" data-field="tag" value="${item.tag}">
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
      </div>
    `;
  } else if (sectionName === 'serviceLocations') {
    formHTML = `
      <div class="form-group">
        <label>Location Title</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Day & Time</label>
        <input type="text" class="form-input item-field" data-field="time" value="${item.time}">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" class="form-input item-field" data-field="location" value="${item.location || ''}">
      </div>
    `;
  }

  body.innerHTML = formHTML;
  modal.style.display = 'flex';
}

function closeItemModal() {
  document.getElementById('item-modal').style.display = 'none';
  editingItem = null;
  editingSection = null;
}

async function saveItem() {
  if (!editingSection || !editingItem) return;

  const fields = document.querySelectorAll('.item-field');
  fields.forEach(field => {
    const fieldName = field.dataset.field;
    const value = field.value;
    editingItem[fieldName] = fieldName === 'members' || fieldName === 'likes' || fieldName === 'date' ? parseInt(value) : value;
  });

  try {
    const response = await fetch(`${API_BASE}/api/content/${editingSection}/${editingItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editingItem)
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Failed to save item');

    await loadContent();
    renderItemsList(editingSection);
    closeItemModal();
    showNotification('Item saved successfully!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

async function deleteItem(sectionName, itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const response = await fetch(`${API_BASE}/api/content/${sectionName}/${itemId}`, {
      method: 'DELETE'
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Failed to delete item');

    await loadContent();
    renderItemsList(sectionName);
    showNotification('Item deleted successfully!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function addItem(sectionName) {
  editingSection = sectionName;

  // Create default item based on section
  let newItem = { id: null };

  if (sectionName === 'categories') {
    newItem = { id: null, name: '', link: '', image: '' };
  } else if (sectionName === 'clips') {
    newItem = { id: null, title: '', tag: '', description: '', image: '', video: '' };
  } else if (sectionName === 'tribes') {
    newItem = { id: null, name: '', members: 0, description: '', likes: 0, whatsapp: '', image: '' };
  } else if (sectionName === 'updates') {
    newItem = { id: null, date: '', month: '', tag: '', title: '', description: '' };
  } else if (sectionName === 'serviceLocations') {
    newItem = { id: null, title: '', time: '', location: '' };
  }

  editingItem = newItem;
  openItemModal(sectionName, newItem);
}

// Override saveItem for new items
const originalSaveItem = saveItem;
window.saveItem = async function() {
  if (!editingSection || !editingItem) return;

  const fields = document.querySelectorAll('.item-field');
  fields.forEach(field => {
    const fieldName = field.dataset.field;
    const value = field.value;
    editingItem[fieldName] = fieldName === 'members' || fieldName === 'likes' || fieldName === 'date' ? parseInt(value) : value;
  });

  try {
    const response = await fetch(`${API_BASE}/api/content/${editingSection}${editingItem.id ? '/' + editingItem.id : ''}`, {
      method: editingItem.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editingItem)
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Failed to save item');

    await loadContent();
    renderItemsList(editingSection);
    closeItemModal();
    showNotification(`Item ${editingItem.id ? 'updated' : 'created'} successfully!`, 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ==================== File Upload (Images & Videos) ====================

async function uploadItemFile(event, fieldType = 'image') {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file); // API expects 'image' field

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    
    // Update the appropriate field based on type
    const fieldSelector = fieldType === 'video' ? 'input[data-field="video"]' : 'input[data-field="image"]';
    const fieldElement = document.querySelector(fieldSelector);
    
    if (fieldElement) {
      fieldElement.value = data.path;
    }
    
    // Show preview for images
    if (fieldType === 'image') {
      const preview = document.getElementById('item-image-preview');
      if (preview) {
        preview.src = data.path;
        preview.style.display = 'block';
      }
    }
    
    showNotification(`${fieldType === 'video' ? 'Video' : 'Image'} uploaded successfully!`, 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// Fallback for old function name
async function uploadItemImage(event) {
  uploadItemFile(event, 'image');
}
