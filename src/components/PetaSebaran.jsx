import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { INITIAL_FASKES } from '../utils/data';

// --- CUSTOM ICONS UNTUK MARKER PETA (TEMA ORANGE SEHATHUB) ---
const createCustomIcon = (iconClass, colorClass, bgColorClass) => {
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

const icons = {
  Puskesmas: createCustomIcon('fa-solid fa-house-medical', 'text-orange-600', 'bg-orange-100'),
  'Rumah Sakit': createCustomIcon('fa-solid fa-hospital', 'text-rose-600', 'bg-rose-100'),
  Klinik: createCustomIcon('fa-solid fa-stethoscope', 'text-amber-600', 'bg-amber-100')
};
// -------------------------------------

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
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Marker key={faskes.id} position={[faskes.lat, faskes.lng]} icon={icons[faskes.type]}>
                <Popup className="custom-popup">
                  <div className="text-center p-2 min-w-[150px]">
                    <h4 className="font-bold text-slate-800 text-sm mb-1.5">{faskes.name}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      faskes.type === 'Puskesmas' ? 'bg-orange-100 text-orange-700' : 
                      faskes.type === 'Rumah Sakit' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {faskes.type}
                    </span>
                    <p className="text-xs text-slate-500 mt-2.5 border-t pt-2"><i className="fa-regular fa-clock mr-1"></i> {faskes.hours}</p>
                    <p className="text-xs text-slate-500 mt-1"><i className="fa-solid fa-users mr-1"></i> Status: <span className="font-semibold text-slate-700">{faskes.queueStatus}</span></p>
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