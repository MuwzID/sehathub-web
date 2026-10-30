import { useState, useEffect } from 'react';
import { PRESET_AVATARS } from '../utils/data';

export default function Navbar({ user, onLoginClick, onLogout, onOpenProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');
  const [showNotif, setShowNotif] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '#beranda' },
    { id: 'faskes', label: 'Cari Faskes', href: '#faskes' },
    { id: 'peta', label: 'Peta Sebaran', href: '#peta' },
    { id: 'antrean', label: 'Cek Antrean', href: '#cek-antrean' },
    { id: 'panduan', label: 'Panduan', href: '#panduan' },
  ];

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash) {
        setActiveNav(currentHash === 'cek-antrean' ? 'antrean' : currentHash);
      } else {
        setActiveNav('beranda');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleNotif = () => {
    if (!showNotif) {
      try {
        const booking = JSON.parse(localStorage.getItem('sehathub_last_booking'));
        setLastBooking(booking);
      } catch {
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

  const avatarSrc = user?.avatar || PRESET_AVATARS[0].url;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#beranda"
            onClick={scrollToTop}
            className="flex items-center gap-3 whitespace-nowrap shrink-0"
          >
            <img src="/logo-sehathub.svg" alt="SehatHub" className="h-10 md:h-12 w-auto" />
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.id === 'beranda') {
                    scrollToTop(e);
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  activeNav === item.id
                    ? 'text-orange-600 font-bold border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: User Profile & Notification Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleNotif}
                    aria-label="Pusat Informasi Antrean"
                    className="relative p-2.5 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-bell text-lg"></i>
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm">Pusat Informasi Antrean</h4>
                        <button
                          type="button"
                          onClick={() => setShowNotif(false)}
                          aria-label="Tutup Notifikasi"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <div className="p-4">
                        {lastBooking ? (
                          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-ticket text-sm"></i>
                              </div>
                              <div>
                                <p className="text-[11px] text-orange-700 font-bold">Tiket Antrean Terakhir</p>
                                <p className="text-sm font-extrabold font-mono text-slate-900">{lastBooking.kode}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600">
                              {lastBooking.faskesNama} · Loket <strong>{lastBooking.nomor}</strong> ({lastBooking.status || 'Menunggu'})
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-5 mb-2">
                            <p className="text-xs text-slate-500 font-medium">Belum ada antrean aktif saat ini.</p>
                          </div>
                        )}

                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                          <h5 className="text-xs font-bold text-slate-700 mb-1">Fungsi Kode Booking</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Kode booking adalah identitas karcis digital Anda untuk memantau antrean loket dari rumah tanpa perlu menunggu lama di ruang tunggu.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Buka Menu Profil Lengkap */}
                <button
                  type="button"
                  onClick={onOpenProfile}
                  aria-label={`Buka Profil & Medis ${user.name}`}
                  className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-slate-50/70 hover:bg-orange-50/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <img
                    src={avatarSrc}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-orange-300 bg-white"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-800 max-w-[130px] truncate">
                      {user.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-orange-600">
                      Profil & Medis
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Keluar Akun"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Keluar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Buka Profil Saya"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
              >
                <img src={avatarSrc} alt={user.name} className="w-6 h-6 rounded-md object-cover" />
                <span>Profil</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu Navigasi"
              className="text-slate-700 hover:text-orange-500 p-2 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (item.id === 'beranda') {
                  scrollToTop(e);
                } else {
                  setActiveNav(item.id);
                  setIsOpen(false);
                }
              }}
              className={`block px-4 py-2.5 rounded-xl text-sm transition-colors ${
                activeNav === item.id
                  ? 'text-orange-600 font-bold bg-orange-50'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50 font-medium'
              }`}
            >
              {item.label}
            </a>
          ))}

          {user && (
            <div className="pt-3 mt-2 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <img src={avatarSrc} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                  <span>Profil & Kartu Medis ({user.name})</span>
                </span>
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-sm"
              >
                Keluar Akun
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}