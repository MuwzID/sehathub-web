import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tentang from './components/Tentang';
import Footer from './components/Footer';
import { STORAGE_KEYS, INITIAL_FASKES } from './utils/data';
import Chatbot from './components/Chatbot';
import CekAntrean from './components/CekAntrean';
import Panduan from './components/Panduan';
import PetaSebaran from './components/PetaSebaran';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)); } catch { return null; }
  });
  
  const [modalState, setModalState] = useState({ type: null, data: null, userLocation: null });
  const [toastMessage, setToastMessage] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot', 'admin'
  const [isLocating, setIsLocating] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [transportMode, setTransportMode] = useState('motor');

  // State Pencarian & Filter Faskes (Halaman Warga)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showAllFaskes, setShowAllFaskes] = useState(false);

  // State Khusus Panel Kontrol Administrator
  const [adminTab, setAdminTab] = useState('antrean'); // 'antrean', 'warga', 'faskes'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('Semua');

  const showToast = (title, desc) => { 
    setToastMessage({ title, desc }); 
    setTimeout(() => setToastMessage(null), 3500); 
  };

  // Fungsi Suara Panggilan Loket Admin (Bell + Web Speech API)
  const panggilPasien = (booking) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const teks = `Panggilan antrean nomor ${booking.nomor.replace('-', ' ')}, atas nama ${booking.userName}, silakan menuju ${booking.poli || 'Poli Layanan'} di ${booking.faskesNama}.`;
      const utterance = new SpeechSynthesisUtterance(teks);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      setTimeout(() => window.speechSynthesis.speak(utterance), 500);
    }
    showToast('Memanggil Pasien 🔊', `Nomor ${booking.nomor} (${booking.userName}) sedang dipanggil ke loket.`);
  };

  // Fungsi Export CSV Data Antrean untuk Admin
  const handleExportCSV = (bookings) => {
    if (!bookings.length) {
      showToast('Data Kosong', 'Belum ada data antrean untuk diunduh.');
      return;
    }
    const headers = ['Kode Booking,Nama Warga,NIK,Fasilitas Kesehatan,Poli,Nomor Antrean,Waktu Kunjungan,Status'];
    const rows = bookings.map(b => 
      `${b.kode},"${b.userName}",${b.nik || '-'},"${b.faskesNama}","${b.poli || 'Poli Umum'}",${b.nomor},"${b.waktu}",${b.status || 'Menunggu'}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Antrean_SehatHub_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Diunduh', 'File CSV data antrean berhasil disimpan!');
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    if (authMode === 'admin') {
      const password = e.target.password.value;
      if (email === 'admin@sehathub.id' && password === 'admin123') {
        const adminUser = { name: 'Administrator SehatHub', email: 'admin@sehathub.id', role: 'admin' };
        setUser(adminUser);
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(adminUser));
        showToast('Login Admin Berhasil', 'Selamat datang di Panel Kontrol Utama!');
      } else {
        showToast('Gagal Masuk Admin', 'Email atau password admin salah! (Gunakan admin@sehathub.id / admin123)');
      }
    } else if (authMode === 'login') {
      const password = e.target.password.value;
      const foundUser = savedUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(foundUser));
        setModalState({ type: null, userLocation: null });
        showToast('Berhasil Masuk', `Selamat datang kembali, ${foundUser.name}!`);
      } else {
        showToast('Gagal Masuk', 'Email atau password salah. Coba lagi!');
      }
    } else if (authMode === 'register') {
      const password = e.target.password.value;
      const name = e.target.fullName.value;
      const userExists = savedUsers.find(u => u.email === email);
      if (userExists) {
        showToast('Gagal Daftar', 'Email ini sudah terdaftar!');
        return;
      }
      const newUser = { name, email, password, role: 'user', joinedAt: new Date().toLocaleDateString('id-ID') };
      savedUsers.push(newUser);
      localStorage.setItem('sehathub_users', JSON.stringify(savedUsers));
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(newUser));
      setModalState({ type: null, userLocation: null });
      showToast('Pendaftaran Berhasil', `Akun ${name} siap digunakan!`);
    } else if (authMode === 'forgot') {
      const newPassword = e.target.newPassword.value;
      const userIndex = savedUsers.findIndex(u => u.email === email);
      if (userIndex !== -1) {
        savedUsers[userIndex].password = newPassword; 
        localStorage.setItem('sehathub_users', JSON.stringify(savedUsers));
        showToast('Berhasil', 'Password berhasil direset. Silakan masuk!');
        setAuthMode('login'); 
      } else {
        showToast('Gagal', 'Email tidak ditemukan di sistem kami!');
      }
    }
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem(STORAGE_KEYS.currentUser); 
    showToast('Keluar', 'Anda telah keluar.'); 
  };

  const handleBooking = (e) => {
    e.preventDefault();
    const tanggal = e.target.tanggal.value;
    const waktu = e.target.waktu.value; 
    const nik = e.target.nik ? e.target.nik.value : '-';
    const poli = e.target.poli ? e.target.poli.value : 'Poli Umum';
    
    const randomCode = 'SH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const nomorUrut = 'A-' + Math.floor(Math.random() * 20 + 10);

    const bookingData = {
      kode: randomCode,
      userName: user?.name || 'Warga Publik',
      nik: nik,
      poli: poli,
      faskesNama: modalState.data?.name || 'Fasilitas Kesehatan',
      nomor: nomorUrut,
      waktu: `${tanggal} (${waktu})`,
      status: 'Menunggu'
    };
    
    localStorage.setItem('sehathub_last_booking', JSON.stringify(bookingData));
    const allBookings = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
    allBookings.push(bookingData);
    localStorage.setItem('sehathub_all_bookings', JSON.stringify(allBookings));

    const playSuccessSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (err) {}
    };
    
    playSuccessSound();
    showToast('Antrean Berhasil!', `Kode Booking: ${randomCode}`);
    setModalState({ type: 'ticket', data: bookingData, userLocation: null });
  };

  const hitungJarakRealTime = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '0.00';
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const hitungEstimasiWaktu = (jarakKm, mode) => {
    const speedMap = { motor: 40, mobil: 30, jalan: 5 };
    const speed = speedMap[mode] || 40;
    const menit = Math.round((parseFloat(jarakKm) / speed) * 60);
    if (menit < 1) return '< 1 Menit';
    if (menit >= 60) {
      const jam = Math.floor(menit / 60);
      const sisaMenit = menit % 60;
      return `${jam} Jam ${sisaMenit} Menit`;
    }
    return `${menit} Menit`;
  };

  const handleCekRute = () => {
    if (!navigator.geolocation) {
      showToast('GPS Error', 'Perangkat Anda tidak mendukung pelacakan lokasi.');
      return;
    }
    setIsLocating(true);
    showToast('Satelit Menghubungkan', 'Melacak koordinat posisi Anda...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setModalState(prev => ({
          ...prev,
          userLocation: { lat: position.coords.latitude, lng: position.coords.longitude }
        }));
        showToast('Kalkulasi Selesai', 'Rute GPS & Estimasi Waktu Berhasil Dihitung!');
      },
      (error) => {
        setIsLocating(false);
        showToast('Akses Ditolak', 'Gagal mendapatkan lokasi. Pastikan GPS aktif.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Filter Faskes (Halaman Warga)
  const filteredFaskesList = INITIAL_FASKES.filter(f => {
    const matchCategory = selectedCategory === 'Semua' || f.type === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(q) || 
                        (f.city && f.city.toLowerCase().includes(q)) ||
                        (f.services && f.services.some(s => s.toLowerCase().includes(q)));
    return matchCategory && matchSearch;
  });

  const displayedFaskes = (showAllFaskes || searchQuery || selectedCategory !== 'Semua') 
    ? filteredFaskesList 
    : filteredFaskesList.slice(0, 6);

  // --- JIKA BELUM LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex bg-slate-50 font-sans relative overflow-hidden">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
            <i className="fa-solid fa-circle-check text-orange-500 text-xl"></i>
            <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
          </div>
        )}

        {/* BANNER KIRI */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-amber-500 relative items-center justify-center p-12 overflow-hidden shadow-2xl z-10">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 text-white max-w-lg">
            <img src="/logo-sehathub.svg" alt="Logo SehatHub" className="h-14 md:h-16 w-auto object-contain mb-10 brightness-0 invert drop-shadow-lg" />
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              Akses Layanan Kesehatan Publik Lebih Cepat.
            </h1>
            <p className="text-orange-50 text-lg mb-10 leading-relaxed opacity-90">
              Platform modern untuk mencari fasilitas kesehatan, memantau rute satelit GPS, dan mengambil nomor antrean secara <i>real-time</i>.
            </p>
            
            <div className="space-y-5 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="font-semibold text-lg">Integrasi Data Faskes & Poli Layanan</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="font-semibold text-lg">E-Ticket Digital & Live Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM KANAN */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-slate-50">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-200/60 p-8 md:p-10 relative border border-slate-100 z-20">
            
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold text-orange-500 tracking-tight mb-3">SehatHub</h2>
              <h3 className="font-bold text-xl text-slate-800 flex items-center justify-center gap-2 mt-4">
                {authMode === 'login' && <><i className="fa-solid fa-circle-user text-orange-500"></i> Masuk Akun</>}
                {authMode === 'register' && <><i className="fa-solid fa-user-plus text-orange-500"></i> Daftar Akun</>}
                {authMode === 'admin' && <><i className="fa-solid fa-user-shield text-indigo-600"></i> Portal Login Admin</>}
                {authMode === 'forgot' && <><i className="fa-solid fa-unlock-keyhole text-orange-500"></i> Reset Password</>}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {authMode === 'admin' 
                  ? 'Masuk khusus pengelola faskes & sistem.' 
                  : authMode === 'forgot'
                  ? 'Masukkan email terdaftar dan buat password baru Anda.'
                  : 'Silakan masuk atau daftar.'}
              </p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Nama Lengkap</label>
                  <input name="fullName" type="text" placeholder="Masukkan nama..." required className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all" />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <input name="email" type="email" placeholder={authMode === 'admin' ? 'admin@sehathub.id' : 'contoh@sehathub.id'} required className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl pl-4 pr-10 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all" />
                  <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                </div>
              </div>
              
              {authMode !== 'forgot' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                      >
                        Lupa Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder={authMode === 'admin' ? 'admin123' : 'Masukkan password...'} required className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 p-2">
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Password Baru</label>
                  <div className="relative">
                    <input name="newPassword" type={showPassword ? "text" : "password"} placeholder="Masukkan password baru..." required minLength="6" className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 p-2">
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className={`w-full mt-6 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 ${authMode === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 shadow-orange-500/30'}`}>
                {authMode === 'login' && 'Masuk Sekarang'}
                {authMode === 'register' && 'Daftar Sekarang'}
                {authMode === 'admin' && 'Masuk Panel Admin'}
                {authMode === 'forgot' && 'Simpan Password Baru'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
            
            <div className="mt-8 text-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
              {authMode === 'login' && (
                <>
                  <p className="text-sm font-medium text-slate-600">
                    Belum punya akun? <button onClick={() => setAuthMode('register')} className="font-extrabold text-orange-500 hover:underline">Daftar di sini</button>
                  </p>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <button onClick={() => setAuthMode('admin')} className="text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1.5 mx-auto">
                      <i className="fa-solid fa-user-shield"></i> Masuk sebagai Admin / Pengelola Faskes
                    </button>
                  </div>
                </>
              )}
              {authMode === 'admin' && (
                <p className="text-sm font-medium text-slate-600">
                  Kembali ke login warga? <button onClick={() => setAuthMode('login')} className="font-extrabold text-orange-500 hover:underline">Masuk Warga</button>
                </p>
              )}
              {(authMode === 'register' || authMode === 'forgot') && (
                <p className="text-sm font-medium text-slate-600">
                  Sudah ingat / punya akun? <button onClick={() => setAuthMode('login')} className="font-extrabold text-orange-500 hover:underline">Masuk di sini</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- JIKA LOGIN SEBAGAI ADMIN (COMMAND CENTER ADMINISTRATOR) ---
  if (user.role === 'admin') {
    const allBookings = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
    const registeredUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    const countMenunggu = allBookings.filter(b => !b.status || b.status === 'Menunggu').length;
    const countDisetujui = allBookings.filter(b => b.status === 'Disetujui').length;
    const countSelesai = allBookings.filter(b => b.status === 'Selesai').length;
    const persenTerkonfirmasi = allBookings.length > 0 
      ? Math.round(((countDisetujui + countSelesai) / allBookings.length) * 100) 
      : 0;

    // Filter Tabel Antrean di Panel Admin
    const filteredBookings = allBookings.filter(b => {
      const currentStatus = b.status || 'Menunggu';
      const matchStatus = adminStatusFilter === 'Semua' || currentStatus === adminStatusFilter;
      const q = adminSearch.toLowerCase();
      const matchQuery = b.kode.toLowerCase().includes(q) ||
                         b.userName.toLowerCase().includes(q) ||
                         b.faskesNama.toLowerCase().includes(q) ||
                         (b.nik && b.nik.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });

    // Fungsi Generate Data Simulasi untuk Demo Juri
    const tambahDataSimulasi = () => {
      const sampleData = [
        { kode: 'SH-8K2M', userName: 'Budi Santoso', nik: '3302140901980001', poli: 'Poli Umum', faskesNama: 'Puskesmas Purwokerto Selatan', nomor: 'A-12', waktu: '2026-10-20 (Pagi)', status: 'Disetujui' },
        { kode: 'SH-4P9L', userName: 'Siti Aminah', nik: '3302254405010002', poli: 'Poli Anak', faskesNama: 'RSUD Prof. Dr. Margono Soekarjo', nomor: 'A-15', waktu: '2026-10-20 (Pagi)', status: 'Menunggu' },
        { kode: 'SH-7N3Q', userName: 'Rizky Pratama', nik: '3302191211030004', poli: 'Poli Gigi', faskesNama: 'Klinik Pratama UMP Purwokerto', nomor: 'A-08', waktu: '2026-10-20 (Sore)', status: 'Selesai' }
      ];
      const combined = [...allBookings, ...sampleData];
      localStorage.setItem('sehathub_all_bookings', JSON.stringify(combined));
      setUser({ ...user });
      showToast('Data Simulasi Ditambahkan', '3 antrean warga contoh berhasil dimasukkan ke tabel!');
    };

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-16">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-white border-l-4 border-indigo-600 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
            <i className="fa-solid fa-circle-check text-indigo-600 text-xl"></i>
            <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
          </div>
        )}

        {/* HEADER TOPBAR ADMIN */}
        <header className="bg-slate-900 text-white shadow-lg border-b-4 border-indigo-500 py-4 px-6 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                <i className="fa-solid fa-user-shield text-xl"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg tracking-wide">Panel Kontrol Administrator</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                  </span>
                </div>
                <p className="text-xs text-slate-400">Pusat Kendali Antrean Medis, Verifikasi Pasien & Jaringan Faskes SehatHub</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Navigasi Tab Admin */}
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex gap-1">
                <button
                  onClick={() => setAdminTab('antrean')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    adminTab === 'antrean' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-ticket"></i> Antrean ({allBookings.length})
                </button>
                <button
                  onClick={() => setAdminTab('warga')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    adminTab === 'warga' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-users"></i> Akun Warga ({registeredUsers.length})
                </button>
                <button
                  onClick={() => setAdminTab('faskes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    adminTab === 'faskes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-hospital"></i> Faskes ({INITIAL_FASKES.length})
                </button>
              </div>

              <button onClick={handleLogout} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                Keluar <i className="fa-solid fa-right-from-bracket ml-1"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* 4 KARTU STATISTIK REAL-TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Antrean Masuk</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{allBookings.length} <span className="text-xs font-medium text-slate-400">Pasien</span></h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Menunggu Konfirmasi</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{countMenunggu} <span className="text-xs font-medium text-slate-400">Antrean</span></h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Disetujui / Selesai</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{countDisetujui + countSelesai} <span className="text-xs font-medium text-slate-400">({persenTerkonfirmasi}%)</span></h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Warga & Mitra Faskes</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{registeredUsers.length} <span className="text-xs font-medium text-slate-400">Akun / {INITIAL_FASKES.length} Faskes</span></h3>
              </div>
            </div>
          </div>

          {/* BAR PROGRESS KINERJA PELAYANAN */}
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600"><i className="fa-solid fa-chart-line text-indigo-600 mr-1.5"></i> Persentase Verifikasi & Pelayanan Pasien Hari Ini</span>
                <span className="text-indigo-600">{persenTerkonfirmasi}% Terlayani</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${persenTerkonfirmasi}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={tambahDataSimulasi}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> + Data Simulasi
              </button>
              <button
                onClick={() => handleExportCSV(allBookings)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-file-csv"></i> Export CSV
              </button>
              {allBookings.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin mengosongkan seluruh data antrean?')) {
                      localStorage.removeItem('sehathub_all_bookings');
                      localStorage.removeItem('sehathub_last_booking');
                      setUser({ ...user });
                      showToast('Reset Berhasil', 'Seluruh data antrean telah dibersihkan.');
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-trash-can"></i> Reset Semua
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: MANAJEMEN ANTREAN WARGA */}
          {adminTab === 'antrean' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-indigo-600"></i> Data Antrean Warga Real-Time
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Klik tombol status untuk mengubah verifikasi, atau klik ikon speaker untuk memanggil pasien ke loket.</p>
                </div>

                {/* Filter & Search Bar Admin */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Cari Kode, Nama, NIK..."
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500 w-full sm:w-56"
                    />
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                    {['Semua', 'Menunggu', 'Disetujui', 'Selesai'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAdminStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          adminStatusFilter === st ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <i className="fa-solid fa-inbox text-3xl text-slate-300 mb-2"></i>
                  <p className="text-sm font-bold text-slate-600">Tidak ada data antrean yang sesuai.</p>
                  <p className="text-xs text-slate-400 mt-1">Klik tombol "+ Data Simulasi" di atas jika ingin menampilkan contoh data antrean instan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase bg-slate-50/70">
                        <th className="py-3.5 px-4 rounded-tl-xl">Kode Booking</th>
                        <th className="py-3.5 px-4">Pasien & NIK</th>
                        <th className="py-3.5 px-4">Faskes & Poli Tujuan</th>
                        <th className="py-3.5 px-4">Nomor Loket</th>
                        <th className="py-3.5 px-4">Jadwal Kunjungan</th>
                        <th className="py-3.5 px-4">Status Verifikasi</th>
                        <th className="py-3.5 px-4 text-center rounded-tr-xl">Aksi Loket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => {
                        const realIdx = allBookings.findIndex(item => item.kode === b.kode);
                        return (
                          <tr key={b.kode} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-extrabold text-orange-600">{b.kode}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800 block">{b.userName}</span>
                              <span className="text-[11px] text-slate-400 font-mono">NIK: {b.nik || '-'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-700 block">{b.faskesNama}</span>
                              <span className="text-[11px] text-indigo-600 font-bold">{b.poli || 'Poli Umum'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-slate-900 text-white font-extrabold px-2.5 py-1 rounded-lg text-xs">{b.nomor}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">{b.waktu}</td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => {
                                  const updatedBookings = [...allBookings];
                                  const curr = updatedBookings[realIdx].status || 'Menunggu';
                                  const nextStatus = curr === 'Menunggu' ? 'Disetujui' : curr === 'Disetujui' ? 'Selesai' : 'Menunggu';
                                  updatedBookings[realIdx].status = nextStatus;
                                  localStorage.setItem('sehathub_all_bookings', JSON.stringify(updatedBookings));

                                  try {
                                    const lastB = JSON.parse(localStorage.getItem('sehathub_last_booking'));
                                    if (lastB && lastB.kode === b.kode) {
                                      lastB.status = nextStatus;
                                      localStorage.setItem('sehathub_last_booking', JSON.stringify(lastB));
                                    }
                                  } catch (err) {}

                                  setUser({ ...user }); 
                                  showToast('Status Diperbarui', `Antrean ${b.kode} diubah menjadi ${nextStatus}`);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                                  b.status === 'Disetujui' 
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300' 
                                    : b.status === 'Selesai'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                                }`}
                              >
                                <i className={`fa-solid ${
                                  b.status === 'Disetujui' ? 'fa-circle-check' : b.status === 'Selesai' ? 'fa-flag-checkered' : 'fa-clock'
                                }`}></i>
                                {b.status || 'Menunggu'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Tombol Panggil Suara Loket */}
                                <button
                                  onClick={() => panggilPasien(b)}
                                  className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 rounded-xl text-xs font-bold transition-all"
                                  title="Panggil Pasien dengan Suara"
                                >
                                  <i className="fa-solid fa-volume-high"></i>
                                </button>
                                {/* Tombol Setujui Cepat */}
                                {(!b.status || b.status === 'Menunggu') && (
                                  <button
                                    onClick={() => {
                                      const updated = [...allBookings];
                                      updated[realIdx].status = 'Disetujui';
                                      localStorage.setItem('sehathub_all_bookings', JSON.stringify(updated));
                                      setUser({ ...user });
                                      showToast('Antrean Disetujui', `Pasien ${b.userName} (${b.kode}) telah diverifikasi!`);
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white p-2 rounded-xl text-xs font-bold transition-all"
                                    title="Setujui Langsung"
                                  >
                                    <i className="fa-solid fa-check"></i>
                                  </button>
                                )}
                                {/* Tombol Hapus */}
                                <button
                                  onClick={() => {
                                    const updated = allBookings.filter((_, i) => i !== realIdx);
                                    localStorage.setItem('sehathub_all_bookings', JSON.stringify(updated));
                                    setUser({ ...user });
                                    showToast('Data Dihapus', `Antrean ${b.kode} telah dihapus.`);
                                  }}
                                  className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl text-xs transition-all"
                                  title="Hapus Antrean"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATA AKUN WARGA TERDAFTAR */}
          {adminTab === 'warga' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-users text-indigo-600"></i> Database Akun Warga Terdaftar
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Daftar warga yang telah membuat akun di portal SehatHub beserta total riwayat antreannya.</p>
                </div>
              </div>

              {registeredUsers.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Belum ada warga yang mendaftar akun.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase bg-slate-50">
                        <th className="py-3.5 px-4">No</th>
                        <th className="py-3.5 px-4">Nama Lengkap Warga</th>
                        <th className="py-3.5 px-4">Email Terdaftar</th>
                        <th className="py-3.5 px-4">Riwayat Antrean</th>
                        <th className="py-3.5 px-4">Status Akun</th>
                        <th className="py-3.5 px-4 text-center">Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registeredUsers.map((u, i) => {
                        const userBookingsCount = allBookings.filter(b => b.userName.toLowerCase() === u.name.toLowerCase()).length;
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-bold text-slate-400">#{i + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              {u.name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                            <td className="py-3.5 px-4">
                              <span className="bg-orange-50 text-orange-700 font-bold px-2.5 py-1 rounded-full text-xs">
                                {userBookingsCount} Kunjungan
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-xs">
                                Terverifikasi
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  const updatedUsers = registeredUsers.filter((_, idx) => idx !== i);
                                  localStorage.setItem('sehathub_users', JSON.stringify(updatedUsers));
                                  setUser({ ...user });
                                  showToast('Akun Dihapus', `Akun warga ${u.name} telah dihapus.`);
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                                title="Hapus Akun Warga"
                              >
                                <i className="fa-solid fa-user-xmark"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MONITOR JARINGAN FASKES */}
          {adminTab === 'faskes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-hospital text-indigo-600"></i> Monitor Kapasitas Fasilitas Kesehatan Terintegrasi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Pantau status operasional, jam layanan, dan jumlah pendaftar online di setiap fasilitas kesehatan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INITIAL_FASKES.map(f => {
                  const faskesBookings = allBookings.filter(b => b.faskesNama === f.name).length;
                  return (
                    <div key={f.id} className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            f.type === 'Rumah Sakit' ? 'bg-rose-100 text-rose-700' :
                            f.type === 'Klinik' ? 'bg-amber-100 text-amber-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>{f.type}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ● {f.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
                        <p className="text-xs text-slate-500 mt-1"><i className="fa-solid fa-location-dot text-slate-400 mr-1"></i> {f.city} • {f.hours}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Status Loket: <strong className="text-slate-700">{f.queueStatus}</strong></span>
                        <span className="bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full">
                          +{faskesBookings} Online
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- JIKA LOGIN SEBAGAI WARGA (DASHBOARD UTAMA SEHATHUB) ---
  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
          <i className="fa-solid fa-circle-check text-orange-500 text-xl"></i>
          <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
        </div>
      )}

      <Navbar user={user} onLogout={handleLogout} />
      <Hero />
      <Tentang />

      {/* SECTION DAFTAR FASKES DENGAN PENCARIAN, FILTER & BADGE POLI */}
      <section id="faskes" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Fasilitas Kesehatan Terdekat</h2>
            <p className="text-sm text-slate-500 mt-1">Cari berdasarkan nama faskes, kota, atau layanan poli (contoh: Poli Gigi, IGD).</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari faskes, kota, atau poli..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
              {['Semua', 'Puskesmas', 'Rumah Sakit', 'Klinik'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-orange-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {displayedFaskes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <i className="fa-solid fa-hospital-user text-4xl text-slate-300 mb-3"></i>
            <h4 className="font-bold text-slate-700">Fasilitas Kesehatan Tidak Ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian atau kategori filter yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFaskes.map(f => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col card-hover">
                <div className="h-40 relative overflow-hidden">
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    <i className="fa-solid fa-users text-orange-500 mr-1"></i> {f.queueStatus || 'Normal'}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                      f.type === 'Rumah Sakit' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                      f.type === 'Klinik' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      'bg-orange-50 border-orange-100 text-orange-700'
                    }`}>{f.type}</span>
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {f.city}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{f.name}</h3>
                  <p className="text-xs text-slate-500 mb-3"><i className="fa-solid fa-location-arrow mr-1 text-slate-400"></i> {f.distance} | {f.hours}</p>
                  
                  {f.services && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {f.services.map((srv, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {srv}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setModalState({ type: 'map', data: f, userLocation: null })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors"><i className="fa-solid fa-map-location-dot"></i> Peta</button>
                    <button onClick={() => setModalState({ type: 'booking', data: f, userLocation: null })} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md">
                      <i className="fa-solid fa-ticket"></i> Antrean
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searchQuery && selectedCategory === 'Semua' && INITIAL_FASKES.length > 6 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAllFaskes(!showAllFaskes)}
              className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm inline-flex items-center gap-2"
            >
              {showAllFaskes ? (
                <>Tampilkan Lebih Sedikit <i className="fa-solid fa-chevron-up text-xs"></i></>
              ) : (
                <>Lihat Semua Fasilitas Kesehatan ({INITIAL_FASKES.length}) <i className="fa-solid fa-chevron-down text-xs"></i></>
              )}
            </button>
          </div>
        )}
      </section>

      <PetaSebaran />
      <CekAntrean />
      <Panduan />
      <Chatbot />
      <Footer />

      {/* MODAL PETA & GPS */}
      {modalState.type === 'map' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-orange-500"></i>
                  {modalState.userLocation ? 'Radar Navigasi Pintar GPS' : 'Peta Lokasi Faskes'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{modalState.data?.name} — {modalState.data?.city || 'Jawa Tengah'}</p>
              </div>
              <button onClick={() => setModalState({ type: null, userLocation: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {!modalState.userLocation ? (
              <div className="w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden bg-slate-100 relative mb-5 border border-slate-200 shadow-inner">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(modalState.data?.name + ' ' + (modalState.data?.city || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full border-0" 
                  title="Peta Lokasi"
                ></iframe>
              </div>
            ) : (
              <div className="w-full rounded-2xl bg-slate-900 relative mb-5 border border-slate-800 overflow-hidden flex flex-col items-center text-white p-6 shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <i className="fa-solid fa-satellite-dish text-4xl text-orange-500 mb-3 animate-bounce"></i>
                <h4 className="font-bold text-xl mb-1 text-emerald-400">GPS Terkunci — Rute Terkalkulasi</h4>

                {(() => {
                  const jarakKm = hitungJarakRealTime(modalState.userLocation.lat, modalState.userLocation.lng, modalState.data.lat, modalState.data.lng);
                  const estimasiWaktu = hitungEstimasiWaktu(jarakKm, transportMode);

                  return (
                    <div className="w-full max-w-lg mb-6 z-10 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Jarak Real-Time</p>
                          <p className="text-2xl font-extrabold text-orange-400 mt-1">{jarakKm} <span className="text-sm font-semibold">KM</span></p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
                          <p className="text-[10px] text-emerald-300 uppercase font-bold">Estimasi Waktu</p>
                          <p className="text-2xl font-extrabold text-emerald-400 mt-1">~{estimasiWaktu}</p>
                        </div>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 font-bold pl-2">Moda:</span>
                        <div className="flex gap-1.5">
                          {['motor', 'mobil', 'jalan'].map(m => (
                            <button key={m} type="button" onClick={() => setTransportMode(m)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${transportMode === m ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg z-10">
                  <a 
                    href={`tel:${modalState.data?.phone || '119'}`}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-rose-400 px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-phone-volume"></i> Call Faskes ({modalState.data?.phone || '119'})
                  </a>
                  <button 
                    onClick={() => {
                      const destination = encodeURIComponent(modalState.data?.name + ' ' + (modalState.data?.city || ''));
                      window.open(`https://www.google.com/maps/dir/?api=1&origin=${modalState.userLocation.lat},${modalState.userLocation.lng}&destination=${destination}`, '_blank');
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    Buka Google Maps <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </button>
                </div>
              </div>
            )}

            {!modalState.userLocation && (
              <div className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">{modalState.data?.name}</p>
                  <p className="text-xs text-slate-500">Kontak: {modalState.data?.phone || '119'}</p>
                </div>
                <button onClick={handleCekRute} disabled={isLocating} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md">
                  {isLocating ? 'Menghubungkan...' : 'Lacak Posisi Saya'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL BOOKING DENGAN PILIHAN POLI LAYANAN */}
      {modalState.type === 'booking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-500 text-2xl"></i> Ambil Antrean
              </h3>
              <button onClick={() => setModalState({ type: null, userLocation: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="mb-5 bg-orange-50 p-3.5 rounded-2xl border border-orange-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fa-solid fa-hospital text-base"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider">Fasilitas Kesehatan Tujuan</p>
                <p className="text-sm font-extrabold text-slate-800 truncate">{modalState.data?.name}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Pilih Poli / Layanan Medis</label>
                <select name="poli" required className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-orange-500">
                  {(modalState.data?.services || ['Poli Umum', 'Poli Gigi', 'Farmasi']).map((srv, idx) => (
                    <option key={idx} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">NIK / Nomor Identitas</label>
                <input name="nik" type="text" placeholder="Masukkan 16 digit NIK..." required minLength="8" maxLength="16" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tanggal Kunjungan</label>
                <input name="tanggal" type="date" required className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 text-slate-700 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Sesi Waktu</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Pagi" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm">Pagi (08:00)</div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Sore" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm">Sore (15:00)</div>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2">
                Ambil Nomor Antrean <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL E-TICKET DIGITAL SETELAH BOOKING */}
      {modalState.type === 'ticket' && modalState.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden modal-animation border border-white/20">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center relative">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <h3 className="font-extrabold text-xl">E-Ticket Antrean Terbit!</h3>
              <p className="text-xs text-emerald-50 mt-1">Simpan atau salin kode booking di bawah ini</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kode Booking Anda</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-orange-500 tracking-wider">{modalState.data.kode}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(modalState.data.kode);
                      showToast('Kode Disalin!', `Kode ${modalState.data.kode} berhasil disalin ke clipboard.`);
                    }}
                    className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    <i className="fa-regular fa-copy"></i> Salin
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Nomor Urut Loket:</span>
                  <span className="font-extrabold text-slate-800 text-base">{modalState.data.nomor}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Nama Pasien:</span>
                  <span className="font-bold text-slate-700">{modalState.data.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Faskes Tujuan:</span>
                  <span className="font-bold text-slate-700 text-right max-w-[200px] truncate">{modalState.data.faskesNama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Poli Layanan:</span>
                  <span className="font-bold text-orange-600">{modalState.data.poli || 'Poli Umum'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Jadwal Kunjungan:</span>
                  <span className="font-bold text-slate-700">{modalState.data.waktu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Status Verifikasi:</span>
                  <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">{modalState.data.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState({ type: null, data: null, userLocation: null })}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({ type: null, data: null, userLocation: null });
                    document.getElementById('cek-antrean')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-magnifying-glass-chart"></i> Lacak Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}