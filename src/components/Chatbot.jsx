import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Fungsi untuk mendapatkan waktu saat ini (HH:MM)
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialMessage = { 
    text: "Halo! Saya AI SehatHub. Ada yang bisa saya bantu terkait pencarian faskes atau cara mengambil antrean?", 
    sender: 'ai',
    time: getCurrentTime()
  };

  const [messages, setMessages] = useState([initialMessage]);
  const messagesEndRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processQuery = (queryText) => {
    const lower = queryText.toLowerCase();
    let reply = "Maaf, saya masih terus belajar. Namun Anda bisa mengeksplorasi layanan kami langsung melalui menu navigasi di atas!";

    if (lower.includes('antre') || lower.includes('tiket') || lower.includes('daftar') || lower.includes('ambil')) {
      reply = "Untuk mengambil antrean, silakan pilih Fasilitas Kesehatan yang Anda tuju, lalu klik tombol 'Antrean' berwarna oranye. Anda akan mendapatkan Kode Booking unik secara otomatis.";
    } else if (lower.includes('lacak') || lower.includes('cek') || lower.includes('status') || lower.includes('kode')) {
      reply = "Anda bisa melacak status antrean secara real-time! Cukup buka menu 'Cek Antrean' di bagian atas, lalu masukkan Kode Booking yang telah Anda dapatkan sebelumnya.";
    } else if (lower.includes('lokasi') || lower.includes('peta') || lower.includes('alamat') || lower.includes('faskes')) {
      reply = "Anda bisa melihat titik lokasi seluruh fasilitas kesehatan secara nasional dengan mengklik tombol 'Peta' pada masing-masing kartu faskes.";
    } else if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('siang')) {
      reply = "Halo juga! Ingin mencari fasilitas kesehatan terdekat atau melacak nomor antrean Anda hari ini?";
    } else if (lower.includes('tim') || lower.includes('pembuat') || lower.includes('siapa') || lower.includes('gejas')) {
      reply = "Website SehatHub ini dikembangkan oleh Tim Gejas Gejes! Sebuah solusi inovatif untuk layanan kesehatan publik.";
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
    }, 1200); // Sedikit lebih lama agar terasa lebih natural
  };

  const handleQuickClick = (questionText) => {
    setMessages(prev => [...prev, { text: questionText, sender: 'user', time: getCurrentTime() }]);
    setIsTyping(true);
    
    setTimeout(() => {
      processQuery(questionText);
    }, 1200);
  };

  const resetChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <>
      {/* Gelembung Sapaan Melayang (Muncul saat bot tertutup) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-40 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 animate-bounce cursor-pointer" onClick={() => setIsOpen(true)}>
          <p className="text-xs font-extrabold text-slate-700">Hai, butuh bantuan? <span className="text-sm">👋</span></p>
          <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-100"></div>
        </div>
      )}

      {/* Tombol Floating */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/40 hover:scale-110 hover:shadow-orange-500/60 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <i className="fa-solid fa-robot text-2xl"></i>
      </button>

      {/* Jendela Chat Utama */}
      <div className={`fixed bottom-6 right-6 z-50 w-[340px] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-4'}`}>
        
        {/* Header Bot */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 px-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative backdrop-blur-sm border border-white/30">
              <i className="fa-solid fa-robot text-lg"></i>
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-orange-500 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight tracking-wide">SehatHub AI</h3>
              <p className="text-[11px] text-orange-100 font-medium">Asisten Virtual Cerdas</p>
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
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hari ini</p>
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar AI jika pengirimnya adalah bot */}
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fa-solid fa-robot text-orange-500 text-xs"></i>
                </div>
              )}

              {/* Gelembung Chat */}
              <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed relative ${msg.sender === 'user' ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                {msg.text}
                <span className={`block text-[10px] mt-1.5 font-medium ${msg.sender === 'user' ? 'text-orange-100 text-right' : 'text-slate-400 text-left'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          
          {/* Animasi Sedang Mengetik (Typing Indicator) */}
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

        {/* Tombol Pilihan Cepat (Quick Chips) */}
        <div className="px-3 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 relative">
          <button onClick={() => handleQuickClick("Cara ambil antrean?")} className="bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap border border-slate-200 hover:border-orange-200 transition-all flex items-center gap-2">
            <i className="fa-solid fa-ticket text-orange-500"></i> Ambil Antrean
          </button>
          <button onClick={() => handleQuickClick("Cara lacak status antrean?")} className="bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap border border-slate-200 hover:border-orange-200 transition-all flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass text-orange-500"></i> Lacak Status
          </button>
          <button onClick={() => handleQuickClick("Siapa pembuat SehatHub?")} className="bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap border border-slate-200 hover:border-orange-200 transition-all flex items-center gap-2">
            <i className="fa-solid fa-code text-orange-500"></i> Info Developer
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ketik pesan Anda..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
          />
          <button type="submit" disabled={!input.trim()} className="bg-slate-900 hover:bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>

      </div>
    </>
  );
}