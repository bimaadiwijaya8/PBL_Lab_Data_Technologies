// Load Berita, Pengumuman, dan Agenda dari Backend PHP
document.addEventListener('DOMContentLoaded', function () {
  loadNewsAndAgenda();
  setupFilterButtons();
});

// Fetch data dari get_modul.php
async function loadNewsAndAgenda() {
  try {
    const response = await fetch('../assets/php/get_modul.php');
    const result = await response.json();

    if (result.status === 'success') {
      const { berita, pengumuman, agenda } = result.data;

      // Render berita dan pengumuman ke #news-list
      renderNewsList(berita, pengumuman);

      // Render agenda ke #upcoming-agenda
      renderAgenda(agenda);

      // Update kategori count
      updateCategoryCount(berita, pengumuman, agenda);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render Berita & Pengumuman ke #news-list
function renderNewsList(berita, pengumuman) {
  const newsList = document.getElementById('news-list');

  // Gabungkan berita dan pengumuman dengan tipe
  const allNews = [
    ...berita.map(item => ({ ...item, type: 'Berita' })),
    ...pengumuman.map(item => ({ ...item, type: 'Pengumuman' }))
  ];

  // Sort by date (terbaru)
  allNews.sort((a, b) => {
    const dateA = new Date(a.tanggal || a.id_pengumuman);
    const dateB = new Date(b.tanggal || b.id_pengumuman);
    return dateB - dateA;
  });

  // Clear existing content (hapus empty state)
  newsList.innerHTML = '';

  if (allNews.length === 0) {
    newsList.innerHTML = `
      <div class="text-center py-20">
        <div class="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-16 max-w-2xl mx-auto">
          <div class="relative mb-8">
            <div class="w-32 h-32 bg-gradient-to-br from-[#00A0D6]/10 to-[#6AC259]/10 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <svg class="w-16 h-16 text-[#00A0D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-4">Konten Sedang Dipersiapkan</h3>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
            Tim redaksi sedang menyiapkan berita dan pengumuman terbaru untuk Anda. 
            <span class="font-semibold text-[#00A0D6]">Pantau terus</span> halaman ini untuk mendapatkan informasi terkini.
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Render setiap item sebagai premium card
  allNews.forEach(item => {
    const card = createNewsCard(item);
    newsList.appendChild(card);
  });
}

// Create premium news card
function createNewsCard(item) {
  const div = document.createElement('div');
  div.className = 'news-card bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group';
  div.setAttribute('data-type', item.type.toLowerCase());

  // Format tanggal
  const date = new Date(item.tanggal || item.id_pengumuman);
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Tentukan warna berdasarkan tipe
  let badgeColor = 'bg-[#6AC259]';
  let badgeText = '📰 Berita';
  let icon = '📰';

  if (item.type === 'Pengumuman') {
    badgeColor = 'bg-purple-500';
    badgeText = '📢 Pengumuman';
    icon = '📢';
  }

// Gambar hanya untuk Berita
  let imageHTML = '';
  if (item.type === 'Berita' && item.gambar) {
    let imageUrl = '';

    // REVISI PATH: Hanya fokus ke folder 'assets/img/berita/'
    // Karena `berita.html` berada di folder `pages/`, kita perlu mundur satu langkah (..)
    // Hasil: ../assets/img/berita/nama_file.png (atau nama_file.jpg)
    
    // Cek apakah path dari DB sudah mengandung folder. Jika tidak, tambahkan.
    if (item.gambar.startsWith('assets/img/berita/')) {
      imageUrl = `../${item.gambar}`;
    } else {
      // Asumsi: Jika hanya nama file (ex: 'workshop.jpg'), maka file harusnya di folder target
      imageUrl = `../assets/img/berita/${item.gambar}`;
    }
    
    // Buat HTML Gambar dengan URL yang sudah benar
    imageHTML = ` 
      <div class="overflow-hidden h-56 bg-gray-200">
        <img src="${imageUrl}" alt="${item.judul}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
      </div>
    `;
  }

  div.innerHTML = `
    ${imageHTML}
    <div class="p-8">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 ${badgeColor} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            ${icon}
          </div>
          <div>
            <span class="inline-block px-3 py-1 ${badgeColor} text-white text-xs font-bold rounded-full">
              ${item.type}
            </span>
          </div>
        </div>
        <span class="text-sm text-gray-500 font-medium">${formattedDate}</span>
      </div>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#00A0D6] transition-colors">
        ${item.judul || item.nama_pengumuman || 'Untitled'}
      </h3>
      
      <p class="text-gray-600 leading-relaxed mb-6 line-clamp-3">
        ${item.isi || item.deskripsi || item.konten || 'Tidak ada deskripsi'}
      </p>
      
      <div class="flex items-center justify-between pt-6 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>${formattedDate}</span>
        </div>
        <a href="detail-berita.html?id=${item.id}" class="inline-flex items-center gap-2 text-[#00A0D6] font-semibold hover:gap-3 transition-all duration-300 group/link">
          Baca Selengkapnya
          <svg class="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
  `;

  return div;
}

// Render Agenda ke #upcoming-agenda
function renderAgenda(agenda) {
  const agendaContainer = document.getElementById('upcoming-agenda');

  // Clear existing content
  agendaContainer.innerHTML = '';

  if (agenda.length === 0) {
    agendaContainer.innerHTML = `
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-gradient-to-br from-[#6AC259]/10 to-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg class="w-10 h-10 text-[#6AC259]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h4 class="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Agenda</h4>
        <p class="text-gray-600 text-sm leading-relaxed">Agenda kegiatan akan ditampilkan di sini ketika tersedia</p>
      </div>
    `;
    return;
  }

  // Render setiap agenda sebagai list item premium
  agenda.forEach(item => {
    const agendaItem = document.createElement('div');
    agendaItem.className = 'p-6 bg-gradient-to-r from-[#6AC259]/5 to-green-500/5 rounded-2xl border border-[#6AC259]/20 hover:border-[#6AC259]/50 hover:shadow-lg transition-all duration-300 group';

    // Format tanggal
    const date = new Date(item.tgl_agenda);
    const formattedDate = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    agendaItem.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-[#6AC259] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
          📅
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 mb-1 group-hover:text-[#6AC259] transition-colors">
            ${item.nama_agenda || 'Agenda'}
          </h4>
          <p class="text-sm text-gray-600 mb-2 line-clamp-2">
            ${item.deskripsi || 'Tidak ada deskripsi'}
          </p>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>${formattedDate}</span>
          </div>
        </div>
      </div>
    `;

    agendaContainer.appendChild(agendaItem);
  });
}

// Update kategori count di sidebar
function updateCategoryCount(berita, pengumuman, agenda) {
  const totalCount = berita.length + pengumuman.length + agenda.length;

  // Get all category links
  const categoryLinks = document.querySelectorAll('#kategori .space-y-3 a');

  if (categoryLinks.length >= 4) {
    // Update count for each category
    // Semua Konten (All Content)
    const allCountSpan = categoryLinks[0].querySelector('span:last-child');
    if (allCountSpan) allCountSpan.textContent = totalCount;

    // Berita (News)
    const beritaCountSpan = categoryLinks[1].querySelector('span:last-child');
    if (beritaCountSpan) beritaCountSpan.textContent = berita.length;

    // Pengumuman (Announcements)
    const pengumumanCountSpan = categoryLinks[2].querySelector('span:last-child');
    if (pengumumanCountSpan) pengumumanCountSpan.textContent = pengumuman.length;

    // Agenda (Events)
    const agendaCountSpan = categoryLinks[3].querySelector('span:last-child');
    if (agendaCountSpan) agendaCountSpan.textContent = agenda.length;
  }
}

// Setup filter buttons
function setupFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsList = document.getElementById('news-list');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');

      // Update button styles
      filterBtns.forEach(b => {
        b.classList.remove('bg-[#00A0D6]', 'text-white');
        b.classList.add('bg-white', 'text-gray-700');
      });
      this.classList.remove('bg-white', 'text-gray-700');
      this.classList.add('bg-[#00A0D6]', 'text-white');

      // Filter cards
      const cards = newsList.querySelectorAll('.news-card');
      cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        if (filter === 'all' || cardType === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
