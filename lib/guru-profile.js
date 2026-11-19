// =============================================================
//  Profil / CV Guru — aturan isian & pembersihan data
//  Dipakai oleh API (functions/api/[[route]].js)
// =============================================================

// Bagian CV yang berulang. Nilai = panjang maksimal teks, 'url' = tautan http(s), 'img' = gambar unggahan (/api/media/…)
export const CV_SECTIONS = {
  pendidikan: { jenjang: 30, institusi: 150, prodi: 150, tahun: 20 },
  pengalaman: { posisi: 150, tempat: 150, mulai: 20, selesai: 20, ket: 600 },
  kompetensi: { nama: 200, bidang: 120, penerbit: 150, tahun: 20, berlaku: 40, link: 'url', gambar: 'img' },
  prestasi: { judul: 200, tingkat: 30, penyelenggara: 150, tahun: 20, link: 'url', gambar: 'img' },
  pelatihan: { nama: 200, penyelenggara: 150, tahun: 20, jp: 20 },
  karya: { judul: 200, jenis: 40, tahun: 20, link: 'url' },
  organisasi: { nama: 150, peran: 100, tahun: 40 },
};
export const CV_LINKS = ['website', 'linkedin', 'instagram', 'youtube'];
export const MAX_ITEMS = 30; // per bagian
export const MAX_PROFILE_IMAGES = 10; // gambar bukti per guru (di luar foto profil)
export const PROFILE_MEDIA_TAG = 'profil-guru';

const s = (v, max) => (v == null ? '' : String(v)).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
export const cleanUrl = (v) => {
  const t = s(v, 400);
  if (!t) return '';
  const u = /^https?:\/\//i.test(t) ? t : /^[\w-]+(\.[\w-]+)+(\/|$)/.test(t) ? 'https://' + t : '';
  try { return u && ['http:', 'https:'].includes(new URL(u).protocol) ? u : ''; } catch { return ''; }
};
export const cleanImg = (v) => (/^\/api\/media\/[a-f0-9]{24}$/.test(String(v || '')) ? String(v) : '');

// Membersihkan seluruh kiriman formulir profil -> objek siap simpan
export function cleanProfile(b) {
  const data = {};
  for (const [sec, spec] of Object.entries(CV_SECTIONS)) {
    const arr = Array.isArray(b.data?.[sec]) ? b.data[sec].slice(0, MAX_ITEMS) : [];
    data[sec] = arr.map((it) => {
      const o = {};
      for (const [k, t] of Object.entries(spec)) o[k] = t === 'url' ? cleanUrl(it?.[k]) : t === 'img' ? cleanImg(it?.[k]) : s(it?.[k], t);
      return o;
    }).filter((o) => Object.values(o).some(Boolean));
  }
  const links = {};
  for (const k of CV_LINKS) { const u = cleanUrl(b.links?.[k]); if (u) links[k] = u; }
  const skills = String(b.skills || '').split(/[,\n]/).map((x) => s(x, 40)).filter(Boolean).slice(0, 20);
  const email = s(b.email, 120);
  return {
    full_name: s(b.full_name, 120),
    position: s(b.position, 120),
    unit_slug: s(b.unit_slug, 40),
    subjects: s(b.subjects, 200),
    bio: s(b.bio, 1500),
    skills: [...new Set(skills)].join(', '),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    photo: cleanImg(b.photo),
    visibility: b.visibility === 'public' ? 'public' : 'private',
    links: JSON.stringify(links),
    data: JSON.stringify(data),
  };
}

// Semua gambar yang dipakai sebuah profil
export function profileImages(p) {
  const out = new Set();
  if (p?.photo) out.add(p.photo);
  let d = p?.data; try { if (typeof d === 'string') d = JSON.parse(d); } catch { d = {}; }
  for (const arr of Object.values(d || {})) for (const it of Array.isArray(arr) ? arr : []) if (it?.gambar) out.add(it.gambar);
  return out;
}

// Persentase kelengkapan (untuk memotivasi guru melengkapi CV)
export function completeness(p) {
  let d = {}; try { d = JSON.parse(p.data || '{}'); } catch { /* kosong */ }
  const checks = [p.photo, p.full_name, p.position, p.bio, p.skills, d.pendidikan?.length, d.kompetensi?.length, d.pengalaman?.length || d.pelatihan?.length, d.prestasi?.length || d.karya?.length];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
