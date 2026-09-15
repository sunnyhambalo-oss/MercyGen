// Configuration
const API_BASE = window.location.origin;
let currentContent = {};
let editingItem = null;
let editingSection = null;

const pageSections = {
  home: ['hero', 'mission', 'categories', 'clips', 'greatLove', 'updates', 'serviceLocations'],
  about: ['about'],
  college: ['collegeHero', 'collegeFeatures', 'collegeSchedule'],
  highSchool: ['highSchoolHero', 'highSchoolFeatures', 'highSchoolSchedule'],
  kids: ['kidsHero', 'kidsFeatures', 'kidsSchedule'],
  cellgroup: ['cellgroupHero', 'cellgroupGather', 'cellgroupValues', 'cellgroupSchedule'],
  giving: ['donateHero']
};

const arraySections = [
  'categories', 'clips', 'updates', 'serviceLocations',
  'collegeFeatures', 'collegeSchedule',
  'highSchoolFeatures', 'highSchoolSchedule',
  'kidsFeatures', 'kidsSchedule',
  'cellgroupValues', 'cellgroupSchedule'
];

const itemNames = {
  categories: 'group',
  clips: 'short video',
  updates: 'news item',
  serviceLocations: 'meeting place',
  collegeFeatures: 'thing we do',
  collegeSchedule: 'meeting time',
  highSchoolFeatures: 'thing we do',
  highSchoolSchedule: 'meeting time',
  kidsFeatures: 'thing we do',
  kidsSchedule: 'meeting time',
  cellgroupValues: 'belief',
  cellgroupSchedule: 'meeting time'
};

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  setupGreatLoveUploads();
  setupAboutUpload();

  // Navigation
  document.querySelectorAll('.page-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchPage(e.currentTarget.dataset.page);
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

function switchPage(pageName) {
  const sections = pageSections[pageName] || [];

  document.querySelectorAll('.page-nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageName) {
      btn.classList.add('active');
    }
  });

  document.querySelectorAll('.page-editor').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageName}-page`).classList.add('active');

  sections.forEach(sectionName => {
    if (arraySections.includes(sectionName)) {
      renderItemsList(sectionName);
    } else {
      loadSectionForm(sectionName);
    }
  });
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
    switchPage('home');
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
  } else if (sectionName === 'about') {
    document.getElementById('about-eyebrow-input').value = section.eyebrow || '';
    document.getElementById('about-title-input').value = section.title || '';
    document.getElementById('about-lead-input').value = section.lead || '';
    document.getElementById('about-image-input').value = section.image || '';
    updateAboutImagePreview(section.image || '');
    document.getElementById('about-story-title-input').value = section.storyTitle || '';
    document.getElementById('about-story-text-input').value = Array.isArray(section.storyParagraphs)
      ? section.storyParagraphs.join('\n\n')
      : '';
  } else if (sectionName === 'greatLove') {
    document.getElementById('great-love-eyebrow-input').value = section.eyebrow || '';
    document.getElementById('great-love-title-input').value = section.title || '';
    document.getElementById('great-love-description-input').value = section.description || '';
    document.getElementById('great-love-video-input').value = section.video || '';
    document.getElementById('great-love-image-input').value = section.image || '';
    updateGreatLovePreview('video', section.video || '');
    updateGreatLovePreview('image', section.image || '');
  } else if (sectionName.endsWith('Hero')) {
    document.getElementById(`${sectionName}-eyebrow-input`).value = section.eyebrow || '';
    document.getElementById(`${sectionName}-title-input`).value = section.title || '';
    document.getElementById(`${sectionName}-lead-input`).value = section.lead || '';
  } else if (sectionName === 'cellgroupGather') {
    document.getElementById('cellgroupGather-tag-input').value = section.tag || '';
    document.getElementById('cellgroupGather-title-input').value = section.title || '';
    document.getElementById('cellgroupGather-description-input').value = section.description || '';
  }
}

function setupAboutUpload() {
  const dropzone = document.getElementById('about-image-dropzone');
  const input = document.getElementById('about-image-upload');
  if (!dropzone || !input) return;

  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('click', event => event.stopPropagation());
  dropzone.addEventListener('dragover', event => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
  dropzone.addEventListener('drop', event => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    uploadAboutImage(event.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => {
    uploadAboutImage(input.files[0]);
    input.value = '';
  });
}

async function uploadAboutImage(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showNotification('Please choose a picture file.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('The picture could not be uploaded. Please try again.');

    const data = await response.json();
    document.getElementById('about-image-input').value = data.path;
    updateAboutImagePreview(data.path);
    showNotification('About page picture added!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function updateAboutImagePreview(path) {
  const preview = document.getElementById('about-image-preview');
  if (!preview) return;
  preview.src = path || '';
  preview.style.display = path ? 'block' : 'none';
}

function setupGreatLoveUploads() {
  ['image', 'video'].forEach(fieldType => {
    const dropzone = document.getElementById(`great-love-${fieldType}-dropzone`);
    const input = document.getElementById(`great-love-${fieldType}-upload`);
    if (!dropzone || !input) return;

    dropzone.addEventListener('click', () => input.click());
    input.addEventListener('click', (event) => event.stopPropagation());
    dropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragging');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragging');
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragging');
      uploadGreatLoveFile(event.dataTransfer.files[0], fieldType);
    });
    input.addEventListener('change', () => {
      uploadGreatLoveFile(input.files[0], fieldType);
      input.value = '';
    });
  });
}

async function uploadGreatLoveFile(file, fieldType) {
  if (!file) return;

  const acceptedType = fieldType === 'video' ? file.type.startsWith('video/') : file.type.startsWith('image/');
  if (!acceptedType) {
    showNotification(`Please choose a valid ${fieldType} file`, 'error');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('The upload did not work. Please try again.');

    const data = await response.json();
    document.getElementById(`great-love-${fieldType}-input`).value = data.path;
    updateGreatLovePreview(fieldType, data.path);
    showNotification(`${fieldType === 'video' ? 'Video' : 'Image'} uploaded successfully!`, 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function updateGreatLovePreview(fieldType, path) {
  const preview = document.getElementById(`great-love-${fieldType}-preview`);
  if (!preview) return;

  if (path) {
    preview.src = path;
    preview.style.display = 'block';
  } else {
    preview.removeAttribute('src');
    preview.style.display = 'none';
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
    } else if (sectionName === 'about') {
      const storyText = document.getElementById('about-story-text-input').value;
      data = {
        eyebrow: document.getElementById('about-eyebrow-input').value,
        title: document.getElementById('about-title-input').value,
        lead: document.getElementById('about-lead-input').value,
        image: document.getElementById('about-image-input').value,
        storyTitle: document.getElementById('about-story-title-input').value,
        storyParagraphs: storyText
          .split(/\n\s*\n/)
          .map(part => part.trim())
          .filter(Boolean)
      };
    } else if (sectionName === 'greatLove') {
      data = {
        eyebrow: document.getElementById('great-love-eyebrow-input').value,
        title: document.getElementById('great-love-title-input').value,
        description: document.getElementById('great-love-description-input').value,
        video: document.getElementById('great-love-video-input').value,
        image: document.getElementById('great-love-image-input').value
      };
    } else if (sectionName.endsWith('Hero')) {
      data = {
        eyebrow: document.getElementById(`${sectionName}-eyebrow-input`).value,
        title: document.getElementById(`${sectionName}-title-input`).value,
        lead: document.getElementById(`${sectionName}-lead-input`).value
      };
    } else if (sectionName === 'cellgroupGather') {
      data = {
        tag: document.getElementById('cellgroupGather-tag-input').value,
        title: document.getElementById('cellgroupGather-title-input').value,
        description: document.getElementById('cellgroupGather-description-input').value
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
          <p>${itemNames[sectionName] || 'item'}</p>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-primary btn-small" onclick="editItem('${sectionName}', ${item.id})">Change</button>
          <button class="btn btn-danger btn-small" onclick="deleteItem('${sectionName}', ${item.id})">Remove</button>
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

  const itemName = itemNames[sectionName] || 'item';
  title.textContent = item.id ? `Change this ${itemName}` : `Add a ${itemName}`;

  let formHTML = '';

  if (sectionName === 'categories') {
    formHTML = `
      <div class="form-group">
        <label>Group name</label>
        <input type="text" class="form-input item-field" data-field="name" value="${item.name}">
      </div>
      <div class="form-group">
        <label>Page to open</label>
        <input type="text" class="form-input item-field" data-field="link" value="${item.link}">
      </div>
      <div class="form-group">
        <label>Picture file</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Add a picture</label>
        <div class="file-input-group" onclick="document.getElementById('cat-image-upload').click()">
          <p>Click here or drag a picture here</p>
          <input type="file" id="cat-image-upload" accept="image/*" onchange="uploadItemFile(event, 'image')">
        </div>
        <img id="item-image-preview" class="image-preview" style="display:none;">
      </div>
    `;
  } else if (sectionName === 'categories') {
    formHTML = `
      <div class="form-group">
        <label>Group name</label>
        <input type="text" class="form-input item-field" data-field="name" value="${item.name}">
      </div>
      <div class="form-group">
        <label>Page to open</label>
        <input type="text" class="form-input item-field" data-field="link" value="${item.link}">
      </div>
      <div class="form-group">
        <label>Picture file</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Add a picture</label>
        <div class="file-input-group" onclick="document.getElementById('item-image-upload').click()">
          <p>Click here or drag a picture here</p>
          <input type="file" id="item-image-upload" accept="image/*" onchange="uploadItemImage(event)">
        </div>
        <img id="item-image-preview" class="image-preview" style="display:none;">
      </div>
    `;
  } else if (sectionName === 'clips') {
    formHTML = `
      <div class="form-group">
        <label>Video title</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Small label</label>
        <input type="text" class="form-input item-field" data-field="tag" value="${item.tag}">
      </div>
      <div class="form-group">
        <label>Short description</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
      </div>
      <div class="form-group">
        <label>Picture file</label>
        <input type="text" class="form-input item-field" data-field="image" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Add a picture</label>
        <div class="file-input-group" onclick="document.getElementById('clip-image-upload').click()">
          <p>Click here or drag a picture here</p>
          <input type="file" id="clip-image-upload" accept="image/*" onchange="uploadItemFile(event, 'image')">
        </div>
      </div>
      <div class="form-group">
        <label>Video file</label>
        <input type="text" class="form-input item-field" data-field="video" value="${item.video}">
      </div>
      <div class="form-group">
        <label>Add a video</label>
        <div class="file-input-group" onclick="document.getElementById('clip-video-upload').click()">
          <p>Click here or drag a video here</p>
          <input type="file" id="clip-video-upload" accept="video/*" onchange="uploadItemFile(event, 'video')">
        </div>
      </div>
    `;
  } else if (sectionName === 'updates') {
    formHTML = `
      <div class="form-group">
        <label>Day or date</label>
        <input type="text" class="form-input item-field" data-field="date" value="${item.date}">
      </div>
      <div class="form-group">
        <label>Month name</label>
        <input type="text" class="form-input item-field" data-field="month" value="${item.month}">
      </div>
      <div class="form-group">
        <label>Small label</label>
        <input type="text" class="form-input item-field" data-field="tag" value="${item.tag}">
      </div>
      <div class="form-group">
        <label>News title</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>News words</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
      </div>
    `;
  } else if (sectionName === 'serviceLocations' || sectionName.endsWith('Schedule')) {
    formHTML = `
      <div class="form-group">
        <label>Meeting name</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Day and time</label>
        <input type="text" class="form-input item-field" data-field="time" value="${item.time}">
      </div>
      <div class="form-group">
        <label>Where it happens</label>
        <input type="text" class="form-input item-field" data-field="location" value="${item.location || ''}">
      </div>
    `;
  } else if (sectionName.endsWith('Features') || sectionName === 'cellgroupValues') {
    formHTML = `
      <div class="form-group">
        <label>Small label</label>
        <input type="text" class="form-input item-field" data-field="tag" value="${item.tag || ''}">
      </div>
      <div class="form-group">
        <label>Heading</label>
        <input type="text" class="form-input item-field" data-field="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label>Short description</label>
        <textarea class="form-textarea item-field" data-field="description" rows="3">${item.description}</textarea>
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
    if (!response.ok) throw new Error('Your changes could not be saved. Please try again.');

    await loadContent();
    renderItemsList(editingSection);
    closeItemModal();
    showNotification('Your changes are saved!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

async function deleteItem(sectionName, itemId) {
  const itemName = itemNames[sectionName] || 'item';
  if (!confirm(`Remove this ${itemName}? You cannot undo this.`)) return;

  try {
    const response = await fetch(`${API_BASE}/api/content/${sectionName}/${itemId}`, {
      method: 'DELETE'
    });

    if (redirectIfUnauthorized(response)) return;
    if (!response.ok) throw new Error('It could not be removed. Please try again.');

    await loadContent();
    renderItemsList(sectionName);
    showNotification('It has been removed.', 'success');
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
  } else if (sectionName === 'updates') {
    newItem = { id: null, date: '', month: '', tag: '', title: '', description: '' };
  } else if (sectionName === 'serviceLocations' || sectionName.endsWith('Schedule')) {
    newItem = { id: null, title: '', time: '', location: '' };
  } else if (sectionName.endsWith('Features') || sectionName === 'cellgroupValues') {
    newItem = { id: null, tag: '', title: '', description: '' };
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
    if (!response.ok) throw new Error('Your changes could not be saved. Please try again.');

    await loadContent();
    renderItemsList(editingSection);
    closeItemModal();
    const itemName = itemNames[editingSection] || 'item';
    showNotification(`Your ${itemName} is ${editingItem.id ? 'updated' : 'added'}!`, 'success');
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
    if (!response.ok) throw new Error('The upload did not work. Please try again.');

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
    
    showNotification(`${fieldType === 'video' ? 'Video' : 'Picture'} added!`, 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// Fallback for old function name
async function uploadItemImage(event) {
  uploadItemFile(event, 'image');
}
