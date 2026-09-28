export default function Panduan() {
  const steps = [
    { id: 1, title: 'Pilih Faskes', desc: 'Cari dan pilih Puskesmas atau Klinik terdekat dari lokasi anda.', icon: 'fa-hospital' },
    { id: 2, title: 'Ambil Antrean', desc: 'Daftar secara online dan dapatkan nomor urut antrean digital.', icon: 'fa-mobile-screen' },
    { id: 3, title: 'Pantau Real-time', desc: 'Cek sisa antrean melalui website tanpa harus menunggu di lokasi.', icon: 'fa-clock' },
    { id: 4, title: 'Datang Berobat', desc: 'Datang ke faskes saat nomor antrean anda sudah hampir dipanggil.', icon: 'fa-stethoscope' }
  ];

  return (
    <section id="panduan" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Cara Kerja SehatHub</h2>
          <p className="text-slate-600 text-lg">Langkah mudah menggunakan layanan kami untuk pengalaman berobat yang lebih nyaman dan efisien.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Garis penghubung background (hanya tampil di desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-orange-100 z-0"></div>

          {steps.map((step) => (
            <div key={step.id} className="text-center group relative z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-500 shadow-xl shadow-slate-200/50 border-2 border-orange-50 group-hover:border-orange-500 group-hover:-translate-y-2">
                <i className={`fa-solid ${step.icon} text-3xl text-orange-500 group-hover:text-white transition-colors duration-500`}></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.id}. {step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}