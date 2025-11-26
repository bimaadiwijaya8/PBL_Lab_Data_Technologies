// Lab Data Technologies – Frontend-only (Backend-Ready)
// All functions are placeholders ready for API integration
// NO localStorage, NO fake CRUD, NO dummy data

// ===== UTILITY FUNCTIONS =====
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Toast utility
let toastEl = null;
function ensureToast() {
  if (toastEl) return toastEl;
  const div = document.createElement('div');
  div.id = 'toast';
  div.className = 'fixed z-[60] bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm shadow-lg hidden';
  document.body.appendChild(div);
  toastEl = div;
  return toastEl;
}

function showToast(message = 'Aksi berhasil', duration = 2000) {
  ensureToast();
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toastEl.classList.add('hidden'); }, duration);
}

// Page transitions
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('is-loaded');
  
  // Internal link transitions
  qsa('a[href]')
    .filter(a => a.origin === location.origin)
    .forEach(a => {
      a.addEventListener('click', (e) => {
        if (a.target === '_blank' || a.hasAttribute('download') || a.getAttribute('href').startsWith('#')) return;
        e.preventDefault();
        document.documentElement.classList.remove('is-loaded');
        document.documentElement.classList.add('is-leaving');
        setTimeout(() => { window.location.href = a.href; }, 160);
      });
    });
});

// Mobile navigation toggles
qsa('[data-nav-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = qs(btn.dataset.navToggle);
    if (target) target.classList.toggle('hidden');
  });
});

