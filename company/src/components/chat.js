/**
 * CHMSU HireMe — Chat Widget & Coordinator Contact/Selector Modal (Company Portal)
 * Renders a chat icon in the navbar, opens a sliding conversation panel,
 * and provides a full Coordinator Directory & Contact Selector so companies
 * can view coordinator contact information and choose which coordinator to message.
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
    return `<img src="${src}" alt="${esc(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--color-primary-bg-strong, rgba(0,89,48,0.15));color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-size:${Math.floor(size * 0.38)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
}

function shortCourseCode(courseStr) {
  if (!courseStr) return 'OJT';
  const s = String(courseStr).toLowerCase();
  if (s.includes('information technology')) return 'BSIT';
  if (s.includes('information systems')) return 'BSIS';
  if (s.includes('computer science')) return 'BSCS';
  if (s.includes('computer engineering')) return 'BSCpE';
  if (s.includes('industrial technology')) return 'BSIndTech';
  if (s.includes('entertainment and multimedia')) return 'BSEMC';
  if (s.includes('business administration')) return 'BSBA';
  if (s.includes('accountancy')) return 'BSA';
  if (s.includes('hospitality management')) return 'BSHM';
  if (s.includes('tourism management')) return 'BSTM';
  if (s.includes('criminology')) return 'BSCrim';
  if (s.includes('nursing')) return 'BSN';
  if (s.includes('civil engineering')) return 'BSCE';
  if (s.includes('mechanical engineering')) return 'BSME';
  if (s.includes('electrical engineering')) return 'BSEE';
  if (s.includes('electronics engineering')) return 'BSECE';
  if (s.includes('psychology')) return 'BS Psych';
  if (s.includes('secondary education')) return 'BSED';
  if (s.includes('elementary education')) return 'BEED';
  return courseStr.length > 22 ? courseStr.slice(0, 20) + '…' : courseStr;
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
            <button type="button" class="btn btn--sm btn--outline" id="chat-quick-coord-btn" title="Choose OJT Coordinator & View Contact Info" style="font-size:11px;padding:3px 9px;display:inline-flex;align-items:center;gap:4px;border-radius:6px;cursor:pointer;color:var(--color-primary, #005930);border-color:rgba(0,89,48,0.3);background:rgba(0,89,48,0.06);font-weight:700;">
              ${icon('users', 12)} Coordinators
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
        <div class="chat-panel__header chat-thread-header" style="flex-wrap:wrap;gap:6px;">
          <div style="display:flex;align-items:center;gap:8px;width:100%;">
            <button type="button" class="chat-back-btn" id="chat-back-btn" aria-label="Back">
              ${icon('chevronLeft', 18)}
            </button>
            <div id="chat-thread-title" class="chat-thread-title" style="flex:1;min-width:0;"></div>
            <button type="button" class="chat-close-btn" id="chat-thread-close-btn" aria-label="Close" title="Close chat">
              ${icon('x', 16)}
            </button>
          </div>
          <!-- Coordinator contact strip inside thread header when chatting with a coordinator -->
          <div id="chat-thread-coord-info" style="display:none;width:100%;"></div>
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

  const convListEl      = panel.querySelector('#chat-conv-list');
  const messagesEl      = panel.querySelector('#chat-messages');
  const inputEl         = panel.querySelector('#chat-input');
  const sendBtn         = panel.querySelector('#chat-send-btn');
  const backBtn         = panel.querySelector('#chat-back-btn');
  const threadTitle     = panel.querySelector('#chat-thread-title');
  const threadCoordInfo = panel.querySelector('#chat-thread-coord-info');
  const viewList        = panel.querySelector('#chat-view-list');
  const viewThread      = panel.querySelector('#chat-view-thread');

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
    const coordModal = document.getElementById('coord-selector-backdrop');
    if (coordModal && coordModal.contains(e.target)) return;
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
          <button type="button" class="btn btn--sm btn--outline" id="chat-empty-coord-btn" style="margin-top:8px;font-size:11.5px;color:var(--color-primary, #005930);border-color:rgba(0,89,48,0.3);gap:5px;">
            ${icon('users', 13)} Browse & Message OJT Coordinators
          </button>
        </div>`;
      convListEl.querySelector('#chat-empty-coord-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openCoordinatorSelector && window.openCoordinatorSelector();
      });
      return;
    }

    convListEl.innerHTML = convs.map(c => {
      const isCoord = c.key && c.key.startsWith('coord_company_');
      const coordCourse = isCoord && c.other_user?.course ? shortCourseCode(c.other_user.course) : '';
      const roleBadge = isCoord
        ? `<span style="font-size:10px;font-weight:700;color:var(--color-primary, #005930);background:rgba(0,89,48,0.1);padding:1px 6px;border-radius:4px;flex-shrink:0;">Coordinator${coordCourse ? ` · ${esc(coordCourse)}` : ''}</span>`
        : `<span style="font-size:10px;font-weight:600;color:var(--text-secondary);background:var(--bg-muted, #f1f5f9);padding:1px 5px;border-radius:4px;flex-shrink:0;">Trainee</span>`;

      const subLabel = isCoord && c.other_user?.email
        ? `${c.label} · ${c.other_user.email}`
        : c.label;

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
          <div class="chat-conv-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(subLabel)}</div>
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
    if (threadCoordInfo) {
      threadCoordInfo.style.display = 'none';
      threadCoordInfo.innerHTML = '';
    }
    viewThread.style.display = 'none';
    viewList.style.display   = 'flex';
    loadConversations();
  });

  async function loadMessages() {
    if (!activeKey) return;
    const data = await apiGet(`/chat/${encodeURIComponent(activeKey)}/messages`, { bypassCache: true, forceRefresh: true }).catch(() => null);
    if (!data) return;

    const isCoordThread = activeKey.startsWith('coord_company_');

    if (data.other) {
      threadTitle.innerHTML = `
        ${avatarHtml(data.other.name, data.other.avatar, 30)}
        <div style="min-width:0;flex:1;">
          <div class="chat-thread-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(data.other.name)}</div>
          <div class="chat-thread-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${isCoordThread && data.other.course ? esc(data.other.course) : esc(data.label)}
          </div>
        </div>`;

      if (isCoordThread && threadCoordInfo) {
        const email = data.other.email || '';
        const phone = data.other.phone || '';
        const inst  = data.other.company_name || 'CHMSU';
        threadCoordInfo.style.display = 'block';
        threadCoordInfo.innerHTML = `
          <div style="margin-top:4px;padding:7px 10px;background:var(--bg-secondary, #f0f7f4);border:1px solid rgba(0,89,48,0.18);border-radius:8px;font-size:11px;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
              <span style="font-weight:700;color:var(--color-primary, #005930);display:inline-flex;align-items:center;gap:4px;">
                ${icon('shield', 11)} ${esc(inst)} OJT Coordinator
              </span>
              <button type="button" id="chat-thread-switch-coord" style="background:rgba(0,89,48,0.1);color:var(--color-primary, #005930);border:1px solid rgba(0,89,48,0.25);border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:3px;">
                ${icon('users', 10)} Switch Coordinator
              </button>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:var(--text-secondary);">
              ${email ? `
                <a href="mailto:${esc(email)}" style="color:var(--color-primary, #005930);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;" title="Send Email">
                  ${icon('mail', 11)} ${esc(email)}
                </a>` : ''}
              ${phone ? `
                <a href="tel:${esc(phone)}" style="color:var(--text-secondary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;" title="Call Coordinator">
                  ${icon('phone', 11)} ${esc(phone)}
                </a>` : ''}
            </div>
          </div>`;

        threadCoordInfo.querySelector('#chat-thread-switch-coord')?.addEventListener('click', (e) => {
          e.stopPropagation();
          window.openCoordinatorSelector && window.openCoordinatorSelector({
            course: data.other?.course || '',
            activeCoordinatorId: data.other?.id || null,
          });
        });
      } else if (threadCoordInfo) {
        threadCoordInfo.style.display = 'none';
        threadCoordInfo.innerHTML = '';
      }
    }

    const msgs = data.data || [];
    if (!msgs.length) {
      messagesEl.innerHTML = `
        <div class="chat-empty-state chat-empty-state--sm">
          ${icon('messageCircle', 22)}
          <p>No messages yet</p>
          ${isCoordThread && data.other ? `<span style="font-size:11px;color:var(--text-tertiary);max-width:220px;text-align:center;">Send a message to ${esc(data.other.name)} regarding OJT endorsements, interviews, or trainees.</span>` : ''}
        </div>`;
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

  // Clicking "Coordinators" in the chat header opens the Coordinator Directory & Contact Selector
  panel.querySelector('#chat-quick-coord-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.openCoordinatorSelector && window.openCoordinatorSelector();
  });

  // Public API: window.openChat('ojt_interest_42')
  window.openChat = (key) => {
    panelOpen = true;
    panel.classList.add('chat-panel--open');
    openThread(key);
  };

  // Public API: window.openCoordinatorChat(supervisorId = 0, options = {})
  // If supervisorId > 0 and options.forceSelector is not true, opens direct chat with that coordinator.
  // If supervisorId == 0 or not provided, opens the Coordinator Selector & Contact Modal so the company can choose.
  window.openCoordinatorChat = async (supervisorId = 0, options = {}) => {
    const numId = Number(supervisorId) || 0;
    if (!numId || options.forceSelector) {
      window.openCoordinatorSelector(options);
      return;
    }

    panelOpen = true;
    panel.classList.add('chat-panel--open');
    try {
      const res = await apiGet(`/chat/init/coordinator/${numId}`, { bypassCache: true, forceRefresh: true });
      if (res?.key) {
        openThread(res.key);
      }
    } catch (err) {
      console.error('Failed to open coordinator chat:', err);
    }
  };

  // Public API: window.openCoordinatorSelector(options = {})
  // options: { studentName, course, coordinators, endorsedById, activeCoordinatorId }
  window.openCoordinatorSelector = async (options = {}) => {
    const existing = document.getElementById('coord-selector-backdrop');
    if (existing) existing.remove();

    const studentName  = options.studentName || '';
    const studentCourse = options.course && options.course !== '—' ? options.course : '';
    const endorsedById = Number(options.endorsedById) || 0;
    const preloaded    = Array.isArray(options.coordinators) ? options.coordinators : [];

    const backdrop = document.createElement('div');
    backdrop.id = 'coord-selector-backdrop';
    backdrop.className = 'modal-backdrop modal-backdrop--visible';
    backdrop.style.cssText = 'z-index:10020;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);padding:16px;';

    backdrop.innerHTML = `
      <div class="modal modal--visible" style="max-width:600px;width:100%;max-height:88vh;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:var(--bg-elevated, #ffffff);box-shadow:0 24px 60px rgba(0,0,0,0.28);">
        <!-- Header -->
        <div class="modal__header" style="background:linear-gradient(135deg,#005930,#047857);padding:18px 22px;border-bottom:none;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.18);color:#ffffff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('users', 20)}
            </div>
            <div>
              <h3 style="color:#ffffff;font-size:1.02rem;font-weight:800;margin:0;">Select OJT Coordinator & Contact Info</h3>
              <p style="color:rgba(255,255,255,0.88);font-size:0.78rem;margin:3px 0 0;">
                ${studentName
                  ? `Choose which coordinator to message for <strong>${esc(studentName)}</strong>${studentCourse ? ` (${esc(shortCourseCode(studentCourse))})` : ''}`
                  : 'View coordinator contact details by course and start a direct conversation'}
              </p>
            </div>
          </div>
          <button type="button" id="coord-sel-close" style="background:rgba(255,255,255,0.16);border:none;color:#ffffff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">
            ${icon('x', 16)}
          </button>
        </div>

        <!-- Search & Filter Controls -->
        <div style="padding:14px 20px 10px;border-bottom:1px solid var(--border-default, #e2e8f0);background:var(--bg-elevated, #ffffff);display:flex;flex-direction:column;gap:10px;">
          <div style="position:relative;display:flex;align-items:center;">
            <span style="position:absolute;left:12px;color:var(--text-tertiary, #94a3b8);display:flex;align-items:center;pointer-events:none;">
              ${icon('search', 14)}
            </span>
            <input
              type="text"
              id="coord-sel-search"
              class="form-input"
              placeholder="Search by coordinator name, email, or course (e.g. BSIT, BSCS)…"
              style="width:100%;padding:8px 12px 8px 34px;font-size:0.82rem;border-radius:10px;"
            />
          </div>
          <div id="coord-sel-course-tabs" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;"></div>
        </div>

        <!-- Coordinator Cards List -->
        <div id="coord-sel-body" style="padding:16px 20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:12px;background:var(--bg-primary, #f8fafc);">
          <div style="text-align:center;padding:32px 16px;color:var(--text-secondary);">
            ${icon('loader', 22)}
            <p style="font-size:0.84rem;margin:8px 0 0;">Loading OJT Coordinators…</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal__footer" style="padding:12px 20px;background:var(--bg-elevated, #ffffff);border-top:1px solid var(--border-default, #e2e8f0);display:flex;align-items:center;justify-content:space-between;">
          <span id="coord-sel-count" style="font-size:0.76rem;color:var(--text-secondary);font-weight:600;"></span>
          <button type="button" class="btn btn--outline btn--sm" id="coord-sel-cancel" style="border-radius:8px;">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    backdrop.querySelector('#coord-sel-close')?.addEventListener('click', close);
    backdrop.querySelector('#coord-sel-cancel')?.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    const bodyEl   = backdrop.querySelector('#coord-sel-body');
    const tabsEl   = backdrop.querySelector('#coord-sel-course-tabs');
    const searchEl = backdrop.querySelector('#coord-sel-search');
    const countEl  = backdrop.querySelector('#coord-sel-count');

    // Fetch full coordinator directory from backend and merge with any student-specific endorser flags
    let allCoordinators = [];
    try {
      const res = await apiGet('/chat/coordinators', { bypassCache: true, forceRefresh: true });
      if (Array.isArray(res?.data)) {
        allCoordinators = res.data;
      }
    } catch {
      allCoordinators = [];
    }

    if (!allCoordinators.length && preloaded.length) {
      allCoordinators = preloaded;
    }

    // Enrich with student context (is_endorser & student course match)
    const preloadedIds = new Set(preloaded.map(c => Number(c.id)));
    allCoordinators = allCoordinators.map(c => {
      const cid = Number(c.id);
      const fromStudent = preloaded.find(p => Number(p.id) === cid);
      const isEndorser  = (endorsedById && cid === endorsedById) || !!fromStudent?.is_endorser;
      const matchesStudentCourse = studentCourse
        ? (preloadedIds.has(cid) ||
           String(c.course || '').toLowerCase() === studentCourse.toLowerCase() ||
           shortCourseCode(c.course) === shortCourseCode(studentCourse))
        : false;
      return {
        ...c,
        phone: c.phone || fromStudent?.phone || '',
        company_name: c.company_name || fromStudent?.company_name || 'CHMSU',
        is_endorser: isEndorser,
        matches_student_course: matchesStudentCourse,
      };
    });

    // Sort: Endorser first, then student's course coordinators, then alphabetical
    allCoordinators.sort((a, b) => {
      if (a.is_endorser !== b.is_endorser) return a.is_endorser ? -1 : 1;
      if (a.matches_student_course !== b.matches_student_course) return a.matches_student_course ? -1 : 1;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    const studentCourseMatchedCount = allCoordinators.filter(c => c.matches_student_course).length;
    let activeFilter = (studentCourse && studentCourseMatchedCount > 0) ? '__student_course__' : '__all__';
    let searchQuery  = '';

    // Build distinct courses for filter pills
    const distinctCourses = [...new Set(allCoordinators.map(c => c.course).filter(Boolean))];

    function renderFilterTabs() {
      const pills = [];
      if (studentCourse && studentCourseMatchedCount > 0) {
        pills.push({
          key: '__student_course__',
          label: `${shortCourseCode(studentCourse)} Coordinators (${studentCourseMatchedCount})`,
        });
      }
      pills.push({
        key: '__all__',
        label: `All Courses (${allCoordinators.length})`,
      });
      distinctCourses.forEach(crs => {
        if (studentCourse && crs.toLowerCase() === studentCourse.toLowerCase() && studentCourseMatchedCount > 0) {
          return;
        }
        const cnt = allCoordinators.filter(c => c.course === crs).length;
        pills.push({
          key: crs,
          label: `${shortCourseCode(crs)} (${cnt})`,
          title: crs,
        });
      });

      tabsEl.innerHTML = pills.map(p => {
        const active = activeFilter === p.key;
        return `
          <button
            type="button"
            class="coord-filter-pill"
            data-filter="${esc(p.key)}"
            title="${esc(p.title || p.label)}"
            style="padding:5px 12px;border-radius:99px;font-size:0.74rem;font-weight:700;white-space:nowrap;cursor:pointer;transition:all 0.15s;border:1px solid ${active ? '#005930' : 'var(--border-default, #cbd5e1)'};background:${active ? '#005930' : 'var(--bg-secondary, #f1f5f9)'};color:${active ? '#ffffff' : 'var(--text-secondary, #475569)'};"
          >
            ${esc(p.label)}
          </button>`;
      }).join('');

      tabsEl.querySelectorAll('.coord-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.filter;
          renderFilterTabs();
          renderCoordinatorCards();
        });
      });
    }

    function renderCoordinatorCards() {
      const q = searchQuery.trim().toLowerCase();
      const filtered = allCoordinators.filter(c => {
        if (activeFilter === '__student_course__' && !c.matches_student_course) return false;
        if (activeFilter !== '__all__' && activeFilter !== '__student_course__' && c.course !== activeFilter) return false;
        if (!q) return true;
        const hay = `${c.name || ''} ${c.email || ''} ${c.phone || ''} ${c.course || ''} ${shortCourseCode(c.course)} ${c.position || ''}`.toLowerCase();
        return hay.includes(q);
      });

      countEl.textContent = `Showing ${filtered.length} of ${allCoordinators.length} coordinator${allCoordinators.length === 1 ? '' : 's'}`;

      if (!filtered.length) {
        bodyEl.innerHTML = `
          <div style="text-align:center;padding:36px 20px;background:var(--bg-elevated, #ffffff);border:1px dashed var(--border-default, #cbd5e1);border-radius:12px;color:var(--text-secondary);">
            ${icon('users', 28)}
            <p style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin:10px 0 4px;">No matching coordinators found</p>
            <p style="font-size:0.78rem;margin:0 0 12px;">Try clearing your search or switching to "All Courses".</p>
            ${activeFilter !== '__all__' ? `<button type="button" id="coord-sel-show-all" class="btn btn--sm btn--outline" style="font-size:0.76rem;">Show All Coordinators</button>` : ''}
          </div>`;
        bodyEl.querySelector('#coord-sel-show-all')?.addEventListener('click', () => {
          activeFilter = '__all__';
          renderFilterTabs();
          renderCoordinatorCards();
        });
        return;
      }

      bodyEl.innerHTML = filtered.map(c => {
        const courseBadge = shortCourseCode(c.course);
        const isCurrentChat = options.activeCoordinatorId && Number(options.activeCoordinatorId) === Number(c.id);

        return `
          <div style="background:var(--bg-elevated, #ffffff);border:1.5px solid ${c.is_endorser ? '#005930' : 'var(--border-default, #e2e8f0)'};border-radius:14px;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,0.03);display:flex;flex-direction:column;gap:12px;transition:border-color 0.15s;">
            <!-- Top row: Avatar, Name, Badges -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                ${avatarHtml(c.name, c.avatar, 46)}
                <div style="min-width:0;flex:1;">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span style="font-weight:800;font-size:0.95rem;color:var(--text-primary, #0f172a);">${esc(c.name)}</span>
                    ${c.is_endorser ? `
                      <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(0,89,48,0.12);color:#005930;border:1px solid rgba(0,89,48,0.3);font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:99px;">
                        ${icon('checkCircle', 11)} Endorsing Coordinator
                      </span>` : ''}
                    ${!c.is_endorser && c.matches_student_course && studentCourse ? `
                      <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.1);color:#047857;font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:99px;">
                        Course Match
                      </span>` : ''}
                  </div>
                  <div style="font-size:0.78rem;color:var(--color-primary, #005930);font-weight:600;margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                    ${icon('graduationCap', 13)}
                    <span>${esc(c.course || 'OJT Coordinator')}</span>
                  </div>
                </div>
              </div>
              <span style="background:rgba(0,89,48,0.08);color:#005930;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:99px;border:1px solid rgba(0,89,48,0.2);flex-shrink:0;">
                ${esc(courseBadge)}
              </span>
            </div>

            <!-- Contact Info Grid -->
            <div style="background:var(--bg-secondary, #f8fafc);border:1px solid var(--border-default, #e2e8f0);border-radius:10px;padding:10px 14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:8px 14px;font-size:0.77rem;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                  <span style="color:var(--color-primary, #005930);display:flex;flex-shrink:0;">${icon('mail', 13)}</span>
                  <div style="min-width:0;">
                    <span style="display:block;font-size:0.65rem;text-transform:uppercase;color:var(--text-tertiary, #94a3b8);font-weight:700;">Official Email</span>
                    <a href="mailto:${esc(c.email)}" style="color:var(--text-primary, #1e293b);font-weight:600;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(c.email)}">
                      ${esc(c.email || '—')}
                    </a>
                  </div>
                </div>
                ${c.email ? `
                  <button type="button" class="coord-copy-email-btn" data-email="${esc(c.email)}" title="Copy Email Address" style="background:var(--bg-elevated, #ffffff);border:1px solid var(--border-default, #cbd5e1);border-radius:6px;padding:3px 8px;font-size:0.68rem;font-weight:600;color:var(--text-secondary);cursor:pointer;flex-shrink:0;">
                    Copy
                  </button>` : ''}
              </div>

              <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                <span style="color:var(--color-primary, #005930);display:flex;flex-shrink:0;">${icon('phone', 13)}</span>
                <div style="min-width:0;">
                  <span style="display:block;font-size:0.65rem;text-transform:uppercase;color:var(--text-tertiary, #94a3b8);font-weight:700;">Contact / Office</span>
                  ${c.phone
                    ? `<a href="tel:${esc(c.phone)}" style="color:var(--text-primary, #1e293b);font-weight:600;text-decoration:none;">${esc(c.phone)}</a>`
                    : `<span style="color:var(--text-secondary);font-weight:500;">${esc(c.company_name || 'CHMSU')} Practicum Office</span>`}
                </div>
              </div>
            </div>

            <!-- Action Row -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;">
              ${c.email ? `
                <a href="mailto:${esc(c.email)}${studentName ? `?subject=${encodeURIComponent(`OJT Coordination Inquiry — ${studentName}`)}` : ''}" class="btn btn--sm btn--outline" style="height:34px;padding:0 12px;border-radius:8px;font-size:0.77rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;text-decoration:none;">
                  ${icon('mail', 13)} Send Email
                </a>` : ''}
              <button
                type="button"
                class="btn btn--sm btn--primary coord-start-chat-btn"
                data-id="${c.id}"
                style="height:34px;padding:0 16px;border-radius:8px;font-size:0.78rem;font-weight:700;background:#005930;border-color:#005930;color:#ffffff;display:inline-flex;align-items:center;gap:6px;cursor:pointer;box-shadow:0 2px 8px rgba(0,89,48,0.2);"
              >
                ${icon('messageCircle', 13)} ${isCurrentChat ? 'Continue Chat' : 'Message Coordinator'}
              </button>
            </div>
          </div>`;
      }).join('');

      // Copy email buttons
      bodyEl.querySelectorAll('.coord-copy-email-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const email = btn.dataset.email;
          if (email && navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
              const orig = btn.textContent;
              btn.textContent = 'Copied!';
              btn.style.color = '#005930';
              btn.style.borderColor = '#005930';
              setTimeout(() => {
                btn.textContent = orig;
                btn.style.color = '';
                btn.style.borderColor = '';
              }, 1600);
            });
          }
        });
      });

      // Start chat buttons
      bodyEl.querySelectorAll('.coord-start-chat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const supId = Number(btn.dataset.id);
          close();
          if (supId > 0) {
            window.openCoordinatorChat(supId);
          }
        });
      });
    }

    searchEl?.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      renderCoordinatorCards();
    });

    renderFilterTabs();
    renderCoordinatorCards();
  };
}
