export default function Hero() {
  return (
    <section id="beranda" className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-white to-orange-50/30">
      
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-sm font-bold mb-6">
            <i className="fa-solid fa-bolt text-amber-500"></i>Gejas  Gejes Team
          </span>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-[1.15]">
            Akses layanan kesehatan publik <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">lebih cepat.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8">Satu portal terpadu untuk pencarian fasilitas kesehatan dan pengambilan antrean online.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Puskesmas Purwokerto Selatan</h3>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
            </span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center">
            <div><p className="text-xs text-slate-500">Sedang Dilayani</p><p className="text-2xl font-bold text-slate-800">A-012</p></div>
            <div className="text-right"><p className="text-xs text-orange-500 font-bold"></p><p className="text-3xl font-black text-orange-600">A-015</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}