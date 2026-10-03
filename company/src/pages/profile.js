/**
 * CHMSU HireMe — Company Profile Page
 * Like the student "My Portfolio" but for company — shows company info,
 * editable sections (about, contact, jobs posted), and reflects live data.
 */
import { icon } from '../components/icons.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';
import { apiGet } from '../api/client.js';
import { openMoaRequestModal, showPostingRestrictedModal } from '../components/moa-modal.js';

const INDUSTRIES = [
  'Information Technology', 'Business Process Outsourcing', 'Manufacturing',
  'Healthcare', 'Education', 'Finance & Banking', 'Retail & E-Commerce',
  'Construction', 'Agriculture', 'Tourism & Hospitality', 'Government',
  'Non-Profit / NGO', 'Other',
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1,000 employees', '1,000+ employees',
];

const OWNERSHIP_TYPES = [
  'Private Corporation',
  'Public / Listed Company',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit / NGO',
  'Government Agency',
  'Other',
];

let C = {}; // company state
let currentTab = 'about';
let tabContent;

/* ══════════════════════════════════════
   ENTRY POINT
   ══════════════════════════════════════ */
export async function renderCompanyProfile(container) {
  C = getState('company');

  // If profile not completed yet, send to setup
  if (!C.profileCompleted) {
    navigate('/profile-setup');
    return;
  }

  // Try to refresh from API
  try {
    const res = await apiGet('/company/profile');
    if (res.success && res.data) {
      const d = res.data;
      C = {
        ...C,
        name:                 d.company_name        || C.name,
        industry:             d.company_type        || C.industry,
        location:             d.company_location    || C.location,
        companySize:          d.company_size        || C.companySize,
        contactEmail:         d.contact_email       || C.contactEmail,
        contactPhone:         d.contact_phone       || C.contactPhone,
        website:              d.website             || C.website,
        description:          d.description         || C.description,
        logoUrl:              d.logo_url            || C.logoUrl,
        status:               d.status              || C.status,
        moaStatus:            d.moa_status          || C.moaStatus,
        ownershipType:        d.ownership_type      || C.ownershipType,
        yearFounded:          d.year_founded        || C.yearFounded,
        registrationSource:   d.registration_source || C.registrationSource,
        moaRequestedAt:        d.moa_requested_at    || C.moaRequestedAt,
        moaRequestNotes:       d.moa_request_notes   || C.moaRequestNotes,
        canPostOpportunities: d.can_post_opportunities !== undefined
          ? Boolean(d.can_post_opportunities)
          : (Boolean(d.profile_completed) && ['active', 'expiring soon'].includes((d.moa_status || '').toLowerCase())),
        moaStartDate:         d.moa_start_date      || C.moaStartDate,
        moaEndDate:           d.moa_end_date        || C.moaEndDate,
        moaFileUrl:           d.moa_file_url        || C.moaFileUrl,
        profileCompleted:     true,
      };
      setState('company', C);
      localStorage.setItem('hireme_company_user', JSON.stringify(C));
    }
  } catch (_) { /* use cached */ }

  render(container);
}

/* ══════════════════════════════════════
   MAIN RENDER
   ══════════════════════════════════════ */