// Modal system
function openModal(id) {
  const m = qs(id);
  if (!m) return;
  m.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeModal(id) {
  const m = qs(id);
  if (!m) return;
  m.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

document.addEventListener('click', (e) => {
  const openBtn = e.target.closest('[data-modal-open]');
  if (openBtn) {
    openModal(openBtn.dataset.modalOpen);
  }
  const closeBtn = e.target.closest('[data-modal-close]');
  if (closeBtn) {
    closeModal(closeBtn.dataset.modalClose);
  }
  const backdrop = e.target.closest('.modal-backdrop');
  if (backdrop && e.target === backdrop) {
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
});

// ===== AUTHENTICATION FUNCTIONS =====
// Login handler - backend will determine role and redirect
function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Show loading state
  showLoginLoading();
  
  // Prepare payload for backend
  const loginPayload = {
    email: formData.get('email'),
    password: formData.get('password'),
    role: "" // Backend will determine role
  };
  
  // Placeholder for API call
  console.log('Login attempt:', loginPayload);
  
  // Backend will call redirectToDashboard(role) after successful authentication
  // For now, just show loading message
  setTimeout(() => {
    hideLoginLoading();
    showLoginSuccess('Login berhasil, mengarahkan ke dashboard...');
  }, 1500);
  
  return false; // Prevent form submission
}

// Role-based redirection function (to be called by backend)
function redirectToDashboard(role) {
  const redirectUrls = {
    'admin': 'admin-dashboard.html',
    'editor': 'editor-dashboard.html', 
    'member': 'member-dashboard.html'
  };
  
  const url = redirectUrls[role.toLowerCase()];
  if (url) {
    console.log(`Redirecting to ${role} dashboard:`, url);
    // Backend will handle actual redirection
    // window.location.href = url;
  } else {
    showLoginError('Role tidak valid');
  }
}

// Login UI helper functions
function showLoginLoading() {
  hideAllLoginMessages();
  document.getElementById('loginLoading').classList.remove('hidden');
  document.getElementById('loginBtn').disabled = true;
}

function hideLoginLoading() {
  document.getElementById('loginLoading').classList.add('hidden');
  document.getElementById('loginBtn').disabled = false;
}

function showLoginSuccess(message) {
  hideAllLoginMessages();
  document.getElementById('loginSuccessMessage').textContent = message;
  document.getElementById('loginSuccess').classList.remove('hidden');
}

function showLoginError(message) {
  hideAllLoginMessages();
  document.getElementById('loginErrorMessage').textContent = message;
  document.getElementById('loginError').classList.remove('hidden');
}

function hideAllLoginMessages() {
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('loginSuccess').classList.add('hidden');
  document.getElementById('loginLoading').classList.add('hidden');
}

// Registration handler
function handleRegisterMember(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Member registration:', Object.fromEntries(formData));
  
  showToast('Pendaftaran berhasil dikirim, menunggu persetujuan admin');
  form.reset();
}

// ===== BERITA (NEWS) FUNCTIONS =====
function handleCreateBerita(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Create berita:', Object.fromEntries(formData));
  
  showToast('Berita berhasil dibuat, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-berita');
}

function handleUpdateBerita(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  // Placeholder for API call
  console.log('Update berita:', id, Object.fromEntries(formData));
  
  showToast('Berita berhasil diperbarui, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-berita');
}

function handleDeleteBerita(id) {
  if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
    // Placeholder for API call
    console.log('Delete berita:', id);
    
    showToast('Berita berhasil dihapus');
  }
}

// ===== PUBLIKASI (PUBLICATION) FUNCTIONS =====
function handleCreatePublikasi(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Enhanced publikasi data structure
  const publikasiData = {
    judul: formData.get('judul'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi: formData.get('deskripsi'),
    status: 'pending' // Default status for new publications
  };
  
  // Placeholder for API call
  console.log('Create publikasi:', publikasiData);
  
  showToast('Publikasi berhasil dibuat, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-publikasi');
}

function handleUpdatePublikasi(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  // Enhanced publikasi data structure
  const publikasiData = {
    judul: formData.get('judul'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi: formData.get('deskripsi'),
    status: 'pending' // Reset to pending after edit
  };
  
  // Placeholder for API call
  console.log('Update publikasi:', id, publikasiData);
  
  showToast('Publikasi berhasil diperbarui, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-publikasi');
}

function handleDeletePublikasi(id) {
  if (confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
    // Placeholder for API call
    console.log('Delete publikasi:', id);
    
    showToast('Publikasi berhasil dihapus');
  }
}

// Admin publikasi approval functions
function approvePublikasi(id) {
  // Placeholder for API call
  console.log('Approve publikasi:', id);
  
  showToast('Publikasi berhasil disetujui');
}

function rejectPublikasi(id) {
  if (confirm('Apakah Anda yakin ingin menolak publikasi ini?')) {
    // Placeholder for API call
    console.log('Reject publikasi:', id);
    
    showToast('Publikasi ditolak');
  }
}

// ===== AGENDA FUNCTIONS =====
function handleCreateAgenda(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Create agenda:', Object.fromEntries(formData));
  
  showToast('Agenda berhasil dibuat, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-agenda');
}

function handleUpdateAgenda(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  // Placeholder for API call
  console.log('Update agenda:', id, Object.fromEntries(formData));
  
  showToast('Agenda berhasil diperbarui, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-agenda');
}

function handleDeleteAgenda(id) {
  if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
    // Placeholder for API call
    console.log('Delete agenda:', id);
    
    showToast('Agenda berhasil dihapus');
  }
}

// ===== GALERI (GALLERY) FUNCTIONS =====
function handleCreateGaleri(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Create galeri:', Object.fromEntries(formData));
  
  showToast('Foto galeri berhasil ditambahkan, menunggu persetujuan admin');
  form.reset();
  closeModal('#modal-galeri');
}

function handleDeleteGaleri(id) {
  if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
    // Placeholder for API call
    console.log('Delete galeri:', id);
    
    showToast('Foto berhasil dihapus');
  }
}

// ===== ADMIN FUNCTIONS =====
// Member approval functions
function approveMember(id) {
  // Placeholder for API call
  console.log('Approve member:', id);
  
  showToast('Member berhasil disetujui');
}

function rejectMember(id) {
  if (confirm('Apakah Anda yakin ingin menolak member ini?')) {
    // Placeholder for API call
    console.log('Reject member:', id);
    
    showToast('Member ditolak');
  }
}

// Content approval functions (for Editor & Member submissions)
function approveContent(id) {
  // Placeholder for API call
  console.log('Approve content:', id);
  
  showToast('Konten berhasil disetujui');
}

function rejectContent(id) {
  if (confirm('Apakah Anda yakin ingin menolak konten ini?')) {
    // Placeholder for API call
    console.log('Reject content:', id);
    
    showToast('Konten ditolak');
  }
}

// Legacy function names for backward compatibility
function approveEditorChange(id) {
  approveContent(id);
}

function rejectEditorChange(id) {
  rejectContent(id);
}

// ===== FASILITAS FUNCTIONS =====
function handleCreateFasilitas(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Create fasilitas:', Object.fromEntries(formData));
  
  showToast('Fasilitas berhasil ditambahkan');
  form.reset();
  closeModal('#modal-fasilitas');
}

function handleUpdateFasilitas(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  // Placeholder for API call
  console.log('Update fasilitas:', id, Object.fromEntries(formData));
  
  showToast('Fasilitas berhasil diperbarui');
  form.reset();
  closeModal('#modal-fasilitas');
}

function handleDeleteFasilitas(id) {
  if (confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
    // Placeholder for API call
    console.log('Delete fasilitas:', id);
    
    showToast('Fasilitas berhasil dihapus');
  }
}

// ===== PENGUMUMAN FUNCTIONS =====
function handleCreatePengumuman(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Placeholder for API call
  console.log('Create pengumuman:', Object.fromEntries(formData));
  
  showToast('Pengumuman berhasil dibuat');
  form.reset();
  closeModal('#modal-pengumuman');
}

function handleUpdatePengumuman(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  // Placeholder for API call
  console.log('Update pengumuman:', id, Object.fromEntries(formData));
  
  showToast('Pengumuman berhasil diperbarui');
  form.reset();
  closeModal('#modal-pengumuman');
}

function handleDeletePengumuman(id) {
  if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
    // Placeholder for API call
    console.log('Delete pengumuman:', id);
    
    showToast('Pengumuman berhasil dihapus');
  }
}

