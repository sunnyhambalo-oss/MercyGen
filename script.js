const tribeData = [
  {
    name: 'Pray Tribe',
    members: 124,
    image: 'Images/WhatsApp Image 2026-08-13 at 08.56.18.jpeg',
    description: 'A prayer-focused tribe committed to worship, intercession, and spiritual renewal.',
    likes: 278,
    whatsapp: 'https://chat.whatsapp.com/EadccVTLtdZHzsadZqgGjC',
    posts: [
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.17.jpeg', caption: 'Prayer night was full of peace and renewed faith.' },
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.16.jpeg', caption: 'A beautiful moment of worship together.' }
    ]
  },
  {
    name: 'Serve Tribe',
    members: 98,
    image: 'Images/WhatsApp Image 2026-08-13 at 08.56.15.jpeg',
    description: 'A mission-hearted community that lives out Christ’s compassion in practical ways.',
    likes: 193,
    whatsapp: 'https://chat.whatsapp.com/EXAMPLE_SERVE_TRIBE',
    posts: [
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.14.jpeg', caption: 'We shared food, encouragement, and prayer with our neighbors.' },
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.13.jpeg', caption: 'Small acts of service can change a whole community.' }
    ]
  },
  {
    name: 'Youth Tribe',
    members: 216,
    image: 'Images/WhatsApp Image 2026-08-13 at 08.56.12.jpeg',
    description: 'A vibrant youth family where faith, friendships, and purpose are strengthened together.',
    likes: 432,
    whatsapp: 'https://chat.whatsapp.com/EXAMPLE_YOUTH_TRIBE',
    posts: [
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.11.jpeg', caption: 'We gathered to worship, pray, and hear the Word.' },
      { image: 'Images/WhatsApp Image 2026-08-13 at 08.56.15.jpeg', caption: 'Faith is growing among the next generation.' }
    ]
  }
];

const allContent = [
  { type: 'Testimony', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.13.jpeg', label: 'Healing' },
  { type: 'Update', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.11.jpeg', label: 'Prayer night' },
  { type: 'Tribe', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.15.jpeg', label: 'Pray Tribe' },
  { type: 'Devotional', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.12.jpeg', label: 'Daily verse' },
  { type: 'Testimony', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.16.jpeg', label: 'Salvation' },
  { type: 'Update', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.14.jpeg', label: 'Outreach' },
  { type: 'Tribe', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.18.jpeg', label: 'Serve Tribe' },
  { type: 'Devotional', image: 'Images/WhatsApp Image 2026-08-13 at 08.56.17.jpeg', label: 'Reflection' }
];

const devotionEntries = [
  { name: 'Sarah', scripture: 'Philippians 4:13', reflection: 'Christ strengthens me in every season, especially when I choose to trust Him over fear.' },
  { name: 'Daniel', scripture: 'Romans 15:13', reflection: 'God’s hope fills the heart and gives us courage to keep loving people well.' },
  { name: 'Grace', scripture: 'Psalm 46:10', reflection: 'In the noise of life, I am learning to be still and remember that God is with me.' }
];

const verseTranslations = {
  NIV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I lack nothing.', note: 'A reminder that Christ leads, provides, and keeps us.' },
  KJV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', note: 'His provision and guidance are a steady comfort for every day.' },
  ESV: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', note: 'God’s care is enough for each step and every need.' }
};

// Persistent set for joined tribes (store tribe indices as strings)
function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    // ignore
  }
}

const joinedTribes = loadSet('joinedTribes');

function isJoined(index) {
  return joinedTribes.has(String(index));
}

function renderHomeTribes() {
  const target = document.getElementById('home-tribe-grid');
  if (!target) return;

  target.innerHTML = tribeData
    .map((tribe, index) => {
      const latestPost = tribe.posts[0];
      const joined = isJoined(index);
      return `
        <article class="card tribe-card">
          <div class="tribe-visual">
            <img src="${latestPost ? latestPost.image : tribe.image}" alt="${tribe.name}" />
          </div>
          <div class="tribe-meta">
            <div>
              <strong>${tribe.name}</strong>
          
            </div>
            <button class="join-btn" data-tribe-index="${index}" type="button">${joined ? 'Joined' : 'Join'}</button>
          </div>
          <p>${tribe.description}</p>
          <p class="count">${latestPost ? latestPost.caption : 'Fresh updates from the tribe.'}</p>
        </article>
      `;
    })
    .join('');

}

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

function renderTribeDirectory() {
  const target = document.getElementById('tribe-directory');
  if (!target) return;

  target.innerHTML = tribeData
    .map((tribe, index) => `
      <article class="card tribe-card">
        <div class="tribe-visual">
          <img src="${tribe.image}" alt="${tribe.name}" />
        </div>
        <div class="tribe-meta">
          <div>
            <strong>${tribe.name}</strong>
            <div class="count">${tribe.members} members</div>
          </div>
          <button class="join-btn" data-tribe-index="${index}" type="button">${isJoined(index) ? 'Joined' : 'Join'}</button>
        </div>
        <p>${tribe.description}</p>
        
        <div class="tribe-posts" style="margin-top: 14px; display: grid; gap: 10px;">
          ${tribe.posts.map(post => `
            <div class="card" style="padding: 10px; border-radius: 14px;">
              <img src="${post.image}" alt="${tribe.name} post" style="border-radius: 12px; height: 120px; object-fit: cover;" />
              <p style="margin-top: 8px; margin-bottom: 0; color: var(--muted);">${post.caption}</p>
            </div>
          `).join('')}
        </div>
      </article>
    `).join('');

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

// Global click handler: handles join and like buttons
document.addEventListener('click', (e) => {
  const el = e.target;

  // Join button toggle
  const joinBtn = el.closest && el.closest('.join-btn');
  if (joinBtn) {
    const index = Number(joinBtn.dataset.tribeIndex);
    if (!Number.isNaN(index) && tribeData[index]) {
      const id = String(index);
      if (joinedTribes.has(id)) {
        // leave
        joinedTribes.delete(id);
      } else {
        // join
        joinedTribes.add(id);
        // open WhatsApp group (if configured)
        try {
          const wa = tribeData[index].whatsapp || 'https://chat.whatsapp.com/';
          window.open(wa, '_blank');
        } catch (e) {
          // ignore popup blockers or errors
        }
      }
      saveSet('joinedTribes', joinedTribes);
      renderHomeTribes();
      renderTribeDirectory();
    }
    return;
  }

  
});

function bindVerseSelector() {
  const selector = document.getElementById('verse-version');
  if (!selector) return;

  selector.addEventListener('change', (event) => {
    updateVerse(event.target.value);
  });
}

function bindTribePostForm() {
  const form = document.getElementById('tribe-post-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const tribeName = String(formData.get('tribe'));
    const image = String(formData.get('image'));
    const caption = String(formData.get('caption'));

    const tribe = tribeData.find((entry) => entry.name === tribeName);
    if (!tribe) return;

    tribe.posts.unshift({ image, caption });
    tribe.image = image;
    renderHomeTribes();
    renderTribeDirectory();
    form.reset();
  });
}

function init() {
  renderHomeTribes();
  renderAllContent();
  renderTribeDirectory();
  renderDevotions();
  updateVerse('NIV');
  bindVerseSelector();
  bindDonationAmount();
  bindDevotionForm();
  bindTribePostForm();
}

document.addEventListener('DOMContentLoaded', init);
