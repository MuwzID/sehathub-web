import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { INITIAL_FASKES } from '../utils/data';

const createCustomIcon = (type) => {
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

export default function PetaSebaran({ onOpenRouteModal, onOpenBookingModal }) {
  const [activeFilter, setActiveFilter] = useState({
    Puskesmas: true,
    'Rumah Sakit': true,
    Klinik: true,
  });
  const [mapType, setMapType] = useState('street');

  const toggleFilter = (type) => setActiveFilter((prev) => ({ ...prev, [type]: !prev[type] }));
  const filteredFaskes = INITIAL_FASKES.filter((f) => activeFilter[f.type]);
  const mapCenter = [-7.4314, 109.2475];

  return (
    <section id="peta" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Peta Sebaran Fasilitas Kesehatan Interaktif
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Klik penanda lokasi pada peta untuk melihat jam layanan, mengambil nomor antrean, atau menghitung jarak GPS.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* SIDEBAR FILTER */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto shrink-0">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl mb-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <i className="fa-solid fa-layer-group"></i> Filter Peta Faskes
            </h3>
            <p className="text-xs text-orange-50 mt-1">
              Menampilkan {filteredFaskes.length} dari {INITIAL_FASKES.length} lokasi
            </p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">
              <i className="fa-solid fa-map mr-1"></i> MODE TAMPILAN PETA
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMapType('street')}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                  mapType === 'street'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span>Street View (OpenStreetMap)</span>
                {mapType === 'street' && <i className="fa-solid fa-circle-check text-orange-500"></i>}
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                  mapType === 'satellite'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span>Citra Satelit</span>
                {mapType === 'satellite' && <i className="fa-solid fa-circle-check text-orange-500"></i>}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">
              <i className="fa-solid fa-hospital mr-1"></i> KATEGORI FASKES
            </p>
            <div className="space-y-3">
              {['Puskesmas', 'Rumah Sakit', 'Klinik'].map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <i
                      className={`fa-solid ${
                        type === 'Puskesmas'
                          ? 'fa-house-medical text-orange-500'
                          : type === 'Rumah Sakit'
                          ? 'fa-hospital text-rose-500'
                          : 'fa-stethoscope text-amber-500'
                      }`}
                    ></i>
                    {type}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      aria-label={`Tampilkan ${type}`}
                      className="sr-only peer"
                      checked={activeFilter[type]}
                      onChange={() => toggleFilter(type)}
                    />
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
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}

            {filteredFaskes.map((faskes) => (
              <Marker
                key={faskes.id}
                position={[faskes.lat, faskes.lng]}
                icon={createCustomIcon(faskes.type)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[210px] max-w-[240px] font-sans">
                    {faskes.image && (
                      <img
                        src={faskes.image}
                        alt={faskes.name}
                        className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm"
                      />
                    )}
                    <p className="text-[11px] font-bold text-orange-600">
                      {faskes.type} · {faskes.city}
                    </p>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{faskes.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 border-t pt-1.5">
                      Jam: {faskes.hours}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      Antrean: {faskes.queueStatus}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                      {onOpenRouteModal && (
                        <button
                          type="button"
                          onClick={() => onOpenRouteModal(faskes)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Rute GPS
                        </button>
                      )}
                      {onOpenBookingModal && (
                        <button
                          type="button"
                          onClick={() => onOpenBookingModal(faskes)}
                          className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Antrean
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}