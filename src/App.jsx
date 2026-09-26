import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { STORAGE_KEYS, INITIAL_FASKES } from './utils/data';
import Chatbot from './components/Chatbot';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)); } catch { return null; }
  });
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [toastMessage, setToastMessage] = useState(null);
  
  const showToast = (title, desc) => { 
    setToastMessage({ title, desc }); 
    setTimeout(() => setToastMessage(null), 3500); 
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const demoUser = { name: 'Warga Demo', email: 'demo@sehathub.id' };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(demoUser));
    setModalState({ type: null });
    showToast('Berhasil Masuk', 'Selamat datang di SehatHub!');
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem(STORAGE_KEYS.currentUser); 
    showToast('Keluar', 'Anda telah keluar.'); 
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-2xl flex gap-3 modal-animation">
          <i className="fa-solid fa-circle-check text-orange-500 text-xl"></i>
          <div><h5 className="font-bold text-sm">{toastMessage.title}</h5><p className="text-xs text-slate-500">{toastMessage.desc}</p></div>
        </div>
      )}

      <Navbar user={user} onLogout={handleLogout} onLoginClick={() => setModalState({ type: 'auth' })} />
      <Hero />

      <section id="faskes" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Fasilitas Kesehatan Terdekat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_FASKES.map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col card-hover">
              <div className="h-40 relative overflow-hidden">
                <img src={f.image} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded w-fit mb-2">{f.type}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{f.name}</h3>
                <p className="text-xs text-slate-500 mb-4"><i className="fa-solid fa-location-arrow mr-1 text-slate-400"></i> {f.distance} | {f.hours}</p>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={() => setModalState({ type: 'map', data: f })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors"><i className="fa-solid fa-map-location-dot"></i> Peta</button>
                  <button onClick={() => user ? showToast('Berhasil', 'Antrean diproses.') : setModalState({ type: 'auth' })} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-orange-500/20"><i className="fa-solid fa-ticket"></i> Antrean</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

<Chatbot />
  
      <Footer />

      {modalState.type === 'map' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative h-[600px] flex flex-col modal-animation">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-slate-800">Peta Lokasi</h3><button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-slate-700"><i className="fa-solid fa-xmark text-lg"></i></button></div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-slate-100 relative">
              <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(modalState.data?.name + ' Purwokerto')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} className="absolute inset-0 w-full h-full border-0" title="Peta Lokasi"></iframe>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative modal-animation">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-slate-800">Masuk Akun Demo</h3><button onClick={() => setModalState({ type: null })} className="text-slate-400 hover:text-slate-700"><i className="fa-solid fa-xmark text-lg"></i></button></div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email bebas..." required className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
              <input type="password" placeholder="Password bebas..." required className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-colors">Masuk Sekarang</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}