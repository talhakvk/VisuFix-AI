/* ============================================================
   detail.js — VisuFix AI Arıza Detay Sayfası (detail.html)
   WP10 — Gerçek API bağlantısı
   ============================================================ */

'use strict';

const API_PHOTO_BASE = 'http://localhost:3000';

/* ── DOM Refs ───────────────────────────────────────────────── */
const pageContent    = document.getElementById('pageContent');
const headerTitle    = document.getElementById('headerTitle');
const headerTime     = document.getElementById('headerTime');
const toastContainer = document.getElementById('toastContainer');
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('sidebarOverlay');

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  bindSidebarEvents();
  loadDetail();
});

/* ── Veri Yükleme ───────────────────────────────────────────── */
async function loadDetail() {
  const params  = new URLSearchParams(window.location.search);
  const faultId = parseInt(params.get('id'), 10);

  if (isNaN(faultId)) { renderNotFound(); return; }

  // Loading skeleton zaten HTML'de var (loadingSkeleton div)
  try {
    const [fault, steps] = await Promise.all([
      window.VisuFixAPI.fetchFaultById(faultId),
      window.VisuFixAPI.fetchSteps(faultId),
    ]);

    if (!fault) { renderNotFound(); return; }

    headerTitle.textContent = `Arıza #${fault.id}`;
    document.title          = `VisuFix AI — Arıza #${fault.id}`;
    pageContent.innerHTML   = buildDetailHTML(fault, steps);

  } catch (err) {
    pageContent.innerHTML = buildErrorHTML(err.message);
    showToast(err.message, 'error');
  }
}

/* ── Sayfa Yapıları ─────────────────────────────────────────── */
function buildDetailHTML(fault, steps) {
  return `
    <div class="detail-layout">
      <nav class="breadcrumb" aria-label="Sayfa yolu">
        <a href="index.html">Dashboard</a>
        <span class="breadcrumb-sep" aria-hidden="true">›</span>
        <span class="breadcrumb-current">Arıza #${fault.id}</span>
      </nav>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <a href="index.html" class="back-btn" aria-label="Dashboard'a geri dön">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Geri Dön
        </a>
        <button class="btn-delete-detail" onclick="confirmDelete(${fault.id})"
                aria-label="Arıza #${fault.id}'yi sil">
          🗑️ Arızayı Sil
        </button>
      </div>

      <div class="detail-grid">
        <!-- Sol: Fotoğraf -->
        <div class="photo-card">
          <div class="photo-area">
            <img
              id="detailPhoto"
              src="${API_PHOTO_BASE}/${fault.photo_url}"
              alt="Arıza #${fault.id} fotoğrafı"
              onerror="handlePhotoError(this)"
            />
          </div>
          <div class="photo-info">
            <div class="info-item">
              <div class="info-label">ID</div>
              <div class="info-value">#${fault.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Durum</div>
              <div class="info-value">${renderBadge(fault.status)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Adım Sayısı</div>
              <div class="info-value">${steps.length > 0 ? `${steps.length} adım` : '—'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tarih</div>
              <div class="info-value" style="font-size:13px;font-weight:500;">${formatDate(fault.created_at)}</div>
            </div>
          </div>
        </div>

        <!-- Sağ: Adımlar -->
        <div class="steps-card">
          <h2 class="steps-title">
            Çözüm Adımları
            ${steps.length > 0 ? `<span class="steps-count-badge">${steps.length}</span>` : ''}
          </h2>
          ${buildStepsHTML(steps)}
        </div>
      </div>
    </div>`;
}

function buildStepsHTML(steps) {
  if (steps.length === 0) {
    return `
      <div class="no-steps" role="status">
        <div class="no-steps-icon" aria-hidden="true">📭</div>
        <div>Bu arıza için henüz adım oluşturulmamış.</div>
      </div>`;
  }
  return [...steps]
    .sort((a, b) => a.step_order - b.step_order)
    .map(step => `
      <div class="step-item">
        <div class="step-num" aria-label="Adım ${step.step_order}">${step.step_order}</div>
        <div class="step-body">
          <div class="step-desc">${escapeHTML(step.description)}</div>
          <div class="step-coord">Konum: X: ${step.coord_x}%, Y: ${step.coord_y}%</div>
        </div>
      </div>`)
    .join('');
}

