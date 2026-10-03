/**
 * CHMSU HireMe — Company Dashboard Page (Executive Redesign)
 * Supports Instant Cache Rendering & Background SWR
 */
import { icon } from '../components/icons.js';
import { apiGet, apiFetch, apiCache } from '../api/client.js';
import { getState, setState } from '../store.js';
import { openMoaRequestModal, showPostingRestrictedModal } from '../components/moa-modal.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMoaBanner(company) {
  const isCompleted = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';
  const isMoaValid = ['active', 'expiring soon'].includes(moaStatus.toLowerCase());
  const canPost = company.canPostOpportunities !== undefined
    ? Boolean(company.canPostOpportunities)
    : (isCompleted && isMoaValid);

  if (canPost) {
    return '';
  }

  if (!isCompleted) {
    return `
      <div class="moa-dash-banner" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="display:flex;align-items:center;gap:14px;max-width:720px;">
          <div style="width:40px;height:40px;border-radius:10px;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('alertCircle', 20)}
          </div>
          <div>
            <h4 style="margin:0 0 3px;font-size:0.95rem;font-weight:700;color:#92400e;">Company Profile Incomplete</h4>
            <p style="margin:0;font-size:0.82rem;color:#b45309;line-height:1.4;">
              You must complete your company profile before you can request an MOA partnership and post job or OJT slots.
            </p>
          </div>
        </div>
        <a href="#/profile" class="btn btn--sm btn--primary" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;white-space:nowrap;">
          ${icon('edit', 14)} Complete Profile
        </a>
      </div>
    `;
  }

  if (moaStatus === 'Requested') {
    return `
      <div class="moa-dash-banner" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="display:flex;align-items:center;gap:14px;max-width:720px;">
          <div style="width:40px;height:40px;border-radius:10px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('clock', 20)}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h4 style="margin:0;font-size:0.95rem;font-weight:700;color:#166534;">MOA Partnership Requested — Under CIER Review</h4>
              <span style="background:#dcfce7;color:#15803d;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid #86efac;">Pending Approval</span>
            </div>
            <p style="margin:4px 0 0;font-size:0.82rem;color:#15803d;line-height:1.4;">
              Your MOA request has been submitted to the CHMSU CIER Admin office. Opportunity postings will unlock automatically once the administrator reviews and uploads your agreement document.
            </p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <a href="#/profile" class="btn btn--sm btn--outline" style="border-color:#86efac;color:#166534;white-space:nowrap;">
            ${icon('fileText', 14)} View MOA Status
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="moa-dash-banner" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
      <div style="display:flex;align-items:center;gap:14px;max-width:720px;">
        <div style="width:40px;height:40px;border-radius:10px;background:#dbeafe;color:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${icon('fileText', 20)}
        </div>
        <div>
          <h4 style="margin:0 0 3px;font-size:0.95rem;font-weight:700;color:#1e40af;">Establish MOA Partnership to Unlock Posting</h4>
          <p style="margin:0;font-size:0.82rem;color:#1d4ed8;line-height:1.4;">
            Your company profile is complete! Submit an MOA request to CHMSU CIER to establish a formal partnership and unlock OJT and Job vacancy posting.
          </p>
        </div>
      </div>
      <button type="button" class="btn btn--sm btn--primary" id="btn-request-moa-dash" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;white-space:nowrap;">
        ${icon('send', 14)} Request MOA with CIER Admin
      </button>
    </div>
  `;
}

