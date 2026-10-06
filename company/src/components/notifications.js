/* ===========================
   Notification Panel & Real-Time Sync Engine — Company Portal
   =========================== */

import { icon } from './icons.js';
import { apiCache } from '../api/client.js';

const API_BASE = 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('hireme_token');
}

async function apiNotif(method, path, body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API_BASE}${path}`, opts);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

const TYPE_CFG = {
  student_applied:       { ic: 'userPlus',       color: '#4A6CF7', defaultRoute: '#applicants' },
  offer_accepted:        { ic: 'checkCircle',     color: '#10B981', defaultRoute: '#applicants' },
  offer_rejected:        { ic: 'xCircle',         color: '#EF4444', defaultRoute: '#applicants' },
  company_accepted:      { ic: 'checkCircle',     color: '#10B981', defaultRoute: '#applicants' },
  company_rejected:      { ic: 'xCircle',         color: '#EF4444', defaultRoute: '#applicants' },
  interview_scheduled:   { ic: 'calendar',        color: '#D97706', defaultRoute: '#interviews' },
  interview_rescheduled: { ic: 'clock',           color: '#D97706', defaultRoute: '#interviews' },
  endorsement_requested: { ic: 'fileText',         color: '#F59E0B', defaultRoute: '#ojt-trainees' },
  endorsement_sent:      { ic: 'send',             color: '#10B981', defaultRoute: '#ojt-trainees' },
  supervisor_rejected:   { ic: 'alertTriangle',    color: '#EF4444', defaultRoute: '#ojt-trainees' },
  ojt_started:           { ic: 'graduationCap',    color: '#8B5CF6', defaultRoute: '#ojt-trainees' },
  admin_broadcast:       { ic: 'bell',             color: '#005930', defaultRoute: '#dashboard' },
  announcement:          { ic: 'bell',             color: '#005930', defaultRoute: '#dashboard' },
};

function cfg(type) {
  return TYPE_CFG[type] || { ic: 'bell', color: '#005930', defaultRoute: '#dashboard' };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Synthesized Audio Cue ── */
function playNotifChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.08);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}

/* ── Toast Container & Display ── */
function ensureToastContainer() {
  let c = document.getElementById('hireme-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'hireme-toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(notif, onOpenAction) {
  const container = ensureToastContainer();
  playNotifChime();

  const c = cfg(notif.type);
  const rawRoute = notif.data?.route || notif.data?.action_url || c.defaultRoute || '';
  const actionUrl = rawRoute && !rawRoute.startsWith('#') && !rawRoute.startsWith('http') ? '#' + rawRoute : rawRoute;

  const toast = document.createElement('div');
  toast.className = 'hireme-toast';
  toast.innerHTML = `
    <div class="hireme-toast__icon" style="background:${c.color}1c;color:${c.color}">
      ${icon(c.ic, 18)}
    </div>
    <div class="hireme-toast__content">
      <div class="hireme-toast__title">${escapeHtml(notif.title)}</div>
      <div class="hireme-toast__msg">${escapeHtml(notif.message)}</div>
    </div>
    <button class="hireme-toast__close" aria-label="Close">${icon('x', 14)}</button>
  `;

  let timer = null;
  const dismiss = () => {
    clearTimeout(timer);
    toast.classList.remove('hireme-toast--visible');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.hireme-toast__close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  toast.addEventListener('click', async (e) => {
    if (e.target.closest('.hireme-toast__close')) return;
    dismiss();
    await apiNotif('PATCH', `/notifications/${notif.id}/read`);
    if (onOpenAction) onOpenAction();
    if (actionUrl) {
      if (actionUrl.startsWith('#')) {
        window.location.hash = actionUrl;
      } else {
        window.location.href = actionUrl;
      }
    }
  });

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('hireme-toast--visible'));
  timer = setTimeout(dismiss, 6500);
}

/* ── Styles (injected once) ── */
function injectStyles() {
  if (document.getElementById('notif-styles')) return;
  const s = document.createElement('style');
  s.id = 'notif-styles';
  s.textContent = `
    .notif-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      max-height: 480px;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 14px;
      box-shadow: 0 12px 36px rgba(0,0,0,.15);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: notif-in .15s ease;
    }
    @keyframes notif-in { from { opacity:0; transform:translateY(-6px) } }
    .notif-panel__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--border-light, #e5e7eb);
      font-weight: 700;
      font-size: .92rem;
      color: var(--text-primary, #111);
      flex-shrink: 0;
    }
    .notif-panel__mark-all {
      font-size: .75rem;
      font-weight: 500;
      color: var(--color-primary, #005930);
      background: none;
      border: none;
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .notif-panel__mark-all:hover { background: rgba(0,89,48,.08); }
    .notif-panel__list {
      overflow-y: auto;
      flex: 1;
    }
    .notif-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-light, #f3f4f6);
      transition: background .12s;
    }
    .notif-item:hover { background: var(--bg-hover, rgba(0,0,0,.03)); }
    .notif-item--unread { background: rgba(0,89,48,.04); }
    .notif-item--unread:hover { background: rgba(0,89,48,.08); }
    .notif-icon {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title {
      font-weight: 600;
      font-size: .82rem;
      color: var(--text-primary, #111);
      margin-bottom: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .notif-msg {
      font-size: .78rem;
      color: var(--text-secondary, #6b7280);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notif-time {
      font-size: .7rem;
      color: var(--text-muted, #9ca3af);
      margin-top: 3px;
    }
    .notif-unread-dot {
      width: 7px; height: 7px;
      background: #005930;
      border-radius: 50%;
      align-self: center;
      flex-shrink: 0;
    }
    .notif-empty {
      text-align: center;
      padding: 36px 16px;
      color: var(--text-secondary, #6b7280);
      font-size: .85rem;
    }
    .notif-badge {
      position: absolute;
      top: -4px; right: -4px;
      min-width: 17px; height: 17px;
      background: #EF4444;
      color: #fff;
      font-size: .62rem;
      font-weight: 700;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
      pointer-events: none;
      box-shadow: 0 0 0 2px var(--bg-card, #fff);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .notif-badge-pulse {
      animation: notif-badge-pop 0.3s ease;
    }
    @keyframes notif-badge-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.35); }
      100% { transform: scale(1); }
    }

    /* ── Floating Toasts ── */
    #hireme-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 100000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 380px;
      width: calc(100vw - 36px);
    }
    .hireme-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--border-light, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 10px 28px -4px rgba(0,0,0,0.14), 0 4px 12px -2px rgba(0,0,0,0.06);
      cursor: pointer;
      opacity: 0;
      transform: translateY(-16px) scale(0.96);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hireme-toast--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .hireme-toast__icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .hireme-toast__content {
      flex: 1;
      min-width: 0;
    }
    .hireme-toast__title {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .hireme-toast__msg {
      font-size: 0.78rem;
      color: var(--text-secondary, #475569);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .hireme-toast__close {
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: 2px;
      transition: color 0.15s, background 0.15s;
    }
    .hireme-toast__close:hover {
      color: #0f172a;
      background: rgba(0,0,0,0.06);
    }
  `;
  document.head.appendChild(s);
}

/* ── Main Exported Function ── */
export function initNotifications(triggerBtn) {
  injectStyles();

  let panel = null;
  let pollTimer = null;
  let latestNotifId = null;
  let lastCount = -1;
  let isSyncing = false;

  triggerBtn.style.position = 'relative';

  const dot = triggerBtn.querySelector('.navbar__notif-dot');
  if (dot) dot.style.display = 'none';

  let badge = triggerBtn.querySelector('.notif-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.style.display = 'none';
    triggerBtn.appendChild(badge);
  }

  const notifChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hireme_notif_bus') : null;
  if (notifChannel) {
    notifChannel.onmessage = (e) => {
      const msg = e.data;
      if (msg?.type === 'SYNC_COUNT') {
        updateBadgeUI(msg.count);
      } else if (msg?.type === 'NOTIF_READ') {
        syncNotifications();
      }
    };
  }

  function updateBadgeUI(count) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
      if (lastCount !== -1 && count > lastCount) {
        badge.classList.remove('notif-badge-pulse');
        void badge.offsetWidth;
        badge.classList.add('notif-badge-pulse');
      }
    } else {
      badge.style.display = 'none';
    }
    lastCount = count;
  }

  function dispatchReactiveEvents(notifs) {
    if (!Array.isArray(notifs) || notifs.length === 0) return;
    window.dispatchEvent(new CustomEvent('hireme:notification-received', { detail: notifs }));

    const invalidationPatterns = new Set();

    notifs.forEach(n => {
      const t = n.type || '';
      if (t.includes('applied') || t.includes('offer') || t.includes('accepted') || t.includes('rejected')) {
        window.dispatchEvent(new CustomEvent('hireme:applicants-refresh', { detail: n }));
        invalidationPatterns.add('/company/applications*');
        invalidationPatterns.add('/company/ojt-postings*');
        invalidationPatterns.add('/company/dashboard*');
        invalidationPatterns.add('/company/analytics*');
      }
      if (t.includes('interview')) {
        window.dispatchEvent(new CustomEvent('hireme:interviews-updated', { detail: n }));
        invalidationPatterns.add('/company/interviews*');
        invalidationPatterns.add('/company/applications*');
        invalidationPatterns.add('/company/dashboard*');
      }
      if (t.includes('endorsement') || t.includes('ojt') || t.includes('time_') || t.includes('evaluation')) {
        window.dispatchEvent(new CustomEvent('hireme:ojt-trainees-refresh', { detail: n }));
        invalidationPatterns.add('/company/ojt-trainees*');
        invalidationPatterns.add('/company/applications*');
        invalidationPatterns.add('/company/dashboard*');
        invalidationPatterns.add('/company/analytics*');
      }
      if (t.includes('broadcast') || t.includes('announcement')) {
        invalidationPatterns.add('/company/dashboard*');
      }
      if (t.includes('chat')) {
        window.dispatchEvent(new CustomEvent('hireme:chat-received', { detail: n }));
      }
    });

    if (invalidationPatterns.size > 0 && typeof apiCache?.invalidate === 'function') {
      apiCache.invalidate(Array.from(invalidationPatterns));
    }
  }

  async function syncNotifications() {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const url = latestNotifId !== null
        ? `/notifications/sync?since_id=${latestNotifId}`
        : '/notifications/sync';

      const res = await apiNotif('GET', url);
      if (!res || !res.success) return;

      const count = res.unread_count ?? 0;
      updateBadgeUI(count);

      if (latestNotifId === null) {
        latestNotifId = res.latest_id ?? 0;
        return;
      }

      latestNotifId = Math.max(latestNotifId, res.latest_id ?? latestNotifId);

      const newNotifs = Array.isArray(res.new_notifications) ? res.new_notifications : [];
      if (newNotifs.length > 0) {
        newNotifs.forEach(n => {
          showToast(n, () => syncNotifications());
          prependItemToPanel(n);
        });

        dispatchReactiveEvents(newNotifs);
        notifChannel?.postMessage({ type: 'SYNC_COUNT', count, latestId: latestNotifId });
      }
    } finally {
      isSyncing = false;
    }
  }

  function scheduleNextPoll(delay = 4000) {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(async () => {
      await syncNotifications();
      const nextDelay = document.hidden ? 30000 : 4000;
      scheduleNextPoll(nextDelay);
    }, delay);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncNotifications();
      scheduleNextPoll(4000);
    } else {
      scheduleNextPoll(30000);
    }
  });

  window.addEventListener('focus', () => {
    syncNotifications();
  });

  function closePanel() {
    panel?.remove();
    panel = null;
  }

  function prependItemToPanel(n) {
    if (!panel) return;
    const listEl = panel.querySelector('#notif-list');
    if (!listEl) return;
    const emptyEl = listEl.querySelector('.notif-empty');
    if (emptyEl) emptyEl.remove();

    const c = cfg(n.type);
    const rawRoute = n.data?.route || n.data?.action_url || c.defaultRoute || '';
    const actionUrl = rawRoute && !rawRoute.startsWith('#') && !rawRoute.startsWith('http') ? '#' + rawRoute : rawRoute;

    const row = document.createElement('div');
    row.className = `notif-item ${n.is_read ? '' : 'notif-item--unread'}`;
    row.dataset.id = n.id;
    row.dataset.action = actionUrl;
    row.innerHTML = `
      <div class="notif-icon" style="background:${c.color}18;color:${c.color}">${icon(c.ic, 17)}</div>
      <div class="notif-body">
        <div class="notif-title">${escapeHtml(n.title)}</div>
        <div class="notif-msg">${escapeHtml(n.message)}</div>
        <div class="notif-time">${escapeHtml(n.created_at || 'Just now')}</div>
      </div>
      ${!n.is_read ? '<div class="notif-unread-dot"></div>' : ''}
    `;

    attachItemClick(row);
    listEl.prepend(row);
  }

  function attachItemClick(el) {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const actionUrl = el.dataset.action;
      el.classList.remove('notif-item--unread');
      el.querySelector('.notif-unread-dot')?.remove();
      await apiNotif('PATCH', `/notifications/${id}/read`);
      syncNotifications();
      notifChannel?.postMessage({ type: 'NOTIF_READ', id });
      if (actionUrl) {
        closePanel();
        if (actionUrl.startsWith('#')) {
          window.location.hash = actionUrl;
        } else {
          window.location.href = actionUrl;
        }
      }
    });
  }

  async function openPanel() {
    if (panel) { closePanel(); return; }

    panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-panel__head">
        <div style="display:flex;align-items:center;gap:6px;">
          ${icon('bell', 15)} <span>Notifications</span>
        </div>
        <button class="notif-panel__mark-all" id="notif-mark-all">Mark all read</button>
      </div>
      <div class="notif-panel__list" id="notif-list">
        <div class="notif-empty">${icon('clock', 18)}<br>Loading…</div>
      </div>
    `;

    const wrap = triggerBtn.closest('.navbar__right') || triggerBtn.parentElement;
    wrap.style.position = 'relative';
    wrap.appendChild(panel);

    panel.querySelector('#notif-mark-all').addEventListener('click', async (e) => {
      e.stopPropagation();
      await apiNotif('PATCH', '/notifications/read-all');
      badge.style.display = 'none';
      renderList([]);
      syncNotifications();
      notifChannel?.postMessage({ type: 'NOTIF_READ' });
      loadNotifications();
    });

    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!panel?.contains(e.target) && e.target !== triggerBtn) {
          closePanel();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);

    await loadNotifications();
  }

  async function loadNotifications() {
    const res = await apiNotif('GET', '/notifications');
    const list = res?.data ?? [];
    renderList(list);
  }

  function renderList(list) {
    const listEl = panel?.querySelector('#notif-list');
    if (!listEl) return;

    if (!list.length) {
      listEl.innerHTML = `<div class="notif-empty">${icon('bellOff', 22)}<br>No notifications yet.</div>`;
      return;
    }

    listEl.innerHTML = list.map(n => {
      const c = cfg(n.type);
      const rawRoute = n.data?.route || n.data?.action_url || c.defaultRoute || '';
      const actionUrl = rawRoute && !rawRoute.startsWith('#') && !rawRoute.startsWith('http') ? '#' + rawRoute : rawRoute;
      return `
        <div class="notif-item ${n.is_read ? '' : 'notif-item--unread'}" data-id="${n.id}" data-action="${actionUrl}">
          <div class="notif-icon" style="background:${c.color}18;color:${c.color}">${icon(c.ic, 17)}</div>
          <div class="notif-body">
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-msg">${escapeHtml(n.message)}</div>
            <div class="notif-time">${escapeHtml(n.created_at)}</div>
          </div>
          ${!n.is_read ? '<div class="notif-unread-dot"></div>' : ''}
        </div>`;
    }).join('');

    listEl.querySelectorAll('.notif-item').forEach(attachItemClick);
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPanel();
  });

  syncNotifications();
  scheduleNextPoll(4000);
}
