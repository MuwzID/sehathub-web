import { useState, useRef, useEffect } from 'react';
import { INITIAL_FASKES } from '../utils/data';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialMessage = { 
    text: "Halo! Saya AI SehatHub 🤖. Saya bisa membantu mengecek status tiket antrean Anda secara otomatis, merekomendasikan Poli berdasarkan gejala keluhan, atau mencarikan faskes terdekat!", 
    sender: 'ai',
    time: getCurrentTime()
  };

  const [messages, setMessages] = useState([initialMessage]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processQuery = (queryText) => {
    const lower = queryText.toLowerCase();
    let reply = "Maaf, saya belum menangkap maksud Anda. Coba tanyakan tentang 'Cek antrean saya', 'Rekomendasi faskes Purwokerto', atau keluhan seperti 'Sakit gigi / Demam'.";

    // 1. Cek Tiket Antrean Aktif milik User dari LocalStorage
    if (lower.includes('tiket saya') || lower.includes('antrean saya') || lower.includes('kode saya') || lower.includes('status saya')) {
      try {
        const lastBooking = JSON.parse(localStorage.getItem('sehathub_last_booking'));
        if (lastBooking) {
          reply = `📋 Data E-Ticket Terakhir Anda:\n• Kode Booking: ${lastBooking.kode}\n• Nomor Urut: ${lastBooking.nomor}\n• Tujuan: ${lastBooking.faskesNama} (${lastBooking.poli || 'Poli Umum'})\n• Jadwal: ${lastBooking.waktu}\n• Status Admin: ${lastBooking.status || 'Menunggu'}`;
        } else {
          reply = "Anda belum memiliki tiket antrean aktif saat ini. Silakan pilih Faskes di daftar utama lalu klik tombol 'Antrean' untuk mendaftar.";
        }
      } catch (e) {
        reply = "Belum ada data antrean yang tersimpan di perangkat Anda.";
      }
    } 
    // 2. Triase Gejala Medis Pintar
    else if (lower.includes('gigi') || lower.includes('gusi') || lower.includes('karang')) {
      reply = "🦷 Untuk keluhan gigi dan mulut, kami menyarankan Anda memilih 'Poli Gigi'. Di Purwokerto, Anda bisa mendaftar ke Puskesmas Purwokerto Selatan, Klinik Pratama UMP, atau Puskesmas Purwokerto Utara II.";
    } else if (lower.includes('demam') || lower.includes('batuk') || lower.includes('flu') || lower.includes('pusing') || lower.includes('sakit kepala')) {
      reply = "🌡️ Untuk gejala demam, flu, atau pusing, silakan ambil antrean di 'Poli Umum' pada Puskesmas atau Klinik Pratama terdekat agar segera mendapat pemeriksaan awal.";
    } else if (lower.includes('darurat') || lower.includes('igd') || lower.includes('kecelakaan') || lower.includes('sesak')) {
      reply = "🚨 KONDISI DARURAT: Segera menuju layanan 'IGD 24 Jam' terdekat seperti RSUD Prof. Dr. Margono Soekarjo ((0281) 632708) atau RS Islam Purwokerto ((0281) 630019)!";
    }
    // 3. Pencarian Faskes Purwokerto / Kategori
    else if (lower.includes('purwokerto') || lower.includes('terdekat') || lower.includes('rekomendasi')) {
      const pwtFaskes = INITIAL_FASKES.filter(f => f.city === 'Purwokerto').map(f => `• ${f.name} (${f.type})`).join('\n');
      reply = `🏥 Berikut daftar Faskes terintegrasi di Purwokerto:\n${pwtFaskes}\n\nAnda bisa langsung klik tombol 'Antrean' atau 'Peta' pada kartu faskes di halaman utama!`;
    } else if (lower.includes('antre') || lower.includes('daftar') || lower.includes('ambil')) {
      reply = "Cara mengambil antrean sangat mudah: Pilih Fasilitas Kesehatan yang Anda tuju, klik tombol 'Antrean', pilih Poli Layanan serta jadwal kunjungan, lalu E-Ticket beserta Kode Booking akan langsung terbit!";
    } else if (lower.includes('lacak') || lower.includes('cek') || lower.includes('kode')) {
      reply = "Anda bisa melacak pergerakan nomor loket secara real-time di bagian 'Lacak Antrean Real-Time', atau ketik 'Cek antrean saya' di chat ini untuk melihat detail tiket Anda!";
    } else if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('siang') || lower.includes('malam')) {
      reply = "Halo! Semoga sehat selalu 👋. Ingin mengecek tiket antrean aktif Anda, mencari faskes di Purwokerto, atau konsultasi poli layanan hari ini?";
    } else if (lower.includes('tim') || lower.includes('pembuat') || lower.includes('siapa') || lower.includes('gejas')) {
      reply = "Platform SehatHub ini dikembangkan dengan penuh dedikasi oleh Gejas Gejes Team sebagai inovasi digitalisasi layanan kesehatan publik yang cepat dan transparan!";
    }

    setMessages(prev => [...prev, { text: reply, sender: 'ai', time: getCurrentTime() }]);
    setIsTyping(false); 
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, sender: 'user', time: getCurrentTime() }]);
    setInput('');
    setIsTyping(true); 

    setTimeout(() => {
      processQuery(userText);
    }, 900);
  };

  const handleQuickClick = (questionText) => {
    setMessages(prev => [...prev, { text: questionText, sender: 'user', time: getCurrentTime() }]);
    setIsTyping(true);
    
    setTimeout(() => {
      processQuery(questionText);
    }, 900);
  };

  const resetChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-40 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 animate-bounce cursor-pointer" onClick={() => setIsOpen(true)}>
          <p className="text-xs font-extrabold text-slate-700">Tanya AI SehatHub <span className="text-sm">👋</span></p>
          <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-100"></div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/40 hover:scale-110 hover:shadow-orange-500/60 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <i className="fa-solid fa-robot text-2xl"></i>
      </button>

      <div className={`fixed bottom-6 right-6 z-50 w-[340px] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-4'}`}>
        
        {/* Header Bot */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 px-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative backdrop-blur-sm border border-white/30">
              <i className="fa-solid fa-robot text-lg"></i>
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-orange-500 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight tracking-wide">SehatHub Smart AI</h3>
              <p className="text-[11px] text-orange-100 font-medium">Asisten Medis & Antrean Real-Time</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={resetChat} title="Bersihkan Obrolan" className="hover:bg-white/20 transition-colors w-8 h-8 rounded-full flex items-center justify-center text-orange-100 hover:text-white">
              <i className="fa-solid fa-broom text-sm"></i>
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 transition-colors w-8 h-8 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Area Pesan */}
        <div className="h-[360px] p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Percakapan Aktif</p>
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fa-solid fa-robot text-orange-500 text-xs"></i>
                </div>
              )}

              <div className={`max-w-[78%] p-3.5 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed whitespace-pre-line relative ${msg.sender === 'user' ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                {msg.text}
                <span className={`block text-[10px] mt-1.5 font-medium ${msg.sender === 'user' ? 'text-orange-100 text-right' : 'text-slate-400 text-left'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-robot text-orange-500 text-xs"></i>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3.5 px-4 shadow-sm flex items-center gap-1.5 w-fit h-10">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="px-3 py-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => handleQuickClick("Cek antrean saya")} className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border border-orange-200 transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-ticket text-orange-500"></i> Cek Tiket Saya
          </button>
          <button onClick={() => handleQuickClick("Rekomendasi faskes Purwokerto")} className="bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border border-slate-200 transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-hospital text-orange-500"></i> Faskes Purwokerto
          </button>
          <button onClick={() => handleQuickClick("Saya keluhan demam & batuk")} className="bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border border-slate-200 transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-stethoscope text-orange-500"></i> Cek Gejala
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Tanya tiket, gejala, atau faskes..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
          />
          <button type="submit" disabled={!input.trim()} className="bg-slate-900 hover:bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>

      </div>
    </>
  );
}