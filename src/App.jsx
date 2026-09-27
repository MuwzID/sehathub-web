import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { STORAGE_KEYS, INITIAL_FASKES } from './utils/data';
import Chatbot from './components/Chatbot';
import CekAntrean from './components/CekAntrean';
import Panduan from './components/Panduan';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)); } catch { return null; }
  });
  
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const showToast = (title, desc) => { 
    setToastMessage({ title, desc }); 
    setTimeout(() => setToastMessage(null), 3500); 
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const savedUsers = JSON.parse(localStorage.getItem('sehathub_users')) || [];

    if (isLoginMode) {
      const foundUser = savedUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(foundUser));
        setModalState({ type: null });
        showToast('Berhasil Masuk', `Selamat datang kembali, ${foundUser.name}!`);
      } else {
        showToast('Gagal Masuk', 'Email atau password salah. Coba lagi!');
      }
    } else {
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
      setModalState({ type: null });
      showToast('Pendaftaran Berhasil', `Akun ${name} siap digunakan!`);
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
    
    const formatTanggal = new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    setModalState({ type: null });
    showToast('Antrean Berhasil Dibuat!', `Nomor Anda untuk ${formatTanggal} sesi ${waktu} telah diterbitkan. Silakan cek menu Cek Antrean.`);
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">

      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
          <i className="fa-solid fa-circle-check text-orange-500 text-xl"></i>
          <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
        </div>
      )}

      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => { setModalState({ type: 'auth' }); setIsLoginMode(true); }} 
      />
      
      <Hero />

      <section id="faskes" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Fasilitas Kesehatan Terdekat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_FASKES.map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col card-hover">
              <div className="h-40 relative overflow-hidden">
                <img src={f.image} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded w-fit mb-2">{f.type}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{f.name}</h3>
                <p className="text-xs text-slate-500 mb-4"><i className="fa-solid fa-location-arrow mr-1 text-slate-400"></i> {f.distance} | {f.hours}</p>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={() => setModalState({ type: 'map', data: f })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors"><i className="fa-solid fa-map-location-dot"></i> Peta</button>
                  <button onClick={() => user ? setModalState({ type: 'booking', data: f }) : setModalState({ type: 'auth' })} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-orange-500/20">
                    <i className="fa-solid fa-ticket"></i> Antrean
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CekAntrean />
      <Panduan />
      <Chatbot />
      <Footer />

      {modalState.type === 'map' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative h-[600px] flex flex-col modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-slate-800">Peta Lokasi</h3><button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button></div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-slate-100 relative">
              <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(modalState.data?.name + ' Purwokerto')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} className="absolute inset-0 w-full h-full border-0" title="Peta Lokasi"></iframe>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 md:p-8 relative modal-animation border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className={`fa-solid ${isLoginMode ? 'fa-circle-user' : 'fa-user-plus'} text-orange-500 text-2xl`}></i>
                {isLoginMode ? 'Masuk Akun' : 'Daftar Akun'}
              </h3>
              <button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nama Lengkap</label>
                  <input name="fullName" type="text" placeholder="Masukkan nama..." required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email</label>
                <input name="email" type="email" placeholder="contoh@sehathub.id" required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Password</label>
                <input name="password" type="password" placeholder="Masukkan password..." required className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
              </div>
              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 flex justify-center items-center gap-2">
                {isLoginMode ? 'Masuk Sekarang' : 'Daftar Sekarang'}
                <i className={`fa-solid ${isLoginMode ? 'fa-arrow-right' : 'fa-check'}`}></i>
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {isLoginMode ? 'Belum punya akun?' : 'Sudah punya akun?'} 
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="ml-1 font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  {isLoginMode ? 'Daftar di sini' : 'Masuk di sini'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'booking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative modal-animation border border-white/20">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-500 text-2xl"></i>
                Pilih Jadwal
              </h3>
              <button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-orange-500 bg-slate-50 hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
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
                  <input 
                    name="tanggal"
                    type="date" 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-700" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Estimasi Kedatangan</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Pagi" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm transition-all hover:bg-slate-100">
                      Pagi <span className="block text-[10px] font-normal mt-0.5">08:00 - 12:00</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="waktu" value="Sore" className="peer sr-only" required />
                    <div className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-600 font-bold text-sm transition-all hover:bg-slate-100">
                      Sore <span className="block text-[10px] font-normal mt-0.5">15:00 - 19:00</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 flex justify-center items-center gap-2">
                Ambil Nomor Antrean
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}