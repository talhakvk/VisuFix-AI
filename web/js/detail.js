/* ============================================================
   detail.js — VisuFix AI Arıza Detay Sayfası (detail.html)
   Static data ile çalışır. WP10'da API ile değiştirilecek.
   ============================================================ */

'use strict';

/* ── Static Test Verisi ─────────────────────────────────────── */
const STATIC_FAULTS = [
  {
    id: 1,
    photo_url: 'uploads/test1.jpg',
    status: 'analyzed',
    created_at: '2026-03-24T04:18:00Z',
    step_count: 3,
  },
  {
    id: 2,
    photo_url: 'uploads/test2.jpg',
    status: 'pending',
    created_at: '2026-03-24T06:36:00Z',
    step_count: 0,
  },
  {
    id: 3,
    photo_url: 'uploads/test3.jpg',
    status: 'error',
    created_at: '2026-03-24T07:29:00Z',
    step_count: 0,
  },
  {
    id: 4,
    photo_url: 'uploads/test4.jpg',
    status: 'analyzed',
    created_at: '2026-03-31T07:00:00Z',
    step_count: 5,
  },
];

const STATIC_STEPS = [
  {
    id: 1,
    fault_id: 1,
    step_order: 1,
    coord_x: 55,
    coord_y: 36,
    description: 'Kırık ekran paneli tespit edildi. Ekranın tamamen değiştirilmesi gerekiyor.',
  },
  {
    id: 2,
    fault_id: 1,
    step_order: 2,
    coord_x: 20,
    coord_y: 80,
    description: 'Sol alt köşedeki vida gevşemiş, sıkıştırılması gerekiyor.',
  },
  {
    id: 3,
    fault_id: 1,
    step_order: 3,
    coord_x: 75,
    coord_y: 60,
    description: 'Ekran kablosu hasarlı görünüyor, kontrol edilmeli.',
  },
  {
    id: 4,
    fault_id: 4,
    step_order: 1,
    coord_x: 30,
    coord_y: 45,
    description: 'D tuşunun keycap\'i eksik.',
  },
  {
    id: 5,
    fault_id: 4,
    step_order: 2,
    coord_x: 50,
    coord_y: 50,
    description: 'Switch mekanizması kirli, temizlenmesi gerekiyor.',
  },
];

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

/* ── Load Detail ────────────────────────────────────────────── */
function loadDetail() {
  const params  = new URLSearchParams(window.location.search);
  const faultId = parseInt(params.get('id'), 10);

  if (isNaN(faultId)) {
    renderNotFound();
    return;
  }

  const fault = STATIC_FAULTS.find(f => f.id === faultId);

  if (!fault) {
    renderNotFound();
    return;
  }

  const steps = STATIC_STEPS.filter(s => s.fault_id === faultId);

  // Header güncelle
  headerTitle.textContent = `Arıza #${fault.id}`;
  document.title          = `VisuFix AI — Arıza #${fault.id}`;

  // Render
  pageContent.innerHTML = buildDetailHTML(fault, steps);
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

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3000);
}

/* ── Build Detail HTML ──────────────────────────────────────── */
function buildDetailHTML(fault, steps) {
  const photoSrc  = `../backend/${fault.photo_url}`;
  const dateStr   = formatDate(fault.created_at);
  const badge     = renderBadge(fault.status);
  const stepsHTML = buildStepsHTML(steps);

  return `
    <div class="detail-layout">

      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Sayfa yolu">
        <a href="index.html">Dashboard</a>
        <span class="breadcrumb-sep" aria-hidden="true">›</span>
        <span class="breadcrumb-current">Arıza #${fault.id}</span>
      </nav>

      <!-- Geri Dön -->
      <a href="index.html" class="back-btn" aria-label="Dashboard'a geri dön">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Geri Dön
      </a>

      <!-- Detail Grid -->
      <div class="detail-grid">

        <!-- Sol: Fotoğraf -->
        <div class="photo-card">
          <div class="photo-area">
            <img
              id="detailPhoto"
              src="${photoSrc}"
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
              <div class="info-value">${badge}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Adım Sayısı</div>
              <div class="info-value">${steps.length > 0 ? `${steps.length} adım` : '—'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tarih</div>
              <div class="info-value" style="font-size:13px;font-weight:500;">${dateStr}</div>
            </div>
          </div>
        </div>

        <!-- Sağ: Adımlar -->
        <div class="steps-card">
          <h2 class="steps-title">
            Çözüm Adımları
            ${steps.length > 0 ? `<span class="steps-count-badge">${steps.length}</span>` : ''}
          </h2>
          ${stepsHTML}
        </div>

      </div>
    </div>`;
}

/* ── Build Steps HTML ───────────────────────────────────────── */
function buildStepsHTML(steps) {
  if (steps.length === 0) {
    return `
      <div class="no-steps" role="status">
        <div class="no-steps-icon" aria-hidden="true">📭</div>
        <div>Bu arıza için henüz adım oluşturulmamış.</div>
      </div>`;
  }

  return steps
    .sort((a, b) => a.step_order - b.step_order)
    .map(step => `
      <div class="step-item">
        <div class="step-num" aria-label="Adım ${step.step_order}">${step.step_order}</div>
        <div class="step-body">
          <div class="step-desc">${escapeHTML(step.description)}</div>
          <div class="step-coord">
            Konum: X: ${step.coord_x}%, Y: ${step.coord_y}%
          </div>
        </div>
      </div>`)
    .join('');
}

/* ── Photo Error Handler ────────────────────────────────────── */
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
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
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

/**
 * XSS koruması için HTML escape.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Clock ──────────────────────────────────────────────────── */
function startClock() {
  function tick() {
    headerTime.textContent = new Intl.DateTimeFormat('tr-TR', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] ?? 'ℹ️'}</span><span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

/* ── Settings Toast (global) ────────────────────────────────── */
window.showSettingsToast = function () {
  showToast('Ayarlar sayfası yakında geliyor!', 'info');
};

/* ── Mobile Sidebar ─────────────────────────────────────────── */
function bindSidebarEvents() {
  hamburgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
}

function toggleSidebar() {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
}

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.remove('hidden');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.add('hidden');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
