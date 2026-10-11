/**
 * CHMSU HireMe — Notification System (Jobseeker Portal)
 * Polls /notifications every 30 s and shows in-app toasts + dropdown panel.
 */
import { icon } from './icons.js';
import { apiGet, apiPatch } from '../api/client.js';
import { navigate } from '../router.js';

/* ── Type → display config ─────────────────────────────────────── */
const typeConfig = {
  application_reviewed:     { ic: 'eye',          color: '#3B82F6', bg: 'rgba(59,130,246,.12)', route: '/applications' },
  interview_scheduled:      { ic: 'video',        color: '#D97706', bg: 'rgba(217,119,6,.12)',  route: '/interview'    },
  interview_rescheduled:    { ic: 'clock',        color: '#D97706', bg: 'rgba(217,119,6,.12)',  route: '/interview'    },
  interview_cancelled:      { ic: 'alertCircle',  color: '#EF4444', bg: 'rgba(239,68,68,.12)',  route: '/interview'    },
  application_offered:      { ic: 'award',        color: '#16A34A', bg: 'rgba(22,163,74,.12)',  route: '/applications' },
  application_rejected:     { ic: 'alertCircle',  color: '#6B7280', bg: 'rgba(107,114,128,.1)', route: '/applications' },
  company_accepted:         { ic: 'award',        color: '#10B981', bg: 'rgba(16,185,129,.12)', route: '/applications' },
  company_rejected:         { ic: 'alertCircle',  color: '#EF4444', bg: 'rgba(239,68,68,.12)',  route: '/applications' },
  offer_accepted:           { ic: 'award',        color: '#10B981', bg: 'rgba(16,185,129,.12)', route: '/applications' },
  offer_rejected:           { ic: 'alertCircle',  color: '#6B7280', bg: 'rgba(107,114,128,.1)', route: '/applications' },
  chat_message:             { ic: 'messageCircle',color: '#4A6CF7', bg: 'rgba(74,108,247,.12)', route: ''              },
  admin_broadcast:          { ic: 'bell',         color: '#005930', bg: 'rgba(0,89,48,.12)',    route: '/'             },
  announcement:             { ic: 'bell',         color: '#005930', bg: 'rgba(0,89,48,.12)',    route: '/'             },
  graduation_promotion:     { ic: 'award',        color: '#10B981', bg: 'rgba(16,185,129,.12)', route: '/portfolio'    },
  alumni_registration:      { ic: 'award',        color: '#4F46E5', bg: 'rgba(79,70,229,.12)',  route: '/portfolio'    },
  ojt_evaluation_completed: { ic: 'award',        color: '#10B981', bg: 'rgba(16,185,129,.12)', route: '/portfolio'    },
};
function cfg(type) { return typeConfig[type] || { ic: 'bell', color: '#005930', bg: 'rgba(0,89,48,.1)', route: '/' }; }

function normalizeJobseekerRoute(rawRoute, notifType = '') {
  if (notifType === 'chat_message') return '';
  const c = cfg(notifType);
  const src = rawRoute || c.route || '/';
  let clean = String(src).replace(/^#\/?/, '').replace(/^\/+/, '').trim();
  if (!clean || clean === 'home' || clean === 'dashboard') return '/';
  if (clean === 'interviews') return '/interview';
  return '/' + clean;
}

function navigateJobseekerNotification(targetRoute, notif = {}) {
  const nType = notif.type || '';
  if (nType === 'chat_message') {
    const convKey = notif.data?.conversation_key;
    if (typeof window.openChat === 'function') {
      window.openChat(convKey || undefined);
    }
    return;
  }
  if (targetRoute) {
    navigate(targetRoute);
  }
}

/* ── Toast ──────────────────────────────────────────────────────── */
function showToast(notif, onOpenAction) {
  let container = document.getElementById('notif-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-toast-container';
    document.body.appendChild(container);
  }

  const c = cfg(notif.type);
  const targetRoute = normalizeJobseekerRoute(notif.data?.route || notif.data?.action_url || c.route, notif.type);
  const toast = document.createElement('div');
  toast.className = 'notif-toast';
  toast.innerHTML = `
    <div class="notif-toast__icon" style="background:${c.bg};color:${c.color}">${icon(c.ic, 16)}</div>
    <div class="notif-toast__body">
      <div class="notif-toast__title">${notif.title}</div>
      <div class="notif-toast__msg">${notif.message}</div>
    </div>
    <button class="notif-toast__close">${icon('x', 14)}</button>
  `;

  toast.querySelector('.notif-toast__close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast(toast);
  });
  toast.addEventListener('click', async (e) => {
    if (!e.target.closest('.notif-toast__close')) {
      dismissToast(toast);
      if (notif.id) {
        await apiPatch(`/notifications/${notif.id}/read`).catch(() => {});
      }
      if (onOpenAction) onOpenAction();
      navigateJobseekerNotification(targetRoute, notif);
    }
  });

  container.prepend(toast);
  // Animate in
  requestAnimationFrame(() => toast.classList.add('notif-toast--visible'));
  // Auto-dismiss after 6 s
  setTimeout(() => dismissToast(toast), 6000);
}

function dismissToast(toast) {
  toast.classList.remove('notif-toast--visible');
  toast.classList.add('notif-toast--hiding');
  setTimeout(() => toast.remove(), 350);
}

