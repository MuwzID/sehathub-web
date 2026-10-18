import { useState } from 'react';
import { INITIAL_FASKES } from '../utils/data';

export default function Hero() {
  const [selectedFaskesId, setSelectedFaskesId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!selectedFaskesId) {
      // Jika belum dipilih, langsung scroll ke section faskes umum
      document.getElementById('faskes')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    // Scroll otomatis ke daftar faskes utama
    document.getElementById('faskes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Ornamen */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30 z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* BAGIAN KIRI: Teks Utama */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-6">
            <i className="fa-solid fa-bolt"></i> Gejas Gejes Team
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Akses layanan <br className="hidden md:block" />
            kesehatan publik <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">lebih cepat.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0">
            Satu portal terpadu untuk pencarian fasilitas kesehatan dan pengambilan antrean online tanpa ribet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => scrollToSection('faskes')} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
              <i className="fa-solid fa-calendar-check"></i> Ambil Antrean
            </button>
            <button onClick={() => scrollToSection('cek-antrean')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-magnifying-glass-chart"></i> Lacak Status
            </button>
          </div>
        </div>

        {/* BAGIAN KANAN: Widget Pilih Faskes Instan */}
        <div className="flex-1 w-full max-w-md relative">
          
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-orange-500"></i> Pilih Faskes Tujuan
              </h3>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-100">
                <i className="fa-solid fa-shield-halved text-emerald-500"></i> 100+ Faskes
              </span>
            </div>
            
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Daftar Fasilitas Kesehatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-hospital"></i>
                </div>
                {/* Menggunakan dropdown select agar tinggal klik */}
                <select 
                  value={selectedFaskesId}
                  onChange={(e) => setSelectedFaskesId(e.target.value)}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Faskes Terdekat --</option>
                  {INITIAL_FASKES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5">
                Lihat Lokasi & Antrean <i className="fa-solid fa-arrow-down"></i>
              </button>
            </form>

            {/* Tombol Kategori Cepat */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Cepat</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => scrollToSection('faskes')} className="flex items-center gap-2.5 p-3.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl transition-all hover:shadow-sm text-left group">
                  <i className="fa-solid fa-house-medical text-orange-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs font-bold text-orange-800">Puskesmas</span>
                </button>
                <button type="button" onClick={() => scrollToSection('faskes')} className="flex items-center gap-2.5 p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all hover:shadow-sm text-left group">
                  <i className="fa-solid fa-hospital text-rose-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs font-bold text-rose-800">Rumah Sakit</span>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}