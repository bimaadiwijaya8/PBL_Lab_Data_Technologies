// Editor Dashboard - Dynamic Content Loading
// This file handles all dynamic content loading for the editor dashboard

document.addEventListener('DOMContentLoaded', function() {
    initializeEditorDashboard();
    loadDashboardStats();
    loadBeritaTable();
    loadRecentActivities();
    
    // Additional initialization for berita functionality
    if (typeof loadBeritaData === 'function') {
        loadBeritaData();
    }
});

// Initialize editor dashboard navigation and UI
function initializeEditorDashboard() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    
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
            const linkText = link.querySelector('span').textContent;
            
            if (href === '#dashboard') {
                document.getElementById('dashboard-section').classList.remove('hidden');
                pageTitle.textContent = 'Dashboard';
                breadcrumbCurrent.textContent = 'Dashboard';
                loadDashboardStats();
                loadRecentActivities();
            } else if (href === '#berita') {
                document.getElementById('berita-section').classList.remove('hidden');
                pageTitle.textContent = 'Kelola Berita';
                breadcrumbCurrent.textContent = 'Kelola Berita';
                loadBeritaTable();
            } else if (href === '#agenda') {
                document.getElementById('agenda-section').classList.remove('hidden');
                pageTitle.textContent = 'Kelola Agenda';
                breadcrumbCurrent.textContent = 'Kelola Agenda';
                loadAgendaTable();
            } else if (href === '#galeri') {
                document.getElementById('galeri-section').classList.remove('hidden');
                pageTitle.textContent = 'Kelola Galeri';
                breadcrumbCurrent.textContent = 'Kelola Galeri';
                loadGaleriGrid();
            } else if (href === '#fasilitas') {
                document.getElementById('fasilitas-section').classList.remove('hidden');
                pageTitle.textContent = 'Kelola Fasilitas';
                breadcrumbCurrent.textContent = 'Kelola Fasilitas';
                loadFasilitasTable();
            } else if (href === '#publikasi') {
                document.getElementById('publikasi-section').classList.remove('hidden');
                pageTitle.textContent = 'Kelola Publikasi';
                breadcrumbCurrent.textContent = 'Kelola Publikasi';
                loadPublikasiTable();
            } else if (href === '#status-pengajuan') {
                document.getElementById('status-pengajuan-section').classList.remove('hidden');
                pageTitle.textContent = 'Status Pengajuan';
                breadcrumbCurrent.textContent = 'Status Pengajuan';
                loadPendingChanges();
            } else if (href === '#edit-halaman') {
                document.getElementById('edit-halaman-section').classList.remove('hidden');
                pageTitle.textContent = 'Edit Halaman';
                breadcrumbCurrent.textContent = 'Edit Halaman';
            }
            
            // Close mobile menu
            if (sidebar) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Load berita stats
        const beritaResponse = await fetch('../api/get_berita.php?admin=true');
        const beritaResult = await beritaResponse.json();
        
        if (beritaResult.success) {
            const beritaData = beritaResult.data;
            const pendingCount = beritaData.filter(b => b.status === 'pending' || b.aksi === 'pending').length;
            const totalCount = beritaData.length;
            
            // Update stats cards
            updateStatCard('total-berita', totalCount);
            updateStatCard('pending-content', pendingCount);
        }
        
        // Load dashboard stats from API
        const statsResponse = await fetch('../api/dashboard_stats.php');
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            updateStatCard('total-agenda', statsResult.stats.total_agenda || 0);
            updateStatCard('approved-content', statsResult.stats.approved_content || 0);
        } else {
            // Fallback values
            updateStatCard('total-agenda', 0);
            updateStatCard('approved-content', 0);
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback values
        updateStatCard('total-agenda', 0);
        updateStatCard('approved-content', 0);
    }
}

// Update individual stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Load recent activities
async function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    try {
        const response = await fetch('../api/get_berita.php?admin=true');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            const activities = result.data.slice(0, 5).map(berita => {
                const date = new Date(berita.tanggal || berita.created_at);
                const formattedDate = date.toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const statusBadge = getStatusBadge(berita.status || berita.aksi);
                
                return `
                    <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-900">
                                <span class="font-medium">"${berita.judul}"</span> - ${statusBadge}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">${formattedDate}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = activities;
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada aktivitas terbaru</p>';
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-8">Gagal memuat aktivitas terbaru</p>';
    }
}

// Load berita data for editor view
function loadBeritaData() {
    fetch('../api/get_berita.php?admin=true')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayBeritaTable(data.data);
            } else {
                console.error('Error loading berita:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Display berita in table format
function displayBeritaTable(beritaList) {
    const tableBody = document.getElementById('berita-table');
    
    if (beritaList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    Belum ada berita. Klik "Tambah Berita" untuk membuat berita baru.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = beritaList.map(berita => `
        <tr>
            <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900 break-words">${berita.judul}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${berita.author || 'Admin'}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${formatDate(berita.tanggal || berita.created_at)}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                ${getStatusBadge(berita.aksi || berita.status)}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                ${getActionButtons(berita)}
            </td>
        </tr>
    `).join('');
}

// Get action buttons for berita
function getActionButtons(berita) {
    if (berita.aksi === 'pending' || berita.status === 'pending') {
        return `
            <button onclick="viewBerita(${berita.id_berita})" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Lihat">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="editBerita(${berita.id_berita})" class="text-blue-600 hover:text-blue-900 mr-3" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="approveBerita(${berita.id_berita}, 'approved')" class="text-green-600 hover:text-green-900 mr-3" title="Setujui">
                <i class="fas fa-check"></i>
            </button>
            <button onclick="approveBerita(${berita.id_berita}, 'rejected')" class="text-red-600 hover:text-red-900 mr-3" title="Tolak">
                <i class="fas fa-times"></i>
            </button>
            <button onclick="deleteBerita(${berita.id_berita})" class="text-red-600 hover:text-red-900" title="Hapus">
                <i class="fas fa-trash"></i>
            </button>
        `;
    } else {
        return `
            <button onclick="viewBerita(${berita.id_berita})" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Lihat">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="editBerita(${berita.id_berita})" class="text-blue-600 hover:text-blue-900 mr-3" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteBerita(${berita.id_berita})" class="text-red-600 hover:text-red-900" title="Hapus">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    });
}

