import { useState, useEffect } from 'react';

export default function CekAntrean() {
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, tracking, error
  const [errorMsg, setErrorMsg] = useState('');
  
  const [nomorSekarang, setNomorSekarang] = useState(0);
  const [nomorAnda, setNomorAnda] = useState(0);
  const [faskesNama, setFaskesNama] = useState('');

  // --- FUNGSI SUARA INTERAKTIF ---
  const playSound = (isSuccess) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2); 
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.log('Audio error:', err);
    }
  };

  // Efek simulasi antrean berjalan (naik 1 nomor setiap 6 detik)
  useEffect(() => {
    let interval;
    if (status === 'tracking' && nomorSekarang < nomorAnda) {
      interval = setInterval(() => {
        setNomorSekarang(prev => prev + 1);
      }, 6000); 
    }
    return () => clearInterval(interval);
  }, [status, nomorSekarang, nomorAnda]);

  const handleCek = (e) => {
    e.preventDefault();
    if (!kode.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    // Simulasi loading pencarian data 1.5 detik
    setTimeout(() => {
      try {
        const savedData = JSON.parse(localStorage.getItem('sehathub_last_booking'));

        if (savedData && savedData.kode.toUpperCase() === kode.trim().toUpperCase()) {
          // Ambil angka asli dari nomor antrean (misal "A-24" jadi 24)
          const userNum = parseInt(savedData.nomor.replace(/\D/g, '')) || 15;
          
          setNomorAnda(userNum);
          // Set simulasi seolah-olah antrean kurang 3 orang lagi
          setNomorSekarang(userNum > 3 ? userNum - 3 : 1); 
          setFaskesNama(savedData.faskesNama);

          playSound(true); // Suara sukses!
          setStatus('tracking');
        } else {
          setErrorMsg('Kode Booking tidak valid atau antrean telah selesai.');
          playSound(false); // Suara gagal!
          setStatus('error');
        }
      } catch (err) {
        setErrorMsg('Terjadi kesalahan pada sistem.');
        playSound(false);
        setStatus('error');
      }
    }, 1500);
  };

  const sisaAntrean = nomorAnda - nomorSekarang;
  const estimasiWaktu = sisaAntrean * 5; // Asumsi 1 orang = 5 menit
  const progressPersen = nomorAnda > 0 ? ((nomorSekarang / nomorAnda) * 100).toFixed(0) : 0;

  return (
    <section id="cek-antrean" className="py-20 bg-white relative overflow-hidden">
      <div id="antrean" className="absolute top-0"></div>
      
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Lacak Antrean <span className="text-orange-500">Real-Time</span></h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">Pantau pergerakan nomor antrean Anda dari mana saja. Tidak perlu lagi menunggu lama di ruang tunggu fasilitas kesehatan.</p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
          
          {/* Form Pencarian */}
          <form onSubmit={handleCek} className="max-w-lg mx-auto flex gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-ticket text-slate-400"></i>
              </div>
              <input 
                type="text" 
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="Masukkan Kode Booking / NIK" 
                required 
                maxLength="10"
                className="w-full pl-11 pr-4 py-4 border border-slate-200 bg-white rounded-xl text-sm font-semibold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all uppercase tracking-wider" 
              />
            </div>
            <button type="submit" disabled={status === 'loading' || !kode.trim()} className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center min-w-[120px]">
              {status === 'loading' ? <i className="fa-solid fa-circle-notch fa-spin text-xl"></i> : 'Lacak'}
            </button>
          </form>

          {/* Notifikasi Error */}
          {status === 'error' && (
            <div className="max-w-lg mx-auto mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <div>
                <h5 className="font-bold text-sm">Pencarian Gagal</h5>
                <p className="text-xs mt-1 opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Area Hasil Tracking */}
          {status === 'tracking' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-[fadeIn_0.4s_ease-out]">
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <i className="fa-solid fa-hospital-user text-orange-500 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Kode Booking</p>
                    <p className="text-lg font-extrabold text-slate-800">{kode}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5"><i className="fa-solid fa-location-dot text-orange-400 mr-1"></i> {faskesNama}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Tracking
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                {/* Nomor Berjalan */}
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-slate-500 mb-2">Sedang Dilayani di Loket</p>
                  <div className="text-5xl font-extrabold text-slate-900 mb-2">
                    A-{nomorSekarang.toString().padStart(3, '0')}
                  </div>
                  <p className="text-xs text-slate-400">Panggilan terakhir beberapa saat lalu</p>
                </div>

                {/* Kartu Antrean Anda */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30 relative overflow-hidden">
                  <i className="fa-solid fa-ticket absolute -right-4 -bottom-4 text-8xl opacity-20 transform -rotate-12"></i>
                  <p className="text-orange-100 text-sm font-semibold mb-1">Nomor Antrean Anda</p>
                  <div className="text-4xl font-extrabold mb-4">A-{nomorAnda.toString().padStart(3, '0')}</div>
                  <div className="flex items-center justify-between text-sm font-medium bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    {sisaAntrean <= 0 ? (
                      <span className="flex items-center gap-2 font-bold"><i className="fa-solid fa-bell animate-bounce"></i> Giliran Anda Sekarang!</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-2"><i className="fa-solid fa-users"></i> Sisa {sisaAntrean} orang</span>
                        <span className="flex items-center gap-2"><i className="fa-regular fa-clock"></i> ~{estimasiWaktu} mnt</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Progress Antrean</span>
                  <span>{progressPersen > 100 ? 100 : progressPersen}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-1000 ease-out relative" 
                    style={{ width: `${progressPersen > 100 ? 100 : progressPersen}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}