export default function Tentang() {
  const features = [
    { 
      icon: 'fa-bolt', 
      title: 'Lebih Cepat', 
      desc: 'Ambil nomor antrean medis langsung dari rumah tanpa perlu repot datang pagi buta dan antre fisik berjam-jam.' 
    },
    { 
      icon: 'fa-network-wired', 
      title: 'Terintegrasi', 
      desc: 'Terhubung dengan jaringan fasilitas kesehatan nasional, mulai dari Puskesmas, Klinik Swasta, hingga Rumah Sakit.' 
    },
    { 
      icon: 'fa-mobile-screen', 
      title: 'Live Tracking', 
      desc: 'Pantau sisa antrean dan estimasi waktu panggilan secara real-time langsung dari layar smartphone Anda.' 
    }
  ];

  return (
    <section id="tentang" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-orange-100 text-orange-600 font-bold px-4 py-1.5 rounded-full text-[11px] tracking-widest uppercase mb-5 inline-block">
            Mengenal SehatHub
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
            Apa itu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">SehatHub?</span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            SehatHub adalah platform layanan digital terpadu yang mempermudah masyarakat menemukan fasilitas kesehatan terdekat dan mengambil nomor antrean secara <strong>online</strong>. Kami memutus rantai antrean konvensional yang melelahkan menjadi pengalaman yang serba transparan dan instan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 group hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-300">
                <i className={`fa-solid ${f.icon} text-2xl text-orange-500 group-hover:text-white transition-colors`}></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}