// Load berita table for editor
async function loadBeritaTable() {
    const tableBody = document.getElementById('berita-table');
    if (!tableBody) return;
    
    try {
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...</td></tr>';
        
        const response = await fetch('../api/get_berita.php?admin=true');
        const result = await response.json();
        
        if (result.success) {
            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada berita. Klik "Tambah Berita" untuk membuat berita baru.</td></tr>';
                return;
            }
            
            const rows = result.data.map(berita => {
                const formattedDate = formatDate(berita.tanggal || berita.created_at);
                const statusBadge = getStatusBadge(berita.status || berita.aksi);
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900">${berita.judul}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-500">${berita.author || 'Admin'}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-500">${formattedDate}</div>
                        </td>
                        <td class="px-6 py-4">
                            ${statusBadge}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                ${getActionButtons(berita)}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            tableBody.innerHTML = rows;
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Gagal memuat data berita</td></tr>';
        }
    } catch (error) {
        console.error('Error loading berita table:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Terjadi kesalahan saat memuat data</td></tr>';
    }
}

// Load placeholder functions
async function loadAgendaTable() {
    const tableBody = document.getElementById('agenda-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada agenda tersedia</td></tr>';
}

async function loadGaleriGrid() {
    const grid = document.getElementById('galeri-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Belum ada foto galeri tersedia</div>';
}

async function loadFasilitasTable() {
    const tableBody = document.getElementById('fasilitas-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada fasilitas tersedia</td></tr>';
}

async function loadPublikasiTable() {
    const tableBody = document.getElementById('publikasi-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">Belum ada publikasi tersedia</td></tr>';
}

async function loadPendingChanges() {
    const tableBody = document.getElementById('pengajuan-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada pengajuan konten</td></tr>';
}

// Berita action functions
async function approveBerita(id, action = 'approved') {
    const actionText = action === 'approved' ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} berita ini?`)) return;
    
    try {
        const response = await fetch('../api/approve_berita.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_berita: id, aksi: action })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message || `Berita berhasil ${actionText}`);
            loadBeritaTable(); // Refresh table
            loadDashboardStats(); // Refresh stats
        } else {
            showToast(result.message || `Gagal ${actionText} berita`);
        }
    } catch (error) {
        console.error('Error approving berita:', error);
        showToast(`Terjadi kesalahan saat ${actionText} berita`);
    }
}

async function rejectBerita(id) {
    return approveBerita(id, 'rejected');
}

function editBerita(id) {
    // Placeholder for edit functionality
    console.log('Edit berita:', id);
    showToast('Fitur edit akan segera tersedia');
}

function deleteBerita(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;
    
    try {
        fetch('../api/delete_berita.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_berita: id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showToast(result.message || 'Berita berhasil dihapus');
                loadBeritaTable(); // Refresh table
                loadDashboardStats(); // Refresh stats
            } else {
                showToast(result.message || 'Gagal menghapus berita');
            }
        })
        .catch(error => {
            console.error('Error deleting berita:', error);
            showToast('Terjadi kesalahan saat menghapus berita');
        });
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan saat menghapus berita');
    }
}

function viewBerita(id) {
    // Implement view modal or redirect to detail page
    console.log('View berita:', id);
    showToast('Fitur lihat berita akan segera tersedia');
}

// Modal functions
function openAddNewsModal() {
    document.getElementById('add-news-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeAddNewsModal() {
    document.getElementById('add-news-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('add-news-form').reset();
}

function createNews(event) {
    event.preventDefault();
    
    const form = document.getElementById('add-news-form');
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
    
    // Submit to API
    fetch('../api/submit_berita.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showToast(data.message || 'Berita berhasil ditambahkan');
            
            // Close modal and reset form
            closeAddNewsModal();
            
            // Refresh news table
            loadBeritaTable();
            
            // Update dashboard stats
            loadDashboardStats();
        } else {
            showToast(data.message || 'Gagal menambahkan berita');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Terjadi kesalahan saat menyimpan berita');
    })
    .finally(() => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
    
    return false;
}

// Helper function to get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>',
        'approved': '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>',
        'rejected': '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>'
    };
    
    return badges[status] || badges['pending'];
}

// Toast notification function
function showToast(message = 'Aksi berhasil', duration = 2000) {
    // Check if toast already exists
    let toastEl = document.getElementById('editor-toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'editor-toast';
        toastEl.className = 'fixed z-[60] top-4 right-4 px-4 py-2 rounded-full bg-gray-900 text-white text-sm shadow-lg transform translate-x-full transition-transform duration-300';
        document.body.appendChild(toastEl);
    }
    
    toastEl.textContent = message;
    toastEl.classList.remove('translate-x-full');
    
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { 
        toastEl.classList.add('translate-x-full');
    }, duration);
}

// Logout function
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        showToast('Berhasil logout');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}
