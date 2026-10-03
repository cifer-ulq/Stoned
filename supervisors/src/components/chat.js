/**
 * CHMSU HireMe — Supervisor Chat Widget
 * Enables OJT Coordinators / Supervisors to message students and trainees.
 * Renders a chat icon in the navbar that opens a sliding panel.
 */
import { icon } from './icons.js';
import { apiGet, apiPost } from '../api/client.js';

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
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--color-primary-bg, rgba(0,89,48,0.1));color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-size:${Math.floor(size * 0.38)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

export function initChat(navEl) {
  const chatBtn = navEl.querySelector('#chat-btn');
  const badgeEl = navEl.querySelector('#chat-badge');
  if (!chatBtn) return;

  // Build the chat panel (appended to body, not inside nav)
  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-panel__inner">
      <!-- Conversation list view -->
      <div id="chat-view-list" class="chat-view">
        <div class="chat-panel__header" style="justify-content:space-between;">
          <span class="chat-panel__title">${icon('messageCircle', 16)} Communications</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="btn btn--sm btn--outline" id="chat-new-company-btn" title="Message a Partner Company" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:4px;border-radius:6px;cursor:pointer;">
              ${icon('briefcase', 12)} + Company
            </button>
            <button type="button" class="chat-close-btn" id="chat-close-btn" aria-label="Close" title="Close chat">
              ${icon('x', 16)}
            </button>
          </div>
        </div>
        <div class="chat-filter-bar" id="chat-filter-bar" style="display:flex;gap:6px;padding:8px 14px;background:var(--color-surface, #fff);border-bottom:1px solid var(--border-default, #e2e8f0);">
          <button type="button" class="chat-tab-btn chat-tab-btn--active" data-filter="all" style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;border:none;cursor:pointer;background:var(--color-primary, #005930);color:#fff;">All</button>
          <button type="button" class="chat-tab-btn" data-filter="company" style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;border:none;cursor:pointer;background:var(--color-surface, #f1f5f9);color:var(--text-secondary, #64748b);">Companies</button>
          <button type="button" class="chat-tab-btn" data-filter="student" style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;border:none;cursor:pointer;background:var(--color-surface, #f1f5f9);color:var(--text-secondary, #64748b);">Trainees</button>
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
            placeholder="Type a message to student…"
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

  // State
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

  // Unread badge
  function setBadge(count) {
    if (badgeEl) {
      if (count > 0) {
        badgeEl.textContent = count > 99 ? '99+' : count;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }
  }

  function closeChat() {
    panelOpen = false;
    panel.classList.remove('chat-panel--open');
    stopPolling();
  }

  panel.querySelector('#chat-close-btn')?.addEventListener('click', closeChat);
  panel.querySelector('#chat-thread-close-btn')?.addEventListener('click', closeChat);

  // Toggle panel open/close
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

  // Filter bar tabs
  let activeFilter = 'all';
  let cachedConvs  = [];

  panel.querySelectorAll('.chat-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      panel.querySelectorAll('.chat-tab-btn').forEach(b => {
        const isActive = b.dataset.filter === activeFilter;
        b.classList.toggle('chat-tab-btn--active', isActive);
        b.style.background = isActive ? 'var(--color-primary, #005930)' : 'var(--color-surface, #f1f5f9)';
        b.style.color = isActive ? '#fff' : 'var(--text-secondary, #64748b)';
      });
      renderConversationList();
    });
  });

  // Render conversations with filtering & badges
  function renderConversationList() {
    const filtered = cachedConvs.filter(c => {
      if (activeFilter === 'company') return c.key && c.key.startsWith('coord_company_');
      if (activeFilter === 'student') return c.key && !c.key.startsWith('coord_company_');
      return true;
    });

    if (!filtered.length) {
      const msg = activeFilter === 'company'
        ? 'No company conversations yet'
        : (activeFilter === 'student' ? 'No trainee conversations yet' : 'No conversations yet');
      convListEl.innerHTML = `
        <div class="chat-empty-state">
          ${icon('messageCircle', 28)}
          <p>${msg}</p>
        </div>`;
      return;
    }

    convListEl.innerHTML = filtered.map(c => {
      const isCo = c.key && c.key.startsWith('coord_company_');
      const roleBadge = isCo
        ? `<span style="font-size:10px;font-weight:700;color:var(--color-primary, #005930);background:rgba(0,89,48,0.1);padding:1px 6px;border-radius:4px;flex-shrink:0;">Company</span>`
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

  // Load conversation list
  async function loadConversations() {
    const data = await apiGet('/chat/conversations', { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;
    cachedConvs = data.data || [];
    renderConversationList();
  }

  // Open a thread
  async function openThread(key) {
    activeKey = key;
    viewList.style.display   = 'none';
    viewThread.style.display = 'flex';
    messagesEl.innerHTML = `<div class="chat-loading">${icon('loader', 20)} Loading…</div>`;
    inputEl.placeholder = key.startsWith('coord_company_') ? 'Type a message to company…' : 'Type a message to student…';
    inputEl.focus();
    await loadMessages();
    startPolling();
  }

  // Back to list
  backBtn.addEventListener('click', () => {
    stopPolling();
    activeKey = null;
    viewThread.style.display = 'none';
    viewList.style.display   = 'flex';
    loadConversations();
  });

  // Load messages in active thread
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

    pollUnreadCount();
  }

  // Send a message
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

  // Polling (every 5 s while thread is open)
  function startPolling() {
    stopPolling();
    pollInterval = setInterval(loadMessages, 5000);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  // Background unread-count polling (every 30 s)
  async function pollUnreadCount() {
    const data = await apiGet('/chat/unread-count', { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;
    const count = data.count ?? 0;
    if (lastUnread >= 0 && count !== lastUnread) setBadge(count);
    lastUnread = count;
    setBadge(count);
  }

  pollUnreadCount();
  setInterval(pollUnreadCount, 30_000);

  // Company picker modal
  async function openCompanyPicker() {
    const res = await apiGet('/chat/companies', { bypassCache: true, forceRefresh: true }).catch(() => null);
    const companies = res?.data || [];
    const modalId = 'chat-company-picker-modal';
    document.getElementById(modalId)?.remove();

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.zIndex = '9999';
    m.innerHTML = `
      <div class="modal" style="max-width:440px;width:92%;border-radius:12px;background:var(--color-surface, #fff);box-shadow:var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));padding:20px;display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:8px;">
            ${icon('briefcase', 18)} Message a Partner Company
          </h3>
          <button type="button" id="picker-close" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);">${icon('x', 18)}</button>
        </div>
        <p style="margin:0;font-size:0.8rem;color:var(--text-secondary);">Select a registered partner company to start or resume a direct coordination thread.</p>
        <input type="text" id="picker-search" placeholder="Search company by name or industry…" style="width:100%;padding:8px 12px;font-size:0.82rem;border:1px solid var(--border-default, #e2e8f0);border-radius:8px;outline:none;" />
        <div id="picker-list" style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
          ${companies.length ? companies.map(c => `
            <button type="button" class="btn-picker-co" data-id="${c.id}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--border-default, #e2e8f0);border-radius:8px;background:var(--bg-surface, #fff);cursor:pointer;text-align:left;transition:all 0.15s ease;">
              <div style="display:flex;align-items:center;gap:10px;">
                ${avatarHtml(c.name, c.avatar, 32)}
                <div>
                  <div style="font-weight:600;font-size:0.85rem;color:var(--text-primary);">${esc(c.name)}</div>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">${esc(c.industry)} ${c.location ? '· ' + esc(c.location) : ''}</div>
                </div>
              </div>
              <span style="color:var(--color-primary, #005930);font-size:0.75rem;font-weight:600;">Message &rarr;</span>
            </button>
          `).join('') : '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:0.82rem;">No partner companies found.</div>'}
        </div>
      </div>
    `;
    document.body.appendChild(m);

    m.querySelector('#picker-close').addEventListener('click', () => m.remove());
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });

    const searchInput = m.querySelector('#picker-search');
    searchInput.focus();
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      m.querySelectorAll('.btn-picker-co').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        btn.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    m.querySelectorAll('.btn-picker-co').forEach(btn => {
      btn.addEventListener('click', () => {
        const coId = parseInt(btn.dataset.id, 10);
        m.remove();
        window.openCompanyChat(coId);
      });
    });
  }

  panel.querySelector('#chat-new-company-btn')?.addEventListener('click', () => {
    openCompanyPicker();
  });

  // Public API: open a specific conversation by key directly
  window.openChat = (key) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    openThread(key);
  };

  // Public API: open chat with a company directly
  window.openCompanyChat = async (companyUserId) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    try {
      const res = await apiGet(`/chat/init/company/${companyUserId}`, { bypassCache: true, forceRefresh: true });
      if (res?.key) {
        openThread(res.key);
      }
    } catch (err) {
      console.error('Failed to open company chat:', err);
    }
  };
}
