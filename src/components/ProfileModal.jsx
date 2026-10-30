import { useState, useRef } from 'react';
import { PRESET_AVATARS, INITIAL_FASKES } from '../utils/data';
import { calculateBMI, calculateProfileCompletion } from '../utils/healthUtils';

export default function ProfileModal({
  user,
  onClose,
  onSaveProfile,
  bookings = [],
  onCancelBooking,
  onSelectFaskesBooking,
  favorites = [],
  onToggleFavorite,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('identitas'); // 'identitas', 'medis', 'kartu', 'riwayat'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || PRESET_AVATARS[0].url,
    bio: user?.bio || 'Warga aktif pengguna layanan antrean digital SehatHub.',
    nik: user?.nik || '',
    noBpjs: user?.noBpjs || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '1998-01-09',
    gender: user?.gender || 'Laki-laki',
    bloodType: user?.bloodType || 'O+',
    heightCm: user?.heightCm || 170,
    weightKg: user?.weightKg || 65,
    allergies: user?.allergies || 'Tidak ada alergi obat',
    chronicConditions: user?.chronicConditions || 'Tidak ada',
    address: user?.address || 'Purwokerto, Banyumas, Jawa Tengah',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran File Terlalu Besar', 'Maksimal ukuran foto profil adalah 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        showToast('Foto Terpilih', 'Jangan lupa klik Simpan Perubahan untuk menerapkan foto baru.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Validasi Gagal', 'Nama lengkap tidak boleh kosong.');
      return;
    }
    onSaveProfile({
      ...user,
      ...formData
    });
  };

  const bmiData = calculateBMI(formData.weightKg, formData.heightCm);
  const completionPct = calculateProfileCompletion(formData);

  // Filter bookings belonging to this user
  const userBookings = bookings.filter(
    (b) =>
      b.userEmail === user?.email ||
      (b.userName && user?.name && b.userName.toLowerCase() === user.name.toLowerCase())
  );

  const favoriteFaskesObjects = INITIAL_FASKES.filter((f) => favorites.includes(f.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 my-8 modal-animation flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar || PRESET_AVATARS[0].url}
                alt={formData.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-lg bg-slate-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Unggah Foto Profil"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                title="Unggah Foto Profil Baru"
              >
                <i className="fa-solid fa-camera text-xs"></i>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="profile-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {formData.name || 'Profil Warga'}
                </h2>
                <span className="text-xs font-semibold text-orange-400">
                  · Pasien Terverifikasi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 max-w-xl">
                {formData.bio || 'Belum ada bio singkat.'}
              </p>
              <div className="flex items-center gap-3 mt-2.5">
                <div className="w-36 sm:w-48 bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-mono tabular-nums font-bold text-emerald-400">
                  Kelengkapan Profil {completionPct}%
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Profil"
            className="self-end sm:self-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'identitas', label: 'Identitas & Bio', icon: 'fa-id-card' },
            { id: 'medis', label: 'Rekam Medis & Kalkulator BMI', icon: 'fa-heart-pulse' },
            { id: 'kartu', label: 'Kartu Berobat Digital', icon: 'fa-qrcode' },
            { id: 'riwayat', label: `Riwayat & Faskes Favorit (${userBookings.length})`, icon: 'fa-clock-rotate-left' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
          <form id="profile-form" onSubmit={handleSubmit}>
            {/* TAB 1: IDENTITAS, FOTO PROFIL & BIO */}
            {activeTab === 'identitas' && (
              <div className="space-y-6">
                {/* Pilihan Avatar Cepat atau Upload */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Foto Profil & Avatar</h3>
                      <p className="text-xs text-slate-500">
                        Pilih salah satu ilustrasi avatar di bawah atau unggah foto dari perangkat Anda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
                    >
                      <i className="fa-solid fa-upload mr-1.5"></i> Unggah Foto Sendiri
                    </button>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av) => {
                      const isSelected = formData.avatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, avatar: av.url }))}
                          className={`flex items-center gap-2 p-2 pr-3 rounded-xl border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/70 text-orange-700 ring-2 ring-orange-500/20'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span>{av.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Grid Identitas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="prof-name" className="block text-xs font-bold text-slate-600 mb-1.5">
                      Nama Lengkap Sesuai KTP
                    </label>
                    <input
                      id="prof-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-email" className="block text-xs font-bold text-slate-600 mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      id="prof-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-nik" className="block text-xs font-bold text-slate-600 mb-1.5">
                      NIK (Nomor Induk Kependudukan - Otomatis Isi Saat Booking)
                    </label>
                    <input
                      id="prof-nik"
                      name="nik"
                      type="text"
                      maxLength="16"
                      value={formData.nik}
                      onChange={handleChange}
                      placeholder="16 digit NIK..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-bpjs" className="block text-xs font-bold text-slate-600 mb-1.5">
                      Nomor Kartu BPJS / JKN-KIS
                    </label>
                    <input
                      id="prof-bpjs"
                      name="noBpjs"
                      type="text"
                      maxLength="15"
                      value={formData.noBpjs}
                      onChange={handleChange}
                      placeholder="Contoh: 0001829340112"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-phone" className="block text-xs font-bold text-slate-600 mb-1.5">
                      Nomor Telepon / WhatsApp Aktif
                    </label>
                    <input
                      id="prof-phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prof-birth" className="block text-xs font-bold text-slate-600 mb-1.5">
                        Tanggal Lahir
                      </label>
                      <input
                        id="prof-birth"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="prof-gender" className="block text-xs font-bold text-slate-600 mb-1.5">
                        Jenis Kelamin
                      </label>
                      <select
                        id="prof-gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio / Tentang Saya */}
                <div>
                  <label htmlFor="prof-bio" className="block text-xs font-bold text-slate-600 mb-1.5">
                    Bio & Catatan Kesehatan Pribadi
                  </label>
                  <textarea
                    id="prof-bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Ceritakan singkat tentang diri Anda, kebiasaan olahraga, atau preferensi jadwal kunjungan faskes..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition-all"
                  ></textarea>
                </div>

                {/* Alamat Domisili */}
                <div>
                  <label htmlFor="prof-address" className="block text-xs font-bold text-slate-600 mb-1.5">
                    Alamat Domisili Saat Ini
                  </label>
                  <input
                    id="prof-address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nama jalan, kelurahan, kecamatan, kota..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: REKAM MEDIS RINGKAS & KALKULATOR BMI */}
            {activeTab === 'medis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Data Fisik */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="prof-blood" className="block text-xs font-bold text-slate-600 mb-1.5">
                          Golongan Darah
                        </label>
                        <select
                          id="prof-blood"
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-orange-500"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '-'].map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="prof-height" className="block text-xs font-bold text-slate-600 mb-1.5">
                          Tinggi Badan (cm)
                        </label>
                        <input
                          id="prof-height"
                          name="heightCm"
                          type="number"
                          min="50"
                          max="250"
                          value={formData.heightCm}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="prof-weight" className="block text-xs font-bold text-slate-600 mb-1.5">
                          Berat Badan (kg)
                        </label>
                        <input
                          id="prof-weight"
                          name="weightKg"
                          type="number"
                          min="10"
                          max="300"
                          value={formData.weightKg}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="prof-allergies" className="block text-xs font-bold text-slate-600 mb-1.5">
                        Riwayat Alergi (Obat / Makanan / Cuaca)
                      </label>
                      <input
                        id="prof-allergies"
                        name="allergies"
                        type="text"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="Contoh: Alergi Amoxicillin, seafood, atau Tidak ada"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="prof-chronic" className="block text-xs font-bold text-slate-600 mb-1.5">
                        Riwayat Penyakit Kronis / Komorbid
                      </label>
                      <input
                        id="prof-chronic"
                        name="chronicConditions"
                        type="text"
                        value={formData.chronicConditions}
                        onChange={handleChange}
                        placeholder="Contoh: Asma ringan, Hipertensi terkontrol, atau Tidak ada"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500"
                      />
                    </div>

                    {/* Kontak Darurat */}
                    <div className="pt-3 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        Kontak Darurat Keluarga (ICE - In Case of Emergency)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="prof-ice-name" className="block text-xs font-bold text-slate-600 mb-1.5">
                            Nama Kerabat & Hubungan
                          </label>
                          <input
                            id="prof-ice-name"
                            name="emergencyContactName"
                            type="text"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            placeholder="Contoh: Siti Aminah (Istri)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="prof-ice-phone" className="block text-xs font-bold text-slate-600 mb-1.5">
                            Nomor Telepon Darurat
                          </label>
                          <input
                            id="prof-ice-phone"
                            name="emergencyContactPhone"
                            type="text"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            placeholder="Contoh: 0813-9876-5432"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums outline-none focus:bg-white focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel Hasil Kalkulator BMI Real-Time */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-orange-600">
                        Analisis Indeks Massa Tubuh (IMT / BMI)
                      </span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">
                        Status Gizi & Kebugaran
                      </h4>

                      {bmiData ? (
                        <div className="mt-5">
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-900">
                              {bmiData.bmi}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">kg/m²</span>
                          </div>
                          <p
                            className={`text-sm font-bold mt-2 ${
                              bmiData.color === 'emerald'
                                ? 'text-emerald-600'
                                : bmiData.color === 'rose'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            Kategori: {bmiData.category}
                          </p>
                          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                            {bmiData.advice}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-4">
                          Masukkan tinggi dan berat badan yang valid untuk melihat analisis IMT otomatis.
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1 font-mono tabular-nums">
                      <div className="flex justify-between">
                        <span>Kurang:</span>
                        <span>&lt; 18.5</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>Normal (Ideal):</span>
                        <span>18.5 – 24.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Berlebih:</span>
                        <span>25.0 – 29.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Obesitas:</span>
                        <span>&ge; 30.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* TAB 3: KARTU BEROBAT DIGITAL SEHATHUB */}
          {activeTab === 'kartu' && (
            <div className="space-y-6">
              <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 border-b border-slate-700 pb-5 mb-5">
                  <div className="flex items-center gap-3">
                    <img src="/icon-s.svg" alt="SehatHub" className="h-9 w-9 brightness-0 invert" />
                    <div>
                      <h3 className="font-extrabold text-lg tracking-tight text-white">
                        KARTU PASIEN TERPADU
                      </h3>
                      <p className="text-xs text-orange-400 font-medium">
                        Jaringan Layanan Kesehatan Publik SehatHub
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="text-[10px] text-slate-400 block">GOL. DARAH</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {formData.bloodType || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                  <img
                    src={formData.avatar || PRESET_AVATARS[0].url}
                    alt={formData.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-400 bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div>
                      <p className="text-xs text-slate-400">Nama Lengkap Pasien</p>
                      <p className="text-lg font-extrabold text-white">{formData.name || '-'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono tabular-nums">
                      <div>
                        <span className="text-slate-400 block text-[10px]">NIK KTP</span>
                        <span className="text-slate-100 font-bold">{formData.nik || 'Belum diisi'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">NOMOR JKN / BPJS</span>
                        <span className="text-orange-300 font-bold">{formData.noBpjs || 'Umum / Mandiri'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CATATAN ALERGI MEDIS</span>
                    <span className="text-rose-300 font-semibold">{formData.allergies || 'Tidak ada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">KONTAK DARURAT (ICE)</span>
                    <span className="text-emerald-300 font-semibold">
                      {formData.emergencyContactName
                        ? `${formData.emergencyContactName} (${formData.emergencyContactPhone})`
                        : 'Belum diatur'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-500 max-w-md mx-auto">
                Tunjukkan Kartu Pasien Terpadu ini kepada petugas loket Puskesmas, Klinik, atau Rumah Sakit mitra untuk mempercepat verifikasi identitas dan rekam medis awal.
              </p>
            </div>
          )}

          {/* TAB 4: RIWAYAT KUNJUNGAN & FASKES FAVORIT */}
          {activeTab === 'riwayat' && (
            <div className="space-y-8">
              {/* Daftar Antrean Milik Pengguna */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">
                  Riwayat Nomor Antrean Saya ({userBookings.length})
                </h3>
                {userBookings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Antrean</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Anda belum mengambil nomor antrean. Pilih faskes pada halaman utama untuk mendaftar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBookings.map((b) => (
                      <div
                        key={b.kode}
                        className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                            <span className="font-extrabold text-orange-600">{b.kode}</span>
                            <span>·</span>
                            <span className="font-bold text-slate-800">Loket {b.nomor}</span>
                            <span>·</span>
                            <span
                              className={`font-bold ${
                                b.status === 'Disetujui'
                                  ? 'text-emerald-600'
                                  : b.status === 'Selesai'
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              Status: {b.status || 'Menunggu'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{b.faskesNama}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {b.poli || 'Poli Umum'} · Jadwal: {b.waktu}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {(!b.status || b.status === 'Menunggu') && onCancelBooking && (
                            <button
                              type="button"
                              onClick={() => onCancelBooking(b.kode)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Batalkan Antrean
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faskes Favorit */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">
                  Fasilitas Kesehatan Tersimpan ({favoriteFaskesObjects.length})
                </h3>
                {favoriteFaskesObjects.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      Belum ada fasilitas kesehatan favorit. Klik tombol Simpan pada kartu faskes untuk menandai faskes langganan Anda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteFaskesObjects.map((f) => (
                      <div
                        key={f.id}
                        className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs text-slate-500">
                            {f.type} · {f.city}
                          </p>
                          <h4 className="font-bold text-sm text-slate-800">{f.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{f.hours}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectFaskesBooking(f);
                            }}
                            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Daftar
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(f.id)}
                            aria-label={`Hapus ${f.name} dari favorit`}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            Data profil disimpan secara aman untuk mempercepat pengisian formulir antrean faskes.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {(activeTab === 'identitas' || activeTab === 'medis') && (
              <button
                type="submit"
                form="profile-form"
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i> Simpan Perubahan Profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