function renderDashboardLayout(container, companyInit, todayFormatted, personName, companyName, company = {}) {
  const isCompleted = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';
  const isMoaValid = ['active', 'expiring soon'].includes(moaStatus.toLowerCase());
  const canPost = company.canPostOpportunities !== undefined
    ? Boolean(company.canPostOpportunities)
    : (isCompleted && isMoaValid);

  container.innerHTML = `
    <div class="cd-dashboard fade-in">
      <!-- Welcome Header -->
      <header class="cd-header">
        <div class="cd-header__brand">
          <div class="cd-header__avatar">${companyInit}</div>
          <div class="cd-header__meta">
            <div class="cd-header__date-pill">${icon('calendar', 12)} <span>${todayFormatted}</span></div>
            <h1 class="cd-header__title">Welcome back, ${escapeHtml(personName)}</h1>
            <p class="cd-header__sub">${escapeHtml(companyName)} · Enterprise Recruitment Overview</p>
          </div>
        </div>
        <div class="cd-header__actions">
          ${canPost ? `
            <a href="#/post-job" class="btn btn--primary">${icon('plus', 14)} Post Job Slot</a>
            <a href="#/ojt-slots" class="btn btn--outline">${icon('plusCircle', 14)} Post OJT Slot</a>
          ` : `
            <button type="button" class="btn btn--primary" id="dash-post-job-btn">${icon('plus', 14)} Post Job Slot</button>
            <button type="button" class="btn btn--outline" id="dash-post-ojt-btn">${icon('plusCircle', 14)} Post OJT Slot</button>
          `}
          <a href="#/applicants" class="btn btn--ghost">${icon('users', 14)} Review Applicants</a>
        </div>
      </header>

      <!-- MOA Partnership Action Banner -->
      ${renderMoaBanner(company)}

      <!-- KPI Metrics -->
      <section class="cd-kpi-grid" id="dash-stats">
        ${[1, 2, 3, 4].map(() => `
          <div class="cd-kpi-card cd-kpi-card--skeleton">
            <div class="skeleton" style="width:36px;height:36px;border-radius:10px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:60px;height:28px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:110px;height:14px;"></div>
          </div>
        `).join('')}
      </section>

      <!-- Two-Column Analytics: Funnel + Volume -->
      <div class="cd-split">
        <section class="dash-card cd-card" id="funnel-section">
          <div class="cd-card__header">
            <div class="cd-card__header-left">
              <span class="cd-card__icon">${icon('filter', 16)}</span>
              <div>
                <h2 class="cd-card__title">Hiring Pipeline</h2>
                <span class="cd-card__subtitle">Candidate progression &amp; stage conversion</span>
              </div>
            </div>
            <a href="#/applicants" class="cd-card__link">All candidates ${icon('arrowRight', 12)}</a>
          </div>
          <div class="cd-card__body" id="funnel-body">
            <div class="skeleton" style="height:18px;margin-bottom:12px;border-radius:6px;"></div>
            <div class="skeleton" style="height:18px;margin-bottom:12px;border-radius:6px;width:80%;"></div>
            <div class="skeleton" style="height:18px;margin-bottom:12px;border-radius:6px;width:60%;"></div>
            <div class="skeleton" style="height:18px;border-radius:6px;width:40%;"></div>
          </div>
        </section>

        <section class="dash-card cd-card" id="volume-section">
          <div class="cd-card__header">
            <div class="cd-card__header-left">
              <span class="cd-card__icon">${icon('trendingUp', 16)}</span>
              <div>
                <h2 class="cd-card__title">Application Inflow</h2>
                <span class="cd-card__subtitle">Last 6 months application volume</span>
              </div>
            </div>
            <span class="cd-card__badge" id="volume-total-badge">Overview</span>
          </div>
          <div class="cd-card__body" id="volume-body">
            <div class="skeleton" style="height:150px;border-radius:10px;"></div>
          </div>
        </section>
      </div>

      <!-- Today's Interviews Agenda -->
      <section class="dash-card cd-card">
        <div class="cd-card__header">
          <div class="cd-card__header-left">
            <span class="cd-card__icon">${icon('calendar', 16)}</span>
            <div>
              <h2 class="cd-card__title">Today's Interview Schedule</h2>
              <span class="cd-card__subtitle">Upcoming candidate meetings &amp; panel evaluations</span>
            </div>
          </div>
          <a href="#/interviews" class="cd-card__link">Open Calendar ${icon('arrowRight', 12)}</a>
        </div>
        <div id="interviews-body" class="cd-card__content">
          <div class="skeleton" style="margin:16px 20px;height:52px;border-radius:8px;"></div>
        </div>
      </section>

      <!-- Recent Applicants Actionable Roster -->
      <section class="dash-card cd-card">
        <div class="cd-card__header">
          <div class="cd-card__header-left">
            <span class="cd-card__icon">${icon('users', 16)}</span>
            <div>
              <h2 class="cd-card__title">Recent Candidates</h2>
              <span class="cd-card__subtitle">Latest job applications awaiting review</span>
            </div>
          </div>
          <a href="#/applicants" class="cd-card__link">View All Applicants ${icon('arrowRight', 12)}</a>
        </div>
        <div id="applicants-body" class="cd-card__content">
          <div class="skeleton" style="margin:16px 20px;height:52px;border-radius:8px;"></div>
          <div class="skeleton" style="margin:16px 20px;height:52px;border-radius:8px;"></div>
        </div>
      </section>
    </div>
  `;
}

