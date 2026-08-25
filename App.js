// Paste your Unsplash Access Key here
const ACCESS_KEY = 'SxMvgzWcLXkcwA_IGevV4zxP7lgCeKJVBzlwbZZHum8';
// Paste your Unsplash Access Key here

// App State
let currentQuery = 'Nature';
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryPills = document.querySelectorAll('.category-pill');

// Modal Elements
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const photographerAvatar = document.getElementById('photographerAvatar');
const photographerName = document.getElementById('photographerName');
const photographerUsername = document.getElementById('photographerUsername');
const modalLikes = document.getElementById('modalLikes');
const modalDimensions = document.getElementById('modalDimensions');
const downloadBtn = document.getElementById('downloadBtn');
const closeModal = document.getElementById('closeModal');

// Render Skeletons
function showSkeletons(count = 8) {
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    galleryGrid.appendChild(skeleton);
  }
}

function removeSkeletons() {
  const skeletons = document.querySelectorAll('.skeleton-card');
  skeletons.forEach(s => s.remove());
}

// Fetch Images from Unsplash API
async function fetchImages(query, page = 1, isNewSearch = false) {
  if (isLoading || (!hasMore && !isNewSearch)) return;

  if (ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY' || !ACCESS_KEY) {
    galleryGrid.innerHTML = `
      <p style="color:#ef4444; grid-column: 1/-1; text-align:center; padding: 2rem;">
        ⚠️ Access Key Missing! Replace 'YOUR_UNSPLASH_ACCESS_KEY' in app.js with your real key.
      </p>`;
    return;
  }

  isLoading = true;

  if (isNewSearch) {
    galleryGrid.innerHTML = '';
    showSkeletons(8);
    currentPage = 1;
    hasMore = true;
  } else {
    loadingIndicator.innerHTML = '<p>Loading more HD photos...</p>';
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(query)}&client_id=${ACCESS_KEY}&per_page=12`
    );
    const data = await response.json();

    removeSkeletons();
    loadingIndicator.innerHTML = '';

    if (!data.results || data.results.length === 0) {
      if (isNewSearch) {
        galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No images found. Try another search query!</p>';
      } else {
        hasMore = false;
        loadingIndicator.innerHTML = '<p>You have reached the end of the results.</p>';
      }
      isLoading = false;
      return;
    }

    displayImages(data.results);
    isLoading = false;

  } catch (error) {
    console.error('API Error:', error);
    removeSkeletons();
    loadingIndicator.innerHTML = '<p style="color:#ef4444;">Failed to fetch images. Please try again.</p>';
    isLoading = false;
  }
}

// Clean Display Images with Sharp Badge Icons
function displayImages(images) {
  images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${img.urls.small}" alt="${img.alt_description || 'Unsplash Image'}" loading="lazy">
      <div class="card-overlay">
        <div class="overlay-top">
          <button class="like-btn" data-likes="${img.likes}">
            ❤️ <span>${img.likes}</span>
          </button>
        </div>
        <div class="overlay-bottom">
          <div class="creator-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span>${img.user.name}</span>
          </div>
        </div>
      </div>
    `;

    // Handle Like Button Toggle
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isLiked = likeBtn.classList.toggle('liked');
      let currentLikes = parseInt(likeBtn.dataset.likes);
      currentLikes = isLiked ? currentLikes + 1 : currentLikes;
      likeBtn.querySelector('span').textContent = currentLikes;
    });

    // Open Modal
    card.addEventListener('click', () => openModal(img));

    galleryGrid.appendChild(card);
  });
}

// Direct HD Image Download
async function downloadImage(url, filename) {
  downloadBtn.innerText = 'Downloading...';
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${filename || 'pixelpulse-hd'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    downloadBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Downloaded!
    `;
    setTimeout(() => {
      downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download HD Image
      `;
    }, 2000);
  } catch (err) {
    console.error('Download error:', err);
    window.open(url, '_blank');
    downloadBtn.innerText = 'Download HD Image';
  }
}

// Open Lightbox Modal
function openModal(img) {
  modalImg.src = img.urls.regular;
  photographerAvatar.src = img.user.profile_image.medium;
  photographerName.textContent = img.user.name;
  photographerUsername.textContent = `@${img.user.username}`;
  modalLikes.textContent = img.likes;
  modalDimensions.textContent = `${img.width} x ${img.height}`;

  downloadBtn.onclick = () => downloadImage(img.urls.full, `pixelpulse-${img.id}`);

  imageModal.style.display = 'flex';
}

// Close Modal Events
closeModal.addEventListener('click', () => imageModal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === imageModal) imageModal.style.display = 'none';
});

// Search Events
function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    currentQuery = query;
    categoryPills.forEach(p => p.classList.remove('active'));
    fetchImages(currentQuery, 1, true);
  }
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// Category Pills Events
categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentQuery = pill.dataset.query;
    searchInput.value = '';
    fetchImages(currentQuery, 1, true);
  });
});

// Infinite Scroll Event
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
    if (!isLoading && hasMore) {
      currentPage++;
      fetchImages(currentQuery, currentPage, false);
    }
  }
});

// Initial Load
fetchImages(currentQuery, 1, true);