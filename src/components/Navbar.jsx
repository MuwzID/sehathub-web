export default function Navbar({ user, onLogout, onLoginClick }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        
        <a href="#beranda" className="flex items-center group">
          <img 
            src="/logo-sehathub.svg" 
            alt="Logo SehatHub" 
            className="h-20 w-auto transition-transform duration-300 group-hover:scale-105" 
          />
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold bg-slate-100 px-3 py-1.5 rounded-full transition-colors hover:bg-slate-200 cursor-default">
                <i className="fa-regular fa-user mr-1 text-orange-500"></i> {user.name}
              </span>
              <button onClick={onLogout} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">
                Keluar
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}