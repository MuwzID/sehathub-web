/**
 * Pure utility functions for SehatHub health logic, queue calculations,
 * GPS routing distance/ETA, and profile validation.
 */

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (
    Number.isNaN(nLat1) ||
    Number.isNaN(nLon1) ||
    Number.isNaN(nLat2) ||
    Number.isNaN(nLon2) ||
    (!nLat1 && !nLon1) ||
    (!nLat2 && !nLon2)
  ) {
    return '0.00';
  }
  const R = 6371;
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

export function calculateEstimatedTravelTime(jarakKm, mode = 'motor') {
  const speedMap = { motor: 40, mobil: 30, jalan: 5 };
  const speed = speedMap[mode] || 40;
  const dist = parseFloat(jarakKm);
  if (Number.isNaN(dist) || dist <= 0) return '< 1 Menit';
  const menit = Math.round((dist / speed) * 60);
  if (menit < 1) return '< 1 Menit';
  if (menit >= 60) {
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    return sisaMenit > 0 ? `${jam} Jam ${sisaMenit} Menit` : `${jam} Jam`;
  }
  return `${menit} Menit`;
}

export function calculateBMI(weightKg, heightCm) {
  const w = parseFloat(weightKg);
  const hCm = parseFloat(heightCm);
  if (Number.isNaN(w) || Number.isNaN(hCm) || w <= 0 || hCm <= 0) {
    return null;
  }
  const hM = hCm / 100;
  const bmiValue = w / (hM * hM);
  const rounded = Number(bmiValue.toFixed(1));

  let category = 'Normal (Ideal)';
  let color = 'emerald';
  let advice = 'Pertahankan pola makan seimbang dan olahraga rutin 30 menit sehari.';

  if (rounded < 18.5) {
    category = 'Berat Badan Kurang';
    color = 'amber';
    advice = 'Tingkatkan asupan nutrisi berprotein tinggi dan konsultasikan ke Poli Gizi.';
  } else if (rounded >= 25 && rounded < 29.9) {
    category = 'Berat Badan Lebih';
    color = 'amber';
    advice = 'Kurangi gula & lemak jenuh, serta tingkatkan aktivitas fisik harian.';
  } else if (rounded >= 30) {
    category = 'Obesitas';
    color = 'rose';
    advice = 'Disarankan melakukan pemeriksaan rutin tekanan darah & gula darah di Puskesmas/Klinik.';
  }

  return {
    bmi: rounded,
    category,
    color,
    advice
  };
}

export function calculateProfileCompletion(user) {
  if (!user) return 0;
  const fields = [
    Boolean(user.name && user.name.trim()),
    Boolean(user.email && user.email.trim()),
    Boolean(user.bio && user.bio.trim()),
    Boolean(user.nik && user.nik.trim().length >= 8),
    Boolean(user.phone && user.phone.trim()),
    Boolean(user.bloodType && user.bloodType !== '-'),
    Boolean(user.birthDate),
    Boolean(user.address && user.address.trim()),
    Boolean(user.heightCm && Number(user.heightCm) > 0 && user.weightKg && Number(user.weightKg) > 0),
    Boolean(user.emergencyContactName && user.emergencyContactPhone)
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function filterFaskes(faskesList, { searchQuery = '', selectedCategory = 'Semua', onlyFavorites = false, favorites = [] } = {}) {
  if (!Array.isArray(faskesList)) return [];
  const q = (searchQuery || '').trim().toLowerCase();

  return faskesList.filter((f) => {
    const matchCategory = selectedCategory === 'Semua' || f.type === selectedCategory;
    const matchFavorite = !onlyFavorites || favorites.includes(f.id);
    const matchSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.city && f.city.toLowerCase().includes(q)) ||
      (f.services && f.services.some((s) => s.toLowerCase().includes(q)));

    return matchCategory && matchFavorite && matchSearch;
  });
}

export function formatQueueMetrics(nomorSekarang, nomorAnda) {
  const current = Math.max(0, Number(nomorSekarang) || 0);
  const target = Math.max(1, Number(nomorAnda) || 1);
  const sisaAntrean = Math.max(0, target - current);
  const estimasiWaktu = sisaAntrean * 5;
  const rawPct = Math.round((current / target) * 100);
  const progressPersen = Math.min(100, Math.max(0, rawPct));

  return {
    sisaAntrean,
    estimasiWaktu,
    progressPersen
  };
}
