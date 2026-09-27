export default function CekAntrean() {
  return (
    <section id="antrean" className="py-20 bg-orange-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Cek Status Antrean</h2>
          <p className="text-slate-600 text-lg">Pantau nomor antrean Anda secara <span className="font-semibold text-orange-500">real-time</span> dari mana saja tanpa harus menumpuk di ruang tunggu fasilitas kesehatan.</p>
        </div>

        <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kode Booking / NIK</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-ticket text-slate-400"></i>
                </div>
                <input 
                  type="text" 
                  placeholder="Contoh: SH-A015" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 flex justify-center items-center gap-2">
              <i className="fa-solid fa-magnifying-glass"></i>
              Lacak Antrean
            </button>
          </div>

          {/* Dummy Hasil Pencarian untuk Demo */}
          <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Simulasi Hasil Pencarian</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Nomor Anda</p>
                <p className="text-3xl font-bold text-orange-500">A-015</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
                <p className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full inline-block">
                  <i className="fa-solid fa-circle-check mr-1"></i> Sedang Menunggu
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}