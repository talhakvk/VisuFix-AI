/* ============================================================
   api.js — VisuFix AI Merkezi API Katmanı
   Base URL: http://localhost:3000
   WP10 — Gerçek backend bağlantısı
   ============================================================ */

'use strict';

const API_BASE_URL = 'http://localhost:3000';

/* ── Yardımcı: Fetch Wrapper ────────────────────────────────── */
/**
 * Fetch isteği yapar. Network hataları ve HTTP hataları için
 * anlamlı mesajlarla throw eder.
 * @param {string} path    - "/api/faults" gibi yol
 * @param {object} options - fetch options
 * @returns {Promise<Response>}
 */
async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch (_networkError) {
    throw new Error('Sunucuya bağlanılamadı. Backend çalışıyor mu? (http://localhost:3000)');
  }
  return response;
}

/* ── fetchFaults ────────────────────────────────────────────── */
/**
 * Tüm arıza kayıtlarını getirir.
 * @returns {Promise<Array>} - Arıza dizisi
 * @throws  {Error}          - Bağlantı veya sunucu hatası
 */
async function fetchFaults() {
  const res = await apiFetch('/api/faults');
  if (!res.ok) {
    throw new Error(`Arızalar alınamadı. (HTTP ${res.status})`);
  }
  return res.json();
}

/* ── fetchFaultById ─────────────────────────────────────────── */
/**
 * Tek bir arıza kaydını getirir.
 * @param {number} id - Arıza ID'si
 * @returns {Promise<Object|null>} - Arıza objesi ya da null (404)
 * @throws  {Error} - Bağlantı veya sunucu hatası (404 hariç)
 */
async function fetchFaultById(id) {
  const res = await apiFetch(`/api/faults/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Arıza detayı alınamadı. (HTTP ${res.status})`);
  }
  return res.json();
}

/* ── deleteFault ────────────────────────────────────────────── */
/**
 * Bir arıza kaydını siler.
 * @param {number} id - Silinecek arıza ID'si
 * @returns {Promise<boolean>} - Başarılıysa true
 * @throws  {Error} - Bağlantı veya sunucu hatası
 */
async function deleteFault(id) {
  const res = await apiFetch(`/api/faults/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Arıza silinemedi. (HTTP ${res.status})`);
  }
  return true;
}

/* ── fetchSteps ─────────────────────────────────────────────── */
/**
 * Bir arızanın onarım adımlarını getirir.
 * @param {number} faultId - Arıza ID'si
 * @returns {Promise<Array>} - Adım dizisi (hata olursa boş dizi)
 */
async function fetchSteps(faultId) {
  try {
    const res = await apiFetch(`/api/faults/${faultId}/steps`);
    if (!res.ok) return [];
    return res.json();
  } catch (_err) {
    return [];
  }
}

/* ── Public API ─────────────────────────────────────────────── */
window.VisuFixAPI = { fetchFaults, fetchFaultById, deleteFault, fetchSteps };
