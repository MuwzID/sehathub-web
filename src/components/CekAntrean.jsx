import { useState, useEffect } from 'react';
import { formatQueueMetrics } from '../utils/healthUtils';

export default function CekAntrean() {
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, tracking, error
  const [errorMsg, setErrorMsg] = useState('');

  const [nomorSekarang, setNomorSekarang] = useState(0);
  const [nomorAnda, setNomorAnda] = useState(0);
  const [faskesNama, setFaskesNama] = useState('');
  const [poliLayanan, setPoliLayanan] = useState('Poli Umum');
  const [statusVerifikasi, setStatusVerifikasi] = useState('Menunggu');
  const [jadwalWaktu, setJadwalWaktu] = useState('');

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
    } catch {
      // Audio playback blocked or unavailable
    }
  };

  useEffect(() => {
    let interval;
    if (status === 'tracking' && nomorSekarang < nomorAnda) {
      interval = setInterval(() => {
        setNomorSekarang((prev) => prev + 1);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [status, nomorSekarang, nomorAnda]);

  const lacakKodeBooking = (kodeInput) => {
    const cleanKode = (kodeInput || '').trim().toUpperCase();
    if (!cleanKode) return;

    setStatus('loading');
    setErrorMsg('');

    setTimeout(() => {
      try {
        const allBookings = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
        const lastBooking = JSON.parse(localStorage.getItem('sehathub_last_booking'));

        let foundBooking = allBookings.find((b) => b.kode.toUpperCase() === cleanKode);
        if (!foundBooking && lastBooking && lastBooking.kode.toUpperCase() === cleanKode) {
          foundBooking = lastBooking;
        }

        if (foundBooking) {
          const userNum = parseInt(foundBooking.nomor.replace(/\D/g, ''), 10) || 15;
          const currentVerif = foundBooking.status || 'Menunggu';

          setNomorAnda(userNum);
          setStatusVerifikasi(currentVerif);
          setJadwalWaktu(foundBooking.waktu || '-');
          setFaskesNama(foundBooking.faskesNama);
          setPoliLayanan(foundBooking.poli || 'Poli Umum');

          if (currentVerif === 'Selesai') {
            setNomorSekarang(userNum);
          } else {
            setNomorSekarang(userNum > 3 ? userNum - 3 : 1);
          }

          playSound(true);
          setStatus('tracking');
        } else {
          setErrorMsg('Kode Booking tidak ditemukan. Pastikan kode sesuai dengan E-Ticket Anda.');
          playSound(false);
          setStatus('error');
        }
      } catch {
        setErrorMsg('Terjadi kesalahan pada sistem.');
        playSound(false);
        setStatus('error');
      }
    }, 500);
  };

  const handleCek = (e) => {
    e.preventDefault();
    lacakKodeBooking(kode);
  };

  const isiKodeTerakhir = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('sehathub_last_booking'));
      if (saved && saved.kode) {
        setKode(saved.kode);
        lacakKodeBooking(saved.kode);
        return;
      }
      const all = JSON.parse(localStorage.getItem('sehathub_all_bookings')) || [];
      if (all.length > 0) {
        const latest = all[all.length - 1];
        setKode(latest.kode);
        lacakKodeBooking(latest.kode);
      } else {
        setErrorMsg('Belum ada E-Ticket antrean tersimpan di perangkat Anda. Silakan ambil antrean pada kartu Faskes terlebih dahulu.');
        setStatus('error');
      }
    } catch {
      // Ignore storage read error
    }
  };

  const { sisaAntrean, estimasiWaktu, progressPersen } = formatQueueMetrics(nomorSekarang, nomorAnda);

  return (
    <section id="cek-antrean" className="py-20 bg-white relative overflow-hidden">
      <div id="antrean" className="absolute top-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Lacak Antrean <span className="text-orange-500">Real-Time</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Pantau pergerakan nomor loket dan status verifikasi admin fasilitas kesehatan langsung dari rumah.
          </p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200/80">
          {/* Form Pencarian */}
          <form onSubmit={handleCek} className="max-w-lg mx-auto flex gap-3 mb-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-ticket text-slate-400"></i>
              </div>
              <input
                type="text"
                aria-label="Kode Booking Antrean"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="Masukkan Kode Booking (Contoh: SH-8K2M)"
                required
                maxLength="10"
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 bg-white rounded-xl text-sm font-mono font-semibold outline-none focus:border-orange-500 transition-all uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !kode.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center min-w-[110px] cursor-pointer"
            >
              {status === 'loading' ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : 'Lacak'}
            </button>
          </form>

          {/* Pintasan Isi Kode Otomatis */}
          <div className="max-w-lg mx-auto mb-6 flex justify-end">
            <button
              type="button"
              onClick={isiKodeTerakhir}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-bolt"></i> Gunakan &amp; Lacak Kode Booking Terakhir Saya
            </button>
          </div>

          {/* Notifikasi Error */}
          {status === 'error' && (
            <div className="max-w-lg mx-auto mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start gap-3">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <div>
                <h5 className="font-bold text-sm">Pencarian Tidak Ditemukan</h5>
                <p className="text-xs mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Area Hasil Tracking */}
          {status === 'tracking' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-hospital-user text-orange-500 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">
                      Kode Booking: <span className="text-orange-600 font-mono tabular-nums">{kode}</span> · {poliLayanan}
                    </p>
                    <p className="text-base font-extrabold text-slate-900">{faskesNama}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Jadwal Kunjungan: {jadwalWaktu}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span
                    className={`text-xs font-bold ${
                      statusVerifikasi === 'Disetujui'
                        ? 'text-emerald-600'
                        : statusVerifikasi === 'Selesai'
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    <i
                      className={`fa-solid mr-1.5 ${
                        statusVerifikasi === 'Disetujui'
                          ? 'fa-circle-check'
                          : statusVerifikasi === 'Selesai'
                          ? 'fa-flag-checkered'
                          : 'fa-clock'
                      }`}
                    ></i>
                    Status Admin: {statusVerifikasi}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                {/* Nomor Berjalan */}
                <div className="text-center md:text-left">
                  <p className="text-xs font-bold text-slate-500 mb-1">Sedang Dilayani di Loket</p>
                  <div className="text-5xl font-extrabold font-mono tabular-nums text-slate-900 mb-1">
                    A-{nomorSekarang.toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs text-slate-400">Diperbarui otomatis secara berkala</p>
                </div>

                {/* Kartu Antrean Anda */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <p className="text-orange-100 text-xs font-bold mb-1">Nomor Antrean Anda</p>
                  <div className="text-4xl font-extrabold font-mono tabular-nums mb-4">
                    A-{nomorAnda.toString().padStart(2, '0')}
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold bg-white/20 p-3 rounded-xl backdrop-blur-sm font-mono tabular-nums">
                    {sisaAntrean <= 0 ? (
                      <span className="flex items-center gap-2 font-bold">
                        <i className="fa-solid fa-bell"></i> Giliran Anda Sekarang / Selesai!
                      </span>
                    ) : (
                      <>
                        <span>Sisa {sisaAntrean} antrean</span>
                        <span>Estimasi ~{estimasiWaktu} menit</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2 font-mono tabular-nums">
                  <span>Progres Antrean Loket</span>
                  <span>{progressPersen}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPersen}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}