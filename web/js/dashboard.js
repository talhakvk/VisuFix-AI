/* ============================================================
   dashboard.js — VisuFix AI Dashboard (index.html)
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

/* ── State ──────────────────────────────────────────────────── */
let currentFilter  = 'all';
let currentSearch  = '';
let clockInterval  = null;

/* ── DOM Refs ───────────────────────────────────────────────── */
const tableBody    = document.getElementById('tableBody');
const emptyState   = document.getElementById('emptyState');
const statusFilter = document.getElementById('statusFilter');
const searchInput  = document.getElementById('searchInput');
const headerCount  = document.getElementById('headerCount');
const headerTime   = document.getElementById('headerTime');
const statTotal    = document.getElementById('statTotal');
const statAnalyzed = document.getElementById('statAnalyzed');
const statPending  = document.getElementById('statPending');
const toastContainer = document.getElementById('toastContainer');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar      = document.getElementById('sidebar');
const overlay      = document.getElementById('sidebarOverlay');

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderTable();
  startClock();
  bindEvents();
});

/* ── Helpers ────────────────────────────────────────────────── */

/**
 * Tarihi "24 Mar 2026, 04:18" formatında döndürür.
 * @param {string} isoString
 * @returns {string}
 */
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

/**
 * Status değerine göre badge HTML'i döndürür.
 * @param {string} status
 * @returns {string}
 */
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
 * Thumbnail HTML'i — resim yüklenemezse placeholder gösterir.
 * @param {string} photoUrl
 * @param {number} faultId
 * @returns {string}
 */
function renderThumb(photoUrl, faultId) {
  return `
    <div class="thumb-wrap">
      <img
        src="../backend/${photoUrl}"
        alt="Arıza #${faultId} fotoğrafı"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<div class=\\'thumb-placeholder\\' title=\\'Fotoğraf yok\\'>📷</div>'"
      />
    </div>`;
}

/* ── Stats ──────────────────────────────────────────────────── */
function renderStats() {
  const total    = STATIC_FAULTS.length;
  const analyzed = STATIC_FAULTS.filter(f => f.status === 'analyzed').length;
  const pending  = STATIC_FAULTS.filter(f => f.status === 'pending').length;

  statTotal.textContent    = total;
  statAnalyzed.textContent = analyzed;
  statPending.textContent  = pending;
  headerCount.textContent  = `${total} kayıt`;
}

/* ── Filter Logic ───────────────────────────────────────────── */
function getFilteredFaults() {
  return STATIC_FAULTS.filter(fault => {
    const matchStatus = currentFilter === 'all' || fault.status === currentFilter;
    const matchSearch = currentSearch === '' ||
      String(fault.id).includes(currentSearch.trim());
    return matchStatus && matchSearch;
  });
}

/* ── Table Render ───────────────────────────────────────────── */
function renderTable() {
  const faults = getFilteredFaults();

  if (faults.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tableBody.innerHTML = faults.map(fault => `
    <tr>
      <td class="td-id">#${fault.id}</td>
      <td>${renderThumb(fault.photo_url, fault.id)}</td>
      <td>${renderBadge(fault.status)}</td>
      <td class="step-count ${fault.step_count > 0 ? 'has-steps' : ''}">
        ${fault.step_count > 0 ? `${fault.step_count} adım` : '—'}
      </td>
      <td style="color:var(--text-secondary);font-size:12px;">
        ${formatDate(fault.created_at)}
      </td>
      <td>
        <a
          href="detail.html?id=${fault.id}"
          class="btn-detail"
          aria-label="Arıza #${fault.id} detayını görüntüle"
        >
          Detay →
        </a>
      </td>
    </tr>
  `).join('');
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
  clockInterval = setInterval(tick, 1000);
}

/* ── Toast ──────────────────────────────────────────────────── */
/**
 * Sayfa içi bildirim gösterir.
 * @param {string} message
 * @param {'info'|'success'|'warning'|'error'} type
 */
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

/* ── Settings toast (global — sidebar'dan çağrılır) ─────────── */
window.showSettingsToast = function () {
  showToast('Ayarlar sayfası yakında geliyor!', 'info');
};

/* ── Event Bindings ─────────────────────────────────────────── */
function bindEvents() {
  /* Filtre */
  statusFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTable();
  });

  /* Arama */
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderTable();
  });

  /* Hamburger (mobile sidebar) */
  hamburgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  /* ESC ile sidebar kapat */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
}

/* ── Mobile Sidebar ─────────────────────────────────────────── */
function toggleSidebar() {
  const isOpen = sidebar.classList.contains('open');
  isOpen ? closeSidebar() : openSidebar();
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
