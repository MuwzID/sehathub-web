import { useState, useEffect } from 'react';

export default function Navbar({ user, onLoginClick, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');
  
  // State untuk mengontrol dropdown notifikasi
  const [showNotif, setShowNotif] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '#beranda' },
    { id: 'faskes', label: 'Cari Faskes', href: '#faskes' },
    { id: 'antrean', label: 'Cek Antrean', href: '#cek-antrean' },
    { id: 'panduan', label: 'Panduan', href: '#panduan' },
  ];

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash) {
        setActiveNav(currentHash);
      } else {
        setActiveNav('beranda');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fungsi untuk membuka notifikasi dan mengambil data antrean terakhir
  const toggleNotif = () => {
    if (!showNotif) {
      try {
        const booking = JSON.parse(localStorage.getItem('sehathub_last_booking'));
        setLastBooking(booking);
      } catch (e) {
        setLastBooking(null);
      }
    }
    setShowNotif(!showNotif);
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState(null, '', ' '); 
    setActiveNav('beranda');
    setIsOpen(false);
  };

  return (
    <nav className="bg-transparent backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Bagian Kiri: Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <a href="#beranda" onClick={scrollToTop}>
              <img src="/logo-sehathub.svg" alt="Logo SehatHub" className="h-10 md:h-14 w-auto" />
            </a>
          </div>

          {/* Bagian Tengah: Menu Navigasi Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <a 
                key={item.id}
                href={item.href} 
                onClick={(e) => {
                  if (item.id === 'beranda') {
                    scrollToTop(e);
                  }
                }}
                className={`transition-colors cursor-pointer ${
                  activeNav === item.id 
                    ? 'text-orange-500 font-bold border-b-2 border-orange-500 pb-1' 
                    : 'text-slate-600 hover:text-orange-500 font-medium'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Bagian Kanan: Tombol Auth & Notifikasi */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Ikon Notifikasi Lonceng */}
                <div className="relative">
                  <button onClick={toggleNotif} className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors focus:outline-none">
                    <i className="fa-solid fa-bell text-xl"></i>
                    {/* Titik Merah Indikator */}
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  
                  {/* Dropdown Notifikasi */}
                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm">Pusat Informasi</h4>
                        <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                      <div className="p-4">
                        
                        {/* Jika ada antrean, tampilkan kodenya */}
                        {lastBooking ? (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-ticket text-lg"></i>
                              </div>
                              <div>
                                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Antrean Aktif</p>
                                <p className="text-sm font-bold text-slate-800">{lastBooking.kode}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Gunakan kode ini di menu <strong className="text-slate-800">Cek Antrean</strong> untuk melihat sisa antrean secara <i>real-time</i>.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-6 mb-2">
                            <i className="fa-solid fa-bell-slash text-slate-300 text-3xl mb-3"></i>
                            <p className="text-sm text-slate-500 font-medium">Belum ada antrean aktif</p>
                          </div>
                        )}

                        {/* Penjelasan Edukatif Kegunaan Kode */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <h5 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                            <i className="fa-solid fa-circle-info text-blue-500"></i> Fungsi Kode Booking
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                            Kode booking (misal: <strong>SH-9X7P</strong>) adalah kunci unik pengganti karcis fisik. Kode ini memastikan data Anda terenkripsi dan memungkinkan Anda memantau estimasi waktu panggilan dari HP tanpa harus berkerumun di ruang tunggu fasilitas kesehatan.
                          </p>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-700 text-sm">Hai, <span className="font-bold text-orange-500">{user.name}</span></span>
                  <button 
                    onClick={onLogout}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-red-100"
                  >
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-md shadow-orange-500/30 hover:-translate-y-0.5"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Tombol Menu Mobile (Hamburger Icon & Lonceng) */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <button onClick={toggleNotif} className="relative p-2 text-slate-400 hover:text-orange-500 focus:outline-none">
                <i className="fa-solid fa-bell text-xl"></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-600 hover:text-orange-500 p-1 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      <div className={`md:hidden absolute w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-xl transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        {/* ... (Dropdown Menu Mobile tetap sama seperti sebelumnya) */}
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <a 
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (item.id === 'beranda') {
                  scrollToTop(e);
                } else {
                  setIsOpen(false);
                }
              }}
              className={`block px-4 py-3 rounded-xl transition-colors ${
                activeNav === item.id 
                  ? 'text-orange-500 font-bold bg-orange-50' 
                  : 'text-slate-600 hover:text-orange-500 hover:bg-orange-50 font-medium'
              }`}
            >
              {item.label}
            </a>
          ))}
          
          <div className="pt-4 mt-2 border-t border-slate-100">
            {user ? (
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-600 text-sm mb-3 text-center">Masuk sebagai <span className="font-bold text-orange-500">{user.name}</span></p>
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { onLoginClick(); setIsOpen(false); }}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/30"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Dropdown Notifikasi Versi Mobile */}
      {showNotif && (
        <div className="md:hidden absolute right-4 left-4 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Pusat Informasi</h4>
            <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="p-4">
            {lastBooking ? (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-ticket text-lg"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Antrean Aktif</p>
                    <p className="text-sm font-bold text-slate-800">{lastBooking.kode}</p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-blue-500"></i> Fungsi Kode Booking
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                Kode booking memastikan data Anda terenkripsi dan memungkinkan Anda memantau estimasi waktu panggilan dari HP tanpa harus berkerumun di fasilitas kesehatan.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}