/**
 * CHMSU HireMe — Chat Widget (Company Portal)
 * Renders a chat icon in the navbar and opens a sliding panel.
 * Company sees all conversations from applicants/OJT students.
 */
import { icon } from './icons.js';
import { apiGet, apiPost } from '../api/client.js';

// ── Tiny relative-time helper ─────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function avatarHtml(name, avatarUrl, size = 36) {
  const initials = (name || '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (avatarUrl) {
    const src = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8000${avatarUrl}`;
    return `<img src="${src}" alt="${esc(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--color-primary-bg-strong);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:${Math.floor(size * 0.38)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

export function initChat(navEl) {
  const chatBtn = navEl.querySelector('#chat-btn');
  const badgeEl = navEl.querySelector('#chat-badge');
  if (!chatBtn) return;

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-panel__inner">
      <!-- Conversation list view -->
      <div id="chat-view-list" class="chat-view">
        <div class="chat-panel__header" style="justify-content:space-between;">
          <span class="chat-panel__title">${icon('messageCircle', 16)} Messages</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="btn btn--sm btn--outline" id="chat-quick-coord-btn" title="Message OJT Coordinator" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:4px;border-radius:6px;cursor:pointer;">
              ${icon('award', 12)} Coordinator
            </button>
            <button type="button" class="chat-close-btn" id="chat-close-btn" aria-label="Close" title="Close chat">
              ${icon('x', 16)}
            </button>
          </div>
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

  let panelOpen    = false;
  let activeKey    = null;
  let pollInterval = null;
  let lastUnread   = -1;

  const convListEl  = panel.querySelector('#chat-conv-list');
  const messagesEl  = panel.querySelector('#chat-messages');
  const inputEl     = panel.querySelector('#chat-input');
  const sendBtn     = panel.querySelector('#chat-send-btn');
  const backBtn     = panel.querySelector('#chat-back-btn');
  const threadTitle = panel.querySelector('#chat-thread-title');
  const viewList    = panel.querySelector('#chat-view-list');
  const viewThread  = panel.querySelector('#chat-view-thread');

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

    convListEl.innerHTML = convs.map(c => {
      const isCoord = c.key && c.key.startsWith('coord_company_');
      const roleBadge = isCoord
        ? `<span style="font-size:10px;font-weight:700;color:var(--color-primary, #005930);background:rgba(0,89,48,0.1);padding:1px 6px;border-radius:4px;flex-shrink:0;">Coordinator</span>`
        : `<span style="font-size:10px;font-weight:600;color:var(--text-secondary);background:var(--bg-muted, #f1f5f9);padding:1px 5px;border-radius:4px;flex-shrink:0;">Trainee</span>`;

      return `
      <button type="button" class="chat-conv-item" data-key="${esc(c.key)}">
        <div class="chat-conv-avatar">
          ${avatarHtml(c.other_user?.name || '?', c.other_user?.avatar)}
          ${c.unread > 0 ? `<span class="chat-conv-unread-dot"></span>` : ''}
        </div>
        <div class="chat-conv-info">
          <div class="chat-conv-name" style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(c.other_user?.name || 'Unknown')}</span>
            ${roleBadge}
          </div>
          <div class="chat-conv-label">${esc(c.label)}</div>
          <div class="chat-conv-preview">${esc(c.last_message || '')}</div>
        </div>
        <div class="chat-conv-meta">
          <span class="chat-conv-time">${relativeTime(c.last_at)}</span>
          ${c.unread > 0 ? `<span class="chat-conv-badge">${c.unread}</span>` : ''}
        </div>
      </button>`;
    }).join('');

    convListEl.querySelectorAll('.chat-conv-item').forEach(btn => {
      btn.addEventListener('click', () => openThread(btn.dataset.key));
    });
  }

  async function openThread(key) {
    activeKey = key;
    viewList.style.display   = 'none';
    viewThread.style.display = 'flex';
    messagesEl.innerHTML = `<div class="chat-loading">${icon('loader', 20)} Loading…</div>`;
    inputEl.focus();
    await loadMessages();
    startPolling();
  }

  backBtn.addEventListener('click', () => {
    stopPolling();
    activeKey = null;
    viewThread.style.display = 'none';
    viewList.style.display   = 'flex';
    loadConversations();
  });

  async function loadMessages() {
    if (!activeKey) return;
    const data = await apiGet(`/chat/${encodeURIComponent(activeKey)}/messages`, { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;

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
      messagesEl.innerHTML = `<div class="chat-empty-state chat-empty-state--sm">${icon('messageCircle', 22)}<p>No messages yet</p></div>`;
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
    pollUnreadCount();
  }

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

  function startPolling() {
    stopPolling();
    pollInterval = setInterval(loadMessages, 5000);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  async function pollUnreadCount() {
    const data = await apiGet('/chat/unread-count', { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;
    const count = data.count ?? 0;
    lastUnread = count;
    setBadge(count);
  }

  pollUnreadCount();
  setInterval(pollUnreadCount, 30_000);

  panel.querySelector('#chat-quick-coord-btn')?.addEventListener('click', () => {
    window.openCoordinatorChat && window.openCoordinatorChat(0);
  });

  // Public API: window.openChat('ojt_interest_42')
  window.openChat = (key) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    openThread(key);
  };

  // Public API: window.openCoordinatorChat(supervisorId = 0)
  window.openCoordinatorChat = async (supervisorId = 0) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    try {
      const res = await apiGet(`/chat/init/coordinator/${supervisorId || 0}`, { bypassCache: true, forceRefresh: true });
      if (res?.key) {
        openThread(res.key);
      }
    } catch (err) {
      console.error('Failed to open coordinator chat:', err);
    }
  };
}
