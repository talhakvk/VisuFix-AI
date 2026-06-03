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
    renderMarkers(fault, steps);

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
            <div id="photo-container" style="position:relative;display:block;width:100%;height:500px;">
              <img
                id="detailPhoto"
                src="${API_PHOTO_BASE}/${fault.photo_url}"
                alt="Arıza #${fault.id} fotoğrafı"
                onerror="handlePhotoError(this)"
                style="display:block;width:100%;height:100%;object-fit:contain;"
              />
            </div>
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
      <div class="step-item step-card" id="step-${step.id}">
        <div class="step-num" aria-label="Adım ${step.step_order}">${step.step_order}</div>
        <div class="step-body">
          <div class="step-desc">${escapeHTML(step.description)}</div>
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
  // SQLite CURRENT_TIMESTAMP UTC kaydeder ama 'Z' eklemiyor.
  // '+00:00' ekleyerek UTC olduğunu browser'a açıkça bildiriyoruz.
  const normalized = isoString.includes('Z') || isoString.includes('+') ? isoString : isoString + '+00:00';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(normalized));
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

/* ── Marker Renderer ────────────────────────────────────────── */
function renderMarkers(fault, steps) {
  if (!steps || steps.length === 0) return;

  const container = document.getElementById('photo-container');
  if (!container) return;
  const img = container.querySelector('img');
  if (!img) return;

  function drawMarkers() {
    container.querySelectorAll('.marker').forEach(m => m.remove());

    // Fotoğrafın ekranda görünen boyutları
    const displayWidth  = img.clientWidth;
    const displayHeight = img.clientHeight;

    // Fotoğrafın orijinal boyutları
    const naturalWidth  = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight) return;

    // object-fit: contain mantığıyla gerçek render alanını hesapla
    const containerAspect = displayWidth / displayHeight;
    const imageAspect     = naturalWidth  / naturalHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (imageAspect > containerAspect) {
      // Fotoğraf yatay sığıyor → genişlik container kadar
      renderWidth  = displayWidth;
      renderHeight = displayWidth / imageAspect;
      offsetX = 0;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      // Fotoğraf dikey sığıyor → yükseklik container kadar
      renderHeight = displayHeight;
      renderWidth  = displayHeight * imageAspect;
      offsetX = (displayWidth - renderWidth) / 2;
      offsetY = 0;
    }

    steps.forEach(step => {
      const marker = document.createElement('div');
      marker.className = 'marker';

      const x = offsetX + (step.coord_x / 100) * renderWidth;
      const y = offsetY + (step.coord_y / 100) * renderHeight;

      marker.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #FF3B30;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: #ffffff;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 0 0 3px rgba(255,59,48,0.3);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      `;
      marker.textContent = step.step_order;
      marker.title = step.description;

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.25)';
        marker.style.boxShadow = '0 0 0 5px rgba(255,59,48,0.4)';
      });
      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        marker.style.boxShadow = '0 0 0 3px rgba(255,59,48,0.3)';
      });

      marker.addEventListener('click', () => {
        document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active-step'));
        const stepCard = document.getElementById('step-' + step.id);
        if (stepCard) {
          stepCard.classList.add('active-step');
          stepCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      container.appendChild(marker);
    });
  }

  if (img.complete && img.naturalWidth > 0) {
    drawMarkers();
  } else {
    img.addEventListener('load', drawMarkers);
  }

  window.addEventListener('resize', drawMarkers);
}

/* ── Mobile Sidebar ─────────────────────────────────────────── */
function bindSidebarEvents() {
  hamburgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
}
function toggleSidebar() { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); }
function openSidebar()  { sidebar.classList.add('open'); overlay.classList.remove('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.add('hidden'); hamburgerBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