function render(container) {
  const initials = C.initials || (C.name || 'CO').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Status pill helpers
  const statusColors = { Active: 'success', Pending: 'warning', Suspended: 'danger', Inactive: 'neutral' };
  const moaColors    = { Active: 'success', Accepted: 'success', Requested: 'warning', Pending: 'warning', Expired: 'danger', Rejected: 'danger' };
  const statusPill = (label, map) => {
    const color = map[label] || 'neutral';
    return `<span class="profile-pill profile-pill--${color}"><span class="profile-pill__dot"></span>${escapeHtml(label || '—')}</span>`;
  };

  container.innerHTML = `
    <div class="page-enter">

      <!-- ── Cover ── -->
      <div class="profile-cover">
        <div class="profile-cover__gradient"></div>
      </div>

      <!-- ── Profile Header ── -->
      <div class="profile-header">
        <div class="profile-header__top">
          <div class="profile-header__avatar-wrap">
            <div class="profile-header__avatar" id="profile-avatar">
              ${C.logoUrl
                ? `<img src="${escapeHtml(C.logoUrl)}" alt="${escapeHtml(C.name)}" />`
                : `<span class="profile-header__initials">${initials}</span>`}
            </div>
            <label class="profile-header__avatar-edit" title="Change logo">
              ${icon('camera', 14)}
              <input type="file" accept="image/png,image/jpeg" id="avatar-upload" hidden />
            </label>
          </div>
          <div class="profile-header__name-actions">
            <div>
              <h1 class="profile-header__name" id="profile-company-name">${escapeHtml(C.name)}</h1>
              <p class="profile-header__headline">${escapeHtml(C.industry || '')}${C.companySize ? ' · ' + escapeHtml(C.companySize) : ''}</p>
            </div>
            <div class="profile-header__actions">
              ${!['active', 'expiring soon'].includes((C.moaStatus || '').toLowerCase()) ? `
                ${C.moaStatus === 'Requested' ? `
                  <span class="btn btn--outline btn--sm" style="border-color:#fde68a;background:#fffbeb;color:#b45309;font-weight:700;pointer-events:none;gap:6px;">
                    ${icon('clock', 14)} MOA Requested
                  </span>
                ` : `
                  <button type="button" class="btn btn--outline btn--sm" id="btn-request-moa-profile" style="border-color:#005930;color:#005930;background:rgba(0,89,48,0.06);font-weight:700;gap:6px;">
                    ${icon('fileText', 14)} Request MOA
                  </button>
                `}
              ` : ''}
              <button class="btn btn--primary btn--sm" id="edit-profile-btn">${icon('edit', 16)} Edit Profile</button>
            </div>
          </div>
        </div>
        <div class="profile-header__bottom">
          <div class="profile-header__meta">
            ${C.location    ? `<span class="profile-header__meta-item">${icon('mapPin', 14)} ${escapeHtml(C.location)}</span>` : ''}
            ${C.contactEmail ? `<span class="profile-header__meta-item">${icon('mail', 14)} ${escapeHtml(C.contactEmail)}</span>` : ''}
            ${C.website     ? `<a class="profile-header__meta-item contact-chip contact-chip--link" href="${escapeHtml(C.website)}" target="_blank" rel="noopener">${icon('globe', 14)} ${escapeHtml(C.website)}</a>` : ''}
          </div>
          <div class="profile-header__pills">
            ${C.status    ? statusPill(C.status, statusColors)    : ''}
            ${C.moaStatus ? statusPill((C.moaStatus === 'Requested' ? 'MOA Requested' : C.moaStatus + ' MOA'), moaColors) : ''}
          </div>
        </div>
      </div>

      <!-- ── Stats Bar ── -->
      <div class="profile-stats-bar">
        <div class="profile-stat">
          <span class="profile-stat__value" id="stat-job-postings">—</span>
          <span class="profile-stat__label">Job Postings</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat__value" id="stat-postings">—</span>
          <span class="profile-stat__label">OJT Postings</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat__value" id="stat-trainees">—</span>
          <span class="profile-stat__label">Active Trainees</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat__value" id="stat-applicants">—</span>
          <span class="profile-stat__label">Applications</span>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="profile-tabs" id="profile-tabs">
        <button class="profile-tabs__item ${currentTab === 'about'        ? 'profile-tabs__item--active' : ''}" data-tab="about">
          ${icon('building', 15)} About
        </button>
        <button class="profile-tabs__item ${currentTab === 'job-postings' ? 'profile-tabs__item--active' : ''}" data-tab="job-postings">
          ${icon('briefcase', 15)} Job Postings
        </button>
        <button class="profile-tabs__item ${currentTab === 'ojt-postings' ? 'profile-tabs__item--active' : ''}" data-tab="ojt-postings">
          ${icon('graduationCap', 15)} OJT Postings
        </button>
        <button class="profile-tabs__item ${currentTab === 'ojt'          ? 'profile-tabs__item--active' : ''}" data-tab="ojt">
          ${icon('clipboardList', 15)} Trainees
        </button>
        <button class="profile-tabs__item ${currentTab === 'contact'      ? 'profile-tabs__item--active' : ''}" data-tab="contact">
          ${icon('mail', 15)} Contact
        </button>
      </div>

      <!-- ── Tab Content ── -->
      <div class="profile-tab-content" id="tab-content"></div>
    </div>
  `;

  tabContent = container.querySelector('#tab-content');
  renderTab(currentTab);

  // Tab switching
  container.querySelectorAll('.profile-tabs__item').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      container.querySelectorAll('.profile-tabs__item').forEach(t => t.classList.remove('profile-tabs__item--active'));
      btn.classList.add('profile-tabs__item--active');
      renderTab(currentTab);
    });
  });

  // Edit profile
  container.querySelector('#edit-profile-btn')?.addEventListener('click', () => openEditModal());

  // Request MOA button in header
  container.querySelector('#btn-request-moa-profile')?.addEventListener('click', () => {
    openMoaRequestModal({
      onSuccess: () => {
        renderCompanyProfile(container);
      }
    });
  });

  // Logo upload via camera button
  const avatarUpload = container.querySelector('#avatar-upload');
  avatarUpload?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.', 'error'); return; }
    const fd = new FormData();
    fd.append('logo', file);
    fd.append('company_name', C.name);
    fd.append('company_type', C.industry);
    fd.append('company_size', C.companySize);
    fd.append('company_location', C.location);
    fd.append('contact_email', C.contactEmail);
    const token = localStorage.getItem('hireme_token');
    try {
      const res = await fetch('http://localhost:8000/api/company/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.data.logo_url) {
        C.logoUrl = json.data.logo_url;
        setState('company', C);
        const av = container.querySelector('#profile-avatar');
        if (av) av.innerHTML = `<img src="${escapeHtml(C.logoUrl)}" alt="${escapeHtml(C.name)}" />`;
        showToast('Logo updated!');
      }
    } catch { showToast('Logo upload failed.', 'error'); }
  });

  // Load stats async
  loadStats(container);
}

