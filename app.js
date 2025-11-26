// Lab Data Technologies – Frontend-only demo interactions (vanilla JS)
// Visual behaviors only: no backend, no real auth.

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Toast utility (simple)
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
  window.showToast = showToast; // Make available globally

  // Page fade transition
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('is-loaded');
    // Internal link transition
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

  // Mobile nav toggles (fallback if present)
  qsa('[data-nav-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = qs(btn.dataset.navToggle);
      if (target) target.classList.toggle('hidden');
    });
  });

  // Simple Modal system
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

  // Lightbox for gallery
  let lightbox = null;
  function ensureLightbox() {
    if (lightbox) return lightbox;
    const div = document.createElement('div');
    div.id = 'lightbox';
    div.className = 'modal-backdrop hidden fixed inset-0 z-50 bg-black/70 flex items-center justify-center';
    div.innerHTML = `
      <div class="relative max-w-5xl w-full px-4">
        <button data-modal-close="#lightbox" class="absolute -top-10 right-2 text-white/90 text-sm">Tutup ✕</button>
        <div class="bg-white rounded-xl overflow-hidden">
          <div class="relative">
            <img id="lightbox-img" class="w-full max-h-[80vh] object-contain" alt="preview" />
            <div id="lightbox-cap" class="absolute bottom-0 left-0 right-0 bg-white/80 text-gray-700 text-sm px-3 py-2"></div>
            <button id="lb-prev" class="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-700">‹</button>
            <button id="lb-next" class="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-700">›</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div);
    lightbox = div;
    return lightbox;
  }
  function initLightbox() {
    const imgs = qsa('[data-lightbox]');
    if (!imgs.length) return;
    ensureLightbox();
    let current = 0;
    const group = imgs;
    function show(i) {
      current = (i + group.length) % group.length;
      const img = group[current];
      qs('#lightbox-img').src = img.src;
      qs('#lightbox-cap').textContent = img.dataset.caption || img.alt || '';
      openModal('#lightbox');
    }
    group.forEach((img, idx) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => show(idx));
    });
    qs('#lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
    qs('#lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
  }
  document.addEventListener('DOMContentLoaded', initLightbox);

  // Contact form dynamics
  function initContactForm() {
    const ask = qs('#form-ask');
    const coop = qs('#form-coop');
    const form = qs('#contact-form');
    const pillBtns = document.querySelectorAll('.pill-switch-btn');
    if (!form || !ask || !coop || pillBtns.length === 0) return;

    let activeMode = 'ask';

    // ensure initial ARIA + active class
    pillBtns.forEach(btn => {
      if (btn.dataset.formType === activeMode) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected','true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected','false');
      }
    });

    function apply() {
      // show/hide form sections based on activeMode
      ask.classList.toggle('hidden', activeMode !== 'ask');
      coop.classList.toggle('hidden', activeMode !== 'coop');
      // update aria-selected for accessibility
      pillBtns.forEach(b => b.setAttribute('aria-selected', b.dataset.formType === activeMode ? 'true' : 'false'));
    }

    // attach click handlers to pills
    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMode = btn.dataset.formType;
        apply();
      });
    });

    apply();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // very simple UI validation
      const v = activeMode;
      let ok = true;
      function mark(el) { if (!el || !el.value || !el.value.trim()) { el?.classList.add('ring-2','ring-red-300'); ok = false; } else { el.classList.remove('ring-2','ring-red-300'); } }
      if (v === 'ask') {
        mark(qs('#ask-name')); mark(qs('#ask-email')); mark(qs('#ask-message'));
      } else {
        mark(qs('#coop-name')); mark(qs('#coop-email')); mark(qs('#coop-phone')); mark(qs('#coop-purpose')); mark(qs('#coop-company')); mark(qs('#coop-contact')); mark(qs('#coop-proposal'));
      }
      if (!ok) return;
      showToast('Form terkirim (simulasi)');
      form.reset();
      apply();
    });
  }
  document.addEventListener('DOMContentLoaded', initContactForm);

  // Demo data with localStorage
  const store = {
    get: (key, def = []) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
      } catch { return def; }
    },
    set: (key, val) => {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  // User credentials for login (in real app, this would be in database)
  if (!store.get('users')) {
    store.set('users', [
      { id: 'u1', email: 'admin@polinema.ac.id', username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { id: 'u2', email: 'editor@polinema.ac.id', username: 'editor', password: 'editor123', role: 'editor', name: 'Editor Lab' },
      { id: 'u3', email: 'fauzan@polinema.ac.id', username: 'fauzan', password: 'fauzan123', role: 'editor', name: 'Fauzan Editor' }
    ]);
  }

  // Pending approvals data
  if (!store.get('pendingApprovals')) {
    store.set('pendingApprovals', [
      { id: 'pa1', type: 'news', title: 'Kegiatan Workshop AI', editor: 'Fauzan', status: 'pending', data: { title: 'Workshop AI Update', content: 'Updated content...', category: 'Berita' } },
      { id: 'pa2', type: 'agenda', title: 'Seminar Data Science', editor: 'Editor Lab', status: 'pending', data: { name: 'Seminar Data Science Terapan', date: '2025-12-15', location: 'Auditorium' } }
    ]);
  }

  // Seed dummy data if not exists
  function seed() {
    if (!store.get('news')) {
      store.set('members', [
        { id: 'm1', status: 'approved', email: 'ketua.lab@polinema.ac.id', name: 'Dr. Ahmad Saikhu, S.Kom., M.T.', photo: 'https://ui-avatars.com/api/?name=Dr.+Ahmad+Saikhu&background=0ea5e9&color=fff&size=200', nim: '', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: '', tahun: 2010, tel: '081234567890', role: 'Ketua Lab', field: 'Data Mining & Machine Learning' },
        { id: 'm2', status: 'approved', email: 'dosen.b@polinema.ac.id', name: 'Ir. Sari Widya, M.Kom.', photo: 'https://ui-avatars.com/api/?name=Ir.+Sari+Widya&background=0ea5e9&color=fff&size=200', nim: '', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: '', tahun: 2012, tel: '081234567891', role: 'Dosen', field: 'Big Data Analytics' },
        { id: 'm3', status: 'approved', email: 'laboran@polinema.ac.id', name: 'Budi Santoso, S.Kom.', photo: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=0ea5e9&color=fff&size=200', nim: '', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: '', tahun: 2018, tel: '081234567892', role: 'Laboran', field: 'Operasional Lab' },
        { id: 'm4', status: 'approved', email: 'asisten1@student.polinema.ac.id', name: 'Andi Pratama', photo: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=f59e0b&color=fff&size=200', nim: '2241720001', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: 'TI-3A', tahun: 2022, tel: '081234567893', role: 'Asisten', field: 'Machine Learning' },
        { id: 'm5', status: 'approved', email: 'asisten2@student.polinema.ac.id', name: 'Siti Nurhaliza', photo: 'https://ui-avatars.com/api/?name=Siti+Nurhaliza&background=f59e0b&color=fff&size=200', nim: '2241720002', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: 'TI-3B', tahun: 2022, tel: '081234567894', role: 'Asisten', field: 'Data Visualization' },
        { id: 'm6', status: 'approved', email: 'mahasiswa1@student.polinema.ac.id', name: 'Rizki Maulana', photo: 'https://ui-avatars.com/api/?name=Rizki+Maulana&background=f59e0b&color=fff&size=200', nim: '2341720001', jurusan: 'Teknik Informatika', prodi: 'TI', kelas: 'TI-2A', tahun: 2023, tel: '081234567895', role: 'Mahasiswa', field: 'Deep Learning Research' },
        { id: 'm7', status: 'pending', email: 'bima@student.polinema.ac.id', name: 'Bima Adi Wijaya', photo: 'https://ui-avatars.com/api/?name=Bima+Adi+Wijaya&background=f59e0b&color=fff&size=200', nim: '244107020022', jurusan: 'Teknik Informatika', prodi: 'D4 Teknik Informatika', kelas: 'TI-1A', tahun: 2024, tel: '081234567896', role: 'Mahasiswa', field: 'Web Development' },
        { id: 'm8', status: 'pending', email: 'sari@student.polinema.ac.id', name: 'Sari Dewi Lestari', photo: 'https://ui-avatars.com/api/?name=Sari+Dewi+Lestari&background=f59e0b&color=fff&size=200', nim: '244107020023', jurusan: 'Teknik Informatika', prodi: 'D4 Teknik Informatika', kelas: 'TI-1B', tahun: 2024, tel: '081234567897', role: 'Mahasiswa', field: 'Data Science' }
      ]);
    }
    if (!store.get('news')) {
      store.set('news', [
        { 
          id: 'n1', 
          title: 'Seminar Data Science Terapan 2025', 
          category: 'Agenda', 
          date: '2025-12-15', 
          author: 'Admin Lab', 
          image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=1200&auto=format&fit=crop', 
          info: 'Seminar nasional tentang implementasi data science dalam industri modern.',
          content: 'Laboratorium Data Technologies dengan bangga mengundang seluruh civitas akademika untuk menghadiri Seminar Data Science Terapan 2025. Acara ini akan menghadirkan pembicara dari berbagai industri teknologi terkemuka yang akan berbagi pengalaman dalam implementasi machine learning dan artificial intelligence di dunia nyata.\n\nAgenda acara meliputi:\n- Keynote speech tentang tren AI terkini\n- Workshop hands-on machine learning\n- Panel diskusi dengan praktisi industri\n- Networking session\n\nPendaftaran gratis untuk mahasiswa dan dosen. Sertifikat akan diberikan kepada seluruh peserta.'
        },
        { 
          id: 'n2', 
          title: 'Kolaborasi Strategis dengan PT. Tech Indonesia', 
          category: 'Berita', 
          date: '2025-11-28', 
          author: 'Humas Lab', 
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop', 
          info: 'Penandatanganan MoU kerjasama riset dan pengembangan teknologi data.',
          content: 'Laboratorium Data Technologies telah menjalin kemitraan strategis dengan PT. Tech Indonesia dalam bidang riset dan pengembangan teknologi data. Kerjasama ini mencakup program magang mahasiswa, penelitian bersama, dan transfer teknologi.\n\nRuang lingkup kerjasama:\n- Program magang untuk mahasiswa tingkat akhir\n- Penelitian kolaboratif di bidang big data analytics\n- Pengembangan solusi AI untuk industri\n- Pelatihan profesional untuk dosen dan mahasiswa\n\nKerjasama ini diharapkan dapat meningkatkan kualitas pendidikan dan penelitian di laboratorium.'
        },
        { 
          id: 'n3', 
          title: 'Pengumuman Penerimaan Asisten Laboratorium', 
          category: 'Pengumuman', 
          date: '2025-11-10', 
          author: 'Koordinator Lab', 
          image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1200&auto=format&fit=crop', 
          info: 'Dibuka pendaftaran asisten laboratorium untuk semester genap 2025/2026.',
          content: 'Laboratorium Data Technologies membuka kesempatan bagi mahasiswa untuk bergabung sebagai asisten laboratorium pada semester genap 2025/2026.\n\nPersyaratan:\n- Mahasiswa aktif minimal semester 5\n- IPK minimal 3.25\n- Menguasai bahasa pemrograman Python/R\n- Memiliki pengalaman dengan tools data science\n- Komunikatif dan bertanggung jawab\n\nTugas asisten:\n- Membantu praktikum mata kuliah terkait\n- Maintenance perangkat laboratorium\n- Mendampingi mahasiswa dalam project\n\nPendaftaran dibuka hingga 30 November 2025. Kirim CV dan portfolio ke email lab.'
        },
        { 
          id: 'n4', 
          title: 'Workshop Machine Learning untuk Pemula', 
          category: 'Agenda', 
          date: '2025-12-20', 
          author: 'Tim Pengajar', 
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop', 
          info: 'Workshop intensif machine learning dengan Python untuk mahasiswa pemula.',
          content: 'Bergabunglah dalam workshop Machine Learning untuk Pemula yang akan diadakan selama 3 hari penuh. Workshop ini dirancang khusus untuk mahasiswa yang ingin memulai perjalanan di bidang machine learning.\n\nMateri yang akan dipelajari:\n- Dasar-dasar machine learning\n- Python untuk data science\n- Supervised dan unsupervised learning\n- Evaluasi model\n- Studi kasus nyata\n\nFasilitas:\n- Modul pembelajaran lengkap\n- Dataset untuk praktik\n- Sertifikat kehadiran\n- Akses ke lab selama workshop\n\nDaftar sekarang, kuota terbatas hanya 30 peserta!'
        },
        { 
          id: 'n5', 
          title: 'Prestasi Mahasiswa Lab di Kompetisi Data Science', 
          category: 'Berita', 
          date: '2025-11-05', 
          author: 'Admin Lab', 
          image: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=1200&auto=format&fit=crop', 
          info: 'Tim mahasiswa meraih juara 2 dalam kompetisi data science tingkat nasional.',
          content: 'Selamat kepada tim mahasiswa Laboratorium Data Technologies yang berhasil meraih juara 2 dalam National Data Science Competition 2025. Tim yang terdiri dari 3 mahasiswa ini berhasil mengalahkan 150+ tim dari seluruh Indonesia.\n\nAnggota tim pemenang:\n- Ahmad Rizki (Ketua Tim) - TI 2022\n- Sarah Putri (Anggota) - TI 2022  \n- Budi Santoso (Anggota) - TI 2021\n\nSolusi yang dikembangkan:\nTim mengembangkan model prediksi untuk optimasi supply chain menggunakan ensemble learning. Model ini mampu meningkatkan akurasi prediksi hingga 94% dibandingkan metode konvensional.\n\nPrestasi ini membuktikan kualitas pendidikan dan bimbingan yang diberikan oleh laboratorium kepada mahasiswa.'
        },
        { 
          id: 'n6', 
          title: 'Pemeliharaan Sistem Lab - Jadwal Downtime', 
          category: 'Pengumuman', 
          date: '2025-11-01', 
          author: 'IT Support', 
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', 
          info: 'Pemberitahuan jadwal maintenance sistem dan server laboratorium.',
          content: 'Dalam rangka pemeliharaan dan upgrade sistem, Laboratorium Data Technologies akan melakukan maintenance pada infrastruktur IT.\n\nJadwal maintenance:\n- Tanggal: 15-16 November 2025\n- Waktu: 22:00 - 06:00 WIB\n- Durasi: 8 jam per hari\n\nSistem yang terpengaruh:\n- Server komputasi lab\n- Database sistem\n- Akses remote ke lab\n- Website dan portal mahasiswa\n\nSelama periode ini, akses ke sistem akan terbatas. Mohon mahasiswa dan dosen untuk menyesuaikan jadwal praktikum dan penelitian.\n\nUntuk informasi lebih lanjut, hubungi tim IT support lab.'
        }
      ]);
    }
    if (!store.get('pubs')) {
      store.set('pubs', [
        { id: 'p1', title: 'Journal of Data Tech', type: 'Jurnal', year: 2025, authors: 'Penulis A; Penulis B', uploadDate: '2025-06-12', link: 'https://example.com/doi/xxxx' },
        { id: 'p2', title: 'Conf on Smart Systems', type: 'Proceeding', year: 2025, authors: 'Penulis C; Penulis D', uploadDate: '2025-05-03', link: 'https://example.com/proc' },
        { id: 'p3', title: 'Insights on ETL', type: 'Artikel', year: 2024, authors: 'Penulis E', uploadDate: '2024-11-22', link: 'https://example.com/art' }
      ]);
    }
    if (!store.get('users')) {
      store.set('users', [
        { id: 'u1', name: 'Editor Satu', email: 'editor@lab.ac.id', role: 'Editor' },
        { id: 'u2', name: 'Operator Dua', email: 'operator@lab.ac.id', role: 'Operator' }
      ]);
    }
    if (!store.get('facilities')) {
      store.set('facilities', [
        { id: 'f1', name: 'PC Workstation High-End', desc: 'Komputer workstation dengan spesifikasi tinggi untuk komputasi data science dan machine learning. Dilengkapi GPU NVIDIA RTX untuk deep learning.', photo: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1200&auto=format&fit=crop' },
        { id: 'f2', name: 'Server & Storage Cluster', desc: 'Cluster server dan sistem penyimpanan NAS untuk big data processing dan distributed computing dengan kapasitas 50TB.', photo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop' },
        { id: 'f3', name: 'Ruang Praktikum Smart', desc: 'Ruang praktikum modern dengan 40 unit komputer, proyektor interaktif, dan sistem audio visual terintegrasi untuk pembelajaran kolaboratif.', photo: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop' },
        { id: 'f4', name: 'Lab Jaringan & IoT', desc: 'Laboratorium khusus untuk praktikum jaringan komputer dan Internet of Things dengan perangkat Cisco, Arduino, dan Raspberry Pi.', photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
        { id: 'f5', name: 'Software Development Tools', desc: 'Lisensi lengkap software development seperti Visual Studio, IntelliJ IDEA, Adobe Creative Suite, dan tools data science seperti MATLAB, R Studio.', photo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
        { id: 'f6', name: 'Ruang Meeting & Presentasi', desc: 'Ruang meeting dengan kapasitas 20 orang, dilengkapi smart board, sistem video conference, dan fasilitas presentasi modern.', photo: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=1200&auto=format&fit=crop' }
      ]);
    }
    if (!store.get('agenda')) {
      store.set('agenda', [
        { 
          id: 'a1', 
          name: 'Workshop MLOps', 
          date: '2025-11-20', 
          time: '09:00 - 16:00 WIB',
          location: 'Lab Data Technologies',
          link: 'https://forms.google.com/workshop-mlops', 
          desc: 'Workshop intensif tentang Machine Learning Operations (MLOps) untuk implementasi model ML di production. Peserta akan belajar CI/CD pipeline, monitoring model, dan deployment strategies.',
          speaker: 'Dr. Ahmad Saikhu & Tim Industry Partner',
          status: 'upcoming'
        },
        { 
          id: 'a2', 
          name: 'Guest Lecture: AI Ethics', 
          date: '2025-12-02', 
          time: '13:00 - 15:00 WIB',
          location: 'Auditorium Polinema',
          link: 'https://zoom.us/j/guest-lecture-ai', 
          desc: 'Kuliah tamu tentang etika dalam pengembangan dan implementasi artificial intelligence. Diskusi mendalam tentang bias, fairness, dan responsible AI development.',
          speaker: 'Prof. Dr. Sarah Johnson (MIT)',
          status: 'upcoming'
        },
        { 
          id: 'a3', 
          name: 'Rapat Kurikulum', 
          date: '2025-12-14', 
          time: '10:00 - 12:00 WIB',
          location: 'Ruang Meeting Lab',
          link: '', 
          desc: 'Rapat evaluasi dan pengembangan kurikulum program studi Teknik Informatika khususnya mata kuliah terkait data science dan machine learning.',
          speaker: 'Tim Dosen Lab Data Technologies',
          status: 'upcoming'
        },
        { 
          id: 'a4', 
          name: 'Seminar Data Science Terapan', 
          date: '2025-10-12', 
          time: '08:00 - 17:00 WIB',
          location: 'Aula Utama Polinema',
          link: 'https://seminar-datascience.polinema.ac.id', 
          desc: 'Seminar nasional tentang penerapan data science dalam berbagai industri. Menghadirkan praktisi dari startup unicorn dan perusahaan multinasional.',
          speaker: 'Multiple Industry Speakers',
          status: 'completed'
        },
        { 
          id: 'a5', 
          name: 'Hackathon AI for Good', 
          date: '2025-09-25', 
          time: '08:00 - 20:00 WIB',
          location: 'Lab Data Technologies',
          link: 'https://hackathon-ai4good.com', 
          desc: 'Kompetisi pengembangan solusi AI untuk menyelesaikan masalah sosial dan lingkungan. Tim mahasiswa berlomba membuat prototype dalam 12 jam.',
          speaker: 'Tim Juri dari Industri',
          status: 'completed'
        }
      ]);
    }
    if (!store.get('gallery')) {
      store.set('gallery', [
        { id: 'g1', name: 'Praktikum Data Mining', photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop', desc: 'Sesi praktikum analisis data', type: 'Galeri Foto', agenda: '' },
        { id: 'g2', name: 'Ruang Kerja Kolaboratif', photo: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=1200&auto=format&fit=crop', desc: 'Suasana ruang kerja tim', type: 'Galeri Foto', agenda: '' },
        { id: 'g3', name: 'Kegiatan Presentasi', photo: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1200&auto=format&fit=crop', desc: 'Presentasi hasil riset mahasiswa', type: 'Dokumentasi Kegiatan', agenda: 'Seminar Data Science Terapan' }
      ]);
    }
  }
  seed();

  // Public Anggota render - grouped by role
  function renderAnggota() {
    const dosenContainer = qs('#dosen-staff-list');
    const mahasiswaContainer = qs('#mahasiswa-list');
    if (!dosenContainer || !mahasiswaContainer) return;

    const allMembers = store.get('members', []).filter(m => (m.status || 'approved') === 'approved');

    const dosenStaff = allMembers.filter(m => {
      const role = (m.role || '').toLowerCase();
      return role === 'dosen' || role === 'laboran' || role === 'staff';
    });

    const mahasiswa = allMembers.filter(m => {
      const role = (m.role || '').toLowerCase();
      return role === 'mahasiswa' || role === 'asisten';
    });

    const dosenHtml = dosenStaff.map(m => `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition text-center p-6">
        <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name) + '&background=0ea5e9&color=fff&size=200'}" alt="${m.name}" class="w-24 h-24 rounded-full mx-auto object-cover border-4 border-sky-100 mb-4">
        <h3 class="font-semibold text-lg text-gray-900">${m.name}</h3>
        <p class="text-sm text-sky-600 font-medium mt-1">${m.field || m.role || 'Staff'}</p>
      </div>
    `).join('');

    const mahasiswaHtml = mahasiswa.map(m => `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition p-6">
        <div class="flex items-start gap-4">
          <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name) + '&background=f59e0b&color=fff&size=200'}" alt="${m.name}" class="w-20 h-20 rounded-full object-cover border-4 border-amber-100 flex-shrink-0">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900">${m.name}</h3>
            <p class="text-xs text-amber-600 font-medium mt-1">${m.role || 'Mahasiswa'}</p>
            <div class="mt-3 space-y-1 text-sm text-gray-600">
              ${m.nim ? '<div class="flex items-center gap-2"><span class="text-gray-400">NIM:</span><span class="font-medium">' + m.nim + '</span></div>' : ''}
              ${m.jurusan ? '<div class="flex items-center gap-2"><span class="text-gray-400">Jurusan:</span><span>' + m.jurusan + '</span></div>' : ''}
              ${m.prodi ? '<div class="flex items-center gap-2"><span class="text-gray-400">Prodi:</span><span>' + m.prodi + '</span></div>' : ''}
              ${m.kelas ? '<div class="flex items-center gap-2"><span class="text-gray-400">Kelas:</span><span>' + m.kelas + '</span></div>' : ''}
              ${m.tahun ? '<div class="flex items-center gap-2"><span class="text-gray-400">Angkatan:</span><span>' + m.tahun + '</span></div>' : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    dosenContainer.innerHTML = dosenHtml || '<div class="col-span-full text-center text-sm text-gray-500 py-8">Belum ada data dosen atau staff.</div>';
    mahasiswaContainer.innerHTML = mahasiswaHtml || '<div class="col-span-full text-center text-sm text-gray-500 py-8">Belum ada data mahasiswa.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderAnggota);

  // Public News render for berita.html - Read-only display
  function renderNewsPublic() {
    const container = qs('[data-news-container]');
    if (!container) return;
    
    // Get news data from localStorage
    const data = store.get('news', []);
    
    // Render news cards for public viewing only
    const html = data.map(n => `
      <div class="news-card group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition cursor-pointer" 
           data-type="${n.category || 'Berita'}" 
           data-date="${n.date}" 
           onclick="openNewsDetail('${n.id}')">
        <img class="h-48 w-full object-cover" src="${n.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop'}" alt="${n.title}" />
        <div class="p-5">
          <div class="text-xs text-gray-500 mb-2">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${n.category === 'Berita' ? 'bg-blue-100 text-blue-700' : n.category === 'Pengumuman' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}">${n.category || 'Berita'}</span>
            <span class="mx-2">•</span>
            <span>${new Date(n.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
            <span class="mx-2">•</span>
            <span>${n.author || 'Admin'}</span>
          </div>
          <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">${n.title}</h3>
          <p class="text-sm text-gray-600 line-clamp-3">${(n.info || '').substring(0, 120)}${n.info && n.info.length > 120 ? '...' : ''}</p>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html || '<div class="col-span-full text-center text-sm text-gray-500 py-12">Belum ada berita tersedia.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderNewsPublic);

  // Navigate to news detail page
  window.openNewsDetail = function(newsId) {
    window.location.href = `detail-berita.html?id=${newsId}`;
  };

  // Public Facilities render
  function renderFacilitiesPublic() {
    const container = qs('[data-facilities-container]');
    if (!container) return;
    const data = store.get('facilities', []);
    const html = data.map(f => `
      <div class="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
        <img src="${f.photo || 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1200&auto=format&fit=crop'}" alt="${f.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-semibold text-gray-900">${f.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${f.desc || ''}</p>
        </div>
      </div>
    `).join('');
    container.innerHTML = html || '<div class="text-sm text-gray-500 p-6">Belum ada fasilitas.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderFacilitiesPublic);

  // Public Gallery render
  function renderGalleryPublic() {
    const container = qs('[data-gallery-container]');
    if (!container) return;
    const data = store.get('gallery', []);
    const html = data.map(g => `
      <div class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition cursor-pointer" data-lightbox="${g.photo}">
        <img class="h-48 w-full object-cover" src="${g.photo || 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1200&auto=format&fit=crop'}" alt="${g.name}" />
        <div class="p-4">
          <div class="font-semibold text-sm">${g.name}</div>
          <p class="mt-1 text-xs text-gray-600">${g.desc || ''}</p>
        </div>
      </div>
    `).join('');
    container.innerHTML = html || '<div class="text-sm text-gray-500 p-6">Belum ada foto.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderGalleryPublic);

  // Public Agenda render
  function renderAgendaPublic() {
    const container = qs('[data-agenda-container]');
    if (!container) return;
    const data = store.get('agenda', []);
    const html = data.map(a => `
      <div class="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition">
        <div class="text-xs text-gray-500">${new Date(a.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
        <div class="mt-1 font-semibold">${a.name}</div>
        <p class="mt-2 text-sm text-gray-600">${a.desc || ''}</p>
        ${a.link ? `<a href="${a.link}" target="_blank" class="mt-3 inline-block text-xs text-sky-600 hover:underline">Lihat detail →</a>` : ''}
      </div>
    `).join('');
    container.innerHTML = html || '<div class="text-sm text-gray-500 p-6">Belum ada agenda.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderAgendaPublic);

  // Filtering for Publikasi (static cards via data attrs)
  function initPubFilters() {
    const filter = qs('#pub-filter');
    const sort = qs('#pub-sort');
    const cards = qsa('[data-pub]');
    if (!filter || !cards.length) return;
    function apply() {
      const f = filter.value;
      let list = cards;
      list.forEach(c => {
        const ok = f === 'all' || c.dataset.type === f;
        c.classList.toggle('hidden', !ok);
      });
      const s = sort?.value || 'year-desc';
      const parent = cards[0]?.parentElement;
      if (!parent) return;
      const arr = qsa('[data-pub]').filter(c => !c.classList.contains('hidden'));
      arr.sort((a,b) => {
        const ya = parseInt(a.dataset.year||'0',10); const yb = parseInt(b.dataset.year||'0',10);
        if (s==='year-desc') return yb-ya; if (s==='year-asc') return ya-yb; return 0;
      });
      arr.forEach(el => parent.appendChild(el));
    }
    filter.addEventListener('change', apply);
    sort?.addEventListener('change', apply);
  }
  document.addEventListener('DOMContentLoaded', initPubFilters);

  // Public News Filtering (read-only functionality)
  function initNewsFilters() {
    const filterSelect = qs('#filter-news');
    const sortSelect = qs('[data-news-sort]');
    
    if (!filterSelect) return;
    
    // Category filtering functionality
    filterSelect.addEventListener('change', () => {
      const filterValue = filterSelect.value;
      const newsCards = qsa('.news-card');
      
      newsCards.forEach(card => {
        const cardType = card.dataset.type;
        const shouldShow = filterValue === 'all' || cardType === filterValue;
        card.classList.toggle('hidden', !shouldShow);
      });
    });
    
    // Sort functionality (if sort select exists)
    if (sortSelect) {
      function applySorting() {
        const sortValue = sortSelect.value;
        const container = qs('[data-news-container]');
        const newsCards = Array.from(qsa('.news-card'));
        
        newsCards.sort((a, b) => {
          const dateA = new Date(a.dataset.date || '2025-01-01');
          const dateB = new Date(b.dataset.date || '2025-01-01');
          return sortValue === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        // Re-append sorted cards
        newsCards.forEach(card => container.appendChild(card));
      }
      
      sortSelect.addEventListener('change', applySorting);
    }
  }
  document.addEventListener('DOMContentLoaded', initNewsFilters);

  // News Detail Page functionality
  function initNewsDetail() {
    if (!window.location.pathname.includes('detail-berita.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    if (!newsId) {
      qs('#news-detail-content').innerHTML = '<div class="text-center py-20"><div class="text-red-500">Berita tidak ditemukan</div></div>';
      return;
    }
    
    const newsData = store.get('news', []);
    const news = newsData.find(n => n.id === newsId);
    
    if (!news) {
      qs('#news-detail-content').innerHTML = '<div class="text-center py-20"><div class="text-red-500">Berita tidak ditemukan</div></div>';
      return;
    }
    
    // Update breadcrumb
    qs('#breadcrumb-title').textContent = news.title;
    document.title = `${news.title} – Lab Data Technologies`;
    
    // Render news detail
    const detailHtml = `
      <header class="mb-8">
        <div class="text-sm text-gray-500 mb-4">
          <span class="px-3 py-1 rounded-full bg-[#E6F8FD] text-[#00A0D6] text-xs font-medium">${news.category}</span>
          <span class="mx-2">•</span>
          <span>${new Date(news.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
          <span class="mx-2">•</span>
          <span>Oleh ${news.author}</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">${news.title}</h1>
        <p class="text-lg text-gray-600">${news.info}</p>
      </header>
      
      <div class="mb-8">
        <img class="w-full h-64 lg:h-96 object-cover rounded-xl" src="${news.image}" alt="${news.title}" />
      </div>
      
      <div class="prose prose-lg max-w-none">
        ${news.content ? news.content.split('\n').map(p => p.trim() ? `<p class="mb-4">${p}</p>` : '').join('') : '<p>Konten tidak tersedia.</p>'}
      </div>
      
      <div class="mt-8 pt-8 border-t">
        <a href="berita.html" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition">
          ← Kembali ke Berita
        </a>
      </div>
    `;
    
    qs('#news-detail-content').innerHTML = detailHtml;
    
    // Render related news
    const relatedNews = newsData.filter(n => n.id !== newsId && n.category === news.category).slice(0, 3);
    const relatedHtml = relatedNews.map(n => `
      <div class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition cursor-pointer" onclick="openNewsDetail('${n.id}')">
        <img class="h-48 w-full object-cover" src="${n.image}" alt="${n.title}" />
        <div class="p-5">
          <div class="text-xs text-gray-500 mb-2">${n.category} • ${new Date(n.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
          <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">${n.title}</h3>
          <p class="text-sm text-gray-600 line-clamp-3">${n.info.substring(0, 120)}${n.info.length > 120 ? '...' : ''}</p>
        </div>
      </div>
    `).join('');
    
    qs('#related-news').innerHTML = relatedHtml || '<div class="col-span-full text-center text-sm text-gray-500 py-8">Tidak ada berita terkait.</div>';
  }
  document.addEventListener('DOMContentLoaded', initNewsDetail);

  // Public news page - no add/edit functionality needed

  // Render upcoming agenda in berita.html sidebar
  function renderUpcomingAgenda() {
    const container = qs('#upcoming-agenda');
    if (!container) return;
    
    const agendaData = store.get('agenda', []);
    const upcomingAgenda = agendaData
      .filter(a => a.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
    
    const html = upcomingAgenda.map(a => `
      <li class="flex items-center justify-between">
        <a href="agenda-detail.html?id=${a.id}" class="text-sky-600 hover:underline">${a.name}</a>
        <span class="text-gray-500">${new Date(a.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}</span>
      </li>
    `).join('');
    
    container.innerHTML = html || '<li class="text-gray-500 text-xs">Tidak ada agenda mendatang</li>';
  }
  document.addEventListener('DOMContentLoaded', renderUpcomingAgenda);

  // Agenda Detail Page functionality
  function initAgendaDetail() {
    if (!window.location.pathname.includes('agenda-detail.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const agendaId = urlParams.get('id');
    
    if (!agendaId) {
      qs('#agenda-detail-content').innerHTML = '<div class="text-center py-20"><div class="text-red-500">Agenda tidak ditemukan</div></div>';
      return;
    }
    
    const agendaData = store.get('agenda', []);
    const agenda = agendaData.find(a => a.id === agendaId);
    
    if (!agenda) {
      qs('#agenda-detail-content').innerHTML = '<div class="text-center py-20"><div class="text-red-500">Agenda tidak ditemukan</div></div>';
      return;
    }
    
    // Update breadcrumb and title
    qs('#breadcrumb-title').textContent = agenda.name;
    document.title = `${agenda.name} – Lab Data Technologies`;
    
    // Render agenda detail
    const statusBadge = agenda.status === 'upcoming' 
      ? '<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Akan Datang</span>'
      : '<span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">Selesai</span>';
    
    const detailHtml = `
      <header class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          ${statusBadge}
          <span class="text-sm text-gray-500">${new Date(agenda.date).toLocaleDateString('id-ID', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'})}</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">${agenda.name}</h1>
      </header>
      
      <div class="bg-gray-50 rounded-xl p-6 mb-8">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-3">Informasi Kegiatan</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-gray-600">Tanggal:</span>
                <span class="font-medium">${new Date(agenda.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
              </div>
              ${agenda.time ? `
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-gray-600">Waktu:</span>
                  <span class="font-medium">${agenda.time}</span>
                </div>
              ` : ''}
              ${agenda.location ? `
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-gray-600">Lokasi:</span>
                  <span class="font-medium">${agenda.location}</span>
                </div>
              ` : ''}
              ${agenda.speaker ? `
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="text-gray-600">Pembicara:</span>
                  <span class="font-medium">${agenda.speaker}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${agenda.link ? `
            <div>
              <h3 class="font-semibold text-gray-900 mb-3">Link Kegiatan</h3>
              <a href="${agenda.link}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-[#00A0D6] text-white rounded-lg hover:bg-[#0090C0] transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                ${agenda.status === 'upcoming' ? 'Daftar Sekarang' : 'Lihat Dokumentasi'}
              </a>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="prose prose-lg max-w-none mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Deskripsi Kegiatan</h2>
        <p class="text-gray-700 leading-relaxed">${agenda.desc || 'Deskripsi kegiatan tidak tersedia.'}</p>
      </div>
      
      <div class="mt-8 pt-8 border-t">
        <a href="berita.html" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition">
          ← Kembali ke Berita
        </a>
      </div>
    `;
    
    qs('#agenda-detail-content').innerHTML = detailHtml;
    
    // Render related agenda
    const relatedAgenda = agendaData.filter(a => a.id !== agendaId && a.status === agenda.status).slice(0, 3);
    const relatedHtml = relatedAgenda.map(a => `
      <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onclick="window.location.href='agenda-detail.html?id=${a.id}'">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-1 rounded-full ${a.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs font-medium">${a.status === 'upcoming' ? 'Akan Datang' : 'Selesai'}</span>
          <span class="text-xs text-gray-500">${new Date(a.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}</span>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">${a.name}</h3>
        <p class="text-sm text-gray-600">${a.desc.substring(0, 100)}${a.desc.length > 100 ? '...' : ''}</p>
      </div>
    `).join('');
    
    qs('#related-agenda').innerHTML = relatedHtml || '<div class="col-span-full text-center text-sm text-gray-500 py-8">Tidak ada agenda terkait.</div>';
  }
  document.addEventListener('DOMContentLoaded', initAgendaDetail);

  // Member Registration functionality
  function initMemberRegistration() {
    const registerBtn = qs('#register-btn');
    const modal = qs('#registration-modal');
    const form = qs('#registration-form');
    
    if (!registerBtn || !modal || !form) return;
    
    // Open registration modal
    registerBtn.addEventListener('click', () => {
      openModal('#registration-modal');
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        id: 'm' + Math.random().toString(36).slice(2, 8),
        name: qs('#reg-name').value.trim(),
        nim: qs('#reg-nim').value.trim(),
        jurusan: qs('#reg-jurusan').value,
        prodi: qs('#reg-prodi').value,
        kelas: qs('#reg-kelas').value.trim(),
        tahun: parseInt(qs('#reg-tahun').value) || new Date().getFullYear(),
        tel: qs('#reg-tel').value.trim(),
        photo: '', // Will be handled separately for file upload
        email: '', // Can be added later
        role: 'Mahasiswa',
        field: 'Peneliti',
        status: 'pending' // Pending admin approval
      };
      
      // Basic validation
      if (!formData.name || !formData.nim || !formData.jurusan || !formData.prodi || !formData.kelas || !formData.tel) {
        showToast('Mohon lengkapi semua field yang wajib diisi', 3000);
        return;
      }
      
      // Validate file upload
      const photoFile = qs('#reg-photo').files[0];
      if (photoFile) {
        // Check file size (2MB max)
        if (photoFile.size > 2 * 1024 * 1024) {
          showToast('Ukuran foto maksimal 2MB', 3000);
          return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(photoFile.type)) {
          showToast('Format foto harus JPG atau PNG', 3000);
          return;
        }
        
        // For demo purposes, we'll use a placeholder URL
        // In real implementation, this would be uploaded to server
        formData.photo = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name) + '&background=f59e0b&color=fff&size=200';
      }
      
      // Save to localStorage with pending status
      const members = store.get('members', []);
      
      // Check if NIM already exists
      const existingMember = members.find(m => m.nim === formData.nim);
      if (existingMember) {
        showToast('NIM sudah terdaftar dalam sistem', 3000);
        return;
      }
      
      members.push(formData);
      store.set('members', members);
      
      // Close modal and show success message
      closeModal('#registration-modal');
      form.reset();
      showToast('Pendaftaran berhasil dikirim, menunggu verifikasi admin.', 4000);
      
      // Optionally refresh the member display (though pending members won't show)
      renderAnggota();
    });
  }
  document.addEventListener('DOMContentLoaded', initMemberRegistration);

  // Profile lab page - no member rendering needed (handled in anggota.html)

  // Gallery page rendering
  function renderGallery() {
    const container = qs('#gallery-grid');
    if (!container) return;
    
    const galleryData = store.get('gallery', []);
    const html = galleryData.map(g => `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
        <img src="${g.photo}" alt="${g.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-semibold text-gray-900">${g.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${g.desc}</p>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html || '<div class="col-span-full text-center text-sm text-gray-500 py-8">Belum ada foto tersedia.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderGallery);

  // Agenda page rendering
  function renderAgendaPage() {
    const container = qs('#agenda-list');
    if (!container) return;
    
    const agendaData = store.get('agenda', []);
    const html = agendaData.map(a => `
      <div class="p-5 border border-gray-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition">
        <div>
          <h3 class="font-semibold text-gray-900">${a.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${new Date(a.date).toLocaleDateString('id-ID', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'})}</p>
          ${a.time ? `<p class="text-xs text-gray-500 mt-1">${a.time}</p>` : ''}
          ${a.location ? `<p class="text-xs text-gray-500">${a.location}</p>` : ''}
        </div>
        <div class="mt-3 sm:mt-0 flex items-center gap-3">
          <span class="px-2 py-1 rounded-full text-xs font-medium ${a.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">${a.status === 'upcoming' ? 'Akan Datang' : 'Selesai'}</span>
          <a href="agenda-detail.html?id=${a.id}" class="text-sm text-[#00A0D6] hover:underline">Lihat Detail</a>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html || '<div class="text-center text-sm text-gray-500 py-8">Belum ada agenda tersedia.</div>';
  }
  document.addEventListener('DOMContentLoaded', renderAgendaPage);

  // Login functionality
  function initLogin() {
    const loginForm = qs('#loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = qs('#email').value.trim();
      const password = qs('#password').value.trim();
      const errorDiv = qs('#loginError');
      
      if (!email || !password) {
        errorDiv.textContent = 'Email dan password harus diisi';
        errorDiv.classList.remove('hidden');
        return;
      }
      
      const users = store.get('users', []);
      const user = users.find(u => 
        (u.email === email || u.username === email) && u.password === password
      );
      
      if (user) {
        // Store current user session
        store.set('currentUser', user);
        
        // Redirect based on role
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else if (user.role === 'editor') {
          window.location.href = 'editor-dashboard.html';
        }
      } else {
        errorDiv.textContent = 'Email atau password salah';
        errorDiv.classList.remove('hidden');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', initLogin);

  // Dashboard tab switching functionality
  function initDashboardTabs() {
    const navItems = qsa('.nav-item');
    const tabContents = qsa('.tab-content');
    
    if (!navItems.length) return;
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.dataset.tab;
        
        // Remove active class from all nav items
        navItems.forEach(nav => {
          nav.classList.remove('text-[#00A0D6]', 'bg-blue-50', 'border', 'border-blue-100');
          nav.classList.add('text-gray-600', 'hover:text-[#00A0D6]', 'hover:bg-blue-50');
        });
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.add('hidden'));
        
        // Add active class to clicked nav item
        item.classList.remove('text-gray-600', 'hover:text-[#00A0D6]', 'hover:bg-blue-50');
        item.classList.add('text-[#00A0D6]', 'bg-blue-50', 'border', 'border-blue-100');
        
        // Show target content
        const targetContent = qs(`#tab-${targetTab}`);
        if (targetContent) {
          targetContent.classList.remove('hidden');
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initDashboardTabs);

  // Mobile sidebar functionality
  function initMobileSidebar() {
    const mobileToggle = qs('#mobile-menu-toggle');
    const sidebar = qs('#sidebar');
    const overlay = qs('#sidebar-overlay');
    const sidebarToggle = qs('#sidebar-toggle');
    
    if (mobileToggle && sidebar && overlay) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
      });
      
      overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    }
    
    if (sidebarToggle && sidebar && overlay) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    }
  }
  document.addEventListener('DOMContentLoaded', initMobileSidebar);

  // Admin dashboard functionality
  function initAdminDashboard() {
    if (!window.location.pathname.includes('admin-dashboard.html')) return;
    
    renderPendingMembers();
    renderPendingApprovals();
  }

  function renderPendingMembers() {
    const container = qs('#member-list');
    if (!container) return;
    
    const members = store.get('members', []);
    const pendingMembers = members.filter(m => m.status === 'pending');
    
    const html = pendingMembers.map(m => `
      <div class="p-4 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <p class="font-semibold">${m.name}</p>
          <p class="text-sm text-gray-500">${m.nim} – ${m.prodi} ${m.jurusan}</p>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600" onclick="approveMember('${m.id}')">Setujui</button>
          <button class="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600" onclick="rejectMember('${m.id}')">Tolak</button>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html || '<div class="text-center text-gray-500 py-8">Tidak ada member pending</div>';
  }

  function renderPendingApprovals() {
    const container = qs('#approval-list');
    if (!container) return;
    
    const approvals = store.get('pendingApprovals', []);
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    
    const html = pendingApprovals.map(a => `
      <div class="p-4 border rounded-lg bg-white">
        <p class="font-semibold">Perubahan ${a.type}: "${a.title}"</p>
        <p class="text-sm text-gray-500 mt-1">Editor: ${a.editor}</p>
        <div class="mt-3 flex gap-2">
          <button class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600" onclick="approveChange('${a.id}')">Setujui</button>
          <button class="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600" onclick="rejectChange('${a.id}')">Tolak</button>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html || '<div class="text-center text-gray-500 py-8">Tidak ada perubahan pending</div>';
  }

  // Global functions for admin actions
  window.approveMember = function(memberId) {
    const members = store.get('members', []);
    const member = members.find(m => m.id === memberId);
    if (member) {
      member.status = 'approved';
      store.set('members', members);
      renderPendingMembers();
      showToast('Member berhasil disetujui', 3000);
    }
  };

  window.rejectMember = function(memberId) {
    const members = store.get('members', []);
    const updatedMembers = members.filter(m => m.id !== memberId);
    store.set('members', updatedMembers);
    renderPendingMembers();
    showToast('Member ditolak', 3000);
  };

  window.approveChange = function(approvalId) {
    const approvals = store.get('pendingApprovals', []);
    const approval = approvals.find(a => a.id === approvalId);
    if (approval) {
      approval.status = 'approved';
      store.set('pendingApprovals', approvals);
      renderPendingApprovals();
      showToast('Perubahan berhasil disetujui', 3000);
    }
  };

  window.rejectChange = function(approvalId) {
    const approvals = store.get('pendingApprovals', []);
    const approval = approvals.find(a => a.id === approvalId);
    if (approval) {
      approval.status = 'rejected';
      store.set('pendingApprovals', approvals);
      renderPendingApprovals();
      showToast('Perubahan ditolak', 3000);
    }
  };

  document.addEventListener('DOMContentLoaded', initAdminDashboard);

  // Editor dashboard functionality
  function initEditorDashboard() {
    if (!window.location.pathname.includes('editor-dashboard.html')) return;
    
    // Handle form submissions for editor
    const forms = ['form-berita', 'form-agenda', 'form-galeri', 'form-publikasi'];
    
    forms.forEach(formId => {
      const form = qs(`#${formId}`);
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleEditorSubmission(formId, form);
        });
      }
    });
  }

  function handleEditorSubmission(formId, form) {
    const formData = new FormData(form);
    const currentUser = store.get('currentUser');
    
    if (!currentUser) {
      showToast('Session expired. Please login again.', 3000);
      window.location.href = 'login.html';
      return;
    }
    
    // Create approval request
    const approvals = store.get('pendingApprovals', []);
    const newApproval = {
      id: 'pa' + Date.now(),
      type: formId.replace('form-', ''),
      title: form.querySelector('input[type="text"]').value,
      editor: currentUser.name,
      status: 'pending',
      data: Object.fromEntries(formData),
      createdAt: new Date().toISOString()
    };
    
    approvals.push(newApproval);
    store.set('pendingApprovals', approvals);
    
    form.reset();
    showToast('Perubahan dikirim untuk persetujuan admin', 3000);
  }

  document.addEventListener('DOMContentLoaded', initEditorDashboard);

  // CRUD Modal System
  let currentEntity = '';
  let currentEditId = null;

  // Form field configurations for different entities
  const formConfigs = {
    berita: [
      { name: 'title', label: 'Judul Berita', type: 'text', required: true },
      { name: 'category', label: 'Kategori', type: 'select', options: ['Berita', 'Pengumuman'], required: true },
      { name: 'content', label: 'Isi Berita', type: 'textarea', required: true },
      { name: 'image', label: 'URL Gambar', type: 'url' },
      { name: 'author', label: 'Penulis', type: 'text', required: true }
    ],
    publikasi: [
      { name: 'title', label: 'Judul Publikasi', type: 'text', required: true },
      { name: 'authors', label: 'Penulis', type: 'text', required: true },
      { name: 'year', label: 'Tahun', type: 'number', required: true },
      { name: 'type', label: 'Tipe', type: 'select', options: ['Jurnal', 'Proceeding', 'Artikel'], required: true },
      { name: 'link', label: 'Link Publikasi', type: 'url' },
      { name: 'abstract', label: 'Abstrak', type: 'textarea' }
    ],
    agenda: [
      { name: 'name', label: 'Nama Kegiatan', type: 'text', required: true },
      { name: 'date', label: 'Tanggal', type: 'date', required: true },
      { name: 'time', label: 'Waktu', type: 'text', required: true },
      { name: 'location', label: 'Lokasi', type: 'text', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'speaker', label: 'Pembicara', type: 'text' },
      { name: 'link', label: 'Link Pendaftaran', type: 'url' }
    ],
    galeri: [
      { name: 'name', label: 'Nama Foto', type: 'text', required: true },
      { name: 'photo', label: 'URL Foto', type: 'url', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'category', label: 'Kategori', type: 'select', options: ['Kegiatan', 'Fasilitas', 'Dokumentasi'] }
    ],
    fasilitas: [
      { name: 'name', label: 'Nama Fasilitas', type: 'text', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea', required: true },
      { name: 'condition', label: 'Kondisi', type: 'select', options: ['Baik', 'Rusak Ringan', 'Rusak Berat'], required: true },
      { name: 'photo', label: 'URL Foto', type: 'url' }
    ]
  };

  // Open modal for CRUD operations
  window.openModal = function(entity, editId = null) {
    currentEntity = entity;
    currentEditId = editId;
    
    const modal = qs('#crud-modal');
    const modalTitle = qs('#modal-title');
    const formFields = qs('#form-fields');
    
    modalTitle.textContent = editId ? `Edit ${entity.charAt(0).toUpperCase() + entity.slice(1)}` : `Tambah ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
    
    // Generate form fields
    const config = formConfigs[entity];
    let fieldsHTML = '';
    
    config.forEach(field => {
      let fieldHTML = `<div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">${field.label}${field.required ? ' *' : ''}</label>`;
      
      if (field.type === 'textarea') {
        fieldHTML += `<textarea name="${field.name}" class="w-full min-h-[100px] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}></textarea>`;
      } else if (field.type === 'select') {
        fieldHTML += `<select name="${field.name}" class="w-full h-11 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>
          <option value="">Pilih ${field.label}</option>`;
        field.options.forEach(option => {
          fieldHTML += `<option value="${option}">${option}</option>`;
        });
        fieldHTML += `</select>`;
      } else {
        fieldHTML += `<input type="${field.type}" name="${field.name}" class="w-full h-11 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>`;
      }
      
      fieldHTML += `</div>`;
      fieldsHTML += fieldHTML;
    });
    
    formFields.innerHTML = fieldsHTML;
    
    // If editing, populate form with existing data
    if (editId) {
      const data = store.get(entity, []);
      const item = data.find(d => d.id === editId);
      if (item) {
        config.forEach(field => {
          const input = qs(`[name="${field.name}"]`);
          if (input && item[field.name]) {
            input.value = item[field.name];
          }
        });
      }
    }
    
    modal.classList.remove('hidden');
  };

  // Close modal
  window.closeModal = function() {
    const modal = qs('#crud-modal');
    const form = qs('#crud-form');
    modal.classList.add('hidden');
    form.reset();
    currentEntity = '';
    currentEditId = null;
  };

  // Handle form submission
  document.addEventListener('DOMContentLoaded', () => {
    const form = qs('#crud-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        // Add metadata
        data.id = currentEditId || generateId();
        data.createdAt = currentEditId ? undefined : new Date().toISOString();
        data.updatedAt = new Date().toISOString();
        
        // Set status based on user role
        const currentUser = store.get('currentUser');
        if (currentUser && currentUser.role === 'editor') {
          data.status = 'pending';
          data.editor = currentUser.name;
        } else {
          data.status = 'approved';
        }
        
        // Save to localStorage
        const existingData = store.get(currentEntity, []);
        
        if (currentEditId) {
          const index = existingData.findIndex(item => item.id === currentEditId);
          if (index !== -1) {
            existingData[index] = { ...existingData[index], ...data };
          }
        } else {
          existingData.push(data);
        }
        
        store.set(currentEntity, existingData);
        
        // Show success message
        showToast(currentUser && currentUser.role === 'editor' ? 
          'Data berhasil disimpan dan menunggu persetujuan admin!' : 
          'Data berhasil disimpan!');
        
        // Refresh table
        refreshTable(currentEntity);
        
        // Close modal
        closeModal();
      });
    }
  });

  // Generate unique ID
  function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Show toast notification
  function showToast(message) {
    const toast = qs('#toast');
    const toastMessage = qs('#toast-message');
    
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }
  }

  // Delete item
  window.deleteItem = function(entity, id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const data = store.get(entity, []);
      const filteredData = data.filter(item => item.id !== id);
      store.set(entity, filteredData);
      
      showToast('Data berhasil dihapus!');
      refreshTable(entity);
    }
  };

  // Refresh table data
  function refreshTable(entity) {
    const isEditor = window.location.pathname.includes('editor-dashboard');
    const tableId = isEditor ? `editor-${entity}-table` : `${entity}-table`;
    renderTable(entity, tableId);
  }

  // Render table data
  function renderTable(entity, tableId) {
    const tbody = qs(`#${tableId}`);
    if (!tbody) return;
    
    const data = store.get(entity, []);
    const currentUser = store.get('currentUser');
    const isEditor = currentUser && currentUser.role === 'editor';
    
    // Filter data for editor (only show their own content)
    const filteredData = isEditor ? data.filter(item => item.editor === currentUser.name || !item.editor) : data;
    
    let html = '';
    
    filteredData.forEach(item => {
      html += '<tr class="hover:bg-gray-50">';
      
      // Render columns based on entity type
      if (entity === 'berita') {
        html += `
          <td class="py-3 px-4">${item.title || ''}</td>
          <td class="py-3 px-4">${item.category || ''}</td>
          <td class="py-3 px-4">${item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : ''}</td>
          ${!isEditor ? `<td class="py-3 px-4">${item.author || ''}</td>` : ''}
          <td class="py-3 px-4">${getStatusBadge(item.status)}</td>
        `;
      } else if (entity === 'publikasi') {
        html += `
          <td class="py-3 px-4">${item.title || ''}</td>
          <td class="py-3 px-4">${item.authors || ''}</td>
          <td class="py-3 px-4">${item.year || ''}</td>
          ${!isEditor ? `<td class="py-3 px-4">${item.type || ''}</td>` : ''}
          <td class="py-3 px-4">${getStatusBadge(item.status)}</td>
        `;
      } else if (entity === 'agenda') {
        html += `
          <td class="py-3 px-4">${item.name || ''}</td>
          <td class="py-3 px-4">${item.date || ''}</td>
          ${!isEditor ? `<td class="py-3 px-4">${item.time || ''}</td>` : ''}
          <td class="py-3 px-4">${item.location || ''}</td>
          <td class="py-3 px-4">${getStatusBadge(item.status)}</td>
        `;
      } else if (entity === 'galeri') {
        html += `
          <td class="py-3 px-4">
            ${item.photo ? `<img src="${item.photo}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">` : ''}
          </td>
          <td class="py-3 px-4">${item.name || ''}</td>
          <td class="py-3 px-4">${item.description ? item.description.substring(0, 50) + '...' : ''}</td>
          ${!isEditor ? `<td class="py-3 px-4">${item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : ''}</td>` : ''}
          <td class="py-3 px-4">${getStatusBadge(item.status)}</td>
        `;
      } else if (entity === 'fasilitas') {
        html += `
          <td class="py-3 px-4">${item.name || ''}</td>
          <td class="py-3 px-4">${item.description ? item.description.substring(0, 50) + '...' : ''}</td>
          <td class="py-3 px-4">${item.condition || ''}</td>
          <td class="py-3 px-4">${item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID') : ''}</td>
          <td class="py-3 px-4">${getStatusBadge(item.status)}</td>
        `;
      }
      
      // Action buttons
      html += `
        <td class="py-3 px-4 text-center">
          <div class="flex justify-center space-x-2">
            <button onclick="openModal('${entity}', '${item.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Edit
            </button>
            <button onclick="deleteItem('${entity}', '${item.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium">
              Hapus
            </button>
          </div>
        </td>
      `;
      
      html += '</tr>';
    });
    
    if (filteredData.length === 0) {
      const colspan = entity === 'galeri' ? 6 : (entity === 'fasilitas' ? 6 : 6);
      html = `<tr><td colspan="${colspan}" class="py-8 text-center text-gray-500">Belum ada data</td></tr>`;
    }
    
    tbody.innerHTML = html;
  }

  // Get status badge HTML
  function getStatusBadge(status) {
    const badges = {
      pending: '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>',
      approved: '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>',
      rejected: '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>'
    };
    return badges[status] || badges.approved;
  }

  // Initialize tables on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize dummy data
    initializeDummyData();
    
    // Render tables based on current page
    if (window.location.pathname.includes('admin-dashboard')) {
      renderTable('berita', 'berita-table');
      renderTable('publikasi', 'publikasi-table');
      renderTable('agenda', 'agenda-table');
      renderTable('galeri', 'galeri-table');
      renderTable('fasilitas', 'fasilitas-table');
    } else if (window.location.pathname.includes('editor-dashboard')) {
      renderTable('berita', 'editor-berita-table');
      renderTable('publikasi', 'editor-publikasi-table');
      renderTable('agenda', 'editor-agenda-table');
      renderTable('galeri', 'editor-galeri-table');
    }
  });

  // Initialize dummy data for CRUD tables
  function initializeDummyData() {
    if (!store.get('berita-crud')) {
      store.set('berita', [
        { id: 'b1', title: 'Workshop Machine Learning 2025', category: 'Berita', content: 'Workshop intensif machine learning...', author: 'Admin Lab', status: 'approved', createdAt: '2024-11-10T10:00:00Z' },
        { id: 'b2', title: 'Pengumuman Pendaftaran Asisten Lab', category: 'Pengumuman', content: 'Dibuka pendaftaran asisten lab...', author: 'Admin Lab', status: 'approved', createdAt: '2024-11-09T14:30:00Z' },
        { id: 'b3', title: 'Seminar Data Science Terapan', category: 'Berita', content: 'Seminar tentang penerapan data science...', author: 'Fauzan', editor: 'Fauzan', status: 'pending', createdAt: '2024-11-12T09:15:00Z' }
      ]);
      store.set('berita-crud', true);
    }
    
    if (!store.get('publikasi-crud')) {
      store.set('publikasi', [
        { id: 'p1', title: 'Deep Learning for Image Classification', authors: 'Dr. Ahmad Saikhu, Ir. Sari Widya', year: 2024, type: 'Jurnal', status: 'approved', createdAt: '2024-10-15T08:00:00Z' },
        { id: 'p2', title: 'Big Data Analytics in Healthcare', authors: 'Ir. Sari Widya, Dr. Ahmad Saikhu', year: 2024, type: 'Proceeding', status: 'approved', createdAt: '2024-09-20T16:45:00Z' }
      ]);
      store.set('publikasi-crud', true);
    }
  }

  // Editor/Admin: simple member CRUD (visual, localStorage demo)
  function initMemberCrud() {
    const addBtns = qsa('[data-action="member-add"]');
    if (!addBtns.length) return;
    const modal = qs('#modal-member');
    const form = qs('#form-member');
    if (!modal || !form) return;
    let editingId = null;

    function resetForm() { form.reset(); editingId = null; qs('#member-modal-title').textContent = 'Tambah Anggota'; }
    function open() { openModal('#modal-member'); }

    addBtns.forEach(b => b.addEventListener('click', () => { resetForm(); open(); }));

    // Delegate edit/delete buttons in containers
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-action="member-edit"]');
      const delBtn = e.target.closest('[data-action="member-del"]');
      if (editBtn) {
        const id = editBtn.dataset.id; const data = store.get('members', []);
        const m = data.find(x=>x.id===id); if (!m) return;
        editingId = id;
        if(qs('#member-name')) qs('#member-name').value = m.name||'';
        if(qs('#member-email')) qs('#member-email').value = m.email||'';
        if(qs('#member-role')) qs('#member-role').value = m.role||'';
        if(qs('#member-field')) qs('#member-field').value = m.field||'';
        if(qs('#member-nim')) qs('#member-nim').value = m.nim||'';
        if(qs('#member-jurusan')) qs('#member-jurusan').value = m.jurusan||'';
        if(qs('#member-prodi')) qs('#member-prodi').value = m.prodi||'';
        if(qs('#member-kelas')) qs('#member-kelas').value = m.kelas||'';
        if(qs('#member-tahun')) qs('#member-tahun').value = m.tahun||'';
        if(qs('#member-tel')) qs('#member-tel').value = m.tel||'';
        if(qs('#member-photo')) qs('#member-photo').value = m.photo||'';
        qs('#member-modal-title').textContent = 'Ubah Anggota';
        open();
      }
      if (delBtn) {
        const id = delBtn.dataset.id; const data = store.get('members', []);
        const next = data.filter(x=>x.id!==id);
        store.set('members', next);
        renderAnggota(); renderDashMembers();
        showToast('Item dihapus');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#member-name')?.value.trim() || '';
      const email = qs('#member-email')?.value.trim() || '';
      const role = qs('#member-role')?.value.trim() || '';
      const field = qs('#member-field')?.value.trim() || '';
      const nim = qs('#member-nim')?.value.trim() || '';
      const jurusan = qs('#member-jurusan')?.value.trim() || '';
      const prodi = qs('#member-prodi')?.value.trim() || '';
      const kelas = qs('#member-kelas')?.value.trim() || '';
      const tahun = parseInt(qs('#member-tahun')?.value || '0', 10) || '';
      const tel = qs('#member-tel')?.value.trim() || '';
      const photo = qs('#member-photo')?.value.trim() || '';
      if (!name) { qs('#member-name').classList.add('ring-2','ring-red-300'); return; }
      const data = store.get('members', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], name, email, role, field, nim, jurusan, prodi, kelas, tahun, tel, photo };
        store.set('members', data);
      } else {
        const id = 'm'+Math.random().toString(36).slice(2,8);
        data.push({ id, status: 'approved', name, email, role, field, nim, jurusan, prodi, kelas, tahun, tel, photo }); store.set('members', data);
      }
      closeModal('#modal-member'); renderAnggota(); renderDashMembers();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initMemberCrud);

  // Render members inside dashboard grids if present
  function renderDashMembers() {
    qsa('[data-members-grid]').forEach(root => {
      const data = store.get('members', []);
      root.innerHTML = data.map(m => `
        <div class=\"p-4 rounded-xl bg-white border\">
          <div class=\"font-semibold\">${m.name}</div>
          <div class=\"text-xs text-gray-500\">${m.role}${m.field ? ' • ' + m.field : ''}</div>
          <div class=\"mt-3 flex gap-2 text-xs\">
            <button class=\"px-2 py-1 rounded-full border\" data-action=\"member-edit\" data-id=\"${m.id}\">Ubah</button>
            <button class=\"px-2 py-1 rounded-full border border-red-200 text-red-600\" data-action=\"member-del\" data-id=\"${m.id}\">Hapus</button>
          </div>
        </div>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderDashMembers);

  // Extend member CRUD to handle full fields if inputs are present
  (function extendMemberCrud() {
    const form = document.getElementById('form-member');
    if (!form) return;
    // Hook existing submit to include more fields
    form.addEventListener('submit', (e) => {
      // handled in initMemberCrud; we augment values via DOM presence
    }, { once: false });
    // Patch edit button behavior by delegating additional fields fill inside existing handler via MutationObserver is overkill; instead rely on presence checks in submit below
  })();

  // News: render grid from store
  function renderDashNews() {
    qsa('[data-news-grid]').forEach(root => {
      const data = store.get('news', []);
      root.innerHTML = data.map(n => `
        <div class=\"p-4 rounded-xl bg-white border\">
          <img class=\"w-full h-36 object-cover rounded-lg\" src=\"${n.image||''}\" alt=\"cover\" />
          <div class=\"text-xs text-gray-500 mt-3\">${n.category} • ${new Date(n.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})} • ${n.author||''}</div>
          <div class=\"font-semibold mt-1\">${n.title}</div>
          <div class=\"text-sm text-gray-600 mt-1 line-clamp-2\">${n.info||''}</div>
          <div class=\"mt-3 flex gap-2 text-xs\">
            <button class=\"px-2 py-1 rounded-full border\" data-action=\"news-edit\" data-id=\"${n.id}\">Edit</button>
            <button class=\"px-2 py-1 rounded-full border border-red-200 text-red-600\" data-action=\"news-del\" data-id=\"${n.id}\">Hapus</button>
          </div>
        </div>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderDashNews);

  function initNewsCrud() {
    const modal = qs('#modal-news');
    const form = qs('#form-news');
    if (!form || !modal) return;
    let editingId = null;
    function open() { openModal('#modal-news'); }
    function reset() { form.reset(); editingId = null; qs('#news-modal-title').textContent = 'Tambah Berita/Agenda'; }
    qsa('[data-action="news-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="news-edit"]');
      const del = e.target.closest('[data-action="news-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('news', []); const n = data.find(x=>x.id===id); if (!n) return;
        editingId = id; qs('#news-title').value = n.title; qs('#news-category').value = n.category; qs('#news-date').value = n.date; if(qs('#news-author')) qs('#news-author').value = n.author||''; if(qs('#news-image')) qs('#news-image').value = n.image||''; if(qs('#news-info')) qs('#news-info').value = n.info||''; qs('#news-modal-title').textContent = 'Ubah Berita/Agenda'; open();
      }
      if (del) {
        const id = del.dataset.id;
        const data = store.get('news', []); store.set('news', data.filter(x=>x.id!==id)); renderDashNews();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = qs('#news-title').value.trim();
      const category = qs('#news-category').value;
      const date = qs('#news-date').value || new Date().toISOString().slice(0,10);
      const author = qs('#news-author')?.value.trim() || '';
      const image = qs('#news-image')?.value.trim() || '';
      const info = qs('#news-info')?.value.trim() || '';
      if (!title) { qs('#news-title').classList.add('ring-2','ring-red-300'); return; }
      const data = store.get('news', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], title, category, date, author, image, info };
        store.set('news', data);
      } else {
        data.push({ id: 'n'+Math.random().toString(36).slice(2,8), title, category, date, author, image, info }); store.set('news', data);
      }
      closeModal('#modal-news'); renderDashNews();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initNewsCrud);

  // Dashboard: Publications CRUD
  function renderDashPubs() {
    qsa('[data-pub-table]').forEach(tbody => {
      const pubs = store.get('pubs', []);
      tbody.innerHTML = pubs.map(p => `
        <tr class=\"border-t\"><td class=\"p-3\">${p.title}<div class=\"text-xs text-gray-500\">${p.authors||''}</div></td><td class=\"p-3\">${p.type}</td><td class=\"p-3\">${p.year}<div class=\"text-xs text-gray-500\">${p.uploadDate||''}</div></td><td class=\"p-3 text-right space-x-2\"><a class=\"px-2 py-1 rounded-full border\" href=\"${p.link||'#'}\" target=\"_blank\">Link</a><button class=\"px-2 py-1 rounded-full border\" data-action=\"pub-edit\" data-id=\"${p.id}\">Edit</button><button class=\"px-2 py-1 rounded-full border border-red-200 text-red-600\" data-action=\"pub-del\" data-id=\"${p.id}\">Hapus</button></td></tr>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderDashPubs);

  function initPubCrud() {
    const modal = qs('#modal-pub');
    const form = qs('#form-pub');
    if (!form || !modal) return;
    let editingId = null;
    function open() { openModal('#modal-pub'); }
    function reset() { form.reset(); editingId = null; qs('#pub-modal-title').textContent = 'Tambah Publikasi'; }
    qsa('[data-action="pub-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="pub-edit"]');
      const del = e.target.closest('[data-action="pub-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('pubs', []); const p = data.find(x=>x.id===id); if (!p) return;
        editingId = id; qs('#pub-title').value = p.title; qs('#pub-type').value = p.type; qs('#pub-year').value = p.year; qs('#pub-authors').value = p.authors||''; qs('#pub-upload').value = p.uploadDate||''; qs('#pub-link').value = p.link||''; qs('#pub-modal-title').textContent = 'Ubah Publikasi'; open();
      }
      if (del) {
        const id = del.dataset.id;
        const data = store.get('pubs', []); store.set('pubs', data.filter(x=>x.id!==id)); renderDashPubs();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = qs('#pub-title').value.trim();
      const type = qs('#pub-type').value;
      const year = parseInt(qs('#pub-year').value || '0', 10) || new Date().getFullYear();
      const authors = qs('#pub-authors').value.trim();
      const uploadDate = qs('#pub-upload').value.trim();
      const link = qs('#pub-link').value.trim();
      if (!title) { qs('#pub-title').classList.add('ring-2','ring-red-300'); return; }
      const data = store.get('pubs', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], title, type, year, authors, uploadDate, link };
        store.set('pubs', data);
      } else {
        data.push({ id: 'p'+Math.random().toString(36).slice(2,8), title, type, year, authors, uploadDate, link }); store.set('pubs', data);
      }
      closeModal('#modal-pub'); renderDashPubs();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initPubCrud);

  // Admin: Users CRUD
  function renderUsers() {
    qsa('[data-users-table]').forEach(tbody => {
      const users = store.get('users', []);
      tbody.innerHTML = users.map(u => `
        <tr class=\"border-t\"><td class=\"p-3\">${u.name}</td><td class=\"p-3\">${u.email}</td><td class=\"p-3\"><span class=\"px-2 py-1 rounded-full ${u.role==='Editor'?'bg-[#E6F8FD] text-[#00A0D6]':'bg-[#E9F7EE] text-[#6AC259]'}\">${u.role}</span></td><td class=\"p-3 text-right space-x-2\"><button class=\"px-2 py-1 rounded-full border\" data-action=\"user-edit\" data-id=\"${u.id}\">Ubah</button><button class=\"px-2 py-1 rounded-full border border-red-200 text-red-600\" data-action=\"user-del\" data-id=\"${u.id}\">Hapus</button></td></tr>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderUsers);

  function initUserCrud() {
    const modal = qs('#modal-user');
    const form = qs('#form-user');
    if (!form || !modal) return;
    let editingId = null;
    function open() { openModal('#modal-user'); }
    function reset() { form.reset(); editingId = null; qs('#user-modal-title').textContent = 'Tambah Pengguna'; }
    qsa('[data-action="user-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="user-edit"]');
      const del = e.target.closest('[data-action="user-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('users', []); const u = data.find(x=>x.id===id); if (!u) return;
        editingId = id; qs('#user-name').value = u.name; qs('#user-email').value = u.email; qs('#user-role').value = u.role; qs('#user-modal-title').textContent = 'Ubah Pengguna'; open();
      }
      if (del) {
        const id = del.dataset.id; const data = store.get('users', []); store.set('users', data.filter(x=>x.id!==id)); renderUsers();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#user-name').value.trim();
      const email = qs('#user-email').value.trim();
      const role = qs('#user-role').value;
      if (!name || !email) { return; }
      const data = store.get('users', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], name, email, role };
        store.set('users', data);
      } else {
        data.push({ id: 'u'+Math.random().toString(36).slice(2,8), name, email, role }); store.set('users', data);
      }
      closeModal('#modal-user'); renderUsers();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initUserCrud);

  // Facilities CRUD (Admin)
  function renderFacilities() {
    qsa('[data-fac-grid]').forEach(root => {
      const facs = store.get('facilities', []);
      root.innerHTML = facs.map(f => `
        <div class=\"group rounded-xl overflow-hidden border bg-white\">
          <img class=\"h-40 w-full object-cover\" src=\"${f.photo||''}\" alt=\"${f.name}\" />
          <div class=\"p-4\">
            <div class=\"font-semibold\">${f.name}</div>
            <div class=\"text-sm text-gray-600\">${f.desc||''}</div>
            <div class=\"mt-3 flex gap-2 text-xs\">
              <button class=\"px-2 py-1 rounded-full border\" data-action=\"fac-edit\" data-id=\"${f.id}\">Ubah</button>
              <button class=\"px-2 py-1 rounded-full border border-red-200 text-red-600\" data-action=\"fac-del\" data-id=\"${f.id}\">Hapus</button>
            </div>
          </div>
        </div>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderFacilities);

  function initFacilitiesCrud() {
    const modal = qs('#modal-fac');
    const form = qs('#form-fac');
    if (!modal || !form) return;
    let editingId = null;
    function open() { openModal('#modal-fac'); }
    function reset() { form.reset(); editingId = null; qs('#fac-modal-title').textContent = 'Tambah Fasilitas'; }
    qsa('[data-action="fac-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="fac-edit"]');
      const del = e.target.closest('[data-action="fac-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('facilities', []); const f = data.find(x=>x.id===id); if (!f) return;
        editingId = id; qs('#fac-name').value = f.name; qs('#fac-desc').value = f.desc||''; qs('#fac-photo').value = f.photo||''; qs('#fac-modal-title').textContent = 'Ubah Fasilitas'; open();
      }
      if (del) {
        const id = del.dataset.id; const data = store.get('facilities', []); store.set('facilities', data.filter(x=>x.id!==id)); renderFacilities();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#fac-name').value.trim();
      const desc = qs('#fac-desc').value.trim();
      const photo = qs('#fac-photo').value.trim();
      if (!name) return;
      const data = store.get('facilities', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], name, desc, photo };
        store.set('facilities', data);
      } else {
        data.push({ id: 'f'+Math.random().toString(36).slice(2,8), name, desc, photo }); store.set('facilities', data);
      }
      closeModal('#modal-fac'); renderFacilities();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initFacilitiesCrud);

  // Agenda CRUD
  function renderAgenda() {
    qsa('[data-agenda-grid]').forEach(root => {
      const data = store.get('agenda', []);
      root.innerHTML = data.map(a => `
        <div class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition flex flex-col">
          <div class="p-5 flex-1">
            <div class="text-xs text-gray-500">${new Date(a.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</div>
            <div class="mt-1 font-semibold">${a.name}</div>
            <p class="mt-2 text-sm text-gray-600">${a.desc||''}</p>
          </div>
          <div class="px-5 pb-5 flex gap-2 text-xs">
            <button class="px-2 py-1 rounded-full border" data-action="agenda-edit" data-id="${a.id}">Edit</button>
            <button class="px-2 py-1 rounded-full border border-red-200 text-red-600" data-action="agenda-del" data-id="${a.id}">Hapus</button>
          </div>
        </div>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderAgenda);

  function initAgendaCrud() {
    const modal = qs('#modal-agenda');
    const form = qs('#form-agenda');
    if (!form || !modal) return;
    let editingId = null;
    function open() { openModal('#modal-agenda'); }
    function reset() { form.reset(); editingId = null; qs('#agenda-modal-title').textContent = 'Tambah Agenda'; }
    qsa('[data-action="agenda-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="agenda-edit"]');
      const del = e.target.closest('[data-action="agenda-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('agenda', []); const a = data.find(x=>x.id===id); if (!a) return;
        editingId = id; qs('#agenda-name').value = a.name; qs('#agenda-date').value = a.date; qs('#agenda-link').value = a.link||''; if(qs('#agenda-desc')) qs('#agenda-desc').value = a.desc||''; qs('#agenda-modal-title').textContent = 'Ubah Agenda'; open();
      }
      if (del) {
        const id = del.dataset.id;
        const data = store.get('agenda', []); store.set('agenda', data.filter(x=>x.id!==id)); renderAgenda();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#agenda-name').value.trim();
      const date = qs('#agenda-date').value || new Date().toISOString().slice(0,10);
      const link = qs('#agenda-link').value.trim();
      const desc = qs('#agenda-desc')?.value.trim() || '';
      if (!name) { qs('#agenda-name').classList.add('ring-2','ring-red-300'); return; }
      const data = store.get('agenda', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], name, date, link, desc };
        store.set('agenda', data);
      } else {
        data.push({ id: 'a'+Math.random().toString(36).slice(2,8), name, date, link, desc }); store.set('agenda', data);
      }
      closeModal('#modal-agenda'); renderAgenda();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initAgendaCrud);

  // Gallery CRUD
  function renderGallery() {
    qsa('[data-gallery-grid]').forEach(root => {
      const data = store.get('gallery', []);
      root.innerHTML = data.map(g => `
        <div class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:scale-[1.02] transition">
          <img class="h-40 w-full object-cover" src="${g.photo||''}" alt="${g.name}" />
          <div class="p-4">
            <div class="font-semibold text-sm">${g.name}</div>
            <div class="text-xs text-gray-600 mt-1">${g.desc||''}</div>
            <div class="text-xs text-gray-500 mt-2">${g.type}${g.agenda ? ' • '+g.agenda : ''}</div>
            <div class="mt-3 flex gap-2 text-xs">
              <button class="px-2 py-1 rounded-full border" data-action="gallery-edit" data-id="${g.id}">Edit</button>
              <button class="px-2 py-1 rounded-full border border-red-200 text-red-600" data-action="gallery-del" data-id="${g.id}">Hapus</button>
            </div>
          </div>
        </div>`).join('');
    });
  }
  document.addEventListener('DOMContentLoaded', renderGallery);

  function initGalleryCrud() {
    const modal = qs('#modal-gallery');
    const form = qs('#form-gallery');
    if (!form || !modal) return;
    let editingId = null;
    function open() { openModal('#modal-gallery'); }
    function reset() { form.reset(); editingId = null; qs('#gallery-modal-title').textContent = 'Tambah Foto Galeri'; }
    qsa('[data-action="gallery-add"]').forEach(btn => btn.addEventListener('click', () => { reset(); open(); }));
    document.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-action="gallery-edit"]');
      const del = e.target.closest('[data-action="gallery-del"]');
      if (edit) {
        const id = edit.dataset.id; const data = store.get('gallery', []); const g = data.find(x=>x.id===id); if (!g) return;
        editingId = id; qs('#gallery-name').value = g.name; qs('#gallery-photo').value = g.photo||''; qs('#gallery-desc').value = g.desc||''; qs('#gallery-type').value = g.type||'Galeri Foto'; if(qs('#gallery-agenda')) qs('#gallery-agenda').value = g.agenda||''; qs('#gallery-modal-title').textContent = 'Ubah Foto Galeri'; open();
      }
      if (del) {
        const id = del.dataset.id;
        const data = store.get('gallery', []); store.set('gallery', data.filter(x=>x.id!==id)); renderGallery();
        showToast('Item dihapus');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#gallery-name').value.trim();
      const photo = qs('#gallery-photo').value.trim();
      const desc = qs('#gallery-desc').value.trim();
      const type = qs('#gallery-type').value;
      const agenda = qs('#gallery-agenda')?.value.trim() || '';
      if (!name) { qs('#gallery-name').classList.add('ring-2','ring-red-300'); return; }
      const data = store.get('gallery', []);
      if (editingId) {
        const i = data.findIndex(x=>x.id===editingId); if (i>-1) data[i] = { ...data[i], name, photo, desc, type, agenda };
        store.set('gallery', data);
      } else {
        data.push({ id: 'g'+Math.random().toString(36).slice(2,8), name, photo, desc, type, agenda }); store.set('gallery', data);
      }
      closeModal('#modal-gallery'); renderGallery();
      showToast('Berhasil disimpan');
    });
  }
  document.addEventListener('DOMContentLoaded', initGalleryCrud);

})();
