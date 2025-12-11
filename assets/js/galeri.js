// Gallery data - in a real application, this would come from an API
const galleryData = [
  {
    id: 1,
    title: 'Kegiatan Workshop',
    category: 'kegiatan',
    image: '../assets/img/galeri/rapat.jpeg',
    date: '15 November 2023',
    description: 'Workshop pengembangan keterampilan data science untuk mahasiswa dengan topik pengolahan data menggunakan Python dan library terkait.'
  },
  {
    id: 2,
    title: 'Dokumentasi Acara',
    category: 'dokumentasi',
    image: '../assets/img/galeri/44048-pentingnya-jasa-video-shooting-dokumentasi-acara-kampus6HbMC.jpg',
    date: '30 Oktober 2023',
    description: 'Dokumentasi lengkap acara tahunan laboratorium yang menampilkan berbagai kegiatan dan prestasi mahasiswa.'
  },
  {
    id: 3,
    title: 'Sesi Pelatihan',
    category: 'kegiatan',
    image: '../assets/img/galeri/WP_20180514_08_27_08_Pro.jpg',
    date: '10 November 2023',
    description: 'Sesi pelatihan intensif tentang machine learning dan artificial intelligence untuk pengembangan proyek penelitian.'
  },
  {
    id: 4,
    title: 'Rapat Koordinasi',
    category: 'kegiatan',
    image: '../assets/img/galeri/WhatsApp Image 2021-11-30 at 13.16.08 (2).jpeg',
    date: '25 November 2023',
    description: 'Rapat koordinasi tim dosen dan asisten laboratorium untuk membahas program kerja semester depan.'
  },
  {
    id: 5,
    title: 'Seminar Mahasiswa',
    category: 'kegiatan',
    image: '../assets/img/galeri/195sambut-mah20220908081250.jpg',
    date: '25 Desember 2023',
    description: 'Seminar nasional dengan tema inovasi teknologi data yang dihadiri oleh mahasiswa dari berbagai perguruan tinggi.'
  }
];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const mainImage = document.getElementById('main-image');
  const imageTitle = document.getElementById('image-title');
  const imageDate = document.getElementById('image-date');
  const thumbnailsContainer = document.querySelector('.thumbnails');
  
  // Initialize the gallery
  function initGallery() {
    // Set the first image as default
    if (galleryData.length > 0) {
      updateMainImage(galleryData[0]);
      renderThumbnails(galleryData);
    }
  }
  
  // Update the main image display
  function updateMainImage(item) {
    mainImage.src = item.image;
    mainImage.alt = item.title;
    imageTitle.textContent = item.title;
    imageDate.textContent = item.date;
    
    // Update description if it exists
    const imageDescription = document.getElementById('image-description');
    if (imageDescription) {
      imageDescription.textContent = item.description || '';
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.classList.remove('ring-2', 'ring-[#00A0D6]', 'ring-offset-2');
      if (parseInt(thumb.dataset.id) === item.id) {
        thumb.classList.add('ring-2', 'ring-[#00A0D6]', 'ring-offset-2');
      }
    });
  }
  
  // Render thumbnails
  function renderThumbnails(items) {
    thumbnailsContainer.innerHTML = '';
    items.forEach(item => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:opacity-100';
      thumbnail.dataset.id = item.id;
      thumbnail.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
      `;
      thumbnail.addEventListener('click', () => updateMainImage(item));
      thumbnailsContainer.appendChild(thumbnail);
    });
  }
  
  // Filter thumbnails by category
  function filterThumbnails(category) {
    const filteredItems = category === 'all' 
      ? galleryData 
      : galleryData.filter(item => item.category === category);
    
    renderThumbnails(filteredItems);
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('ring-2', 'ring-offset-2', 'opacity-100');
        btn.classList.remove('opacity-70');
      } else {
        btn.classList.remove('ring-2', 'ring-offset-2', 'opacity-100');
        btn.classList.add('opacity-70');
      }
    });
  }
  
  // Event listeners for category buttons
  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
      filterThumbnails(button.dataset.category);
    });
  });
  
  // Initialize the gallery
  initGallery();
});
