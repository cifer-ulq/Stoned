/* ── Admin Broadcast Modal to Students ── */
import { apiPost } from '../api/client.js';
import { icon, renderIcons } from './icons.js';

const PROGRAMS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Information Systems',
  'Bachelor of Science in Computer Engineering',
  'Bachelor of Science in Entertainment and Multimedia Computing',
  'Bachelor of Science in Industrial Technology',
  'Bachelor of Science in Business Administration',
  'Bachelor of Science in Accountancy',
  'Bachelor of Science in Hospitality Management',
  'Bachelor of Science in Tourism Management',
  'Bachelor of Science in Criminology',
  'Bachelor of Science in Nursing',
  'Bachelor of Science in Civil Engineering',
  'Bachelor of Science in Mechanical Engineering',
  'Bachelor of Science in Electrical Engineering',
  'Bachelor of Science in Electronics Engineering',
  'Bachelor of Science in Agriculture',
  'Bachelor of Science in Fisheries',
  'Bachelor of Science in Psychology',
  'Bachelor of Secondary Education',
  'Bachelor of Elementary Education',
  'Bachelor of Technology and Livelihood Education',
];

export function openBroadcastModal({ container, onSuccess }) {
  const existing = document.getElementById('admin-broadcast-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'admin-broadcast-modal-backdrop';
  backdrop.className = 'modal-backdrop anim-fade-in';
  backdrop.style.zIndex = '1050';

  backdrop.innerHTML = `
    <div class="modal anim-scale-in" style="max-width: 640px; width: 100%;">
      <!-- Header -->
      <div class="modal__header" style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border-default);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:var(--color-primary-bg, rgba(0,89,48,0.12));color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;">
            ${icon('bell', 20)}
          </div>
          <div>
            <h3 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0;">Broadcast Notification</h3>
            <p style="font-size:0.75rem;color:var(--text-tertiary);margin:2px 0 0;">Dispatch real-time in-app announcements directly to students</p>
          </div>
        </div>
        <button class="modal__close" id="bm-close" aria-label="Close" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:4px;">
          ${icon('x', 18)}
        </button>
      </div>

      <!-- Body -->
      <div class="modal__body" style="padding:22px 24px;display:flex;flex-direction:column;gap:16px;max-height:75vh;overflow-y:auto;">
        <!-- Targeting Row -->
        <div style="display:grid;grid-template-columns: 1fr 1fr;gap:14px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Target Audience</label>
            <select class="form-select" id="bm-target-type" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);">
              <option value="all">All Enrolled Students & Alumni</option>
              <option value="program">Filter by Academic Program</option>
              <option value="status">Filter by OJT Status</option>
              <option value="batch">Filter by School Year / Batch</option>
            </select>
          </div>

          <div class="form-group" id="bm-target-val-group" style="margin:0;display:none;">
            <label class="form-label" id="bm-target-val-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Target Specification</label>
            <div id="bm-target-val-container">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

        <!-- Priority & Deep-link Target -->
        <div style="display:grid;grid-template-columns: 1fr 1fr;gap:14px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Notification Priority</label>
            <select class="form-select" id="bm-priority" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);">
              <option value="normal">Normal Announcement</option>
              <option value="high">High Priority / Reminder</option>
              <option value="urgent">Urgent Action Required</option>
            </select>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Destination Page (On Click)</label>
            <select class="form-select" id="bm-route" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);">
              <option value="/home">Student Dashboard (/home)</option>
              <option value="/ojt">OJT Opportunities (/ojt)</option>
              <option value="/ojt-tracker">OJT Time Tracker (/ojt-tracker)</option>
              <option value="/applications">Job Applications (/applications)</option>
              <option value="/portfolio">Student Portfolio (/portfolio)</option>
            </select>
          </div>
        </div>

        <!-- Title -->
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Notification Title *</label>
          <input type="text" id="bm-title" class="form-input" placeholder="e.g. Midterm OJT Daily Time Records Reminder" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);" />
        </div>

        <!-- Message -->
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Notification Message *</label>
          <textarea id="bm-message" class="form-textarea" rows="4" placeholder="Enter message body for students..." style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);resize:vertical;"></textarea>
          <div style="font-size:0.7rem;color:var(--text-tertiary);margin-top:4px;">Students will receive this alert as an in-app banner toast and in their navbar notification dropdown.</div>
        </div>

        <!-- Live Preview -->
        <div>
          <label class="form-label" style="font-size:0.75rem;font-weight:600;margin-bottom:6px;display:block;">Student Notification Preview</label>
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:12px 14px;display:flex;align-items:flex-start;gap:12px;">
            <div id="bm-preview-icon" style="width:34px;height:34px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('bell', 16)}
            </div>
            <div style="flex:1;min-width:0;">
              <div id="bm-preview-title" style="font-size:0.825rem;font-weight:700;color:var(--text-primary);">Notification Title Preview</div>
              <div id="bm-preview-msg" style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">Message body will appear here for recipients...</div>
              <div style="font-size:0.6875rem;color:var(--text-tertiary);margin-top:4px;">Just now &middot; CIER Admin Office</div>
            </div>
          </div>
        </div>

        <div id="bm-feedback" style="display:none;padding:10px 12px;border-radius:var(--radius-md);font-size:0.75rem;"></div>
      </div>

      <!-- Footer -->
      <div class="modal__footer" style="display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:var(--bg-secondary);">
        <button class="btn btn--outline btn--sm" id="bm-cancel-btn">Cancel</button>
        <button class="btn btn--primary btn--sm" id="bm-submit-btn" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('bell', 14)} Send Broadcast
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  renderIcons(backdrop);

  const close = () => backdrop.remove();

  backdrop.querySelector('#bm-close').addEventListener('click', close);
  backdrop.querySelector('#bm-cancel-btn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  const targetTypeSelect = backdrop.querySelector('#bm-target-type');
  const targetValGroup = backdrop.querySelector('#bm-target-val-group');
  const targetValLabel = backdrop.querySelector('#bm-target-val-label');
  const targetValContainer = backdrop.querySelector('#bm-target-val-container');

  const titleInput = backdrop.querySelector('#bm-title');
  const messageInput = backdrop.querySelector('#bm-message');
  const prioritySelect = backdrop.querySelector('#bm-priority');
  const routeSelect = backdrop.querySelector('#bm-route');
  const submitBtn = backdrop.querySelector('#bm-submit-btn');
  const feedbackEl = backdrop.querySelector('#bm-feedback');

  const previewTitle = backdrop.querySelector('#bm-preview-title');
  const previewMsg = backdrop.querySelector('#bm-preview-msg');
  const previewIcon = backdrop.querySelector('#bm-preview-icon');

  // Sync Preview
  function updatePreview() {
    previewTitle.textContent = titleInput.value.trim() || 'Notification Title Preview';
    previewMsg.textContent = messageInput.value.trim() || 'Message body will appear here for recipients...';

    const pri = prioritySelect.value;
    if (pri === 'urgent') {
      previewIcon.style.background = 'rgba(239, 68, 68, 0.12)';
      previewIcon.style.color = '#EF4444';
      previewIcon.innerHTML = icon('alert-triangle', 16);
    } else if (pri === 'high') {
      previewIcon.style.background = 'rgba(217, 119, 6, 0.12)';
      previewIcon.style.color = '#D97706';
      previewIcon.innerHTML = icon('clock', 16);
    } else {
      previewIcon.style.background = 'rgba(0, 89, 48, 0.12)';
      previewIcon.style.color = '#005930';
      previewIcon.innerHTML = icon('bell', 16);
    }
    renderIcons(previewIcon);
  }

  titleInput.addEventListener('input', updatePreview);
  messageInput.addEventListener('input', updatePreview);
  prioritySelect.addEventListener('change', updatePreview);

  // Audience selector logic
  targetTypeSelect.addEventListener('change', () => {
    const val = targetTypeSelect.value;
    if (val === 'all') {
      targetValGroup.style.display = 'none';
      targetValContainer.innerHTML = '';
    } else if (val === 'program') {
      targetValGroup.style.display = 'block';
      targetValLabel.textContent = 'Select Academic Program';
      targetValContainer.innerHTML = `
        <select class="form-select" id="bm-target-program" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);">
          ${PROGRAMS.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
      `;
    } else if (val === 'status') {
      targetValGroup.style.display = 'block';
      targetValLabel.textContent = 'Select OJT Status';
      targetValContainer.innerHTML = `
        <select class="form-select" id="bm-target-status" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);">
          <option value="Undeployed">Undeployed</option>
          <option value="Active OJT">Active OJT</option>
          <option value="Alumni">Alumni / Graduate</option>
        </select>
      `;
    } else if (val === 'batch') {
      targetValGroup.style.display = 'block';
      targetValLabel.textContent = 'Enter School Year / Batch';
      targetValContainer.innerHTML = `
        <input type="text" class="form-input" id="bm-target-batch" placeholder="e.g. 2024-2025" style="width:100%;padding:8px 12px;font-size:0.825rem;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--bg-elevated);color:var(--text-primary);" />
      `;
    }
  });

  // Submit Handler
  submitBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const message = messageInput.value.trim();
    const targetType = targetTypeSelect.value;
    const priority = prioritySelect.value;
    const route = routeSelect.value;

    if (!title) {
      alert('Please enter a notification title.');
      titleInput.focus();
      return;
    }
    if (!message) {
      alert('Please enter the notification message.');
      messageInput.focus();
      return;
    }

    let targetProgram = null;
    let targetStatus = null;
    let targetBatch = null;

    if (targetType === 'program') {
      targetProgram = backdrop.querySelector('#bm-target-program')?.value;
    } else if (targetType === 'status') {
      targetStatus = backdrop.querySelector('#bm-target-status')?.value;
    } else if (targetType === 'batch') {
      targetBatch = backdrop.querySelector('#bm-target-batch')?.value.trim();
      if (!targetBatch) {
        alert('Please specify the target batch / school year.');
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('refresh-cw', 14)} Dispatching…`;
    renderIcons(submitBtn);

    try {
      const res = await apiPost('/admin/notifications/broadcast', {
        title,
        message,
        type: 'admin_broadcast',
        priority,
        target_audience: targetType,
        target_program: targetProgram,
        target_status: targetStatus,
        target_batch: targetBatch,
        action_route: route,
      });

      if (res && res.success) {
        feedbackEl.style.display = 'block';
        feedbackEl.style.background = 'var(--color-success-bg, rgba(16,185,129,0.1))';
        feedbackEl.style.color = 'var(--color-success, #10B981)';
        feedbackEl.style.border = '1px solid var(--color-success, #10B981)';
        feedbackEl.textContent = res.message || `Dispatched to ${res.recipients_count} students.`;

        setTimeout(() => {
          close();
          if (typeof onSuccess === 'function') onSuccess(res);
        }, 1200);
      } else {
        throw new Error(res?.message || 'Failed to dispatch broadcast');
      }
    } catch (err) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = 'var(--color-error-bg, rgba(239,68,68,0.1))';
      feedbackEl.style.color = 'var(--color-error, #EF4444)';
      feedbackEl.style.border = '1px solid var(--color-error, #EF4444)';
      feedbackEl.textContent = err.message || 'Error broadcasting notification.';

      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('bell', 14)} Send Broadcast`;
      renderIcons(submitBtn);
    }
  });
}
