/* ============================================================
   dashboard.js — VisuFix AI Dashboard (index.html)
   WP10 — Gerçek API bağlantısı
   ============================================================ */

'use strict';

/* ── State ──────────────────────────────────────────────────── */
let allFaults     = [];
let currentFilter = 'all';
let currentSearch = '';

/* ── DOM Refs ───────────────────────────────────────────────── */
const tableBody      = document.getElementById('tableBody');
const emptyState     = document.getElementById('emptyState');
const statusFilter   = document.getElementById('statusFilter');
const searchInput    = document.getElementById('searchInput');
const headerCount    = document.getElementById('headerCount');
const headerTime     = document.getElementById('headerTime');
const statTotal      = document.getElementById('statTotal');
const statAnalyzed   = document.getElementById('statAnalyzed');
const statPending    = document.getElementById('statPending');
const toastContainer = document.getElementById('toastContainer');
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('sidebarOverlay');

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  bindEvents();
  loadFaults();
});

/* ── Veri Yükleme ───────────────────────────────────────────── */
async function loadFaults() {
  setTableState('loading');
  try {
    allFaults = await window.VisuFixAPI.fetchFaults();
    renderStats();
    renderTable();
  } catch (err) {
    setTableState('error', err.message);
    showToast(err.message, 'error');
  }
}

function setTableState(state, message = '') {
  tableBody.innerHTML = '';
  emptyState.classList.add('hidden');

  if (state === 'loading') {
    tableBody.innerHTML = `
      <tr><td colspan="6">
        <div class="table-feedback">
          <div class="spinner" aria-hidden="true"></div>
          <span>Yükleniyor…</span>
        </div>
      </td></tr>`;
  } else if (state === 'error') {
    tableBody.innerHTML = `
      <tr><td colspan="6">
        <div class="table-feedback table-feedback--error">
          <span style="font-size:22px" aria-hidden="true">⚠️</span>
          <span>${escapeHTML(message) || 'Veriler yüklenemedi. Backend çalışıyor mu?'}</span>
          <button class="btn-retry" onclick="loadFaults()">Tekrar Dene</button>
        </div>
      </td></tr>`;
  }
}

/* ── İstatistikler ──────────────────────────────────────────── */
function renderStats() {
  const total    = allFaults.length;
  const analyzed = allFaults.filter(f => f.status === 'analyzed').length;
  const pending  = allFaults.filter(f => f.status === 'pending').length;
  statTotal.textContent    = total;
  statAnalyzed.textContent = analyzed;
  statPending.textContent  = pending;
  headerCount.textContent  = `${total} kayıt`;
}

/* ── Filtreleme ─────────────────────────────────────────────── */
function getFilteredFaults() {
  return allFaults.filter(fault => {
    const matchStatus = currentFilter === 'all' || fault.status === currentFilter;
    const matchSearch = currentSearch === '' || String(fault.id).includes(currentSearch.trim());
    return matchStatus && matchSearch;
  });
}

/* ── Tablo Render ───────────────────────────────────────────── */
function renderTable() {
  const faults = getFilteredFaults();

  if (faults.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  tableBody.innerHTML = faults.map(fault => `
    <tr id="row-${fault.id}">
      <td class="td-id">#${fault.id}</td>
      <td>${renderThumb(fault.photo_url, fault.id)}</td>
      <td>${renderBadge(fault.status)}</td>
      <td class="step-count ${fault.step_count > 0 ? 'has-steps' : ''}">
        ${fault.step_count > 0 ? `${fault.step_count} adım` : '—'}
      </td>
      <td style="color:var(--text-secondary);font-size:12px;">${formatDate(fault.created_at)}</td>
      <td>
        <div style="display:flex;gap:6px;align-items:center;">
          <a href="detail.html?id=${fault.id}" class="btn-detail"
             aria-label="Arıza #${fault.id} detayını görüntüle">Detay →</a>
          <button class="btn-delete" onclick="confirmDelete(${fault.id})"
                  aria-label="Arıza #${fault.id}'yi sil">Sil</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ── Silme Modal ────────────────────────────────────────────── */
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
      allFaults = allFaults.filter(f => f.id !== faultId);
      renderStats();
      renderTable();
      closeModal();
      showToast(`Arıza #${faultId} başarıyla silindi.`, 'success');
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

function renderThumb(photoUrl, faultId) {
  return `
    <div class="thumb-wrap">
      <img src="http://localhost:3000/${photoUrl}" alt="Arıza #${faultId} fotoğrafı" loading="lazy"
           onerror="this.parentElement.innerHTML='<div class=\\'thumb-placeholder\\' title=\\'Fotoğraf yok\\'>📷</div>'" />
    </div>`;
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

/* ── Events ─────────────────────────────────────────────────── */
function bindEvents() {
  statusFilter.addEventListener('change', (e) => { currentFilter = e.target.value; renderTable(); });
  searchInput.addEventListener('input',   (e) => { currentSearch = e.target.value; renderTable(); });
  hamburgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
}

function toggleSidebar() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); }
function openSidebar()  { sidebar.classList.add('open'); overlay.classList.remove('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.add('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
