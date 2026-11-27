/* ── Notification System — CIER Portal ── */
import { icon, renderIcons } from './icons.js';
import { apiGet, apiPatch, apiDelete, invalidateCache } from '../api/client.js';

let _unreadCount = 0;
let _notifications = [];
let _activeTab = 'all';
let _isPanelOpen = false;
let _pollTimer = null;
let _lastPolledCount = -1;

const TYPE_CONFIG = {
  company_registered:          { icon: 'briefcase',      color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)',  route: '/' },
  company_emergency_suspended: { icon: 'alert-triangle', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)',  route: '/' },
  moa_submitted:               { icon: 'file-text',      color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)',  route: '/' },
  moa_request:                 { icon: 'file-text',      color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)',  route: '/' },
  moa_expiring:                { icon: 'alert-triangle', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)',  route: '/' },
  moa_admin_renewal_alert:     { icon: 'alert-triangle', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)',  route: '/' },
  moa_approved:                { icon: 'check-circle',   color: '#059669', bg: 'rgba(5, 150, 105, 0.12)',  route: '/' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { icon: 'bell', color: '#005930', bg: 'rgba(0, 89, 48, 0.12)', route: '/' };
}

function normalizeCierRoute(rawRoute) {
  const clean = String(rawRoute || '/').replace(/^#\/?/, '').replace(/^\/+/, '').trim();
  if (clean === 'settings') return '/settings';
  return '/';
}

function injectStyles() {
  if (document.getElementById('admin-notif-styles')) return;
  const style = document.createElement('style');
  style.id = 'admin-notif-styles';
  style.textContent = `
    .navbar__notif-wrapper { position: relative; display: inline-flex; align-items: center; }
    .admin-notif-badge {
      position: absolute; top: 2px; right: 2px; min-width: 17px; height: 17px;
      background: #EF4444; color: #ffffff; font-size: 0.65rem; font-weight: 700;
      border-radius: 9px; display: inline-flex; align-items: center; justify-content: center;
      padding: 0 4px; line-height: 1; pointer-events: none; box-shadow: 0 0 0 2px var(--bg-elevated, #fff);
    }
    .admin-notif-panel {
      position: absolute; top: calc(100% + 10px); right: 0; width: 390px; max-width: calc(100vw - 32px);
      max-height: 520px; background: var(--bg-elevated, #ffffff); border: 1px solid var(--border-default, #e2e8f0);
      border-radius: 14px; box-shadow: 0 16px 38px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08);
      z-index: 1000; display: flex; flex-direction: column; overflow: hidden;
    }
    .admin-notif-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; border-bottom: 1px solid var(--border-default, #e2e8f0); }
    .admin-notif-header__title { font-size: 0.925rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
    .admin-notif-btn-link { font-size: 0.75rem; font-weight: 600; color: var(--color-primary, #005930); background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 6px; }
    .admin-notif-tabs { display: flex; padding: 0 18px; border-bottom: 1px solid var(--border-default, #e2e8f0); gap: 16px; }
    .admin-notif-tab { font-size: 0.775rem; font-weight: 600; color: var(--text-tertiary); background: none; border: none; border-bottom: 2px solid transparent; padding: 9px 2px; cursor: pointer; }
    .admin-notif-tab--active { color: var(--color-primary, #005930); border-bottom-color: var(--color-primary, #005930); }
    .admin-notif-list { flex: 1; overflow-y: auto; max-height: 380px; }
    .admin-notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 13px 18px; border-bottom: 1px solid var(--border-subtle, #f1f5f9); cursor: pointer; }
    .admin-notif-item--unread { background: rgba(0, 89, 48, 0.04); }
    .admin-notif-item__icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .admin-notif-item__body { flex: 1; min-width: 0; }
    .admin-notif-item__title { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .admin-notif-item__msg { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45; }
    .admin-notif-item__meta { font-size: 0.6875rem; color: var(--text-tertiary); margin-top: 5px; }
    .admin-notif-item__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary, #005930); flex-shrink: 0; margin-top: 6px; }
    .admin-notif-empty { padding: 48px 24px; text-align: center; }
    .admin-notif-empty__text { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .admin-notif-empty__sub { font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px; }
    #admin-toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 360px; pointer-events: none; }
    .admin-toast { background: var(--bg-elevated, #ffffff); border: 1px solid var(--border-default, #e2e8f0); border-radius: 12px; padding: 14px 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.14); display: flex; align-items: flex-start; gap: 12px; pointer-events: auto; opacity: 0; transform: translateX(30px); transition: all 0.25s ease; }
    .admin-toast--visible { opacity: 1; transform: translateX(0); }
    .admin-toast__icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .admin-toast__title { font-size: 0.825rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
    .admin-toast__msg { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; }
    .admin-toast__close { background: none; border: none; color: var(--text-tertiary); cursor: pointer; }
  `;
  document.head.appendChild(style);
}

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
    <div class="admin-toast__icon" style="background:${c.bg};color:${c.color};">${icon(c.icon, 17)}</div>
    <div style="flex:1;">
      <div class="admin-toast__title">${notification.title}</div>
      <div class="admin-toast__msg">${notification.message}</div>
    </div>
    <button class="admin-toast__close" title="Dismiss">${icon('x', 14)}</button>
  `;
  toast.querySelector('.admin-toast__close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  renderIcons();
  requestAnimationFrame(() => toast.classList.add('admin-toast--visible'));
  setTimeout(() => toast.remove(), 5500);
}

function renderPanel(panel) {
  if (!panel) return;
  const listEl = panel.querySelector('.admin-notif-list');
  const items = _activeTab === 'unread' ? _notifications.filter(n => !n.is_read) : _notifications;
  if (!items.length) {
    listEl.innerHTML = `
      <div class="admin-notif-empty">
        <div class="admin-notif-empty__text">${_activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}</div>
        <div class="admin-notif-empty__sub">${_activeTab === 'unread' ? 'You have no unread CIER notifications.' : 'New company registrations and MOA requests will appear here.'}</div>
      </div>
    `;
    renderIcons();
    return;
  }

  listEl.innerHTML = items.map(n => {
    const c = getTypeConfig(n.type);
    return `
      <div class="admin-notif-item ${!n.is_read ? 'admin-notif-item--unread' : ''}" data-id="${n.id}">
        <div class="admin-notif-item__icon" style="background:${c.bg};color:${c.color};">${icon(c.icon, 16)}</div>
        <div class="admin-notif-item__body">
          <div class="admin-notif-item__title">${n.title}</div>
          <div class="admin-notif-item__msg">${n.message}</div>
          <div class="admin-notif-item__meta">${n.created_at || 'Just now'}</div>
        </div>
        ${!n.is_read ? '<span class="admin-notif-item__dot"></span>' : ''}
      </div>
    `;
  }).join('');
  renderIcons();
}

export function initNotifications(triggerBtn) {
  if (!triggerBtn) return;
  injectStyles();

  const wrapper = triggerBtn.closest('.navbar__notif-wrapper') || triggerBtn.parentElement;
  let badgeEl = triggerBtn.querySelector('.admin-notif-badge');
  if (!badgeEl) {
    badgeEl = document.createElement('span');
    badgeEl.className = 'admin-notif-badge';
    badgeEl.style.display = 'none';
    triggerBtn.appendChild(badgeEl);
  }

  let panelEl = null;

  function updateBadgeUI(count) {
    if (count > 0) {
      badgeEl.textContent = count > 99 ? '99+' : String(count);
      badgeEl.style.display = 'inline-flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  function closePanel() {
    if (panelEl) { panelEl.remove(); panelEl = null; }
    _isPanelOpen = false;
  }

  async function openPanel() {
    if (_isPanelOpen) { closePanel(); return; }
    _isPanelOpen = true;
    panelEl = document.createElement('div');
    panelEl.className = 'admin-notif-panel';
    panelEl.innerHTML = `
      <div class="admin-notif-header">
        <div class="admin-notif-header__title">
          Notifications
          <span class="badge badge--primary" id="admin-notif-panel-count" style="font-size:0.6875rem;padding:2px 6px;">${_unreadCount} unread</span>
        </div>
        <button class="admin-notif-btn-link" id="admin-notif-mark-all">Mark all read</button>
      </div>
      <div class="admin-notif-tabs">
        <button class="admin-notif-tab ${_activeTab === 'all' ? 'admin-notif-tab--active' : ''}" data-tab="all">All</button>
        <button class="admin-notif-tab ${_activeTab === 'unread' ? 'admin-notif-tab--active' : ''}" data-tab="unread">Unread (${_unreadCount})</button>
      </div>
      <div class="admin-notif-list"><div class="admin-notif-empty"><div class="admin-notif-empty__text">Loading notifications…</div></div></div>
    `;
    wrapper.appendChild(panelEl);

    panelEl.querySelectorAll('.admin-notif-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        _activeTab = tab.dataset.tab;
        panelEl.querySelectorAll('.admin-notif-tab').forEach(t => t.classList.remove('admin-notif-tab--active'));
        tab.classList.add('admin-notif-tab--active');
        renderPanel(panelEl);
      });
    });

    panelEl.querySelector('#admin-notif-mark-all')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      _notifications.forEach(n => { n.is_read = true; });
      _unreadCount = 0;
      _lastPolledCount = 0;
      updateBadgeUI(0);
      await apiPatch('/notifications/read-all').catch(() => {});
      renderPanel(panelEl);
    });

    panelEl.querySelector('.admin-notif-list').addEventListener('click', async (e) => {
      const item = e.target.closest('.admin-notif-item');
      if (!item) return;
      const id = item.dataset.id;
      const notif = _notifications.find(n => String(n.id) === String(id));
      if (notif && !notif.is_read) {
        notif.is_read = true;
        _unreadCount = Math.max(0, _unreadCount - 1);
        updateBadgeUI(_unreadCount);
        apiPatch(`/notifications/${id}/read`).catch(() => {});
      }
      closePanel();
      window.location.hash = normalizeCierRoute(notif?.data?.route || '/');
    });

    await loadNotifications(panelEl);
  }

  async function loadNotifications(targetPanel = panelEl) {
    try {
      const res = await apiGet('/notifications');
      if (res && res.data) {
        _notifications = res.data;
        _unreadCount = _notifications.filter(n => !n.is_read).length;
        _lastPolledCount = _unreadCount;
        updateBadgeUI(_unreadCount);
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

  let _latestId = null;
  let _isSyncing = false;

  async function syncNotifications() {
    if (_isSyncing) return;
    _isSyncing = true;
    try {
      const url = _latestId !== null ? `/notifications/sync?since_id=${_latestId}` : '/notifications/sync';
      const res = await apiGet(url);
      if (!res || !res.success) return;
      const freshCount = res.unread_count ?? 0;
      _unreadCount = freshCount;
      updateBadgeUI(freshCount);

      if (_latestId === null) {
        _latestId = res.latest_id ?? 0;
        _lastPolledCount = freshCount;
        return;
      }

      _latestId = Math.max(_latestId, res.latest_id ?? _latestId);
      const newNotifs = Array.isArray(res.new_notifications) ? res.new_notifications : [];
      if (newNotifs.length > 0) {
        newNotifs.forEach(n => showToast(n));
        invalidateCache(['/cier/companies', '/cier/sidebar']);
        if (_isPanelOpen && panelEl) loadNotifications(panelEl);
      }
      _lastPolledCount = freshCount;
    } catch (_) {} finally {
      _isSyncing = false;
    }
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPanel();
  });

  document.addEventListener('click', (e) => {
    if (_isPanelOpen && panelEl && !panelEl.contains(e.target) && !triggerBtn.contains(e.target)) {
      closePanel();
    }
  });

  syncNotifications();
  if (_pollTimer) clearTimeout(_pollTimer);
  const loop = () => {
    _pollTimer = setTimeout(async () => {
      if (!document.hidden) await syncNotifications();
      loop();
    }, document.hidden ? 25000 : 8000);
  };
  loop();
}