async function loadStats(container) {
  try {
    const [postRes, traineeRes, jobRes] = await Promise.all([
      apiGet('/company/ojt-postings').catch(() => null),
      apiGet('/company/ojt-trainees').catch(() => null),
      apiGet('/company/jobs').catch(() => null),
    ]);
    const ojtPostings = postRes?.success  ? (postRes.data  || []) : [];
    const groups      = traineeRes?.success ? (traineeRes.data || []) : [];
    const jobPostings = jobRes?.success   ? (jobRes.data   || []) : [];
    const trainees    = groups.reduce((s, g) => s + (g.trainees?.length || 0), 0);
    const applicants  = jobPostings.reduce((s, j) => s + (j.applicant_count || 0), 0);
    const statJobPost = container.querySelector('#stat-job-postings');
    const statPost    = container.querySelector('#stat-postings');
    const statTrain   = container.querySelector('#stat-trainees');
    const statAppl    = container.querySelector('#stat-applicants');
    if (statJobPost) statJobPost.textContent = jobPostings.length;
    if (statPost)    statPost.textContent    = ojtPostings.length;
    if (statTrain)   statTrain.textContent   = trainees;
    if (statAppl)    statAppl.textContent    = applicants;
  } catch { /* silently ignore */ }
}

/* ══════════════════════════════════════
   TAB RENDERER
   ══════════════════════════════════════ */
function renderTab(tab) {
  switch (tab) {
    case 'about':        renderAboutTab(); break;
    case 'job-postings': renderJobPostingsTab(); break;
    case 'ojt-postings': renderOjtPostingsTab(); break;
    case 'ojt':          renderOjtTab(); break;
    case 'contact':      renderContactTab(); break;
  }
}

/* ── About Tab ── */
function renderAboutTab() {
  tabContent.innerHTML = `
    <div class="animate-fade-in-up">
      <!-- Description / About -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('building', 20)} About the Company</h3>
          <button class="btn btn--secondary btn--sm" id="edit-desc-btn">${icon('edit', 14)} Edit</button>
        </div>
        <p class="profile-section__bio" id="company-desc-text">
          ${C.description
            ? escapeHtml(C.description)
            : '<span class="text-tertiary">No description yet. Click Edit to add one.</span>'}
        </p>
        <div class="profile-contact-grid mt-2">
          ${C.website      ? `<a class="contact-chip contact-chip--link" href="${escapeHtml(C.website)}" target="_blank" rel="noopener">${icon('globe', 13)} ${escapeHtml(C.website)}</a>` : ''}
          ${C.location     ? `<span class="contact-chip">${icon('mapPin', 13)} ${escapeHtml(C.location)}</span>` : ''}
          ${C.contactPhone ? `<span class="contact-chip">${icon('phone', 13)} ${escapeHtml(C.contactPhone)}</span>` : ''}
        </div>
      </div>

      <!-- Company Details grid -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('settings', 20)} Company Details</h3>
          <button class="btn btn--secondary btn--sm" id="edit-details-btn">${icon('edit', 14)} Edit</button>
        </div>
        <div class="cp-details-grid">
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('briefcase', 14)} Industry</span>
            <span class="cp-detail-item__value" id="detail-industry">${escapeHtml(C.industry || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('users', 14)} Company Size</span>
            <span class="cp-detail-item__value" id="detail-size">${escapeHtml(C.companySize || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('building', 14)} Ownership Type</span>
            <span class="cp-detail-item__value" id="detail-ownership">${escapeHtml(C.ownershipType || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('calendar', 14)} Year Founded</span>
            <span class="cp-detail-item__value" id="detail-year">${escapeHtml(C.yearFounded || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('mapPin', 14)} Location</span>
            <span class="cp-detail-item__value" id="detail-location">${escapeHtml(C.location || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('globe', 14)} Website</span>
            <span class="cp-detail-item__value" id="detail-website">
              ${C.website
                ? `<a href="${escapeHtml(C.website)}" target="_blank" rel="noopener" class="link">${escapeHtml(C.website)}</a>`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      <!-- MOA Partnership Agreement Section -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('fileText', 20)} Memorandum of Agreement (MOA)</h3>
          ${(C.moaStatus || '').toLowerCase() === 'active' ? `
            <span class="badge badge--success" style="font-weight:700;">✓ Active Partnership</span>
          ` : (C.moaStatus === 'Requested' ? `
            <span class="badge badge--warning" style="font-weight:700;background:#fef3c7;color:#b45309;">⏳ Under CIER Review</span>
          ` : `
            <button type="button" class="btn btn--primary btn--sm" id="btn-about-request-moa" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;">
              ${icon('send', 13)} Request MOA
            </button>
          `)}
        </div>

        <div style="background:var(--bg-secondary);padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <span style="font-size:0.8rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;font-weight:600;display:block;">Partnership Status</span>
              <strong style="font-size:1rem;color:var(--text-primary);">${C.moaStatus || 'Pending'}</strong>
            </div>
            ${C.moaFileUrl ? `
              <a href="${escapeHtml(C.moaFileUrl)}" target="_blank" rel="noopener" class="btn btn--outline btn--sm" style="gap:6px;">
                ${icon('externalLink', 13)} View MOA Document
              </a>
            ` : ''}
          </div>

          ${C.moaStartDate || C.moaEndDate ? `
            <div style="font-size:0.82rem;color:var(--text-secondary);">
              Contract Duration: <strong>${C.moaStartDate || '—'}</strong> to <strong>${C.moaEndDate || '—'}</strong>
            </div>
          ` : ''}

          ${(C.moaStatus || '').toLowerCase() === 'active' ? `
            <p style="margin:0;font-size:0.84rem;color:var(--color-success);line-height:1.5;">
              ✓ Your company holds a verified Memorandum of Agreement with CHMSU CIER. OJT trainee slot and job vacancy postings are enabled.
            </p>
          ` : (C.moaStatus === 'Requested' ? `
            <p style="margin:0;font-size:0.84rem;color:#b45309;line-height:1.5;">
              ⏳ Your MOA partnership request is currently being reviewed by the CHMSU CIER administrative office. You will be notified once the agreement document is approved and uploaded.
            </p>
          ` : `
            <p style="margin:0;font-size:0.84rem;color:var(--text-secondary);line-height:1.5;">
              As a self-registered industry partner, an official Memorandum of Agreement (MOA) between your organization and CHMSU is required to unlock job and OJT opportunity postings.
            </p>
          `)}
        </div>
      </div>
    </div>
  `;

  tabContent.querySelector('#edit-desc-btn')?.addEventListener('click', () => openAboutCompanyModal());
  tabContent.querySelector('#edit-details-btn')?.addEventListener('click', () => openAboutCompanyModal());
  tabContent.querySelector('#btn-about-request-moa')?.addEventListener('click', () => {
    openMoaRequestModal({
      onSuccess: () => {
        renderCompanyProfile(container);
      }
    });
  });
}

