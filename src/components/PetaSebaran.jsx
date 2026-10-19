import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { INITIAL_FASKES } from '../utils/data';

// --- CUSTOM ICONS UNTUK MARKER PETA (TERSELARAS 100%) ---
const createCustomIcon = (type) => {
  // Atur warna dan ikon khusus berdasarkan tipe faskes
  let iconClass = 'fa-solid fa-house-medical';
  let colorClass = 'text-orange-600';
  let bgColorClass = 'bg-orange-100';

  if (type === 'Rumah Sakit') {
    iconClass = 'fa-solid fa-hospital';
    colorClass = 'text-rose-600';
    bgColorClass = 'bg-rose-100';
  } else if (type === 'Klinik') {
    iconClass = 'fa-solid fa-stethoscope';
    colorClass = 'text-amber-600';
    bgColorClass = 'bg-amber-100';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 ${bgColorClass} rounded-full shadow-lg border-2 border-white transform transition-transform hover:scale-110">
        <i class="${iconClass} ${colorClass} text-lg"></i>
        <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${bgColorClass.replace('bg-', 'border-t-')}"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 48],
    popupAnchor: [0, -45]
  });
};

export default function PetaSebaran() {
  const [activeFilter, setActiveFilter] = useState({
    Puskesmas: true,
    'Rumah Sakit': true,
    Klinik: true,
  });
  const [mapType, setMapType] = useState('street');

  const toggleFilter = (type) => setActiveFilter(prev => ({ ...prev, [type]: !prev[type] }));
  const filteredFaskes = INITIAL_FASKES.filter(f => activeFilter[f.type]);
  const mapCenter = [-7.4314, 109.2475]; 

  return (
    <section id="peta" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* SIDEBAR FILTER (TEMA ORANGE) */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto">
          
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl mb-6 shadow-md">
            <h3 className="font-bold flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> Filter Peta Faskes</h3>
            <p className="text-xs text-orange-50 mt-1">Atur Tipe & Layer Objek</p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider"><i className="fa-solid fa-map mr-1"></i> TIPE PETA</p>
            <div className="space-y-2">
              <button onClick={() => setMapType('street')} className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-bold flex justify-between items-center transition-all ${mapType === 'street' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                <span>Street View</span>{mapType === 'street' && <i className="fa-solid fa-circle-check text-orange-500"></i>}
              </button>
              <button onClick={() => setMapType('satellite')} className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-bold flex justify-between items-center transition-all ${mapType === 'satellite' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                <span>Satelit</span>{mapType === 'satellite' && <i className="fa-solid fa-circle-check text-orange-500"></i>}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider"><i className="fa-solid fa-hospital mr-1"></i> KATEGORI FASKES</p>
            <div className="space-y-3">
              {['Puskesmas', 'Rumah Sakit', 'Klinik'].map(type => (
                <div key={type} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${type === 'Puskesmas' ? 'bg-orange-500' : type === 'Rumah Sakit' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                    {type}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={activeFilter[type]} onChange={() => toggleFilter(type)} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AREA PETA */}
        <div className="flex-1 relative z-0">
          <MapContainer center={mapCenter} zoom={13} className="w-full h-full z-0">
            {mapType === 'street' ? (
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            ) : (
              <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            )}
            
            {filteredFaskes.map(faskes => (
              <Marker key={faskes.id} position={[faskes.lat, faskes.lng]} icon={createCustomIcon(faskes.type)}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[200px] max-w-[240px] font-sans">
                    {faskes.image && (
                      <img src={faskes.image} alt={faskes.name} className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm" />
                    )}
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{faskes.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      faskes.type === 'Puskesmas' ? 'bg-orange-100 text-orange-700' : 
                      faskes.type === 'Rumah Sakit' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {faskes.type}
                    </span>
                    <p className="text-xs text-slate-500 mt-2 border-t pt-2 flex items-center gap-1"><i className="fa-regular fa-clock text-slate-400"></i> {faskes.hours}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><i className="fa-solid fa-users text-slate-400"></i> Antrean: <span className="font-semibold text-slate-700">{faskes.queueStatus}</span></p>

                    <button
                      type="button"
                      onClick={() => {
                        const destination = encodeURIComponent(faskes.name + ' ' + (faskes.city || ''));
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                      }}
                      className="mt-3 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-route"></i> Petunjuk Rute GPS
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* LEGENDA PETA */}
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 hidden md:block w-48">
            <p className="text-xs font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-1.5"><i className="fa-solid fa-map-location-dot text-orange-600"></i> Legenda Peta</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200"><i className="fa-solid fa-house-medical text-[10px] text-orange-600"></i></div>
                <span className="text-[11px] text-slate-600 font-medium">Puskesmas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200"><i className="fa-solid fa-hospital text-[10px] text-rose-600"></i></div>
                <span className="text-[11px] text-slate-600 font-medium">Rumah Sakit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200"><i className="fa-solid fa-stethoscope text-[10px] text-amber-600"></i></div>
                <span className="text-[11px] text-slate-600 font-medium">Klinik</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}