import { useState, useEffect } from 'react';

export default function Navbar({ user, onLoginClick, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '#beranda' },
    { id: 'faskes', label: 'Cari Faskes', href: '#faskes' },
    { id: 'antrean', label: 'Cek Antrean', href: '#cek-antrean' }, // Disesuaikan agar sinkron dengan CekAntrean
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

  // Fungsi khusus untuk kembali ke atas dengan mulus
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState(null, '', ' '); // Membersihkan hashtag dari URL agar rapi
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

          {/* Bagian Kanan: Tombol Masuk/Daftar atau Profil User */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="font-medium text-slate-700">Hai, <span className="font-bold text-orange-500">{user.name}</span></span>
                <button 
                  onClick={onLogout}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 px-5 py-2 rounded-xl font-bold transition-colors border border-red-200/40"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Tombol Menu Mobile (Hamburger Icon) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-600 hover:text-orange-500 p-2 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      <div className={`md:hidden absolute w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-xl transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
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
          
          {/* Menu Mobile: Bagian Auth (Login/Logout) */}
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
    </nav>
  );
}