// ===== MEMBER DASHBOARD FUNCTIONS =====
// Member profile update
function updateMemberProfile(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Enhanced member profile data structure
  const profileData = {
    nama_lengkap: formData.get('nama_lengkap'),
    nim: formData.get('nim'),
    jurusan: formData.get('jurusan'),
    program_studi: formData.get('program_studi'),
    kelas: formData.get('kelas'),
    tahun_angkatan: formData.get('tahun_angkatan'),
    nomor_telepon: formData.get('nomor_telepon'),
    email: formData.get('email'),
    photo: formData.get('photo')
  };
  
  // Placeholder for API call
  console.log('Update member profile:', profileData);
  
  showToast('Data diri berhasil diperbarui, menunggu persetujuan admin');
  return false;
}

// Legacy function for backward compatibility
function handleUpdateProfile(event) {
  return updateMemberProfile(event);
}

// Member publication functions
function createPublication(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Enhanced member publikasi data structure
  const publikasiData = {
    judul_publikasi: formData.get('judul_publikasi'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi_singkat: formData.get('deskripsi_singkat'),
    status: 'pending', // Default status for member submissions
    submitted_by: 'member' // Indicates this was submitted by a member
  };
  
  // Placeholder for API call
  console.log('Member create publikasi:', publikasiData);
  
  showToast('Publikasi berhasil dikirim, menunggu persetujuan admin');
  form.reset();
  closeAddPublicationModal();
  return false;
}

function updatePublication(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = formData.get('publication_id');
  
  // Enhanced member publikasi data structure
  const publikasiData = {
    judul_publikasi: formData.get('judul_publikasi'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi_singkat: formData.get('deskripsi_singkat'),
    status: 'pending', // Reset to pending after member edit
    submitted_by: 'member'
  };
  
  // Placeholder for API call
  console.log('Member update publikasi:', id, publikasiData);
  
  showToast('Publikasi berhasil diperbarui, menunggu persetujuan admin');
  form.reset();
  closeEditPublicationModal();
  return false;
}

function deletePublication(id) {
  if (confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
    // Placeholder for API call
    console.log('Member delete publikasi:', id);
    
    showToast('Publikasi berhasil dihapus');
  }
}

// Legacy functions for backward compatibility
function handleMemberCreatePublikasi(event) {
  return createPublication(event);
}

function handleMemberUpdatePublikasi(event) {
  return updatePublication(event);
}

function handleMemberDeletePublikasi(id) {
  return deletePublication(id);
}

// ===== EDITOR CONTENT FUNCTIONS =====

// Editor News Functions
function createNews(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const newsData = {
    judul_berita: formData.get('judul_berita'),
    isi_berita: formData.get('isi_berita'),
    gambar_berita: formData.get('gambar_berita'),
    kategori_berita: formData.get('kategori_berita'),
    tanggal_berita: formData.get('tanggal_berita'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor create news:', newsData);
  showToast('Berita berhasil dibuat, menunggu persetujuan admin');
  form.reset();
  closeAddNewsModal();
  return false;
}

function updateNews(id) {
  console.log('Editor update news:', id);
  showToast('Berita berhasil diperbarui, menunggu persetujuan admin');
}

function deleteNews(id) {
  if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
    console.log('Editor delete news:', id);
    showToast('Berita berhasil dihapus');
  }
}

// Editor Agenda Functions
function createAgenda(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const agendaData = {
    nama_agenda: formData.get('nama_agenda'),
    tanggal_agenda: formData.get('tanggal_agenda'),
    link_agenda: formData.get('link_agenda'),
    deskripsi: formData.get('deskripsi'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor create agenda:', agendaData);
  showToast('Agenda berhasil dibuat, menunggu persetujuan admin');
  return false;
}

function updateAgenda(id) {
  console.log('Editor update agenda:', id);
  showToast('Agenda berhasil diperbarui, menunggu persetujuan admin');
}

function deleteAgenda(id) {
  if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
    console.log('Editor delete agenda:', id);
    showToast('Agenda berhasil dihapus');
  }
}

// Editor Gallery Functions
function createGallery(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const galleryData = {
    upload_foto: formData.get('upload_foto'),
    nama_foto: formData.get('nama_foto'),
    deskripsi_singkat: formData.get('deskripsi_singkat'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor create gallery:', galleryData);
  showToast('Foto berhasil diunggah, menunggu persetujuan admin');
  return false;
}

function updateGallery(id) {
  console.log('Editor update gallery:', id);
  showToast('Foto berhasil diperbarui, menunggu persetujuan admin');
}

function deleteGallery(id) {
  if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
    console.log('Editor delete gallery:', id);
    showToast('Foto berhasil dihapus');
  }
}

// Editor Facility Functions
function createFacility(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const facilityData = {
    foto_fasilitas: formData.get('foto_fasilitas'),
    nama_fasilitas: formData.get('nama_fasilitas'),
    deskripsi: formData.get('deskripsi'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor create facility:', facilityData);
  showToast('Fasilitas berhasil ditambahkan, menunggu persetujuan admin');
  return false;
}

function updateFacility(id) {
  console.log('Editor update facility:', id);
  showToast('Fasilitas berhasil diperbarui, menunggu persetujuan admin');
}

function deleteFacility(id) {
  if (confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
    console.log('Editor delete facility:', id);
    showToast('Fasilitas berhasil dihapus');
  }
}

// Editor Publication Functions
function handleEditorCreatePublikasi(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const publikasiData = {
    judul_publikasi: formData.get('judul_publikasi'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi_singkat: formData.get('deskripsi_singkat'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor create publikasi:', publikasiData);
  showToast('Publikasi berhasil dibuat, menunggu persetujuan admin');
  form.reset();
  return false;
}

function handleEditorUpdatePublikasi(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = form.dataset.editId;
  
  const publikasiData = {
    judul_publikasi: formData.get('judul_publikasi'),
    tanggal_upload: formData.get('tanggal_upload'),
    penyusun: formData.get('penyusun'),
    link_jurnal: formData.get('link_jurnal'),
    dosen_pengampu: formData.get('dosen_pengampu'),
    deskripsi_singkat: formData.get('deskripsi_singkat'),
    status: 'pending',
    submitted_by: 'editor'
  };
  
  console.log('Editor update publikasi:', id, publikasiData);
  showToast('Publikasi berhasil diperbarui, menunggu persetujuan admin');
  form.reset();
  return false;
}

function handleEditorDeletePublikasi(id) {
  if (confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
    console.log('Editor delete publikasi:', id);
    showToast('Publikasi berhasil dihapus');
  }
}

// Modal Functions for Editor
function openAddNewsModal() {
  console.log('Open add news modal');
}

function openEditNewsModal(id) {
  console.log('Open edit news modal for ID:', id);
}

function openAddAgendaModal() {
  console.log('Open add agenda modal');
}

function openEditAgendaModal(id) {
  console.log('Open edit agenda modal for ID:', id);
}

function openAddGalleryModal() {
  console.log('Open add gallery modal');
}

function openEditGalleryModal(id) {
  console.log('Open edit gallery modal for ID:', id);
}

function openAddFacilityModal() {
  console.log('Open add facility modal');
}

function openEditFacilityModal(id) {
  console.log('Open edit facility modal for ID:', id);
}

// ===== MEMBER DASHBOARD UI FUNCTIONS =====
function initializeMemberDashboard() {
  // Initialize sidebar navigation
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const contentSections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }
  
  // Sidebar navigation
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      sidebarLinks.forEach(l => l.classList.remove('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary'));
      
      // Add active class to clicked link
      link.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
      
      // Hide all content sections
      contentSections.forEach(section => section.classList.add('hidden'));
      
      // Show corresponding content section
      const href = link.getAttribute('href');
      if (href === '#dashboard') {
        document.getElementById('dashboard-section').classList.remove('hidden');
        pageTitle.textContent = 'Dashboard Member';
      } else if (href === '#publikasi') {
        document.getElementById('publikasi-section').classList.remove('hidden');
        pageTitle.textContent = 'Publikasi Saya';
      } else if (href === '#edit-data') {
        document.getElementById('edit-data-section').classList.remove('hidden');
        pageTitle.textContent = 'Edit Data Diri';
      }
      
      // Close mobile menu
      if (sidebar) {
        sidebar.classList.add('-translate-x-full');
      }
    });
  });
}

// Modal Functions for Member Dashboard
function showAddPublication() {
  document.getElementById('add-publication-modal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeAddPublication() {
  document.getElementById('add-publication-modal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function showEditPublication(id, data) {
  // Populate form with existing data
  if (data) {
    document.getElementById('edit-pub-id').value = id;
    document.getElementById('edit-pub-title').value = data.title || '';
    document.getElementById('edit-pub-date').value = data.date || '';
    document.getElementById('edit-pub-authors').value = data.authors || '';
    document.getElementById('edit-pub-link').value = data.link || '';
    document.getElementById('edit-pub-supervisor').value = data.supervisor || '';
    document.getElementById('edit-pub-description').value = data.description || '';
  }
  
  document.getElementById('edit-publication-modal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeEditPublication() {
  document.getElementById('edit-publication-modal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function showEditProfile() {
  // Switch to edit data section
  const editDataLink = document.querySelector('a[href="#edit-data"]');
  if (editDataLink) {
    editDataLink.click();
  }
}

function cancelEditProfile() {
  // Switch back to dashboard section
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    dashboardLink.click();
  }
}

// Photo preview function
function previewPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profile-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Logout function
function logout() {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    // Placeholder for logout functionality
    console.log('Logout function called');
    showToast('Berhasil logout');
    // Redirect to login page or home page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }
}

// ===== MODAL FUNCTIONS =====
// Generic modal functions
function openAddModal(type) {
  console.log(`Open add ${type} modal`);
  // Placeholder for opening add modals
}

function openEditModal(type, id) {
  console.log(`Open edit ${type} modal for ID:`, id);
  // Placeholder for opening edit modals with data
}

function submitCreate(type) {
  console.log(`Submit create ${type}`);
  // Placeholder for create submissions
}

function submitUpdate(type, id) {
  console.log(`Submit update ${type} for ID:`, id);
  // Placeholder for update submissions
}

function submitDelete(type, id) {
  if (confirm(`Apakah Anda yakin ingin menghapus ${type} ini?`)) {
    console.log(`Submit delete ${type} for ID:`, id);
    showToast(`${type} berhasil dihapus`);
  }
}

// ===== STATUS BADGE FUNCTIONS =====
function getStatusBadge(status) {
  const badges = {
    'pending': '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>',
    'approved': '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>',
    'rejected': '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>'
  };
  
  return badges[status] || badges['pending'];
}

// ===== DATA LOADING FUNCTIONS =====
// These functions will be called by backend to populate data
function loadBeritaData(data) {
  const container = document.getElementById('berita-list');
  if (!container) return;
  
  if (data.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Belum ada berita tersedia</p>';
    return;
  }
  
  // Backend will populate this
  console.log('Loading berita data:', data);
}

function loadPublikasiData(data) {
  const container = document.getElementById('publikasi-list');
  if (!container) return;
  
  if (data.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Belum ada publikasi tersedia</p>';
    return;
  }
  
  // Backend will populate this
  console.log('Loading publikasi data:', data);
}

function loadAgendaData(data) {
  const container = document.getElementById('agenda-list');
  if (!container) return;
  
  if (data.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Belum ada agenda tersedia</p>';
    return;
  }
  
  // Backend will populate this
  console.log('Loading agenda data:', data);
}

function loadGaleriData(data) {
  const container = document.getElementById('galeri-grid');
  if (!container) return;
  
  if (data.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Belum ada foto tersedia</p>';
    return;
  }
  
  // Backend will populate this
  console.log('Loading galeri data:', data);
}

// ===== CONTACT FORM FUNCTIONS =====
function initContactForm() {
  const formTabs = document.querySelectorAll('.pill-switch-btn');
  const askForm = document.getElementById('form-ask');
  const coopForm = document.getElementById('form-coop');
  
  // Handle file input change for proposal
  const fileInput = document.getElementById('coop-proposal');
  const fileNameDisplay = document.getElementById('file-name');
  
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          showToast('Ukuran file melebihi 5MB. Silakan pilih file yang lebih kecil.');
          this.value = ''; // Reset file input
          fileNameDisplay.textContent = 'Klik untuk memilih file';
          return;
        }
        
        // Update file name display
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.classList.remove('text-gray-500');
        fileNameDisplay.classList.add('text-gray-900', 'font-medium');
      } else {
        fileNameDisplay.textContent = 'Klik untuk memilih file';
        fileNameDisplay.classList.remove('text-gray-900', 'font-medium');
        fileNameDisplay.classList.add('text-gray-500');
      }
    });
  }
  
  if (!formTabs.length || !askForm || !coopForm) return;
  
  function switchForm(activeTab) {
    // Update active tab
    formTabs.forEach(tab => tab.classList.remove('active'));
    activeTab.classList.add('active');
    
    // Show/hide forms
    if (activeTab.dataset.formType === 'ask') {
      askForm.classList.remove('hidden');
      coopForm.classList.add('hidden');
    } else {
      askForm.classList.add('hidden');
      coopForm.classList.remove('hidden');
    }
  }
  
  // Add click event listeners to tabs
  formTabs.forEach(tab => {
    tab.addEventListener('click', () => switchForm(tab));
  });
  
  // Handle form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const activeTab = document.querySelector('.pill-switch-btn.active');
      const formType = activeTab ? activeTab.dataset.formType : 'ask';
      
      // Show success message
      showToast('Pesan Anda berhasil dikirim!');
      
      // Reset form
      this.reset();
    });
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize contact form if on contact page
  if (document.querySelector('.pill-switch-btn')) {
    initContactForm();
  }
  
  // Initialize member dashboard if on member dashboard page
  if (document.getElementById('member-dashboard')) {
    initializeMemberDashboard();
  }
  
  // Load initial data from backend
  // Backend will call these functions with actual data
  if (document.getElementById('berita-list')) {
    loadBeritaData([]);
  }
  if (document.getElementById('publikasi-list')) {
    loadPublikasiData([]);
  }
  if (document.getElementById('agenda-list')) {
    loadAgendaData([]);
  }
  if (document.getElementById('galeri-grid')) {
    loadGaleriData([]);
  }
});
