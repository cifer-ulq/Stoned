/**
 * CHMSU HireMe — OJT Tracker Page
 * Calendar attendance view + Daily time log (time in / time out).
 * No tasks column — logs only show date, time in, time out, hours, status.
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiUpload, apiCache, storageUrl } from '../api/client.js';
import { openDtrPrintModal } from '@shared/dtr-print-modal.js';

// Haversine distance in metres (client-side, for quick UI check)
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a  = Math.sin(df/2)**2 + Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatDate(d) {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TODAY = new Date();
const TODAY_STR = formatDate(TODAY);

function parseDateParts(dateStr, fullStr) {
  if (!dateStr || dateStr === 'TBA') {
    return { month: 'TBA', day: '—', year: '', full: 'Date to be announced' };
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return {
      month: MONTHS_SHORT[d.getMonth()].toUpperCase(),
      day: d.getDate(),
      year: d.getFullYear(),
      full: fullStr || d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  }
  const parts = String(dateStr).replace(/,/g, '').split(/\s+/);
  return {
    month: (parts[0] || 'OJT').toUpperCase().slice(0, 3),
    day: parts[1] || '—',
    year: parts[2] || '',
    full: fullStr || dateStr
  };
}

function getCountdownData(daysLeft) {
  if (daysLeft === 0) {
    return {
      pillText: 'Starts Today',
      desc: 'Your first day is today! Geo-fenced time-in is ready.',
      iconName: 'sparkles'
    };
  }
  if (daysLeft === 1) {
    return {
      pillText: 'Starts Tomorrow',
      desc: '1 day to go — Finalize your preparations for Day 1.',
      iconName: 'clock'
    };
  }
  if (typeof daysLeft === 'number' && daysLeft > 1) {
    return {
      pillText: `Starts in ${daysLeft} days`,
      desc: `${daysLeft} days until your internship officially begins.`,
      iconName: 'clock'
    };
  }
  return {
    pillText: 'Scheduled to Start',
    desc: 'Your deployment has been officially confirmed.',
    iconName: 'calendar'
  };
}

function renderCompanyAvatar(dep) {
  if (dep.companyLogo) {
    const src = dep.companyLogo.startsWith('http') ? dep.companyLogo : `http://localhost:8000${dep.companyLogo}`;
    return `<div class="ojt-dossier-avatar"><img src="${src}" alt="${esc(dep.company || 'Company')}"></div>`;
  }
  const initial = dep.companyInitial || (dep.company ? dep.company.trim().slice(0, 2).toUpperCase() : 'CO');
  const color = dep.companyColor || 'var(--color-primary)';
  return `<div class="ojt-dossier-avatar" style="background:var(--color-primary-bg);color:${color};">${esc(initial)}</div>`;
}

function renderPrestartOJT(container, res) {
  const startDate     = res.startDate || 'TBA';
  const startDateFull = res.startDateFull || '';
  const daysLeft      = typeof res.daysRemaining === 'number' ? res.daysRemaining : null;
  const instructions  = (res.instructions || '').trim();
  const dep           = res.deployment || {};

  const company       = dep.company || 'Host Company';
  const role          = dep.postingTitle || 'OJT Trainee / Intern';
  const department    = dep.department || 'General Operations';
  const location      = dep.location || 'Company Premises';
  const supervisor    = dep.supervisor || (dep.supervisorEmail ? dep.supervisorEmail : 'Assigned upon reporting');
  const requiredHours = dep.requiredHours || 600;

  const sched         = dep.schedule || {};
  const schedDays     = Array.isArray(sched.days) && sched.days.length ? sched.days.join(', ') : 'Mon, Tue, Wed, Thu, Fri';
  const shiftStart    = sched.shiftStart || '08:00';
  const shiftEnd      = sched.shiftEnd || '17:00';
  const hasLunch      = sched.hasLunchBreak !== false;
  const lunchStart    = sched.lunchStart || '12:00';
  const lunchEnd      = sched.lunchEnd || '13:00';
  const dailyHours    = sched.dailyHours || 8;
  const weeklyHours   = sched.weeklyHours || 40;
  const allowOt       = !!sched.allowOvertime;
  const maxOt         = sched.maxOvertimeHours || 0;
  const estEndDate    = sched.estimatedEndDate || '';

  const dateParts     = parseDateParts(startDate, startDateFull);
  const countdown     = getCountdownData(daysLeft);

  const ojtObj = {
    ...dep,
    company: company,
    hoursRendered: 0,
    totalHours: requiredHours,
    emergency: res.emergency || null,
    is_on_leave: Boolean(res.is_on_leave),
    emergency_pending: Boolean(res.emergency_pending),
    is_withdrawn: Boolean(res.is_withdrawn),
  };

  container.innerHTML = `
    <div class="ojt-prestart animate-fade-in-up">
      <!-- ── Header ── -->
      <div class="ojt-prestart__header">
        <div class="ojt-prestart__badge-row">
          <span class="ojt-status-pill ojt-status-pill--scheduled">
            <span class="ojt-status-dot"></span> Deployment Scheduled
          </span>
          <span class="ojt-status-pill ojt-status-pill--neutral">
            ${icon('shieldCheck', 13)} Official Host Training Agreement
          </span>
        </div>
        <h1 class="ojt-prestart__title">
          ${icon('clock', 26)} OJT Attendance & Time Tracker
        </h1>
        <p class="ojt-prestart__subtitle">
          Your OJT deployment is officially confirmed. Attendance punch clock, geolocation verification, and daily log tracking will unlock automatically on your scheduled start date.
        </p>
      </div>

      <!-- ── Emergency / Medical Status Banner ── -->
      ${renderEmergencyBannerHtml(ojtObj)}

      <!-- ── Hero Milestone Card ── -->
      <div class="ojt-prestart-hero">
        <div class="ojt-prestart-hero__main">
          <div class="ojt-prestart-hero__date-group">
            <div class="ojt-date-badge">
              <span class="ojt-date-badge__month">${dateParts.month}</span>
              <span class="ojt-date-badge__day">${dateParts.day}</span>
              ${dateParts.year ? `<span class="ojt-date-badge__year">${dateParts.year}</span>` : ''}
            </div>
            <div class="ojt-prestart-hero__date-meta">
              <span class="ojt-prestart-hero__date-meta-label">Official Start Date</span>
              <span class="ojt-prestart-hero__date-meta-val">${dateParts.full}</span>
              <span class="ojt-prestart-hero__date-meta-sub">${countdown.desc}</span>
            </div>
          </div>
          <div class="ojt-countdown-pill">
            ${icon(countdown.iconName, 15)}
            <span>${countdown.pillText}</span>
          </div>
        </div>

        <!-- ── Progress Stepper ── -->
        <div class="ojt-stepper">
          <div class="ojt-stepper__item ojt-stepper__item--completed">
            <div class="ojt-stepper__icon-wrap">${icon('checkCircle', 13)}</div>
            <div class="ojt-stepper__content">
              <span class="ojt-stepper__step-num">Step 1</span>
              <span class="ojt-stepper__step-name">Application</span>
              <span class="ojt-stepper__step-status">Accepted</span>
            </div>
          </div>
          <div class="ojt-stepper__item ojt-stepper__item--completed">
            <div class="ojt-stepper__icon-wrap">${icon('checkCircle', 13)}</div>
            <div class="ojt-stepper__content">
              <span class="ojt-stepper__step-num">Step 2</span>
              <span class="ojt-stepper__step-name">Deployment</span>
              <span class="ojt-stepper__step-status">Confirmed</span>
            </div>
          </div>
          <div class="ojt-stepper__item ojt-stepper__item--active">
            <div class="ojt-stepper__icon-wrap">3</div>
            <div class="ojt-stepper__content">
              <span class="ojt-stepper__step-num">Step 3</span>
              <span class="ojt-stepper__step-name">First Day</span>
              <span class="ojt-stepper__step-status" style="color:var(--color-primary);font-weight:600;">Scheduled</span>
            </div>
          </div>
          <div class="ojt-stepper__item ojt-stepper__item--upcoming">
            <div class="ojt-stepper__icon-wrap">4</div>
            <div class="ojt-stepper__content">
              <span class="ojt-stepper__step-num">Step 4</span>
              <span class="ojt-stepper__step-name">Completion</span>
              <span class="ojt-stepper__step-status">${requiredHours} Hours${dep.accreditedHours > 0 ? ` (${dep.accreditedHours}h credited)` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 2-Column Details Grid ── -->
      <div class="ojt-prestart-grid">

        <!-- Column 1: Placement Dossier -->
        <div class="ojt-dossier-card">
          <div class="ojt-dossier-header">
            ${renderCompanyAvatar(dep)}
            <div class="ojt-dossier-header__meta">
              <h2 class="ojt-dossier-company">${esc(company)}</h2>
              <p class="ojt-dossier-role">${esc(role)}</p>
            </div>
          </div>

          <div class="ojt-dossier-fields">
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('building', 12)} Host Company</span>
              <span class="ojt-field__val">${esc(company)}</span>
            </div>
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('briefcase', 12)} Assigned Role</span>
              <span class="ojt-field__val">${esc(role)}</span>
            </div>
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('layers', 12)} Department</span>
              <span class="ojt-field__val">${esc(department)}</span>
            </div>
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('mapPin', 12)} Site / Branch</span>
              <span class="ojt-field__val">${esc(location)}</span>
            </div>
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('clock', 12)} Required Hours</span>
              <span class="ojt-field__val">${requiredHours} Hours${dep.accreditedHours > 0 ? ` <span style="font-size:0.75rem;color:#005930;font-weight:600;">(${dep.accreditedHours}h accredited)</span>` : ''}</span>
            </div>
            <div class="ojt-field">
              <span class="ojt-field__label">${icon('user', 12)} Supervisor</span>
              <span class="ojt-field__val">${esc(supervisor)}</span>
            </div>
          </div>

          <div class="ojt-dossier-actions" style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn--primary btn--sm" id="btn-contact-company" style="display:inline-flex;align-items:center;gap:6px;">
              ${icon('messageCircle', 14)} Message Employer
            </button>
            <button class="btn btn--outline btn--sm" id="btn-contact-coordinator" style="display:inline-flex;align-items:center;gap:6px;color:var(--color-primary);">
              ${icon('shield', 14)} Message Coordinator
            </button>
            <button class="btn btn--outline btn--sm btn-trigger-emergency" id="btn-prestart-emergency" style="display:inline-flex;align-items:center;gap:6px;color:#dc2626;border-color:rgba(239,68,68,0.3);">
              ${icon('alertTriangle', 14)} Emergency / Leave Notice
            </button>
            ${location && location !== 'Company Premises' ? `
              <a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm" style="display:inline-flex;align-items:center;gap:6px;">
                ${icon('mapPin', 14)} View Location
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Column 2: Instructions & Day 1 Readiness Guide -->
        <div class="ojt-instructions-stack">
          <!-- Agreed Work Schedule -->
          <div class="ojt-instructions-card" style="border-left:4px solid #005930;">
            <div class="ojt-instructions-header">
              <h3 class="ojt-instructions-title" style="color:#005930;display:flex;align-items:center;gap:6px;">${icon('calendar', 15)} Agreed Work Schedule</h3>
              <span class="badge badge--success" style="font-size:0.68rem;padding:2px 8px;background:rgba(0,89,48,0.1);color:#005930;border:1px solid rgba(0,89,48,0.2);">Company Policy</span>
            </div>
            <div class="ojt-schedule-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('calendar', 12)} Working Days</span>
                <span class="ojt-field__val" style="font-weight:700;color:var(--text-primary);">${esc(schedDays)}</span>
              </div>
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('clock', 12)} Shift Hours</span>
                <span class="ojt-field__val" style="font-weight:700;color:var(--text-primary);">${esc(shiftStart)} &ndash; ${esc(shiftEnd)}</span>
              </div>
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('coffee', 12)} Midday Lunch Break</span>
                <span class="ojt-field__val">${hasLunch ? `${esc(lunchStart)} &ndash; ${esc(lunchEnd)} (1h unpaid)` : 'No break'}</span>
              </div>
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('activity', 12)} Daily / Weekly Hours</span>
                <span class="ojt-field__val">${dailyHours} hrs/day &middot; ${weeklyHours} hrs/wk</span>
              </div>
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('zap', 12)} Overtime Policy</span>
                <span class="ojt-field__val">${allowOt ? `Allowed (Max ${maxOt}h/day)` : 'Not permitted'}</span>
              </div>
              <div class="ojt-field">
                <span class="ojt-field__label">${icon('checkCircle', 12)} Target Completion</span>
                <span class="ojt-field__val" style="color:#005930;font-weight:700;">${estEndDate || 'Calculated on start'}</span>
              </div>
            </div>
          </div>

          <!-- Employer Instructions -->
          <div class="ojt-instructions-card">
            <div class="ojt-instructions-header">
              <h3 class="ojt-instructions-title">${icon('fileText', 15)} Instructions from Employer</h3>
              ${instructions ? `<span class="badge badge--accent" style="font-size:0.68rem;padding:2px 8px;">Official Note</span>` : ''}
            </div>
            ${instructions ? `
              <div class="ojt-instructions-body">${esc(instructions)}</div>
            ` : `
              <div class="ojt-instructions-empty">
                ${icon('info', 16)}
                <div>No advance special instructions were posted by the employer. Please report to the office on your start date in proper university uniform/business casual attire with your endorsement documents.</div>
              </div>
            `}
          </div>

          <!-- Day 1 Checklist -->
          <div class="ojt-guide-card">
            <h3 class="ojt-guide-title">${icon('calendarCheck', 15)} What to Expect on Day 1</h3>
            <ul class="ojt-guide-list">
              <li class="ojt-guide-item">
                <span class="ojt-guide-num">1</span>
                <div class="ojt-guide-text">
                  <strong>Automatic Unlock at 12:00 AM</strong>
                  <p>Your punch clock and daily attendance calendar will activate automatically on ${dateParts.month} ${dateParts.day}, ${dateParts.year}.</p>
                </div>
              </li>
              <li class="ojt-guide-item">
                <span class="ojt-guide-num">2</span>
                <div class="ojt-guide-text">
                  <strong>GPS-Verified Clock In</strong>
                  <p>Upon arriving on-site, open this page and tap <strong>Log In</strong> to verify your attendance within 50 meters of the company premises.</p>
                </div>
              </li>
              <li class="ojt-guide-item">
                <span class="ojt-guide-num">3</span>
                <div class="ojt-guide-text">
                  <strong>Log Out & Track Progress</strong>
                  <p>Tap <strong>Log Out</strong> when your shift ends. Your daily hours will automatically accumulate toward your ${requiredHours}-hour requirement.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach contact employer action
  const contactBtn = container.querySelector('#btn-contact-company');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      if (typeof window.openChat === 'function') {
        const key = dep.interestId ? `ojt_interest_${dep.interestId}` : null;
        window.openChat(key);
      }
    });
  }

  container.querySelector('#btn-contact-coordinator')?.addEventListener('click', () => {
    window.openCoordinatorChat?.();
  });

  container.querySelector('#btn-prestart-emergency')?.addEventListener('click', () => {
    openEmergencyModal(ojtObj, () => {
      renderOJTTracker(container);
    });
  });

  container.querySelector('#btn-upload-fit-to-work')?.addEventListener('click', () => {
    openFitToWorkModal(ojtObj.emergency, () => {
      renderOJTTracker(container);
    });
  });

  if (!container._prestartEmerBound) {
    container._prestartEmerBound = true;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-prestart-emergency, .btn-trigger-emergency');
      if (btn) {
        e.preventDefault();
        openEmergencyModal(ojtObj, () => {
          renderOJTTracker(container);
        });
      }
    });
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
export async function renderOJTTracker(container) {
  container.innerHTML = `
    <div style="padding:12px 0;">
      <div class="skeleton skeleton--text" style="width:min(100%, 220px); height:28px; margin-bottom:8px;"></div>
      <div class="skeleton skeleton--text" style="width:min(100%, 340px);"></div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:16px; margin-bottom:16px;">
      <div class="skeleton skeleton--card" style="height:200px;"></div>
      <div class="skeleton skeleton--card" style="height:200px;"></div>
    </div>
    <div class="skeleton skeleton--card" style="height:340px; margin-bottom:16px;"></div>
    <div class="skeleton skeleton--card" style="height:220px;"></div>
  `;

  // Attach reactive refresh listener if not already bound on container
  if (!container._trackerNotifBound) {
    container._trackerNotifBound = true;
    const handleReactiveUpdate = () => {
      if (!document.body.contains(container)) {
        window.removeEventListener('hireme:ojt-updated', handleReactiveUpdate);
        window.removeEventListener('hireme:notification-received', handleReactiveUpdate);
        container._trackerNotifBound = false;
        return;
      }
      renderOJTTracker(container);
    };
    window.addEventListener('hireme:ojt-updated', handleReactiveUpdate);
    window.addEventListener('hireme:notification-received', handleReactiveUpdate);
  }

  const [res, evalRes, pullOutRes] = await Promise.all([
    apiGet('/student/ojt-tracker', { forceRefresh: true }).catch(() => null),
    apiGet('/student/evaluation').catch(() => null),
    apiGet('/student/ojt-pull-out', { forceRefresh: true }).catch(() => null),
  ]);
  const evaluation = evalRes?.data || null;
  const pullOut = pullOutRes?.data || null;

  // ── Locked state: OJT confirmed but start date hasn't arrived yet ──────────
  if (res?.locked) {
    renderPrestartOJT(container, res);
    return;
  }

  if (!res || !res.deployment) {
    container.innerHTML = `
      <section class="page-section animate-fade-in-up">
        <div class="jp-card" style="text-align:center;padding:60px 20px;">
          ${icon('briefcase', 48)}
          <h2 style="margin-top:16px;font-size:var(--text-xl);font-weight:700;">No Active OJT Deployment</h2>
          <p class="text-secondary" style="margin-top:8px;">You haven't been accepted to any OJT posting yet. Browse available postings and express your interest.</p>
        </div>
      </section>`;
    return;
  }


  const serverOffsetMs = res.serverNowIso ? (Date.parse(res.serverNowIso) - Date.now()) : 0;
  const ojt = {
    ...res.deployment,
    ...res.progress,
    serverOffsetMs: Number.isFinite(serverOffsetMs) ? serverOffsetMs : 0,
    emergency: res.emergency || null,
    pull_out: pullOut || res.pull_out || null,
    is_on_leave: Boolean(res.is_on_leave),
    emergency_pending: Boolean(res.emergency_pending),
    is_withdrawn: Boolean(res.is_withdrawn),
    is_pull_out_pending: Boolean(res.is_pull_out_pending || (pullOut && ['pending_supervisor', 'recommended_by_supervisor', 'printed_pending_signature', 'emailed_to_dean'].includes(pullOut.status))),
  };
  const logs = res.logs || [];

  // Student's last known location from logged coordinates
  if (res.studentLocation) {
    ojt._studentLat = res.studentLocation.lat;
    ojt._studentLon = res.studentLocation.lon;
    ojt._studentLocDate = res.studentLocation.date;
  }

  // Reactive month state
  let viewYear  = TODAY.getFullYear();
  let viewMonth = TODAY.getMonth();

  function buildPage() {
    renderTrackerPage(container, ojt, logs, viewYear, viewMonth, (ny, nm) => {
      viewYear  = ny;
      viewMonth = nm;
      buildPage();
    }, evaluation);
  }
  buildPage();
}

function renderEmergencyBannerHtml(ojt) {
  const em = ojt.emergency;
  if (!em) return '';

  const isActivelyOnLeave = ojt.is_on_leave && !em.cleared_to_resume_at && !em.is_cleared;
  const isResumedFromLeave = !ojt.is_on_leave && Boolean(em.cleared_to_resume_at || em.is_cleared);

  if (isResumedFromLeave) {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;" id="sec-resumed-banner">
        <div class="jp-card ojt-status-banner-card" style="background:linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(2,132,199,0.05) 100%);border:1.5px solid rgba(16,185,129,0.3);border-left:5px solid #059669;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(16,185,129,0.15);color:#059669;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon('shieldCheck', 22)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#065f46;">Fit-to-Work Clearance Accepted &middot; Training Resumed</h3>
                  <span class="badge" style="background:#D1FAE5;color:#065F46;font-weight:700;font-size:0.7rem;padding:2px 8px;">Active OJT</span>
                </div>
                <p style="margin:4px 0 0;font-size:0.83rem;color:#047857;line-height:1.45;">
                  Your medical clearance was accepted by your Coordinator. Attendance logging and time-in are fully reactivated.
                </p>
                ${em.coordinator_remarks ? `
                  <div style="margin-top:6px;padding:6px 10px;background:rgba(16,185,129,0.08);border-radius:6px;font-size:0.78rem;color:#065f46;">
                    <strong>Coordinator Note:</strong> &ldquo;${esc(em.coordinator_remarks)}&rdquo;
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="ojt-status-banner-actions" style="display:flex;align-items:center;gap:8px;">
              ${em.fit_to_work_url ? `
                <a href="${em.fit_to_work_url}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm" style="gap:6px;color:#059669;border-color:rgba(16,185,129,0.4);font-weight:600;">
                  ${icon('fileText', 14)} View Clearance Certificate
                </a>
              ` : ''}
              <button class="btn btn--ghost btn--sm" style="color:var(--text-secondary);padding:6px;" onclick="this.closest('#sec-resumed-banner').remove();" title="Dismiss">
                ${icon('x', 16)}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (isActivelyOnLeave) {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(16,185,129,0.06) 100%);border:1.5px solid rgba(2,132,199,0.3);border-left:5px solid #0284c7;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(2,132,199,0.14);color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon('shieldCheck', 22)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#0369a1;">Currently on Approved Medical / Emergency Leave</h3>
                  <span class="badge" style="background:#E0F2FE;color:#0369a1;font-weight:700;font-size:0.7rem;padding:2px 8px;">Excused Leave</span>
                </div>
                <p style="margin:4px 0 0;font-size:0.83rem;color:#0c4a6e;line-height:1.45;">
                  Authorized Leave Period: <strong>${em.start_date || 'Start'} – ${em.expected_return_date || 'Until cleared'}</strong> &middot; Category: <strong>${esc((em.category || '').replace('_', ' ').toUpperCase())}</strong>
                </p>
                <p style="margin:2px 0 0;font-size:0.8rem;color:#0284c7;">
                  Attendance time-in is paused. Rendered hours remain safe and preserved (${ojt.hoursRendered} / ${ojt.totalHours} hrs). Take care!
                </p>
                ${(em.has_fit_to_work || em.fit_to_work_url) ? `
                  <div style="margin-top:8px;padding:8px 12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;display:flex;align-items:center;gap:8px;">
                    <span style="color:#059669;">${icon('shieldCheck', 16)}</span>
                    <span style="font-size:0.8rem;color:#065f46;font-weight:600;">
                      Fit-to-Work Clearance submitted &bull; Awaiting coordinator review &amp; time-in reactivation.
                    </span>
                  </div>
                ` : ''}
                ${em.coordinator_remarks ? `
                  <div style="margin-top:6px;padding:6px 10px;background:rgba(2,132,199,0.08);border-radius:6px;font-size:0.78rem;color:#0369a1;">
                    <strong>Coordinator Note:</strong> &ldquo;${esc(em.coordinator_remarks)}&rdquo;
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="ojt-status-banner-actions" style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
              ${(em.has_fit_to_work || em.fit_to_work_url) ? `
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
                  ${em.fit_to_work_url ? `
                    <a href="${em.fit_to_work_url}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.4);font-weight:600;">
                      ${icon('fileText', 14)} View Submitted Clearance
                    </a>
                  ` : ''}
                  <button class="btn btn--primary btn--sm" id="btn-upload-fit-to-work" style="gap:6px;background:#059669;border-color:#059669;font-weight:600;">
                    ${icon('upload', 14)} Re-upload Clearance
                  </button>
                </div>
                <span class="text-xs text-secondary">Clearance is waiting for coordinator acceptance</span>
              ` : `
                <button class="btn btn--primary btn--sm" id="btn-upload-fit-to-work" style="gap:6px;background:#0284c7;border-color:#0284c7;font-weight:600;">
                  ${icon('upload', 14)} Submit Fit-to-Work Clearance
                </button>
                <span class="text-xs text-secondary">Upload doctor's clearance to resume early</span>
              `}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (ojt.is_withdrawn || (em.coordinator_status === 'approved' && em.type === 'permanent_withdrawal')) {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:#FEF2F2;border:1.5px solid rgba(239,68,68,0.3);border-left:5px solid #dc2626;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(239,68,68,0.12);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('alertTriangle', 22)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#991b1b;">OJT Placement Formally Discontinued (Emergency Withdrawal)</h3>
                <span class="badge" style="background:#FEE2E2;color:#991b1b;font-weight:700;font-size:0.7rem;padding:2px 8px;">Withdrawn</span>
              </div>
              <p style="margin:4px 0 0;font-size:0.83rem;color:#7f1d1d;line-height:1.45;">
                This training placement was officially concluded due to an emergency.
                <strong>${em.credited_hours !== null && em.credited_hours !== undefined ? em.credited_hours : ojt.hoursRendered} Hours</strong> have been officially credited to your academic record.
                Academic verdict: <strong>${em.academic_verdict ? em.academic_verdict.replace('_', ' ').toUpperCase() : 'INCOMPLETE (INC)'}</strong>.
              </p>
              ${em.coordinator_remarks ? `
                <div style="margin-top:6px;padding:6px 10px;background:rgba(239,68,68,0.08);border-radius:6px;font-size:0.78rem;color:#991b1b;">
                  <strong>Coordinator Note:</strong> &ldquo;${esc(em.coordinator_remarks)}&rdquo;
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (ojt.emergency_pending || em.coordinator_status === 'pending') {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:#FFFBEB;border:1.5px solid rgba(245,158,11,0.35);border-left:5px solid #F59E0B;padding:14px 18px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.15);color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon('clock', 18)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h4 style="margin:0;font-size:0.96rem;font-weight:700;color:#92400e;">
                    Emergency Request Pending Review &middot; ${em.type === 'temporary_leave' ? 'Leave of Absence' : 'Formal Stoppage'}
                  </h4>
                  <span class="badge" style="background:#FEF3C7;color:#92400e;font-size:0.7rem;font-weight:700;padding:2px 8px;">Pending Review</span>
                </div>
                <p style="margin:3px 0 0;font-size:0.82rem;color:#78350f;line-height:1.45;">
                  Your emergency notice filed on <strong>${em.start_date || 'recently'}</strong> is awaiting review by your OJT Coordinator. Attendance logging is temporarily paused so you are not penalized with unexcused absences.
                </p>
              </div>
            </div>
            <div class="ojt-status-banner-actions" style="display:flex;align-items:center;gap:8px;">
              <button class="btn btn--outline btn--sm" id="tracker-btn-coord-chat-top" style="padding:4px 10px;font-size:0.75rem;gap:5px;color:#92400e;border-color:rgba(146,64,14,0.3);">
                ${icon('messageCircle', 13)} Contact Coordinator
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  return '';
}

function renderPullOutBannerHtml(ojt) {
  const po = ojt?.pull_out;
  if (!po) return '';

  if (po.status === 'pending_supervisor') {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:#FFFBEB;border:1.5px solid rgba(245,158,11,0.35);border-left:5px solid #F59E0B;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div style="width:40px;height:40px;border-radius:10px;background:rgba(245,158,11,0.15);color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon('fileText', 20)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#92400e;">
                    OJT Pull-Out Request Filed &middot; Stage 1: Coordinator Review
                  </h3>
                  <span class="badge" style="background:#FEF3C7;color:#92400e;font-size:0.7rem;font-weight:700;padding:2px 8px;">Awaiting Recommendation</span>
                </div>
                <p style="margin:4px 0 0;font-size:0.83rem;color:#78350f;line-height:1.45;">
                  Your formal pull-out request from <strong>${esc(ojt.company || 'Host Company')}</strong> (${esc((po.reason_category || '').replace(/_/g, ' ').toUpperCase())}) is under review by your Academic OJT Coordinator.
                </p>
                <div style="margin-top:6px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:0.78rem;">
                  ${po.student_letter_url ? `
                    <a href="${storageUrl(po.student_letter_url)}" target="_blank" rel="noopener noreferrer" style="color:#0284c7;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                      ${icon('fileText', 13)} View Uploaded Request Letter
                    </a>
                  ` : ''}
                  <span style="color:#92400e;">Hours snapshot: <strong>${po.hours_rendered_snapshot} hrs rendered</strong></span>
                </div>
              </div>
            </div>
            <div class="ojt-status-banner-actions" style="display:flex;align-items:center;gap:8px;">
              <button class="btn btn--outline btn--sm" id="btn-cancel-pull-out" style="padding:4px 10px;font-size:0.75rem;color:#dc2626;border-color:rgba(220,38,38,0.35);">
                ${icon('x', 13)} Cancel Request
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (po.status === 'recommended_by_supervisor') {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(59,130,246,0.06) 100%);border:1.5px solid rgba(2,132,199,0.3);border-left:5px solid #0284c7;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(2,132,199,0.14);color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('checkCircle', 20)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#0369a1;">
                  Pull-Out Recommended by Coordinator &middot; Stage 2: Program Chair
                </h3>
                <span class="badge" style="background:#E0F2FE;color:#0369a1;font-weight:700;font-size:0.7rem;padding:2px 8px;">Recommended</span>
              </div>
              <p style="margin:4px 0 0;font-size:0.83rem;color:#0c4a6e;line-height:1.45;">
                Your OJT Coordinator recommended approval for your pull-out request. It has been forwarded to the <strong>Program Chair (Admin)</strong> to generate an official endorsement memorandum for the <strong>College Dean</strong>.
              </p>
              ${po.supervisor_remarks ? `
                <div style="margin-top:6px;padding:6px 10px;background:rgba(2,132,199,0.08);border-radius:6px;font-size:0.78rem;color:#0369a1;">
                  <strong>Coordinator Note:</strong> &ldquo;${esc(po.supervisor_remarks)}&rdquo;
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (po.status === 'printed_pending_signature' || po.status === 'emailed_to_dean') {
    const isEmailed = po.status === 'emailed_to_dean';
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(99,102,241,0.06) 100%);border:1.5px solid rgba(79,70,229,0.3);border-left:5px solid #4f46e5;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(79,70,229,0.12);color:#4f46e5;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon(isEmailed ? 'send' : 'printer', 20)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#3730a3;">
                  Endorsement Letter Sent to Dean &middot; Stage 3: Dean's Conforme
                </h3>
                <span class="badge" style="background:#EEF2FF;color:#4338ca;font-weight:700;font-size:0.7rem;padding:2px 8px;">
                  ${isEmailed ? 'Awaiting Dean Email Response' : 'Pending Physical Dean Signature'}
                </span>
              </div>
              <p style="margin:4px 0 0;font-size:0.83rem;color:#312e81;line-height:1.45;">
                ${isEmailed 
                  ? `The official pull-out memorandum was emailed to <strong>${esc(po.dean_name || 'the Dean')}</strong>. We are awaiting the Dean's formal email reply to finalize your clearance.`
                  : `The official pull-out memorandum has been generated and printed. The Program Chair is obtaining physical Dean signatures.`
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (po.status === 'approved') {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(16,185,129,0.08) 100%);border:1.5px solid rgba(0,89,48,0.25);border-left:5px solid #005930;padding:16px 20px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('checkCircle', 20)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:#005930;">OJT Pull-Out Officially Approved by College Dean</h3>
                <span class="badge" style="background:#D1FAE5;color:#065F46;font-weight:700;font-size:0.7rem;padding:2px 8px;">Cleared for Re-deployment</span>
              </div>
              <p style="margin:4px 0 0;font-size:0.83rem;color:#064e3b;line-height:1.45;">
                Your placement with <strong>${esc(ojt.company || 'Host Company')}</strong> has been officially concluded with the Dean's authorization.
                <strong>${po.credited_hours !== null && po.credited_hours !== undefined ? po.credited_hours : ojt.hoursRendered} Hours</strong> have been credited to your training record.
                You are authorized to express interest and be endorsed to an alternative OJT company.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  if (po.status === 'rejected' || po.status === 'rejected_by_supervisor') {
    return `
      <section class="page-section animate-fade-in-up" style="margin-bottom:14px;">
        <div class="jp-card ojt-status-banner-card" style="background:#FEF2F2;border:1.5px solid rgba(239,68,68,0.3);border-left:5px solid #dc2626;padding:14px 18px;border-radius:12px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(239,68,68,0.12);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('alertTriangle', 18)}
            </div>
            <div>
              <h4 style="margin:0;font-size:0.96rem;font-weight:700;color:#991b1b;">OJT Pull-Out Request Not Approved</h4>
              <p style="margin:3px 0 0;font-size:0.82rem;color:#7f1d1d;line-height:1.45;">
                ${esc(po.admin_remarks || po.supervisor_remarks || 'Your pull-out request was declined. Please consult your academic coordinator regarding your training assignment.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  return '';
}

function setupModalDropzone(dropzoneEl, fileInput, previewEl, nameEl, sizeEl, removeBtn) {
  if (!dropzoneEl || !fileInput || !previewEl) return;

  const updatePreview = (file) => {
    if (!file) {
      previewEl.style.display = 'none';
      dropzoneEl.style.display = 'flex';
      return;
    }
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) {
      const kb = file.size / 1024;
      sizeEl.textContent = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
    }
    dropzoneEl.style.display = 'none';
    previewEl.style.display = 'flex';
  };

  dropzoneEl.addEventListener('click', () => fileInput.click());

  dropzoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneEl.classList.add('is-dragover');
  });

  ['dragleave', 'dragend'].forEach(ev => {
    dropzoneEl.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('is-dragover');
    });
  });

  dropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneEl.classList.remove('is-dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      updatePreview(fileInput.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      updatePreview(fileInput.files[0]);
    } else {
      updatePreview(null);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      updatePreview(null);
    });
  }
}

function setupCharCounter(textarea, counterEl, minLength) {
  if (!textarea || !counterEl) return;
  const update = () => {
    const len = textarea.value.length;
    counterEl.textContent = `${len} / ${minLength} min`;
    if (len >= minLength) {
      counterEl.classList.add('ojt-req-char-count--valid');
    } else {
      counterEl.classList.remove('ojt-req-char-count--valid');
    }
  };
  textarea.addEventListener('input', update);
  update();
}

function openPullOutModal(ojt, onSubmitted) {
  const existing = document.getElementById('pull-out-modal-overlay');
  if (existing) existing.remove();

  const bd = document.createElement('div');
  bd.id = 'pull-out-modal-overlay';
  bd.className = 'ojt-req-overlay';

  const hoursPct = ojt.totalHours > 0 ? Math.round(((ojt.hoursRendered || 0) / ojt.totalHours) * 100) : 0;

  bd.innerHTML = `
    <div class="ojt-req-modal" role="dialog" aria-modal="true" aria-labelledby="po-modal-title">
      <!-- Modal Header -->
      <div class="ojt-req-header ojt-req-header--pullout">
        <div class="ojt-req-title-wrap">
          <div class="ojt-req-header-icon ojt-req-header-icon--danger">
            ${icon('fileText', 22)}
          </div>
          <div>
            <h3 id="po-modal-title" class="ojt-req-title">Request Official OJT Pull-Out</h3>
            <div class="ojt-req-meta-pills">
              <span class="ojt-req-meta-pill">${icon('building', 12)} ${esc(ojt.company || 'Host Enterprise')}</span>
              <span class="ojt-req-meta-pill">${icon('clock', 12)} ${ojt.hoursRendered || 0} / ${ojt.totalHours || 600} hrs (${hoursPct}%)</span>
            </div>
          </div>
        </div>
        <button type="button" class="ojt-req-close-btn" id="po-close-btn" aria-label="Close dialog">
          ${icon('x', 18)}
        </button>
      </div>

      <form id="pull-out-form" style="display:flex;flex-direction:column;flex:1;overflow:hidden;margin:0;">
        <div class="ojt-req-body">
          <div id="po-error-box" style="display:none;background:#FEF2F2;border:1.5px solid #FCA5A5;color:#991B1B;padding:12px 14px;border-radius:10px;font-size:0.83rem;line-height:1.45;"></div>

          <!-- Pull-Out Category -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label for="po-reason-category" class="ojt-req-label">
                Grounds / Category for Pull-Out <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <select id="po-reason-category" name="reason_category" class="ojt-req-select" required>
              <option value="breach_of_moa">Breach of MOA / Working Hours &amp; Allowance Violation</option>
              <option value="safety_hostile">Workplace Safety Hazard / Harassment / Hostile Environment</option>
              <option value="task_mismatch">Task Mismatch / Assigned Tasks Not Aligned with Curriculum</option>
              <option value="medical_personal">Severe Medical Condition / Personal Hardship</option>
              <option value="relocation">Unforeseen Geographical Relocation / Distance</option>
              <option value="other">Other Valid Grounds</option>
            </select>
          </div>

          <!-- Detailed Statement -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label for="po-reason" class="ojt-req-label">
                Detailed Statement &amp; Justification <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <textarea id="po-reason" name="reason" class="ojt-req-textarea" rows="4" placeholder="Explain clearly the specific events, non-compliances, or reasons requiring your withdrawal from this host establishment..." required minlength="20"></textarea>
            <div class="ojt-req-helper-row">
              <span>Be specific and truthful. Official academic record.</span>
              <span id="po-char-count" class="ojt-req-char-count">0 / 20 min</span>
            </div>
          </div>

          <!-- Official Letter Upload -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label class="ojt-req-label">
                Upload Formal Pull-Out Request Letter <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <input type="file" id="po-letter" name="letter" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display:none;" required>
            <div id="po-dropzone" class="ojt-dropzone">
              <div class="ojt-dropzone-icon-box">
                ${icon('uploadCloud', 24)}
              </div>
              <div class="ojt-dropzone-text">
                <strong>Click to browse</strong> or drag &amp; drop letter here
              </div>
              <div class="ojt-dropzone-hint">
                Signed formal letter &middot; PDF, DOCX, JPG, PNG &middot; Max 10MB
              </div>
            </div>

            <div id="po-file-preview" style="display:none;" class="ojt-file-preview-card">
              <div class="ojt-file-preview-left">
                <div class="ojt-file-preview-icon">
                  ${icon('fileText', 20)}
                </div>
                <div class="ojt-file-preview-details">
                  <div class="ojt-file-preview-name" id="po-file-name">letter.pdf</div>
                  <div class="ojt-file-preview-meta">
                    <span id="po-file-size">0 KB</span> &middot; Ready to submit
                  </div>
                </div>
              </div>
              <button type="button" class="ojt-file-remove-btn" id="po-remove-file-btn">
                ${icon('trash', 14)} Remove
              </button>
            </div>
          </div>

          <!-- Institutional Governance Protocol Notice -->
          <div class="ojt-protocol-card">
            <div class="ojt-protocol-header">
              ${icon('shieldCheck', 16)}
              <span>Institutional Governance Protocol</span>
            </div>
            <p class="ojt-protocol-body">
              Your request letter will be submitted to your <strong>Academic OJT Coordinator</strong> for evaluation. Once recommended, the <strong>Program Chair (Admin)</strong> will generate an official endorsement memorandum to the <strong>College Dean</strong> for printing or email routing.
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="ojt-req-footer">
          <button type="button" class="btn btn--outline" id="po-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="po-submit-btn" style="background:#b91c1c;border-color:#b91c1c;gap:6px;box-shadow:0 4px 12px rgba(185,28,28,0.25);">
            ${icon('send', 14)} Submit Pull-Out Request
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(bd);

  const close = () => bd.remove();
  bd.querySelector('#po-close-btn').addEventListener('click', close);
  bd.querySelector('#po-cancel-btn').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  const letterInput = bd.querySelector('#po-letter');
  const dropzone = bd.querySelector('#po-dropzone');
  const preview = bd.querySelector('#po-file-preview');
  const nameEl = bd.querySelector('#po-file-name');
  const sizeEl = bd.querySelector('#po-file-size');
  const removeBtn = bd.querySelector('#po-remove-file-btn');
  setupModalDropzone(dropzone, letterInput, preview, nameEl, sizeEl, removeBtn);

  const reasonEl = bd.querySelector('#po-reason');
  const charCounter = bd.querySelector('#po-char-count');
  setupCharCounter(reasonEl, charCounter, 20);

  const form = bd.querySelector('#pull-out-form');
  const errorBox = bd.querySelector('#po-error-box');
  const submitBtn = bd.querySelector('#po-submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Submitting…`;

    try {
      const fd = new FormData(form);
      const res = await apiUpload('/student/ojt-pull-out', fd);
      if (res && res.success) {
        bd.remove();
        showToast(res.message || 'Pull-out request submitted. Your coordinator has been alerted.', 'success');
        if (onSubmitted) onSubmitted();
      } else {
        errorBox.textContent = res?.message || 'Failed to submit pull-out request. Please check inputs.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 14)} Submit Pull-Out Request`;
      }
    } catch (err) {
      errorBox.textContent = err.message || 'An unexpected error occurred. Please try again.';
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('send', 14)} Submit Pull-Out Request`;
    }
  });
}

function openEmergencyModal(ojt, onSubmitted) {
  const existing = document.getElementById('emergency-modal-overlay');
  if (existing) existing.remove();

  const bd = document.createElement('div');
  bd.id = 'emergency-modal-overlay';
  bd.className = 'ojt-req-overlay';

  const todayIso = new Date().toISOString().split('T')[0];
  const hoursPct = ojt.totalHours > 0 ? Math.round(((ojt.hoursRendered || 0) / ojt.totalHours) * 100) : 0;

  bd.innerHTML = `
    <div class="ojt-req-modal" role="dialog" aria-modal="true" aria-labelledby="emer-modal-title">
      <!-- Modal Header -->
      <div class="ojt-req-header ojt-req-header--emergency">
        <div class="ojt-req-title-wrap">
          <div class="ojt-req-header-icon ojt-req-header-icon--danger">
            ${icon('alertTriangle', 22)}
          </div>
          <div>
            <h3 id="emer-modal-title" class="ojt-req-title">Report Emergency / Leave Notice</h3>
            <div class="ojt-req-meta-pills">
              <span class="ojt-req-meta-pill">${icon('building', 12)} ${esc(ojt.company || 'Host Enterprise')}</span>
              <span class="ojt-req-meta-pill">${icon('clock', 12)} ${ojt.hoursRendered || 0} / ${ojt.totalHours || 600} hrs (${hoursPct}%)</span>
            </div>
          </div>
        </div>
        <button type="button" class="ojt-req-close-btn" id="emer-close-btn" aria-label="Close dialog">
          ${icon('x', 18)}
        </button>
      </div>

      <form id="emergency-form" style="display:flex;flex-direction:column;flex:1;overflow:hidden;margin:0;">
        <div class="ojt-req-body">
          <div id="emer-error-box" style="display:none;background:#FEF2F2;border:1.5px solid #FCA5A5;color:#991B1B;padding:12px 14px;border-radius:10px;font-size:0.83rem;line-height:1.45;"></div>

          <!-- Request Type Selectable Cards -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label class="ojt-req-label">
                Request Type <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <div class="ojt-req-type-grid">
              <label id="type-opt-leave" class="ojt-req-card-option ojt-req-card-option--leave is-selected">
                <input type="radio" name="type" value="temporary_leave" checked>
                <div class="opt-title">
                  <span>Temporary Leave</span>
                </div>
                <div class="opt-desc">Temporary absence with intent to resume. Hours stay safe.</div>
              </label>
              <label id="type-opt-withdraw" class="ojt-req-card-option ojt-req-card-option--stoppage">
                <input type="radio" name="type" value="permanent_withdrawal">
                <div class="opt-title">
                  <span>Formal Stoppage</span>
                </div>
                <div class="opt-desc">Discontinue training for this semester. Hours credited by coordinator.</div>
              </label>
            </div>
          </div>

          <!-- Emergency Category -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label for="emer-category" class="ojt-req-label">
                Emergency Category <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <select id="emer-category" name="category" class="ojt-req-select" required>
              <option value="medical">Medical Emergency / Severe Illness / Hospitalization</option>
              <option value="accident">Accident / Physical Injury</option>
              <option value="family_emergency">Family Emergency / Bereavement</option>
              <option value="financial_personal">Severe Personal / Financial Hardship</option>
              <option value="other">Other Urgent Matter</option>
            </select>
          </div>

          <!-- Dates -->
          <div class="ojt-emer-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="ojt-req-form-group">
              <div class="ojt-req-label-row">
                <label for="emer-start-date" class="ojt-req-label">
                  Effective Start Date <span class="ojt-req-required-star">*</span>
                </label>
              </div>
              <input type="date" id="emer-start-date" name="start_date" class="ojt-req-input" value="${todayIso}" required>
            </div>
            <div id="expected-return-group" class="ojt-req-form-group">
              <div class="ojt-req-label-row">
                <label for="emer-return-date" class="ojt-req-label">
                  Expected Return Date <span class="ojt-req-required-star">*</span>
                </label>
              </div>
              <input type="date" id="emer-return-date" name="expected_return_date" class="ojt-req-input" min="${todayIso}" required>
            </div>
          </div>

          <!-- Reason & Circumstances -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label for="emer-reason" class="ojt-req-label">
                Reason &amp; Circumstances <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <textarea id="emer-reason" name="reason" class="ojt-req-textarea" rows="3" placeholder="Describe your medical condition, hospitalization, doctor's advice, or emergency circumstances..." required minlength="15"></textarea>
            <div class="ojt-req-helper-row">
              <span>Required for coordinator validation.</span>
              <span id="emer-char-count" class="ojt-req-char-count">0 / 15 min</span>
            </div>
          </div>

          <!-- Supporting Document Upload -->
          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label class="ojt-req-label">
                Supporting Document (Medical Certificate / Doctor Note / Excuse Letter)
              </label>
              <span class="ojt-req-optional-tag">Optional</span>
            </div>
            <input type="file" id="emer-doc" name="document" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
            <div id="emer-dropzone" class="ojt-dropzone">
              <div class="ojt-dropzone-icon-box">
                ${icon('uploadCloud', 24)}
              </div>
              <div class="ojt-dropzone-text">
                <strong>Click to browse</strong> or drag &amp; drop document here
              </div>
              <div class="ojt-dropzone-hint">
                PDF, JPG, PNG &middot; Max 5MB &middot; Strongly recommended for prompt approval
              </div>
            </div>

            <div id="emer-file-preview" style="display:none;" class="ojt-file-preview-card">
              <div class="ojt-file-preview-left">
                <div class="ojt-file-preview-icon">
                  ${icon('fileText', 20)}
                </div>
                <div class="ojt-file-preview-details">
                  <div class="ojt-file-preview-name" id="emer-file-name">document.pdf</div>
                  <div class="ojt-file-preview-meta">
                    <span id="emer-file-size">0 KB</span> &middot; Ready to submit
                  </div>
                </div>
              </div>
              <button type="button" class="ojt-file-remove-btn" id="emer-remove-file-btn">
                ${icon('trash', 14)} Remove
              </button>
            </div>
          </div>

          <!-- Notice Banner -->
          <div class="ojt-protocol-card">
            <div class="ojt-protocol-header">
              ${icon('shieldCheck', 16)}
              <span>Official Protocol Notice</span>
            </div>
            <p class="ojt-protocol-body">
              Filing this notice immediately alerts both your <strong>Academic OJT Coordinator</strong> and <strong>Host Company</strong>. Daily time-in will be frozen so you are not marked absent.
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="ojt-req-footer">
          <button type="button" class="btn btn--outline" id="emer-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="emer-submit-btn" style="background:#dc2626;border-color:#dc2626;gap:6px;box-shadow:0 4px 12px rgba(220,38,38,0.25);">
            ${icon('send', 14)} Submit Notice
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(bd);

  const typeRadios = bd.querySelectorAll('input[name="type"]');
  const returnGroup = bd.querySelector('#expected-return-group');
  const returnInput = bd.querySelector('input[name="expected_return_date"]');
  const leaveCard = bd.querySelector('#type-opt-leave');
  const withdrawCard = bd.querySelector('#type-opt-withdraw');

  typeRadios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'permanent_withdrawal') {
        leaveCard.classList.remove('is-selected');
        withdrawCard.classList.add('is-selected');
        returnGroup.style.display = 'none';
        returnInput.removeAttribute('required');
      } else {
        withdrawCard.classList.remove('is-selected');
        leaveCard.classList.add('is-selected');
        returnGroup.style.display = 'block';
        returnInput.setAttribute('required', 'required');
      }
    });
  });

  const close = () => bd.remove();
  bd.querySelector('#emer-close-btn').addEventListener('click', close);
  bd.querySelector('#emer-cancel-btn').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  const docInput = bd.querySelector('#emer-doc');
  const dropzone = bd.querySelector('#emer-dropzone');
  const preview = bd.querySelector('#emer-file-preview');
  const nameEl = bd.querySelector('#emer-file-name');
  const sizeEl = bd.querySelector('#emer-file-size');
  const removeBtn = bd.querySelector('#emer-remove-file-btn');
  setupModalDropzone(dropzone, docInput, preview, nameEl, sizeEl, removeBtn);

  const reasonEl = bd.querySelector('#emer-reason');
  const charCounter = bd.querySelector('#emer-char-count');
  setupCharCounter(reasonEl, charCounter, 15);

  const form = bd.querySelector('#emergency-form');
  const errorBox = bd.querySelector('#emer-error-box');
  const submitBtn = bd.querySelector('#emer-submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Submitting…`;

    try {
      const fd = new FormData(form);
      const res = await apiUpload('/student/ojt-emergency', fd);
      if (res && res.success) {
        bd.remove();
        showToast(res.message || 'Emergency notice submitted successfully. Coordinator alerted.', 'success');
        if (onSubmitted) onSubmitted();
      } else {
        errorBox.textContent = res?.message || 'Failed to submit emergency notice. Please try again.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 14)} Submit Notice`;
      }
    } catch (err) {
      errorBox.textContent = err.message || 'An unexpected error occurred. Please try again.';
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('send', 14)} Submit Notice`;
    }
  });
}

function openFitToWorkModal(emergency, onSubmitted) {
  const existing = document.getElementById('fit-to-work-modal-overlay');
  if (existing) existing.remove();

  const bd = document.createElement('div');
  bd.id = 'fit-to-work-modal-overlay';
  bd.className = 'ojt-req-overlay';

  bd.innerHTML = `
    <div class="ojt-req-modal" style="max-width:500px;" role="dialog" aria-modal="true" aria-labelledby="ftw-modal-title">
      <!-- Modal Header -->
      <div class="ojt-req-header ojt-req-header--ftw">
        <div class="ojt-req-title-wrap">
          <div class="ojt-req-header-icon ojt-req-header-icon--info">
            ${icon('shieldCheck', 22)}
          </div>
          <div>
            <h3 id="ftw-modal-title" class="ojt-req-title">Resume OJT Training</h3>
            <div class="ojt-req-meta-pills">
              <span class="ojt-req-meta-pill">${icon('shield', 12)} Medical Fit-to-Work Clearance</span>
            </div>
          </div>
        </div>
        <button type="button" class="ojt-req-close-btn" id="ftw-close-btn" aria-label="Close dialog">
          ${icon('x', 18)}
        </button>
      </div>

      <form id="ftw-form" style="display:flex;flex-direction:column;flex:1;overflow:hidden;margin:0;">
        <div class="ojt-req-body">
          <div id="ftw-error-box" style="display:none;background:#FEF2F2;border:1.5px solid #FCA5A5;color:#991B1B;padding:12px 14px;border-radius:10px;font-size:0.83rem;line-height:1.45;"></div>

          <p style="margin:0;font-size:0.84rem;color:var(--text-secondary);line-height:1.5;">
            Please attach your official medical certificate or clearance issued by a licensed physician stating that you are medically fit to resume your internship duties.
          </p>

          <div class="ojt-req-form-group">
            <div class="ojt-req-label-row">
              <label class="ojt-req-label">
                Medical Clearance Document <span class="ojt-req-required-star">*</span>
              </label>
            </div>
            <input type="file" id="ftw-doc" name="document" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" required>
            <div id="ftw-dropzone" class="ojt-dropzone">
              <div class="ojt-dropzone-icon-box">
                ${icon('uploadCloud', 24)}
              </div>
              <div class="ojt-dropzone-text">
                <strong>Click to browse</strong> or drag &amp; drop clearance here
              </div>
              <div class="ojt-dropzone-hint">
                PDF, JPG, PNG &middot; Max 5MB
              </div>
            </div>

            <div id="ftw-file-preview" style="display:none;" class="ojt-file-preview-card">
              <div class="ojt-file-preview-left">
                <div class="ojt-file-preview-icon">
                  ${icon('fileText', 20)}
                </div>
                <div class="ojt-file-preview-details">
                  <div class="ojt-file-preview-name" id="ftw-file-name">clearance.pdf</div>
                  <div class="ojt-file-preview-meta">
                    <span id="ftw-file-size">0 KB</span> &middot; Ready to submit
                  </div>
                </div>
              </div>
              <button type="button" class="ojt-file-remove-btn" id="ftw-remove-file-btn">
                ${icon('trash', 14)} Remove
              </button>
            </div>
          </div>
        </div>

        <div class="ojt-req-footer">
          <button type="button" class="btn btn--outline" id="ftw-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="ftw-submit-btn" style="gap:6px;background:#0284c7;border-color:#0284c7;box-shadow:0 4px 12px rgba(2,132,199,0.25);">
            ${icon('upload', 14)} Submit Clearance
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(bd);

  const close = () => bd.remove();
  bd.querySelector('#ftw-close-btn').addEventListener('click', close);
  bd.querySelector('#ftw-cancel-btn').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  const docInput = bd.querySelector('#ftw-doc');
  const dropzone = bd.querySelector('#ftw-dropzone');
  const preview = bd.querySelector('#ftw-file-preview');
  const nameEl = bd.querySelector('#ftw-file-name');
  const sizeEl = bd.querySelector('#ftw-file-size');
  const removeBtn = bd.querySelector('#ftw-remove-file-btn');
  setupModalDropzone(dropzone, docInput, preview, nameEl, sizeEl, removeBtn);

  const form = bd.querySelector('#ftw-form');
  const errorBox = bd.querySelector('#ftw-error-box');
  const submitBtn = bd.querySelector('#ftw-submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Uploading…`;

    try {
      const fd = new FormData(form);
      const res = await apiUpload('/student/ojt-emergency/fit-to-work', fd);
      if (res && res.success) {
        bd.remove();
        showToast(res.message || 'Fit-to-Work clearance uploaded successfully.', 'success');
        if (onSubmitted) onSubmitted();
      } else {
        errorBox.textContent = res?.message || 'Failed to upload clearance. Please try again.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('upload', 14)} Submit Clearance`;
      }
    } catch (err) {
      errorBox.textContent = err.message || 'An unexpected error occurred. Please try again.';
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('upload', 14)} Submit Clearance`;
    }
  });
}


// ── Monthly Evaluation Presentation ─────────────────────────────────────────
function renderEvaluationBannerHtml(evaluation) {
  if (!evaluation) return '';

  const monthlyEvals = evaluation.monthly_evaluations || [];
  const runningAverage = evaluation.running_average_score ?? evaluation.composite_score ?? null;
  const submittedCount = evaluation.submitted_count ?? monthlyEvals.filter(e => e.status === 'submitted').length;

  const hasMonthly = monthlyEvals.length > 0;
  const hasLegacy  = !hasMonthly && evaluation.overall_score;

  if (!hasMonthly && !hasLegacy) return '';

  // Legacy single evaluation fallback
  if (hasLegacy) {
    return `
      <section class="page-section animate-fade-in-up" style="animation-delay:40ms;margin-bottom:16px;">
        <div class="jp-card ojt-eval-banner-card" style="background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(16,185,129,0.08) 100%);border:1.5px solid rgba(0,89,48,0.25);border-radius:var(--radius-lg);padding:20px 24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:48px;height:48px;border-radius:50%;background:#005930;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">
                ${icon('star', 22)}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:var(--text-primary);">OJT Performance Evaluation Completed</h3>
                  <span class="badge badge--success" style="font-size:0.7rem;padding:2px 8px;">Official Rating</span>
                </div>
                <p class="text-sm text-secondary" style="margin:2px 0 0;">
                  Submitted by <strong>${esc(evaluation.company?.name || 'Host Company')}</strong> &bull; Evaluated by ${esc(evaluation.evaluator_name || 'HR Supervisor')} (${esc(evaluation.evaluator_position || 'Company Representative')})
                </p>
              </div>
            </div>
            <div style="text-align:right;">
              <div class="text-xs text-secondary" style="font-weight:600;text-transform:uppercase;">Overall Score</div>
              <div style="font-size:1.75rem;font-weight:800;color:var(--color-primary);margin-top:2px;">
                ${Number(evaluation.overall_score).toFixed(1)} <span style="font-size:0.9rem;font-weight:600;color:var(--text-secondary);">/ 5.0</span>
              </div>
            </div>
          </div>
          ${evaluation.recommendation ? `
            <div style="margin-top:12px;padding:8px 12px;background:rgba(0,89,48,0.08);border-radius:6px;font-size:0.85rem;font-weight:600;color:var(--color-primary);">
              Recommendation: ${esc(evaluation.recommendation)}
            </div>
          ` : ''}
          ${evaluation.general_feedback ? `
            <p class="text-sm" style="margin:10px 0 0;font-style:italic;color:var(--text-secondary);line-height:1.5;">
              &ldquo;${esc(evaluation.general_feedback)}&rdquo;
            </p>
          ` : ''}
        </div>
      </section>
    `;
  }

  // Monthly Evaluations Progression Presentation
  return `
    <section class="page-section animate-fade-in-up" style="animation-delay:40ms;margin-bottom:16px;">
      <div class="jp-card ojt-eval-banner-card" style="background:var(--bg-card,#fff);border:1.5px solid var(--border-light,#e2e8f0);border-radius:var(--radius-lg);padding:22px 24px;box-shadow:0 4px 15px rgba(0,0,0,0.03);">
        
        <!-- Header & Running Average Score Badge -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;border-bottom:1px solid var(--border-light,#e2e8f0);padding-bottom:16px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">
              ${icon('award', 24)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h3 style="margin:0;font-size:1.08rem;font-weight:700;color:var(--text-primary);">Academic OJT Performance Evaluations</h3>
                <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:700;padding:2px 8px;">Monthly Appraisal System</span>
              </div>
              <p class="text-xs text-secondary" style="margin:3px 0 0;">
                Periodic performance evaluations conducted by host partner supervisors throughout your practicum training.
              </p>
            </div>
          </div>
          ${runningAverage !== null ? `
            <div style="background:linear-gradient(135deg, rgba(0,89,48,0.08) 0%, rgba(16,185,129,0.1) 100%);border:1.5px solid rgba(0,89,48,0.25);border-radius:10px;padding:8px 16px;text-align:right;">
              <div class="text-xs text-secondary" style="font-weight:700;text-transform:uppercase;color:#005930;">Running Average Rating</div>
              <div style="font-size:1.6rem;font-weight:800;color:var(--color-primary);line-height:1.1;margin-top:2px;">
                ${Number(runningAverage).toFixed(2)} <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">/ 5.0</span>
              </div>
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">
                Based on ${submittedCount} submitted appraisal${submittedCount === 1 ? '' : 's'}
              </div>
            </div>
          ` : `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">
              <em>Cumulative rating calculated as appraisals are submitted</em>
            </div>
          `}
        </div>

        <!-- Monthly Cards Grid -->
        <div class="ojt-eval-terms-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
          ${monthlyEvals.map(ev => {
            const isSub = ev.status === 'submitted';
            const isWai = ev.status === 'waived' || ev.is_waived;
            const isSent = ev.status === 'sent' || ev.status === 'pending';
            const scoreNum = Number(ev.overall_score || 0);

            return `
              <div style="border:1.5px solid ${isSub ? 'rgba(0,89,48,0.25)' : (isWai ? 'rgba(245,158,11,0.3)' : 'var(--border-light,#e2e8f0)')};border-radius:10px;padding:16px;background:${isSub ? 'rgba(0,89,48,0.03)' : (isWai ? '#FFFBEB' : '#fafafa')};">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                  <span style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-primary);">
                    ${esc(ev.month_label || 'Monthly Appraisal')}
                  </span>
                  ${isSub ? '<span class="badge badge--success" style="font-size:0.7rem;padding:2px 8px;">Submitted</span>'
                    : isWai ? '<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:0.7rem;font-weight:700;padding:2px 8px;">Waived</span>'
                    : '<span class="badge" style="background:#DBEAFE;color:#1E40AF;font-size:0.7rem;font-weight:700;padding:2px 8px;">Awaiting Review</span>'}
                </div>

                ${isSub ? `
                  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;">
                    <div style="font-size:1.5rem;font-weight:800;color:var(--color-primary);">
                      ${scoreNum.toFixed(1)} <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">/ 5.0</span>
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">
                      ${esc(ev.submitted_at || '')}
                    </div>
                  </div>
                  <p class="text-xs text-secondary" style="margin:0 0 6px;">
                    <strong>${esc(ev.company?.name || 'Host Company')}</strong>${ev.evaluator_name ? ` &bull; ${esc(ev.evaluator_name)} (${esc(ev.evaluator_position || 'Supervisor')})` : ''}
                  </p>
                  ${ev.recommendation ? `
                    <div style="margin-top:8px;padding:6px 10px;background:rgba(0,89,48,0.06);border-radius:6px;font-size:0.75rem;font-weight:600;color:#005930;">
                      Recommendation: ${esc(ev.recommendation)}
                    </div>
                  ` : ''}
                  ${ev.general_feedback ? `
                    <p class="text-xs" style="margin:8px 0 0;font-style:italic;color:var(--text-secondary);line-height:1.4;">
                      &ldquo;${esc(ev.general_feedback)}&rdquo;
                    </p>
                  ` : ''}
                ` : isWai ? `
                  <div style="font-size:0.82rem;color:#92400E;line-height:1.45;">
                    <strong>Appraisal Waived:</strong> Officially exempted by academic coordinator.
                  </div>
                  ${ev.waiver_reason ? `
                    <div style="margin-top:8px;padding:6px 10px;background:rgba(245,158,11,0.12);border-radius:6px;font-size:0.75rem;color:#78350F;">
                      <strong>Reason:</strong> ${esc(ev.waiver_reason)}
                    </div>
                  ` : ''}
                ` : `
                  <div style="font-size:0.82rem;color:#1E40AF;line-height:1.45;">
                    Dispatched to <strong>${esc(ev.company?.name || 'Host Company')}</strong>. Awaiting supervisor submission.
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderTrackerPage(container, ojt, logs, year, month, onMonthChange, evaluation = null) {
  // Use raw float so the ring always reflects real progress (Math.round kills <0.5%)
  const hoursRendered = parseFloat(ojt.hoursRendered) || 0;
  const totalHours    = parseFloat(ojt.totalHours)    || 0;
  const pctRaw        = totalHours > 0 ? (hoursRendered / totalHours) * 100 : 0;
  const pctClamped    = Math.min(100, pctRaw);
  // Display: 1 decimal for <10%, whole number for ≥10%
  const pctDisplay    = pctClamped === 0 ? '0' : pctClamped < 10 ? pctClamped.toFixed(1) : Math.round(pctClamped).toString();
  const circumference = 2 * Math.PI * 54;
  const dashOffset    = circumference - (pctClamped / 100) * circumference;
  const ringColor     = pctClamped >= 80 ? 'var(--color-success)' : pctClamped >= 40 ? 'var(--color-accent)' : 'var(--color-warning)';

  const prevM = month === 0  ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextM = month === 11 ? { y: year + 1, m: 0  } : { y: year, m: month + 1 };

  // Build log map keyed by date string
  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  const sched = ojt.schedule || {};
  const todayLog = logMap[TODAY_STR] || sched.todayLog || null;

  // Determine work day validity & session state
  const isWorkDay = sched.isWorkDay !== false;
  const sessionState = sched.sessionState || (
    !isWorkDay ? 'off_day' : (!todayLog ? 'ready_morning_in' : (todayLog.afternoonOut ? 'day_completed' : 'morning_active'))
  );

  // Check if student reached 100% of required OJT hours and evaluation state
  const isOjtHoursCompleted = (totalHours > 0 && hoursRendered >= totalHours)
    || ojt.isCompleted === true
    || ojt.recordStatus === 'completed'
    || sessionState === 'ojt_completed';

  const hasPendingEval = Boolean(evaluation?.has_pending_evaluations || (evaluation?.pending_count && evaluation.pending_count > 0));
  const hasSubmittedEval = Boolean((evaluation?.submitted_count && evaluation.submitted_count > 0) || evaluation?.running_average_score !== null || evaluation?.endterm?.status === 'submitted');
  const isEvaluationCompleted = hasSubmittedEval && !hasPendingEval;
  const isWaitingForEvaluation = isOjtHoursCompleted && !isEvaluationCompleted;

  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const schedDays = Array.isArray(sched.days) && sched.days.length ? sched.days.join(', ') : '';
  const shiftText = sched.shiftStart && sched.shiftEnd ? `${sched.shiftStart} – ${sched.shiftEnd}` : '';
  const lunchText = sched.hasLunchBreak !== false && sched.lunchStart && sched.lunchEnd ? `Lunch: ${sched.lunchStart}–${sched.lunchEnd}` : '';

  let punchClockHtml = '';
  if (ojt.is_withdrawn) {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(239,68,68,0.1);color:#dc2626;border:1px solid rgba(239,68,68,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('alertCircle', 15)} OJT Withdrawn (Emergency Discontinuation)
      </div>
    `;
  } else if (isOjtHoursCompleted) {
    punchClockHtml = isWaitingForEvaluation ? `
      <div class="ojt-waiting-eval-pill" style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,158,11,0.12);color:#b45309;border:1px solid rgba(245,158,11,0.35);padding:8px 16px;border-radius:99px;font-size:0.84rem;font-weight:700;">
        ${icon('clock', 15)} 100% Hours Completed &middot; Waiting for Evaluation
      </div>
    ` : `
      <div class="ojt-completed-eval-pill" style="display:inline-flex;align-items:center;gap:8px;background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.3);padding:8px 16px;border-radius:99px;font-size:0.84rem;font-weight:700;">
        ${icon('checkCircle', 15)} OJT Completed &amp; Evaluated
      </div>
    `;
  } else if (ojt.is_pull_out_pending) {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,158,11,0.12);color:#b45309;border:1px solid rgba(245,158,11,0.28);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('clock', 15)} Pull-Out Request In Process &middot; Attendance Paused
      </div>
    `;
  } else if (ojt.is_on_leave) {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(2,132,199,0.1);color:#0284c7;border:1px solid rgba(2,132,199,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('shieldCheck', 15)} On Medical / Emergency Leave (Time-in Locked)
      </div>
    `;
  } else if (ojt.emergency_pending) {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,158,11,0.1);color:#b45309;border:1px solid rgba(245,158,11,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('clock', 15)} Leave Notice Pending Review (Attendance Paused)
      </div>
    `;
  } else if (!isWorkDay) {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:var(--bg-secondary);color:var(--text-tertiary);border:1px solid var(--border-light);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('calendar', 15)} Non-Working Day (${sched.todayDay || 'Off Day'})
      </div>
    `;
  } else if (sessionState === 'before_shift') {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(59,130,246,0.1);color:#1d4ed8;border:1px solid rgba(59,130,246,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;" title="Morning time-in opens 1 hour before shift start">
        ${icon('clock', 15)} Shift starts at ${sched.shiftStart || '8:00 AM'} &middot; Morning time-in opens soon
      </div>
    `;
  } else if (sessionState === 'excused_today') {
    punchClockHtml = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(2,132,199,0.1);color:#0284c7;border:1px solid rgba(2,132,199,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;">
        ${icon('shieldCheck', 15)} Approved Leave &middot; Excused Today
      </div>
    `;
  } else if (sessionState === 'shift_ended') {
    const amNote = todayLog?.morningIn ? `AM: ${todayLog.morningIn} – ${todayLog.morningOut || '12:00'}` : null;
    punchClockHtml = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${amNote ? `
          <span style="display:flex;align-items:center;gap:6px;background:rgba(16,185,129,0.1);color:#059669;padding:8px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;">
            ${icon('checkCircle', 14)} ${amNote}
          </span>
        ` : ''}
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(239,68,68,0.1);color:#dc2626;border:1px solid rgba(239,68,68,0.25);padding:8px 16px;border-radius:99px;font-size:0.83rem;font-weight:600;" title="Today's scheduled shift has ended. You can time in again tomorrow morning.">
          ${icon('alertCircle', 15)} ${todayLog?.status === 'absent' ? `Marked Absent (${sched.shiftEnd || '5:00 PM'})` : `Shift Ended (${sched.shiftEnd || '5:00 PM'})`} &middot; Time-in Closed for Today
        </div>
      </div>
    `;
  } else if (sessionState === 'ready_morning_in') {
    punchClockHtml = `
      <button class="btn btn--primary" id="btn-morning-in" style="display:flex;align-items:center;gap:8px;">
        ${icon('logIn', 16)} Time In (Morning)
      </button>
    `;
  } else if (sessionState === 'morning_active') {
    const amIn = todayLog?.morningIn || todayLog?.timeIn || '—';
    punchClockHtml = `
      <span style="display:flex;align-items:center;gap:6px;background:var(--color-info-bg);color:var(--color-info);padding:8px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;">
        ${icon('checkCircle', 14)} AM In: ${amIn}
      </span>
      <button class="btn btn--primary" id="btn-morning-out" style="display:flex;align-items:center;gap:8px;background:#f59e0b;border-color:#f59e0b;color:#fff;">
        ${icon('logOut', 16)} Time Out (Morning)
      </button>
    `;
  } else if (sessionState === 'on_lunch') {
    punchClockHtml = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="display:flex;align-items:center;gap:6px;background:rgba(245,158,11,0.12);color:#d97706;padding:8px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;">
          ${icon('clock', 14)} Lunch Break (${sched.lunchStart || '12:00'} – ${sched.lunchEnd || '1:00 PM'})
        </span>
        <button class="btn btn--secondary" disabled style="display:flex;align-items:center;gap:8px;opacity:0.65;cursor:not-allowed;" title="You cannot time in before 1:00 PM because it is lunch break">
          ${icon('clock', 16)} Time In (Afternoon at 1:00 PM)
        </button>
      </div>
    `;
  } else if (sessionState === 'ready_afternoon_in') {
    const amNote = todayLog?.morningIn ? `AM: ${todayLog.morningIn} – ${todayLog.morningOut || '12:00'}${todayLog.autoMorningTimeout ? ' (Auto)' : ''}` : 'AM Missed';
    punchClockHtml = `
      <span style="display:flex;align-items:center;gap:6px;background:var(--color-success-bg);color:var(--color-success);padding:8px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;">
        ${icon('checkCircle', 14)} ${amNote}
      </span>
      <button class="btn btn--primary" id="btn-afternoon-in" style="display:flex;align-items:center;gap:8px;">
        ${icon('logIn', 16)} Time In (Afternoon)
      </button>
    `;
  } else if (sessionState === 'afternoon_active') {
    const pmIn = todayLog?.afternoonIn || '—';
    punchClockHtml = `
      <span style="display:flex;align-items:center;gap:6px;background:var(--color-info-bg);color:var(--color-info);padding:8px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;">
        ${icon('checkCircle', 14)} PM In: ${pmIn}
      </span>
      <button class="btn btn--primary" id="btn-afternoon-out" style="display:flex;align-items:center;gap:8px;background:#ef4444;border-color:#ef4444;">
        ${icon('logOut', 16)} Time Out (Afternoon)
      </button>
    `;
  } else if (sessionState === 'day_completed') {
    const totalTodayHours = todayLog?.hours || 0;
    const isAutoPM = todayLog?.autoAfternoonTimeout;
    punchClockHtml = `
      <div style="display:flex;align-items:center;gap:8px;background:${isAutoPM ? 'rgba(245,158,11,0.12)' : 'var(--color-success-bg)'};color:${isAutoPM ? '#b45309' : 'var(--color-success)'};padding:8px 16px;border-radius:99px;font-size:0.84rem;font-weight:600;">
        ${icon(isAutoPM ? 'clock' : 'checkCircle', 16)} Today's attendance complete (${totalTodayHours} hrs)${isAutoPM ? ' · Auto Time-Out' : ''}
      </div>
    `;
  }

  container.innerHTML = `
    <!-- ── Page Header ── -->
    <section class="page-section animate-fade-in-up ojt-tracker-header-section">
      <div class="ojt-tracker-header" style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:4px;">
        <div class="ojt-tracker-header__title-col">
          <h1 class="ojt-tracker-title" style="font-size:var(--text-2xl); font-weight:700; display:flex; align-items:center; gap:10px;">
            ${icon('clock', 26)} OJT Time Tracker
          </h1>
          <p class="text-secondary ojt-tracker-subtitle" style="margin-top:4px;">${isWaitingForEvaluation
            ? 'You have completed 100% of your required OJT hours. Attendance logging is closed while waiting for your final evaluation.'
            : isOjtHoursCompleted
              ? 'You have completed your required OJT hours and performance evaluation.'
              : 'Log your daily attendance (Morning &amp; Afternoon sessions) and monitor your OJT hours progress.'}</p>
        </div>
        <div class="ojt-tracker-header-actions" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          ${shiftText && !isOjtHoursCompleted ? `
            <div class="ojt-shift-pill" style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.2);padding:6px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;">
              ${icon('calendar', 13)}
              <span>${esc(schedDays || 'Mon–Fri')} &middot; ${esc(shiftText)}${lunchText ? ' · ' + esc(lunchText) : ''}</span>
            </div>` : ''}
          ${punchClockHtml}
        </div>
      </div>
    </section>

    <!-- ── 100% Hours Completed · Waiting for Evaluation Banner ── -->
    ${isWaitingForEvaluation ? `
    <section class="page-section animate-fade-in-up" style="animation-delay:30ms;margin-bottom:16px;">
      <div class="jp-card ojt-waiting-eval-banner" style="background:linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.08) 100%);border:1.5px solid rgba(245,158,11,0.35);border-radius:var(--radius-lg);padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
        <div style="display:flex;align-items:center;gap:14px;min-width:240px;flex:1;">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,0.16);color:#b45309;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('clock', 22)}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <h3 style="margin:0;font-size:1.02rem;font-weight:700;color:var(--text-primary);">OJT Hours Completed &mdash; Waiting for Evaluation</h3>
              <span class="badge" style="background:#FEF3C7;color:#92400E;font-size:0.72rem;font-weight:700;padding:2px 10px;border-radius:99px;">Waiting for Evaluation</span>
            </div>
            <p class="text-sm text-secondary" style="margin:4px 0 0;line-height:1.45;">
              ${hasPendingEval
                ? `You have completed all <strong>${hoursRendered % 1 === 0 ? hoursRendered : hoursRendered.toFixed(1)} / ${totalHours} required OJT hours (100%)</strong>. A monthly performance evaluation has been dispatched to <strong>${esc(ojt.company || 'your host company')}</strong> and is awaiting employer submission. Daily Time In / Time Out is now locked.`
                : `Congratulations! You have completed all <strong>${hoursRendered % 1 === 0 ? hoursRendered : hoursRendered.toFixed(1)} / ${totalHours} required OJT hours (100%)</strong>. Daily Time In / Time Out is now locked while your coordinator and host company finalize your practicum appraisals.`}
            </p>
          </div>
        </div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:#059669;color:#fff;padding:7px 14px;border-radius:99px;font-size:0.8rem;font-weight:700;flex-shrink:0;">
          ${icon('checkCircle', 14)} 100% Hours Complete
        </div>
      </div>
    </section>
    ` : ''}

    <!-- ── Emergency / Medical Status Banner ── -->
    ${renderEmergencyBannerHtml(ojt)}

    <!-- ── OJT Pull-Out Status Banner ── -->
    ${renderPullOutBannerHtml(ojt)}

    <!-- ── Academic Performance Evaluations (Dual-Term & Composite Rating) ── -->
    ${renderEvaluationBannerHtml(evaluation)}

    <!-- ── Academic Credit Applied Banner ── -->
    ${ojt.accreditedHours > 0 ? `
    <div class="animate-fade-in-up ojt-accredited-banner" style="margin-bottom:14px;padding:12px 18px;border-radius:10px;background:rgba(0,89,48,0.06);border:1.5px solid rgba(0,89,48,0.22);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:8px;background:#005930;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${icon('award', 20)}
        </div>
        <div>
          <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#005930;display:block;">
            Academic OJT Credit Applied
          </span>
          <span style="font-size:0.84rem;color:var(--text-secondary);">
            <strong>${ojt.accreditedHours} hours</strong> accredited from your prior approved OJT. Remaining requirement for this placement: <strong>${totalHours} hours</strong> (Curriculum Target: ${ojt.curriculumTarget || 600} hrs).
          </span>
        </div>
      </div>
      <div style="font-size:0.8rem;font-weight:700;padding:5px 12px;border-radius:99px;background:#005930;color:#fff;">
        Overall: ${(hoursRendered + ojt.accreditedHours).toFixed(1)} / ${ojt.curriculumTarget || 600} hrs
      </div>
    </div>
    ` : ''}

    <!-- ── Hours Progress + OJT Info ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:60ms;">
      <div class="ojt-tracker-progress-row" style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">

        <!-- Circular progress ring -->
        <div class="jp-card ojt-progress-ring-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:190px;padding:24px 20px;text-align:center;">
          <svg width="124" height="124" viewBox="0 0 124 124" style="overflow:visible;">
            <circle cx="62" cy="62" r="54" fill="none" stroke="var(--bg-tertiary)" stroke-width="10"/>
            <circle cx="62" cy="62" r="54" fill="none"
              stroke="${ringColor}"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${circumference.toFixed(2)}"
              stroke-dashoffset="${dashOffset.toFixed(2)}"
              transform="rotate(-90 62 62)"
              style="transition:stroke-dashoffset 1s ease;"
            />
            <text x="62" y="57" text-anchor="middle" font-size="20" font-weight="700" fill="currentColor">${pctDisplay}%</text>
            <text x="62" y="73" text-anchor="middle" font-size="8.5" fill="var(--text-tertiary)" letter-spacing="0.5">COMPLETE</text>
          </svg>
          <p style="font-size:1.1rem;font-weight:700;margin-top:10px;">${hoursRendered % 1 === 0 ? hoursRendered : hoursRendered.toFixed(1)} <span class="text-tertiary" style="font-size:0.85rem;font-weight:400;">/ ${totalHours} hrs</span></p>
          <p class="text-xs text-secondary" style="margin-top:2px;">Total Hours Rendered</p>
          ${isWaitingForEvaluation ? `
            <span style="margin-top:8px;display:inline-flex;align-items:center;gap:5px;background:rgba(245,158,11,0.14);color:#b45309;border:1px solid rgba(245,158,11,0.3);padding:4px 10px;border-radius:99px;font-size:0.72rem;font-weight:700;">
              ${icon('clock', 12)} Waiting for Evaluation
            </span>
          ` : ''}
        </div>

        <!-- OJT deployment details -->
        <div class="jp-card ojt-deployment-card" style="flex:1;min-width:240px;">
          <div class="ojt-deployment-card__header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
            <p class="text-xs text-tertiary" style="font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0;">Active OJT Deployment</p>
            <div class="ojt-deployment-card__actions" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              ${!ojt.is_withdrawn ? `
                <button class="btn btn--outline btn--sm btn-trigger-emergency" id="tracker-btn-emergency" style="padding:4px 10px;font-size:0.75rem;gap:5px;color:#dc2626;border-color:rgba(239,68,68,0.3);display:inline-flex;align-items:center;">
                  ${icon('alertTriangle', 13)} ${ojt.emergency_pending || ojt.is_on_leave ? 'Emergency Info' : 'Emergency / Leave Notice'}
                </button>
                <button class="btn btn--outline btn--sm" id="tracker-btn-pull-out" style="padding:4px 10px;font-size:0.75rem;gap:5px;color:#b91c1c;border-color:rgba(185,28,28,0.35);display:inline-flex;align-items:center;">
                  ${icon('fileText', 13)} ${ojt.pull_out && ['pending_supervisor', 'recommended_by_supervisor', 'printed_pending_signature', 'emailed_to_dean'].includes(ojt.pull_out.status) ? 'Pull-Out Status' : 'Request Pull-Out'}
                </button>
              ` : ''}
              <button class="btn btn--outline btn--sm" id="tracker-btn-coord-chat" style="padding:4px 10px;font-size:0.75rem;gap:5px;color:var(--color-primary);border-color:rgba(0,89,48,0.25);display:inline-flex;align-items:center;">
                ${icon('messageCircle', 13)} Message Coordinator
              </button>
            </div>
          </div>
          <div class="ojt-deploy-details-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Company</p>
              <p class="text-sm" style="font-weight:600;">${esc(ojt.company || 'Host Company')}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Supervisor</p>
              <p class="text-sm" style="font-weight:600;">${esc(ojt.supervisor || ojt.supervisorEmail || 'Assigned upon reporting')}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Start Date</p>
              <p class="text-sm" style="font-weight:600;">${esc(ojt.startDate || '—')}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">${sched.estimatedEndDate ? 'Target End Date' : 'End Date'}</p>
              <p class="text-sm" style="font-weight:600;">${esc(sched.estimatedEndDate || ojt.endDate || '—')}</p>
            </div>
            ${schedDays ? `
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Agreed Work Days</p>
              <p class="text-sm" style="font-weight:600;color:var(--color-primary);">${esc(schedDays)}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Shift &amp; Hours</p>
              <p class="text-sm" style="font-weight:600;">${esc(shiftText)} <span style="font-weight:400;color:var(--text-secondary);font-size:0.75rem;">(${sched.dailyHours || 8}h/day)</span></p>
            </div>` : ''}
            ${ojt.unexcusedAbsenceCount > 0 ? `
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Unexcused Absences</p>
              <p class="text-sm" style="font-weight:700;color:#ef4444;display:flex;align-items:center;gap:4px;">
                ${icon('alertTriangle', 13)} ${ojt.unexcusedAbsenceCount} Day${ojt.unexcusedAbsenceCount > 1 ? 's' : ''}
              </p>
            </div>` : ''}
          </div>

          <!-- Hours progress bar -->
          <div style="padding-top:14px;border-top:1px solid var(--border-light);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;flex-wrap:wrap;gap:4px;">
              <span class="text-xs text-secondary">Hours completed</span>
              <span class="text-xs" style="font-weight:600;color:var(--color-accent);">${hoursRendered} of ${totalHours} hrs (${pctDisplay}%)</span>
            </div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:99px;overflow:hidden;">
              <div style="width:${Math.min(pctRaw, 100).toFixed(4)}%;height:100%;background:var(--color-accent);border-radius:99px;transition:width 0.8s;"></div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Map & Calendar Responsive Grid ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:80ms;">
      <div class="ojt-map-cal-row">

        <!-- Map card -->
        <div class="jp-card ojt-map-card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);flex-shrink:0;">
            <h3 style="font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:6px;">${icon('mapPin', 14)} Company Location</h3>
            <a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(ojt.location || '')}" target="_blank" rel="noopener noreferrer" style="font-size:0.68rem;color:var(--color-primary);font-weight:600;text-decoration:none;display:flex;align-items:center;gap:3px;">Open Maps ${icon('arrowRight', 10)}</a>
          </div>
          <div id="ojt-map" style="flex:1;min-height:300px;background:var(--bg-secondary);"></div>
          <div class="ojt-map-footer" style="padding:8px 14px;display:flex;align-items:center;gap:12px;border-top:1px solid var(--border-light);background:var(--bg-secondary);flex-shrink:0;flex-wrap:wrap;">
            <div class="ojt-map-legend" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <span style="display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;"></span>Company</span>
              <span style="display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:50%;border:1.5px dashed #005930;background:rgba(34,197,94,0.2);display:inline-block;flex-shrink:0;"></span>${ojt.geofenceRadius || 50}m Geofence</span>
            </div>
            <div class="ojt-map-filters" style="display:flex;align-items:center;gap:4px;margin-left:auto;flex-wrap:wrap;">
              <button id="map-filter-all" class="btn btn--outline btn--sm active" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;background:rgba(0,89,48,0.1);color:#005930;border-color:#005930;">All Pins</button>
              <button id="map-filter-in" class="btn btn--outline btn--sm" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#22c55e;"></span>Log In</button>
              <button id="map-filter-out" class="btn btn--outline btn--sm" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#f97316;"></span>Log Out</button>
            </div>
          </div>
        </div>

        <!-- Calendar card -->
        <div class="jp-card ojt-cal-card" style="padding:14px;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <h3 style="font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:5px;">${icon('calendar', 14)} Calendar</h3>
            <div style="display:flex;align-items:center;gap:3px;">
              <button class="btn btn--outline" id="cal-prev" style="height:24px;width:24px;padding:0;display:flex;align-items:center;justify-content:center;" title="Previous month">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span style="font-size:0.64rem;font-weight:600;min-width:80px;text-align:center;">${monthLabel}</span>
              <button class="btn btn--outline" id="cal-next" style="height:24px;width:24px;padding:0;display:flex;align-items:center;justify-content:center;" title="Next month">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          ${buildCalendarHTML(year, month, logMap)}

          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-light);">
            <span style="display:flex;align-items:center;gap:3px;font-size:0.6rem;color:var(--text-secondary);"><span style="width:6px;height:6px;border-radius:50%;background:var(--color-success);display:inline-block;"></span>Valid</span>
            <span style="display:flex;align-items:center;gap:3px;font-size:0.6rem;color:var(--text-secondary);"><span style="width:6px;height:6px;border-radius:50%;background:var(--color-warning);display:inline-block;"></span>Pending</span>
            <span style="display:flex;align-items:center;gap:3px;font-size:0.6rem;color:var(--text-secondary);"><span style="width:6px;height:6px;border-radius:50%;background:var(--color-error);display:inline-block;"></span>Missed</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Time Log Records (Daily Time Record) ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:120ms;">
      <div class="ojt-dtr-card">
        <!-- Header Bar -->
        <div class="ojt-dtr-header-bar">
          <div class="ojt-dtr-title-group">
            <h3 class="ojt-dtr-title">${icon('fileText', 20)} Time Log Records (DTR)</h3>
            <p class="ojt-dtr-subtitle">Click any attendance row to inspect check-in and check-out geofence locations on the map above.</p>
          </div>
          
          <div class="ojt-dtr-summary-strip">
            <span class="ojt-dtr-stat-pill ojt-dtr-stat-pill--primary">
              ${icon('clock', 13)} <strong>${logs.reduce((sum, l) => {
                const isApproved = (l.approvalStatus ?? 'approved') === 'approved';
                return sum + (isApproved && l.status !== 'absent' ? (parseFloat(l.hoursCredited ?? l.hours) || 0) : 0);
              }, 0).toFixed(1)} hrs</strong> rendered
            </span>
            <span class="ojt-dtr-stat-pill">
              ${icon('check', 13)} <strong>${logs.filter(l => {
                const st = (l.status || '').toLowerCase();
                const lv = l.locationValidity;
                return (st === 'valid' || lv === 'In Site') && st !== 'absent';
              }).length}</strong> present
            </span>
            ${logs.filter(l => (l.status || '').toLowerCase() === 'absent').length > 0 ? `
              <span class="ojt-dtr-stat-pill" style="color:#dc2626;background:#fef2f2;border-color:#fecaca;">
                ${icon('x', 13)} <strong>${logs.filter(l => (l.status || '').toLowerCase() === 'absent').length}</strong> absences
              </span>
            ` : ''}
            <button type="button" class="btn btn--primary btn--sm" id="time-logs-print-dtr" style="height:30px;padding:0 12px;font-size:0.75rem;background:#005930;color:#ffffff;border-color:#005930;display:inline-flex;align-items:center;gap:6px;border-radius:6px;cursor:pointer;font-weight:700;">
              ${icon('printer', 13)} Print Official DTR
            </button>
            <button type="button" class="btn btn--outline btn--sm" id="time-logs-export-csv" style="height:30px;padding:0 10px;font-size:0.75rem;display:inline-flex;align-items:center;gap:5px;border-radius:6px;cursor:pointer;">
              ${icon('download', 13)} Export CSV
            </button>
          </div>
        </div>

        ${logs.length === 0
          ? `<div style="text-align:center;padding:56px 20px;color:var(--text-tertiary);">
               <div style="width:48px;height:48px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
                 ${icon('clock', 24)}
               </div>
               <h4 style="margin:0 0 4px;font-size:0.96rem;font-weight:700;color:var(--text-primary);">No attendance logs recorded yet</h4>
               <p style="margin:0;font-size:0.8rem;color:var(--text-secondary);">Your daily check-in and check-out entries will be tracked and displayed here in real time.</p>
             </div>`
          : `
            <!-- Filter Toolbar -->
            <div class="ojt-dtr-toolbar">
              <div class="ojt-dtr-search-box">
                <span class="ojt-dtr-search-icon">${icon('search', 14)}</span>
                <input
                  type="text"
                  id="time-logs-search-input"
                  class="ojt-dtr-search-input"
                  placeholder="Search date, day, or location..."
                />
              </div>

              <div class="ojt-dtr-filters-list">
                <button type="button" class="ojt-dtr-filter-btn is-active" data-filter="all">
                  All <span class="ojt-dtr-filter-count">${logs.length}</span>
                </button>
                <button type="button" class="ojt-dtr-filter-btn" data-filter="valid">
                  Valid / In Site <span class="ojt-dtr-filter-count">${logs.filter(l => {
                    const st = (l.status || '').toLowerCase();
                    const lv = l.locationValidity;
                    return (st === 'valid' || lv === 'In Site') && st !== 'absent';
                  }).length}</span>
                </button>
                <button type="button" class="ojt-dtr-filter-btn" data-filter="absent">
                  Absences <span class="ojt-dtr-filter-count">${logs.filter(l => (l.status || '').toLowerCase() === 'absent').length}</span>
                </button>
                ${logs.filter(l => {
                  const st = (l.status || '').toLowerCase();
                  return st !== 'absent' && (Boolean(l.hasGeofenceExemption) || l.locationValidity === 'Too Far' || (l.distanceMeters != null && l.distanceMeters > (ojt.geofenceRadius || 50)));
                }).length > 0 ? `
                  <button type="button" class="ojt-dtr-filter-btn" data-filter="offsite">
                    Off-Site / Too Far <span class="ojt-dtr-filter-count">${logs.filter(l => {
                      const st = (l.status || '').toLowerCase();
                      return st !== 'absent' && (Boolean(l.hasGeofenceExemption) || l.locationValidity === 'Too Far' || (l.distanceMeters != null && l.distanceMeters > (ojt.geofenceRadius || 50)));
                    }).length}</span>
                  </button>
                ` : ''}
                ${logs.filter(l => (l.approvalStatus || '') === 'pending_company').length > 0 ? `
                  <button type="button" class="ojt-dtr-filter-btn" data-filter="pending" style="color:#b45309;">
                    Pending Review <span class="ojt-dtr-filter-count" style="background:rgba(217,119,6,0.18);">${logs.filter(l => (l.approvalStatus || '') === 'pending_company').length}</span>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Table Body -->
            <div class="ojt-dtr-table-wrap">
              <table class="ojt-dtr-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="ojt-dtr-th" style="width:160px;">Date</th>
                    <th colspan="2" class="ojt-dtr-th ojt-dtr-th-group ojt-dtr-th-group--morning">
                      <span class="ojt-dtr-group-tag">${icon('sun', 12)} Morning Session</span>
                    </th>
                    <th colspan="2" class="ojt-dtr-th ojt-dtr-th-group ojt-dtr-th-group--afternoon">
                      <span class="ojt-dtr-group-tag">${icon('clock', 12)} Afternoon Session</span>
                    </th>
                    <th rowspan="2" class="ojt-dtr-th ojt-dtr-th--center" style="width:110px;">Hours</th>
                    <th rowspan="2" class="ojt-dtr-th ojt-dtr-th--center" style="width:130px;">Status</th>
                    <th rowspan="2" class="ojt-dtr-th ojt-dtr-th--center" style="min-width:180px;">Location &amp; Geofence</th>
                  </tr>
                  <tr>
                    <th class="ojt-dtr-th ojt-dtr-th-sub ojt-dtr-th-sub--morning" style="width:115px;">Time In</th>
                    <th class="ojt-dtr-th ojt-dtr-th-sub ojt-dtr-th-sub--morning" style="width:115px;">Time Out</th>
                    <th class="ojt-dtr-th ojt-dtr-th-sub ojt-dtr-th-sub--afternoon" style="width:115px;">Time In</th>
                    <th class="ojt-dtr-th ojt-dtr-th-sub ojt-dtr-th-sub--afternoon" style="width:115px;">Time Out</th>
                  </tr>
                </thead>
                <tbody id="time-logs-tbody">
                  <!-- Populated by pagination & filter script -->
                </tbody>
              </table>
            </div>

            <!-- Pagination Bar -->
            <div class="ojt-dtr-pagination" id="time-logs-pagination">
              <div class="ojt-dtr-pagination-info" id="pagination-info">Showing entries</div>
              <div class="ojt-dtr-pagination-controls" id="pagination-controls"></div>
            </div>
          `
        }
      </div>
    </section>
  `;

  // ── Wire up events ────────────────────────────────────────────────────────
  container.querySelector('#cal-prev').addEventListener('click', () => onMonthChange(prevM.y, prevM.m));
  container.querySelector('#cal-next').addEventListener('click', () => onMonthChange(nextM.y, nextM.m));

  // Helper to re-render after log action
  function refreshAfterLog(resLog, lat, lon, toastMsg) {
    if (resLog) {
      const idx = logs.findIndex(l => l.date === resLog.date);
      if (idx !== -1) logs[idx] = resLog;
      else logs.unshift(resLog);
      logMap[resLog.date] = resLog;
      if (lat != null) { ojt._studentLat = lat; ojt._studentLon = lon; }
      ojt.hoursRendered = logs.reduce((sum, l) => {
        const isApproved = (l.approvalStatus ?? 'approved') === 'approved';
        return sum + (isApproved && l.status !== 'absent' ? (parseFloat(l.hoursCredited ?? l.hours) || 0) : 0);
      }, 0);
      ojt.daysCompleted = new Set(logs.filter(l => l.status !== 'absent' && (parseFloat(l.hoursCredited ?? l.hours) > 0)).map(l => l.date)).size;
      showToast(toastMsg || 'Attendance recorded.');
      renderTrackerPage(container, ojt, logs, year, month, onMonthChange);
    }
  }

  // ── Morning Time In ────────────────────────────────────────────────────────
  const btnMorningIn = container.querySelector('#btn-morning-in');
  if (btnMorningIn) {
    btnMorningIn.addEventListener('click', () => {
      showLogInModal('Time In (Morning)', ojt, async (timeIn24, lat, lon, extraData) => {
        const body = { time_in: timeIn24, session: 'morning' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time In (Morning) recorded!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log in. Please try again.', 'error');
        }
      });
    });
  }

  // ── Morning Time Out ───────────────────────────────────────────────────────
  const btnMorningOut = container.querySelector('#btn-morning-out');
  if (btnMorningOut) {
    btnMorningOut.addEventListener('click', () => {
      showLogOutModal(todayLog, 'Time Out (Morning)', ojt, async (timeOut24, lat, lon, extraData) => {
        const body = { time_out: timeOut24, session: 'morning' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time Out (Morning) recorded. Enjoy your break!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log out.', 'error');
        }
      });
    });
  }

  // ── Afternoon Time In ──────────────────────────────────────────────────────
  const btnAfternoonIn = container.querySelector('#btn-afternoon-in');
  if (btnAfternoonIn) {
    btnAfternoonIn.addEventListener('click', () => {
      showLogInModal('Time In (Afternoon)', ojt, async (timeIn24, lat, lon, extraData) => {
        const body = { time_in: timeIn24, session: 'afternoon' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time In (Afternoon) recorded!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log in. Please try again.', 'error');
        }
      });
    });
  }

  // ── Afternoon Time Out ─────────────────────────────────────────────────────
  const btnAfternoonOut = container.querySelector('#btn-afternoon-out');
  if (btnAfternoonOut) {
    btnAfternoonOut.addEventListener('click', () => {
      showLogOutModal(todayLog, 'Time Out (Afternoon)', ojt, async (timeOut24, lat, lon, extraData) => {
        const body = { time_out: timeOut24, session: 'afternoon' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time Out (Afternoon) recorded. Great work today!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log out.', 'error');
        }
      });
    });
  }

  // Backward-compatible fallback for generic buttons if rendered
  const fallbackLogIn = container.querySelector('#btn-log-in');
  if (fallbackLogIn) {
    fallbackLogIn.addEventListener('click', () => {
      showLogInModal('Time In', ojt, async (timeIn24, lat, lon, extraData) => {
        const body = { time_in: timeIn24 };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time-in recorded!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log in.', 'error');
        }
      });
    });
  }

  const fallbackLogOut = container.querySelector('#btn-log-out');
  if (fallbackLogOut) {
    fallbackLogOut.addEventListener('click', () => {
      showLogOutModal(todayLog, 'Time Out', ojt, async (timeOut24, lat, lon, extraData) => {
        const body = { time_out: timeOut24 };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        if (extraData?.out_of_range_reason) {
          body.out_of_range_reason = extraData.out_of_range_reason;
          body.proof_image = extraData.proof_image;
        }
        if (extraData?.overtime_reason) {
          body.overtime_reason = extraData.overtime_reason;
        }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time-out recorded!');
        } else if (res && res.error_code === 'OUTSIDE_GEOFENCE') {
          showOutsideGeofenceModal(res);
        } else {
          showToast(res?.message || 'Failed to log out.', 'error');
        }
      });
    });
  }

  // Calendar day click (show detail tooltip)
  container.querySelectorAll('.cal-day--has-log').forEach(el => {
    el.addEventListener('click', () => {
      const log = logMap[el.dataset.logDate];
      if (log) showLogDetail(log);
    });
  });

  // Coordinator Chat
  container.querySelector('#tracker-btn-coord-chat')?.addEventListener('click', () => {
    window.openCoordinatorChat?.();
  });
  container.querySelector('#tracker-btn-coord-chat-top')?.addEventListener('click', () => {
    window.openCoordinatorChat?.();
  });

  // Emergency & Leave Notice
  window.openStudentEmergencyModal = (customOjt) => {
    openEmergencyModal(customOjt || ojt, () => {
      renderOJTTracker(container);
    });
  };

  container.querySelector('#tracker-btn-emergency')?.addEventListener('click', (e) => {
    e.preventDefault();
    openEmergencyModal(ojt, () => {
      renderOJTTracker(container);
    });
  });

  // Fit to Work Clearance
  container.querySelector('#btn-upload-fit-to-work')?.addEventListener('click', (e) => {
    e.preventDefault();
    openFitToWorkModal(ojt.emergency, () => {
      renderOJTTracker(container);
    });
  });

  // Pull-Out Request Action
  container.querySelector('#tracker-btn-pull-out')?.addEventListener('click', (e) => {
    e.preventDefault();
    openPullOutModal(ojt, () => {
      renderOJTTracker(container);
    });
  });

  // Cancel Pull-Out Request
  container.querySelector('#btn-cancel-pull-out')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to cancel your pending pull-out request?')) return;
    try {
      const res = await apiPost('/student/ojt-pull-out/cancel', {});
      if (res && res.success) {
        showToast(res.message || 'Pull-out request cancelled.', 'info');
        renderOJTTracker(container);
      } else {
        showToast(res?.message || 'Could not cancel request.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel request.', 'error');
    }
  });

  // Delegated handler for any emergency button clicks within the tracker page (guarded against duplicate binding)
  container._currentOjtObj = ojt;
  if (!container._trackerEmerBound) {
    container._trackerEmerBound = true;
    container.addEventListener('click', (e) => {
      const emerBtn = e.target.closest('#tracker-btn-emergency, .btn-trigger-emergency');
      if (emerBtn && container._currentOjtObj) {
        e.preventDefault();
        openEmergencyModal(container._currentOjtObj, () => {
          renderOJTTracker(container);
        });
      }
    });
  }

  // ── Time Logs Pagination, Filtering, Search & Interactive Row Clicks ──────
  let activeFilter = 'all';
  let searchQuery = '';
  let currentLogsPage = 1;
  const logsPageSize = 10;

  function getFilteredLogs() {
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(log => {
      const st = (log.status || '').toLowerCase();
      const lv = log.locationValidity;
      const isAbsent = st === 'absent';
      const isPending = (log.approvalStatus || '') === 'pending_company';
      const isOffsite = Boolean(log.hasGeofenceExemption) || lv === 'Too Far' || (log.distanceMeters != null && log.distanceMeters > (ojt?.geofenceRadius || 50));
      const isValid = (st === 'valid' || lv === 'In Site') && !isAbsent;

      if (activeFilter === 'valid' && !isValid) return false;
      if (activeFilter === 'absent' && !isAbsent) return false;
      if (activeFilter === 'offsite' && !isOffsite) return false;
      if (activeFilter === 'pending' && !isPending) return false;

      if (q) {
        const textToSearch = `${log.date || ''} ${log.dayLabel || ''} ${log.status || ''} ${log.locationValidity || ''} ${log.outOfRangeReason || ''} ${log.siteLocation || ''}`.toLowerCase();
        if (!textToSearch.includes(q)) return false;
      }
      return true;
    });
  }

  function updateLogsPage(page = 1) {
    const filtered = getFilteredLogs();
    const totalFilteredPages = Math.ceil(filtered.length / logsPageSize) || 1;
    currentLogsPage = Math.max(1, Math.min(page, totalFilteredPages));

    const tbody = container.querySelector('#time-logs-tbody');
    const infoEl = container.querySelector('#pagination-info');
    const ctrlEl = container.querySelector('#pagination-controls');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding:48px 20px;text-align:center;color:var(--text-secondary);">
            <div style="width:44px;height:44px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
              ${icon('search', 22)}
            </div>
            <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);margin-bottom:4px;">No matching attendance records</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">Try adjusting your search keywords or switching filter tabs.</div>
          </td>
        </tr>
      `;
      if (infoEl) infoEl.textContent = 'Showing 0 entries';
      if (ctrlEl) ctrlEl.innerHTML = '';
      return;
    }

    const start = (currentLogsPage - 1) * logsPageSize;
    const end = Math.min(start + logsPageSize, filtered.length);
    const slice = filtered.slice(start, end);

    tbody.innerHTML = slice.map(l => renderTrackerLogRow(l)).join('');

    if (infoEl) {
      infoEl.innerHTML = `Showing <strong>${start + 1}–${end}</strong> of <strong>${filtered.length}</strong> records${filtered.length !== logs.length ? ` (filtered from ${logs.length})` : ''}`;
    }

    if (ctrlEl) {
      if (totalFilteredPages <= 1) {
        ctrlEl.innerHTML = '';
      } else {
        let btns = '';
        btns += `
          <button class="ojt-dtr-page-btn" id="logs-prev-btn" ${currentLogsPage === 1 ? 'disabled' : ''}>
            ${icon('chevronLeft', 12)} Prev
          </button>
        `;

        const getPageNumbers = () => {
          if (totalFilteredPages <= 7) return Array.from({ length: totalFilteredPages }, (_, i) => i + 1);
          if (currentLogsPage <= 4) return [1, 2, 3, 4, 5, '...', totalFilteredPages];
          if (currentLogsPage >= totalFilteredPages - 3) return [1, '...', totalFilteredPages - 4, totalFilteredPages - 3, totalFilteredPages - 2, totalFilteredPages - 1, totalFilteredPages];
          return [1, '...', currentLogsPage - 1, currentLogsPage, currentLogsPage + 1, '...', totalFilteredPages];
        };

        getPageNumbers().forEach(p => {
          if (p === '...') {
            btns += `<span style="padding:0 4px;font-size:0.75rem;color:var(--text-tertiary);">&hellip;</span>`;
          } else {
            const isAct = p === currentLogsPage;
            btns += `
              <button class="ojt-dtr-page-btn ${isAct ? 'is-active' : ''} logs-page-num" data-page="${p}">
                ${p}
              </button>
            `;
          }
        });

        btns += `
          <button class="ojt-dtr-page-btn" id="logs-next-btn" ${currentLogsPage === totalFilteredPages ? 'disabled' : ''}>
            Next ${icon('chevronRight', 12)}
          </button>
        `;

        ctrlEl.innerHTML = btns;

        ctrlEl.querySelector('#logs-prev-btn')?.addEventListener('click', () => updateLogsPage(currentLogsPage - 1));
        ctrlEl.querySelector('#logs-next-btn')?.addEventListener('click', () => updateLogsPage(currentLogsPage + 1));
        ctrlEl.querySelectorAll('.logs-page-num').forEach(b => {
          b.addEventListener('click', () => updateLogsPage(parseInt(b.dataset.page)));
        });
      }
    }

    // Interactive row clicks: highlight and locate on map
    tbody.querySelectorAll('.ojt-dtr-row, .log-table-row').forEach(row => {
      row.addEventListener('click', () => {
        tbody.querySelectorAll('.ojt-dtr-row, .log-table-row').forEach(r => r.classList.remove('is-selected'));
        row.classList.add('is-selected');
        const logId = parseInt(row.dataset.logId);
        window.focusMapLog?.(logId);
      });
    });
  }

  // Filter toolbar bindings
  container.querySelectorAll('.ojt-dtr-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ojt-dtr-filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter || 'all';
      updateLogsPage(1);
    });
  });

  const searchInput = container.querySelector('#time-logs-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateLogsPage(1);
  });

  const exportBtn = container.querySelector('#time-logs-export-csv');
  exportBtn?.addEventListener('click', () => {
    const dataToExport = getFilteredLogs();
    exportLogsToCSV(dataToExport.length ? dataToExport : logs);
  });

  const printDtrBtn = container.querySelector('#time-logs-print-dtr');
  printDtrBtn?.addEventListener('click', () => {
    let studentUser = {};
    try { studentUser = JSON.parse(localStorage.getItem('hireme_user') || '{}'); } catch {}

    const studentInfo = {
      name: studentUser.name || 'Student Trainee',
      student_id: studentUser.student_id || studentUser.studentId || ('CHMSU-' + (studentUser.id || '')),
      program: studentUser.program || studentUser.course || ojt?.posting?.preferred_courses?.[0] || 'Bachelor of Science in Information Technology',
      section: studentUser.section || 'A',
      year_level: studentUser.year_level || studentUser.yearLevel || '4th Year',
      campus: studentUser.campus || 'Alijis Campus, Bacolod City',
    };

    const companyInfo = {
      name: ojt?.company || ojt?.company_name || ojt?.posting?.company_name || 'Host Training Establishment',
      department: ojt?.department || ojt?.posting?.department || 'OJT Training Division',
      supervisor_name: ojt?.supervisor || ojt?.supervisor_name || 'Host Company Supervisor',
      supervisor_title: 'Internship Supervisor / Mentor',
    };

    const coordinatorInfo = {
      name: ojt?.coordinator?.name || ojt?.endorser?.name || 'Prof. Mariene Labrador',
      title: 'OJT Academic Coordinator',
      college: 'College of Computer Studies',
      department: 'Department of Information Technology',
    };

    const deploymentInfo = {
      required_hours: ojt?.totalHours || ojt?.required_hours || 600,
      start_date: ojt?.startDate || ojt?.start_date,
    };

    openDtrPrintModal({
      student: studentInfo,
      company: companyInfo,
      coordinator: coordinatorInfo,
      deployment: deploymentInfo,
      logs: logs,
      progress: ojt,
      role: 'student',
    });
  });

  updateLogsPage(1);

  // ── Initialize Leaflet map ──────────────────────────────────────────────
  initLeafletMap(container, ojt, logs);
}

// ── Helper to format date with weekday and Today tag ──────────────────────
function formatLogRowDate(log) {
  let formattedDate = log.date || log.dayLabel || '—';
  let weekday = '';
  let isToday = false;

  try {
    const raw = log.rawDate || log.date;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          isToday = true;
        }
      }
    }
  } catch (_) {}

  if (!weekday && log.dayLabel) {
    const parts = String(log.dayLabel).trim().split(/\s+/);
    if (parts.length >= 2) {
      const daysMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
      weekday = daysMap[parts[0]] || parts[0];
      if (formattedDate === '—') formattedDate = parts.slice(1).join(' ');
    } else {
      weekday = log.dayLabel;
    }
  }

  return { formattedDate, weekday, isToday };
}

// ── CSV Export Helper ─────────────────────────────────────────────────────
function exportLogsToCSV(dataRows) {
  const headers = ['Date', 'Day', 'Morning In', 'Morning Out', 'Afternoon In', 'Afternoon Out', 'Hours Rendered', 'Status', 'Location Validity', 'Distance (m)', 'Coordinates'];
  const csvRows = [
    headers.join(','),
    ...dataRows.map(l => {
      const coords = (l.inLat != null && l.inLon != null) ? `${l.inLat}, ${l.inLon}` : '';
      return [
        `"${(l.date || '').replace(/"/g, '""')}"`,
        `"${(l.dayLabel || '').replace(/"/g, '""')}"`,
        `"${(l.morningIn || l.timeIn || '—').replace(/"/g, '""')}"`,
        `"${(l.morningOut || '—').replace(/"/g, '""')}${l.autoMorningTimeout ? ' (Auto)' : ''}"`,
        `"${(l.afternoonIn || '—').replace(/"/g, '""')}"`,
        `"${(l.afternoonOut || l.timeOut || '—').replace(/"/g, '""')}${l.autoAfternoonTimeout ? ' (Auto)' : ''}"`,
        Number(l.hours || 0).toFixed(2),
        `"${(l.status || '').replace(/"/g, '""')}"`,
        `"${(l.locationValidity || 'No GPS').replace(/"/g, '""')}"`,
        l.distanceMeters != null ? l.distanceMeters : '',
        `"${coords.replace(/"/g, '""')}"`
      ].join(',');
    })
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OJT_DTR_Attendance_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// ── Helper to render a single table row for a log entry ───────────────────────
function renderTrackerLogRow(log) {
  const isPendingApproval = (log.approvalStatus || '') === 'pending_company';
  const isRejected = (log.approvalStatus || '') === 'rejected';

  const st = (log.status || '').toLowerCase();
  const isAbsent = st === 'absent';
  const isHalfDayAm = st === 'half_day_am';
  const isHalfDayPm = st === 'half_day_pm';
  const isExcused = st === 'excused';

  // 1. Date column
  const dateInfo = formatLogRowDate(log);

  // 2. Morning Session punches
  const mIn = isAbsent || isExcused || isHalfDayPm ? null : (log.morningIn || (!log.afternoonIn && log.timeIn ? log.timeIn : null));
  const mOut = isAbsent || isExcused || isHalfDayPm ? null : (log.morningOut || null);

  const mInHtml = mIn
    ? `<span class="dtr-time-val">${esc(mIn)}</span>`
    : `<span class="dtr-empty-dash">&mdash;</span>`;

  const mOutHtml = mOut
    ? `<div style="display:flex;flex-direction:column;align-items:center;">
         <span class="dtr-time-val">${esc(mOut)}</span>
         ${log.autoMorningTimeout ? `<span class="dtr-auto-chip" title="Automatically closed at lunch break">${icon('clock', 10)} Auto 12:00</span>` : ''}
       </div>`
    : (mIn && !log.afternoonIn
      ? `<span class="dtr-active-chip"><span class="dtr-pulse-dot"></span> Active</span>`
      : `<span class="dtr-empty-dash">&mdash;</span>`);

  // 3. Afternoon Session punches
  const aIn = isAbsent || isExcused || isHalfDayAm ? null : (log.afternoonIn || null);
  const aOut = isAbsent || isExcused || isHalfDayAm ? null : (log.afternoonOut || (!log.morningIn && !log.afternoonIn && log.timeOut ? log.timeOut : null));

  const aInHtml = aIn
    ? `<span class="dtr-time-val">${esc(aIn)}</span>`
    : `<span class="dtr-empty-dash">&mdash;</span>`;

  const aOutHtml = aOut
    ? `<div style="display:flex;flex-direction:column;align-items:center;">
         <span class="dtr-time-val">${esc(aOut)}</span>
         ${log.autoAfternoonTimeout ? `<span class="dtr-auto-chip" title="Automatically closed at scheduled shift end">${icon('clock', 10)} Auto ${esc(aOut)}</span>` : ''}
         ${log.overtimeHours > 0 ? `
           <span class="dtr-auto-chip" style="margin-top:2px;background:${log.overtimeStatus === 'approved' ? '#dcfce7;color:#166534;border-color:#bbf7d0;' : (log.overtimeStatus === 'rejected' ? '#fee2e2;color:#991b1b;border-color:#fca5a5;' : '#fef3c7;color:#b45309;border-color:#fde68a;')}" title="OT: ${log.overtimeHours}h (${log.overtimeStatus})">
             ${icon('zap', 9)} +${Number(log.overtimeHours).toFixed(1)}h OT (${log.overtimeStatus === 'approved' ? 'Approved' : (log.overtimeStatus === 'rejected' ? 'Declined' : 'Pending')})
           </span>` : ''}
       </div>`
    : (aIn
      ? `<span class="dtr-active-chip"><span class="dtr-pulse-dot"></span> Active</span>`
      : `<span class="dtr-empty-dash">&mdash;</span>`);

  // 4. Hours rendered
  const rawHrs = Number(log.hours || 0).toFixed(1);
  let hrsHtml = '';
  if (log.isTimeoutIneligible) {
    const otVal = Number(log.overtimeHours || 0);
    const regVal = Number((log.regularHours > 0 ? log.regularHours : (log.hours - otVal)) || 0);
    const credVal = Number(log.hoursCredited || 0);
    const credOt = log.overtimeStatus === 'approved' ? otVal : 0;
    const credReg = Math.max(0, credVal - credOt);
    const pendingReg = Math.max(0, regVal - credReg);
    const otSub = otVal > 0
      ? `<span class="dtr-hrs-sub" style="color:${log.overtimeStatus === 'approved' ? '#166534' : (log.overtimeStatus === 'rejected' ? '#ef4444' : '#b45309')};font-weight:700;">(${log.overtimeStatus === 'approved' ? `+${otVal.toFixed(1)}h OT Approved` : (log.overtimeStatus === 'rejected' ? `${otVal.toFixed(1)}h OT Declined` : `+${otVal.toFixed(1)}h OT Escrow`)})</span>`
      : '';
    hrsHtml = `
      <div class="dtr-hrs-box" title="Unlogged exit: ${pendingReg.toFixed(1)}h in escrow pending supervisor review">
        <span class="dtr-hrs-val ${credVal > 0 ? '' : 'dtr-hrs-val--rejected'}">${credVal.toFixed(1)} hrs</span>
        <span class="dtr-hrs-sub" style="color:#b45309;font-weight:700;">(${pendingReg.toFixed(1)}h Ineligible)</span>
        ${otSub}
      </div>`;
  } else if (isAbsent || (isExcused && !Number(log.hours))) {
    hrsHtml = `<div class="dtr-hrs-box"><span class="dtr-hrs-val dtr-hrs-val--zero">0.0 hrs</span></div>`;
  } else if (isPendingApproval) {
    const otVal = Number(log.overtimeHours || 0);
    const regHrs = Number((log.regularHours > 0 ? log.regularHours : (log.hours - otVal)) || 0).toFixed(1);
    const otSub = otVal > 0
      ? `<span class="dtr-hrs-sub" style="color:${log.overtimeStatus === 'rejected' ? '#ef4444' : '#b45309'};font-weight:700;">(${log.overtimeStatus === 'rejected' ? `${otVal.toFixed(1)}h OT Declined` : `+${otVal.toFixed(1)}h OT Escrow`})</span>`
      : '';
    hrsHtml = `
      <div class="dtr-hrs-box" title="Regular hours held in escrow pending supervisor review">
        <span class="dtr-hrs-val dtr-hrs-val--escrow">${regHrs} hrs</span>
        <span class="dtr-hrs-sub" style="color:#b45309;font-weight:700;">(In Escrow)</span>
        ${otSub}
      </div>`;
  } else if (isRejected) {
    const credHrs = Number(log.hoursCredited || 0);
    hrsHtml = `
      <div class="dtr-hrs-box" title="${esc(log.rejectionReason || 'Rejected')}">
        <span class="dtr-hrs-val dtr-hrs-val--rejected">${credHrs > 0 ? credHrs.toFixed(1) : rawHrs} hrs</span>
        <span class="dtr-hrs-sub" style="color:#dc2626;font-weight:700;">(${credHrs > 0 ? 'AM Verified · PM Rejected' : 'Rejected'})</span>
      </div>`;
  } else if (log.overtimeHours > 0) {
    const regHrs = Number((log.regularHours > 0 ? log.regularHours : (log.hours - log.overtimeHours)) || 0).toFixed(1);
    const otHrs = Number(log.overtimeHours).toFixed(1);
    if (log.overtimeStatus === 'approved') {
      const totalHrs = (Number(regHrs) + Number(otHrs)).toFixed(1);
      hrsHtml = `
        <div class="dtr-hrs-box" title="${regHrs}h regular + ${otHrs}h overtime approved">
          <span class="dtr-hrs-val">${totalHrs} hrs</span>
          <span class="dtr-hrs-sub" style="color:#166534;font-weight:700;">(${regHrs}h + ${otHrs}h OT)</span>
        </div>`;
    } else if (log.overtimeStatus === 'rejected') {
      hrsHtml = `
        <div class="dtr-hrs-box" title="${regHrs}h regular approved, ${otHrs}h overtime declined">
          <span class="dtr-hrs-val">${regHrs} hrs</span>
          <span class="dtr-hrs-sub" style="color:#ef4444;font-weight:700;">(${otHrs}h OT Declined)</span>
        </div>`;
    } else {
      hrsHtml = `
        <div class="dtr-hrs-box" title="${regHrs}h regular credited, ${otHrs}h overtime pending review">
          <span class="dtr-hrs-val">${regHrs} hrs</span>
          <span class="dtr-hrs-sub" style="color:#b45309;font-weight:700;">(+${otHrs}h OT Escrow)</span>
        </div>`;
    }
  } else {
    const hasSplit = (log.morningHours > 0 || log.afternoonHours > 0);
    const splitText = hasSplit ? `${Number(log.morningHours || 0).toFixed(1)}h AM · ${Number(log.afternoonHours || 0).toFixed(1)}h PM` : '';
    hrsHtml = `
      <div class="dtr-hrs-box">
        <span class="dtr-hrs-val">${rawHrs} hrs</span>
        ${splitText ? `<span class="dtr-hrs-sub">${splitText}</span>` : ''}
      </div>`;
  }

  // 5. Status Badge
  let statusBadgeHtml = '';
  if (log.isTimeoutIneligible) {
    statusBadgeHtml = `<span class="dtr-status-pill" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;" title="${esc(log.timeoutIneligibleReason || 'Unlogged Exit - Ineligible pending supervisor approval')}">${icon('alertTriangle', 11)} Unlogged Exit</span>`;
  } else if (isPendingApproval) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--pending" title="Outside geofence - awaiting company supervisor approval">${icon('alertTriangle', 11)} Pending Review</span>`;
  } else if (isRejected) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--rejected" title="${esc(log.rejectionReason || 'Attendance rejected')}">${icon('x', 11)} Rejected</span>`;
  } else if (isAbsent) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--absent">${icon('x', 11)} Absent</span>`;
  } else if (isHalfDayAm) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--half">${icon('clock', 11)} Half Day (AM)</span>`;
  } else if (isHalfDayPm) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--half">${icon('clock', 11)} Half Day (PM)</span>`;
  } else if (isExcused) {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--excused" title="${esc(log.outOfRangeReason || 'Absence excused')}">${icon('shieldCheck', 11)} Excused</span>`;
  } else if (st === 'valid' || log.locationValidity === 'In Site') {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--valid">${icon('check', 11)} Valid</span>`;
  } else {
    statusBadgeHtml = `<span class="dtr-status-pill dtr-status-pill--half">${esc(log.status || 'Logged')}</span>`;
  }

  // 6. Location & Geofence
  const dist = log.distanceMeters != null ? Number(log.distanceMeters) : null;
  const inLat = log.inLat ?? log.latitude;
  const inLon = log.inLon ?? log.longitude;
  const hasCoords = inLat != null && inLon != null;
  const coordsChip = hasCoords ? `
    <div class="dtr-coords-chip" title="GPS check-in coordinates">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      <span>${Number(inLat).toFixed(5)}, ${Number(inLon).toFixed(5)}</span>
    </div>
  ` : '';

  let lvHtml = '';
  if (isAbsent) {
    lvHtml = `<span class="dtr-loc-badge--absent">No Attendance</span>`;
  } else if (isExcused) {
    lvHtml = `<span class="dtr-loc-badge dtr-loc-badge--nogps" title="${esc(log.outOfRangeReason || 'Excused')}">${icon('shieldCheck', 11)} Excused</span>`;
  } else if (log.hasGeofenceExemption) {
    const distHint = dist !== null ? `(${dist}m)` : '';
    lvHtml = `
      <div class="dtr-loc-box">
        <span class="dtr-loc-badge dtr-loc-badge--offsite" title="${esc(log.outOfRangeReason || 'Off-site punch with photo proof')}">
          ${icon('camera', 11)} Off-Site Proof ${distHint}
        </span>
        ${coordsChip}
      </div>`;
  } else {
    let isInSite = false;
    let isTooFar = false;

    if (dist !== null) {
      isInSite = dist <= (ojt?.geofenceRadius || 50);
      isTooFar = dist > (ojt?.geofenceRadius || 50);
    } else if (log.locationValidity === 'In Site' || log.locationValidity === 'valid' || log.status === 'valid') {
      isInSite = true;
    } else if (log.locationValidity === 'Too Far' || log.status === 'not_valid') {
      isTooFar = true;
    }

    if (isInSite) {
      const distHint = dist !== null ? `(${dist}m)` : '';
      lvHtml = `
        <div class="dtr-loc-box">
          <span class="dtr-loc-badge dtr-loc-badge--insite">
            ${icon('check', 11)} In Site ${distHint}
          </span>
          ${coordsChip}
        </div>`;
    } else if (isTooFar) {
      const distHint = dist !== null ? `(${dist}m)` : '';
      lvHtml = `
        <div class="dtr-loc-box">
          <span class="dtr-loc-badge dtr-loc-badge--toofar" title="Check-in registered outside geofence boundary">
            ${icon('alertTriangle', 11)} Too Far ${distHint}
          </span>
          ${coordsChip}
        </div>`;
    } else if (hasCoords) {
      lvHtml = `
        <div class="dtr-loc-box">
          <span class="dtr-loc-badge dtr-loc-badge--gps">
            ${icon('mapPin', 11)} GPS Saved
          </span>
          ${coordsChip}
        </div>`;
    } else {
      lvHtml = `<span class="dtr-loc-badge dtr-loc-badge--nogps">No GPS</span>`;
    }
  }

  return `
    <tr class="ojt-dtr-row log-table-row ${isAbsent ? 'ojt-dtr-row--absent' : ''}" data-log-id="${log.id}">
      <td class="ojt-dtr-td">
        <div class="dtr-date-box">
          <div class="dtr-date-main">
            <span>${esc(dateInfo.formattedDate)}</span>
            ${dateInfo.isToday ? '<span class="dtr-today-tag">Today</span>' : ''}
          </div>
          ${dateInfo.weekday ? `<span class="dtr-date-sub">${esc(dateInfo.weekday)}</span>` : ''}
        </div>
      </td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${mInHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${mOutHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${aInHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${aOutHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${hrsHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${statusBadgeHtml}</td>
      <td class="ojt-dtr-td ojt-dtr-td--center">${lvHtml}</td>
    </tr>`;
}

// ── Leaflet Map with Company Pin + Geofence Circle + Side-by-Side In/Out Pins ──
function initLeafletMap(container, ojt, logs = []) {
  const mapDiv = container.querySelector('#ojt-map');
  if (!mapDiv) return;

  // Load Leaflet CSS + JS dynamically
  if (!document.querySelector('link[href*="leaflet"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
  }

  function boot() {
    const L = window.L;
    if (!L || !mapDiv || !mapDiv.isConnected) return;

    // Clean up any existing Leaflet instance on this element before re-initializing
    if (mapDiv._leafletMap) {
      try { mapDiv._leafletMap.remove(); } catch (_) {}
      mapDiv._leafletMap = null;
    }

    // Default center: Bacolod City
    const defaultLat = 10.6840;
    const defaultLon = 122.9563;

    // Center on the most recent logged location (prefer log-in, fall back to log-out or company)
    const geoLogs = logs.filter(l => (l.inLat != null && l.inLon != null) || (l.outLat != null && l.outLon != null));
    const firstLog = geoLogs[0];
    const centerLat = firstLog?.inLat != null ? Number(firstLog.inLat) : (ojt.companyLat != null ? Number(ojt.companyLat) : defaultLat);
    const centerLon = firstLog?.inLon != null ? Number(firstLog.inLon) : (ojt.companyLon != null ? Number(ojt.companyLon) : defaultLon);

    const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: true }).setView([centerLat, centerLon], 15);
    mapDiv._leafletMap = map;

    L.DomEvent.disableClickPropagation(mapDiv);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // ── Layers for interactive filtering ────────────────────────────────────
    const inLayer = L.layerGroup().addTo(map);
    const outLayer = L.layerGroup().addTo(map);
    const linesLayer = L.layerGroup().addTo(map);

    // ── Icons ────────────────────────────────────────────────────────────────
    const logOutIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:#f97316;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
               <div style="width:7px;height:7px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div>
             </div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -26],
    });

    const greenIcon = L.divIcon({
      html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
               <div style="width:8px;height:8px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div>
             </div>`,
      className: '',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -28],
    });

    const redIcon = L.divIcon({
      html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg);"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
             </div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -32],
    });

    const allPoints = [];
    const logMarkersMap = {};

    // ── Render log-IN and log-OUT pins ──────────────────────────────────────
    logs.forEach(log => {
      const hasIn = log.inLat != null && log.inLon != null;
      const hasOut = log.outLat != null && log.outLon != null;
      if (!hasIn && !hasOut) return;

      const inLat = hasIn ? parseFloat(log.inLat) : null;
      const inLon = hasIn ? parseFloat(log.inLon) : null;
      let outLat = hasOut ? parseFloat(log.outLat) : null;
      let outLon = hasOut ? parseFloat(log.outLon) : null;

      // When In and Out locations are identical or within ~10m,
      // offset the Out pin slightly (~12m East) so both pins are clearly visible side-by-side!
      if (hasIn && hasOut && Math.abs(inLat - outLat) < 0.00010 && Math.abs(inLon - outLon) < 0.00010) {
        outLon = inLon + 0.00012;
      }

      let inMarker = null;
      let outMarker = null;

      if (hasOut) {
        allPoints.push([outLat, outLon]);
        outMarker = L.marker([outLat, outLon], { icon: logOutIcon, zIndexOffset: 80 })
          .addTo(outLayer)
          .bindPopup(`
            <div style="font-size:0.8rem;min-width:160px;">
              <strong style="color:#f97316;">Log Out</strong><br>
              <span style="color:#555;">${log.dayLabel || log.date}</span><br>
              <span>Out: <b>${log.timeOut || log.afternoonOut || '—'}</b></span><br>
              <span>Rendered: <b>${log.hours || 0} hrs</b></span><br>
              <span style="font-size:0.72rem;color:#888;">${outLat.toFixed(5)}, ${outLon.toFixed(5)}</span>
            </div>
          `, { closeButton: false });
      }

      if (hasIn) {
        allPoints.push([inLat, inLon]);
        inMarker = L.marker([inLat, inLon], { icon: greenIcon, zIndexOffset: 120 })
          .addTo(inLayer)
          .bindPopup(`
            <div style="font-size:0.8rem;min-width:160px;">
              <strong style="color:#22c55e;">Log In</strong><br>
              <span style="color:#555;">${log.dayLabel || log.date}</span><br>
              <span>In: <b>${log.morningIn || log.timeIn || '—'}</b></span><br>
              <span style="font-size:0.72rem;color:#888;">${inLat.toFixed(5)}, ${inLon.toFixed(5)}</span>
            </div>
          `, { closeButton: false });
      }

      if (hasIn && hasOut) {
        L.polyline([[inLat, inLon], [outLat, outLon]], {
          color: '#f97316',
          weight: 2,
          opacity: 0.6,
          dashArray: '3 4',
        }).addTo(linesLayer);
      }

      logMarkersMap[log.id] = { inMarker, outMarker, inLat, inLon, outLat, outLon };
    });

    // ── Red Pin + 50m Geofence Circle: Company Location ─────────────────────
    function placeCompanyPin(compLat, compLon) {
      allPoints.push([compLat, compLon]);

      // Circular Geofence Boundary (50-meter radius)
      L.circle([compLat, compLon], {
        radius: ojt.geofenceRadius || 50,
        color: '#005930',
        fillColor: '#22c55e',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 6',
      }).addTo(map).bindPopup(`
        <div style="font-size:0.8rem;min-width:150px;">
          <strong style="color:#005930;">${ojt.geofenceRadius || 50}m Geofence Perimeter</strong><br>
          <span style="color:#555;font-size:0.75rem;">Verified host site check-in boundary</span>
        </div>
      `);

      L.marker([compLat, compLon], { icon: redIcon, zIndexOffset: 300 })
        .addTo(map)
        .bindPopup(`
          <div style="font-size:0.8rem;min-width:160px;">
            <strong style="color:#ef4444;">Company Location</strong><br>
            <span style="font-weight:600;">${ojt.company || ''}</span><br>
            <span style="color:#555;font-size:0.72rem;">${ojt.location || ''}</span>
          </div>
        `, { closeButton: false });

      if (allPoints.length > 0) {
        map.fitBounds(allPoints, { padding: [40, 40], maxZoom: 16 });
      } else {
        map.setView([compLat, compLon], 15);
      }
    }

    if (ojt.companyLat != null && ojt.companyLon != null) {
      placeCompanyPin(parseFloat(ojt.companyLat), parseFloat(ojt.companyLon));
    } else if (ojt.location) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(ojt.location)}`, {
        headers: { 'Accept-Language': 'en' },
      })
        .then(r => r.json())
        .then(results => {
          if (!results || results.length === 0) return;
          placeCompanyPin(parseFloat(results[0].lat), parseFloat(results[0].lon));
        })
        .catch(() => {});
    }

    // ── Interactive Legend Filters: All / Log In / Log Out ──────────────────
    const btnAll = container.querySelector('#map-filter-all');
    const btnIn  = container.querySelector('#map-filter-in');
    const btnOut = container.querySelector('#map-filter-out');

    const updateFilterActive = (activeBtn) => {
      [btnAll, btnIn, btnOut].forEach(b => {
        if (!b) return;
        if (b === activeBtn) {
          b.style.background = 'rgba(0,89,48,0.1)';
          b.style.color = '#005930';
          b.style.borderColor = '#005930';
        } else {
          b.style.background = '';
          b.style.color = 'var(--text-secondary)';
          b.style.borderColor = 'var(--border-default)';
        }
      });
    };

    btnAll?.addEventListener('click', () => {
      if (!map.hasLayer(inLayer)) map.addLayer(inLayer);
      if (!map.hasLayer(outLayer)) map.addLayer(outLayer);
      if (!map.hasLayer(linesLayer)) map.addLayer(linesLayer);
      updateFilterActive(btnAll);
    });

    btnIn?.addEventListener('click', () => {
      if (!map.hasLayer(inLayer)) map.addLayer(inLayer);
      if (map.hasLayer(outLayer)) map.removeLayer(outLayer);
      if (map.hasLayer(linesLayer)) map.removeLayer(linesLayer);
      updateFilterActive(btnIn);
    });

    btnOut?.addEventListener('click', () => {
      if (map.hasLayer(inLayer)) map.removeLayer(inLayer);
      if (!map.hasLayer(outLayer)) map.addLayer(outLayer);
      if (map.hasLayer(linesLayer)) map.removeLayer(linesLayer);
      updateFilterActive(btnOut);
    });

    // ── Focus Map on Clicked Log from Paginated Table ───────────────────────
    window.focusMapLog = (logId) => {
      const entry = logMarkersMap[logId];
      if (!entry) return;

      if (window.innerWidth <= 992 && mapDiv && mapDiv.isConnected) {
        mapDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (!map.hasLayer(inLayer)) map.addLayer(inLayer);
      if (!map.hasLayer(outLayer)) map.addLayer(outLayer);
      if (!map.hasLayer(linesLayer)) map.addLayer(linesLayer);
      updateFilterActive(btnAll);

      setTimeout(() => {
        if (!mapDiv || !mapDiv.isConnected) return;
        map.invalidateSize();
        if (entry.inMarker && entry.outMarker) {
          map.fitBounds(L.latLngBounds([
            entry.inMarker.getLatLng(),
            entry.outMarker.getLatLng()
          ]), { padding: [70, 70], maxZoom: 18 });
          entry.inMarker.openPopup();
        } else if (entry.inMarker) {
          map.setView(entry.inMarker.getLatLng(), 17);
          entry.inMarker.openPopup();
        } else if (entry.outMarker) {
          map.setView(entry.outMarker.getLatLng(), 17);
          entry.outMarker.openPopup();
        }
      }, window.innerWidth <= 992 ? 250 : 0);
    };

    if (window._ojtMapResizeHandler) {
      window.removeEventListener('resize', window._ojtMapResizeHandler);
    }
    if (window._ojtMapResizeObserver) {
      try { window._ojtMapResizeObserver.disconnect(); } catch (_) {}
      window._ojtMapResizeObserver = null;
    }

    const syncMapSize = () => {
      if (!mapDiv || !mapDiv.isConnected) {
        if (window._ojtMapResizeHandler) {
          window.removeEventListener('resize', window._ojtMapResizeHandler);
          window._ojtMapResizeHandler = null;
        }
        if (window._ojtMapResizeObserver) {
          try { window._ojtMapResizeObserver.disconnect(); } catch (_) {}
          window._ojtMapResizeObserver = null;
        }
        return;
      }
      if (mapDiv.offsetParent !== null) {
        map.invalidateSize();
      }
    };

    window._ojtMapResizeHandler = syncMapSize;
    window.addEventListener('resize', window._ojtMapResizeHandler);

    if (typeof ResizeObserver !== 'undefined') {
      window._ojtMapResizeObserver = new ResizeObserver(() => syncMapSize());
      window._ojtMapResizeObserver.observe(mapDiv);
    }

    setTimeout(() => syncMapSize(), 200);
  }

  if (window.L) {
    boot();
  } else {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = boot;
    document.head.appendChild(script);
  }
}

// ── Calendar HTML builder ─────────────────────────────────────────────────────
function buildCalendarHTML(year, month, logMap) {
  const firstDay    = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow    = firstDay.getDay();

  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">`;

  // First-letter day headers for compact layout
  DAYS_SHORT.forEach(d => {
    html += `<div style="text-align:center;font-size:0.58rem;font-weight:700;color:var(--text-tertiary);padding:4px 0;text-transform:uppercase;">${d[0]}</div>`;
  });

  // Empty leading cells
  for (let i = 0; i < startDow; i++) {
    html += `<div></div>`;
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj   = new Date(year, month, d);
    const dow       = dateObj.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday   = year === TODAY.getFullYear() && month === TODAY.getMonth() && d === TODAY.getDate();
    const isPast    = dateObj < TODAY && !isToday;
    const dateStr   = `${MONTHS_SHORT[month]} ${d}, ${year}`;
    const log       = logMap[dateStr];

    let dotHtml = '';
    let cellBg  = 'transparent';
    let numColor = isWeekend && !isToday ? 'var(--text-tertiary)' : 'var(--text-primary)';
    let extraAttr = '';

    if (isToday) {
      cellBg   = 'var(--color-accent)';
      numColor = '#fff';
    }

    let tooltipParts = isWeekend ? 'Weekend' : '';
    if (log) {
      let dotColor = 'var(--text-tertiary)';
      tooltipParts = `${log.timeIn || '—'} – ${log.timeOut || '—'} · ${log.hours || 0}h (${log.status})`;

      if (log.status === 'absent') {
        dotColor = 'var(--color-error,#ef4444)';
        if (!isToday) cellBg = 'rgba(239,68,68,0.08)';
        tooltipParts = 'Absent (0h rendered)';
      } else if (log.status === 'half_day_am') {
        dotColor = '#2563eb';
        if (!isToday) cellBg = 'rgba(37,99,235,0.06)';
        tooltipParts = `Half Day (AM) · ${log.morningHours || log.hours || 4}h`;
      } else if (log.status === 'half_day_pm') {
        dotColor = '#2563eb';
        if (!isToday) cellBg = 'rgba(37,99,235,0.06)';
        tooltipParts = `Half Day (PM) · ${log.afternoonHours || log.hours || 4}h`;
      } else if (log.status === 'excused') {
        dotColor = '#64748b';
        if (!isToday) cellBg = 'rgba(100,116,139,0.08)';
        tooltipParts = `Excused: ${log.outOfRangeReason || 'Leave'}`;
      } else if (log.status === 'valid') {
        dotColor = 'var(--color-success)';
      } else if (log.status === 'not_valid') {
        dotColor = 'var(--color-error,#ef4444)';
      }

      dotHtml   = `<span style="display:block;width:4px;height:4px;border-radius:50%;background:${dotColor};margin:1px auto 0;"></span>`;
      extraAttr = `data-log-date="${dateStr}" class="cal-day--has-log"`;
    }

    html += `
      <div ${extraAttr}
        style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:5px;background:${cellBg};color:${numColor};cursor:${log ? 'pointer' : 'default'};padding:1px;transition:background 0.15s;"
        title="${tooltipParts}"
      >
        <span style="font-size:0.66rem;font-weight:${isToday ? '700' : '500'};line-height:1;">${d}</span>
        ${dotHtml}
      </div>`;
  }

  html += `</div>`;
  return html;
}

// ── Log Today Modal ───────────────────────────────────────────────────────────
// ── Shared: get current time as HH:MM ────────────────────────────────────────
function currentTimeHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ── Shared: request geolocation — tries high accuracy, falls back to network ──
function requestGeo(geoBox, geoLabel) {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      geoBox.style.background = 'rgba(239,68,68,0.07)';
      geoBox.style.border = '1px solid rgba(239,68,68,0.4)';
      geoLabel.innerHTML = '<span style="color:#ef4444;font-weight:600;">Geolocation not supported</span> by this browser.';
      resolve(null);
      return;
    }

    function tryGeo(highAccuracy) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          geoBox.style.background = 'var(--color-success-bg)';
          geoBox.style.border = '1px solid var(--color-success)';
          geoLabel.innerHTML = `<span style="color:var(--color-success);font-weight:600;">Location captured</span> <span style="color:var(--text-tertiary);">(${lat.toFixed(5)}, ${lon.toFixed(5)})</span>`;
          resolve({ lat, lon });
        },
        (err) => {
          // On timeout with high accuracy, retry using network-based location
          if (err.code === 3 && highAccuracy) {
            geoLabel.innerHTML = '<span style="color:var(--color-warning);">GPS timed out — trying network location…</span>';
            tryGeo(false);
            return;
          }
          // Final failure — show reason
          geoBox.style.background = 'rgba(239,68,68,0.07)';
          geoBox.style.border = '1px solid rgba(239,68,68,0.4)';
          const reason = err.code === 1
            ? 'Permission denied — allow location in your browser settings.'
            : err.code === 2
            ? 'Location unavailable on this device.'
            : 'Location request timed out.';
          geoLabel.innerHTML = `<span style="color:#ef4444;font-weight:600;">Location failed</span> — ${reason}`;
          resolve(null);
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 10000 : 8000, maximumAge: 0 }
      );
    }

    geoLabel.innerHTML = '<span style="color:var(--text-secondary);">Detecting your location…</span>';
    tryGeo(true);
  });
}

// ── Outside Geofence Modal ───────────────────────────────────────────────────
function showOutsideGeofenceModal(errOrDistance) {
  const isObj = errOrDistance && typeof errOrDistance === 'object';
  const dist = isObj && errOrDistance.distance_meters != null
    ? `${errOrDistance.distance_meters} m`
    : (typeof errOrDistance === 'number' ? `${errOrDistance} m` : 'Too far');
  const allowed = (isObj && errOrDistance.allowed_radius_meters != null) ? `${errOrDistance.allowed_radius_meters} m` : '50 m';
  const comp = (isObj && (errOrDistance.company_name || errOrDistance.company)) || 'Host Training Site';
  const loc = (isObj && errOrDistance.location) || '';

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  bd.innerHTML = `
    <div class="modal modal--visible ojt-tracker-modal" style="max-width:440px;text-align:center;">
      <div class="modal__body" style="padding:32px 24px 24px;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,0.12);color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 0 0 6px rgba(239,68,68,0.06);">
          ${icon('mapPin', 30)}
        </div>
        <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:8px;color:#ef4444;">Outside OJT Site Radius</h3>
        <p style="color:var(--text-secondary);font-size:0.87rem;line-height:1.55;margin-bottom:16px;">
          You cannot record attendance while outside your host company premises.
        </p>
        <div style="padding:12px;background:var(--bg-secondary);border:1px solid var(--border-light);border-radius:var(--radius-md);margin-bottom:20px;text-align:left;font-size:0.8rem;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:var(--text-tertiary);">Host Company:</span>
            <strong style="color:var(--text-primary);">${esc(comp)}</strong>
          </div>
          ${loc ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:var(--text-tertiary);">Location:</span>
            <span style="color:var(--text-secondary);text-align:right;max-width:60%;">${esc(loc)}</span>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:var(--text-tertiary);">Your Distance:</span>
            <strong style="color:#ef4444;">${dist}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--text-tertiary);">Allowed Perimeter:</span>
            <strong style="color:#005930;">Within ${allowed}</strong>
          </div>
        </div>
        <p style="font-size:0.75rem;color:var(--text-tertiary);line-height:1.5;margin-bottom:20px;">
          Please ensure you are physically present at your host company training premises with device GPS enabled before punching your daily attendance.
        </p>
        <button class="btn btn--primary" id="og-close" style="width:100%;padding:10px;">Understood</button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);
  const close = () => bd.remove();
  bd.querySelector('#og-close').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });
}

const showLocationWarning = showOutsideGeofenceModal;

// ── Off-Site Camera & Evidence Capture Form Helper ────────────────────────────
function setupOffSiteEvidence(panelEl, onEvidenceChange) {
  let mediaStream = null;
  let compressedPhotoBase64 = null;
  let currentFacing = 'user';
  let isStarting = false;

  panelEl.innerHTML = `
    <div class="ojt-evidence-card">
      <div class="ojt-evidence-header">
        <div class="ojt-evidence-header-icon">
          ${icon('camera', 18)}
        </div>
        <div>
          <h4 class="ojt-evidence-header-title">Camera Verification &amp; Assignment Proof</h4>
          <p class="ojt-evidence-header-desc">
            You are outside the host site perimeter. Entries are recorded in escrow and require supervisor review. Please state your fieldwork assignment and capture a verified live photo.
          </p>
        </div>
      </div>

      <div class="ojt-req-form-group">
        <div class="ojt-req-label-row">
          <label for="evidence-reason" class="ojt-req-label">
            Written Explanation / Assignment <span class="ojt-req-required-star">*</span>
          </label>
        </div>
        <textarea id="evidence-reason" class="ojt-req-textarea" rows="2" placeholder="e.g., Assigned to off-site client installation, field inspection, or official errands..."></textarea>
        <div class="ojt-req-helper-row">
          <span>Required for supervisor validation.</span>
          <span id="evidence-char-count" class="ojt-req-char-count">0 / 3 min</span>
        </div>
      </div>

      <div class="ojt-req-form-group">
        <div class="ojt-req-label-row">
          <label class="ojt-req-label">
            Live Photo Proof <span class="ojt-req-required-star">*</span>
          </label>
          <span id="evidence-photo-status" class="ojt-req-optional-tag" style="display:none;background:#dcfce7;color:#166534;font-weight:700;">Photo Ready</span>
        </div>

        <div class="ojt-camera-viewport">
          <video id="evidence-video" autoplay playsinline muted style="width:100%;max-height:220px;object-fit:cover;display:none;"></video>
          <img id="evidence-preview" style="width:100%;max-height:220px;object-fit:cover;display:none;" />
          <div id="evidence-placeholder" class="ojt-camera-placeholder">
            <div class="ojt-camera-placeholder-icon">
              ${icon('camera', 24)}
            </div>
            <div class="ojt-camera-placeholder-title">Live Camera Verification Required</div>
            <div class="ojt-camera-placeholder-desc">Capture a live snapshot or upload a photo showing your off-site work assignment.</div>
          </div>
          <canvas id="evidence-canvas" style="display:none;"></canvas>
        </div>

        <div class="ojt-camera-actions-bar">
          <div class="ojt-camera-actions-left">
            <button type="button" class="btn btn--sm btn--primary" id="btn-start-camera" style="font-size:0.75rem;padding:6px 14px;display:inline-flex;align-items:center;gap:6px;background:#005930;border-color:#005930;">
              ${icon('camera', 14)} Open Camera
            </button>
            <button type="button" class="btn btn--sm btn--primary" id="btn-snap-photo" style="display:none;font-size:0.75rem;padding:6px 14px;background:#059669;border-color:#059669;align-items:center;gap:6px;">
              ${icon('check', 14)} Take Snapshot
            </button>
            <button type="button" class="btn btn--sm btn--outline" id="btn-flip-camera" style="display:none;font-size:0.75rem;padding:6px 12px;align-items:center;gap:5px;">
              ${icon('refreshCw', 13)} Switch Camera
            </button>
            <button type="button" class="btn btn--sm btn--outline" id="btn-retake-photo" style="display:none;font-size:0.75rem;padding:6px 14px;align-items:center;gap:6px;">
              ${icon('refreshCcw', 14)} Retake Photo
            </button>
          </div>
          <label class="btn btn--sm btn--outline" style="font-size:0.75rem;padding:6px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;margin:0;">
            ${icon('upload', 13)} Upload Photo
            <input type="file" id="evidence-file-input" accept="image/*" style="display:none;" />
          </label>
        </div>
      </div>
    </div>
  `;

  const videoEl = panelEl.querySelector('#evidence-video');
  const previewEl = panelEl.querySelector('#evidence-preview');
  const placeholderEl = panelEl.querySelector('#evidence-placeholder');
  const canvasEl = panelEl.querySelector('#evidence-canvas');
  const startBtn = panelEl.querySelector('#btn-start-camera');
  const snapBtn = panelEl.querySelector('#btn-snap-photo');
  const flipBtn = panelEl.querySelector('#btn-flip-camera');
  const retakeBtn = panelEl.querySelector('#btn-retake-photo');
  const fileInput = panelEl.querySelector('#evidence-file-input');
  const reasonEl = panelEl.querySelector('#evidence-reason');
  const charCounter = panelEl.querySelector('#evidence-char-count');
  const photoStatus = panelEl.querySelector('#evidence-photo-status');

  function notify() {
    const reason = reasonEl.value.trim();
    const len = reason.length;
    if (charCounter) {
      charCounter.textContent = `${len} / 3 min`;
      if (len >= 3) {
        charCounter.classList.add('ojt-req-char-count--valid');
      } else {
        charCounter.classList.remove('ojt-req-char-count--valid');
      }
    }
    if (photoStatus) {
      photoStatus.style.display = compressedPhotoBase64 ? 'inline-block' : 'none';
    }

    const isReady = !!(compressedPhotoBase64 && len >= 3);
    onEvidenceChange({
      isReady,
      reason,
      photo: compressedPhotoBase64,
    });
  }

  reasonEl.addEventListener('input', notify);

  async function acquireStream(facing) {
    const facingConstraints = facing === 'environment'
      ? [{ ideal: 'environment' }, { ideal: 'user' }]
      : [{ ideal: 'user' }, { ideal: 'environment' }];

    const tries = [
      { video: { facingMode: facingConstraints[0], width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: facingConstraints[0] } },
      { video: { facingMode: facingConstraints[1] } },
      { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: true }
    ];

    let lastErr = null;
    for (const constraint of tries) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          return await navigator.mediaDevices.getUserMedia(constraint);
        }
        const legacyGUM = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (legacyGUM) {
          return await new Promise((res, rej) => legacyGUM.call(navigator, constraint, res, rej));
        }
        throw new Error('Camera streaming is not supported in this browser environment.');
      } catch (err) {
        lastErr = err;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' ||
            err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw err;
        }
      }
    }
    throw lastErr || new Error('Could not access camera.');
  }

  function handleCameraError(err) {
    let title = 'Could Not Access Camera';
    let desc = 'Capture a live snapshot or upload a photo showing your off-site work assignment.';
    let toastMsg = 'Could not open camera. Please use the Upload button or grant permissions.';
    let iconSvg = icon('camera', 24);

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      title = 'Camera Access Blocked';
      desc = 'Camera permission was denied. Please allow camera access in your browser address bar (look for the lock 🔒 or camera 📷 icon) and try again, or use "Upload Photo".';
      toastMsg = 'Camera permission blocked. Click the lock/camera icon in your address bar to allow.';
      iconSvg = icon('lock', 24);
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      title = 'No Camera Detected';
      desc = 'No camera hardware was found on this device. You can connect a webcam or use "Upload Photo" below.';
      toastMsg = 'No camera found. Please use the Upload Photo button.';
      iconSvg = icon('alertCircle', 24);
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      title = 'Camera In Use';
      desc = 'Your camera is currently in use by another app (e.g., Zoom, Teams, Meet). Please close that app and retry, or use "Upload Photo".';
      toastMsg = 'Camera in use by another program. Close it and retry or use Upload Photo.';
      iconSvg = icon('alertTriangle', 24);
    } else if (!navigator.mediaDevices && !navigator.getUserMedia) {
      title = 'Camera Not Supported';
      desc = 'Your browser or environment does not support direct camera streaming. Please use "Upload Photo" below.';
      toastMsg = 'Camera streaming not supported in this browser. Please use Upload Photo.';
      iconSvg = icon('alertCircle', 24);
    }

    placeholderEl.innerHTML = `
      <div class="ojt-camera-placeholder-icon" style="background:rgba(239,68,68,0.15);color:#f87171;">
        ${iconSvg}
      </div>
      <div class="ojt-camera-placeholder-title" style="color:#fca5a5;">${title}</div>
      <div class="ojt-camera-placeholder-desc" style="max-width:320px;line-height:1.4;">${desc}</div>
    `;
    placeholderEl.style.display = 'flex';
    videoEl.style.display = 'none';
    previewEl.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    startBtn.innerHTML = `${icon('refreshCw', 14)} Retry Camera`;
    snapBtn.style.display = 'none';
    if (flipBtn) flipBtn.style.display = 'none';
    retakeBtn.style.display = 'none';

    showToast(toastMsg, 'warning');
  }

  async function startCamera(facing = currentFacing) {
    if (isStarting) return;
    isStarting = true;

    startBtn.disabled = true;
    startBtn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">${icon('loader', 14)}</span> Opening camera…`;

    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
      }

      mediaStream = await acquireStream(facing);
      currentFacing = facing;

      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('muted', '');
      videoEl.srcObject = mediaStream;

      await new Promise((resolve) => {
        videoEl.onloadedmetadata = () => {
          videoEl.play().catch(e => console.warn('video.play error:', e)).finally(resolve);
        };
        setTimeout(resolve, 800);
      });

      videoEl.style.display = 'block';
      previewEl.style.display = 'none';
      placeholderEl.style.display = 'none';
      startBtn.style.display = 'none';
      snapBtn.style.display = 'inline-flex';
      if (flipBtn) flipBtn.style.display = 'inline-flex';
      retakeBtn.style.display = 'none';
    } catch (err) {
      console.warn('Camera access error:', err);
      handleCameraError(err);
    } finally {
      isStarting = false;
      startBtn.disabled = false;
      if (startBtn.innerHTML.includes('Opening camera…')) {
        startBtn.innerHTML = `${icon('camera', 14)} Open Camera`;
      }
    }
  }

  function snapPhoto() {
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    if (!vw || !vh) {
      showToast('Camera feed is still initializing. Please wait a moment and try again.', 'warning');
      return;
    }
    const maxDim = 800;
    let w = vw;
    let h = vh;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, w, h);
    compressedPhotoBase64 = canvasEl.toDataURL('image/jpeg', 0.8);

    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    videoEl.srcObject = null;

    previewEl.src = compressedPhotoBase64;
    previewEl.style.display = 'block';
    videoEl.style.display = 'none';
    snapBtn.style.display = 'none';
    if (flipBtn) flipBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-flex';
    notify();
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvasEl.width = w;
        canvasEl.height = h;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        compressedPhotoBase64 = canvasEl.toDataURL('image/jpeg', 0.8);

        if (mediaStream) {
          mediaStream.getTracks().forEach(t => t.stop());
          mediaStream = null;
        }
        videoEl.srcObject = null;

        previewEl.src = compressedPhotoBase64;
        previewEl.style.display = 'block';
        videoEl.style.display = 'none';
        placeholderEl.style.display = 'none';
        startBtn.style.display = 'none';
        snapBtn.style.display = 'none';
        if (flipBtn) flipBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-flex';
        notify();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  startBtn.addEventListener('click', () => startCamera());
  snapBtn.addEventListener('click', snapPhoto);
  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      const nextFacing = currentFacing === 'user' ? 'environment' : 'user';
      startCamera(nextFacing);
    });
  }
  retakeBtn.addEventListener('click', () => {
    compressedPhotoBase64 = null;
    previewEl.src = '';
    previewEl.style.display = 'none';
    notify();
    startCamera(currentFacing);
  });
  fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  return {
    destroy: () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
    }
  };
}

// ── Log In Modal ──────────────────────────────────────────────────────────────
function getSyncedNow(ojtContext) {
  const offset = Number(ojtContext?.serverOffsetMs || 0);
  return new Date(Date.now() + (Number.isFinite(offset) ? offset : 0));
}

function formatDateHHMM(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateClock12h(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} ${ampm}`;
}

function showLogInModal(sessionLabelOrSuccess, ojtContextOrSuccess, onSuccessMaybe) {
  const sessionLabel = typeof sessionLabelOrSuccess === 'string' ? sessionLabelOrSuccess : 'Log In';
  let ojtContext = null;
  let onSuccess = null;

  if (typeof ojtContextOrSuccess === 'function') {
    onSuccess = ojtContextOrSuccess;
    ojtContext = typeof onSuccessMaybe === 'object' ? onSuccessMaybe : null;
  } else {
    ojtContext = typeof ojtContextOrSuccess === 'object' ? ojtContextOrSuccess : null;
    onSuccess = typeof onSuccessMaybe === 'function' ? onSuccessMaybe : () => {};
  }

  let geoResult = null;
  let computedDistance = null;
  let evidenceData = null;
  let evidenceController = null;
  const isAfternoon = sessionLabel.toLowerCase().includes('afternoon');
  const initialSynced = getSyncedNow(ojtContext);

  const bd = document.createElement('div');
  bd.className = 'ojt-req-overlay';
  bd.innerHTML = `
    <div class="ojt-req-modal" style="max-width:480px;" role="dialog" aria-modal="true" aria-labelledby="li-modal-title">
      <!-- Modal Header -->
      <div class="ojt-req-header" style="background:linear-gradient(135deg, rgba(0,89,48,0.08) 0%, rgba(217,119,6,0.06) 100%);">
        <div class="ojt-req-title-wrap">
          <div class="ojt-req-header-icon" style="background:#e0f2fe;color:#0284c7;border:1px solid #bae6fd;">
            ${icon('logIn', 22)}
          </div>
          <div>
            <h3 id="li-modal-title" class="ojt-req-title">Time In (${esc(sessionLabel)})</h3>
            <div class="ojt-req-meta-pills">
              <span class="ojt-req-meta-pill">${icon('building', 12)} ${esc(ojtContext?.company || 'Host Training Site')}</span>
              <span class="ojt-req-meta-pill">${icon('clock', 12)} ${isAfternoon ? 'Afternoon Shift' : 'Morning Shift'}</span>
            </div>
          </div>
        </div>
        <button type="button" class="ojt-req-close-btn" id="li-close" aria-label="Close dialog">
          ${icon('x', 18)}
        </button>
      </div>

      <div class="ojt-req-body" style="padding:18px 20px;">
        <div class="ojt-req-form-group">
          <div class="ojt-req-label-row">
            <label class="ojt-req-label">
              Time In (Live Server Clock) <span class="ojt-req-required-star">*</span>
            </label>
            <span style="font-size:0.68rem;font-weight:700;color:#059669;background:rgba(16,185,129,0.12);padding:2px 8px;border-radius:99px;">Synced &bull; Locked</span>
          </div>
          <div id="li-live-clock-card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-secondary);border:1.5px solid var(--border-default);border-radius:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#005930;display:flex;align-items:center;">${icon('clock', 18)}</span>
              <span id="li-live-clock-val" style="font-size:1.15rem;font-weight:800;font-variant-numeric:tabular-nums;color:var(--text-primary);">${formatDateClock12h(initialSynced)}</span>
            </div>
            <span style="font-size:0.72rem;color:var(--text-tertiary);font-weight:600;">Recorded automatically</span>
          </div>
          ${isAfternoon ? `<p class="text-xs" style="margin-top:4px;color:#d97706;font-weight:600;display:flex;align-items:center;gap:4px;">${icon('clock', 12)} Afternoon session begins at 1:00 PM (Lunch break ends at 1:00 PM)</p>` : ''}
        </div>

        <!-- Location Geofence Status Banner -->
        <div id="li-geo-status" class="ojt-geo-status-banner ojt-geo-status-banner--detecting">
          <div class="ojt-geo-status-content">
            <div class="ojt-geo-status-icon">
              ${icon('mapPin', 16)}
            </div>
            <div class="ojt-geo-status-texts">
              <div class="ojt-geo-status-title" id="li-geo-title">Detecting GPS Location…</div>
              <div class="ojt-geo-status-desc" id="li-geo-desc">Verifying your coordinates against host site</div>
            </div>
          </div>
          <span id="li-geo-badge" style="display:none;" class="ojt-geo-status-badge"></span>
        </div>

        <!-- Alert panel for GPS errors -->
        <div id="li-geo-fail-panel" style="display:none;margin-top:10px;padding:12px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;">
          <p id="li-fail-title" style="font-size:0.8rem;font-weight:700;color:#dc2626;margin:0 0 4px;display:flex;align-items:center;gap:6px;">
            ${icon('alertTriangle', 14)} GPS Location Required
          </p>
          <p id="li-fail-desc" style="font-size:0.74rem;color:#475569;line-height:1.45;margin:0 0 10px;">
            GPS location is mandatory to record attendance. Please enable location permissions in your browser or device settings, then click <strong>Retry Location</strong>.
          </p>
          <button class="btn btn--outline btn--sm" id="li-retry" type="button" style="font-size:0.75rem;padding:5px 12px;display:inline-flex;align-items:center;gap:5px;">
            ${icon('refreshCcw', 13)} Retry Location
          </button>
        </div>

        <div id="li-evidence-container"></div>

        <!-- Institutional Protocol Notice -->
        <div class="ojt-protocol-card" style="margin-top:4px;">
          <div class="ojt-protocol-header">
            ${icon('shieldCheck', 15)}
            <span>Geofence &amp; Escrow Governance</span>
          </div>
          <p class="ojt-protocol-body">
            Attendance within the 50m site perimeter is auto-verified. Out-of-range entries require photo proof and are held in escrow for host company approval.
          </p>
        </div>
      </div>

      <div class="ojt-req-footer">
        <button type="button" class="btn btn--outline" id="li-cancel">Cancel</button>
        <button type="button" class="btn btn--primary" id="li-submit" disabled style="gap:6px;">
          ${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);

  const liveClockValEl = bd.querySelector('#li-live-clock-val');
  const clockInterval = setInterval(() => {
    if (liveClockValEl) {
      liveClockValEl.textContent = formatDateClock12h(getSyncedNow(ojtContext));
    }
  }, 1000);

  const geoBox    = bd.querySelector('#li-geo-status');
  const geoTitle  = bd.querySelector('#li-geo-title');
  const geoDesc   = bd.querySelector('#li-geo-desc');
  const geoBadge  = bd.querySelector('#li-geo-badge');
  const submitBtn = bd.querySelector('#li-submit');
  const failPanel = bd.querySelector('#li-geo-fail-panel');
  const retryBtn  = bd.querySelector('#li-retry');
  const evidenceContainer = bd.querySelector('#li-evidence-container');

  function updateGeoStatus(state, title, desc, badgeText, badgeType) {
    geoBox.className = `ojt-geo-status-banner ojt-geo-status-banner--${state}`;
    if (geoTitle) geoTitle.textContent = title;
    if (geoDesc) geoDesc.textContent = desc;
    if (geoBadge) {
      if (badgeText) {
        geoBadge.textContent = badgeText;
        geoBadge.className = `ojt-geo-status-badge ojt-geo-status-badge--${badgeType || 'valid'}`;
        geoBadge.style.display = 'inline-block';
      } else {
        geoBadge.style.display = 'none';
      }
    }
  }

  function attemptGeo() {
    geoResult = null;
    computedDistance = null;
    evidenceData = null;
    if (evidenceController) {
      evidenceController.destroy();
      evidenceController = null;
    }
    evidenceContainer.innerHTML = '';
    submitBtn.disabled = true;
    failPanel.style.display = 'none';
    updateGeoStatus('detecting', 'Detecting GPS Location…', 'Verifying your coordinates against host site', null);

    const tempLabel = { textContent: '' };
    requestGeo(geoBox, tempLabel).then(result => {
      geoResult = result;
      if (result && result.lat != null && result.lon != null) {
        const compLat = ojtContext?.companyLat != null ? Number(ojtContext.companyLat) : null;
        const compLon = ojtContext?.companyLon != null ? Number(ojtContext.companyLon) : null;
        const maxRadius = ojtContext?.geofenceRadius || 50;
        const compName = ojtContext?.company || 'Host Training Site';

        if (compLat != null && compLon != null) {
          computedDistance = Math.round(haversineMeters(result.lat, result.lon, compLat, compLon));
          if (computedDistance <= maxRadius) {
            // Inside verified geofence perimeter
            updateGeoStatus(
              'inside',
              'Within OJT Site Radius',
              `${computedDistance}m from ${compName} (limit: ${maxRadius}m)`,
              'Verified Location',
              'valid'
            );
            failPanel.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.innerHTML = `${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}`;
            submitBtn.title = '';
          } else {
            // Outside geofence boundary - Show Out-of-Range Evidence Form
            const distLabel = computedDistance >= 1000
              ? `${(computedDistance / 1000).toFixed(1)} km`
              : `${computedDistance} m`;

            updateGeoStatus(
              'outside',
              'Outside OJT Site Radius',
              `${distLabel} away from host premises (limit: ${maxRadius}m)`,
              'Escrow Review Required',
              'escrow'
            );
            failPanel.style.display = 'none';

            submitBtn.disabled = true;
            submitBtn.style.background = '#d97706';
            submitBtn.style.borderColor = '#d97706';
            submitBtn.innerHTML = `${icon('send', 16)} Submit for Review`;
            submitBtn.title = 'Please take a photo and provide a reason to submit.';

            evidenceController = setupOffSiteEvidence(evidenceContainer, ({ isReady, reason, photo }) => {
              if (isReady) {
                evidenceData = { out_of_range_reason: reason, proof_image: photo };
                submitBtn.disabled = false;
                submitBtn.title = '';
              } else {
                evidenceData = null;
                submitBtn.disabled = true;
                submitBtn.title = 'Please take a photo and provide a reason to submit.';
              }
            });
          }
        } else {
          // No coordinates configured on host posting
          updateGeoStatus('inside', 'Coordinates Optional', 'Host has no geofence boundary configured', 'Active', 'valid');
          failPanel.style.display = 'none';
          submitBtn.disabled = false;
        }
      } else {
        failPanel.style.display = 'block';
        failPanel.querySelector('#li-retry')?.addEventListener('click', attemptGeo);
        submitBtn.disabled = true;
      }
    });
  }

  retryBtn.addEventListener('click', attemptGeo);
  attemptGeo();

  const close = () => {
    clearInterval(clockInterval);
    if (evidenceController) evidenceController.destroy();
    bd.remove();
  };
  bd.querySelector('#li-close').addEventListener('click', close);
  bd.querySelector('#li-cancel').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  submitBtn.addEventListener('click', () => {
    const timeVal = formatDateHHMM(getSyncedNow(ojtContext));
    if (isAfternoon && timeVal < '13:00') {
      showToast('Cannot time in before 1:00 PM because it is lunch break.', 'warning');
      return;
    }
    if (!geoResult || geoResult.lat == null || geoResult.lon == null) {
      showToast('GPS location is required to log attendance.', 'error');
      return;
    }
    const maxRadius = ojtContext?.geofenceRadius || 50;
    if (computedDistance != null && computedDistance > maxRadius && !evidenceData) {
      showToast('Please take a live photo and provide an assignment reason.', 'warning');
      return;
    }
    close();
    onSuccess(timeVal, geoResult.lat, geoResult.lon, evidenceData);
  });
}

// ── Parse 12h/24h Time Helper ────────────────────────────────────────────────
function parseTimeTo24(timeStr) {
  if (!timeStr || timeStr === '—' || timeStr === '-') return null;
  const str = String(timeStr).trim();
  const m12 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!m12) return null;
  let h = parseInt(m12[1], 10);
  const min = m12[2];
  const ampm = m12[3] ? m12[3].toUpperCase() : null;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

// ── Log Out Modal ─────────────────────────────────────────────────────────────
function showLogOutModal(todayLog, sessionLabelOrOjt, ojtContextOrSuccess, onSuccessMaybe) {
  let sessionLabel = 'Log Out';
  let ojtContext = null;
  let onSuccess = null;

  if (typeof sessionLabelOrOjt === 'string') {
    sessionLabel = sessionLabelOrOjt;
    if (typeof ojtContextOrSuccess === 'function') {
      onSuccess = ojtContextOrSuccess;
      ojtContext = typeof onSuccessMaybe === 'object' ? onSuccessMaybe : null;
    } else {
      ojtContext = typeof ojtContextOrSuccess === 'object' ? ojtContextOrSuccess : null;
      onSuccess = typeof onSuccessMaybe === 'function' ? onSuccessMaybe : () => {};
    }
  } else if (typeof sessionLabelOrOjt === 'object') {
    ojtContext = sessionLabelOrOjt;
    onSuccess = typeof ojtContextOrSuccess === 'function' ? ojtContextOrSuccess : () => {};
  } else if (typeof sessionLabelOrOjt === 'function') {
    onSuccess = sessionLabelOrOjt;
  }

  let geoResult = null;
  let computedDistance = null;
  let isWithinGeofence = true;
  let evidenceData = null;
  let evidenceController = null;

  const isMorning = sessionLabel.toLowerCase().includes('lunch') || sessionLabel.toLowerCase().includes('morning');
  const loggedInAt = isMorning ? (todayLog?.morningIn || todayLog?.timeIn || '—') : (todayLog?.afternoonIn || todayLog?.timeIn || '—');
  const loggedIn24 = parseTimeTo24(loggedInAt);
  const initialSynced = getSyncedNow(ojtContext);

  const infoText = isMorning
    ? `Morning session started at <strong>${loggedInAt}</strong>. Taking lunch break?`
    : `Afternoon session started at <strong>${loggedInAt}</strong>. Ending shift for today?`;

  const bd = document.createElement('div');
  bd.className = 'ojt-req-overlay';
  bd.innerHTML = `
    <div class="ojt-req-modal" style="max-width:480px;" role="dialog" aria-modal="true" aria-labelledby="lo-modal-title">
      <!-- Modal Header -->
      <div class="ojt-req-header" style="background:linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(239,68,68,0.06) 100%);">
        <div class="ojt-req-title-wrap">
          <div class="ojt-req-header-icon" style="background:#fef3c7;color:#d97706;border:1px solid #fde68a;">
            ${icon('logOut', 22)}
          </div>
          <div>
            <h3 id="lo-modal-title" class="ojt-req-title">Time Out (${esc(sessionLabel)})</h3>
            <div class="ojt-req-meta-pills">
              <span class="ojt-req-meta-pill">${icon('building', 12)} ${esc(ojtContext?.company || 'Host Training Site')}</span>
              <span class="ojt-req-meta-pill">${icon('clock', 12)} ${isMorning ? 'Lunch Break' : 'End of Day'}</span>
            </div>
          </div>
        </div>
        <button type="button" class="ojt-req-close-btn" id="lo-close" aria-label="Close dialog">
          ${icon('x', 18)}
        </button>
      </div>

      <div class="ojt-req-body" style="padding:18px 20px;">
        <div style="padding:10px 14px;background:rgba(217,119,6,0.08);border:1px solid rgba(217,119,6,0.25);border-radius:10px;font-size:0.82rem;color:#b45309;line-height:1.45;display:flex;align-items:center;gap:8px;">
          ${icon('clock', 16)}
          <span>${infoText}</span>
        </div>

        <div class="ojt-req-form-group">
          <div class="ojt-req-label-row">
            <label class="ojt-req-label">
              Time Out (Live Server Clock) <span class="ojt-req-required-star">*</span>
            </label>
            <span style="font-size:0.68rem;font-weight:700;color:#b45309;background:rgba(245,158,11,0.14);padding:2px 8px;border-radius:99px;">Synced &bull; Locked</span>
          </div>
          <div id="lo-live-clock-card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-secondary);border:1.5px solid var(--border-default);border-radius:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#d97706;display:flex;align-items:center;">${icon('clock', 18)}</span>
              <span id="lo-live-clock-val" style="font-size:1.15rem;font-weight:800;font-variant-numeric:tabular-nums;color:var(--text-primary);">${formatDateClock12h(initialSynced)}</span>
            </div>
            <span style="font-size:0.72rem;color:var(--text-tertiary);font-weight:600;">Recorded automatically</span>
          </div>
          <p id="lo-time-warning" class="text-xs" style="margin-top:4px;display:none;color:#ef4444;font-weight:600;"></p>
        </div>

        <!-- Overtime Detection Panel -->
        <div id="lo-ot-panel" style="display:none;margin-top:10px;padding:12px;background:rgba(245,158,11,0.08);border:1.5px solid #f59e0b;border-radius:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <span style="font-size:0.82rem;font-weight:700;color:#b45309;display:flex;align-items:center;gap:6px;">
              ${icon('zap', 15)} Overtime Detected
            </span>
            <span id="lo-ot-badge" style="font-size:0.72rem;font-weight:700;background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:99px;border:1px solid #fde68a;">
              +0.0 hrs OT
            </span>
          </div>
          <p id="lo-ot-desc" style="font-size:0.75rem;color:#78350f;margin:0 0 8px;line-height:1.4;">
            Clocking out past regular shift end. Overtime hours will be submitted for company supervisor verification.
          </p>
          <div id="lo-ot-reason-group" class="ojt-req-form-group" style="margin-bottom:0;">
            <label for="lo-ot-reason" class="ojt-req-label" style="font-size:0.76rem;">
              Overtime Task / Justification <span class="ojt-req-required-star">*</span>
            </label>
            <textarea class="ojt-req-input" id="lo-ot-reason" rows="2" placeholder="Describe the duties or deliverables worked on during overtime..." style="font-size:0.78rem;resize:vertical;min-height:50px;"></textarea>
          </div>
        </div>

        <!-- Location Geofence Status Banner -->
        <div id="lo-geo-status" class="ojt-geo-status-banner ojt-geo-status-banner--detecting">
          <div class="ojt-geo-status-content">
            <div class="ojt-geo-status-icon">
              ${icon('mapPin', 16)}
            </div>
            <div class="ojt-geo-status-texts">
              <div class="ojt-geo-status-title" id="lo-geo-title">Detecting GPS Location…</div>
              <div class="ojt-geo-status-desc" id="lo-geo-desc">Verifying your coordinates against host site</div>
            </div>
          </div>
          <span id="lo-geo-badge" style="display:none;" class="ojt-geo-status-badge"></span>
        </div>

        <!-- Alert panel for GPS errors -->
        <div id="lo-geo-fail-panel" style="display:none;margin-top:10px;padding:12px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;">
          <p style="font-size:0.8rem;font-weight:700;color:#dc2626;margin:0 0 4px;display:flex;align-items:center;gap:6px;">
            ${icon('alertTriangle', 14)} GPS Location Required
          </p>
          <p style="font-size:0.74rem;color:#475569;line-height:1.45;margin:0 0 10px;">
            GPS location is mandatory to record attendance. Please allow location permissions in your browser or device settings, then click <strong>Retry Location</strong>.
          </p>
          <button class="btn btn--outline btn--sm" id="lo-retry" type="button" style="font-size:0.75rem;padding:5px 12px;display:inline-flex;align-items:center;gap:5px;">
            ${icon('refreshCcw', 13)} Retry Location
          </button>
        </div>

        <div id="lo-evidence-container"></div>

        <!-- Institutional Protocol Notice -->
        <div class="ojt-protocol-card" style="margin-top:4px;">
          <div class="ojt-protocol-header">
            ${icon('shieldCheck', 15)}
            <span>Geofence &amp; Escrow Governance</span>
          </div>
          <p class="ojt-protocol-body">
            Attendance within the 50m site perimeter is auto-verified. Out-of-range entries require photo proof and are held in escrow for host company approval.
          </p>
        </div>
      </div>

      <div class="ojt-req-footer">
        <button type="button" class="btn btn--outline" id="lo-cancel">Cancel</button>
        <button type="button" class="btn btn--primary" id="lo-submit" disabled style="background:#d97706;border-color:#d97706;gap:6px;">
          ${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);

  const geoBox    = bd.querySelector('#lo-geo-status');
  const geoTitle  = bd.querySelector('#lo-geo-title');
  const geoDesc   = bd.querySelector('#lo-geo-desc');
  const geoBadge  = bd.querySelector('#lo-geo-badge');
  const submitBtn = bd.querySelector('#lo-submit');
  const failPanel = bd.querySelector('#lo-geo-fail-panel');
  const retryBtn  = bd.querySelector('#lo-retry');
  const liveClockValEl = bd.querySelector('#lo-live-clock-val');
  const warningEl = bd.querySelector('#lo-time-warning');
  const evidenceContainer = bd.querySelector('#lo-evidence-container');

  const sched = ojtContext?.schedule || {};
  const allowOt = !!sched.allowOvertime;
  const maxOt = Math.min(4.0, Math.max(2.0, Number(sched.maxOvertimeHours) || 2.0));
  const shiftEnd24 = parseTimeTo24(sched.shiftEnd || '17:00') || '17:00';

  const otPanel = bd.querySelector('#lo-ot-panel');
  const otBadge = bd.querySelector('#lo-ot-badge');
  const otDesc = bd.querySelector('#lo-ot-desc');
  const otReasonGroup = bd.querySelector('#lo-ot-reason-group');
  const otReasonInput = bd.querySelector('#lo-ot-reason');

  function getCurrentOutHHMM() {
    return formatDateHHMM(getSyncedNow(ojtContext));
  }

  function checkOvertime() {
    if (isMorning) {
      if (otPanel) otPanel.style.display = 'none';
      return { isOt: false, hours: 0 };
    }
    const val = getCurrentOutHHMM();
    if (!val || !shiftEnd24) {
      if (otPanel) otPanel.style.display = 'none';
      return { isOt: false, hours: 0 };
    }
    const [outH, outM] = val.split(':').map(Number);
    const [endH, endM] = shiftEnd24.split(':').map(Number);
    const diffMins = (outH * 60 + outM) - (endH * 60 + endM);

    if (diffMins > 0) {
      const rawOt = diffMins / 60;
      if (allowOt) {
        const cappedOt = Math.min(rawOt, maxOt);
        if (otPanel) {
          otPanel.style.display = 'block';
          otBadge.textContent = `+${cappedOt.toFixed(1)} hrs OT (Max ${maxOt}h)`;
          otBadge.style.background = '#fef3c7';
          otBadge.style.color = '#b45309';
          otDesc.textContent = `You are clocking out past your regular shift end (${sched.shiftEnd || '5:00 PM'}). ${cappedOt < rawOt ? `Raw OT is ${rawOt.toFixed(1)}h, capped at policy max ${maxOt}h.` : `Detected ${cappedOt.toFixed(1)}h overtime.`} Overtime hours will be reviewed by your host company.`;
          if (otReasonGroup) otReasonGroup.style.display = 'block';
        }
        return { isOt: true, hours: cappedOt, rawHours: rawOt };
      } else {
        if (otPanel) {
          otPanel.style.display = 'block';
          otBadge.textContent = 'OT Not Permitted';
          otBadge.style.background = '#fee2e2';
          otBadge.style.color = '#dc2626';
          otDesc.textContent = `Your shift ended at ${sched.shiftEnd || '5:00 PM'}. Your company schedule does not permit overtime. Hours beyond shift end will not be credited.`;
          if (otReasonGroup) otReasonGroup.style.display = 'none';
        }
        return { isOt: false, hours: 0, unauthorized: true };
      }
    } else {
      if (otPanel) otPanel.style.display = 'none';
      return { isOt: false, hours: 0 };
    }
  }

  function updateGeoStatus(state, title, desc, badgeText, badgeType) {
    geoBox.className = `ojt-geo-status-banner ojt-geo-status-banner--${state}`;
    if (geoTitle) geoTitle.textContent = title;
    if (geoDesc) geoDesc.textContent = desc;
    if (geoBadge) {
      if (badgeText) {
        geoBadge.textContent = badgeText;
        geoBadge.className = `ojt-geo-status-badge ojt-geo-status-badge--${badgeType || 'valid'}`;
        geoBadge.style.display = 'inline-block';
      } else {
        geoBadge.style.display = 'none';
      }
    }
  }

  function checkTimeValidity(updateBtn = true) {
    const val = getCurrentOutHHMM();
    if (loggedIn24 && val && val < loggedIn24) {
      warningEl.textContent = `Time Out cannot be earlier than Time In (${loggedInAt}).`;
      warningEl.style.display = 'block';
      if (updateBtn) submitBtn.disabled = true;
      return false;
    } else {
      warningEl.style.display = 'none';
      checkOvertime();
      if (updateBtn) {
        if (geoResult && geoResult.lat != null && geoResult.lon != null) {
          if (isWithinGeofence) {
            submitBtn.disabled = false;
          } else if (evidenceData) {
            submitBtn.disabled = false;
          } else {
            submitBtn.disabled = true;
          }
        } else {
          submitBtn.disabled = true;
        }
      }
      return true;
    }
  }

  checkTimeValidity(false);
  const clockInterval = setInterval(() => {
    if (liveClockValEl) {
      liveClockValEl.textContent = formatDateClock12h(getSyncedNow(ojtContext));
    }
    checkTimeValidity(true);
  }, 1000);

  function attemptGeo() {
    geoResult = null;
    computedDistance = null;
    isWithinGeofence = false;
    evidenceData = null;
    if (evidenceController) {
      evidenceController.destroy();
      evidenceController = null;
    }
    if (evidenceContainer) evidenceContainer.innerHTML = '';
    submitBtn.disabled = true;
    failPanel.style.display = 'none';
    updateGeoStatus('detecting', 'Detecting GPS Location…', 'Verifying your coordinates against host site', null);

    const tempLabel = { textContent: '' };
    requestGeo(geoBox, tempLabel).then(result => {
      geoResult = result;
      if (result && result.lat != null && result.lon != null) {
        const compLat = ojtContext?.companyLat != null ? Number(ojtContext.companyLat) : null;
        const compLon = ojtContext?.companyLon != null ? Number(ojtContext.companyLon) : null;
        const maxRadius = ojtContext?.geofenceRadius || 50;
        const compName = ojtContext?.company || 'Host Training Site';

        if (compLat != null && compLon != null) {
          computedDistance = Math.round(haversineMeters(result.lat, result.lon, compLat, compLon));
          if (computedDistance <= maxRadius) {
            isWithinGeofence = true;
            updateGeoStatus(
              'inside',
              'Within OJT Site Radius',
              `${computedDistance}m from ${compName} (limit: ${maxRadius}m)`,
              'Verified Location',
              'valid'
            );
            failPanel.style.display = 'none';
            submitBtn.style.background = '#d97706';
            submitBtn.style.borderColor = '#d97706';
            submitBtn.innerHTML = `${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}`;
            submitBtn.title = '';
            checkTimeValidity(true);
          } else {
            isWithinGeofence = false;
            const distLabel = computedDistance >= 1000
              ? `${(computedDistance / 1000).toFixed(1)} km`
              : `${computedDistance} m`;

            updateGeoStatus(
              'outside',
              'Outside OJT Site Radius',
              `${distLabel} away from host premises (limit: ${maxRadius}m)`,
              'Escrow Review Required',
              'escrow'
            );
            failPanel.style.display = 'none';

            submitBtn.disabled = true;
            submitBtn.style.background = '#d97706';
            submitBtn.style.borderColor = '#d97706';
            submitBtn.innerHTML = `${icon('send', 16)} Submit for Review`;
            submitBtn.title = 'Please take a photo and provide a reason to submit.';

            evidenceController = setupOffSiteEvidence(evidenceContainer, ({ isReady, reason, photo }) => {
              if (isReady && checkTimeValidity(false)) {
                evidenceData = { out_of_range_reason: reason, proof_image: photo };
                submitBtn.disabled = false;
                submitBtn.title = '';
              } else {
                evidenceData = null;
                submitBtn.disabled = true;
                if (!isReady) {
                  submitBtn.title = 'Please take a photo and provide a reason to submit.';
                }
              }
            });
          }
        } else {
          isWithinGeofence = true;
          updateGeoStatus('inside', 'Coordinates Optional', 'Host has no geofence boundary configured', 'Active', 'valid');
          failPanel.style.display = 'none';
          checkTimeValidity(true);
        }
      } else {
        isWithinGeofence = false;
        failPanel.style.display = 'block';
        failPanel.querySelector('#lo-retry')?.addEventListener('click', attemptGeo);
        submitBtn.disabled = true;
      }
    });
  }

  retryBtn.addEventListener('click', attemptGeo);
  attemptGeo();

  const close = () => {
    clearInterval(clockInterval);
    if (evidenceController) evidenceController.destroy();
    bd.remove();
  };
  bd.querySelector('#lo-close').addEventListener('click', close);
  bd.querySelector('#lo-cancel').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  submitBtn.addEventListener('click', () => {
    const timeVal = getCurrentOutHHMM();
    if (!timeVal) return;
    if (loggedIn24 && timeVal < loggedIn24) {
      showToast(`Time Out cannot be earlier than Time In (${loggedInAt}).`, 'error');
      return;
    }
    if (!geoResult || geoResult.lat == null || geoResult.lon == null) {
      showToast('GPS location is required to log attendance.', 'error');
      return;
    }
    const maxRadius = ojtContext?.geofenceRadius || 50;
    if (computedDistance != null && computedDistance > maxRadius && !evidenceData) {
      showToast('Please take a live photo and provide an assignment reason.', 'warning');
      return;
    }
    const otInfo = checkOvertime();
    let otReason = null;
    if (otInfo.isOt && allowOt) {
      otReason = otReasonInput?.value?.trim() || '';
      if (!otReason) {
        showToast('Please provide an overtime task/reason before submitting.', 'warning');
        otReasonInput?.focus();
        return;
      }
    }
    close();
    onSuccess(timeVal, geoResult.lat, geoResult.lon, { ...(evidenceData || {}), overtime_reason: otReason });
  });
}


// ── Log Detail Modal (calendar day click) ─────────────────────────────────────
function showLogDetail(log) {
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  const st = log.status;
  const isPending = log.approvalStatus === 'pending_company';
  const isRej = log.approvalStatus === 'rejected';

  let sc = st === 'valid'
    ? { label: 'Valid',     color: 'var(--color-success)',                           bg: 'var(--color-success-bg)',                            ic: 'checkCircle'  }
    : st === 'not_valid'
    ? { label: 'Not Valid', color: 'var(--color-error,#ef4444)',                     bg: 'var(--color-error-bg,rgba(239,68,68,0.1))',           ic: 'alertTriangle' }
    : st === 'no_gps'
    ? { label: 'No GPS',    color: 'var(--text-tertiary)',                            bg: 'var(--bg-tertiary)',                                  ic: 'mapPin'       }
    : { label: 'GPS Saved', color: 'var(--color-warning)',                            bg: 'var(--color-warning-bg)',                             ic: 'clock'        };

  if (log.isTimeoutIneligible) {
    sc = { label: 'Unlogged Exit (Ineligible)', color: '#991b1b', bg: '#fee2e2', ic: 'alertTriangle' };
  } else if (isPending) {
    sc = { label: 'Pending Review', color: '#d97706', bg: 'rgba(217,119,6,0.12)', ic: 'alertTriangle' };
  } else if (isRej) {
    sc = { label: 'Rejected', color: 'var(--color-error,#ef4444)', bg: 'var(--color-error-bg,rgba(239,68,68,0.1))', ic: 'x' };
  }

  const mIn = log.morningIn || log.timeIn || '—';
  const mOut = log.morningOut || (log.autoMorningTimeout ? '12:00 (Auto)' : '—');
  const mHrs = log.morningHours != null ? `${log.morningHours}h` : '—';

  const aIn = log.afternoonIn || '—';
  const aOut = log.afternoonOut ? (log.afternoonOut + (log.autoAfternoonTimeout ? ' (Auto)' : '')) : (log.timeOut && !log.morningOut ? (log.timeOut + (log.autoAfternoonTimeout ? ' (Auto)' : '')) : '—');
  const aHrs = log.afternoonHours != null ? `${log.afternoonHours}h` : '—';
  
  let totalDisplay = (log.hours > 0 || log.timeOut || log.afternoonOut) ? `${log.hours}h` : '—';
  if (log.isTimeoutIneligible) {
    const otVal = Number(log.overtimeHours || 0);
    const regVal = Number((log.regularHours > 0 ? log.regularHours : (log.hours - otVal)) || 0);
    const credVal = Number(log.hoursCredited || 0);
    const credOt = log.overtimeStatus === 'approved' ? otVal : 0;
    const pendingReg = Math.max(0, regVal - Math.max(0, credVal - credOt));
    const otNote = otVal > 0
      ? (log.overtimeStatus === 'approved' ? ` · +${otVal.toFixed(1)}h OT Approved` : (log.overtimeStatus === 'rejected' ? ` · ${otVal.toFixed(1)}h OT Declined` : ` · +${otVal.toFixed(1)}h OT Pending`))
      : '';
    totalDisplay = `<span style="color:#dc2626;">${credVal.toFixed(1)}h (${pendingReg.toFixed(1)}h Ineligible Escrow${otNote})</span>`;
  } else if (isPending) {
    const otVal = Number(log.overtimeHours || 0);
    const regHrs = Number((log.regularHours > 0 ? log.regularHours : (log.hours - otVal)) || 0).toFixed(1);
    const credVal = Number(log.hoursCredited || 0);
    const otText = otVal > 0
      ? (log.overtimeStatus === 'rejected' ? ` · ${otVal.toFixed(1)}h OT Declined` : ` · +${otVal.toFixed(1)}h OT Pending`)
      : '';
    totalDisplay = `<span style="color:#d97706;">${regHrs}h (${credVal > 0 ? `${credVal.toFixed(1)}h AM Credited, ` : ''}Held in Escrow)${otText}</span>`;
  } else if (isRej) {
    const credVal = Number(log.hoursCredited || 0);
    totalDisplay = credVal > 0
      ? `<span style="color:#ef4444;">${credVal.toFixed(1)}h (AM Verified · PM Rejected)</span>`
      : `<span style="color:#ef4444;text-decoration:line-through;">${log.hours || 0}h (Rejected)</span>`;
  } else if (log.overtimeHours > 0) {
    const regHrs = Number((log.regularHours > 0 ? log.regularHours : (log.hours - log.overtimeHours)) || 0).toFixed(1);
    const otHrs = Number(log.overtimeHours).toFixed(1);
    if (log.overtimeStatus === 'approved') {
      totalDisplay = `${(Number(regHrs) + Number(otHrs)).toFixed(1)}h (${regHrs}h Reg + ${otHrs}h OT)`;
    } else if (log.overtimeStatus === 'rejected') {
      totalDisplay = `${regHrs}h (${otHrs}h OT Declined)`;
    } else {
      totalDisplay = `${regHrs}h (+${otHrs}h OT Escrow)`;
    }
  } else if (log.hoursCredited != null) {
    totalDisplay = `${log.hoursCredited}h`;
  }

  let ineligibleSection = '';
  if (log.isTimeoutIneligible) {
    ineligibleSection = `
      <div style="margin-top:12px;padding:10px 12px;background:#fee2e2;border:1px solid #fca5a5;border-radius:var(--radius-md);text-align:left;">
        <div style="display:flex;align-items:center;gap:6px;color:#991b1b;font-weight:700;font-size:0.78rem;margin-bottom:3px;">
          ${icon('alertTriangle', 14)} Unlogged Exit &middot; Hours Ineligible
        </div>
        <p style="font-size:0.75rem;color:#7f1d1d;margin:0;">
          ${esc(log.timeoutIneligibleReason || 'Timeout was not logged. Rendered hours are in escrow (0.0h credited) pending host company verification.')}
        </p>
      </div>
    `;
  }

  let overtimeSection = '';
  if (log.overtimeHours > 0) {
    overtimeSection = `
      <div style="margin-top:10px;padding:10px 12px;background:rgba(245,158,11,0.08);border:1px solid #fde68a;border-radius:var(--radius-md);text-align:left;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:0.76rem;font-weight:700;color:#b45309;display:flex;align-items:center;gap:4px;">
            ${icon('zap', 13)} Overtime (${Number(log.overtimeHours).toFixed(1)} hrs)
          </span>
          <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;background:${log.overtimeStatus === 'approved' ? '#dcfce7;color:#166534;' : (log.overtimeStatus === 'rejected' ? '#fee2e2;color:#991b1b;' : '#fef3c7;color:#b45309;')}">
            ${log.overtimeStatus === 'approved' ? 'Approved' : (log.overtimeStatus === 'rejected' ? 'Declined' : 'Pending Company Review')}
          </span>
        </div>
        ${log.overtimeReason ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:3px;"><b>OT Task / Reason:</b> ${esc(log.overtimeReason)}</div>` : ''}
        ${log.overtimeRejectionReason ? `<div style="font-size:0.75rem;color:#dc2626;"><b>Supervisor Note:</b> ${esc(log.overtimeRejectionReason)}</div>` : ''}
      </div>
    `;
  }

  let exemptionSection = '';
  if (log.hasGeofenceExemption) {
    const isApp = log.approvalStatus === 'approved';
    const stBadge = isPending
      ? `<span style="background:rgba(217,119,6,0.15);color:#d97706;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;">Awaiting Review</span>`
      : isRej
      ? `<span style="background:rgba(239,68,68,0.12);color:#ef4444;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;">Rejected</span>`
      : `<span style="background:var(--color-success-bg);color:var(--color-success);font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;">Approved by Supervisor</span>`;

    const imgHtml = log.proofImage
      ? `<div style="margin-top:8px;text-align:center;"><img src="${storageUrl(log.proofImage)}" alt="Attendance proof" style="max-width:100%;max-height:180px;border-radius:var(--radius-md);border:1px solid var(--border-light);object-fit:cover;" /></div>`
      : '';

    const rejHtml = isRej && log.rejectionReason
      ? `<div style="margin-top:6px;font-size:0.75rem;color:#ef4444;text-align:left;"><b>Supervisor Remark:</b> ${esc(log.rejectionReason)}</div>`
      : '';

    exemptionSection = `
      <div style="margin-top:14px;padding:12px;background:rgba(217,119,6,0.06);border:1px solid rgba(217,119,6,0.25);border-radius:var(--radius-md);text-align:left;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
          <span style="font-size:0.75rem;font-weight:700;color:#d97706;display:flex;align-items:center;gap:4px;">
            ${icon('camera', 13)} Off-Site Submission Proof
          </span>
          ${stBadge}
        </div>
        ${log.outOfRangeReason ? `<div style="font-size:0.76rem;color:var(--text-secondary);margin-bottom:4px;"><b>Assignment Reason:</b> ${esc(log.outOfRangeReason)}</div>` : ''}
        ${imgHtml}
        ${rejHtml}
      </div>
    `;
  }

  bd.innerHTML = `
    <div class="modal modal--visible" style="max-width:440px;text-align:center;">
      <div class="modal__body" style="padding:26px 22px;">
        <div style="width:48px;height:48px;border-radius:50%;background:${sc.bg};color:${sc.color};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
          ${icon(sc.ic, 22)}
        </div>
        <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">${log.dayLabel || log.date}</h3>
        <span style="background:${sc.bg};color:${sc.color};font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:99px;">${sc.label}</span>

        <!-- Sessions breakdown -->
        <div class="ojt-log-sessions-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;text-align:left;">
          <!-- Morning Session -->
          <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:10px 12px;border-left:3px solid var(--color-success);">
            <p style="font-size:0.72rem;font-weight:700;color:var(--color-success);text-transform:uppercase;margin-bottom:6px;">Morning Session</p>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;margin-bottom:3px;">
              <span class="text-tertiary">In:</span> <b>${mIn}</b>
            </div>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;margin-bottom:3px;">
              <span class="text-tertiary">Lunch Out:</span> <b>${mOut}</b>
            </div>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;border-top:1px dashed var(--border-light);padding-top:4px;margin-top:4px;">
              <span class="text-tertiary">Hours:</span> <b style="color:var(--color-primary);">${mHrs}</b>
            </div>
          </div>

          <!-- Afternoon Session -->
          <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:10px 12px;border-left:3px solid #f97316;">
            <p style="font-size:0.72rem;font-weight:700;color:#f97316;text-transform:uppercase;margin-bottom:6px;">Afternoon Session</p>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;margin-bottom:3px;">
              <span class="text-tertiary">In:</span> <b>${aIn}</b>
            </div>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;margin-bottom:3px;">
              <span class="text-tertiary">Day Out:</span> <b>${aOut}</b>
            </div>
            <div style="font-size:0.76rem;display:flex;justify-content:space-between;border-top:1px dashed var(--border-light);padding-top:4px;margin-top:4px;">
              <span class="text-tertiary">Hours:</span> <b style="color:var(--color-primary);">${aHrs}</b>
            </div>
          </div>
        </div>

        <div style="margin-top:12px;padding:8px 12px;background:rgba(0,89,48,0.06);border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);">Total Rendered:</span>
          <span style="font-size:0.95rem;font-weight:800;color:var(--color-primary);">${totalDisplay}</span>
        </div>

        ${ineligibleSection}
        ${overtimeSection}
        ${exemptionSection}

        <button class="btn btn--outline" style="margin-top:16px;width:100%;" id="log-detail-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(bd);
  bd.querySelector('#log-detail-close').addEventListener('click', () => bd.remove());
  bd.addEventListener('click', e => { if (e.target === bd) bd.remove(); });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const iconName = type === 'error' ? 'alertCircle' : type === 'warning' ? 'alertTriangle' : 'checkCircle';
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `${icon(iconName, 16)} <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