/* ── Job Postings Tab (regular hiring jobs) ── */
async function renderJobPostingsTab() {
  tabContent.innerHTML = `<div class="loading-spinner" style="padding:2rem;text-align:center;">${icon('loader', 24)} Loading…</div>`;

  try {
    const res = await apiGet('/company/jobs');
    const jobs = res.success ? (res.data || []) : [];

    const statusBadge = s => {
      const map = { open: 'success', closed: 'neutral', draft: 'warning', filled: 'accent' };
      return `<span class="badge badge--${map[s] || 'neutral'}">${s}</span>`;
    };

    tabContent.innerHTML = `
      <div class="animate-fade-in-up">
        <div class="profile-section">
          <div class="profile-section__header">
            <h3 class="profile-section__title">${icon('briefcase', 20)} Job Postings</h3>
            ${C.canPostOpportunities 
              ? `<a href="#/post-job" class="btn btn--primary btn--sm">${icon('plus', 14)} Post a Job</a>`
              : `<button type="button" class="btn btn--primary btn--sm" id="btn-profile-post-job">${icon('plus', 14)} Post a Job</button>`
            }
          </div>
          <div id="job-postings-list">
            ${jobs.length === 0
              ? `<div class="empty-state">${icon('inbox', 32)}<p class="text-secondary mt-2">No job postings yet.</p></div>`
              : jobs.map(j => `
                <div class="cp-posting-card">
                  <div class="cp-posting-card__header">
                    <div>
                      <h4 class="cp-posting-card__title">${escapeHtml(j.title)}</h4>
                      <p class="cp-posting-card__meta">
                        ${j.department ? `${icon('building', 13)} ${escapeHtml(j.department)} &nbsp;·&nbsp;` : ''}
                        ${icon('mapPin', 13)} ${escapeHtml(j.location || '—')} &nbsp;·&nbsp;
                        ${icon('briefcase', 13)} ${escapeHtml(j.employment_type || j.type || '—')}
                        ${j.applicant_count != null ? ` &nbsp;·&nbsp; ${icon('users', 13)} ${j.applicant_count} applicant${j.applicant_count !== 1 ? 's' : ''}` : ''}
                      </p>
                    </div>
                    ${statusBadge(j.status || 'open')}
                  </div>
                  ${j.description ? `<p class="cp-posting-card__desc">${escapeHtml(j.description.slice(0, 140))}${j.description.length > 140 ? '…' : ''}</p>` : ''}
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    `;

    tabContent.querySelector('#btn-profile-post-job')?.addEventListener('click', () => {
      showPostingRestrictedModal('post a job');
    });
  } catch (_) {
    tabContent.innerHTML = `<p class="text-danger">Failed to load job postings.</p>`;
  }
}

/* ── OJT Postings Tab ── */
async function renderOjtPostingsTab() {
  tabContent.innerHTML = `<div class="loading-spinner" style="padding:2rem;text-align:center;">${icon('loader', 24)} Loading…</div>`;

  try {
    const res = await apiGet('/company/ojt-postings');
    const postings = res.success ? (res.data || []) : [];

    tabContent.innerHTML = `
      <div class="animate-fade-in-up">
        <div class="profile-section">
          <div class="profile-section__header">
            <h3 class="profile-section__title">${icon('graduationCap', 20)} OJT Postings</h3>
            ${C.canPostOpportunities
              ? `<a href="#/ojt-slots" class="btn btn--primary btn--sm">${icon('plus', 14)} Post OJT Slot</a>`
              : `<button type="button" class="btn btn--primary btn--sm" id="btn-profile-post-ojt">${icon('plus', 14)} Post OJT Slot</button>`
            }
          </div>
          <div id="ojt-postings-list">
            ${postings.length === 0
              ? `<div class="empty-state">${icon('inbox', 32)}<p class="text-secondary mt-2">No OJT postings yet.</p></div>`
              : postings.map(p => `
                <div class="cp-posting-card">
                  <div class="cp-posting-card__header">
                    <div>
                      <h4 class="cp-posting-card__title">${escapeHtml(p.title)}</h4>
                      <p class="cp-posting-card__meta">
                        ${icon('mapPin', 13)} ${escapeHtml(p.location || '—')} &nbsp;·&nbsp;
                        ${icon('clock', 13)} ${escapeHtml(p.duration || '—')} &nbsp;·&nbsp;
                        ${icon('users', 13)} ${p.slots_remaining ?? p.slots_total} / ${p.slots_total} slots
                      </p>
                    </div>
                    <span class="badge badge--${p.status === 'open' ? 'success' : p.status === 'filling_up' ? 'warning' : 'neutral'}">${p.status}</span>
                  </div>
                  ${p.description ? `<p class="cp-posting-card__desc">${escapeHtml(p.description.slice(0, 140))}${p.description.length > 140 ? '…' : ''}</p>` : ''}
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    `;

    tabContent.querySelector('#btn-profile-post-ojt')?.addEventListener('click', () => {
      showPostingRestrictedModal('post an OJT slot');
    });
  } catch (_) {
    tabContent.innerHTML = `<div class="empty-state">${icon('alertCircle', 32)}<p class="text-secondary mt-2">Could not load OJT postings.</p></div>`;
  }
}

/* ── OJT Tab (accepted trainees summary) ── */
async function renderOjtTab() {
  tabContent.innerHTML = `<div class="loading-spinner" style="padding:2rem;text-align:center;">${icon('loader', 24)} Loading…</div>`;

  try {
    const res = await apiGet('/company/ojt-trainees');
    const groups = res.success ? (res.data || []) : [];
    const totalTrainees = groups.reduce((sum, g) => sum + (g.trainees?.length || 0), 0);

    tabContent.innerHTML = `
      <div class="animate-fade-in-up">
        <div class="profile-section">
          <div class="profile-section__header">
            <h3 class="profile-section__title">${icon('clipboardList', 20)} OJT Trainees</h3>
            <span class="badge badge--accent">${totalTrainees} total</span>
          </div>
          ${groups.length === 0
            ? `<div class="empty-state">${icon('inbox', 32)}<p class="text-secondary mt-2">No accepted trainees yet.</p></div>`
            : groups.map(g => `
              <div class="cp-trainee-group">
                <h4 class="cp-trainee-group__title">${escapeHtml(g.posting.title)}</h4>
                <div class="cp-trainee-list">
                  ${g.trainees.map(t => `
                    <div class="cp-trainee-item">
                      <div class="cp-trainee-item__avatar">${t.student.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                      <div class="cp-trainee-item__info">
                        <span class="cp-trainee-item__name">${escapeHtml(t.student.name)}</span>
                        <span class="cp-trainee-item__meta">${escapeHtml(t.student.program)} · ${escapeHtml(t.student.year_level)}</span>
                      </div>
                      <span class="badge badge--success">Accepted</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  } catch (_) {
    tabContent.innerHTML = `<div class="empty-state">${icon('alertCircle', 32)}<p class="text-secondary mt-2">Could not load trainees.</p></div>`;
  }
}

/* ── Contact Tab ── */
function renderContactTab() {
  tabContent.innerHTML = `
    <div class="animate-fade-in-up">
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('mail', 20)} Contact Information</h3>
          <button class="btn btn--secondary btn--sm" id="edit-contact-btn">${icon('edit', 14)} Edit</button>
        </div>
        <div class="profile-contact-grid" style="margin-bottom:var(--space-4);">
          ${C.contactEmail ? `<a class="contact-chip contact-chip--link" href="mailto:${escapeHtml(C.contactEmail)}">${icon('mail', 13)} ${escapeHtml(C.contactEmail)}</a>` : ''}
          ${C.contactPhone ? `<span class="contact-chip">${icon('phone', 13)} ${escapeHtml(C.contactPhone)}</span>` : ''}
          ${C.website      ? `<a class="contact-chip contact-chip--link" href="${escapeHtml(C.website)}" target="_blank" rel="noopener">${icon('globe', 13)} ${escapeHtml(C.website)}</a>` : ''}
          ${C.location     ? `<span class="contact-chip">${icon('mapPin', 13)} ${escapeHtml(C.location)}</span>` : ''}
        </div>
        <div class="cp-details-grid">
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('mail', 14)} Contact Email</span>
            <span class="cp-detail-item__value">${escapeHtml(C.contactEmail || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('phone', 14)} Contact Phone</span>
            <span class="cp-detail-item__value">${escapeHtml(C.contactPhone || '—')}</span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('globe', 14)} Website</span>
            <span class="cp-detail-item__value">
              ${C.website
                ? `<a href="${escapeHtml(C.website)}" target="_blank" rel="noopener" class="link">${escapeHtml(C.website)}</a>`
                : '—'}
            </span>
          </div>
          <div class="cp-detail-item">
            <span class="cp-detail-item__label">${icon('mapPin', 14)} Address</span>
            <span class="cp-detail-item__value">${escapeHtml(C.location || '—')}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  tabContent.querySelector('#edit-contact-btn')?.addEventListener('click', () => openEditModal());
}

/* ══════════════════════════════════════
   MODALS
   ══════════════════════════════════════ */
function openModal({ title, body, onSave }) {
  const existing = document.getElementById('cp-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cp-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close btn btn--icon" aria-label="Close">${icon('x', 18)}</button>
      </div>
      <form id="cp-modal-form" class="modal-body" novalidate>
        <p class="modal-error" style="color:var(--color-error,#EF4444);font-size:.85rem;min-height:1.2em;margin-bottom:.5rem;"></p>
        ${body}
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="modal-save-btn">Save Changes</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').onclick = close;
  overlay.querySelector('.modal-cancel-btn').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#cp-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = overlay.querySelector('#modal-save-btn');
    const errEl   = overlay.querySelector('.modal-error');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try {
      await onSave(e.target, overlay);
      close();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      if (errEl) errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

/* ── Full Edit Profile Modal ── */
function openEditModal() {
  const logoPreviewHtml = C.logoUrl
    ? `<img src="${C.logoUrl}" alt="Logo" style="width:64px;height:64px;border-radius:50%;object-fit:cover;" />`
    : `<div style="width:64px;height:64px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;">${C.initials || 'CO'}</div>`;

  openModal({
    title: `${icon('edit', 18)} Edit Company Profile`,
    body: `
      <!-- Logo upload -->
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
        <div id="modal-logo-preview">${logoPreviewHtml}</div>
        <div>
          <button type="button" class="btn btn--outline btn--sm" id="modal-upload-logo-btn">${icon('upload', 14)} Change Logo</button>
          <p class="text-xs text-tertiary mt-1">PNG, JPG up to 2MB</p>
          <input type="file" id="modal-logo-input" accept="image/png,image/jpeg" hidden />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Company Name *</label>
          <input class="form-input" name="company_name" required value="${escapeHtml(C.name)}" placeholder="Company name" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Industry *</label>
          <select class="form-select" name="company_type" required>
            <option value="">Select industry</option>
            ${INDUSTRIES.map(i => `<option value="${i}" ${C.industry === i ? 'selected' : ''}>${i}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Company Size *</label>
          <select class="form-select" name="company_size" required>
            <option value="">Select size</option>
            ${COMPANY_SIZES.map(s => `<option value="${s}" ${C.companySize === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Address / Location *</label>
        <input class="form-input" name="company_location" required value="${escapeHtml(C.location)}" placeholder="e.g. Cebu City, Philippines" />
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Contact Email *</label>
          <input class="form-input" name="contact_email" type="email" required value="${escapeHtml(C.contactEmail)}" placeholder="hr@company.com" />
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Contact Phone</label>
          <input class="form-input" name="contact_phone" type="tel" value="${escapeHtml(C.contactPhone)}" placeholder="+63 912 345 6789" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Website</label>
        <input class="form-input" name="website" type="url" value="${escapeHtml(C.website)}" placeholder="https://yourcompany.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Company Description</label>
        <textarea class="form-textarea" name="description" rows="4" placeholder="Describe your company…">${escapeHtml(C.description)}</textarea>
      </div>
    `,
    onSave: async (form) => {
      const data = new FormData();
      data.append('company_name',     form.company_name.value.trim());
      data.append('company_type',     form.company_type.value);
      data.append('company_size',     form.company_size.value);
      data.append('company_location', form.company_location.value.trim());
      data.append('contact_email',    form.contact_email.value.trim());
      if (form.contact_phone.value) data.append('contact_phone', form.contact_phone.value.trim());
      if (form.website.value)       data.append('website', form.website.value.trim());
      if (form.description.value)   data.append('description', form.description.value.trim());

      // Attach logo file if changed
      const logoInput = document.getElementById('modal-logo-input');
      if (logoInput?.files?.[0]) data.append('logo', logoInput.files[0]);

      if (!form.company_name.value.trim()) throw new Error('Company name is required.');
      if (!form.company_type.value)        throw new Error('Please select an industry.');
      if (!form.company_size.value)        throw new Error('Please select a company size.');
      if (!form.company_location.value.trim()) throw new Error('Address is required.');
      if (!form.contact_email.value.trim()) throw new Error('Contact email is required.');

      const token = localStorage.getItem('hireme_token');
      const res = await fetch('http://localhost:8000/api/company/profile', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: data,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || (json.errors ? Object.values(json.errors).flat().join(' ') : 'Save failed.');
        throw new Error(msg);
      }

      const cp = json.data;
      const initials = cp.company_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      C = {
        ...C,
        name:          cp.company_name,
        initials,
        industry:      cp.company_type,
        location:      cp.company_location,
        companySize:   cp.company_size,
        contactEmail:  cp.contact_email,
        contactPhone:  cp.contact_phone || '',
        website:       cp.website || '',
        description:   cp.description || '',
        logoUrl:       cp.logo_url || C.logoUrl,
        profileCompleted: true,
      };
      setState('company', C);
      localStorage.setItem('hireme_company_user', JSON.stringify(C));

      showToast('Profile updated!');

      // Re-render page and sidebar
      const mainContent = document.getElementById('main-content');
      if (mainContent) render(mainContent);

      import('../components/sidebar-left.js').then(({ createLeftSidebar }) => {
        const old = document.getElementById('sidebar-left');
        if (old) old.replaceWith(createLeftSidebar());
      });
    },
  });

  // Wire up logo file input inside modal
  requestAnimationFrame(() => {
    const uploadBtn = document.getElementById('modal-upload-logo-btn');
    const logoInput = document.getElementById('modal-logo-input');
    if (uploadBtn && logoInput) {
      uploadBtn.addEventListener('click', () => logoInput.click());
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('modal-logo-preview');
          if (preview) preview.innerHTML = `<img src="${ev.target.result}" alt="Logo" style="width:64px;height:64px;border-radius:50%;object-fit:cover;" />`;
        };
        reader.readAsDataURL(file);
      });
    }
  });
}

/* ── Redesigned About Company Modal ── */
function openAboutCompanyModal() {
  const existing = document.getElementById('about-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'about-modal-overlay';
  overlay.className = 'about-modal-overlay';

  const descVal = C.description || '';
  const descLen = descVal.length;

  overlay.innerHTML = `
    <div class="about-modal-box" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
      <!-- Header -->
      <div class="about-modal-header">
        <div class="about-modal-header__info">
          <div class="about-modal-header__icon">
            ${icon('building', 22)}
          </div>
          <div>
            <h3 class="about-modal-header__title" id="about-modal-title">Edit About Company</h3>
            <p class="about-modal-header__subtitle">Update your company story, mission, and key organizational details</p>
          </div>
        </div>
        <button type="button" class="about-modal-close" aria-label="Close dialog" id="about-modal-close-btn">
          ${icon('x', 18)}
        </button>
      </div>

      <!-- Form Body -->
      <form id="about-modal-form" novalidate style="display:flex;flex-direction:column;flex:1;overflow:hidden;margin:0;">
        <div class="about-modal-body">
          <!-- Error alert -->
          <div class="about-modal-error" id="about-form-error" role="alert">
            ${icon('alertCircle', 18)}
            <span id="about-error-text"></span>
          </div>

          <!-- Card 1: Overview / Bio -->
          <div class="about-card">
            <div class="about-card__header">
              <h4 class="about-card__title">
                ${icon('fileText', 16)} Company Overview & Mission
              </h4>
              <span class="about-card__badge">Public Profile</span>
            </div>
            
            <textarea
              class="about-modal-textarea"
              name="description"
              id="about-desc-textarea"
              maxlength="2000"
              rows="5"
              placeholder="Tell applicants, students, and visitors about your company, core mission, company culture, and why they should join your team..."
            >${escapeHtml(descVal)}</textarea>

            <div class="about-modal-char-row">
              <div class="about-prompt-chips">
                <span class="text-xs text-tertiary" style="margin-right:2px;">Quick templates:</span>
                <button type="button" class="about-prompt-chip" data-template="mission">+ Mission</button>
                <button type="button" class="about-prompt-chip" data-template="culture">+ Culture</button>
                <button type="button" class="about-prompt-chip" data-template="values">+ Core Values</button>
              </div>
              <span class="about-modal-char-count" id="about-char-count">${descLen} / 2000</span>
            </div>
          </div>

          <!-- Card 2: Company Details -->
          <div class="about-card">
            <div class="about-card__header">
              <h4 class="about-card__title">
                ${icon('settings', 16)} Company Details & Highlights
              </h4>
            </div>

            <div class="about-modal-grid">
              <!-- Industry -->
              <div class="about-field-group">
                <label class="about-field-label">Industry</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('briefcase', 15)}</span>
                  <select class="about-input form-select" name="industry">
                    <option value="">Select industry</option>
                    ${INDUSTRIES.map(i => `<option value="${i}" ${C.industry === i ? 'selected' : ''}>${i}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Company Size -->
              <div class="about-field-group">
                <label class="about-field-label">Company Size</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('users', 15)}</span>
                  <select class="about-input form-select" name="company_size">
                    <option value="">Select size</option>
                    ${COMPANY_SIZES.map(s => `<option value="${s}" ${C.companySize === s ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Ownership Type -->
              <div class="about-field-group">
                <label class="about-field-label">Ownership Type</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('building', 15)}</span>
                  <select class="about-input form-select" name="ownership_type">
                    <option value="">Select ownership</option>
                    ${OWNERSHIP_TYPES.map(o => `<option value="${o}" ${(C.ownershipType || 'Private Corporation') === o ? 'selected' : ''}>${o}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Year Founded -->
              <div class="about-field-group">
                <label class="about-field-label">Year Founded</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('calendar', 15)}</span>
                  <input
                    type="number"
                    min="1800"
                    max="${new Date().getFullYear()}"
                    class="about-input"
                    name="year_founded"
                    value="${escapeHtml(C.yearFounded || '')}"
                    placeholder="e.g. 2015"
                  />
                </div>
              </div>

              <!-- Address / Location -->
              <div class="about-field-group about-field-group--full">
                <label class="about-field-label">Location / Headquarters</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('mapPin', 15)}</span>
                  <input
                    type="text"
                    class="about-input"
                    name="location"
                    value="${escapeHtml(C.location || '')}"
                    placeholder="e.g. Bacolod City, Negros Occidental"
                  />
                </div>
              </div>

              <!-- Website -->
              <div class="about-field-group">
                <label class="about-field-label">Website URL</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('globe', 15)}</span>
                  <input
                    type="text"
                    class="about-input"
                    name="website"
                    value="${escapeHtml(C.website || '')}"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <!-- Contact Phone -->
              <div class="about-field-group">
                <label class="about-field-label">Contact Phone</label>
                <div class="about-input-wrap">
                  <span class="about-input-icon">${icon('phone', 15)}</span>
                  <input
                    type="tel"
                    class="about-input"
                    name="contact_phone"
                    value="${escapeHtml(C.contactPhone || '')}"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pinned Footer -->
        <div class="about-modal-footer">
          <div class="about-modal-footer__hint">
            ${icon('info', 14)} <span>Changes update immediately on your profile</span>
          </div>
          <div class="about-modal-footer__actions">
            <button type="button" class="btn btn--ghost" id="about-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn--primary" id="about-modal-save-btn">
              ${icon('check', 16)} <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.about-modal-box')?.classList.add('about-modal-box--visible'));

  // Close helper
  const closeModal = () => {
    const box = overlay.querySelector('.about-modal-box');
    if (box) box.classList.remove('about-modal-box--visible');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('#about-modal-close-btn')?.addEventListener('click', closeModal);
  overlay.querySelector('#about-modal-cancel-btn')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKeyDown);
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // Character counter
  const textarea = overlay.querySelector('#about-desc-textarea');
  const counter = overlay.querySelector('#about-char-count');
  if (textarea && counter) {
    const updateCount = () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 2000`;
      counter.classList.toggle('about-modal-char-count--warn', len >= 1800 && len < 2000);
      counter.classList.toggle('about-modal-char-count--over', len >= 2000);
    };
    textarea.addEventListener('input', updateCount);

    // Quick templates
    overlay.querySelectorAll('.about-prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.template;
        let snippet = '';
        if (type === 'mission') {
          snippet = '\nOur Mission: To drive innovation and provide industry-leading solutions that empower students and communities.';
        } else if (type === 'culture') {
          snippet = '\nOur Culture: We value collaborative growth, continuous learning, integrity, and student mentorship.';
        } else if (type === 'values') {
          snippet = '\nCore Values: Excellence, Integrity, Innovation, Mentorship, Teamwork.';
        }
        if (textarea.value.trim().length > 0) {
          textarea.value = textarea.value.trim() + '\n' + snippet.trim();
        } else {
          textarea.value = snippet.trim();
        }
        updateCount();
        textarea.focus();
      });
    });
  }

  // Submit handler
  const form = overlay.querySelector('#about-modal-form');
  const errorAlert = overlay.querySelector('#about-form-error');
  const errorText = overlay.querySelector('#about-error-text');
  const saveBtn = overlay.querySelector('#about-modal-save-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorAlert) errorAlert.style.display = 'none';

    let websiteVal = form.website.value.trim();
    if (websiteVal && !/^https?:\/\//i.test(websiteVal)) {
      websiteVal = 'https://' + websiteVal;
    }

    const payload = {
      description:      form.description.value.trim(),
      company_type:     form.industry.value,
      company_size:     form.company_size.value,
      ownership_type:   form.ownership_type.value,
      year_founded:     form.year_founded.value.trim(),
      company_location: form.location.value.trim(),
      website:          websiteVal,
      contact_phone:    form.contact_phone.value.trim(),
      company_name:     C.name || '',
      contact_email:    C.contactEmail || C.email || '',
    };

    saveBtn.disabled = true;
    saveBtn.innerHTML = `${icon('loader', 16)} <span>Saving…</span>`;

    try {
      const token = localStorage.getItem('hireme_token');
      const res = await fetch('http://localhost:8000/api/company/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || (json.errors ? Object.values(json.errors).flat().join(' ') : 'Save failed.');
        throw new Error(msg);
      }

      const d = json.data || {};
      C = {
        ...C,
        description:   d.description !== undefined ? d.description : payload.description,
        industry:      d.company_type || payload.company_type || C.industry,
        companySize:   d.company_size || payload.company_size || C.companySize,
        location:      d.company_location || payload.company_location || C.location,
        website:       d.website !== undefined ? d.website : payload.website,
        contactPhone:  d.contact_phone !== undefined ? d.contact_phone : payload.contact_phone,
        ownershipType: d.ownership_type || payload.ownership_type || C.ownershipType,
        yearFounded:   d.year_founded || payload.year_founded || C.yearFounded,
      };
      setState('company', C);
      localStorage.setItem('hireme_company_user', JSON.stringify(C));

      // Live update profile header
      const headlineEl = document.querySelector('.profile-header__headline');
      if (headlineEl) {
        headlineEl.textContent = `${C.industry || ''}${C.companySize ? ' · ' + C.companySize : ''}`;
      }

      showToast('About Company updated successfully!');
      closeModal();
      renderAboutTab();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${icon('check', 16)} <span>Save Changes</span>`;
      if (errorAlert && errorText) {
        errorText.textContent = err.message || 'Failed to save changes. Please try again.';
        errorAlert.style.display = 'flex';
      }
    }
  });
}

function openDescriptionModal() {
  openAboutCompanyModal();
}

/* ══════════════════════════════════════
   HELPERS
   ══════════════════════════════════════ */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'alertCircle', 16)} <span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 300); }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
