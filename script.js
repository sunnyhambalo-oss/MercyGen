// ==================== API Loading ====================
const API_BASE = window.location.origin;
let appContent = {};

// Load content from API on page load
async function loadAppContent() {
  try {
    appContent = await fetchAppContent();

    devotionEntries = appContent.devotions || devotionEntries;
    
    // Create allContent from clips and updates
    allContent = [];
    if (appContent.clips) {
      allContent.push(...appContent.clips.map(clip => ({
        type: 'Clip',
        image: clip.image,
        label: clip.title
      })));
    }
    if (appContent.updates) {
      allContent.push(...appContent.updates.map(update => ({
        type: 'Update',
        image: 'Images/WhatsApp Image 2026-08-13 at 08.56.15.jpeg',
        label: update.title
      })));
    }
    
    renderHomeContent();
    renderAllContent();
    renderDevotions();
    renderPageHero('college', appContent.collegeHero);
    renderPageFeatures('college', appContent.collegeFeatures);
    renderPageSchedule('college', appContent.collegeSchedule);
    renderPageHero('highschool', appContent.highSchoolHero);
    renderPageFeatures('highschool', appContent.highSchoolFeatures);
    renderPageSchedule('highschool', appContent.highSchoolSchedule);
    renderPageHero('kids', appContent.kidsHero);
    renderPageFeatures('kids', appContent.kidsFeatures);
    renderPageSchedule('kids', appContent.kidsSchedule);
    renderPageHero('cellgroup', appContent.cellgroupHero);
    renderCellgroupExtras();
    renderPageSchedule('cellgroup', appContent.cellgroupSchedule);
    renderPageHero('donate', appContent.donateHero);
    console.log('Content loaded');
  } catch (err) {
    console.error('Error loading content:', err);
  }
}

// Try the live admin API first (local/hosted server); fall back to the static
// JSON file for hosts with no backend, like GitHub Pages.
async function fetchAppContent() {
  try {
    const apiResponse = await fetch(`${API_BASE}/api/content`);
    if (apiResponse.ok) return await apiResponse.json();
  } catch (err) {
    // API unreachable (e.g. static hosting) - fall through to static file
  }

  const staticResponse = await fetch('data/content.json');
  if (!staticResponse.ok) throw new Error('Failed to load content');
  return await staticResponse.json();
}


function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderHomeContent() {
  if (document.body.dataset.page !== 'home') return;

  const hero = appContent.hero;
  if (hero) {
    document.getElementById('hero-eyebrow').textContent = hero.eyebrow || '';
    document.getElementById('hero-title').innerHTML = hero.title || '';
    document.getElementById('hero-subtitle').textContent = hero.subtitle || '';
    document.getElementById('hero-cta').innerHTML = (hero.cta || []).map(cta => {
      const type = cta.type === 'secondary' ? 'secondary' : 'primary';
      return `<a href="${escapeHtml(cta.link)}" class="button button-${type} hero-give-button">${escapeHtml(cta.text)}</a>`;
    }).join('');
  }

  const mission = appContent.mission;
  if (mission) {
    document.getElementById('mission-eyebrow').textContent = mission.eyebrow || '';
    document.getElementById('mission-title').textContent = mission.title || '';
    document.getElementById('mission-description').textContent = mission.description || '';
  }

  const greatLove = appContent.greatLove;
  if (greatLove) {
    document.getElementById('great-love-eyebrow').textContent = greatLove.eyebrow || '';
    document.getElementById('great-love-title').textContent = greatLove.title || '';
    document.getElementById('great-love-description').textContent = greatLove.description || '';
    const video = document.getElementById('great-love-video');
    video.setAttribute('poster', greatLove.image || '');
    video.innerHTML = `<source src="${escapeHtml(greatLove.video)}" type="${greatLove.video && greatLove.video.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}">`;
    video.load();
  }

  if (Array.isArray(appContent.categories)) {
    document.getElementById('category-grid').innerHTML = appContent.categories.map(category => `
      <a href="${escapeHtml(category.link)}" class="category-card">
        <div class="category-image">
          <img src="${escapeHtml(category.image)}" alt="${escapeHtml(category.name)} ministry">
        </div>
        <div class="category-label">${escapeHtml(category.name)}</div>
      </a>
    `).join('');
  }

  if (Array.isArray(appContent.clips)) {
    document.getElementById('clips-grid').innerHTML = appContent.clips.map(clip => `
      <article class="card media-card">
        <div class="media-shell">
          <video controls poster="${escapeHtml(clip.image)}">
            <source src="${escapeHtml(clip.video)}" type="${clip.video.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}">
          </video>
        </div>
        <div class="card-body">
          <span class="tag">${escapeHtml(clip.tag)}</span>
          <h3>${escapeHtml(clip.title)}</h3>
          <p>${escapeHtml(clip.description)}</p>
        </div>
      </article>
    `).join('');
  }

  if (Array.isArray(appContent.updates)) {
    document.getElementById('updates-grid').innerHTML = appContent.updates.map(update => `
      <article class="card update-card">
        <div class="mini-date"><span>${escapeHtml(update.date)}</span><small>${escapeHtml(update.month)}</small></div>
        <div>
          <span class="tag">${escapeHtml(update.tag)}</span>
          <h3>${escapeHtml(update.title)}</h3>
          <p>${escapeHtml(update.description)}</p>
        </div>
      </article>
    `).join('');
  }

  if (Array.isArray(appContent.serviceLocations)) {
    document.getElementById('service-locations-list').innerHTML = appContent.serviceLocations.map(location => `
      <div class="meetup-item">
        <h3>${escapeHtml(location.title)}</h3>
        <p class="meetup-time">${escapeHtml(location.time)}</p>
        <p class="meetup-location">${escapeHtml(location.location || '')}</p>
      </div>
    `).join('');
  }
}

