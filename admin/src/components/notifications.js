/* ── Notification System — Admin Portal ── */
import { icon, renderIcons } from './icons.js';
import { apiGet, apiPatch, apiDelete, invalidateCache } from '../api/client.js';

let _unreadCount = 0;
let _notifications = [];
let _activeTab = 'all'; // 'all' | 'unread'
let _isPanelOpen = false;
let _pollTimer = null;
let _lastPolledCount = -1;

/* ── Type Configurations ── */
const TYPE_CONFIG = {
  company_registered:          { icon: 'briefcase',      color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)',  route: '/companies' },
  moa_submitted:               { icon: 'file-text',      color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)',  route: '/companies' },
  moa_expiring:                { icon: 'alert-triangle', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)',  route: '/companies' },
  moa_approved:                { icon: 'check-circle',   color: '#059669', bg: 'rgba(5, 150, 105, 0.12)',  route: '/companies' },
  student_eligible_graduation: { icon: 'graduation-cap', color: '#005930', bg: 'rgba(0, 89, 48, 0.12)',    route: '/students' },
  graduation_promotion:        { icon: 'award',          color: '#059669', bg: 'rgba(5, 150, 105, 0.12)',  route: '/students' },
  alumni_registration:         { icon: 'users',          color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)',  route: '/students' },
  ojt_evaluation_completed:    { icon: 'clipboard-check',color: '#005930', bg: 'rgba(0, 89, 48, 0.12)',    route: '/ojt' },
  ojt_started:                 { icon: 'layers',         color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', route: '/ojt' },
  endorsement_requested:       { icon: 'file',           color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)',  route: '/ojt' },
  admin_broadcast:             { icon: 'bell',           color: '#005930', bg: 'rgba(0, 89, 48, 0.14)',    route: '/students' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { icon: 'bell', color: '#005930', bg: 'rgba(0, 89, 48, 0.12)', route: '/' };
}

/* ── Inject Styles Once ── */
function injectStyles() {
  if (document.getElementById('admin-notif-styles')) return;
  const style = document.createElement('style');
  style.id = 'admin-notif-styles';
  style.textContent = `
    .navbar__notif-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .admin-notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 17px;
      height: 17px;
      background: #EF4444;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
      pointer-events: none;
      box-shadow: 0 0 0 2px var(--bg-elevated, #fff);
      animation: badgePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes badgePop {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .admin-notif-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 390px;
      max-width: calc(100vw - 32px);
      max-height: 520px;
      background: var(--bg-elevated, #ffffff);
      border: 1px solid var(--border-default, #e2e8f0);
      border-radius: 14px;
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.14), 0 4px 12px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: adminNotifIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes adminNotifIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .admin-notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px 10px;
      border-bottom: 1px solid var(--border-default, #e2e8f0);
      background: var(--bg-elevated, #ffffff);
      flex-shrink: 0;
    }
    .admin-notif-header__title {
      font-size: 0.925rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .admin-notif-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .admin-notif-btn-link {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-primary, #005930);
      background: none;
      border: none;
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
    }
    .admin-notif-btn-link:hover {
      background: var(--color-primary-bg, rgba(0, 89, 48, 0.08));
    }
    .admin-notif-tabs {
      display: flex;
      gap: 6px;
      padding: 8px 18px;
      border-bottom: 1px solid var(--border-default, #e2e8f0);
      background: var(--bg-secondary, #f8fafc);
      flex-shrink: 0;
    }
    .admin-notif-tab {
      padding: 4px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 20px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .admin-notif-tab--active {
      background: var(--bg-elevated, #ffffff);
      color: var(--color-primary, #005930);
      border-color: var(--border-default, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .admin-notif-list {
      overflow-y: auto;
      flex: 1;
      max-height: 380px;
      background: var(--bg-elevated, #ffffff);
    }
    .admin-notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 18px;
      border-bottom: 1px solid var(--border-default, #f1f5f9);
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .admin-notif-item:hover {
      background: var(--bg-secondary, #f8fafc);
    }
    .admin-notif-item--unread {
      background: var(--color-primary-bg, rgba(0, 89, 48, 0.04));
    }
    .admin-notif-item--unread:hover {
      background: rgba(0, 89, 48, 0.08);
    }
    .admin-notif-item__icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .admin-notif-item__body {
      flex: 1;
      min-width: 0;
    }
    .admin-notif-item__title {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .admin-notif-item__msg {
      font-size: 0.775rem;
      color: var(--text-secondary, #64748b);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .admin-notif-item__meta {
      font-size: 0.6875rem;
      color: var(--text-tertiary, #94a3b8);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .admin-notif-item__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-primary, #005930);
      flex-shrink: 0;
      margin-top: 6px;
    }
    .admin-notif-empty {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-secondary, #64748b);
    }
    .admin-notif-empty__icon {
      margin-bottom: 8px;
      opacity: 0.45;
      display: flex;
      justify-content: center;
    }
    .admin-notif-empty__text {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
    .admin-notif-empty__sub {
      font-size: 0.75rem;
      color: var(--text-tertiary, #94a3b8);
      margin-top: 3px;
    }
    /* Toast styles */
    #admin-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .admin-toast {
      pointer-events: auto;
      min-width: 300px;
      max-width: 380px;
      background: var(--bg-elevated, #ffffff);
      border: 1px solid var(--border-default, #e2e8f0);
      border-left: 4px solid var(--color-primary, #005930);
      border-radius: 12px;
      padding: 12px 14px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .admin-toast--visible {
      opacity: 1;
      transform: translateY(0);
    }
    .admin-toast--hiding {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
    }
    .admin-toast__icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .admin-toast__body {
      flex: 1;
      min-width: 0;
    }
    .admin-toast__title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin-bottom: 2px;
    }
    .admin-toast__msg {
      font-size: 0.75rem;
      color: var(--text-secondary, #64748b);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .admin-toast__close {
      background: none;
      border: none;
      color: var(--text-tertiary, #94a3b8);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .admin-toast__close:hover {
      color: var(--text-primary, #0f172a);
      background: var(--bg-secondary, #f1f5f9);
    }
  `;
  document.head.appendChild(style);
}

/* ── Floating Toast Alert ── */
function showToast(notification) {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    document.body.appendChild(container);
  }

  const c = getTypeConfig(notification.type);
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `
    <div class="admin-toast__icon" style="background:${c.bg};color:${c.color};">
      ${icon(c.icon, 16)}
    </div>
    <div class="admin-toast__body">
      <div class="admin-toast__title">${notification.title}</div>
      <div class="admin-toast__msg">${notification.message}</div>
    </div>
    <button class="admin-toast__close" title="Dismiss">${icon('x', 14)}</button>
  `;

  renderIcons(toast);

  const dismiss = () => {
    toast.classList.remove('admin-toast--visible');
    toast.classList.add('admin-toast--hiding');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.admin-toast__close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  toast.addEventListener('click', () => {
    const targetRoute = notification.data?.route || c.route;
    if (targetRoute) {
      window.location.hash = targetRoute;
    }
    dismiss();
  });

  container.prepend(toast);
  requestAnimationFrame(() => toast.classList.add('admin-toast--visible'));
  setTimeout(dismiss, 6000);
}

/* ── Panel Rendering ── */
function renderPanel(panelEl) {
  if (!panelEl) return;

  const filtered = _activeTab === 'unread'
    ? _notifications.filter(n => !n.is_read)
    : _notifications;

  const listEl = panelEl.querySelector('.admin-notif-list');
  if (!listEl) return;

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="admin-notif-empty">
        <div class="admin-notif-empty__icon">${icon('bell', 32)}</div>
        <div class="admin-notif-empty__text">${_activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</div>
        <div class="admin-notif-empty__sub">System alerts, registrations, and milestones will appear here.</div>
      </div>
    `;
    renderIcons(listEl);
    return;
  }

  listEl.innerHTML = filtered.map(n => {
    const c = getTypeConfig(n.type);
    return `
      <div class="admin-notif-item ${!n.is_read ? 'admin-notif-item--unread' : ''}" data-id="${n.id}">
        <div class="admin-notif-item__icon" style="background:${c.bg};color:${c.color};">
          ${icon(c.icon, 16)}
        </div>
        <div class="admin-notif-item__body">
          <div class="admin-notif-item__title">${n.title}</div>
          <div class="admin-notif-item__msg">${n.message}</div>
          <div class="admin-notif-item__meta">
            <span>${n.created_at || 'Recently'}</span>
          </div>
        </div>
        ${!n.is_read ? '<span class="admin-notif-item__dot"></span>' : ''}
      </div>
    `;
  }).join('');

  renderIcons(listEl);
}

/* ── Update Badge Element ── */
function updateBadgeUI(badgeEl, count) {
  if (!badgeEl) return;
  if (count > 0) {
    badgeEl.textContent = count > 99 ? '99+' : count;
    badgeEl.style.display = 'inline-flex';
  } else {
    badgeEl.style.display = 'none';
  }
}

/* ── Main Initializer ── */
export function initNotifications(triggerBtn) {
  if (!triggerBtn) return;
  injectStyles();

  const wrapper = triggerBtn.closest('.navbar__notif-wrapper') || triggerBtn.parentElement;
  if (wrapper) wrapper.style.position = 'relative';

  // Find or create badge
  let badgeEl = triggerBtn.querySelector('.admin-notif-badge');
  if (!badgeEl) {
    // Hide old CSS dot if present
    const oldDot = triggerBtn.querySelector('.notification-dot');
    if (oldDot) oldDot.style.display = 'none';

    badgeEl = document.createElement('span');
    badgeEl.className = 'admin-notif-badge';
    badgeEl.style.display = 'none';
    triggerBtn.appendChild(badgeEl);
  }

  let panelEl = null;

  function closePanel() {
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
    _isPanelOpen = false;
  }

  async function openPanel() {
    if (panelEl) {
      closePanel();
      return;
    }

    _isPanelOpen = true;
    panelEl = document.createElement('div');
    panelEl.className = 'admin-notif-panel';
    panelEl.innerHTML = `
      <div class="admin-notif-header">
        <div class="admin-notif-header__title">
          ${icon('bell', 16)} Notifications
          <span class="badge badge--primary" id="admin-notif-panel-count" style="font-size:0.6875rem;padding:2px 6px;">${_unreadCount} unread</span>
        </div>
        <div class="admin-notif-header__actions">
          <button class="admin-notif-btn-link" id="admin-notif-mark-all">Mark all read</button>
        </div>
      </div>
      <div class="admin-notif-tabs">
        <button class="admin-notif-tab ${_activeTab === 'all' ? 'admin-notif-tab--active' : ''}" data-tab="all">All</button>
        <button class="admin-notif-tab ${_activeTab === 'unread' ? 'admin-notif-tab--active' : ''}" data-tab="unread">Unread (${_unreadCount})</button>
      </div>
      <div class="admin-notif-list">
        <div class="admin-notif-empty">
          <div class="admin-notif-empty__icon">${icon('clock', 20)}</div>
          <div class="admin-notif-empty__text">Loading notifications…</div>
        </div>
      </div>
    `;

    renderIcons(panelEl);
    wrapper.appendChild(panelEl);

    // Tab switcher
    panelEl.querySelectorAll('.admin-notif-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        panelEl.querySelectorAll('.admin-notif-tab').forEach(t => t.classList.remove('admin-notif-tab--active'));
        tab.classList.add('admin-notif-tab--active');
        _activeTab = tab.dataset.tab;
        renderPanel(panelEl);
      });
    });

    // Mark all read button
    const markAllBtn = panelEl.querySelector('#admin-notif-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await apiPatch('/notifications/read-all').catch(() => {});
        _notifications = _notifications.map(n => ({ ...n, is_read: true }));
        _unreadCount = 0;
        _lastPolledCount = 0;
        updateBadgeUI(badgeEl, 0);

        const countChip = panelEl.querySelector('#admin-notif-panel-count');
        if (countChip) countChip.textContent = '0 unread';
        const unreadTab = panelEl.querySelector('[data-tab="unread"]');
        if (unreadTab) unreadTab.textContent = 'Unread (0)';

        renderPanel(panelEl);
      });
    }

    // List item click (mark single as read + deep link)
    const listEl = panelEl.querySelector('.admin-notif-list');
    listEl.addEventListener('click', async (e) => {
      const item = e.target.closest('.admin-notif-item');
      if (!item) return;

      const id = item.dataset.id;
      const notif = _notifications.find(n => String(n.id) === String(id));

      if (notif && !notif.is_read) {
        notif.is_read = true;
        _unreadCount = Math.max(0, _unreadCount - 1);
        _lastPolledCount = _unreadCount;
        updateBadgeUI(badgeEl, _unreadCount);
        apiPatch(`/notifications/${id}/read`).catch(() => {});
      }

      closePanel();

      const targetRoute = notif?.data?.route || (notif ? getTypeConfig(notif.type).route : '/');
      if (targetRoute) {
        window.location.hash = targetRoute;
      }
    });

    // Fetch full notification list
    await loadNotifications(panelEl);
  }

  async function loadNotifications(targetPanel = panelEl) {
    try {
      const res = await apiGet('/notifications');
      if (res && res.data) {
        _notifications = res.data;
        _unreadCount = _notifications.filter(n => !n.is_read).length;
        _lastPolledCount = _unreadCount;
        updateBadgeUI(badgeEl, _unreadCount);

        if (targetPanel) {
          const countChip = targetPanel.querySelector('#admin-notif-panel-count');
          if (countChip) countChip.textContent = `${_unreadCount} unread`;
          const unreadTab = targetPanel.querySelector('[data-tab="unread"]');
          if (unreadTab) unreadTab.textContent = `Unread (${_unreadCount})`;
          renderPanel(targetPanel);
        }
      }
    } catch (_) {}
  }

  /* ── Fast Delta Sync Engine ── */
  let _latestId = null;
  let _isSyncing = false;

  const notifChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hireme_notif_bus') : null;
  if (notifChannel) {
    notifChannel.onmessage = (e) => {
      const msg = e.data;
      if (msg?.type === 'SYNC_COUNT') {
        _unreadCount = msg.count;
        updateBadgeUI(badgeEl, msg.count);
      } else if (msg?.type === 'NOTIF_READ') {
        syncNotifications();
      }
    };
  }

  async function syncNotifications() {
    if (_isSyncing) return;
    _isSyncing = true;
    try {
      const url = _latestId !== null
        ? `/notifications/sync?since_id=${_latestId}`
        : '/notifications/sync';

      const res = await apiGet(url);
      if (!res || !res.success) return;

      const freshCount = res.unread_count ?? 0;
      _unreadCount = freshCount;
      updateBadgeUI(badgeEl, freshCount);

      if (_latestId === null) {
        _latestId = res.latest_id ?? 0;
        _lastPolledCount = freshCount;
        return;
      }

      _latestId = Math.max(_latestId, res.latest_id ?? _latestId);

      const newNotifs = Array.isArray(res.new_notifications) ? res.new_notifications : [];
      if (newNotifs.length > 0) {
        newNotifs.forEach(n => showToast(n));
        window.dispatchEvent(new CustomEvent('hireme:notification-received', { detail: newNotifs }));

        const invalidationPatterns = new Set();
        newNotifs.forEach(n => {
          const t = n.type || '';
          if (t.includes('company') || t.includes('moa')) {
            invalidationPatterns.add('/admin/companies');
            invalidationPatterns.add('/admin/dashboard');
            invalidationPatterns.add('/admin/sidebar');
          }
          if (t.includes('student') || t.includes('graduation') || t.includes('alumni')) {
            invalidationPatterns.add('/admin/students');
            invalidationPatterns.add('/admin/dashboard');
            invalidationPatterns.add('/admin/alumni-analytics');
            invalidationPatterns.add('/admin/ojt');
            invalidationPatterns.add('/admin/sidebar');
          }
          if (t.includes('ojt') || t.includes('endorsement') || t.includes('supervisor')) {
            invalidationPatterns.add('/admin/ojt');
            invalidationPatterns.add('/admin/supervisors');
            invalidationPatterns.add('/admin/ojt-analytics');
            invalidationPatterns.add('/admin/dashboard');
            invalidationPatterns.add('/admin/sidebar');
          }
          if (t.includes('job')) {
            invalidationPatterns.add('/admin/jobs');
            invalidationPatterns.add('/admin/dashboard');
          }
          if (t.includes('broadcast') || t.includes('announcement')) {
            invalidationPatterns.add('/admin/dashboard');
            invalidationPatterns.add('/admin/sidebar');
          }
        });

        if (invalidationPatterns.size > 0 && typeof invalidateCache === 'function') {
          invalidateCache(Array.from(invalidationPatterns));
        }

        notifChannel?.postMessage({ type: 'SYNC_COUNT', count: freshCount, latestId: _latestId });
        if (_isPanelOpen && panelEl) {
          loadNotifications(panelEl);
        }
      }
      _lastPolledCount = freshCount;
    } catch (_) {
    } finally {
      _isSyncing = false;
    }
  }

  function scheduleNextPoll(delay = 4000) {
    clearTimeout(_pollTimer);
    _pollTimer = setTimeout(async () => {
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

  // Toggle button click
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPanel();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (_isPanelOpen && panelEl && !panelEl.contains(e.target) && !triggerBtn.contains(e.target)) {
      closePanel();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _isPanelOpen) {
      closePanel();
    }
  });

  // Initial load & adaptive polling
  syncNotifications();
  scheduleNextPoll(4000);
}
