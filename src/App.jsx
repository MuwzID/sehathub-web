import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tentang from './components/Tentang';
import Footer from './components/Footer';
import { STORAGE_KEYS, INITIAL_FASKES, PRESET_AVATARS, DEFAULT_WARGA_PROFILE } from './utils/data';
import {
  calculateHaversineDistance,
  calculateEstimatedTravelTime,
  calculateProfileCompletion,
  filterFaskes
} from './utils/healthUtils';
import Chatbot from './components/Chatbot';
import CekAntrean from './components/CekAntrean';
import Panduan from './components/Panduan';
import PetaSebaran from './components/PetaSebaran';
import ProfileModal from './components/ProfileModal';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
      if (saved) return saved;
      // Support ?autostart=1 for automated testing or quick preview
      if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(DEFAULT_WARGA_PROFILE));
        return DEFAULT_WARGA_PROFILE;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || ['f1', 'f3'];
    } catch {
      return ['f1', 'f3'];
    }
  });

  const [modalState, setModalState] = useState({ type: null, data: null, userLocation: null });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [confirmCancelAll, setConfirmCancelAll] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot', 'admin'
  const [isLocating, setIsLocating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [transportMode, setTransportMode] = useState('motor');

  // State Pencarian & Filter Faskes (Halaman Warga)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [showAllFaskes, setShowAllFaskes] = useState(false);

  // State Khusus Panel Kontrol Administrator
  const [adminTab, setAdminTab] = useState('antrean'); // 'antrean', 'warga', 'faskes'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('Semua');

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync bookings across tabs
  useEffect(() => {
    const onStorageChange = () => {
      try {
        setBookings(JSON.parse(localStorage.getItem('sehathub_all_bookings')) || []);
      } catch {
        // Ignore storage read error
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const syncBookings = (updated) => {
    setBookings(updated);
    localStorage.setItem('sehathub_all_bookings', JSON.stringify(updated));
  };

  const handleToggleFavorite = (faskesId) => {
    setFavorites((prev) => {
      const exists = prev.includes(faskesId);
      const next = exists ? prev.filter((id) => id !== faskesId) : [...prev, faskesId];
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      const faskesObj = INITIAL_FASKES.find((f) => f.id === faskesId);
      showToast(
        exists ? 'Dihapus dari Favorit' : 'Disimpan ke Favorit',
        `${faskesObj?.name || 'Faskes'} ${exists ? 'dihapus dari' : 'ditambahkan ke'} daftar faskes favorit Anda.`
      );
      return next;
    });
  };

  const handleSaveProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(updatedUser));
    try {
      const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];
      const idx = savedUsers.findIndex((u) => u.email === updatedUser.email);
      if (idx !== -1) {
        savedUsers[idx] = { ...savedUsers[idx], ...updatedUser };
      } else {
        savedUsers.push(updatedUser);
      }
      localStorage.setItem('sehathub_users', JSON.stringify(savedUsers));
    } catch {
      // Ignore storage error
    }
    showToast('Profil Diperbarui', `Data profil dan rekam medis ${updatedUser.name} berhasil disimpan.`);
  };

  const handleCancelBooking = (kodeBooking) => {
    const updated = bookings.filter((b) => b.kode !== kodeBooking);
    syncBookings(updated);
    try {
      const last = JSON.parse(localStorage.getItem('sehathub_last_booking'));
      if (last && last.kode === kodeBooking) {
        localStorage.removeItem('sehathub_last_booking');
      }
    } catch {
      // Ignore storage error
    }
    showToast('Antrean Dibatalkan', `Nomor antrean dengan kode ${kodeBooking} telah dibatalkan.`);
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
    } catch {
      // Audio playback not supported or user gesture required
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const teks = `Panggilan antrean nomor ${booking.nomor.replace('-', ' ')}, atas nama ${booking.userName}, silakan menuju ${booking.poli || 'Poli Layanan'} di ${booking.faskesNama}.`;
      const utterance = new SpeechSynthesisUtterance(teks);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      setTimeout(() => window.speechSynthesis.speak(utterance), 500);
    }
    showToast('Memanggil Pasien', `Nomor ${booking.nomor} (${booking.userName}) sedang dipanggil ke loket.`);
  };

  // Fungsi Export CSV Data Antrean untuk Admin
  const handleExportCSV = (bookingsList) => {
    if (!bookingsList.length) {
      showToast('Data Kosong', 'Belum ada data antrean untuk diunduh.');
      return;
    }
    const headers = ['Kode Booking,Nama Warga,NIK,Fasilitas Kesehatan,Poli,Nomor Antrean,Waktu Kunjungan,Status'];
    const rows = bookingsList.map(
      (b) =>
        `${b.kode},"${b.userName}",${b.nik || '-'},"${b.faskesNama}","${b.poli || 'Poli Umum'}",${b.nomor},"${b.waktu}",${b.status || 'Menunggu'}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Antrean_SehatHub_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Diunduh', 'File CSV data antrean berhasil disimpan!');
  };

  const handleQuickDemoLogin = (role = 'user') => {
    if (role === 'admin') {
      const adminUser = {
        name: 'Administrator SehatHub',
        email: 'admin@sehathub.id',
        role: 'admin',
        avatar: PRESET_AVATARS[4].url
      };
      setUser(adminUser);
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(adminUser));
      showToast('Login Admin Berhasil', 'Selamat datang di Panel Kontrol Utama!');
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];
    const existingDemo = savedUsers.find((u) => u.email === DEFAULT_WARGA_PROFILE.email);
    const activeWarga = existingDemo || DEFAULT_WARGA_PROFILE;
    if (!existingDemo) {
      savedUsers.push({ ...DEFAULT_WARGA_PROFILE, password: 'user123' });
      localStorage.setItem('sehathub_users', JSON.stringify(savedUsers));
    }
    setUser(activeWarga);
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(activeWarga));
    showToast('Berhasil Masuk', `Selamat datang kembali, ${activeWarga.name}!`);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    if (authMode === 'admin') {
      const password = e.target.password.value;
      if (email === 'admin@sehathub.id' && password === 'admin123') {
        handleQuickDemoLogin('admin');
      } else {
        showToast('Gagal Masuk Admin', 'Email atau password admin salah! (Gunakan admin@sehathub.id / admin123)');
      }
    } else if (authMode === 'login') {
      const password = e.target.password.value;
      const foundUser = savedUsers.find((u) => u.email === email && u.password === password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(foundUser));
        setModalState({ type: null, data: null, userLocation: null });
        showToast('Berhasil Masuk', `Selamat datang kembali, ${foundUser.name}!`);
      } else {
        showToast('Gagal Masuk', 'Email atau password salah. Silakan daftar akun atau gunakan Akun Demo Warga.');
      }
    } else if (authMode === 'register') {
      const password = e.target.password.value;
      const name = e.target.fullName.value.trim();
      const userExists = savedUsers.find((u) => u.email === email);
      if (userExists) {
        showToast('Gagal Daftar', 'Email ini sudah terdaftar!');
        return;
      }
      const newUser = {
        ...DEFAULT_WARGA_PROFILE,
        name,
        email,
        password,
        role: 'user',
        joinedAt: new Date().toLocaleDateString('id-ID'),
        bio: `Warga aktif pengguna layanan kesehatan digital SehatHub.`
      };
      savedUsers.push(newUser);
      localStorage.setItem('sehathub_users', JSON.stringify(savedUsers));
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(newUser));
      setModalState({ type: null, data: null, userLocation: null });
      showToast('Pendaftaran Berhasil', `Akun ${name} siap digunakan!`);
    } else if (authMode === 'forgot') {
      const newPassword = e.target.newPassword.value;
      const userIndex = savedUsers.findIndex((u) => u.email === email);
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
    setIsProfileOpen(false);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    showToast('Keluar', 'Anda telah keluar dari sesi akun.');
  };

  const handleBooking = (e) => {
    e.preventDefault();
    const tanggal = e.target.tanggal.value;
    const waktu = e.target.waktu.value;
    const nik = e.target.nik ? e.target.nik.value.trim() : user?.nik || '-';
    const poli = e.target.poli ? e.target.poli.value : 'Poli Umum';
    const keluhan = e.target.keluhan ? e.target.keluhan.value.trim() : '';

    const randomCode = 'SH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const nomorUrut = 'A-' + Math.floor(Math.random() * 20 + 10);

    const bookingData = {
      kode: randomCode,
      userName: user?.name || 'Warga Publik',
      userEmail: user?.email || '',
      nik,
      poli,
      keluhan,
      faskesNama: modalState.data?.name || 'Fasilitas Kesehatan',
      nomor: nomorUrut,
      waktu: `${tanggal} (${waktu})`,
      status: 'Menunggu'
    };

    localStorage.setItem('sehathub_last_booking', JSON.stringify(bookingData));
    const updatedBookings = [...bookings, bookingData];
    syncBookings(updatedBookings);

    // If user didn't have NIK saved in profile yet, save it automatically
    if (user && nik && nik !== '-' && !user.nik) {
      handleSaveProfile({ ...user, nik });
    }

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
    } catch {
      // AudioContext not supported or blocked
    }

    showToast('Antrean Berhasil!', `Kode Booking: ${randomCode}`);
    setModalState({ type: 'ticket', data: bookingData, userLocation: null });
  };

  const handleCekRute = () => {
    setIsLocating(true);
    showToast('Satelit Menghubungkan', 'Melacak koordinat posisi Anda...');

    const fallbackPurwokertoCenter = { lat: -7.4244, lng: 109.2302 };

    if (!navigator.geolocation) {
      setIsLocating(false);
      setModalState((prev) => ({ ...prev, userLocation: fallbackPurwokertoCenter }));
      showToast('Simulasi GPS Aktif', 'Menggunakan titik pusat Alun-Alun Purwokerto untuk kalkulasi rute.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setModalState((prev) => ({
          ...prev,
          userLocation: { lat: position.coords.latitude, lng: position.coords.longitude }
        }));
        showToast('Kalkulasi Selesai', 'Rute GPS & Estimasi Waktu Berhasil Dihitung!');
      },
      () => {
        setIsLocating(false);
        setModalState((prev) => ({
          ...prev,
          userLocation: fallbackPurwokertoCenter
        }));
        showToast('Rute Terkalkulasi', 'Menggunakan titik referensi Purwokerto untuk estimasi jarak & waktu.');
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  // Filter Faskes (Halaman Warga)
  const filteredFaskesList = filterFaskes(INITIAL_FASKES, {
    searchQuery,
    selectedCategory,
    onlyFavorites,
    favorites
  });

  const displayedFaskes =
    showAllFaskes || searchQuery || selectedCategory !== 'Semua' || onlyFavorites
      ? filteredFaskesList
      : filteredFaskesList.slice(0, 6);

  const profileCompletion = calculateProfileCompletion(user);
  const myActiveBookings = bookings.filter(
    (b) =>
      b.userEmail === user?.email ||
      (b.userName && user?.name && b.userName.toLowerCase() === user.name.toLowerCase())
  );

  // --- JIKA BELUM LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex bg-slate-50 font-sans relative overflow-hidden">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl flex items-start gap-3 modal-animation">
            <i className="fa-solid fa-circle-check text-orange-500 text-xl mt-0.5"></i>
            <div>
              <h5 className="font-bold text-sm text-slate-900">{toastMessage.title}</h5>
              <p className="text-xs text-slate-500">{toastMessage.desc}</p>
            </div>
          </div>
        )}

        {/* BANNER KIRI */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-amber-500 relative items-center justify-center p-12 overflow-hidden z-10">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          ></div>

          <div className="relative z-10 text-white max-w-lg">
            <img
              src="/logo-sehathub.svg"
              alt="Logo SehatHub"
              className="h-14 md:h-16 w-auto object-contain mb-10 brightness-0 invert"
            />
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              Akses Layanan Kesehatan Publik Lebih Cepat.
            </h1>
            <p className="text-orange-50 text-lg mb-10 leading-relaxed">
              Platform terpadu untuk mencari fasilitas kesehatan, mengelola profil &amp; rekam medis pribadi, memantau rute GPS, dan mengambil nomor antrean secara <i>real-time</i>.
            </p>

            <div className="space-y-4 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-white text-xs"></i>
                </div>
                <span className="font-semibold text-base">Integrasi Data Faskes, Profil Pasien &amp; Kalkulator IMT</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-white text-xs"></i>
                </div>
                <span className="font-semibold text-base">E-Ticket Digital, Kartu Berobat &amp; Live Tracking Loket</span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM KANAN */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-slate-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl p-8 md:p-10 relative border border-slate-200/80 z-20">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-orange-500 tracking-tight mb-2">SehatHub</h2>
              <h3 className="font-bold text-xl text-slate-800 flex items-center justify-center gap-2 mt-2">
                {authMode === 'login' && (
                  <>
                    <i className="fa-solid fa-circle-user text-orange-500"></i> Masuk Akun Warga
                  </>
                )}
                {authMode === 'register' && (
                  <>
                    <i className="fa-solid fa-user-plus text-orange-500"></i> Daftar Akun Baru
                  </>
                )}
                {authMode === 'admin' && (
                  <>
                    <i className="fa-solid fa-user-shield text-indigo-600"></i> Portal Login Admin
                  </>
                )}
                {authMode === 'forgot' && (
                  <>
                    <i className="fa-solid fa-unlock-keyhole text-orange-500"></i> Reset Password
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                {authMode === 'admin'
                  ? 'Masuk khusus pengelola faskes & sistem.'
                  : authMode === 'forgot'
                  ? 'Masukkan email terdaftar dan buat password baru Anda.'
                  : 'Masuk untuk mengakses antrean online dan profil rekam medis Anda.'}
              </p>
            </div>

            {/* Pintasan Masuk Instan (Demo Warga / Admin) */}
            {(authMode === 'login' || authMode === 'admin') && (
              <div className="mb-6 p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                <p className="text-[11px] font-bold text-orange-800 mb-2">
                  Akses Cepat Tanpa Ketik (Mode Demo):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('user')}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-orange-500 text-orange-700 hover:text-white border border-orange-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-user-check"></i> Masuk Demo Warga
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-user-shield"></i> Masuk Demo Admin
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label htmlFor="auth-fullname" className="block text-xs font-bold text-slate-600 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    id="auth-fullname"
                    name="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap..."
                    required
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-slate-600 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    placeholder={authMode === 'admin' ? 'admin@sehathub.id' : 'contoh@sehathub.id'}
                    required
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                  />
                  <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
                </div>
              </div>

              {authMode !== 'forgot' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password" className="block text-xs font-bold text-slate-600">
                      Password
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs font-bold text-orange-600 hover:underline transition-colors cursor-pointer"
                      >
                        Lupa Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={authMode === 'admin' ? 'admin123' : 'Masukkan password...'}
                      required
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-4 pr-12 py-3 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan atau Sembunyikan Password"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 p-1.5"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-base`}></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="auth-newpassword" className="block text-xs font-bold text-slate-600 mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      id="auth-newpassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password baru..."
                      required
                      minLength="6"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-4 pr-12 py-3 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan atau Sembunyikan Password Baru"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 p-1.5"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-base`}></i>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full mt-4 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer ${
                  authMode === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600'
                }`}
              >
                {authMode === 'login' && 'Masuk Sekarang'}
                {authMode === 'register' && 'Daftar Sekarang'}
                {authMode === 'admin' && 'Masuk Panel Admin'}
                {authMode === 'forgot' && 'Simpan Password Baru'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>

            <div className="mt-6 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
              {authMode === 'login' && (
                <>
                  <p className="text-xs font-medium text-slate-600">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="font-extrabold text-orange-600 hover:underline cursor-pointer"
                    >
                      Daftar di sini
                    </button>
                  </p>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('admin')}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <i className="fa-solid fa-user-shield"></i> Masuk sebagai Admin / Pengelola Faskes
                    </button>
                  </div>
                </>
              )}
              {authMode === 'admin' && (
                <p className="text-xs font-medium text-slate-600">
                  Kembali ke login warga?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-extrabold text-orange-600 hover:underline cursor-pointer"
                  >
                    Masuk Warga
                  </button>
                </p>
              )}
              {(authMode === 'register' || authMode === 'forgot') && (
                <p className="text-xs font-medium text-slate-600">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-extrabold text-orange-600 hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
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
    const allBookings = bookings;
    const registeredUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    const countMenunggu = allBookings.filter((b) => !b.status || b.status === 'Menunggu').length;
    const countDisetujui = allBookings.filter((b) => b.status === 'Disetujui').length;
    const countSelesai = allBookings.filter((b) => b.status === 'Selesai').length;
    const persenTerkonfirmasi =
      allBookings.length > 0
        ? Math.round(((countDisetujui + countSelesai) / allBookings.length) * 100)
        : 0;

    const filteredBookings = allBookings.filter((b) => {
      const currentStatus = b.status || 'Menunggu';
      const matchStatus = adminStatusFilter === 'Semua' || currentStatus === adminStatusFilter;
      const q = adminSearch.toLowerCase();
      const matchQuery =
        b.kode.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.faskesNama.toLowerCase().includes(q) ||
        (b.nik && b.nik.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });

    const tambahDataSimulasi = () => {
      const sampleData = [
        {
          kode: 'SH-8K2M',
          userName: 'Budi Santoso',
          nik: '3302140901980001',
          poli: 'Poli Umum',
          faskesNama: 'Puskesmas Purwokerto Selatan',
          nomor: 'A-12',
          waktu: '2026-10-30 (Pagi)',
          status: 'Disetujui'
        },
        {
          kode: 'SH-4P9L',
          userName: 'Siti Aminah',
          nik: '3302254405010002',
          poli: 'Poli Anak',
          faskesNama: 'RSUD Prof. Dr. Margono Soekarjo',
          nomor: 'A-15',
          waktu: '2026-10-30 (Pagi)',
          status: 'Menunggu'
        },
        {
          kode: 'SH-7N3Q',
          userName: 'Rizky Pratama',
          nik: '3302191211030004',
          poli: 'Poli Gigi',
          faskesNama: 'Klinik Pratama UMP Purwokerto',
          nomor: 'A-08',
          waktu: '2026-10-30 (Sore)',
          status: 'Selesai'
        }
      ];
      const existingCodes = new Set(allBookings.map((item) => item.kode));
      const newItems = sampleData.filter((item) => !existingCodes.has(item.kode));
      const combined = [...allBookings, ...(newItems.length ? newItems : sampleData)];
      syncBookings(combined);
      showToast('Data Simulasi Ditambahkan', 'Antrean warga contoh berhasil dimasukkan ke tabel!');
    };

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-16">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl flex items-start gap-3 modal-animation">
            <i className="fa-solid fa-circle-check text-indigo-600 text-xl mt-0.5"></i>
            <div>
              <h5 className="font-bold text-sm text-slate-900">{toastMessage.title}</h5>
              <p className="text-xs text-slate-500">{toastMessage.desc}</p>
            </div>
          </div>
        )}

        {/* HEADER TOPBAR ADMIN */}
        <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 py-4 px-6 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white">
                <i className="fa-solid fa-user-shield text-xl"></i>
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-wide">Panel Kontrol Administrator</h1>
                <p className="text-xs text-slate-400">
                  Pusat Kendali Antrean Medis, Verifikasi Pasien &amp; Jaringan Faskes SehatHub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex gap-1 font-mono tabular-nums">
                <button
                  type="button"
                  onClick={() => setAdminTab('antrean')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'antrean' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-ticket"></i> Antrean ({allBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('warga')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'warga' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-users"></i> Akun Warga ({registeredUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('faskes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'faskes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-hospital"></i> Faskes ({INITIAL_FASKES.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Keluar <i className="fa-solid fa-right-from-bracket ml-1"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* 4 KARTU STATISTIK REAL-TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono tabular-nums">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-sans font-bold">Total Antrean Masuk</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {allBookings.length} <span className="text-xs font-sans font-medium text-slate-400">Pasien</span>
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-sans font-bold">Menunggu Konfirmasi</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">
                  {countMenunggu} <span className="text-xs font-sans font-medium text-slate-400">Antrean</span>
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-sans font-bold">Disetujui / Selesai</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                  {countDisetujui + countSelesai}{' '}
                  <span className="text-xs font-sans font-medium text-slate-400">({persenTerkonfirmasi}%)</span>
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-sans font-bold">Warga &amp; Mitra Faskes</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {registeredUsers.length}{' '}
                  <span className="text-xs font-sans font-medium text-slate-400">
                    Akun / {INITIAL_FASKES.length} Faskes
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* BAR PROGRESS KINERJA PELAYANAN */}
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">
                  <i className="fa-solid fa-chart-line text-indigo-600 mr-1.5"></i> Persentase Verifikasi &amp; Pelayanan Pasien Hari Ini
                </span>
                <span className="text-indigo-600 font-mono tabular-nums">{persenTerkonfirmasi}% Terlayani</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${persenTerkonfirmasi}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={tambahDataSimulasi}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i> Tambah Data Simulasi
              </button>
              <button
                type="button"
                onClick={() => handleExportCSV(allBookings)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-file-csv"></i> Unduh CSV
              </button>
              {allBookings.length > 0 && !confirmCancelAll && (
                <button
                  type="button"
                  onClick={() => setConfirmCancelAll(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can"></i> Kosongkan Antrean
                </button>
              )}
              {confirmCancelAll && (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-rose-700">Hapus semua?</span>
                  <button
                    type="button"
                    onClick={() => {
                      syncBookings([]);
                      localStorage.removeItem('sehathub_last_booking');
                      setConfirmCancelAll(false);
                      showToast('Reset Berhasil', 'Seluruh data antrean telah dibersihkan.');
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancelAll(false)}
                    className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: MANAJEMEN ANTREAN WARGA */}
          {adminTab === 'antrean' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-indigo-600"></i> Data Antrean Warga Real-Time
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik tombol status untuk mengubah verifikasi, atau klik ikon pengeras suara untuk memanggil pasien ke loket.
                  </p>
                </div>

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
                    {['Semua', 'Menunggu', 'Disetujui', 'Selesai'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAdminStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          adminStatusFilter === st
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
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
                  <p className="text-xs text-slate-400 mt-1">
                    Klik tombol &quot;Tambah Data Simulasi&quot; di atas untuk mengisi contoh antrean warga.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase bg-slate-50">
                        <th className="py-3.5 px-4">Kode Booking</th>
                        <th className="py-3.5 px-4">Pasien &amp; NIK</th>
                        <th className="py-3.5 px-4">Faskes &amp; Poli Tujuan</th>
                        <th className="py-3.5 px-4">Nomor Loket</th>
                        <th className="py-3.5 px-4">Jadwal Kunjungan</th>
                        <th className="py-3.5 px-4">Status Verifikasi</th>
                        <th className="py-3.5 px-4 text-center">Aksi Loket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => {
                        const realIdx = allBookings.findIndex((item) => item.kode === b.kode);
                        return (
                          <tr key={b.kode} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono tabular-nums font-extrabold text-orange-600">
                              {b.kode}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800 block">{b.userName}</span>
                              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                                NIK: {b.nik || '-'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-700 block">{b.faskesNama}</span>
                              <span className="text-xs text-indigo-600 font-bold">{b.poli || 'Poli Umum'}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums">
                              <span className="font-extrabold text-slate-900">{b.nomor}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs font-mono tabular-nums">
                              {b.waktu}
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedBookings = [...allBookings];
                                  const curr = updatedBookings[realIdx].status || 'Menunggu';
                                  const nextStatus =
                                    curr === 'Menunggu'
                                      ? 'Disetujui'
                                      : curr === 'Disetujui'
                                      ? 'Selesai'
                                      : 'Menunggu';
                                  updatedBookings[realIdx].status = nextStatus;
                                  syncBookings(updatedBookings);

                                  try {
                                    const lastB = JSON.parse(localStorage.getItem('sehathub_last_booking'));
                                    if (lastB && lastB.kode === b.kode) {
                                      lastB.status = nextStatus;
                                      localStorage.setItem('sehathub_last_booking', JSON.stringify(lastB));
                                    }
                                  } catch {
                                    // Ignore storage error
                                  }

                                  showToast('Status Diperbarui', `Antrean ${b.kode} diubah menjadi ${nextStatus}`);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                  b.status === 'Disetujui'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : b.status === 'Selesai'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <i
                                  className={`fa-solid ${
                                    b.status === 'Disetujui'
                                      ? 'fa-circle-check'
                                      : b.status === 'Selesai'
                                      ? 'fa-flag-checkered'
                                      : 'fa-clock'
                                  }`}
                                ></i>
                                {b.status || 'Menunggu'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => panggilPasien(b)}
                                  aria-label={`Panggil pasien ${b.userName}`}
                                  className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  title="Panggil Pasien dengan Suara"
                                >
                                  <i className="fa-solid fa-volume-high"></i>
                                </button>
                                {(!b.status || b.status === 'Menunggu') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...allBookings];
                                      updated[realIdx].status = 'Disetujui';
                                      syncBookings(updated);
                                      showToast(
                                        'Antrean Disetujui',
                                        `Pasien ${b.userName} (${b.kode}) telah diverifikasi!`
                                      );
                                    }}
                                    aria-label={`Setujui antrean ${b.kode}`}
                                    className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    title="Setujui Langsung"
                                  >
                                    <i className="fa-solid fa-check"></i>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = allBookings.filter((_, i) => i !== realIdx);
                                    syncBookings(updated);
                                    showToast('Data Dihapus', `Antrean ${b.kode} telah dihapus.`);
                                  }}
                                  aria-label={`Hapus antrean ${b.kode}`}
                                  className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl text-xs transition-all cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-users text-indigo-600"></i> Database Akun Warga Terdaftar
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar warga yang telah membuat akun di portal SehatHub beserta total riwayat antreannya.
                  </p>
                </div>
              </div>

              {registeredUsers.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Belum ada warga yang mendaftar akun.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase bg-slate-50">
                        <th className="py-3.5 px-4">No</th>
                        <th className="py-3.5 px-4">Nama Lengkap Warga</th>
                        <th className="py-3.5 px-4">Email &amp; NIK</th>
                        <th className="py-3.5 px-4">Gol. Darah</th>
                        <th className="py-3.5 px-4">Riwayat Antrean</th>
                        <th className="py-3.5 px-4 text-center">Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registeredUsers.map((u, i) => {
                        const userBookingsCount = allBookings.filter(
                          (b) => b.userName.toLowerCase() === u.name.toLowerCase()
                        ).length;
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-400">
                              #{i + 1}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                              <img
                                src={u.avatar || PRESET_AVATARS[0].url}
                                alt={u.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              />
                              <div>
                                <span className="block">{u.name}</span>
                                <span className="block text-[11px] font-normal text-slate-400 line-clamp-1">
                                  {u.bio || 'Warga Terdaftar'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                              <span className="block font-medium">{u.email}</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                NIK: {u.nik || '-'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-700">
                              {u.bloodType || '-'}
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums text-xs font-bold text-orange-600">
                              {userBookingsCount} Kunjungan
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedUsers = registeredUsers.filter((_, idx) => idx !== i);
                                  localStorage.setItem('sehathub_users', JSON.stringify(updatedUsers));
                                  setUser({ ...user });
                                  showToast('Akun Dihapus', `Akun warga ${u.name} telah dihapus.`);
                                }}
                                aria-label={`Hapus akun ${u.name}`}
                                className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-hospital text-indigo-600"></i> Monitor Kapasitas Fasilitas Kesehatan Terintegrasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau status operasional, jam layanan, dan jumlah pendaftar online di setiap fasilitas kesehatan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INITIAL_FASKES.map((f) => {
                  const faskesBookings = allBookings.filter((b) => b.faskesNama === f.name).length;
                  return (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center gap-2 mb-1.5 text-xs">
                          <span className="font-bold text-orange-600">
                            {f.type} · {f.city}
                          </span>
                          <span className="font-bold text-emerald-700">{f.status}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Jam Operasional: {f.hours}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs font-mono tabular-nums">
                        <span className="text-slate-500">
                          Loket: <strong className="text-slate-700">{f.queueStatus}</strong>
                        </span>
                        <span className="text-indigo-700 font-extrabold">+{faskesBookings} Online</span>
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
        <div className="fixed top-24 right-6 z-50 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl flex items-start gap-3 modal-animation">
          <i className="fa-solid fa-circle-check text-orange-500 text-xl mt-0.5"></i>
          <div>
            <h5 className="font-bold text-sm text-slate-900">{toastMessage.title}</h5>
            <p className="text-xs text-slate-500">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <Hero
        onQuickSelectFaskes={(faskes) =>
          setModalState({ type: 'booking', data: faskes, userLocation: null })
        }
        onQuickCategory={(cat) => {
          setSelectedCategory(cat);
          setOnlyFavorites(false);
        }}
      />

      {/* RINGKASAN PROFIL & KARTU KESEHATAN WARGA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={user.avatar || PRESET_AVATARS[0].url}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 bg-slate-100 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-bold text-orange-600">Pasien Terdaftar</span>
                <span>·</span>
                <span className="font-mono tabular-nums">NIK: {user.nik || 'Belum dilengkapi'}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">Gol. Darah: {user.bloodType || '-'}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{user.name}</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-2">
                {user.bio || 'Lengkapi bio, tinggi/berat badan, dan catatan alergi di menu Profil & Rekam Medis.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div className="flex items-center gap-5 mr-2 font-mono tabular-nums">
              <div>
                <span className="block text-[10px] font-sans font-bold text-slate-400 uppercase">
                  Kelengkapan Profil
                </span>
                <span className="text-sm font-extrabold text-emerald-600">{profileCompletion}%</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="block text-[10px] font-sans font-bold text-slate-400 uppercase">
                  Antrean Saya
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {myActiveBookings.length} Tiket
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="block text-[10px] font-sans font-bold text-slate-400 uppercase">
                  Faskes Favorit
                </span>
                <span className="text-sm font-extrabold text-orange-600">
                  {favorites.length} Tersimpan
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <i className="fa-solid fa-id-card-clip text-orange-400"></i> Buka Profil &amp; Rekam Medis
            </button>
          </div>
        </div>
      </section>

      <Tentang />

      {/* SECTION DAFTAR FASKES DENGAN PENCARIAN, FILTER & FAVORIT */}
      <section id="faskes" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Fasilitas Kesehatan Terdekat</h2>
            <p className="text-sm text-slate-500 mt-1">
              Cari berdasarkan nama faskes, kota, atau layanan poli (contoh: Poli Gigi, IGD, KIA).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                aria-label="Cari faskes, kota, atau poli"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari faskes, kota, atau poli..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
              {['Semua', 'Puskesmas', 'Rumah Sakit', 'Klinik'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-orange-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                onlyFavorites
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <i className={`${onlyFavorites ? 'fa-solid' : 'fa-regular'} fa-bookmark text-rose-500`}></i>
              Tersimpan ({favorites.length})
            </button>
          </div>
        </div>

        {displayedFaskes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <i className="fa-solid fa-hospital-user text-4xl text-slate-300 mb-3"></i>
            <h4 className="font-bold text-slate-700">Fasilitas Kesehatan Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Tidak ada faskes yang cocok dengan kata kunci atau filter Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFaskes.map((f) => {
              const isFav = favorites.includes(f.id);
              return (
                <div
                  key={f.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col card-hover"
                >
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img
                      src={f.image}
                      alt={f.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(f.id)}
                      aria-label={isFav ? `Hapus ${f.name} dari favorit` : `Simpan ${f.name} ke favorit`}
                      className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-slate-700 hover:text-rose-600 flex items-center justify-center shadow-sm transition-transform hover:scale-105 cursor-pointer"
                      title={isFav ? 'Hapus dari Faskes Favorit' : 'Simpan ke Faskes Favorit'}
                    >
                      <i className={`${isFav ? 'fa-solid text-rose-500' : 'fa-regular'} fa-bookmark text-sm`}></i>
                    </button>
                    <p className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-white flex items-center justify-between font-mono tabular-nums">
                      <span>{f.hours}</span>
                      <span>{f.queueStatus || 'Normal'}</span>
                    </p>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* Unboxed clean metadata line */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                      <span
                        className={
                          f.type === 'Rumah Sakit'
                            ? 'text-rose-600 font-bold'
                            : f.type === 'Klinik'
                            ? 'text-amber-600 font-bold'
                            : 'text-orange-600 font-bold'
                        }
                      >
                        {f.type}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{f.city}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{f.distance}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{f.name}</h3>

                    {f.services && (
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Layanan: <span className="text-slate-700 font-medium">{f.services.join(' · ')}</span>
                      </p>
                    )}

                    <div className="mt-auto grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setModalState({ type: 'map', data: f, userLocation: null })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-map-location-dot"></i> Peta &amp; Rute
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalState({ type: 'booking', data: f, userLocation: null })}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-ticket"></i> Ambil Antrean
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!searchQuery && selectedCategory === 'Semua' && !onlyFavorites && INITIAL_FASKES.length > 6 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAllFaskes(!showAllFaskes)}
              className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              {showAllFaskes ? (
                <>
                  Tampilkan Lebih Sedikit <i className="fa-solid fa-chevron-up text-xs"></i>
                </>
              ) : (
                <>
                  Lihat Semua Fasilitas Kesehatan ({INITIAL_FASKES.length}){' '}
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <PetaSebaran
        onOpenRouteModal={(faskes) =>
          setModalState({ type: 'map', data: faskes, userLocation: null })
        }
        onOpenBookingModal={(faskes) =>
          setModalState({ type: 'booking', data: faskes, userLocation: null })
        }
      />
      <CekAntrean />
      <Panduan />
      <Chatbot />
      <Footer />

      {/* MODAL PROFIL LENGKAP & REKAM MEDIS */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onSaveProfile={handleSaveProfile}
          bookings={bookings}
          onCancelBooking={handleCancelBooking}
          onSelectFaskesBooking={(faskes) =>
            setModalState({ type: 'booking', data: faskes, userLocation: null })
          }
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          showToast={showToast}
        />
      )}

      {/* MODAL PETA & GPS */}
      {modalState.type === 'map' && modalState.data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col modal-animation border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-orange-500"></i>
                  {modalState.userLocation ? 'Kalkulasi Rute & Estimasi Jarak GPS' : 'Peta Lokasi Fasilitas Kesehatan'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalState.data.name} — {modalState.data.city || 'Jawa Tengah'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup Peta"
                onClick={() => setModalState({ type: null, data: null, userLocation: null })}
                className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {!modalState.userLocation ? (
              <div className="w-full h-[340px] md:h-[380px] rounded-2xl overflow-hidden bg-slate-100 relative mb-5 border border-slate-200">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    modalState.data.name + ' ' + (modalState.data.city || '')
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  title={`Peta Lokasi ${modalState.data.name}`}
                ></iframe>
              </div>
            ) : (
              <div className="w-full rounded-2xl bg-slate-900 relative mb-5 border border-slate-800 overflow-hidden flex flex-col items-center text-white p-6">
                <i className="fa-solid fa-satellite-dish text-3xl text-orange-400 mb-2"></i>
                <h4 className="font-bold text-lg mb-4 text-emerald-400">
                  Koordinat Rute GPS Berhasil Dihitung
                </h4>

                {(() => {
                  const jarakKm = calculateHaversineDistance(
                    modalState.userLocation.lat,
                    modalState.userLocation.lng,
                    modalState.data.lat,
                    modalState.data.lng
                  );
                  const estimasiWaktu = calculateEstimatedTravelTime(jarakKm, transportMode);

                  return (
                    <div className="w-full max-w-lg mb-6 z-10 space-y-4">
                      <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                          <p className="text-[10px] font-sans text-slate-400 uppercase font-bold">
                            Jarak Tempuh
                          </p>
                          <p className="text-2xl font-extrabold text-orange-400 mt-1">
                            {jarakKm} <span className="text-xs font-sans font-semibold">KM</span>
                          </p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
                          <p className="text-[10px] font-sans text-emerald-300 uppercase font-bold">
                            Estimasi Waktu
                          </p>
                          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                            ~{estimasiWaktu}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 font-bold pl-2">Moda Transportasi:</span>
                        <div className="flex gap-1.5">
                          {['motor', 'mobil', 'jalan'].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setTransportMode(m)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                transportMode === m
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
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
                    href={`tel:${modalState.data.phone || '119'}`}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-rose-400 px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-phone-volume"></i> Hubungi Faskes ({modalState.data.phone || '119'})
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${modalState.userLocation.lat},${modalState.userLocation.lng}&destination=${encodeURIComponent(
                      modalState.data.name + ' ' + (modalState.data.city || '')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    Petunjuk Arah Google Maps <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                </div>
              </div>
            )}

            {!modalState.userLocation && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80">
                <div>
                  <p className="text-sm font-bold text-slate-800">{modalState.data.name}</p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Telepon: {modalState.data.phone || '119'} · Jam: {modalState.data.hours}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCekRute}
                  disabled={isLocating}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer shrink-0"
                >
                  {isLocating ? 'Menghitung Koordinat...' : 'Hitung Jarak & Rute GPS Saya'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL BOOKING DENGAN PILIHAN POLI & AUTO-FILL NIK DARI PROFIL */}
      {modalState.type === 'booking' && modalState.data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative modal-animation border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-500 text-2xl"></i> Ambil Nomor Antrean
              </h3>
              <button
                type="button"
                aria-label="Tutup Formulir Antrean"
                onClick={() => setModalState({ type: null, data: null, userLocation: null })}
                className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="mb-5 bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <i className="fa-solid fa-hospital text-base"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                  Fasilitas Kesehatan Tujuan
                </p>
                <p className="text-sm font-extrabold text-slate-900 truncate">{modalState.data.name}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label htmlFor="book-poli" className="block text-xs font-bold text-slate-600 mb-1.5">
                  Pilih Poli / Layanan Medis
                </label>
                <select
                  id="book-poli"
                  name="poli"
                  required
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-orange-500"
                >
                  {(modalState.data.services || ['Poli Umum', 'Poli Gigi', 'Farmasi']).map((srv, idx) => (
                    <option key={idx} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="book-nik" className="block text-xs font-bold text-slate-600">
                    NIK / Nomor Identitas Pasien
                  </label>
                  {user?.nik && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Terisi otomatis dari Profil
                    </span>
                  )}
                </div>
                <input
                  id="book-nik"
                  name="nik"
                  type="text"
                  defaultValue={user?.nik || ''}
                  placeholder="Masukkan 16 digit NIK..."
                  required
                  minLength="8"
                  maxLength="16"
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 font-mono tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="book-tanggal" className="block text-xs font-bold text-slate-600 mb-1.5">
                  Tanggal Kunjungan
                </label>
                <input
                  id="book-tanggal"
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 text-slate-700 font-mono tabular-nums"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-600 mb-2">Sesi Waktu Kunjungan</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Pagi" defaultChecked className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 font-bold text-xs">
                      Pagi (08:00 WIB)
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Sore" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 font-bold text-xs">
                      Sore (15:00 WIB)
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Terbitkan E-Ticket Antrean <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL E-TICKET DIGITAL SETELAH BOOKING */}
      {modalState.type === 'ticket' && modalState.data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden modal-animation border border-slate-100">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <i className="fa-solid fa-check text-xl"></i>
              </div>
              <h3 className="font-extrabold text-xl">E-Ticket Antrean Terbit!</h3>
              <p className="text-xs text-emerald-50 mt-1">Simpan atau salin kode booking di bawah ini</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Kode Booking Anda
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-orange-600 tracking-wider">
                    {modalState.data.kode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(modalState.data.kode);
                      showToast('Kode Disalin!', `Kode ${modalState.data.kode} berhasil disalin ke clipboard.`);
                    }}
                    className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <i className="fa-regular fa-copy"></i> Salin
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-mono tabular-nums">
                  <span className="text-slate-500 font-sans font-medium">Nomor Urut Loket:</span>
                  <span className="font-extrabold text-slate-900 text-base">{modalState.data.nomor}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama Pasien:</span>
                  <span className="font-bold text-slate-800">{modalState.data.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Faskes Tujuan:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[220px] truncate">
                    {modalState.data.faskesNama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Poli Layanan:</span>
                  <span className="font-bold text-orange-600">{modalState.data.poli || 'Poli Umum'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Jadwal Kunjungan:</span>
                  <span className="font-bold font-mono tabular-nums text-slate-800">
                    {modalState.data.waktu}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status Verifikasi:</span>
                  <span className="text-amber-700 font-bold">{modalState.data.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState({ type: null, data: null, userLocation: null })}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({ type: null, data: null, userLocation: null });
                    document.getElementById('cek-antrean')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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