/**
 * CHMSU HireMe — Chat Widget
 * Shared component for student (OJT), graduate, and jobseeker portals.
 * Renders a chat icon in the navbar that opens a sliding panel.
 */
import { icon } from './icons.js';
import { apiGet, apiPost } from '../api/client.js';

const API = 'http://localhost:8000/api';

// ── Tiny relative-time helper ────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── HTML-escape ──────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Avatar helper ────────────────────────────────────────────────────────────
function avatarHtml(name, avatarUrl, size = 36) {
  const initials = (name || '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (avatarUrl) {
    const src = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8000${avatarUrl}`;
    return `<img src="${src}" alt="${esc(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--color-primary-bg-strong);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:${Math.floor(size * 0.38)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

export function initChat(navEl) {
  // ── Badge element (must exist in navbar HTML before calling this) ────────
  const chatBtn   = navEl.querySelector('#chat-btn');
  const badgeEl   = navEl.querySelector('#chat-badge');
  if (!chatBtn) return;

  // ── Build the chat panel (appended to body, not inside nav) ─────────────
  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-panel__inner">
      <!-- Conversation list view -->
      <div id="chat-view-list" class="chat-view">
        <div class="chat-panel__header">
          <span class="chat-panel__title">${icon('messageCircle', 16)} Messages</span>
          <button type="button" class="chat-close-btn" id="chat-close-btn" aria-label="Close" title="Close chat">
            ${icon('x', 16)}
          </button>
        </div>
        <div style="padding:10px 14px 6px;border-bottom:1px solid var(--border-subtle, #f1f5f9);">
          <button type="button" id="chat-coord-shortcut-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 12px;background:var(--color-primary-bg, rgba(0,89,48,0.08));border:1px solid rgba(0,89,48,0.25);border-radius:var(--radius-md, 8px);color:var(--color-primary, #005930);font-size:var(--text-xs, 0.75rem);font-weight:600;cursor:pointer;transition:all 0.15s ease;">
            ${icon('shield', 14)} <span>Chat with OJT Coordinator</span>
          </button>
        </div>
        <div class="chat-panel__body" id="chat-conv-list">
          <div class="chat-empty-state">
            ${icon('messageCircle', 28)}
            <p>No conversations yet</p>
          </div>
        </div>
      </div>

      <!-- Thread view -->
      <div id="chat-view-thread" class="chat-view" style="display:none;">
        <div class="chat-panel__header chat-thread-header">
          <button type="button" class="chat-back-btn" id="chat-back-btn" aria-label="Back">
            ${icon('chevronLeft', 18)}
          </button>
          <div id="chat-thread-title" class="chat-thread-title"></div>
          <button type="button" class="chat-close-btn" id="chat-thread-close-btn" aria-label="Close" title="Close chat">
            ${icon('x', 16)}
          </button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-row">
          <input
            id="chat-input"
            class="chat-input"
            type="text"
            placeholder="Type a message…"
            maxlength="2000"
            autocomplete="off"
          />
          <button type="button" id="chat-send-btn" class="chat-send-btn" aria-label="Send">
            ${icon('send', 18)}
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ── State ────────────────────────────────────────────────────────────────
  let panelOpen       = false;
  let activeKey       = null;
  let pollInterval    = null;
  let lastUnread      = -1;

  const convListEl    = panel.querySelector('#chat-conv-list');
  const messagesEl    = panel.querySelector('#chat-messages');
  const inputEl       = panel.querySelector('#chat-input');
  const sendBtn       = panel.querySelector('#chat-send-btn');
  const backBtn       = panel.querySelector('#chat-back-btn');
  const threadTitle   = panel.querySelector('#chat-thread-title');
  const viewList      = panel.querySelector('#chat-view-list');
  const viewThread    = panel.querySelector('#chat-view-thread');

  // ── Unread badge ─────────────────────────────────────────────────────────
  function setBadge(count) {
    if (count > 0) {
      badgeEl.textContent = count > 99 ? '99+' : count;
      badgeEl.style.display = 'flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  function closeChat() {
    panelOpen = false;
    panel.classList.remove('chat-panel--open');
    stopPolling();
  }

  panel.querySelector('#chat-close-btn')?.addEventListener('click', closeChat);
  panel.querySelector('#chat-thread-close-btn')?.addEventListener('click', closeChat);
  panel.querySelector('#chat-coord-shortcut-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.openCoordinatorChat?.();
  });

  // ── Toggle panel open/close ──────────────────────────────────────────────
  chatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panelOpen = !panelOpen;
    panel.classList.toggle('chat-panel--open', panelOpen);
    if (panelOpen) loadConversations();
    else stopPolling();
  });

  document.addEventListener('click', (e) => {
    if (panelOpen && !panel.contains(e.target) && !chatBtn.contains(e.target)) {
      closeChat();
    }
  });

  // ── Load conversation list ───────────────────────────────────────────────
  async function loadConversations() {
    const data = await apiGet('/chat/conversations', { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;

    const convs = data.data || [];
    if (!convs.length) {
      convListEl.innerHTML = `
        <div class="chat-empty-state">
          ${icon('messageCircle', 28)}
          <p>No conversations yet</p>
        </div>`;
      return;
    }

    convListEl.innerHTML = convs.map(c => `
      <button type="button" class="chat-conv-item" data-key="${esc(c.key)}">
        <div class="chat-conv-avatar">
          ${avatarHtml(c.other_user?.name || '?', c.other_user?.avatar)}
          ${c.unread > 0 ? `<span class="chat-conv-unread-dot"></span>` : ''}
        </div>
        <div class="chat-conv-info">
          <div class="chat-conv-name">${esc(c.other_user?.name || 'Unknown')}</div>
          <div class="chat-conv-label">${esc(c.label)}</div>
          <div class="chat-conv-preview">${esc(c.last_message || '')}</div>
        </div>
        <div class="chat-conv-meta">
          <span class="chat-conv-time">${relativeTime(c.last_at)}</span>
          ${c.unread > 0 ? `<span class="chat-conv-badge">${c.unread}</span>` : ''}
        </div>
      </button>
    `).join('');

    convListEl.querySelectorAll('.chat-conv-item').forEach(btn => {
      btn.addEventListener('click', () => openThread(btn.dataset.key));
    });
  }

  // ── Open a thread ────────────────────────────────────────────────────────
  async function openThread(key) {
    activeKey = key;
    viewList.style.display  = 'none';
    viewThread.style.display = 'flex';
    messagesEl.innerHTML = `<div class="chat-loading">${icon('loader', 20)} Loading…</div>`;
    inputEl.focus();
    await loadMessages();
    startPolling();
  }

  // ── Back to list ─────────────────────────────────────────────────────────
  backBtn.addEventListener('click', () => {
    stopPolling();
    activeKey = null;
    viewThread.style.display = 'none';
    viewList.style.display   = 'flex';
    loadConversations();
  });

  // ── Load messages in active thread ───────────────────────────────────────
  async function loadMessages() {
    if (!activeKey) return;
    const data = await apiGet(`/chat/${encodeURIComponent(activeKey)}/messages`, { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;

    // Update thread header
    if (data.other) {
      threadTitle.innerHTML = `
        ${avatarHtml(data.other.name, data.other.avatar, 30)}
        <div>
          <div class="chat-thread-name">${esc(data.other.name)}</div>
          <div class="chat-thread-label">${esc(data.label)}</div>
        </div>`;
    }

    const msgs = data.data || [];
    if (!msgs.length) {
      messagesEl.innerHTML = `<div class="chat-empty-state chat-empty-state--sm">${icon('messageCircle', 22)}<p>Start the conversation!</p></div>`;
      return;
    }

    const wasAtBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 60;

    messagesEl.innerHTML = msgs.map(m => `
      <div class="chat-msg ${m.is_mine ? 'chat-msg--mine' : 'chat-msg--theirs'}">
        ${!m.is_mine ? `<div class="chat-msg-avatar">${avatarHtml(m.sender?.name, m.sender?.avatar, 26)}</div>` : ''}
        <div class="chat-msg-bubble">
          <div class="chat-msg-text">${esc(m.message)}</div>
          <div class="chat-msg-time">${relativeTime(m.created_at)}</div>
        </div>
      </div>
    `).join('');

    if (wasAtBottom || msgs[msgs.length - 1].is_mine) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Refresh the global unread badge
    pollUnreadCount();
  }

  // ── Send a message ───────────────────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !activeKey) return;
    inputEl.value = '';
    sendBtn.disabled = true;
    try {
      await apiPost(`/chat/${encodeURIComponent(activeKey)}/messages`, { message: text });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      sendBtn.disabled = false;
    }
    await loadMessages();
  }

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage();
    }
  });

  // ── Polling (every 5 s while thread is open) ─────────────────────────────
  function startPolling() {
    stopPolling();
    pollInterval = setInterval(loadMessages, 5000);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  // ── Background unread-count polling (every 30 s) ─────────────────────────
  async function pollUnreadCount() {
    const data = await apiGet('/chat/unread-count', { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;
    const count = data.count ?? 0;
    if (lastUnread >= 0 && count !== lastUnread) setBadge(count);
    lastUnread = count;
    setBadge(count);
  }

  // Initial silent badge load
  pollUnreadCount();
  setInterval(pollUnreadCount, 30_000);

  // ── Public API: open a specific conversation by key directly ─────────────
  // Usage: window.openChat('ojt_interest_42')
  window.openChat = (key) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    openThread(key);
  };

  // Usage: window.openCoordinatorChat()
  window.openCoordinatorChat = async () => {
    try {
      const res = await apiGet('/chat/init/coordinator/0', { bypassCache: true, forceRefresh: true });
      if (res?.key && window.openChat) {
        window.openChat(res.key);
      }
    } catch (err) {
      console.error('Failed to open coordinator chat:', err);
    }
  };
}
