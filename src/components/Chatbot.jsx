import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "Halo! Saya Asisten AI SehatHub. Ada yang bisa saya bantu terkait pencarian faskes atau panduan ambil antrean?", sender: 'ai' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processQuery = (queryText) => {
    const lower = queryText.toLowerCase();
    let reply = "Wah, pertanyaan yang bagus! Saat ini saya mencatat hal tersebut untuk pengembangan fitur berikutnya di SehatHub.";

    if (lower.includes('antre') || lower.includes('tiket') || lower.includes('daftar')) {
      reply = "Untuk mengambil antrean, silakan pilih salah satu Fasilitas Kesehatan di beranda, lalu klik tombol 'Antrean' di kartu faskes tersebut ya!";
    } else if (lower.includes('lokasi') || lower.includes('peta') || lower.includes('alamat') || lower.includes('faskes')) {
      reply = "Anda bisa melihat titik lokasi fasilitas kesehatan secara langsung dengan mengklik tombol 'Peta' pada masing-masing kartu faskes.";
    } else if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('siang')) {
      reply = "Halo juga! Ada fasilitas kesehatan di Purwokerto yang sedang ingin Anda cari hari ini?";
    } else if (lower.includes('tim') || lower.includes('pembuat') || lower.includes('siapa')) {
      reply = "Website SehatHub ini dikembangkan oleh Tim Gejas Gejes untuk kompetisi IT FEST 2026!";
    }

    setMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      processQuery(userText);
    }, 800);
  };

  const handleQuickClick = (questionText) => {
    setMessages(prev => [...prev, { text: questionText, sender: 'user' }]);
    setTimeout(() => {
      processQuery(questionText);
    }, 600);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-110 hover:shadow-orange-500/50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <i className="fa-solid fa-robot text-2xl animate-bounce"></i>
      </button>

      <div className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fa-solid fa-robot text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">SehatHub AI</h3>
              <p className="text-[10px] text-orange-100">Aktif & Siap Membantu</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:text-slate-200 transition-colors w-8 h-8 flex items-center justify-center">
            <i className="fa-solid fa-chevron-down"></i>
          </button>
        </div>

        <div className="h-72 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-orange-500 text-white self-end rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-bl-none'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Tombol Pilihan Cepat (Quick Chips) */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button onClick={() => handleQuickClick("Bagaimana cara ambil antrean?")} className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border border-orange-200 transition-colors">
            🎟️ Cara Ambil Antrean?
          </button>
          <button onClick={() => handleQuickClick("Bagaimana cara cek lokasi faskes?")} className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border border-orange-200 transition-colors">
            📍 Cek Lokasi Faskes
          </button>
          <button onClick={() => handleQuickClick("Siapa pembuat website ini?")} className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border border-orange-200 transition-colors">
            👥 Siapa Pembuatnya?
          </button>
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Tanya sesuatu..." 
            className="flex-1 bg-slate-100 border border-transparent rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-orange-500 transition-colors"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors">
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </>
  );
}