function populateDashboardData(container, data) {
  if (!container || !data) return;

  // ── 1. Populate KPI Stats ────────────────────────────────────────────────
  const s = data.stats || { activeJobs: 0, totalApplicants: 0, interviewsScheduled: 0, hiresThisMonth: 0 };
  const statsEl = container.querySelector('#dash-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <a href="#/jobs" class="cd-kpi-card cd-kpi-card--forest">
        <div class="cd-kpi-card__top">
          <div class="cd-kpi-card__icon">${icon('briefcase', 18)}</div>
          <span class="cd-kpi-card__tag">Live Listings</span>
        </div>
        <div class="cd-kpi-card__value">${s.activeJobs ?? 0}</div>
        <div class="cd-kpi-card__label">Active Job Openings</div>
      </a>

      <a href="#/applicants" class="cd-kpi-card cd-kpi-card--blue">
        <div class="cd-kpi-card__top">
          <div class="cd-kpi-card__icon">${icon('users', 18)}</div>
          <span class="cd-kpi-card__tag">All Roles</span>
        </div>
        <div class="cd-kpi-card__value">${s.totalApplicants ?? 0}</div>
        <div class="cd-kpi-card__label">Total Candidates</div>
      </a>

      <a href="#/interviews" class="cd-kpi-card cd-kpi-card--amber">
        <div class="cd-kpi-card__top">
          <div class="cd-kpi-card__icon">${icon('calendar', 18)}</div>
          <span class="cd-kpi-card__tag">Upcoming</span>
        </div>
        <div class="cd-kpi-card__value">${s.interviewsScheduled ?? 0}</div>
        <div class="cd-kpi-card__label">Interviews Scheduled</div>
      </a>

      <a href="#/applicants" class="cd-kpi-card cd-kpi-card--purple">
        <div class="cd-kpi-card__top">
          <div class="cd-kpi-card__icon">${icon('checkCircle', 18)}</div>
          <span class="cd-kpi-card__tag">Placements</span>
        </div>
        <div class="cd-kpi-card__value">${s.hiresThisMonth ?? 0}</div>
        <div class="cd-kpi-card__label">Hires This Month</div>
      </a>
    `;
  }

  // ── 2. Populate Hiring Funnel ────────────────────────────────────────────
  const funnel = data.hiringFunnel || { applied: 0, screened: 0, interviewed: 0, offered: 0, hired: 0 };
  const fStages = [
    { label: 'Applied',     value: Number(funnel.applied) || 0,     color: '#2563eb', bg: '#eff6ff' },
    { label: 'Screened',    value: Number(funnel.screened) || 0,    color: '#0284c7', bg: '#f0f9ff' },
    { label: 'Interviewed', value: Number(funnel.interviewed) || 0, color: '#d97706', bg: '#fef3c7' },
    { label: 'Offered',     value: Number(funnel.offered) || 0,     color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Hired',       value: Number(funnel.hired) || 0,       color: '#16a34a', bg: '#f0fdf4' },
  ];

  const baseCount = fStages[0].value;
  const funnelBody = container.querySelector('#funnel-body');
  if (funnelBody) {
    if (baseCount === 0) {
      funnelBody.innerHTML = `
        <div class="cd-empty-compact">
          <span class="cd-empty-compact__icon">${icon('filter', 24)}</span>
          <p class="cd-empty-compact__text">No candidate activity in your pipeline yet.</p>
          <a href="#/post-job" class="btn btn--sm btn--primary">Post a Job to Receive Applicants</a>
        </div>
      `;
    } else {
      funnelBody.innerHTML = `
        <div class="cd-pipeline">
          ${fStages.map((st) => {
            const conversionPct = baseCount > 0 ? Math.round((st.value / baseCount) * 100) : 0;
            const barWidth = baseCount > 0 ? Math.max(6, conversionPct) : 0;
            return `
              <div class="cd-pipeline__step">
                <div class="cd-pipeline__header">
                  <div class="cd-pipeline__label">
                    <span class="cd-pipeline__dot" style="background:${st.color};"></span>
                    <span class="cd-pipeline__name">${st.label}</span>
                  </div>
                  <div class="cd-pipeline__counts">
                    <strong class="cd-pipeline__val">${st.value}</strong>
                    <span class="cd-pipeline__pct" style="color:${st.color};">${conversionPct}%</span>
                  </div>
                </div>
                <div class="cd-pipeline__track">
                  <div class="cd-pipeline__bar" style="width:${barWidth}%;background:${st.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // ── 3. Populate Application Volume Chart ─────────────────────────────────
  const months = Array.isArray(data.monthlyApplications) ? data.monthlyApplications : [];
  const volumeBody = container.querySelector('#volume-body');
  const volumeBadge = container.querySelector('#volume-total-badge');

  if (volumeBody) {
    const totalApplications = months.reduce((sum, m) => sum + (Number(m.count) || 0), 0);
    const avgMonthly = months.length > 0 ? Math.round(totalApplications / months.length) : 0;
    if (volumeBadge) {
      volumeBadge.textContent = `${totalApplications} total (${avgMonthly}/mo avg)`;
    }

    if (!months.length || totalApplications === 0) {
      volumeBody.innerHTML = `
        <div class="cd-empty-compact">
          <span class="cd-empty-compact__icon">${icon('trendingUp', 24)}</span>
          <p class="cd-empty-compact__text">No monthly application history recorded yet.</p>
        </div>
      `;
    } else {
      const maxCount = Math.max(8, ...months.map(m => Number(m.count) || 0));

      volumeBody.innerHTML = `
        <div class="cd-chart">
          <div class="cd-chart__bars">
            ${months.map(m => {
              const count = Number(m.count) || 0;
              const heightPct = Math.round((count / maxCount) * 100);
              const barHeight = Math.max(6, heightPct);
              return `
                <div class="cd-chart__col" title="${m.month}: ${count} applications">
                  <div class="cd-chart__val">${count}</div>
                  <div class="cd-chart__bar-wrap">
                    <div class="cd-chart__bar" style="height:${barHeight}%;"></div>
                  </div>
                  <div class="cd-chart__label">${m.month}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  // ── 4. Populate Today's Interviews ───────────────────────────────────────
  const interviews = Array.isArray(data.todayInterviews) ? data.todayInterviews : [];
  const interviewsBody = container.querySelector('#interviews-body');
  if (interviewsBody) {
    if (!interviews.length) {
      interviewsBody.innerHTML = `
        <div class="cd-empty-state">
          <div class="cd-empty-state__icon">${icon('calendar', 28)}</div>
          <h3 class="cd-empty-state__title">No interviews scheduled for today</h3>
          <p class="cd-empty-state__sub">Your interview agenda is clear. View the interview schedule to prepare for upcoming candidate sessions.</p>
          <a href="#/interviews" class="btn btn--sm btn--outline">${icon('calendar', 14)} Open Interview Calendar</a>
        </div>
      `;
    } else {
      interviewsBody.innerHTML = `
        <div class="cd-interview-list">
          ${interviews.map(i => {
            const platformName = escapeHtml(i.platform || 'Online');
            return `
              <div class="cd-interview-item">
                <div class="cd-interview-item__left">
                  <div class="cd-avatar">${escapeHtml(i.candidateInitials || 'CA')}</div>
                  <div class="cd-interview-item__details">
                    <h4 class="cd-interview-item__name">${escapeHtml(i.candidateName)}</h4>
                    <p class="cd-interview-item__role">${icon('briefcase', 12)} ${escapeHtml(i.jobTitle || 'General Position')}</p>
                  </div>
                </div>

                <div class="cd-interview-item__mid">
                  <span class="cd-time-pill">${icon('clock', 12)} ${escapeHtml(i.time || 'TBD')}</span>
                  <span class="cd-meta-pill">${icon('video', 12)} ${platformName}</span>
                  ${i.type ? `<span class="cd-meta-pill cd-meta-pill--type">${escapeHtml(i.type)}</span>` : ''}
                </div>

                <div class="cd-interview-item__right">
                  ${statusBadge(i.status)}
                  <a href="#/interviews" class="btn btn--sm btn--outline cd-btn-compact">Manage</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // ── 5. Populate Recent Applicants Roster ─────────────────────────────────
  const applicants = Array.isArray(data.recentApplicants) ? data.recentApplicants : [];
  const applicantsBody = container.querySelector('#applicants-body');
  if (applicantsBody) {
    if (!applicants.length) {
      applicantsBody.innerHTML = `
        <div class="cd-empty-state">
          <div class="cd-empty-state__icon">${icon('users', 28)}</div>
          <h3 class="cd-empty-state__title">No applicants yet</h3>
          <p class="cd-empty-state__sub">When students and graduates apply to your job or OJT postings, they will appear here with instant match ratings.</p>
          <a href="#/post-job" class="btn btn--sm btn--primary">${icon('plus', 14)} Post a New Job Slot</a>
        </div>
      `;
    } else {
      applicantsBody.innerHTML = `
        <div class="dash-table-wrap">
          <table class="dash-table cd-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Position</th>
                <th>Match Score</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${applicants.map(a => `
                <tr>
                  <td>
                    <div class="cd-candidate-cell">
                      <div class="cd-avatar">${escapeHtml(a.initials || 'AP')}</div>
                      <div>
                        <span class="cd-candidate-name">${escapeHtml(a.name)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="cd-role-text">${escapeHtml(a.appliedFor || 'General Role')}</span>
                  </td>
                  <td>
                    ${renderMatchBadge(a.matchScore)}
                  </td>
                  <td>
                    <span class="cd-date-text">${icon('clock', 11)} ${escapeHtml(a.appliedDate)}</span>
                  </td>
                  <td>
                    ${statusBadge(a.status)}
                  </td>
                  <td style="text-align:right;">
                    <a href="#/applicants" class="btn btn--sm btn--outline cd-btn-compact">${icon('externalLink', 12)} Review</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }
}

export async function renderDashboard(container) {
  const company = getState('company') || {};
  const companyId = company.id || 1;
  const personName = company.contactPerson || company.name || 'HR Manager';
  const companyName = company.name || 'Partner Company';
  const companyInit = companyName.charAt(0).toUpperCase() || 'C';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // 1. Initial shell layout
  renderDashboardLayout(container, companyInit, todayFormatted, personName, companyName, company);
  wireMoaActions(container);

  // 2. Instant Cached Render if present (no skeleton flash!)
  const cached = apiCache.get('/company/dashboard')?.data;
  if (cached) {
    populateDashboardData(container, cached);
  }

  // 3. Load Company Data & fresh profile
  let data;
  try {
    const [res, profRes] = await Promise.all([
      apiGet('/company/dashboard'),
      apiGet('/company/profile').catch(() => null),
    ]);

    if (profRes?.success && profRes.data) {
      const p = profRes.data;
      const updated = {
        ...company,
        name: p.company_name || company.name,
        profileCompleted: !!p.profile_completed,
        moaStatus: p.moa_status || company.moaStatus,
        registrationSource: p.registration_source || company.registrationSource,
        moaRequestedAt: p.moa_requested_at || company.moaRequestedAt,
        canPostOpportunities: p.can_post_opportunities ?? company.canPostOpportunities,
      };
      setState('company', updated);
      localStorage.setItem('hireme_company_user', JSON.stringify(updated));
    }

    if (res?.success && res.data) {
      data = res.data;
    } else {
      throw new Error('API returned no data');
    }
  } catch (_) {
    const mock = await apiFetch('dashboard/by-company');
    const allData = mock?.data || {};
    data = allData[companyId] || allData[1] || {};
  }

  // 4. Populate with latest data
  if (data) {
    populateDashboardData(container, data);
  }
}

function wireMoaActions(container) {
  container.querySelector('#btn-request-moa-dash')?.addEventListener('click', () => {
    openMoaRequestModal({
      onSuccess: () => {
        renderDashboard(container);
      }
    });
  });

  container.querySelector('#dash-post-job-btn')?.addEventListener('click', () => {
    showPostingRestrictedModal('post job slots');
  });

  container.querySelector('#dash-post-ojt-btn')?.addEventListener('click', () => {
    showPostingRestrictedModal('post OJT trainee slots');
  });
}