function buildErrorHTML(message) {
  return `
    <div class="detail-layout">
      <div class="not-found">
        <div class="not-found-icon" aria-hidden="true">⚠️</div>
        <div class="not-found-title">Bağlantı Hatası</div>
        <div class="not-found-sub">${escapeHTML(message)}</div>
        <a href="index.html" class="back-btn" style="margin-top:16px;">← Dashboard'a Dön</a>
      </div>
    </div>`;
}

/* ── Not Found ──────────────────────────────────────────────── */
function renderNotFound() {
  pageContent.innerHTML = `
    <div class="detail-layout">
      <div class="not-found">
        <div class="not-found-icon" aria-hidden="true">🔍</div>
        <div class="not-found-title">Arıza bulunamadı</div>
        <div class="not-found-sub">Bu ID'ye ait kayıt mevcut değil. Dashboard'a yönlendiriliyorsunuz…</div>
      </div>
    </div>`;
  showToast('Arıza bulunamadı. Yönlendiriliyor…', 'error');
  setTimeout(() => { window.location.href = 'index.html'; }, 3000);
}

/* ── Silme ──────────────────────────────────────────────────── */
function confirmDelete(faultId) {
  document.getElementById('deleteModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'deleteModal';
  modal.className = 'modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modalTitle');
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon" aria-hidden="true">🗑️</div>
      <h2 class="modal-title" id="modalTitle">Arızayı Sil</h2>
      <p class="modal-desc">
        <strong>#${faultId}</strong> numaralı arıza kaydı ve fotoğrafı kalıcı olarak silinecek.
        Bu işlem geri alınamaz.
      </p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--cancel" id="modalCancel">İptal</button>
        <button class="modal-btn modal-btn--confirm" id="modalConfirm">Evet, Sil</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('modal-visible'));

  const closeModal = () => {
    modal.classList.remove('modal-visible');
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
  };

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('modalConfirm').addEventListener('click', async () => {
    const confirmBtn = document.getElementById('modalConfirm');
    confirmBtn.textContent = 'Siliniyor…';
    confirmBtn.disabled = true;
    try {
      await window.VisuFixAPI.deleteFault(faultId);
      showToast(`Arıza #${faultId} silindi. Yönlendiriliyor…`, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1800);
    } catch (err) {
      closeModal();
      showToast(err.message || 'Silme işlemi başarısız.', 'error');
    }
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeyDown); }
  };
  document.addEventListener('keydown', onKeyDown);
  setTimeout(() => document.getElementById('modalCancel')?.focus(), 50);
}

/* ── Photo Error ────────────────────────────────────────────── */
window.handlePhotoError = function (img) {
  img.parentElement.innerHTML = `
    <div class="photo-placeholder">
      <div class="photo-placeholder-icon" aria-hidden="true">📷</div>
      <div>Fotoğraf bulunamadı</div>
    </div>`;
};

/* ── Helpers ────────────────────────────────────────────────── */
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(isoString));
}

function renderBadge(status) {
  const map = {
    analyzed: ['badge-analyzed', 'Analiz Edildi'],
    pending:  ['badge-pending',  'Beklemede'],
    error:    ['badge-error',    'Hata'],
  };
  const [cls, label] = map[status] ?? ['badge-pending', status];
  return `<span class="badge ${cls}" role="status">${label}</span>`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* ── Clock ──────────────────────────────────────────────────── */
function startClock() {
  const tick = () => {
    headerTime.textContent = new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date());
  };
  tick();
  setInterval(tick, 1000);
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const icons   = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  const colors  = { info: 'rgba(59,130,246,0.15)', success: 'rgba(48,209,88,0.12)', warning: 'rgba(255,214,10,0.12)', error: 'rgba(255,59,48,0.12)' };
  const borders = { info: 'rgba(59,130,246,0.25)', success: 'rgba(48,209,88,0.2)', warning: 'rgba(255,214,10,0.2)', error: 'rgba(255,59,48,0.2)' };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.style.background  = colors[type]  ?? colors.info;
  toast.style.borderColor = borders[type] ?? borders.info;
  toast.innerHTML = `<span aria-hidden="true">${icons[type] ?? 'ℹ️'}</span><span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

window.showSettingsToast = () => showToast('Ayarlar sayfası yakında geliyor!', 'info');

/* ── Mobile Sidebar ─────────────────────────────────────────── */
function bindSidebarEvents() {
  hamburgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
}
function toggleSidebar() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); }
function openSidebar()  { sidebar.classList.add('open'); overlay.classList.remove('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.add('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
