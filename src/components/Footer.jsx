export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <a href="#beranda" className="flex items-center gap-3 mb-6 group">
              <img src="/icon-s.svg" alt="SehatHub Icon" className="h-8 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
              <span className="text-2xl font-bold text-slate-200 tracking-tight group-hover:text-white transition-colors">SehatHub</span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed pr-4">
              Portal terpadu untuk pencarian fasilitas kesehatan dan antrean online. Menghadirkan akses kesehatan yang lebih cepat dan transparan untuk warga Purwokerto dan sekitarnya.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-6 uppercase tracking-wider text-sm">Eksplorasi</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#beranda" className="hover:text-orange-500 hover:translate-x-1 inline-block transition-transform duration-300">Beranda Utama</a></li>
              <li><a href="#faskes" className="hover:text-orange-500 hover:translate-x-1 inline-block transition-transform duration-300">Daftar Fasilitas Kesehatan</a></li>
              <li><a href="#" className="hover:text-orange-500 hover:translate-x-1 inline-block transition-transform duration-300">Panduan Antrean</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h4>
            <p className="text-sm text-slate-500 mb-6">Punya pertanyaan atau masukan untuk prototipe ini? Sapa tim kami.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <i className="fa-regular fa-envelope"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 SehatHub. Purwokerto, Jawa Tengah.</p>
          <p className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
            Dibuat oleh <span className="font-bold text-orange-400">Gejas Gejes Team</span>
          </p>
        </div>

      </div>
    </footer>
  );
}