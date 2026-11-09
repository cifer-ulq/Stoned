/* ── Companies Page — Admin Portal (Redesigned Enterprise UI) ── */
import {
  apiGet,
  apiGetCached,
  getCached,
  apiPost,
  apiPostForm,
  apiPatch,
  apiDelete,
  getToken,
} from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

/* ── Status Theme Tokens ── */
const STATUS_CONFIG = {
  Active:    { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  active:    { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  Pending:   { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', label: 'Pending' },
  pending:   { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', label: 'Pending' },
  Suspended: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Suspended' },
  suspended: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Suspended' },
  Inactive:  { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)', label: 'Inactive' },
  inactive:  { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)', label: 'Inactive' },
};

const MOA_CONFIG = {
  Active:          { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  active:          { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  Accepted:        { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Accepted' },
  accepted:        { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Accepted' },
  Approved:        { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  approved:        { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', label: 'Active' },
  Requested:       { color: '#D97706', bg: 'rgba(217, 119, 6, 0.14)', border: 'rgba(217, 119, 6, 0.35)', label: 'MOA Requested' },
  requested:       { color: '#D97706', bg: 'rgba(217, 119, 6, 0.14)', border: 'rgba(217, 119, 6, 0.35)', label: 'MOA Requested' },
  'Grace Period':  { color: '#D97706', bg: 'rgba(217, 119, 6, 0.14)', border: 'rgba(217, 119, 6, 0.35)', label: 'Grace Period (Active Trainees)' },
  'grace period':  { color: '#D97706', bg: 'rgba(217, 119, 6, 0.14)', border: 'rgba(217, 119, 6, 0.35)', label: 'Grace Period (Active Trainees)' },
  'Expiring Soon': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', label: 'Expiring Soon' },
  'expiring soon': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', label: 'Expiring Soon' },
  Pending:         { color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)', label: 'Under Review' },
  pending:         { color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)', label: 'Under Review' },
  Expired:         { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Expired' },
  expired:         { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Expired' },
  Rejected:        { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Rejected' },
  rejected:        { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', label: 'Rejected' },
};

function getStatusConfig(status) {
  if (!status) return STATUS_CONFIG.Pending;
  const s = String(status).trim();
  const lower = s.toLowerCase();
  if (lower === 'active') return STATUS_CONFIG.Active;
  if (lower === 'pending') return STATUS_CONFIG.Pending;
  if (lower === 'suspended') return STATUS_CONFIG.Suspended;
  if (lower === 'inactive') return STATUS_CONFIG.Inactive;
  const titleCase = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return STATUS_CONFIG[titleCase] || STATUS_CONFIG[s] || STATUS_CONFIG.Pending;
}

function getMoaConfig(moaStatus) {
  if (!moaStatus) return MOA_CONFIG.Pending;
  const s = String(moaStatus).trim();
  const lower = s.toLowerCase();
  if (lower === 'approved' || lower === 'accepted' || lower === 'active') return MOA_CONFIG.Active;
  if (lower === 'requested') return MOA_CONFIG.Requested;
  if (lower === 'grace period') return MOA_CONFIG['Grace Period'];
  if (lower === 'expiring soon') return MOA_CONFIG['Expiring Soon'];
  if (lower === 'expired') return MOA_CONFIG.Expired;
  if (lower === 'rejected') return MOA_CONFIG.Rejected;
  if (lower === 'pending') return MOA_CONFIG.Pending;
  const titleCase = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return MOA_CONFIG[titleCase] || MOA_CONFIG[s] || MOA_CONFIG.Pending;
}

function normalizeCompanyData(c) {
  if (!c || typeof c !== 'object') return c;
  const rawStatus = String(c.status || 'Pending').trim().toLowerCase();
  if (rawStatus === 'active') c.status = 'Active';
  else if (rawStatus === 'pending') c.status = 'Pending';
  else if (rawStatus === 'suspended') c.status = 'Suspended';
  else if (rawStatus === 'inactive') c.status = 'Inactive';
  else c.status = c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) : 'Pending';

  const rawMoa = String(c.moaStatus || 'Pending').trim().toLowerCase();
  if (rawMoa === 'active' || rawMoa === 'approved' || rawMoa === 'accepted') c.moaStatus = 'Active';
  else if (rawMoa === 'requested') c.moaStatus = 'Requested';
  else if (rawMoa === 'expiring soon') c.moaStatus = 'Expiring Soon';
  else if (rawMoa === 'expired') c.moaStatus = 'Expired';
  else if (rawMoa === 'rejected') c.moaStatus = 'Rejected';
  else if (rawMoa === 'pending') c.moaStatus = 'Pending';
  else c.moaStatus = c.moaStatus ? (c.moaStatus.charAt(0).toUpperCase() + c.moaStatus.slice(1).toLowerCase()) : 'Pending';

  return c;
}

const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg, #005930, #1A7A4A)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #059669, #10B981)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #DC2626, #EF4444)', color: '#FFFFFF' },
  { bg: 'linear-gradient(135deg, #0891B2, #06B6D4)', color: '#FFFFFF' },
];

function getAvatarStyle(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function showToast(msg, type = 'success', customTitle = null) {
  document.querySelectorAll('.companies-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = `toast toast--${type} companies-toast`;

  let title = customTitle;
  let body = msg;

  if (!title) {
    if (type === 'success') {
      title = 'Success';
    } else if (type === 'error') {
      title = 'Action Failed';
    } else {
      title = 'Notice';
    }
  }

  // Detect context if title was default
  if (!customTitle && typeof msg === 'string') {
    const lower = msg.toLowerCase();
    if (lower.includes('partner registered') || lower.includes('company registered')) {
      title = 'Partner Registered';
    } else if (lower.includes('status updated')) {
      title = 'Status Updated';
    } else if (lower.includes('invitation email sent') || lower.includes('invitation sent')) {
      title = 'Invitation Sent';
    } else if (lower.includes('moa approved') || lower.includes('moa uploaded')) {
      title = 'MOA Updated';
    } else if (lower.includes('deleted')) {
      title = 'Company Removed';
    }
  }

  const iconName = type === 'success' ? 'check' : (type === 'error' ? 'alert-circle' : 'info');

  t.innerHTML = `
    <div class="cp-toast__icon">${icon(iconName, 13)}</div>
    <div class="cp-toast__body">
      <div class="cp-toast__title">${title}</div>
      <div class="cp-toast__desc">${body}</div>
    </div>
    <button class="cp-toast__close" aria-label="Dismiss">${icon('x', 13)}</button>
  `;

  const dismiss = () => {
    t.classList.add('companies-toast--hiding');
    setTimeout(() => t.remove(), 200);
  };

  t.querySelector('.cp-toast__close').addEventListener('click', dismiss);
  document.body.appendChild(t);
  renderIcons();

  setTimeout(() => {
    if (t.parentNode) dismiss();
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY DETAILS MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function showModal(c, container, companies, onUpdateCallback) {
  const existing = container.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const statuses = ['Active', 'Pending', 'Suspended', 'Inactive'];
  const sc = getStatusConfig(c.status);
  const mc = getMoaConfig(c.moaStatus);
  const avatarStyle = getAvatarStyle(c.name);

  const isActiveMoa = (c.moaStatus || '').toLowerCase() === 'active';
  const isRequested = (c.moaStatus || '').toLowerCase() === 'requested';

  let formTitle = 'Upload & Approve MOA Partnership';
  let submitButtonText = 'Approve & Activate MOA';
  let submitButtonIcon = 'check-circle';

  if (isRequested) {
    formTitle = 'Upload & Send MOA Agreement';
    submitButtonText = 'Send & Activate MOA';
    submitButtonIcon = 'send';
  } else if (isActiveMoa) {
    formTitle = c.moaFileUrl ? 'Update / Renew MOA Agreement' : 'Upload Agreement & Renew Partnership';
    submitButtonText = 'Save Contract Changes';
    submitButtonIcon = 'save';
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal cp-modal">
      <!-- ── HERO ── -->
      <div class="cp-modal__hero">
        <div class="cp-modal__hero-info">
          <div class="cp-modal__hero-avatar" style="background:${avatarStyle.bg};color:${avatarStyle.color};">
            ${c.name ? c.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <h2 class="cp-modal__hero-name">${c.name}</h2>
            <div class="cp-modal__hero-sub">
              <span>${icon('briefcase', 13)} ${c.industry || 'General Industry'}</span>
              <span>&bull;</span>
              <span>${icon('map-pin', 13)} ${c.location || 'Location Unspecified'}</span>
              ${c.registrationSource === 'self' ? `<span class="cp-tag-self" style="background:#fef3c7;color:#b45309;border:1px solid #fde68a;font-weight:700;font-size:0.7rem;padding:2px 8px;border-radius:99px;">Self-Registered</span>` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <span class="badge" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};font-weight:600;padding:4px 10px;">
            ${c.status}
          </span>
          <button class="modal__close" id="modal-close" style="position:static;">${icon('x', 16)}</button>
        </div>
      </div>

      <!-- ── BODY ── -->
      <div class="cp-modal__body">

        ${c.moaStatus === 'Requested' ? `
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:var(--radius-md);padding:14px 18px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px;">
            <span style="color:#d97706;margin-top:2px;">${icon('alert-circle', 18)}</span>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                <strong style="color:#92400e;font-size:var(--text-sm);">MOA Partnership Agreement Requested</strong>
                <span style="background:#fef3c7;color:#b45309;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;border:1px solid #fde68a;">
                  Action Required: Send MOA
                </span>
              </div>
              <p style="margin:4px 0 0;font-size:var(--text-xs);color:#b45309;line-height:1.5;">
                This self-registered company completed their profile and requested an official Memorandum of Agreement from CHMSU CIER.
                Upload and send their approved MOA below to activate their partnership and unlock OJT and Job posting capabilities.
              </p>
              ${c.moaRequestNotes ? `
                <div style="margin-top:8px;padding:8px 12px;background:#ffffff;border-radius:6px;border:1px solid #fef08a;font-size:var(--text-xs);color:#78350f;">
                  <strong>Company Request Notes:</strong> "${c.moaRequestNotes}"
                </div>
              ` : ''}
              ${c.moaRequestedAt ? `
                <div style="font-size:0.7rem;color:#92400e;margin-top:6px;">
                  Requested: ${new Date(c.moaRequestedAt).toLocaleString()}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Stat Tiles -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;">
          <div class="cp-info-card">
            <span class="cp-info-card__label">${icon('briefcase', 12)} Job Postings</span>
            <span class="cp-info-card__value" style="font-size:var(--text-lg);">${c.activePostings ?? c.jobPostings ?? 0}</span>
          </div>
          <div class="cp-info-card">
            <span class="cp-info-card__label">${icon('users', 12)} OJT Slots</span>
            <span class="cp-info-card__value" style="font-size:var(--text-lg);">${c.ojtSlots ?? 0}</span>
          </div>
          <div class="cp-info-card">
            <span class="cp-info-card__label">${icon('star', 12)} Partner Rating</span>
            <span class="cp-info-card__value" style="font-size:var(--text-lg);color:#F59E0B;">${(c.rating ?? 0).toFixed(1)} / 5.0</span>
          </div>
          <div class="cp-info-card">
            <span class="cp-info-card__label">${icon('file-check', 12)} MOA Status</span>
            <span class="cp-info-card__value" style="font-size:var(--text-sm);color:${mc.color};font-weight:700;">${c.moaStatus || 'Pending'}</span>
          </div>
        </div>

        <!-- Contact & Admin Controls Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <!-- Contact Person -->
          <div class="cp-info-card" style="padding:16px;">
            <div class="cp-modal__section-title">${icon('user', 14)} Primary Representative</div>
            <div style="font-size:var(--text-base);font-weight:var(--weight-bold);margin-bottom:6px;">${c.contactPerson || '—'}</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              ${icon('mail', 13)} <a href="mailto:${c.email}" style="color:var(--color-primary);text-decoration:none;">${c.email || '—'}</a>
            </div>
            ${c.phone ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);display:flex;align-items:center;gap:6px;">${icon('phone', 13)} ${c.phone}</div>` : ''}
          </div>

          <!-- Account Administration -->
          <div class="cp-info-card" style="padding:16px;">
            <div class="cp-modal__section-title">${icon('sliders', 14)} Account Administration</div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:4px;display:block;">Account Status</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <select id="modal-status-select" class="cp-select" style="flex:1;">
                ${statuses.map(s => `<option value="${s}" ${s.toLowerCase() === (c.status || '').toLowerCase() ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <div id="modal-status-saving" style="display:none;color:var(--text-tertiary);font-size:var(--text-xs);"><span class="spinner-sm"></span></div>
            </div>

            <!-- Resend invitation link -->
            <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-default);">
              <button class="btn btn--outline btn--sm" id="modal-send-invite-btn" style="width:100%;justify-content:center;gap:6px;">
                ${icon('send', 13)} <span>Send Login Credentials</span>
              </button>
              <div id="modal-invite-link-box" style="display:none;margin-top:10px;padding:10px 12px;background:var(--bg-primary);border:1px solid var(--border-default);border-radius:8px;font-size:0.75rem;"></div>
            </div>
          </div>
        </div>

        <!-- MOA Agreement Document & Management -->
        <div class="cp-info-card" style="padding:16px;">
          <div class="cp-modal__section-title" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span>${icon('file-text', 14)} Memorandum of Agreement (MOA)</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="cp-moa-badge" style="background:${mc.bg};color:${mc.color};border:1px solid ${mc.border};">
                <span class="cp-moa-dot" style="background:${mc.color};"></span>
                ${c.moaStatus || 'Pending'}
              </span>
              ${isActiveMoa ? `
                <button type="button" class="btn btn--outline btn--sm" id="btn-toggle-moa-form" style="gap:5px;padding:3px 10px;font-size:0.75rem;">
                  ${icon('edit-3', 12)} <span id="toggle-moa-label">Update / Renew</span>
                </button>
              ` : ''}
            </div>
          </div>

          ${c.moaFileUrl ? `
            <div class="cp-moa-preview" style="margin-bottom:16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                <div>
                  <span style="font-size:var(--text-sm);font-weight:var(--weight-semibold);">${icon('file-check', 14)} Verified MOA Contract</span>
                  ${c.moaExpiry ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">Validity: <strong>${c.moaStartDate ? c.moaStartDate + ' to ' : ''}${c.moaExpiry}</strong></div>` : ''}
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="${c.moaFileUrl}" target="_blank" class="btn btn--outline btn--sm" style="gap:4px;">${icon('external-link', 13)} Open Document</a>
                  <a href="${c.moaFileUrl}" download class="btn btn--primary btn--sm" style="gap:4px;">${icon('download', 13)} Download PDF</a>
                </div>
              </div>
              <iframe src="${c.moaFileUrl}" title="MOA Preview" style="width:100%;height:220px;border-radius:8px;border:1px solid var(--border-default);"></iframe>
            </div>
          ` : `
            <div style="background:var(--bg-primary);border:1px dashed var(--border-default);border-radius:var(--radius-lg);padding:18px;text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);margin-bottom:14px;">
              ${icon('file', 20)}
              <p style="margin:6px 0 0;">No active MOA file currently on record for this company.</p>
              ${c.moaExpiry ? `<span style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-top:4px;">MOA Expiry: ${c.moaExpiry}</span>` : ''}
            </div>
          `}

          <!-- Upload / Update MOA Form -->
          <form id="form-upload-moa" style="${isActiveMoa ? 'display:none;' : ''}background:var(--bg-primary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:14px;">
            <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              ${icon('upload-cloud', 14)} <span>${formTitle}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
              <div>
                <label style="font-size:0.75rem;color:var(--text-secondary);display:block;margin-bottom:4px;font-weight:600;">MOA Start Date</label>
                <input type="date" id="moa-start-date" class="cp-select" style="width:100%;padding:6px 8px;" value="${c.moaStartDate || ''}" />
              </div>
              <div>
                <label style="font-size:0.75rem;color:var(--text-secondary);display:block;margin-bottom:4px;font-weight:600;">MOA Expiration Date</label>
                <input type="date" id="moa-end-date" class="cp-select" style="width:100%;padding:6px 8px;" value="${c.moaExpiry || ''}" />
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:0.75rem;color:var(--text-secondary);display:block;margin-bottom:4px;font-weight:600;">
                ${isActiveMoa ? 'Replace MOA Document File (Optional - PDF, DOCX)' : 'MOA Document File (PDF, DOCX)'}
              </label>
              <input type="file" id="moa-file-input" accept=".pdf,.doc,.docx" class="cp-select" style="width:100%;padding:6px 8px;" />
              ${isActiveMoa && c.moaFileUrl ? `<span style="font-size:0.7rem;color:var(--text-tertiary);display:block;margin-top:3px;">Leave blank if you only want to extend validity dates without replacing the file.</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;">
              ${isActiveMoa ? `
                <button type="button" class="btn btn--secondary btn--sm" id="btn-cancel-moa-edit">
                  Cancel
                </button>
              ` : ''}
              <button type="submit" class="btn btn--primary btn--sm" id="btn-submit-moa" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;">
                ${icon(submitButtonIcon, 14)} <span>${submitButtonText}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- ── FOOTER ── -->
      <div class="modal__footer" style="padding:14px 24px;background:var(--bg-primary);border-top:1px solid var(--border-default);display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn btn--secondary btn--sm" id="modal-cancel">Close</button>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  const close = () => backdrop.remove();
  backdrop.querySelector('#modal-close').addEventListener('click', close);
  backdrop.querySelector('#modal-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  /* Update Status listener */
  backdrop.querySelector('#modal-status-select').addEventListener('change', async (e) => {
    const newStatus = e.target.value;
    const saving = backdrop.querySelector('#modal-status-saving');
    saving.style.display = 'inline-block';
    e.target.disabled = true;

    try {
      const res = await apiPatch(`/admin/companies/${c.id}/status`, { status: newStatus });
      if (res && res.status) {
        c.status = res.status;
        const idx = companies.findIndex(x => x.id === c.id);
        if (idx !== -1) companies[idx].status = res.status;
        showToast(`Status updated to ${res.status}`);
        if (typeof onUpdateCallback === 'function') onUpdateCallback();
      } else {
        showToast('Failed to update status', 'error');
        e.target.value = c.status;
      }
    } catch {
      showToast('Network error while updating status', 'error');
      e.target.value = c.status;
    } finally {
      saving.style.display = 'none';
      e.target.disabled = false;
    }
  });

  /* Send Invitation Credentials */
  const inviteBtn = backdrop.querySelector('#modal-send-invite-btn');
  const inviteLinkBox = backdrop.querySelector('#modal-invite-link-box');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', async () => {
      inviteBtn.disabled = true;
      const span = inviteBtn.querySelector('span');
      if (span) span.textContent = 'Generating Link…';

      try {
        const res = await apiPost(`/admin/companies/${c.id}/send-invitation`);
        showToast(res?.message || 'Invitation email sent successfully!', res?.mail_skipped ? 'info' : 'success');

        if (inviteLinkBox && res?.set_password_url) {
          const escAttr = (v) => String(v || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
          const safeUrl = escAttr(res.set_password_url);
          inviteLinkBox.style.display = 'block';
          inviteLinkBox.innerHTML = `
            <div style="font-weight:700;color:var(--text-primary);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <span>${res.mail_skipped ? 'SMTP Skipped (Reserved .test Email) — Setup Link' : 'Account Setup Link'}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <input id="modal-invite-link-input" type="text" readonly value="${safeUrl}" class="cp-select" style="flex:1;padding:5px 8px;font-size:0.72rem;font-family:monospace;" />
              <button type="button" class="btn btn--outline btn--sm" id="modal-invite-copy-btn" style="padding:4px 10px;font-size:0.72rem;">Copy</button>
              <a href="${safeUrl}" target="_blank" rel="noopener" id="modal-invite-open-link" class="btn btn--primary btn--sm" style="padding:4px 10px;font-size:0.72rem;">Open</a>
            </div>
          `;
          inviteLinkBox.querySelector('#modal-invite-copy-btn')?.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(res.set_password_url);
              showToast('Setup link copied to clipboard.', 'success', 'Copied');
            } catch {
              const inp = inviteLinkBox.querySelector('#modal-invite-link-input');
              inp?.select();
              showToast('Press Ctrl+C to copy the link.', 'info', 'Select Link');
            }
          });
        }
      } catch (err) {
        showToast('Failed to send invitation email', 'error');
      } finally {
        inviteBtn.disabled = false;
        if (span) span.textContent = 'Send Login Credentials';
      }
    });
  }

  /* Upload & Approve MOA form listener */
  const moaForm = backdrop.querySelector('#form-upload-moa');
  const toggleBtn = backdrop.querySelector('#btn-toggle-moa-form');
  const cancelEditBtn = backdrop.querySelector('#btn-cancel-moa-edit');
  const toggleLabel = backdrop.querySelector('#toggle-moa-label');

  if (toggleBtn && moaForm) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = moaForm.style.display === 'none' || moaForm.style.display === '';
      moaForm.style.display = isHidden ? 'block' : 'none';
      if (toggleLabel) {
        toggleLabel.textContent = isHidden ? 'Hide Form' : 'Update / Renew';
      }
      renderIcons(moaForm);
    });
  }

  if (cancelEditBtn && moaForm) {
    cancelEditBtn.addEventListener('click', () => {
      moaForm.style.display = 'none';
      if (toggleLabel) {
        toggleLabel.textContent = 'Update / Renew';
      }
    });
  }

  if (moaForm) {
    moaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = moaForm.querySelector('#btn-submit-moa');
      const fileInput = moaForm.querySelector('#moa-file-input');
      const startDate = moaForm.querySelector('#moa-start-date').value;
      const endDate = moaForm.querySelector('#moa-end-date').value;

      const fd = new FormData();
      if (fileInput.files && fileInput.files[0]) {
        fd.append('moa_file', fileInput.files[0]);
      }
      if (startDate) fd.append('moa_start_date', startDate);
      if (endDate) fd.append('moa_end_date', endDate);
      fd.append('moa_status', 'Active');

      submitBtn.disabled = true;
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `${icon('clock', 14)} <span>${isActiveMoa ? 'Saving Changes…' : 'Activating MOA…'}</span>`;

      try {
        const res = await apiPostForm(`/admin/companies/${c.id}/moa`, fd);
        if (res && res.success) {
          c.moaStatus = res.data.moaStatus || 'Active';
          c.moaExpiry = res.data.moaExpiry;
          c.moaStartDate = startDate;
          if (res.data.moaFileUrl) c.moaFileUrl = res.data.moaFileUrl;
          if (res.data.status) c.status = res.data.status;

          const idx = companies.findIndex(x => x.id === c.id);
          if (idx !== -1) {
            companies[idx].moaStatus = c.moaStatus;
            companies[idx].moaExpiry = c.moaExpiry;
            companies[idx].moaStartDate = c.moaStartDate;
            companies[idx].moaFileUrl = c.moaFileUrl;
            companies[idx].status = c.status;
          }

          const toastMsg = res?.message || (isActiveMoa
            ? 'MOA agreement terms updated successfully.'
            : 'MOA approved & activated! The company can now post slots and jobs.');
          showToast(toastMsg, 'success');
          backdrop.remove();
          if (typeof onUpdateCallback === 'function') onUpdateCallback();
        } else {
          showToast(res?.message || 'Failed to upload MOA', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      } catch {
        showToast('Network error while uploading MOA', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADD COMPANY MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function showAddCompanyModal(container, onSuccess) {
  const existing = container.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const todayStr = new Date().toISOString().split('T')[0];

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal ac-modal">
      <!-- ── Header ── -->
      <div class="ac-modal__header">
        <div class="ac-modal__header-left">
          <div class="ac-modal__icon">${icon('building-2', 18)}</div>
          <div>
            <h3 class="ac-modal__title">Register Partner Company</h3>
            <p class="ac-modal__subtitle">Add a partner organization and configure active MOA terms</p>
          </div>
        </div>
        <button class="modal__close" id="ac-close" aria-label="Close modal">${icon('x', 16)}</button>
      </div>

      <!-- ── Status Banner ── -->
      <div class="ac-modal__status-banner">
        ${icon('mail', 14)}
        <span>An invitation with account credentials will be automatically sent to the partner's official email.</span>
      </div>

      <div class="ac-modal__body">
        <form id="ac-form" novalidate>

          <!-- ── Section 1: Company Profile ── -->
          <div class="ac-section">
            <div class="ac-section__title">
              <span class="ac-section__title-icon">${icon('building', 13)}</span>
              Company Profile
            </div>
            <div class="ac-grid ac-grid--2col">
              <div class="ac-field ac-field--full">
                <label class="ac-label" for="ac-name">Company Name <span class="ac-req">*</span></label>
                <div class="ac-input-wrap" id="wrap-ac-name">
                  <span class="ac-input-icon">${icon('building-2', 14)}</span>
                  <input class="ac-input" id="ac-name" type="text" placeholder="e.g. InnoTek Solutions Philippines" autocomplete="organization" />
                </div>
                <span class="ac-error" id="err-ac-name"></span>
              </div>

              <div class="ac-field" id="field-ac-industry">
                <label class="ac-label" id="label-ac-industry">Industry / Sector <span class="ac-req">*</span></label>
                <div class="ac-industry-picker" id="wrap-ac-industry">
                  <input type="hidden" id="ac-industry" name="industry" value="" />
                  <button type="button" class="ac-industry-trigger" id="ac-industry-trigger" aria-haspopup="listbox" aria-expanded="false">
                    <span class="ac-industry-trigger__icon" id="ac-industry-trigger-icon">${icon('briefcase', 14)}</span>
                    <span class="ac-industry-trigger__content">
                      <span class="ac-industry-trigger__label ac-industry-trigger__label--placeholder" id="ac-industry-label">Select industry</span>
                    </span>
                    <span class="ac-industry-trigger__chevron">${icon('chevron-down', 14)}</span>
                  </button>
                  <div class="ac-industry-dropdown" id="ac-industry-dropdown" role="listbox">
                    <div class="ac-industry-search-wrap">
                      <span class="ac-industry-search-icon">${icon('search', 13)}</span>
                      <input type="text" class="ac-industry-search-input" id="ac-industry-search" placeholder="Search industry..." autocomplete="off" />
                      <button type="button" class="ac-industry-search-clear" id="ac-industry-search-clear" style="display:none;" title="Clear search">
                        ${icon('x', 12)}
                      </button>
                    </div>
                    <div class="ac-industry-list-header">
                      <span>AVAILABLE INDUSTRIES</span>
                      <span class="ac-industry-count" id="ac-industry-count">16 options</span>
                    </div>
                    <div class="ac-industry-list" id="ac-industry-list" tabindex="-1"></div>
                  </div>
                </div>
                <span class="ac-error" id="err-ac-industry"></span>
              </div>

              <div class="ac-field">
                <label class="ac-label" for="ac-location">City / Location</label>
                <div class="ac-input-wrap">
                  <span class="ac-input-icon">${icon('map-pin', 14)}</span>
                  <input class="ac-input" id="ac-location" type="text" placeholder="e.g. Bacolod City, Negros Occidental" />
                </div>
              </div>

              <!-- Dedicated "Other" Industry field revealed when Other is selected -->
              <div class="ac-field ac-field--full ac-field--other-industry" id="field-ac-other-industry" style="display: none;">
                <label class="ac-label" for="ac-other-industry">Specify Industry Name <span class="ac-req">*</span></label>
                <div class="ac-input-wrap" id="wrap-ac-other-industry">
                  <span class="ac-input-icon">${icon('sparkles', 14)}</span>
                  <input class="ac-input" id="ac-other-industry" type="text" placeholder="e.g. Renewable Energy, Aerospace, Logistics & Supply Chain..." maxlength="255" autocomplete="off" />
                </div>
                <span class="ac-error" id="err-ac-other-industry"></span>
              </div>
            </div>
          </div>

          <!-- ── Section 2: Contact Details ── -->
          <div class="ac-section">
            <div class="ac-section__title">
              <span class="ac-section__title-icon">${icon('user-check', 13)}</span>
              Contact Information
            </div>
            <div class="ac-grid ac-grid--2col">
              <div class="ac-field">
                <label class="ac-label" for="ac-contact">Contact Person <span class="ac-req">*</span></label>
                <div class="ac-input-wrap" id="wrap-ac-contact">
                  <span class="ac-input-icon">${icon('user', 14)}</span>
                  <input class="ac-input" id="ac-contact" type="text" placeholder="Full name of representative" />
                </div>
                <span class="ac-error" id="err-ac-contact"></span>
              </div>

              <div class="ac-field">
                <label class="ac-label" for="ac-email">Official Email <span class="ac-req">*</span></label>
                <div class="ac-input-wrap" id="wrap-ac-email">
                  <span class="ac-input-icon">${icon('mail', 14)}</span>
                  <input class="ac-input" id="ac-email" type="email" placeholder="contact@company.ph" autocomplete="email" />
                </div>
                <span class="ac-error" id="err-ac-email"></span>
              </div>

              <div class="ac-field ac-field--full">
                <label class="ac-label" for="ac-phone">Contact Phone</label>
                <div class="ac-input-wrap">
                  <span class="ac-input-icon">${icon('phone', 14)}</span>
                  <input class="ac-input" id="ac-phone" type="text" placeholder="e.g. 0917-123-4567 or (034) 433-1234" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── Section 3: Memorandum of Agreement (MOA) ── -->
          <div class="ac-section ac-section--last">
            <div class="ac-section__title">
              <span class="ac-section__title-icon">${icon('file-text', 13)}</span>
              MOA Agreement &amp; Validity
            </div>

            <div class="ac-grid ac-grid--2col">
              <div class="ac-field">
                <label class="ac-label" for="ac-moa-start">Effective Date</label>
                <div class="ac-input-wrap">
                  <span class="ac-input-icon">${icon('calendar', 14)}</span>
                  <input class="ac-input" id="ac-moa-start" type="date" value="${todayStr}" />
                </div>
              </div>

              <div class="ac-field">
                <label class="ac-label">Validity Duration</label>
                <div class="ac-duration-wrap">
                  <div class="ac-duration-pills" id="ac-duration-pills">
                    <button type="button" class="ac-duration-btn" data-val="1">1 AY</button>
                    <button type="button" class="ac-duration-btn" data-val="2">2 AY</button>
                    <button type="button" class="ac-duration-btn is-active" data-val="3">3 AY (Std)</button>
                    <button type="button" class="ac-duration-btn" data-val="5">5 AY</button>
                    <button type="button" class="ac-duration-btn" data-val="custom">Custom</button>
                  </div>
                  <div class="ac-custom-duration-wrap" id="ac-custom-duration-wrap">
                    <input type="number" id="ac-custom-duration" class="ac-custom-duration-input" min="1" max="50" value="4" />
                    <span class="ac-custom-duration-label">Academic Years (Ends June 30)</span>
                  </div>
                </div>
              </div>

              <div class="ac-field ac-field--full" style="margin-top:-4px;">
                <div class="ac-moa-preview">
                  ${icon('calendar-check', 13)}
                  <span>Valid until: <strong id="ac-moa-expiry-text">—</strong> (<span id="ac-moa-duration-text">3 years</span>)</span>
                </div>
              </div>
            </div>

            <div class="ac-field" style="margin-top:14px;">
              <label class="ac-label">Upload MOA Document <span class="ac-hint">(PDF, DOC, DOCX — max 10MB)</span></label>
              <div class="ac-dropzone" id="ac-dropzone">
                <input type="file" id="ac-moa-file" accept=".pdf,.doc,.docx" style="display:none;" />
                <div class="ac-dropzone__icon">${icon('file-up', 18)}</div>
                <div class="ac-dropzone__text">
                  <span class="ac-dropzone__primary" id="ac-file-title">Click to select MOA file or drag and drop</span>
                  <span class="ac-dropzone__secondary" id="ac-file-sub">PDF, DOC, DOCX up to 10MB (Optional at registration)</span>
                </div>
                <button type="button" class="ac-dropzone__remove" id="ac-file-remove" title="Remove file">${icon('x', 14)}</button>
              </div>
            </div>
          </div>

          <!-- ── Footer ── -->
          <div class="ac-modal__footer">
            <span class="ac-modal__footer-note">* Indicates required field</span>
            <div class="ac-modal__footer-actions">
              <button type="button" class="btn btn--outline" id="ac-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary" id="ac-submit">
                <span class="btn-text">${icon('user-plus', 15)} Register Partner</span>
                <span class="btn-loading" style="display:none;"><span class="spinner-sm"></span> Registering…</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

  const INDUSTRY_OPTIONS = [
    { value: 'Software Development', label: 'Software Development', icon: 'cpu' },
    { value: 'IT Consulting & Services', label: 'IT Consulting & Services', icon: 'briefcase' },
    { value: 'Cloud Computing & DevOps', label: 'Cloud Computing & DevOps', icon: 'server' },
    { value: 'Data Analytics & AI', label: 'Data Analytics & AI', icon: 'bar-chart-2' },
    { value: 'Cybersecurity', label: 'Cybersecurity', icon: 'shield' },
    { value: 'Digital Design & UX', label: 'Digital Design & UX', icon: 'palette' },
    { value: 'IT Outsourcing & BPO', label: 'IT Outsourcing & BPO', icon: 'users' },
    { value: 'Telecommunications', label: 'Telecommunications', icon: 'activity' },
    { value: 'Engineering & Hardware', label: 'Engineering & Hardware', icon: 'sliders' },
    { value: 'Agriculture & Food Tech', label: 'Agriculture & Food Tech', icon: 'sun' },
    { value: 'Financial Services & FinTech', label: 'Financial Services & FinTech', icon: 'trending-up' },
    { value: 'Healthcare & BioTech', label: 'Healthcare & BioTech', icon: 'activity' },
    { value: 'Education & EdTech', label: 'Education & EdTech', icon: 'graduation-cap' },
    { value: 'Government & Public Sector', label: 'Government & Public Sector', icon: 'building' },
    { value: 'Retail & E-Commerce', label: 'Retail & E-Commerce', icon: 'target' },
    { value: 'Other', label: 'Other (Specify Custom Industry)', icon: 'sparkles', isOther: true },
  ];

  const pickerWrap     = backdrop.querySelector('#wrap-ac-industry');
  const industryInput  = backdrop.querySelector('#ac-industry');
  const triggerBtn     = backdrop.querySelector('#ac-industry-trigger');
  const triggerLabel   = backdrop.querySelector('#ac-industry-label');
  const triggerIcon    = backdrop.querySelector('#ac-industry-trigger-icon');
  const searchInput    = backdrop.querySelector('#ac-industry-search');
  const searchClear    = backdrop.querySelector('#ac-industry-search-clear');
  const countBadge     = backdrop.querySelector('#ac-industry-count');
  const listContainer  = backdrop.querySelector('#ac-industry-list');
  const errIndustry    = backdrop.querySelector('#err-ac-industry');
  const fieldOther     = backdrop.querySelector('#field-ac-other-industry');
  const inputOther     = backdrop.querySelector('#ac-other-industry');
  const errOther       = backdrop.querySelector('#err-ac-other-industry');
  const wrapOther      = backdrop.querySelector('#wrap-ac-other-industry');

  function openDropdown() {
    pickerWrap.classList.add('is-open');
    triggerBtn.setAttribute('aria-expanded', 'true');
    searchInput.value = '';
    searchClear.style.display = 'none';
    renderIndustryList('');
    setTimeout(() => searchInput.focus(), 60);
  }

  function closeDropdown() {
    pickerWrap.classList.remove('is-open');
    triggerBtn.setAttribute('aria-expanded', 'false');
  }

  function selectIndustry(val) {
    const item = INDUSTRY_OPTIONS.find(o => o.value === val);
    if (!item) return;

    industryInput.value = item.value;
    triggerLabel.textContent = item.value === 'Other' ? 'Other (Specify below)' : item.label;
    triggerLabel.classList.remove('ac-industry-trigger__label--placeholder');
    triggerIcon.innerHTML = icon(item.icon, 14);

    if (errIndustry) errIndustry.textContent = '';
    pickerWrap.classList.remove('ac-industry-picker--error');

    closeDropdown();

    if (item.value === 'Other') {
      fieldOther.style.display = 'flex';
      setTimeout(() => inputOther.focus(), 60);
    } else {
      fieldOther.style.display = 'none';
      inputOther.value = '';
      if (errOther) errOther.textContent = '';
      if (wrapOther) wrapOther.classList.remove('ac-input-wrap--error');
    }
  }

  function renderIndustryList(filterText = '') {
    const query = filterText.toLowerCase().trim();
    const filtered = INDUSTRY_OPTIONS.filter(o =>
      o.label.toLowerCase().includes(query) || o.value.toLowerCase().includes(query)
    );

    if (countBadge) {
      countBadge.textContent = `${filtered.length} option${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="ac-industry-empty">
          <span>No industries found matching "${escapeHtml(filterText)}"</span>
          <button type="button" class="ac-industry-empty-btn" id="ac-industry-fallback-other">
            ${icon('sparkles', 13)} Select "Other" to specify
          </button>
        </div>
      `;
      const fallbackBtn = listContainer.querySelector('#ac-industry-fallback-other');
      if (fallbackBtn) {
        fallbackBtn.addEventListener('click', () => {
          selectIndustry('Other');
          if (filterText && !inputOther.value) {
            inputOther.value = filterText;
          }
        });
      }
      return;
    }

    listContainer.innerHTML = filtered.map(opt => {
      const isSelected = industryInput.value === opt.value;
      const otherClass = opt.isOther ? ' ac-industry-item--other' : '';
      const selectedClass = isSelected ? ' ac-industry-item--selected' : '';
      return `
        <div class="ac-industry-item${otherClass}${selectedClass}" data-value="${opt.value}" role="option" aria-selected="${isSelected}">
          <span class="ac-industry-item__avatar">${icon(opt.icon, 14)}</span>
          <span class="ac-industry-item__name">${opt.label}</span>
          <span class="ac-industry-item__check">${icon('check', 14)}</span>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.ac-industry-item').forEach(el => {
      el.addEventListener('click', () => selectIndustry(el.dataset.value));
    });
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pickerWrap.classList.contains('is-open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    searchClear.style.display = val ? 'flex' : 'none';
    renderIndustryList(val);
  });

  searchClear.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.value = '';
    searchClear.style.display = 'none';
    renderIndustryList('');
    searchInput.focus();
  });

  inputOther.addEventListener('input', () => {
    if (inputOther.value.trim()) {
      if (errOther) errOther.textContent = '';
      if (wrapOther) wrapOther.classList.remove('ac-input-wrap--error');
    }
  });

  const onDocClick = (e) => {
    if (!backdrop.isConnected) {
      document.removeEventListener('click', onDocClick);
      return;
    }
    if (!pickerWrap.contains(e.target)) {
      closeDropdown();
    }
  };
  document.addEventListener('click', onDocClick);

  const close = () => {
    document.removeEventListener('click', onDocClick);
    backdrop.remove();
  };
  backdrop.querySelector('#ac-close').addEventListener('click', close);
  backdrop.querySelector('#ac-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  let selectedDurationMode = '3';

  function getCalculatedEndDate() {
    const startVal = backdrop.querySelector('#ac-moa-start').value;
    const customInput = backdrop.querySelector('#ac-custom-duration');

    let duration = 3;
    if (selectedDurationMode === 'custom') {
      duration = parseInt(customInput?.value, 10) || 1;
      if (duration < 1) duration = 1;
      if (duration > 50) duration = 50;
    } else {
      duration = parseInt(selectedDurationMode, 10) || 3;
    }

    let startDate = startVal ? new Date(startVal + 'T00:00:00') : new Date();
    if (isNaN(startDate.getTime())) startDate = new Date();

    const startMonth = startDate.getMonth() + 1; // 1-12
    const startYear = startDate.getFullYear();
    const targetYear = startMonth <= 6
      ? (startYear + duration - 1)
      : (startYear + duration);

    const endDate = new Date(targetYear, 5, 30); // June 30
    const yyyy = endDate.getFullYear();
    const mm = String(endDate.getMonth() + 1).padStart(2, '0');
    const dd = String(endDate.getDate()).padStart(2, '0');
    const endDateStr = `${yyyy}-${mm}-${dd}`;

    return { duration, startDate, endDate, endDateStr };
  }

  function updateMoaExpiryPreview() {
    const { duration, endDate } = getCalculatedEndDate();
    const formatted = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const expiryEl = backdrop.querySelector('#ac-moa-expiry-text');
    const durEl = backdrop.querySelector('#ac-moa-duration-text');
    if (expiryEl) expiryEl.textContent = formatted;
    if (durEl) durEl.textContent = `${duration} ${duration === 1 ? 'Academic Year' : 'Academic Years'} (Ends June 30)`;
  }

  // Duration pill clicks
  const pillBtns = backdrop.querySelectorAll('.ac-duration-btn');
  const customWrap = backdrop.querySelector('#ac-custom-duration-wrap');
  const customInput = backdrop.querySelector('#ac-custom-duration');

  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedDurationMode = btn.dataset.val;
      if (selectedDurationMode === 'custom') {
        customWrap.classList.add('is-visible');
        customInput.focus();
      } else {
        customWrap.classList.remove('is-visible');
      }
      updateMoaExpiryPreview();
    });
  });

  customInput.addEventListener('input', updateMoaExpiryPreview);
  backdrop.querySelector('#ac-moa-start').addEventListener('change', updateMoaExpiryPreview);
  updateMoaExpiryPreview();

  // File dropzone
  const fileInput = backdrop.querySelector('#ac-moa-file');
  const dropzone = backdrop.querySelector('#ac-dropzone');
  const fileTitle = backdrop.querySelector('#ac-file-title');
  const fileSub = backdrop.querySelector('#ac-file-sub');
  const fileRemove = backdrop.querySelector('#ac-file-remove');

  function updateFileDisplay(file) {
    if (file) {
      dropzone.classList.add('ac-dropzone--has-file');
      fileTitle.textContent = file.name;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      fileSub.textContent = `${sizeMb} MB • Ready to upload`;
    } else {
      dropzone.classList.remove('ac-dropzone--has-file');
      fileTitle.textContent = 'Click to select MOA file or drag and drop';
      fileSub.textContent = 'PDF, DOC, DOCX up to 10MB (Optional at registration)';
      fileInput.value = '';
    }
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#ac-file-remove')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    updateFileDisplay(fileInput.files[0] || null);
  });

  fileRemove.addEventListener('click', (e) => {
    e.stopPropagation();
    updateFileDisplay(null);
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('ac-dropzone--hover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('ac-dropzone--hover');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      fileInput.files = droppedFiles;
      updateFileDisplay(droppedFiles[0]);
    }
  });

  const form = backdrop.querySelector('#ac-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl = backdrop.querySelector('#ac-name');
    const contactEl = backdrop.querySelector('#ac-contact');
    const emailEl = backdrop.querySelector('#ac-email');

    let valid = true;
    const check = (el, id, msg) => {
      const err = backdrop.querySelector(`#err-${id}`);
      const wrap = backdrop.querySelector(`#wrap-${id}`);
      if (!el.value.trim()) {
        if (err) err.textContent = msg;
        if (wrap) wrap.classList.add('ac-input-wrap--error');
        valid = false;
      } else {
        if (err) err.textContent = '';
        if (wrap) wrap.classList.remove('ac-input-wrap--error');
      }
    };

    check(nameEl, 'ac-name', 'Company name is required');

    // Industry validation
    const indVal = industryInput.value.trim();
    if (!indVal) {
      if (errIndustry) errIndustry.textContent = 'Please select an industry';
      pickerWrap.classList.add('ac-industry-picker--error');
      valid = false;
    } else {
      if (errIndustry) errIndustry.textContent = '';
      pickerWrap.classList.remove('ac-industry-picker--error');

      if (indVal === 'Other') {
        const otherVal = inputOther?.value?.trim() || '';
        if (!otherVal) {
          if (errOther) errOther.textContent = 'Please specify the industry name';
          if (wrapOther) wrapOther.classList.add('ac-input-wrap--error');
          if (valid) inputOther?.focus();
          valid = false;
        } else {
          if (errOther) errOther.textContent = '';
          if (wrapOther) wrapOther.classList.remove('ac-input-wrap--error');
        }
      }
    }

    check(contactEl, 'ac-contact', 'Contact person is required');
    check(emailEl, 'ac-email', 'Official email address is required');

    if (!valid) return;

    const btnSubmit = backdrop.querySelector('#ac-submit');
    btnSubmit.disabled = true;
    btnSubmit.querySelector('.btn-text').style.display = 'none';
    btnSubmit.querySelector('.btn-loading').style.display = 'inline-flex';

    const { duration, endDate, endDateStr } = getCalculatedEndDate();
    const startVal = backdrop.querySelector('#ac-moa-start').value;

    const fd = new FormData();
    fd.append('company_name', nameEl.value.trim());

    const finalIndustry = indVal === 'Other' ? inputOther.value.trim() : indVal;
    fd.append('industry', finalIndustry);

    fd.append('contact_person', contactEl.value.trim());
    fd.append('email', emailEl.value.trim());
    fd.append('location', backdrop.querySelector('#ac-location').value.trim());
    fd.append('phone', backdrop.querySelector('#ac-phone').value.trim());

    if (startVal) fd.append('moa_start_date', startVal);
    fd.append('moa_duration', duration);
    fd.append('moa_end_date', endDateStr);

    if (fileInput.files[0]) {
      fd.append('moa_file', fileInput.files[0]);
    }

    try {
      const res = await apiPostForm('/admin/companies', fd);
      if (res?.company) {
        const companyTitle = res.company.name || nameEl.value.trim();
        showToast(
          res.mail_skipped
            ? `${companyTitle} registered. SMTP delivery skipped for .test domain — onboarding link ready.`
            : `${companyTitle} has been registered. Invitation email sent.`,
          res.mail_skipped ? 'info' : 'success',
          'Partner Registered'
        );
        close();
        if (typeof onSuccess === 'function') onSuccess(res.company);
        if (res.set_password_url && (res.mail_skipped || !res.email_sent)) {
          showOnboardingLinkModal(container, {
            companyName: companyTitle,
            email: res.company.email || emailEl.value.trim(),
            setPasswordUrl: res.set_password_url,
            mailSkipped: Boolean(res.mail_skipped),
          });
        }
      } else {
        showToast(res?.message || 'Failed to register company.', 'error', 'Registration Failed');
      }
    } catch (err) {
      const response = err?.response;
      const errors = response?.errors || {};
      let fieldErrorShown = false;

      if (errors.email && errors.email[0]) {
        const emailErr = backdrop.querySelector('#err-ac-email');
        const emailWrap = backdrop.querySelector('#wrap-ac-email');
        if (emailErr) emailErr.textContent = errors.email[0];
        if (emailWrap) emailWrap.classList.add('ac-input-wrap--error');
        fieldErrorShown = true;
      }
      if (errors.company_name && errors.company_name[0]) {
        const nameErr = backdrop.querySelector('#err-ac-name');
        const nameWrap = backdrop.querySelector('#wrap-ac-name');
        if (nameErr) nameErr.textContent = errors.company_name[0];
        if (nameWrap) nameWrap.classList.add('ac-input-wrap--error');
        fieldErrorShown = true;
      }

      const errMsg = response?.message || err?.message || 'Network error while registering company.';
      const toastTitle = response ? 'Registration Failed' : 'Network Error';
      showToast(errMsg, 'error', toastTitle);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.querySelector('.btn-text').style.display = 'inline-flex';
      btnSubmit.querySelector('.btn-loading').style.display = 'none';
    }
  });
}

function showOnboardingLinkModal(container, { companyName, email, setPasswordUrl, mailSkipped }) {
  const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" style="max-width:560px;width:95vw;border-radius:16px;overflow:hidden;">
      <div class="modal__header" style="padding:18px 22px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">${icon('key', 18)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;font-size:1.05rem;">Company Onboarding Link</h3>
            <p style="margin:2px 0 0;font-size:0.78rem;color:var(--text-secondary);">${esc(companyName)} (${esc(email)})</p>
          </div>
        </div>
        <button type="button" class="modal__close" id="onb-close">${icon('x', 16)}</button>
      </div>
      <div class="modal__body" style="padding:18px 22px;">
        <p style="margin:0 0 12px;font-size:0.84rem;color:var(--text-secondary);line-height:1.5;">
          ${mailSkipped
            ? 'Email sending was automatically skipped because the email uses a reserved non-deliverable test domain. Use the setup link below to complete password creation and company onboarding:'
            : 'Email delivery could not be completed automatically. Share the setup link below with the company representative:'}
        </p>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="text" id="onboarding-link-input" readonly value="${esc(setPasswordUrl)}" class="cp-select" style="flex:1;padding:8px 10px;font-size:0.78rem;font-family:monospace;" />
          <button type="button" class="btn btn--outline btn--sm" id="onboarding-link-copy">Copy</button>
        </div>
      </div>
      <div class="modal__footer" style="padding:14px 22px;background:var(--bg-primary);border-top:1px solid var(--border-default);display:flex;justify-content:flex-end;gap:10px;">
        <a href="${esc(setPasswordUrl)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm" id="onboarding-link-open">${icon('external-link', 14)} Open Setup Page</a>
        <button type="button" class="btn btn--secondary btn--sm" id="onboarding-link-done">Done</button>
      </div>
    </div>
  `;
  container.appendChild(backdrop);
  renderIcons(backdrop);
  const closeLinkModal = () => backdrop.remove();
  backdrop.querySelector('#onb-close')?.addEventListener('click', closeLinkModal);
  backdrop.querySelector('#onboarding-link-done')?.addEventListener('click', closeLinkModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeLinkModal(); });
  backdrop.querySelector('#onboarding-link-copy')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(setPasswordUrl);
      showToast('Onboarding link copied to clipboard.', 'success', 'Copied');
    } catch {
      backdrop.querySelector('#onboarding-link-input')?.select();
      showToast('Link selected — press Ctrl+C to copy.', 'info', 'Select Link');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default async function CompaniesPage(container) {
  let companies = [];
  let filtered  = [];
  let activeTab = 'All';
  let viewMode  = localStorage.getItem('hireme_companies_view') || 'table';

  container.innerHTML = `
    <div class="cp-page">

      <!-- ── Page Header ── -->
      <div class="cp-header">
        <div class="cp-header__text">
          <h1>Partner Companies</h1>
          <p>Oversee industry affiliations, verify MOA contracts, and monitor student trainee placements</p>
        </div>
        <div class="cp-header__actions">
          <button class="btn btn--primary btn--sm" id="btn-add-company" style="display:flex;align-items:center;gap:6px;padding:8px 16px;">
            ${icon('plus', 15)} <span>Register Company</span>
          </button>
        </div>
      </div>

      <!-- ── Executive KPI Summary Strip ── -->
      <div class="cp-stats-grid" id="cp-kpi-grid">
        <!-- populated dynamically -->
      </div>

      <!-- ── Control & Filters Bar ── -->
      <div class="cp-controls">
        <!-- Segmented Status Tabs -->
        <div class="cp-tabs" id="cp-status-tabs">
          <!-- populated dynamically -->
        </div>

        <!-- Toolbar Row -->
        <div class="cp-toolbar">
          <div class="cp-toolbar__left">
            <!-- Search -->
            <div class="cp-search">
              <span class="cp-search__icon">${icon('search', 14)}</span>
              <input class="cp-search__input" id="cp-search-input" placeholder="Search by name, industry, or contact..." />
              <button class="cp-search__clear" id="cp-search-clear">${icon('x', 12)}</button>
            </div>

            <!-- Industry Filter -->
            <select class="cp-select" id="cp-filter-industry">
              <option value="">All Industries</option>
            </select>

            <!-- Sort By -->
            <select class="cp-select" id="cp-sort-by">
              <option value="name_asc">Sort: Name (A–Z)</option>
              <option value="name_desc">Sort: Name (Z–A)</option>
              <option value="slots_desc">Most OJT Capacity</option>
              <option value="postings_desc">Most Job Postings</option>
              <option value="rating_desc">Highest Rating</option>
            </select>
          </div>

          <div class="cp-toolbar__right">
            <span class="cp-count" id="cp-results-count"></span>

            <!-- View Switcher -->
            <div class="cp-view-toggle">
              <button class="cp-view-btn ${viewMode === 'table' ? 'cp-view-btn--active' : ''}" id="btn-view-table" title="Table View">
                ${icon('list', 14)} Table
              </button>
              <button class="cp-view-btn ${viewMode === 'grid' ? 'cp-view-btn--active' : ''}" id="btn-view-grid" title="Cards Grid View">
                ${icon('grid', 14)} Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main Results View ── -->
      <div id="cp-content-area"></div>

    </div>
  `;

  renderIcons(container);

  const kpiGrid      = container.querySelector('#cp-kpi-grid');
  const statusTabs   = container.querySelector('#cp-status-tabs');
  const searchInput  = container.querySelector('#cp-search-input');
  const searchClear  = container.querySelector('#cp-search-clear');
  const indSelect    = container.querySelector('#cp-filter-industry');
  const sortSelect   = container.querySelector('#cp-sort-by');
  const countEl      = container.querySelector('#cp-results-count');
  const contentArea  = container.querySelector('#cp-content-area');
  const btnViewTable = container.querySelector('#btn-view-table');
  const btnViewGrid  = container.querySelector('#btn-view-grid');
  const btnAddCo     = container.querySelector('#btn-add-company');

  /* ── Add Company Click ── */
  btnAddCo.addEventListener('click', () => {
    showAddCompanyModal(container, (newCompany) => {
      companies.unshift(normalizeCompanyData(newCompany));
      updateIndustryOptions();
      refreshAll();
    });
  });

  /* ── View Switcher Listeners ── */
  btnViewTable.addEventListener('click', () => {
    viewMode = 'table';
    localStorage.setItem('hireme_companies_view', 'table');
    btnViewTable.classList.add('cp-view-btn--active');
    btnViewGrid.classList.remove('cp-view-btn--active');
    renderMainContent();
  });

  btnViewGrid.addEventListener('click', () => {
    viewMode = 'grid';
    localStorage.setItem('hireme_companies_view', 'grid');
    btnViewGrid.classList.add('cp-view-btn--active');
    btnViewTable.classList.remove('cp-view-btn--active');
    renderMainContent();
  });

  /* ── Search Clear Button ── */
  searchInput.addEventListener('input', () => {
    searchClear.style.display = searchInput.value ? 'flex' : 'none';
    applyFilters();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    searchInput.focus();
    applyFilters();
  });

  /* ── Dropdowns Filter / Sort ── */
  indSelect.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);

  /* ── Populate Industry Options ── */
  function updateIndustryOptions() {
    const currentVal = indSelect.value;
    const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort();
    indSelect.innerHTML = '<option value="">All Industries</option>' +
      industries.map(ind => `<option value="${ind}" ${ind === currentVal ? 'selected' : ''}>${ind}</option>`).join('');
  }

  /* ── Calculate KPIs & Render KPI Strip ── */
  function renderKPIs() {
    const total      = companies.length;
    const active     = companies.filter(c => (c.status || '').toLowerCase() === 'active').length;
    const pending    = companies.filter(c => (c.status || '').toLowerCase() === 'pending').length;
    const totalSlots = companies.reduce((a, c) => a + (c.ojtSlots || 0), 0);
    const totalJobs  = companies.reduce((a, c) => a + (c.activePostings || c.jobPostings || 0), 0);
    const moaReview  = companies.filter(c => {
      const ms = (c.moaStatus || '').toLowerCase();
      return ms === 'expiring soon' || ms === 'expired' || ms === 'pending' || ms === 'requested';
    }).length;

    const cards = [
      {
        id: 'kpi-all',
        tab: 'All',
        label: 'Total Partners',
        val: total.toLocaleString(),
        hint: `${active} active · ${pending} pending`,
        icon: 'building-2',
        color: '#005930',
        bg: 'rgba(0, 89, 48, 0.1)',
      },
      {
        id: 'kpi-active',
        tab: 'Active',
        label: 'Active Partnerships',
        val: active.toLocaleString(),
        hint: 'Verified operational MOA',
        icon: 'shield-check',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.1)',
      },
      {
        id: 'kpi-pending',
        tab: 'Pending',
        label: 'Pending Approvals',
        val: pending.toLocaleString(),
        hint: 'Awaiting review or invitation',
        icon: 'clock',
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.1)',
      },
      {
        id: 'kpi-slots',
        tab: 'All',
        label: 'Total OJT Capacity',
        val: totalSlots.toLocaleString(),
        hint: 'Available trainee slots',
        icon: 'users',
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.1)',
      },
      {
        id: 'kpi-moa',
        tab: 'MOA Attention',
        label: 'MOA Requiring Review',
        val: moaReview.toLocaleString(),
        hint: 'Requested, expiring, or unverified',
        icon: 'file-text',
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.1)',
      },
    ];

    kpiGrid.innerHTML = cards.map(k => `
      <div class="cp-stat-card ${activeTab === k.tab && k.tab !== 'All' ? 'cp-stat-card--active' : ''}" data-kpi-tab="${k.tab}">
        <div class="cp-stat-card__icon" style="background:${k.bg};color:${k.color};">
          ${icon(k.icon, 18)}
        </div>
        <div class="cp-stat-card__content">
          <span class="cp-stat-card__value">${k.val}</span>
          <span class="cp-stat-card__label">${k.label}</span>
          <span class="cp-stat-card__hint">${k.hint}</span>
        </div>
      </div>
    `).join('');

    renderIcons(kpiGrid);

    kpiGrid.querySelectorAll('[data-kpi-tab]').forEach(card => {
      card.addEventListener('click', () => {
        activeTab = card.dataset.kpiTab;
        renderTabs();
        applyFilters();
      });
    });
  }

  /* ── Render Segmented Tabs ── */
  function renderTabs() {
    const total       = companies.length;
    const active      = companies.filter(c => (c.status || '').toLowerCase() === 'active').length;
    const pending     = companies.filter(c => (c.status || '').toLowerCase() === 'pending').length;
    const suspended   = companies.filter(c => {
      const s = (c.status || '').toLowerCase();
      return s === 'suspended' || s === 'inactive';
    }).length;
    const moaReview   = companies.filter(c => {
      const ms = (c.moaStatus || '').toLowerCase();
      return ms === 'expiring soon' || ms === 'expired' || ms === 'pending' || ms === 'requested';
    }).length;

    const tabs = [
      { key: 'All',           label: 'All Partners',        count: total },
      { key: 'Active',        label: 'Active',              count: active },
      { key: 'Pending',       label: 'Pending Review',      count: pending },
      { key: 'Suspended',     label: 'Suspended/Inactive',  count: suspended },
      { key: 'MOA Attention', label: 'MOA Review',          count: moaReview },
    ];

    statusTabs.innerHTML = tabs.map(t => `
      <button class="cp-tab ${activeTab === t.key ? 'cp-tab--active' : ''}" data-tab="${t.key}">
        <span>${t.label}</span>
        <span class="cp-tab__badge">${t.count}</span>
      </button>
    `).join('');

    statusTabs.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        renderTabs();
        renderKPIs();
        applyFilters();
      });
    });
  }

  /* ── Apply Filters & Sorting ── */
  function applyFilters() {
    const q   = searchInput.value.toLowerCase().trim();
    const ind = indSelect.value;
    const sort = sortSelect.value;

    filtered = companies.filter(c => {
      // Tab filter
      const sLower = (c.status || '').toLowerCase();
      const mLower = (c.moaStatus || '').toLowerCase();
      if (activeTab === 'Active' && sLower !== 'active') return false;
      if (activeTab === 'Pending' && sLower !== 'pending') return false;
      if (activeTab === 'Suspended' && sLower !== 'suspended' && sLower !== 'inactive') return false;
      if (activeTab === 'MOA Attention' && !(mLower === 'expiring soon' || mLower === 'expired' || mLower === 'pending' || mLower === 'requested')) return false;

      // Industry filter
      if (ind && c.industry !== ind) return false;

      // Text search
      if (q) {
        const name    = (c.name || '').toLowerCase();
        const sector  = (c.industry || '').toLowerCase();
        const loc     = (c.location || '').toLowerCase();
        const contact = (c.contactPerson || '').toLowerCase();
        const email   = (c.email || '').toLowerCase();
        if (!name.includes(q) && !sector.includes(q) && !loc.includes(q) && !contact.includes(q) && !email.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sort === 'slots_desc') return (b.ojtSlots || 0) - (a.ojtSlots || 0);
      if (sort === 'postings_desc') return ((b.activePostings || b.jobPostings || 0) - (a.activePostings || a.jobPostings || 0));
      if (sort === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    countEl.textContent = `Showing ${filtered.length} of ${companies.length}`;
    renderMainContent();
  }

  /* ── Render Main Content (Table or Grid) ── */
  function renderMainContent() {
    if (!filtered.length) {
      contentArea.innerHTML = `
        <div class="cp-empty">
          <div class="cp-empty__icon">${icon('building-2', 28)}</div>
          <h3 class="cp-empty__title">No Partner Companies Found</h3>
          <p class="cp-empty__text">We couldn't find any companies matching your selected criteria. Try adjusting your search query or status filter.</p>
          <button class="btn btn--outline btn--sm" id="cp-reset-filters">${icon('refresh-cw', 13)} Reset Filters</button>
        </div>
      `;
      renderIcons(contentArea);
      contentArea.querySelector('#cp-reset-filters')?.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        indSelect.value = '';
        activeTab = 'All';
        renderTabs();
        renderKPIs();
        applyFilters();
      });
      return;
    }

    if (viewMode === 'table') {
      renderTableView();
    } else {
      renderGridView();
    }
  }

  /* ── Render Table View ── */
  function renderTableView() {
    contentArea.innerHTML = `
      <div class="cp-table-card">
        <div class="cp-table-responsive">
          <table class="cp-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>MOA Agreement</th>
                <th>Capacity</th>
                <th>Contact Representative</th>
                <th>Account Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="cp-table-tbody">
              ${filtered.map(c => {
                const sc = getStatusConfig(c.status);
                const mc = getMoaConfig(c.moaStatus);
                const avatarStyle = getAvatarStyle(c.name);

                return `
                  <tr data-company-id="${c.id}">
                    <!-- Company Cell -->
                    <td>
                      <div class="cp-company-cell">
                        <div class="cp-avatar" style="background:${avatarStyle.bg};color:${avatarStyle.color};">
                          ${c.name ? c.name[0].toUpperCase() : 'C'}
                        </div>
                        <div class="cp-company-meta">
                          <span class="cp-company-title">
                            ${c.name}
                            ${c.registrationSource === 'self' || (!c.moaFileUrl && c.moaStatus === 'Pending') ? `<span class="cp-tag-self">Self-Registered</span>` : ''}
                          </span>
                          <span class="cp-company-sub">
                            ${c.industry || 'General Industry'} &bull; ${c.location || 'Location Unspecified'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- MOA Cell -->
                    <td>
                      <div class="cp-moa-cell">
                        <span class="cp-moa-badge" style="background:${mc.bg};color:${mc.color};border:1px solid ${mc.border};">
                          <span class="cp-moa-dot" style="background:${mc.color};"></span>
                          ${(c.moaStatus || '').toLowerCase() === 'grace period' ? `Grace Period ${c.activeTrainees ? `(${c.activeTrainees} Active)` : ''}` : (c.moaStatus || 'Pending')}
                        </span>
                        ${c.moaExpiry ? `<span class="cp-moa-date">Expires: ${c.moaExpiry}</span>` : ''}
                      </div>
                    </td>

                    <!-- Capacity -->
                    <td>
                      <div class="cp-capacity-cell">
                        <span class="cp-capacity-chip" title="Active Job Listings">
                          ${icon('briefcase', 12)} ${c.activePostings ?? c.jobPostings ?? 0} jobs
                        </span>
                        <span class="cp-capacity-chip" title="OJT Trainee Capacity">
                          ${icon('users', 12)} ${c.ojtSlots ?? 0} slots
                        </span>
                      </div>
                    </td>

                    <!-- Contact -->
                    <td>
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-weight:var(--weight-medium);font-size:var(--text-xs);">${c.contactPerson || '—'}</span>
                        <span style="font-size:0.7rem;color:var(--text-tertiary);">${c.email || ''}</span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td>
                      <span class="badge" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};">
                        ${c.status}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td style="text-align:right;">
                      <div class="cp-actions-cell">
                        ${c.moaStatus === 'Requested' ? `
                          <button class="cp-action-btn cp-action-btn--primary btn-moa-req" data-id="${c.id}" style="background:#005930;border-color:#005930;color:#fff;font-size:0.72rem;padding:0 8px;gap:4px;" title="Send MOA to Partner Company">
                            ${icon('send', 12)} <span>Send MOA</span>
                          </button>
                        ` : ''}
                        <button class="cp-action-btn cp-action-btn--primary btn-view" data-id="${c.id}" title="View Company Profile">
                          ${icon('eye', 13)} <span>View</span>
                        </button>
                        ${(c.status || '').toLowerCase() === 'pending' ? `
                          <button class="cp-action-btn cp-action-btn--danger btn-del" data-id="${c.id}" data-name="${c.name}" title="Delete Pending Company">
                            ${icon('trash-2', 13)}
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    renderIcons(contentArea);
    attachActionListeners();
  }

  /* ── Render Grid View ── */
  function renderGridView() {
    contentArea.innerHTML = `
      <div class="cp-grid">
        ${filtered.map(c => {
          const sc = getStatusConfig(c.status);
          const mc = getMoaConfig(c.moaStatus);
          const avatarStyle = getAvatarStyle(c.name);

          return `
            <div class="cp-card anim-fade-in-up" data-company-id="${c.id}">
              <div>
                <!-- Card Header -->
                <div class="cp-card__top">
                  <div class="cp-card__identity">
                    <div class="cp-avatar" style="background:${avatarStyle.bg};color:${avatarStyle.color};width:44px;height:44px;font-size:1rem;">
                      ${c.name ? c.name[0].toUpperCase() : 'C'}
                    </div>
                    <div style="min-width:0;">
                      <div class="cp-card__name" title="${c.name}">${c.name}</div>
                      <div class="cp-card__industry">
                        <span>${c.industry || 'General Industry'}</span>
                        <span>&bull;</span>
                        <span>${c.location || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="cp-card__status-wrap">
                    <span class="badge" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};">
                      ${c.status}
                    </span>
                    ${c.registrationSource === 'self' || (!c.moaFileUrl && c.moaStatus === 'Pending') ? `<span class="cp-tag-self">Self-Reg</span>` : ''}
                  </div>
                </div>

                <!-- Metrics Strip -->
                <div class="cp-card__metrics" style="margin-top:14px;">
                  <div class="cp-card__metric-item">
                    <span class="cp-card__metric-val">${c.activePostings ?? c.jobPostings ?? 0}</span>
                    <span class="cp-card__metric-lbl">${icon('briefcase', 10)} Postings</span>
                  </div>
                  <div class="cp-card__metric-item" style="border-left:1px solid var(--border-default);border-right:1px solid var(--border-default);">
                    <span class="cp-card__metric-val">${c.ojtSlots ?? 0}</span>
                    <span class="cp-card__metric-lbl">${icon('users', 10)} OJT Slots</span>
                  </div>
                  <div class="cp-card__metric-item">
                    <span class="cp-card__metric-val" style="color:#F59E0B;">${(c.rating ?? 0).toFixed(1)}</span>
                    <span class="cp-card__metric-lbl">${icon('star', 10)} Rating</span>
                  </div>
                </div>

                <!-- MOA Status Strip -->
                <div class="cp-card__moa-strip" style="margin-top:12px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="cp-moa-dot" style="background:${mc.color};"></span>
                    <span style="font-weight:var(--weight-semibold);color:var(--text-primary);font-size:var(--text-xs);">MOA: ${(c.moaStatus || '').toLowerCase() === 'grace period' ? `Grace Period ${c.activeTrainees ? `(${c.activeTrainees} Trainees)` : ''}` : (c.moaStatus || 'Pending')}</span>
                  </div>
                  <span style="font-size:0.68rem;color:var(--text-tertiary);">${c.moaExpiry ? `Expires: ${c.moaExpiry}` : 'No Expiry Set'}</span>
                </div>

                <!-- Contact Person Row -->
                <div class="cp-card__contact" style="margin-top:12px;">
                  <span style="font-weight:var(--weight-medium);">${icon('user', 11)} ${c.contactPerson || '—'}</span>
                  <a href="mailto:${c.email}" style="color:var(--color-primary);text-decoration:none;font-size:0.7rem;" title="${c.email}">${icon('mail', 11)} Email</a>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="cp-card__actions">
                ${c.moaStatus === 'Requested' ? `
                  <button class="cp-action-btn cp-action-btn--primary btn-moa-req" data-id="${c.id}" style="background:#005930;border-color:#005930;color:#fff;font-size:0.75rem;padding:0 8px;gap:4px;" title="Send MOA to Partner Company">
                    ${icon('send', 12)} Send MOA
                  </button>
                ` : ''}
                <button class="cp-action-btn cp-action-btn--primary btn-view" data-id="${c.id}" style="flex:1;">
                  ${icon('eye', 13)} View Details
                </button>
                ${(c.status || '').toLowerCase() === 'pending' ? `
                  <button class="cp-action-btn cp-action-btn--danger btn-del" data-id="${c.id}" data-name="${c.name}" title="Delete Pending" style="flex-shrink:0;">
                    ${icon('trash-2', 13)}
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    renderIcons(contentArea);
    attachActionListeners();
  }

  /* ── Attach Action Listeners ── */
  function attachActionListeners() {
    // Review MOA Request Click
    contentArea.querySelectorAll('.btn-moa-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const co = companies.find(x => x.id === btn.dataset.id);
        if (co) {
          showModal(co, container, companies, () => {
            renderKPIs();
            renderTabs();
            applyFilters();
          });
        }
      });
    });

    // View Details Click
    contentArea.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const co = companies.find(x => x.id === btn.dataset.id);
        if (co) {
          showModal(co, container, companies, () => {
            renderKPIs();
            renderTabs();
            applyFilters();
          });
        }
      });
    });

    // Delete Pending Company Click
    contentArea.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Are you sure you want to delete pending partner "${name}"?\n\nThis will remove the registration permanently.`)) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span>`;

        try {
          const res = await apiDelete(`/admin/companies/${id}`);
          if (res?.message) {
            showToast(`"${name}" has been deleted.`, 'success');
            companies = companies.filter(x => x.id !== id);
            refreshAll();
            return;
          }
          showToast(res?.message || 'Failed to delete company.', 'error');
        } catch {
          showToast('Network error while attempting to delete company.', 'error');
        }

        btn.disabled = false;
        btn.innerHTML = `${icon('trash-2', 13)}`;
        renderIcons(btn);
      });
    });
  }

  function refreshAll() {
    renderKPIs();
    renderTabs();
    applyFilters();
  }

  /* ── Initial Load & Caching (SWR) ── */
  const cached = getCached('/admin/companies');

  if (cached?.data) {
    const raw = Array.isArray(cached.data) ? cached.data : (cached.data?.companies ?? []);
    companies = raw.map(normalizeCompanyData);
    updateIndustryOptions();
    refreshAll();
  } else {
    contentArea.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:64px 20px;color:var(--text-tertiary);font-size:var(--text-sm);">
        <span class="spinner-sm"></span> Loading partner companies…
      </div>
    `;
  }

  apiGetCached('/admin/companies', {
    onUpdate: (fresh) => {
      const raw = Array.isArray(fresh) ? fresh : (fresh?.companies ?? []);
      companies = raw.map(normalizeCompanyData);
      updateIndustryOptions();
      refreshAll();
    },
  }).then(res => {
    if (!cached && res) {
      const raw = Array.isArray(res) ? res : (res?.companies ?? []);
      companies = raw.map(normalizeCompanyData);
      updateIndustryOptions();
      refreshAll();
    }
  }).catch(() => {
    if (!cached) {
      contentArea.innerHTML = `
        <div class="cp-empty">
          <div class="cp-empty__icon" style="color:var(--color-error);">${icon('alert-triangle', 28)}</div>
          <h3 class="cp-empty__title">Failed to Load Companies</h3>
          <p class="cp-empty__text">Could not connect to the API server. Check your connection or login session.</p>
          <button class="btn btn--primary btn--sm" onclick="window.location.reload()">${icon('refresh-cw', 13)} Retry</button>
        </div>
      `;
      renderIcons(contentArea);
    }
  });
}
