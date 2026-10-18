import { useState } from 'react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const modalContent = {
    faq: {
      title: 'FAQ / Tanya Jawab',
      icon: 'fa-circle-question',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Apakah layanan SehatHub berbayar?</h4>
            <p className="text-sm text-slate-600 mt-1">Tidak. SehatHub adalah portal layanan publik gratis yang dikembangkan untuk mempermudah masyarakat mengakses fasilitas kesehatan.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Bagaimana jika saya terlambat datang?</h4>
            <p className="text-sm text-slate-600 mt-1">Nomor antrean Anda akan otomatis ditangguhkan. Silakan melapor ke petugas administrasi faskes terkait saat Anda tiba untuk penyesuaian antrean.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Apakah data NIK saya aman?</h4>
            <p className="text-sm text-slate-600 mt-1">Sangat aman. Kami menggunakan enkripsi standar industri dan data hanya diteruskan ke fasilitas kesehatan yang Anda tuju.</p>
          </div>
        </div>
      )
    },
    syarat: {
      title: 'Syarat & Ketentuan',
      icon: 'fa-file-contract',
      content: (
        <div className="text-sm text-slate-600 space-y-3">
          <p>Dengan menggunakan platform SehatHub, Anda menyetujui ketentuan berikut:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pengguna wajib memberikan data identitas asli saat mengambil antrean.</li>
            <li>Penyalahgunaan sistem antrean (seperti spam pendaftaran) akan mengakibatkan pemblokiran akun/NIK.</li>
            <li>Estimasi waktu pelayanan yang ditampilkan adalah perkiraan dan dapat berubah sesuai kondisi riil di lapangan.</li>
            <li>SehatHub tidak bertanggung jawab atas pembatalan sepihak oleh fasilitas kesehatan.</li>
          </ul>
        </div>
      )
    },
    privasi: {
      title: 'Kebijakan Privasi',
      icon: 'fa-shield-halved',
      content: (
        <div className="text-sm text-slate-600 space-y-3">
          <p>Privasi Anda adalah prioritas utama kami. Berikut adalah ringkasan pengelolaan data di SehatHub:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Data yang dikumpulkan (Nama, NIK, No. HP) murni digunakan untuk keperluan pendaftaran medis.</li>
            <li>Data tidak akan pernah dijual atau dibagikan kepada pihak ketiga untuk keperluan komersial.</li>
            <li>Kami menggunakan <span className="font-bold">Local Storage</span> dan sistem yang aman untuk menjaga kredensial login Anda.</li>
          </ul>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 border-t-4 border-orange-500 pt-16 pb-8 mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Area Utama Footer (4 Kolom) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 border-b border-slate-800 pb-12">
            
            {/* Kolom 1: Brand & Deskripsi */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon-s.svg" alt="Icon" className="h-8 brightness-0 invert" />
                <span className="text-2xl font-bold text-white">SehatHub</span>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Portal terpadu untuk pencarian fasilitas kesehatan dan antrean online. Menghadirkan akses kesehatan yang lebih cepat dan transparan untuk warga Purwokerto dan sekitarnya.
              </p>
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

            {/* Kolom 3: Layanan & Bantuan (Dimodifikasi Menjadi Tombol Modal) */}
            <div>
              <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Bantuan</h4>
              <ul className="space-y-3 text-sm">
                <li><span className="text-slate-500 transition-colors inline-flex items-center gap-2 cursor-not-allowed"><i className="fa-solid fa-angle-right text-xs"></i> Artikel Kesehatan (Segera)</span></li>
                <li><button onClick={() => setActiveModal('faq')} className="hover:text-orange-500 transition-colors inline-flex items-center gap-2 text-left w-full"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> FAQ / Tanya Jawab</button></li>
                <li><button onClick={() => setActiveModal('syarat')} className="hover:text-orange-500 transition-colors inline-flex items-center gap-2 text-left w-full"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Syarat & Ketentuan</button></li>
                <li><button onClick={() => setActiveModal('privasi')} className="hover:text-orange-500 transition-colors inline-flex items-center gap-2 text-left w-full"><i className="fa-solid fa-angle-right text-xs text-orange-500"></i> Kebijakan Privasi</button></li>
              </ul>
            </div>

            {/* Kolom 4: Mitra / Kolaborasi */}
            <div>
              <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Kolaborasi</h4>
              <p className="text-sm text-slate-400 mb-4">Tertarik mengintegrasikan faskes Anda dengan sistem antrean SehatHub?</p>
              <button onClick={() => alert('Fitur Pendaftaran Mitra akan segera hadir!')} className="bg-slate-800 hover:bg-orange-500 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors border border-slate-700 hover:border-orange-500 w-full mb-4">
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
              <div className="flex items-center gap-3 text-slate-600">
                 <span className="text-xs font-medium uppercase tracking-wider">Tech Stack:</span>
                 <i className="fa-brands fa-react text-xl hover:text-[#61DAFB] transition-colors cursor-help" title="React JS"></i>
                 <i className="fa-brands fa-css3-alt text-xl hover:text-[#38B2AC] transition-colors cursor-help" title="Tailwind CSS"></i>
                 <i className="fa-brands fa-github text-xl hover:text-white transition-colors cursor-help" title="GitHub"></i>
              </div>
              
              <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs">
                Dibuat oleh <span className="font-bold text-orange-500">Gejas Gejes Team</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal Bantuan */}
      {activeModal && modalContent[activeModal] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <i className={`fa-solid ${modalContent[activeModal].icon} text-orange-500`}></i>
                {modalContent[activeModal].title}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-orange-500 bg-white hover:bg-orange-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm border border-slate-200">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modalContent[activeModal].content}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => setActiveModal(null)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-orange-500/20">
                Tutup Paham
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}