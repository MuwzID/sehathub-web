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
  const [authMode, setAuthMode] = useState('login');
  const [isLocating, setIsLocating] = useState(false); 

  const showToast = (title, desc) => { 
    setToastMessage({ title, desc }); 
    setTimeout(() => setToastMessage(null), 3500); 
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    if (authMode === 'login') {
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
      const newUser = { name, email, password };
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
      faskesNama: modalState.data?.name || 'Fasilitas Kesehatan',
      nomor: nomorUrut,
      waktu: `${tanggal} (${waktu})`
    };
    
    localStorage.setItem('sehathub_last_booking', JSON.stringify(bookingData));
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
      alert(`🎉 Antrean Berhasil Dibuat!\n\nKode Booking Anda: ${randomCode}\nNomor Antrean: ${nomorUrut}\nFaskes: ${bookingData.faskesNama}\n\n(Silakan catat atau salin kode ini untuk melacaknya di menu Cek Antrean).`);
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
          userLocation: { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          }
        }));
        showToast('Kalkulasi Selesai', 'Jarak berhasil dihitung menggunakan Haversine Formula.');
      },
      (error) => {
        setIsLocating(false);
        showToast('Akses Ditolak', 'Gagal mendapatkan lokasi. Pastikan GPS aktif.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      {!user ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
              <i className="fa-solid fa-circle-check text-orange-500 text-xl"></i>
              <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
            </div>
          )}

          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl p-6 md:p-8 relative border border-slate-100">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-extrabold text-orange-500 mb-2">SehatHub</h1>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {authMode === 'login' && <><i className="fa-solid fa-circle-user text-orange-500"></i> Masuk Akun</>}
                {authMode === 'register' && <><i className="fa-solid fa-user-plus text-orange-500"></i> Daftar Akun</>}
                {authMode === 'forgot' && <><i className="fa-solid fa-unlock-keyhole text-orange-500"></i> Reset Password</>}
              </h3>
              <p className="text-xs text-slate-500 mt-1 text-center">
                {authMode === 'forgot' ? 'Masukkan email terdaftar.' : 'Silakan masuk atau daftar.'}
              </p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nama Lengkap</label>
                  <input name="fullName" type="text" placeholder="Masukkan nama..." required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition-all" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email</label>
                <input name="email" type="email" placeholder="contoh@sehathub.id" required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition-all" />
              </div>
              
              {authMode !== 'forgot' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Password</label>
                  <input name="password" type="password" placeholder="Masukkan password..." required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition-all" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Password Baru</label>
                  <input name="newPassword" type="password" placeholder="Masukkan password baru..." required minLength="6" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition-all" />
                </div>
              )}

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                {authMode === 'login' && 'Masuk Sekarang'}
                {authMode === 'register' && 'Daftar Sekarang'}
                {authMode === 'forgot' && 'Simpan Password Baru'}
                <i className={`fa-solid ${authMode === 'forgot' ? 'fa-check-double' : authMode === 'login' ? 'fa-arrow-right' : 'fa-check'}`}></i>
              </button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              {authMode === 'login' && (
                <>
                  <p className="text-sm text-slate-500">Belum punya akun? <button onClick={() => setAuthMode('register')} className="font-bold text-orange-500">Daftar di sini</button></p>
                  <p className="text-sm text-slate-500">Lupa password? <button onClick={() => setAuthMode('forgot')} className="font-bold text-orange-500">Ganti Password</button></p>
                </>
              )}
              {(authMode === 'register' || authMode === 'forgot') && (
                <p className="text-sm text-slate-500">Sudah ingat akun Anda? <button onClick={() => setAuthMode('login')} className="font-bold text-orange-500">Masuk di sini</button></p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* --- MODAL PETA DENGAN DASHBOARD SATELIT GPS --- */}
      {modalState.type === 'map' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col modal-animation border border-white/20">
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-orange-500"></i>
                {modalState.userLocation ? 'Radar Navigasi Pintar' : 'Peta Lokasi'}
              </h3>
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
              <div className="w-full h-[350px] md:h-[400px] rounded-2xl bg-slate-900 relative mb-5 border border-slate-800 overflow-hidden flex flex-col justify-center items-center text-white p-6 shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                <i className="fa-solid fa-satellite-dish text-5xl text-orange-500 mb-4 animate-bounce"></i>
                <h4 className="font-bold text-2xl mb-1 text-emerald-400">GPS Terkunci Secara Akurat</h4>
                <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">Jarak dihitung langsung dari posisi Anda ke <span className="text-white font-bold">{modalState.data?.name}</span>.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-6 z-10">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Koordinat Anda</p>
                    <p className="text-sm font-mono mt-1 text-emerald-300">
                      Lat: {modalState.userLocation.lat.toFixed(4)}<br/>Lng: {modalState.userLocation.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-4 rounded-2xl border border-orange-500/30">
                    <p className="text-[10px] text-orange-300 uppercase font-bold">Jarak Udara Real-Time</p>
                    <p className="text-3xl font-extrabold text-orange-400 mt-0.5">
                      {hitungJarakRealTime(modalState.userLocation.lat, modalState.userLocation.lng, modalState.data.lat, modalState.data.lng)} <span className="text-lg">KM</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const destination = encodeURIComponent(modalState.data?.name + ' ' + (modalState.data?.city || ''));
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${modalState.userLocation.lat},${modalState.userLocation.lng}&destination=${destination}&travelmode=driving`, '_blank');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-3 z-10 w-full max-w-md"
                >
                  Buka Panduan Jalan Otomatis <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
              </div>
            )}

            {!modalState.userLocation && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-800">{modalState.data?.name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <i className="fa-solid fa-location-dot text-orange-400"></i> {modalState.data?.city || 'Jawa Tengah'}
                  </p>
                </div>
                
                <button 
                  onClick={handleCekRute}
                  disabled={isLocating}
                  className="w-full sm:w-auto bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLocating ? (
                    <><i className="fa-solid fa-circle-notch fa-spin text-orange-400"></i> Menghubungkan Satelit...</>
                  ) : (
                    <><i className="fa-solid fa-crosshairs text-orange-400"></i> Lacak Posisi Saya</>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal Booking */}
      {modalState.type === 'booking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-500 text-2xl"></i> Pilih Jadwal
              </h3>
              <button onClick={() => setModalState({ type: null, userLocation: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-hospital text-orange-500 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-orange-600 font-bold mb-0.5">Fasilitas Kesehatan:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{modalState.data?.name}</p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tanggal Kunjungan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-regular fa-calendar text-slate-400"></i>
                  </div>
                  <input name="tanggal" type="date" required className="w-full pl-11 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:border-orange-500 transition-all text-slate-700" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Estimasi Kedatangan</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Pagi" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm transition-all">
                      Pagi <span className="block text-[10px] font-normal mt-0.5">08:00 - 12:00</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Sore" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm transition-all">
                      Sore <span className="block text-[10px] font-normal mt-0.5">15:00 - 19:00</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                Ambil Nomor Antrean <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}