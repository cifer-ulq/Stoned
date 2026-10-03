/**
 * CHMSU HireMe — Notification System (Jobseeker Portal)
 * Polls /notifications every 30 s and shows in-app toasts + dropdown panel.
 */
import { icon } from './icons.js';
import { apiGet, apiPatch } from '../api/client.js';
import { navigate } from '../router.js';

/* ── Type → display config ─────────────────────────────────────── */
const typeConfig = {
  application_reviewed: { ic: 'eye',          color: '#3B82F6', bg: 'rgba(59,130,246,.12)', route: '/applications' },
  interview_scheduled:  { ic: 'video',         color: '#D97706', bg: 'rgba(217,119,6,.12)',  route: '/interview'    },
  application_offered:  { ic: 'award',         color: '#16A34A', bg: 'rgba(22,163,74,.12)',  route: '/applications' },
  application_rejected: { ic: 'alertCircle',   color: '#6B7280', bg: 'rgba(107,114,128,.1)', route: '/applications' },
};
function cfg(type) { return typeConfig[type] || { ic: 'bell', color: '#6366F1', bg: 'rgba(99,102,241,.1)', route: '/applications' }; }

/* ── Toast ──────────────────────────────────────────────────────── */
function showToast(notif) {
  let container = document.getElementById('notif-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-toast-container';
    document.body.appendChild(container);
  }

  const c = cfg(notif.type);
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

  toast.querySelector('.notif-toast__close').addEventListener('click', () => dismissToast(toast));
  toast.addEventListener('click', (e) => {
    if (!e.target.closest('.notif-toast__close')) {
      navigate(c.route);
      dismissToast(toast);
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
    return `
      <button class="notif-item${n.is_read ? '' : ' notif-item--unread'}" data-id="${n.id}" data-route="${c.route}">
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

    const id    = item.dataset.id;
    const route = item.dataset.route;

    if (!item.classList.contains('notif-item--unread') === false) {
      await apiPatch(`/notifications/${id}/read`).catch(() => {});
      item.classList.remove('notif-item--unread');
      const dot = item.querySelector('.notif-item__dot');
      if (dot) dot.remove();
      const unread = listEl.querySelectorAll('.notif-item--unread').length;
      updateBadge(badgeEl, unread);
    }

    panelOpen = false;
    panel.classList.remove('notif-panel--open');
    navigate(route);
  });

  /* ── Load from API ── */
  async function loadNotifications() {
    const data = await apiGet('/notifications').catch(() => null);
    if (!data || !data.data) return;

    notifications = data.data;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Show toasts only for new notifications after first load
    if (lastUnread >= 0 && unreadCount > lastUnread) {
      const newOnes = notifications.filter(n => !n.is_read).slice(0, unreadCount - lastUnread);
      newOnes.forEach(n => showToast(n));
    }

    lastUnread = unreadCount;
    updateBadge(badgeEl, unreadCount);
    renderList(notifications, listEl);
  }

  /* ── Poll for unread count every 30 s ── */
  async function pollCount() {
    const data = await apiGet('/notifications/unread-count').catch(() => null);
    if (!data) return;

    const count = data.count ?? 0;
    if (lastUnread >= 0 && count > lastUnread) {
      // New notifications arrived — load full list to get content for toasts
      await loadNotifications();
    } else {
      lastUnread = count;
      updateBadge(badgeEl, count);
    }
  }

  // Initial silent badge load (no toasts on first load)
  apiGet('/notifications/unread-count').then(data => {
    if (data) {
      lastUnread = data.count ?? 0;
      updateBadge(badgeEl, lastUnread);
    }
  }).catch(() => {});

  // Start polling
  setInterval(pollCount, 30_000);
}
