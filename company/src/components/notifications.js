/* ===========================
   Notification Panel — shared component
   Used by: main (student), company, supervisors portals
   =========================== */

import { icon } from './icons.js';

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
  student_applied:       { ic: 'userPlus',       color: '#4A6CF7' },
  offer_accepted:        { ic: 'checkCircle',     color: '#10B981' },
  offer_rejected:        { ic: 'xCircle',         color: '#EF4444' },
  company_accepted:      { ic: 'checkCircle',     color: '#10B981' },
  company_rejected:      { ic: 'xCircle',         color: '#EF4444' },
  endorsement_requested: { ic: 'fileText',         color: '#F59E0B' },
  endorsement_sent:      { ic: 'send',             color: '#10B981' },
  supervisor_rejected:   { ic: 'alertTriangle',    color: '#EF4444' },
  ojt_started:           { ic: 'graduationCap',    color: '#8B5CF6' },
};

function cfg(type) {
  return TYPE_CFG[type] || { ic: 'bell', color: '#6B7280' };
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
      box-shadow: 0 8px 32px rgba(0,0,0,.14);
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
      color: var(--color-primary, #4A6CF7);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .notif-panel__mark-all:hover { background: var(--bg-hover, rgba(74,108,247,.08)); }
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
    .notif-item--unread { background: var(--notif-unread-bg, rgba(74,108,247,.05)); }
    .notif-item--unread:hover { background: var(--notif-unread-bg-hover, rgba(74,108,247,.1)); }
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
      background: #4A6CF7;
      border-radius: 50%;
      align-self: center;
      flex-shrink: 0;
    }
    .notif-empty {
      text-align: center;
      padding: 32px 16px;
      color: var(--text-secondary, #6b7280);
      font-size: .85rem;
    }
    .notif-badge {
      position: absolute;
      top: -4px; right: -4px;
      min-width: 16px; height: 16px;
      background: #EF4444;
      color: #fff;
      font-size: .6rem;
      font-weight: 700;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px;
      pointer-events: none;
    }
  `;
  document.head.appendChild(s);
}

/* ── Main exported function ── */
export function initNotifications(triggerBtn) {
  injectStyles();

  let panel = null;
  let pollTimer = null;

  // Make button relative for badge positioning
  triggerBtn.style.position = 'relative';

  const dot = triggerBtn.querySelector('.navbar__notif-dot');
  if (dot) dot.style.display = 'none'; // hide old CSS dot, we use badge now

  let badge = triggerBtn.querySelector('.notif-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.style.display = 'none';
    triggerBtn.appendChild(badge);
  }

  async function refreshCount() {
    const res = await apiNotif('GET', '/notifications/unread-count');
    const count = res?.count ?? 0;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(refreshCount, 45000);
  }

  function closePanel() {
    panel?.remove();
    panel = null;
  }

  async function openPanel() {
    if (panel) { closePanel(); return; }

    panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-panel__head">
        ${icon('bell', 15)} Notifications
        <button class="notif-panel__mark-all" id="notif-mark-all">Mark all read</button>
      </div>
      <div class="notif-panel__list" id="notif-list">
        <div class="notif-empty">${icon('clock', 18)}<br>Loading…</div>
      </div>
    `;

    // Position relative to button
    const wrap = triggerBtn.closest('.navbar__right') || triggerBtn.parentElement;
    wrap.style.position = 'relative';
    wrap.appendChild(panel);

    panel.querySelector('#notif-mark-all').addEventListener('click', async (e) => {
      e.stopPropagation();
      await apiNotif('PATCH', '/notifications/read-all');
      badge.style.display = 'none';
      renderList([]);
      refreshCount();
      loadNotifications();
    });

    // Close on outside click
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
      return `
        <div class="notif-item ${n.is_read ? '' : 'notif-item--unread'}" data-id="${n.id}">
          <div class="notif-icon" style="background:${c.color}18;color:${c.color}">${icon(c.ic, 17)}</div>
          <div class="notif-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${n.created_at}</div>
          </div>
          ${!n.is_read ? '<div class="notif-unread-dot"></div>' : ''}
        </div>`;
    }).join('');

    listEl.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id;
        el.classList.remove('notif-item--unread');
        el.querySelector('.notif-unread-dot')?.remove();
        await apiNotif('PATCH', `/notifications/${id}/read`);
        refreshCount();
      });
    });
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPanel();
  });

  // Initial load
  refreshCount();
  startPolling();
}
