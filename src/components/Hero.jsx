import { useState } from 'react';
import { INITIAL_FASKES } from '../utils/data';

export default function Hero({ onQuickSelectFaskes, onQuickCategory }) {
  const [selectedFaskesId, setSelectedFaskesId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedFaskesId && onQuickSelectFaskes) {
      const target = INITIAL_FASKES.find((f) => f.id === selectedFaskesId);
      if (target) {
        onQuickSelectFaskes(target);
        return;
      }
    }
    document.getElementById('faskes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryName) => {
    if (onQuickCategory) {
      onQuickCategory(categoryName);
    }
    scrollToSection('faskes');
  };

  return (
    <section id="beranda" className="relative pt-10 pb-12 md:pt-14 md:pb-16 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Bagian Kiri: Teks Utama */}
        <div className="flex-1 text-center lg:text-left">
          <p className="text-xs font-bold text-orange-600 tracking-wide mb-3">
            Layanan Digital Kesehatan Masyarakat · Gejas Gejes Team
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6"
            style={{ textWrap: 'balance' }}
          >
            Akses layanan kesehatan publik{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              lebih cepat.
            </span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Satu portal terpadu untuk pencarian fasilitas kesehatan, navigasi rute GPS, pengelolaan profil rekam medis, dan pengambilan antrean online tanpa ribet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => scrollToSection('faskes')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-calendar-check"></i> Ambil Antrean Sekarang
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('cek-antrean')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-7 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-magnifying-glass-chart"></i> Lacak Status Nomor
            </button>
          </div>
        </div>

        {/* Bagian Kanan: Widget Pilih Faskes Instan */}
        <div className="flex-1 w-full max-w-md relative">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 relative z-10">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-orange-500"></i> Pilih Faskes Tujuan
              </h2>
              <span className="text-xs font-semibold text-emerald-700 font-mono tabular-nums">
                {INITIAL_FASKES.length} Faskes Aktif
              </span>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <label htmlFor="hero-faskes-select" className="block text-xs font-bold text-slate-600 mb-2">
                Daftar Fasilitas Kesehatan Terintegrasi
              </label>
              <div className="relative">
                <select
                  id="hero-faskes-select"
                  value={selectedFaskesId}
                  onChange={(e) => setSelectedFaskesId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Faskes Terdekat --</option>
                  {INITIAL_FASKES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.city})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {selectedFaskesId ? 'Buka Formulir Antrean Faskes Ini' : 'Lihat Lokasi & Daftar Faskes'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>

            {/* Tombol Filter Kategori Cepat */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500">Filter Cepat Berdasarkan Tipe</p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCategoryClick('Puskesmas')}
                  className="flex flex-col items-center justify-center p-3 bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200/70 rounded-xl transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-house-medical text-orange-600 text-base mb-1"></i>
                  <span className="text-xs font-bold text-slate-800">Puskesmas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('Rumah Sakit')}
                  className="flex flex-col items-center justify-center p-3 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 rounded-xl transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-hospital text-rose-600 text-base mb-1"></i>
                  <span className="text-xs font-bold text-slate-800">Rumah Sakit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('Klinik')}
                  className="flex flex-col items-center justify-center p-3 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/70 rounded-xl transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-stethoscope text-amber-600 text-base mb-1"></i>
                  <span className="text-xs font-bold text-slate-800">Klinik</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}