// Load content immediately
loadAppContent();

// ==================== Fallback Data ====================

let allContent = [
  { type: 'Testimony', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.13.jpeg', label: 'Healing' },
  { type: 'Update', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.11.jpeg', label: 'Prayer night' },
  { type: 'Devotional', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.12.jpeg', label: 'Daily verse' },
  { type: 'Testimony', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.16.jpeg', label: 'Salvation' },
  { type: 'Update', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.14.jpeg', label: 'Outreach' },
  { type: 'Devotional', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.17.jpeg', label: 'Reflection' }
];

let devotionEntries = [
  { name: 'Sarah', scripture: 'Philippians 4:13', reflection: 'Christ strengthens me in every season, especially when I choose to trust Him over fear.' },
  { name: 'Daniel', scripture: 'Romans 15:13', reflection: 'God’s hope fills the heart and gives us courage to keep loving people well.' },
  { name: 'Grace', scripture: 'Psalm 46:10', reflection: 'In the noise of life, I am learning to be still and remember that God is with me.' }
];

const verseTranslations = {
  NIV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I lack nothing.', note: 'A reminder that Christ leads, provides, and keeps us.' },
  KJV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', note: 'His provision and guidance are a steady comfort for every day.' },
  ESV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', note: 'God’s care is enough for each step and every need.' }
};

function renderAllContent() {
  const target = document.getElementById('all-content');
  if (!target) return;

  target.innerHTML = allContent
    .map(
      (item) => `
        <article class="card all-item">
          <div class="thumb">
            <img src="${item.image}" alt="${item.label}" />
          </div>
          <span class="tag">${item.type}</span>
          <h3>${item.label}</h3>
        </article>
      `
    )
    .join('');
}

function renderDevotions() {
  const target = document.getElementById('devotion-list');
  if (!target) return;

  target.innerHTML = devotionEntries
    .map(
      (item) => `
        <article class="devotion-item">
          <h4>${item.name}</h4>
          <p><strong>${item.scripture}</strong></p>
          <p>${item.reflection}</p>
        </article>
      `
    )
    .join('');
}

function renderPageHero(prefix, data) {
  if (!data) return;
  const eyebrowEl = document.getElementById(`${prefix}-hero-eyebrow`);
  const titleEl = document.getElementById(`${prefix}-hero-title`);
  const leadEl = document.getElementById(`${prefix}-hero-lead`);
  if (eyebrowEl) eyebrowEl.textContent = data.eyebrow || '';
  if (titleEl) titleEl.textContent = data.title || '';
  if (leadEl) leadEl.textContent = data.lead || '';
}

function renderPageFeatures(prefix, items) {
  const target = document.getElementById(`${prefix}-features-grid`);
  if (!target || !Array.isArray(items)) return;
  target.innerHTML = items.map(item => `
    <article class="card feature-card">
      <span class="tag">${escapeHtml(item.tag)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join('');
}

function renderPageSchedule(prefix, items) {
  const target = document.getElementById(`${prefix}-schedule-list`);
  if (!target || !Array.isArray(items)) return;
  target.innerHTML = items.map(item => `
    <div class="meetup-item">
      <h3>${escapeHtml(item.title)}</h3>
      <p class="meetup-time">${escapeHtml(item.time)}</p>
      <p class="meetup-location">${escapeHtml(item.location || '')}</p>
    </div>
  `).join('');
}

function renderCellgroupExtras() {
  const gather = appContent.cellgroupGather;
  if (gather) {
    const tagEl = document.getElementById('cellgroup-gather-tag');
    const titleEl = document.getElementById('cellgroup-gather-title');
    const descEl = document.getElementById('cellgroup-gather-description');
    if (tagEl) tagEl.textContent = gather.tag || '';
    if (titleEl) titleEl.textContent = gather.title || '';
    if (descEl) descEl.textContent = gather.description || '';
  }

  const target = document.getElementById('cellgroup-values-list');
  if (target && Array.isArray(appContent.cellgroupValues)) {
    target.innerHTML = appContent.cellgroupValues.map(item => `
      <div class="info-row"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description)}</span></div>
    `).join('');
  }
}

function updateVerse(version) {
  const verse = verseTranslations[version] || verseTranslations.NIV;
  const referenceEl = document.getElementById('verse-reference');
  const textEl = document.getElementById('verse-text');
  const noteEl = document.getElementById('verse-note');

  if (!referenceEl || !textEl || !noteEl) return;

  referenceEl.textContent = verse.reference;
  textEl.textContent = verse.text;
  noteEl.textContent = verse.note;
}

function bindDonationAmount() {
  const buttons = document.querySelectorAll('.amount-btn');
  const custom = document.getElementById('custom-amount');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      if (custom) custom.value = button.dataset.amount || '';
    });
  });
}

function bindDevotionForm() {
  const form = document.getElementById('devotion-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const scripture = formData.get('scripture');
    const reflection = formData.get('reflection');

    devotionEntries.unshift({
      name: String(name),
      scripture: String(scripture),
      reflection: String(reflection)
    });

    renderDevotions();
    form.reset();
  });
}

function bindVerseSelector() {
  const selector = document.getElementById('verse-version');
  if (!selector) return;

  selector.addEventListener('change', (event) => {
    updateVerse(event.target.value);
  });
}

function init() {
  renderAllContent();
  renderDevotions();
  updateVerse('NIV');
  bindVerseSelector();
  bindDonationAmount();
  bindDevotionForm();
}

document.addEventListener('DOMContentLoaded', init);
