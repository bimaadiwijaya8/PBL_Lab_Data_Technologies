document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contentArea = document.getElementById('content-area');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'text-center py-12';
    loadingIndicator.innerHTML = `
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A0D6]"></div>
        <p class="mt-4 text-gray-600">Memuat data...</p>
    `;

    // State
    let currentFilter = 'all';
    let data = { agenda: [], pengumuman: [], berita: [] };

    // Initialize
    init();

    // Event Listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            if (filter !== currentFilter) {
                currentFilter = filter;
                updateActiveFilter();
                renderContent();
            }
        });
    });

    // Functions
    async function init() {
        contentArea.innerHTML = '';
        contentArea.appendChild(loadingIndicator);
        
        try {
            const response = await fetch('../assets/php/get_modul.php');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const result = await response.json();
            if (result.status === 'success') {
                data = result.data;
                renderContent();
            } else {
                throw new Error(result.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error:', error);
            contentArea.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                Gagal memuat data. Silakan muat ulang halaman atau coba lagi nanti.
                                <br><span class="text-red-600 font-medium">${error.message}</span>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function updateActiveFilter() {
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === currentFilter) {
                btn.classList.add('bg-[#00A0D6]', 'text-white');
                btn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-50');
            } else {
                btn.classList.remove('bg-[#00A0D6]', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-50');
            }
        });
    }

    function renderContent() {
        let itemsToRender = [];
        
        // Filter items based on current filter
        if (currentFilter === 'all') {
            itemsToRender = [
                ...data.agenda.map(item => ({ ...item, type: 'agenda' })),
                ...data.pengumuman.map(item => ({ ...item, type: 'pengumuman' })),
                ...data.berita.map(item => ({ ...item, type: 'berita' }))
            ];
            // Sort by date (newest first)
            itemsToRender.sort((a, b) => {
                const dateA = a.tgl_agenda || a.tanggal || new Date().toISOString();
                const dateB = b.tgl_agenda || b.tanggal || new Date().toISOString();
                return new Date(dateB) - new Date(dateA);
            });
        } else if (currentFilter === 'agenda') {
            itemsToRender = data.agenda.map(item => ({ ...item, type: 'agenda' }));
        } else if (currentFilter === 'pengumuman') {
            itemsToRender = data.pengumuman.map(item => ({ ...item, type: 'pengumuman' }));
        } else if (currentFilter === 'berita') {
            itemsToRender = data.berita.map(item => ({ ...item, type: 'berita' }));
        }

        // Render items
        if (itemsToRender.length === 0) {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">Tidak ada data</h3>
                    <p class="mt-1 text-sm text-gray-500">Tidak ada ${getTypeName(currentFilter)} yang tersedia saat ini.</p>
                </div>
            `;
            return;
        }

        const itemsHTML = itemsToRender.map(item => createItemCard(item)).join('');
        contentArea.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${itemsHTML}
            </div>
        `;

        // Add event listeners to detail buttons
        document.querySelectorAll('.detail-btn').forEach(button => {
            button.addEventListener('click', () => openModal(button.dataset.itemId, button.dataset.itemType));
        });
    }

    function createItemCard(item) {
        const { type } = item;
        const title = item.judul || item.nama_agenda || 'Tanpa Judul';
        const date = formatDate(item.tgl_agenda || item.tanggal);
        const description = trimText(item.informasi || item.deskripsi || 'Tidak ada deskripsi', 100);
        const id = item.id_agenda || item.id_pengumuman || item.id_berita;
        
        let badgeColor = '';
        let icon = '';
        
        if (type === 'agenda') {
            badgeColor = 'bg-green-100 text-green-800';
            icon = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
        } else if (type === 'pengumuman') {
            badgeColor = 'bg-yellow-100 text-yellow-800';
            icon = 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 7.388 6 10v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
        } else {
            badgeColor = 'bg-blue-100 text-blue-800';
            icon = 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z';
        }

        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                ${item.gambar && type === 'berita' ? `
                    <div class="h-48 bg-gray-100 overflow-hidden">
                        <img src="${item.gambar}" alt="${title}" class="w-full h-full object-cover">
                    </div>
                ` : ''}
                <div class="p-6">
                    <div class="flex items-center justify-between mb-3">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColor}">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}" />
                            </svg>
                            ${getTypeName(type)}
                        </span>
                        ${date ? `<span class="text-xs text-gray-500">${date}</span>` : ''}
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title="${title}">${title}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${description}</p>
                    <button 
                        class="detail-btn inline-flex items-center text-sm font-medium text-[#00A0D6] hover:text-blue-700 transition-colors"
                        data-item-id="${id}"
                        data-item-type="${type}"
                    >
                        Baca selengkapnya
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    function openModal(id, type) {
        const item = data[type].find(item => 
            item[`id_${type}`] === parseInt(id) || item.id === parseInt(id)
        );
        
        if (!item) return;
        
        const modal = createModal(item, type);
        document.body.insertAdjacentHTML('beforeend', modal);
        
        const modalElement = document.getElementById('detail-modal');
        modalElement.classList.remove('opacity-0', 'invisible');
        modalElement.classList.add('opacity-100', 'visible');
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', closeModal);
        document.addEventListener('keydown', handleEscape);
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) closeModal();
        });
    }
    
    function closeModal() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            modal.classList.remove('opacity-100', 'visible');
            modal.classList.add('opacity-0', 'invisible');
            setTimeout(() => modal.remove(), 300);
            document.removeEventListener('keydown', handleEscape);
        }
    }
    
    function handleEscape(e) {
        if (e.key === 'Escape') closeModal();
    }
    
    function createModal(item, type) {
        const title = item.judul || item.nama_agenda || 'Tanpa Judul';
        const date = formatDate(item.tgl_agenda || item.tanggal, true);
        const content = item.informasi || item.deskripsi || 'Tidak ada konten yang tersedia.';
        const id = item.id_agenda || item.id_pengumuman || item.id_berita;
        
        let details = [];
        
        if (type === 'agenda') {
            details = [
                { label: 'Nama Agenda', value: item.nama_agenda },
                { label: 'Tanggal', value: date },
                { label: 'Link', value: item.link_agenda ? `<a href="${item.link_agenda}" target="_blank" class="text-[#00A0D6] hover:underline">${item.link_agenda}</a>` : 'Tidak ada' },
                { label: 'ID Anggota', value: item.id_anggota || 'Tidak ada' }
            ];
        } else if (type === 'pengumuman') {
            details = [
                { label: 'Judul', value: item.judul },
                { label: 'ID Anggota', value: item.id_anggota || 'Tidak ada' },
                { label: 'Informasi', value: item.informasi || 'Tidak ada' }
            ];
        } else if (type === 'berita') {
            details = [
                { label: 'Judul', value: item.judul },
                { label: 'Tanggal', value: date },
                { label: 'Author', value: item.author || 'Tidak diketahui' },
                { label: 'Gambar', value: item.gambar ? `<img src="${item.gambar}" alt="${item.judul}" class="mt-2 rounded-lg max-w-full h-auto">` : 'Tidak ada' },
                { label: 'Konten', value: item.informasi || 'Tidak ada' }
            ];
        }
        
        return `
            <div id="detail-modal" class="fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 opacity-0 invisible">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div class="absolute inset-0 bg-black opacity-75"></div>
                    </div>
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <div class="flex justify-between items-start">
                                        <h3 class="text-xl leading-6 font-semibold text-gray-900 mb-4">
                                            Detail ${getTypeName(type, true)}
                                        </h3>
                                        <button id="close-modal" type="button" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="mt-2 space-y-4">
                                        ${details.map(detail => `
                                            <div>
                                                <h4 class="text-sm font-medium text-gray-500">${detail.label}</h4>
                                                <div class="mt-1 text-sm text-gray-900">
                                                    ${detail.value || '-'}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" id="close-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00A0D6] text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility functions
    function formatDate(dateString, full = false) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid date
        
        if (full) {
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }
    
    function trimText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    function getTypeName(type, capitalize = false) {
        const names = {
            'all': 'Semua',
            'agenda': 'Agenda',
            'pengumuman': 'Pengumuman',
            'berita': 'Berita'
        };
        
        const name = names[type] || type;
        return capitalize ? name : name.toLowerCase();
    }
});
