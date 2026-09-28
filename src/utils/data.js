export const STORAGE_KEYS = {
  accounts: 'sehathub_react_accounts',
  currentUser: 'sehathub_react_user',
  activeQueue: 'sehathub_react_queue'
};

export const INITIAL_FASKES = [
  {
    id: 'f1',
    name: 'Puskesmas Purwokerto Selatan',
    type: 'Puskesmas',
    status: 'Buka',
    distance: '1.2 km',
    hours: '08:00 - 14:00 WIB',
    queueStatus: 'Ramai (24 antrean)',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYYr2GGKSMYAcjCIuPFT3ZSyfnKAB5j_PZh6-WiuEYwpKMCD4jhNIdKCuKnlIh_DACZ4MxKTIUD8onppkUylOurD7pblYyTUIHhEslpJZS__C6mdJDWnHdTudr-OP0svFakqVGiVLDpkNH4hgU1JUzZIBxNcHbJ-2lP1zZG7riA5wZtM6IV7xZFt8K/s1600/20221121_1308595790.jpg',
    services: ['Poli Umum', 'Poli Gigi', 'KIA & KB', 'Farmasi']
  },
  {
    id: 'f2',
    name: 'RSUD Prof. Dr. Margono Soekarjo',
    type: 'Rumah Sakit',
    status: 'Buka',
    distance: '3.5 km',
    hours: '24 Jam · Pendaftaran 07:00 - 11:00 WIB',
    queueStatus: 'Padat (45 antrean)',
    image: 'https://rsmargono.go.id/assets/public/images/building/building_1.jpg',
    services: ['Poli Umum', 'Poli Anak', 'Farmasi']
  },
  {
    id: 'f3',
    name: 'Klinik Pratama Sejahtera',
    type: 'Klinik',
    status: 'Buka',
    distance: '5.0 km',
    hours: '08:00 - 20:00 WIB',
    queueStatus: 'Lancar (2 antrean)',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    services: ['Poli Umum', 'Poli Gigi']
  }
];