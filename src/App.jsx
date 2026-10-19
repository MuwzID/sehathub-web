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

  const showToast = (title, desc) => { 
    setToastMessage({ title, desc }); 
    setTimeout(() => setToastMessage(null), 3500); 
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    if (authMode === 'admin') {
      // Login Khusus Admin (Default: admin@sehathub.id / admin123)
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
      const newUser = { name, email, password, role: 'user' };
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
    
    const randomCode = 'SH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const nomorUrut = 'A-' + Math.floor(Math.random() * 20 + 10);

    const bookingData = {
      kode: randomCode,
      userName: user?.name || 'Warga Publik',
      faskesNama: modalState.data?.name || 'Fasilitas Kesehatan',
      nomor: nomorUrut,
      waktu: `${tanggal} (${waktu})`,
      status: 'Menunggu'
    };
    
    // Simpan ke riwayat booking user & list global admin
    localStorage.setItem('sehathub_last_booking', JSON.stringify(bookingData));
    const allBookings = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
    allBookings.push(bookingData);
    localStorage.setItem('sehathub_all_bookings', JSON.stringify(allBookings));

    setModalState({ type: null, userLocation: null });

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
    
    setTimeout(() => {
      alert(`🎉 Antrean Berhasil Dibuat!\n\nKode Booking: ${randomCode}\nNomor Antrean: ${nomorUrut}\nFaskes: ${bookingData.faskesNama}`);
      showToast('Antrean Berhasil!', `Kode Booking: ${randomCode}`);
    }, 300);
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

  // --- JIKA BELUM LOGIN (HALAMAN LOGIN / REGISTER / ADMIN LOGIN) ---
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
              Platform modern untuk mencari fasilitas kesehatan, memantau rute satelit GPS, dan mengambil nomor antrean secara *real-time*.
            </p>
            
            <div className="space-y-5 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="font-semibold text-lg">Integrasi Data Faskes Nasional</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="font-semibold text-lg">Sistem Live Tracking Antrean</span>
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
                {authMode === 'admin' ? 'Masuk khusus pengelola faskes & sistem.' : 'Silakan masuk atau daftar.'}
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
              
              {authMode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder={authMode === 'admin' ? 'admin123' : 'Masukkan password...'} required className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all" />
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
            
            {/* Navigasi Switch Auth Mode */}
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
              {authMode === 'register' && (
                <p className="text-sm font-medium text-slate-600">
                  Sudah punya akun? <button onClick={() => setAuthMode('login')} className="font-extrabold text-orange-500 hover:underline">Masuk di sini</button>
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --- JIKA LOGIN SEBAGAI ADMIN (DASHBOARD ADMIN) ---
  if (user.role === 'admin') {
    const allBookings = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
    const registeredUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
        <header className="bg-slate-900 text-white shadow-md border-b-4 border-indigo-500 py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
              <i className="fa-solid fa-user-shield text-lg"></i>
            </div>
            <div>
              <h1 className="font-extrabold text-lg">Panel Kontrol Administrator</h1>
              <p className="text-xs text-slate-400">Sistem Manajemen Data Faskes & Antrean Warga</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
            Keluar Admin <i className="fa-solid fa-right-from-bracket ml-1"></i>
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Statistik Ringkas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Total Antrean Masuk</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{allBookings.length} Warga</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Akun Warga Terdaftar</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{registeredUsers.length} Akun</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-hospital"></i>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Faskes Terintegrasi</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{INITIAL_FASKES.length} Faskes</h3>
              </div>
            </div>
          </div>

          {/* Tabel Data Antrean Masuk dengan Tombol Status Interaktif */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-600"></i> Data Antrean Warga Real-Time
            </h3>
            {allBookings.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Belum ada data antrean yang masuk dari warga.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                      <th className="py-3 px-4">Kode Booking</th>
                      <th className="py-3 px-4">Nama Warga</th>
                      <th className="py-3 px-4">Fasilitas Kesehatan</th>
                      <th className="py-3 px-4">Nomor Antrean</th>
                      <th className="py-3 px-4">Waktu Kunjungan</th>
                      <th className="py-3 px-4">Aksi / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allBookings.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-orange-600">{b.kode}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{b.userName}</td>
                        <td className="py-3 px-4 text-slate-600">{b.faskesNama}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">{b.nomor}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{b.waktu}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              const updatedBookings = [...allBookings];
                              if (!updatedBookings[idx].status || updatedBookings[idx].status === 'Menunggu') {
                                updatedBookings[idx].status = 'Disetujui';
                              } else if (updatedBookings[idx].status === 'Disetujui') {
                                updatedBookings[idx].status = 'Selesai';
                              } else {
                                updatedBookings[idx].status = 'Menunggu';
                              }
                              localStorage.setItem('sehathub_all_bookings', JSON.stringify(updatedBookings));
                              setUser({ ...user }); 
                              showToast('Status Diperbarui', `Antrean ${b.kode} diubah menjadi ${updatedBookings[idx].status}`);
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

      <section id="faskes" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Fasilitas Kesehatan Terdekat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_FASKES.slice(0, 6).map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col card-hover">
              <div className="h-40 relative overflow-hidden">
                <img src={f.image} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded w-fit mb-2">{f.type}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{f.name}</h3>
                <p className="text-xs text-slate-500 mb-4"><i className="fa-solid fa-location-arrow mr-1 text-slate-400"></i> {f.distance} | {f.hours}</p>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={() => setModalState({ type: 'map', data: f, userLocation: null })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors"><i className="fa-solid fa-map-location-dot"></i> Peta</button>
                  <button onClick={() => setModalState({ type: 'booking', data: f, userLocation: null })} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md">
                    <i className="fa-solid fa-ticket"></i> Antrean
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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

                <button 
                  onClick={() => {
                    const destination = encodeURIComponent(modalState.data?.name + ' ' + (modalState.data?.city || ''));
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${modalState.userLocation.lat},${modalState.userLocation.lng}&destination=${destination}`, '_blank');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 z-10 w-full max-w-lg"
                >
                  Buka Google Maps <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
              </div>
            )}

            {!modalState.userLocation && (
              <div className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">{modalState.data?.name}</p>
                </div>
                <button onClick={handleCekRute} disabled={isLocating} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md">
                  {isLocating ? 'Menghubungkan...' : 'Lacak Posisi Saya'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL BOOKING */}
      {modalState.type === 'booking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-500 text-2xl"></i> Pilih Jadwal
              </h3>
              <button onClick={() => setModalState({ type: null, userLocation: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            {/* KARTU INFO FASKES TUJUAN */}
            <div className="mb-5 bg-orange-50 p-3.5 rounded-2xl border border-orange-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fa-solid fa-hospital text-base"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider">Fasilitas Kesehatan Tujuan</p>
                <p className="text-sm font-extrabold text-slate-800 truncate">{modalState.data?.name}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tanggal Kunjungan</label>
                <input name="tanggal" type="date" required className="w-full px-4 py-3.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 text-slate-700 font-medium" />
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
    </div>
  );
}