/* ── Panel rendering ────────────────────────────────────────────── */
function renderList(notifications, listEl) {
  if (!notifications.length) {
    listEl.innerHTML = `
      <div class="notif-panel__empty">
        <div class="notif-panel__empty-icon">${icon('bellOff', 24)}</div>
        <p>No notifications yet</p>
      </div>`;
    return;
  }

  listEl.innerHTML = notifications.map(n => {
    const c = cfg(n.type);
    const targetRoute = normalizeJobseekerRoute(n.data?.route || n.data?.action_url || c.route, n.type);
    const convAttr = n.data?.conversation_key ? `data-conv-key="${n.data.conversation_key}"` : '';
    return `
      <button class="notif-item${n.is_read ? '' : ' notif-item--unread'}" data-id="${n.id}" data-type="${n.type || ''}" ${convAttr} data-route="${targetRoute}">
        <div class="notif-item__icon" style="background:${c.bg};color:${c.color}">${icon(c.ic, 14)}</div>
        <div class="notif-item__body">
          <div class="notif-item__title">${n.title}</div>
          <div class="notif-item__msg">${n.message}</div>
          <div class="notif-item__time">${n.created_at}</div>
        </div>
        ${!n.is_read ? '<span class="notif-item__dot"></span>' : ''}
      </button>`;
  }).join('');
}

function updateBadge(badgeEl, count) {
  if (count > 0) {
    badgeEl.textContent = count > 99 ? '99+' : count;
    badgeEl.style.display = 'flex';
  } else {
    badgeEl.style.display = 'none';
  }
}

/* ── Main init ──────────────────────────────────────────────────── */
export function initNotifications(nav) {
  const bellBtn   = nav.querySelector('#notif-bell');
  const panel     = nav.querySelector('#notif-panel');
  const badgeEl   = nav.querySelector('#notif-badge');
  const listEl    = nav.querySelector('#notif-list');
  const readAllBtn = nav.querySelector('#notif-read-all');

  if (!bellBtn || !panel) return;

  let notifications = [];
  let lastUnread    = -1;   // -1 = first load, don't toast existing notifications
  let panelOpen     = false;

  /* ── Toggle panel ── */
  bellBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    panelOpen = !panelOpen;
    panel.classList.toggle('notif-panel--open', panelOpen);

    if (panelOpen) {
      await loadNotifications();
    }
  });

  document.addEventListener('click', (e) => {
    if (!nav.querySelector('#notif-dropdown').contains(e.target)) {
      panelOpen = false;
      panel.classList.remove('notif-panel--open');
    }
  });

  /* ── Mark all read ── */
  readAllBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await apiPatch('/notifications/read-all');
    notifications = notifications.map(n => ({ ...n, is_read: true }));
    renderList(notifications, listEl);
    updateBadge(badgeEl, 0);
    lastUnread = 0;
  });

  /* ── Mark individual read + navigate ── */
  listEl.addEventListener('click', async (e) => {
    const item = e.target.closest('.notif-item');
    if (!item) return;

    const id      = item.dataset.id;
    const route   = item.dataset.route;
    const nType   = item.dataset.type || '';
    const convKey = item.dataset.convKey || '';

    if (item.classList.contains('notif-item--unread')) {
      await apiPatch(`/notifications/${id}/read`).catch(() => {});
      item.classList.remove('notif-item--unread');
      const dot = item.querySelector('.notif-item__dot');
      if (dot) dot.remove();
      const unread = listEl.querySelectorAll('.notif-item--unread').length;
      updateBadge(badgeEl, unread);
    }

    panelOpen = false;
    panel.classList.remove('notif-panel--open');
    navigateJobseekerNotification(route, { type: nType, data: convKey ? { conversation_key: convKey } : {} });
  });

  /* ── Load from API ── */
  async function loadNotifications() {
    const data = await apiGet('/notifications').catch(() => null);
    if (!data || !data.data) return;

    notifications = data.data;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    lastUnread = unreadCount;
    updateBadge(badgeEl, unreadCount);
    renderList(notifications, listEl);
  }

  /* ── Fast Delta Sync Engine ── */
  let latestId = null;
  let isSyncing = false;
  let pollTimer = null;

  const notifChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hireme_notif_bus') : null;
  if (notifChannel) {
    notifChannel.onmessage = (e) => {
      const msg = e.data;
      if (msg?.type === 'SYNC_COUNT') {
        updateBadge(badgeEl, msg.count);
      } else if (msg?.type === 'NOTIF_READ') {
        syncNotifications();
      }
    };
  }

  async function syncNotifications() {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const url = latestId !== null
        ? `/notifications/sync?since_id=${latestId}`
        : '/notifications/sync';

      const res = await apiGet(url).catch(() => null);
      if (!res || !res.success) return;

      const count = res.unread_count ?? 0;
      updateBadge(badgeEl, count);

      if (latestId === null) {
        latestId = res.latest_id ?? 0;
        lastUnread = count;
        return;
      }

      latestId = Math.max(latestId, res.latest_id ?? latestId);

      const newNotifs = Array.isArray(res.new_notifications) ? res.new_notifications : [];
      if (newNotifs.length > 0) {
        newNotifs.forEach(n => showToast(n));
        window.dispatchEvent(new CustomEvent('hireme:notification-received', { detail: newNotifs }));
        notifChannel?.postMessage({ type: 'SYNC_COUNT', count, latestId });
        if (panelOpen) {
          loadNotifications();
        }
      }
      lastUnread = count;
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

  // Initial sync & start adaptive polling
  syncNotifications();
  scheduleNextPoll(4000);
}
