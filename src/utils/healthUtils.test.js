import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  calculateEstimatedTravelTime,
  calculateBMI,
  calculateProfileCompletion,
  filterFaskes,
  formatQueueMetrics
} from './healthUtils.js';

test('calculateHaversineDistance computes accurate km distance between Purwokerto coordinates', () => {
  const dist = calculateHaversineDistance(-7.4478, 109.2353, -7.4452, 109.2666);
  const numeric = parseFloat(dist);
  assert.ok(numeric > 3.0 && numeric < 4.0, `Expected ~3.46 km, got ${dist}`);
  assert.equal(calculateHaversineDistance(null, null, -7.4, 109.2), '0.00');
});

test('calculateEstimatedTravelTime formats minutes and hours properly', () => {
  assert.equal(calculateEstimatedTravelTime('0.1', 'motor'), '< 1 Menit');
  assert.equal(calculateEstimatedTravelTime('10', 'motor'), '15 Menit');
  assert.equal(calculateEstimatedTravelTime('45', 'mobil'), '1 Jam 30 Menit');
  assert.equal(calculateEstimatedTravelTime('5', 'jalan'), '1 Jam');
});

test('calculateBMI returns accurate BMI value and health category', () => {
  const ideal = calculateBMI(65, 170);
  assert.equal(ideal.bmi, 22.5);
  assert.equal(ideal.category, 'Normal (Ideal)');
  assert.equal(ideal.color, 'emerald');

  const underweight = calculateBMI(45, 170);
  assert.equal(underweight.category, 'Berat Badan Kurang');

  const overweight = calculateBMI(80, 170);
  assert.equal(overweight.category, 'Berat Badan Lebih');

  const obese = calculateBMI(95, 165);
  assert.equal(obese.category, 'Obesitas');

  assert.equal(calculateBMI(0, 170), null);
});

test('calculateProfileCompletion calculates percentage from 0 to 100', () => {
  assert.equal(calculateProfileCompletion(null), 0);
  const partialUser = {
    name: 'Budi Santoso',
    email: 'budi@sehathub.id',
    bio: 'Warga Purwokerto Selatan',
    nik: '3302140901980001',
    phone: '081234567890'
  };
  assert.equal(calculateProfileCompletion(partialUser), 50);

  const fullUser = {
    ...partialUser,
    bloodType: 'O+',
    birthDate: '1998-01-09',
    address: 'Jl. Jenderal Soedirman No. 45, Purwokerto',
    heightCm: 172,
    weightKg: 68,
    emergencyContactName: 'Siti Aminah',
    emergencyContactPhone: '081298765432'
  };
  assert.equal(calculateProfileCompletion(fullUser), 100);
});

test('filterFaskes filters by category, search query, and favorites', () => {
  const sample = [
    { id: 'f1', name: 'Puskesmas Purwokerto Selatan', type: 'Puskesmas', city: 'Purwokerto', services: ['Poli Umum', 'Poli Gigi'] },
    { id: 'f2', name: 'RSUD Margono', type: 'Rumah Sakit', city: 'Purwokerto', services: ['IGD 24 Jam', 'Poli Jantung'] },
    { id: 'f3', name: 'Klinik Pratama UMP', type: 'Klinik', city: 'Banyumas', services: ['Poli Umum'] }
  ];

  assert.equal(filterFaskes(sample, { selectedCategory: 'Puskesmas' }).length, 1);
  assert.equal(filterFaskes(sample, { searchQuery: 'jantung' }).length, 1);
  assert.equal(filterFaskes(sample, { onlyFavorites: true, favorites: ['f1', 'f3'] }).length, 2);
});

test('formatQueueMetrics computes remaining queue and capped progress percentage', () => {
  const m1 = formatQueueMetrics(12, 15);
  assert.equal(m1.sisaAntrean, 3);
  assert.equal(m1.estimasiWaktu, 15);
  assert.equal(m1.progressPersen, 80);

  const m2 = formatQueueMetrics(15, 15);
  assert.equal(m2.sisaAntrean, 0);
  assert.equal(m2.progressPersen, 100);
});
