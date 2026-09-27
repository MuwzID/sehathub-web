export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-orange-500 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Area Utama Footer (4 Kolom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 border-b border-slate-800 pb-12">
          
          {/* Kolom 1: Brand & Deskripsi */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* Pastikan path icon-s.svg ini sesuai dengan icon logomu */}
              <img src="/icon-s.svg" alt="Icon" className="h-8 brightness-0 invert" />
              <span className="text-2xl font-bold text-white">SehatHub</span>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Portal terpadu untuk pencarian fasilitas kesehatan dan antrean online. Menghadirkan akses kesehatan yang lebih cepat dan transparan untuk warga Purwokerto dan sekitarnya.
            </p>
            {/* Ikon Sosial Media (Sekarang ada efek warna saat di-hover) */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"><i className="fa-brands fa-x-twitter"></i></a>
            </div>
          </div>

          {/* Kolom 2: Eksplorasi */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Eksplorasi</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#beranda" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Beranda Utama</a></li>
              <li><a href="#faskes" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Daftar Fasilitas Kesehatan</a></li>
              <li><a href="#antrean" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Cek Status Antrean</a></li>
              <li><a href="#panduan" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Panduan Penggunaan</a></li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Bantuan (Menu Baru) */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Bantuan</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Artikel Kesehatan (Segera)</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> FAQ / Tanya Jawab</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors inline-flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Kolom 4: Mitra / Kolaborasi (Menu Baru) */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Kolaborasi</h4>
            <p className="text-sm text-slate-400 mb-4">Tertarik mengintegrasikan faskes Anda dengan sistem antrean SehatHub?</p>
            <button className="bg-slate-800 hover:bg-orange-500 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors border border-slate-700 hover:border-orange-500 w-full mb-4">
              Daftar Sebagai Mitra
            </button>
            <div className="text-xs text-slate-500">
              <span className="block font-medium text-slate-400 mb-1">Mendukung Fasilitas:</span>
              Puskesmas, Klinik Swasta, Apotek
            </div>
          </div>

        </div>

        {/* Area Bawah (Copyright & Tech Stack) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="text-center md:text-left">
            <span>© 2026 SehatHub. Purwokerto, Jawa Tengah.</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Tech Stack (Menggantikan logo partner pemerintah di contoh) */}
            <div className="flex items-center gap-3 text-slate-600">
               <span className="text-xs font-medium uppercase tracking-wider">Tech Stack:</span>
               <i className="fa-brands fa-react text-xl hover:text-[#61DAFB] transition-colors cursor-help" title="React JS"></i>
               <i className="fa-brands fa-css3-alt text-xl hover:text-[#38B2AC] transition-colors cursor-help" title="Tailwind CSS"></i>
               <i className="fa-brands fa-github text-xl hover:text-white transition-colors cursor-help" title="GitHub"></i>
            </div>
            
            {/* Badge Gejas Gejes */}
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs">
              Dibuat oleh <span className="font-bold text-orange-500">Gejas Gejes Team</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}