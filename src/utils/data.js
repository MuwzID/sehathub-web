import puskImg from '../assets/puskesmas.jpeg';
import rsImg from '../assets/margono.jpeg';

export const STORAGE_KEYS = {
  accounts: 'sehathub_react_accounts',
  currentUser: 'sehathub_react_user',
  activeQueue: 'sehathub_react_queue'
};

export const INITIAL_FASKES = [
  // --- JAWA ---
  { id: 'f1', name: 'Puskesmas Purwokerto Selatan', type: 'Puskesmas', city: 'Purwokerto', status: 'Buka', distance: '1.2 km', hours: '08:00 - 14:00 WIB', queueStatus: 'Ramai (24 antrean)', image: puskImg, services: ['Poli Umum', 'Poli Gigi', 'Farmasi'], lat: -7.4478, lng: 109.2353 },
  { id: 'f2', name: 'RSUD Prof. Dr. Margono Soekarjo', type: 'Rumah Sakit', city: 'Purwokerto', status: 'Buka', distance: '3.5 km', hours: '24 Jam', queueStatus: 'Padat (45 antrean)', image: rsImg, services: ['Poli Umum', 'IGD', 'Poli Anak'], lat: -7.4452, lng: 109.2666 },
  { id: 'f4', name: 'RSUPN Dr. Cipto Mangunkusumo (RSCM)', type: 'Rumah Sakit', city: 'Jakarta', status: 'Buka', distance: 'Ibukota', hours: '24 Jam', queueStatus: 'Padat (60 antrean)', image: rsImg, services: ['Poli Jantung', 'IGD'], lat: -6.1944, lng: 106.8456 },
  { id: 'f5', name: 'RSUD Dr. Soetomo', type: 'Rumah Sakit', city: 'Surabaya', status: 'Buka', distance: 'Jawa Timur', hours: '24 Jam', queueStatus: 'Ramai (35 antrean)', image: rsImg, services: ['Poli Bedah', 'Poli Anak'], lat: -7.2658, lng: 112.7539 },
  { id: 'f6', name: 'Puskesmas Garuda Bandung', type: 'Puskesmas', city: 'Bandung', status: 'Buka', distance: 'Jawa Barat', hours: '08:00 - 15:00 WIB', queueStatus: 'Lancar (5 antrean)', image: puskImg, services: ['Poli Umum', 'KIA'], lat: -6.9175, lng: 107.5947 },

  // --- SUMATERA ---
  { id: 'f14', name: 'RSUP Dr. M. Djamil Padang', type: 'Rumah Sakit', city: 'Padang', status: 'Buka', distance: 'Sumatera Barat', hours: '24 Jam', queueStatus: 'Padat (40 antrean)', image: rsImg, services: ['IGD', 'Poli Penyakit Dalam'], lat: -0.9471, lng: 100.3623 },
  { id: 'f15', name: 'RSUD H. Adam Malik Medan', type: 'Rumah Sakit', city: 'Medan', status: 'Buka', distance: 'Sumatera Utara', hours: '24 Jam', queueStatus: 'Ramai (30 antrean)', image: rsImg, services: ['Poli Anak', 'Poli Bedah'], lat: 3.5186, lng: 98.6214 },
  { id: 'f16', name: 'Puskesmas Kampus Palembang', type: 'Puskesmas', city: 'Palembang', status: 'Buka', distance: 'Sumatera Selatan', hours: '08:00 - 14:00 WIB', queueStatus: 'Lancar (4 antrean)', image: puskImg, services: ['Poli Umum', 'Farmasi'], lat: -2.9761, lng: 104.7754 },

  // --- KALIMANTAN ---
  { id: 'f17', name: 'RSUD Dr. R. Soedarso Pontianak', type: 'Rumah Sakit', city: 'Pontianak', status: 'Buka', distance: 'Kalimantan Barat', hours: '24 Jam', queueStatus: 'Sedang (12 antrean)', image: rsImg, services: ['IGD', 'Poli Umum'], lat: -0.0263, lng: 109.3425 },
  { id: 'f18', name: 'RSUD Dr. H. Moch. Ansari Saleh Banjarmasin', type: 'Rumah Sakit', city: 'Banjarmasin', status: 'Buka', distance: 'Kalimantan Selatan', hours: '24 Jam', queueStatus: 'Ramai (22 antrean)', image: rsImg, services: ['Poli Saraf', 'Poli Anak'], lat: -3.3186, lng: 114.5915 },

  // --- SULAWESI ---
  { id: 'f19', name: 'RSUP Prof. Dr. R.D. Kandou Manado', type: 'Rumah Sakit', city: 'Manado', status: 'Buka', distance: 'Sulawesi Utara', hours: '24 Jam', queueStatus: 'Padat (38 antrean)', image: rsImg, services: ['IGD', 'Poli Jantung'], lat: 1.4489, lng: 124.8451 },
  { id: 'f20', name: 'RS Wahidin Sudirohusodo Makassar', type: 'Rumah Sakit', city: 'Makassar', status: 'Buka', distance: 'Sulawesi Selatan', hours: '24 Jam', queueStatus: 'Padat (55 antrean)', image: rsImg, services: ['Poli Bedah', 'Poli Penyakit Dalam'], lat: -5.1353, lng: 119.4912 },

  // --- BALI & NUSA TENGGARA ---
  { id: 'f21', name: 'RSUP Prof. Dr. I.G.N.G Ngoerah Denpasar', type: 'Rumah Sakit', city: 'Denpasar', status: 'Buka', distance: 'Bali', hours: '24 Jam', queueStatus: 'Padit (48 antrean)', image: rsImg, services: ['IGD', 'Poli Mata'], lat: -8.6705, lng: 115.2126 },
  { id: 'f22', name: 'RSUD Prof. Dr. W. Z. Johannes Kupang', type: 'Rumah Sakit', city: 'Kupang', status: 'Buka', distance: 'Nusa Tenggara Timur', hours: '24 Jam', queueStatus: 'Ramai (18 antrean)', image: rsImg, services: ['Poli Umum', 'KIA'], lat: -10.1772, lng: 123.6070 },

  // --- MALUKU & PAPUA ---
  { id: 'f23', name: 'RSUD Dr. M. Haulussy Ambon', type: 'Rumah Sakit', city: 'Ambon', status: 'Buka', distance: 'Maluku', hours: '24 Jam', queueStatus: 'Sedang (10 antrean)', image: rsImg, services: ['IGD', 'Poli Anak'], lat: -3.6954, lng: 128.1814 },
  { id: 'f24', name: 'RSUD Dok II Jayapura', type: 'Rumah Sakit', city: 'Jayapura', status: 'Buka', distance: 'Papua', hours: '24 Jam', queueStatus: 'Ramai (25 antrean)', image: rsImg, services: ['Poli Bedah', 'Poli Umum'], lat: -2.5337, lng: 140.7180 }
];