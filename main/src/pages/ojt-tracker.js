/**
 * CHMSU HireMe — OJT Tracker Page
 * Calendar attendance view + Daily time log (time in / time out).
 * No tasks column — logs only show date, time in, time out, hours, status.
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost } from '../api/client.js';

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
              <span class="ojt-stepper__step-status">${requiredHours} Hours</span>
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
              <span class="ojt-field__val">${requiredHours} Hours</span>
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
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
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
                  <p>Upon arriving on-site, open this page and tap <strong>Log In</strong> to verify your attendance within 100 meters of the company premises.</p>
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
}

// ── Entry point ───────────────────────────────────────────────────────────────
export async function renderOJTTracker(container) {
  container.innerHTML = `
    <div style="padding:12px 0;">
      <div class="skeleton skeleton--text" style="width:220px; height:28px; margin-bottom:8px;"></div>
      <div class="skeleton skeleton--text" style="width:340px;"></div>
    </div>
    <div style="display:grid; grid-template-columns:200px 1fr; gap:16px; margin-bottom:16px; flex-wrap:wrap;">
      <div class="skeleton skeleton--card" style="height:200px;"></div>
      <div class="skeleton skeleton--card" style="height:200px;"></div>
    </div>
    <div class="skeleton skeleton--card" style="height:340px; margin-bottom:16px;"></div>
    <div class="skeleton skeleton--card" style="height:220px;"></div>
  `;

  const [res, evalRes] = await Promise.all([
    apiGet('/student/ojt-tracker').catch(() => null),
    apiGet('/student/evaluation').catch(() => null),
  ]);
  const evaluation = evalRes?.data || null;

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


  const ojt  = { ...res.deployment, ...res.progress };
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

// ── Main render ───────────────────────────────────────────────────────────────
function renderTrackerPage(container, ojt, logs, year, month, onMonthChange, evaluation = null) {
  // Use raw float so the ring always reflects real progress (Math.round kills <0.5%)
  const hoursRendered = parseFloat(ojt.hoursRendered) || 0;
  const totalHours    = parseFloat(ojt.totalHours)    || 0;
  const pctRaw        = totalHours > 0 ? (hoursRendered / totalHours) * 100 : 0;
  // Display: 1 decimal for <10%, whole number for ≥10%
  const pctDisplay    = pctRaw === 0 ? '0' : pctRaw < 10 ? pctRaw.toFixed(1) : Math.round(pctRaw).toString();
  const circumference = 2 * Math.PI * 54;
  const dashOffset    = circumference - (pctRaw / 100) * circumference;
  const ringColor     = pctRaw >= 80 ? 'var(--color-success)' : pctRaw >= 40 ? 'var(--color-accent)' : 'var(--color-warning)';

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

  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const schedDays = Array.isArray(sched.days) && sched.days.length ? sched.days.join(', ') : '';
  const shiftText = sched.shiftStart && sched.shiftEnd ? `${sched.shiftStart} – ${sched.shiftEnd}` : '';
  const lunchText = sched.hasLunchBreak !== false && sched.lunchStart && sched.lunchEnd ? `Lunch: ${sched.lunchStart}–${sched.lunchEnd}` : '';

  let punchClockHtml = '';
  if (!isWorkDay) {
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
          ${icon('alertCircle', 15)} Shift Ended (${sched.shiftEnd || '5:00 PM'}) &middot; Time-in Closed for Today
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
    punchClockHtml = `
      <div style="display:flex;align-items:center;gap:8px;background:var(--color-success-bg);color:var(--color-success);padding:8px 16px;border-radius:99px;font-size:0.84rem;font-weight:600;">
        ${icon('checkCircle', 16)} Today's attendance complete (${totalTodayHours} hrs)
      </div>
    `;
  }

  container.innerHTML = `
    <!-- ── Page Header ── -->
    <section class="page-section animate-fade-in-up">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:4px;">
        <div>
          <h1 style="font-size:var(--text-2xl); font-weight:700; display:flex; align-items:center; gap:10px;">
            ${icon('clock', 26)} OJT Time Tracker
          </h1>
          <p class="text-secondary" style="margin-top:4px;">Log your daily attendance (Morning &amp; Afternoon sessions) and monitor your OJT hours progress.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          ${shiftText ? `
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.2);padding:6px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;">
              ${icon('calendar', 13)}
              <span>${esc(schedDays || 'Mon–Fri')} &middot; ${esc(shiftText)}${lunchText ? ' · ' + esc(lunchText) : ''}</span>
            </div>` : ''}
          ${punchClockHtml}
        </div>
      </div>
    </section>

    <!-- ── Completed Evaluation Card (if submitted by company) ── -->
    ${evaluation && evaluation.overall_score ? `
    <section class="page-section animate-fade-in-up" style="animation-delay:40ms;">
      <div class="jp-card" style="background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(16,185,129,0.08) 100%);border:1.5px solid rgba(0,89,48,0.25);border-radius:var(--radius-lg);padding:20px 24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#005930;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">
              ★
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
    ` : ''}

    <!-- ── Hours Progress + OJT Info ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:60ms;">
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">

        <!-- Circular progress ring -->
        <div class="jp-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:190px;padding:24px 20px;text-align:center;">
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
        </div>

        <!-- OJT deployment details -->
        <div class="jp-card" style="flex:1;min-width:240px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
            <p class="text-xs text-tertiary" style="font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0;">Active OJT Deployment</p>
            <button class="btn btn--outline btn--sm" id="tracker-btn-coord-chat" style="padding:4px 10px;font-size:0.75rem;gap:5px;color:var(--color-primary);border-color:rgba(0,89,48,0.25);display:inline-flex;align-items:center;">
              ${icon('messageCircle', 13)} Message Coordinator
            </button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Company</p>
              <p class="text-sm" style="font-weight:600;">${ojt.company}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Supervisor</p>
              <p class="text-sm" style="font-weight:600;">${ojt.supervisor}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">Start Date</p>
              <p class="text-sm" style="font-weight:600;">${ojt.startDate}</p>
            </div>
            <div>
              <p class="text-xs text-tertiary" style="margin-bottom:3px;">${sched.estimatedEndDate ? 'Target End Date' : 'End Date'}</p>
              <p class="text-sm" style="font-weight:600;">${sched.estimatedEndDate || ojt.endDate}</p>
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
          </div>

          <!-- Hours progress bar -->
          <div style="padding-top:14px;border-top:1px solid var(--border-light);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
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

    <!-- ── Map 45% · Calendar 45% · 10% gap ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:80ms;">
      <div style="display:flex;gap:10%;align-items:stretch;">

        <!-- Map card — 45% -->
        <div class="jp-card" style="flex:0 0 45%;padding:0;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);flex-shrink:0;">
            <h3 style="font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:6px;">${icon('mapPin', 14)} Company Location</h3>
            <a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(ojt.location || '')}" target="_blank" rel="noopener noreferrer" style="font-size:0.68rem;color:var(--color-primary);font-weight:600;text-decoration:none;display:flex;align-items:center;gap:3px;">Open Maps ${icon('arrowRight', 10)}</a>
          </div>
          <div id="ojt-map" style="flex:1;min-height:300px;background:var(--bg-secondary);"></div>
          <div style="padding:8px 14px;display:flex;align-items:center;gap:12px;border-top:1px solid var(--border-light);background:var(--bg-secondary);flex-shrink:0;flex-wrap:wrap;">
            <span style="display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;"></span>Company</span>
            <span style="display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:50%;border:1.5px dashed #005930;background:rgba(34,197,94,0.2);display:inline-block;flex-shrink:0;"></span>100m Geofence</span>
            <div style="display:flex;align-items:center;gap:4px;margin-left:auto;">
              <button id="map-filter-all" class="btn btn--outline btn--sm active" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;background:rgba(0,89,48,0.1);color:#005930;border-color:#005930;">All Pins</button>
              <button id="map-filter-in" class="btn btn--outline btn--sm" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#22c55e;"></span>Log In</button>
              <button id="map-filter-out" class="btn btn--outline btn--sm" style="height:22px;padding:0 8px;font-size:0.65rem;border-radius:99px;font-weight:600;display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#f97316;"></span>Log Out</button>
            </div>
          </div>
        </div>

        <!-- Calendar card — 45% -->
        <div class="jp-card" style="flex:0 0 45%;padding:14px;display:flex;flex-direction:column;">
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

    <!-- ── Time Log Records ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:120ms;">
      <div class="jp-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
          <div>
            <h3 style="font-size:0.95rem;font-weight:700;display:flex;align-items:center;gap:8px;margin:0;">${icon('fileText', 18)} Time Log Records</h3>
            <p style="margin:2px 0 0;font-size:0.75rem;color:var(--text-tertiary);">Click any log row to inspect its check-in and check-out locations on the map above.</p>
          </div>
          <span class="text-xs text-tertiary" id="time-logs-counter">${logs.length} entries</span>
        </div>

        ${logs.length === 0
          ? `<div style="text-align:center;padding:36px 0;color:var(--text-tertiary);">
               ${icon('clock', 32)}
               <p style="margin-top:12px;font-weight:600;">No logs yet</p>
               <p class="text-sm">Log today's attendance to get started.</p>
              </div>`
           : `<div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="border-bottom:2px solid var(--border-light);">
                      <th style="text-align:left;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Date</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Time In (Morning)</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Time Out (Morning)</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Time In (Afternoon)</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Time Out (Afternoon)</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Hrs</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Status</th>
                      <th style="text-align:center;padding:8px 10px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);white-space:nowrap;">Location Validity</th>
                    </tr>
                  </thead>
                  <tbody id="time-logs-tbody">
                    <!-- Populated by pagination script -->
                  </tbody>
                </table>
              </div>
              <div id="time-logs-pagination" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border-light);">
                <div class="text-xs text-secondary" id="pagination-info">Showing entries</div>
                <div style="display:flex;align-items:center;gap:6px;" id="pagination-controls"></div>
              </div>`
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
      ojt.hoursRendered = logs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
      ojt.daysCompleted = new Set(logs.map(l => l.date)).size;
      showToast(toastMsg || 'Attendance recorded.');
      renderTrackerPage(container, ojt, logs, year, month, onMonthChange);
    }
  }

  // ── Morning Time In ────────────────────────────────────────────────────────
  const btnMorningIn = container.querySelector('#btn-morning-in');
  if (btnMorningIn) {
    btnMorningIn.addEventListener('click', () => {
      showLogInModal('Time In (Morning)', async (timeIn24, lat, lon) => {
        const body = { time_in: timeIn24, session: 'morning' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          if (res.tooFar) showLocationWarning(res.distance);
          refreshAfterLog(res.log, lat, lon, res.message || 'Time In (Morning) recorded!');
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
      showLogOutModal(todayLog, 'Time Out (Morning)', async (timeOut24, lat, lon) => {
        const body = { time_out: timeOut24, session: 'morning' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time Out (Morning) recorded. Enjoy your break!');
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
      showLogInModal('Time In (Afternoon)', async (timeIn24, lat, lon) => {
        const body = { time_in: timeIn24, session: 'afternoon' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          if (res.tooFar) showLocationWarning(res.distance);
          refreshAfterLog(res.log, lat, lon, res.message || 'Time In (Afternoon) recorded!');
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
      showLogOutModal(todayLog, 'Time Out (Afternoon)', async (timeOut24, lat, lon) => {
        const body = { time_out: timeOut24, session: 'afternoon' };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time Out (Afternoon) recorded. Great work today!');
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
      showLogInModal('Time In', async (timeIn24, lat, lon) => {
        const body = { time_in: timeIn24 };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-in', body);
        if (res && res.log) {
          if (res.tooFar) showLocationWarning(res.distance);
          refreshAfterLog(res.log, lat, lon, res.message || 'Time-in recorded!');
        } else {
          showToast(res?.message || 'Failed to log in.', 'error');
        }
      });
    });
  }

  const fallbackLogOut = container.querySelector('#btn-log-out');
  if (fallbackLogOut) {
    fallbackLogOut.addEventListener('click', () => {
      showLogOutModal(todayLog, 'Time Out', async (timeOut24, lat, lon) => {
        const body = { time_out: timeOut24 };
        if (lat != null) { body.latitude = lat; body.longitude = lon; }
        const res = await apiPost('/student/ojt-tracker/log-out', body);
        if (res && res.log) {
          refreshAfterLog(res.log, lat, lon, res.message || 'Time-out recorded!');
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

  // ── Time Logs Pagination & Interactive Row Clicks ────────────────────────
  let currentLogsPage = 1;
  const logsPageSize = 10;
  const totalLogsPages = Math.ceil(logs.length / logsPageSize) || 1;

  function updateLogsPage(page) {
    currentLogsPage = Math.max(1, Math.min(page, totalLogsPages));
    const tbody = container.querySelector('#time-logs-tbody');
    const infoEl = container.querySelector('#pagination-info');
    const ctrlEl = container.querySelector('#pagination-controls');
    if (!tbody) return;

    const start = (currentLogsPage - 1) * logsPageSize;
    const end = Math.min(start + logsPageSize, logs.length);
    const slice = logs.slice(start, end);

    tbody.innerHTML = slice.map(l => renderTrackerLogRow(l)).join('');

    if (infoEl) {
      infoEl.textContent = logs.length > 0
        ? `Showing ${start + 1}–${end} of ${logs.length} entries`
        : '0 entries';
    }

    if (ctrlEl) {
      if (totalLogsPages <= 1) {
        ctrlEl.innerHTML = '';
      } else {
        let btns = '';
        btns += `
          <button class="btn btn--outline btn--sm" id="logs-prev-btn" style="height:26px;padding:0 8px;font-size:0.72rem;display:flex;align-items:center;gap:3px;" ${currentLogsPage === 1 ? 'disabled' : ''}>
            ${icon('chevronLeft', 11)} Prev
          </button>
        `;

        const getPageNumbers = () => {
          if (totalLogsPages <= 7) return Array.from({ length: totalLogsPages }, (_, i) => i + 1);
          if (currentLogsPage <= 4) return [1, 2, 3, 4, 5, '...', totalLogsPages];
          if (currentLogsPage >= totalLogsPages - 3) return [1, '...', totalLogsPages - 4, totalLogsPages - 3, totalLogsPages - 2, totalLogsPages - 1, totalLogsPages];
          return [1, '...', currentLogsPage - 1, currentLogsPage, currentLogsPage + 1, '...', totalLogsPages];
        };

        getPageNumbers().forEach(p => {
          if (p === '...') {
            btns += `<span style="padding:0 3px;font-size:0.75rem;color:var(--text-tertiary);">&hellip;</span>`;
          } else {
            const isAct = p === currentLogsPage;
            btns += `
              <button class="btn ${isAct ? 'btn--primary' : 'btn--outline'} btn--sm logs-page-num" data-page="${p}" style="height:26px;width:26px;padding:0;font-size:0.72rem;font-weight:${isAct ? '700' : '500'};">
                ${p}
              </button>
            `;
          }
        });

        btns += `
          <button class="btn btn--outline btn--sm" id="logs-next-btn" style="height:26px;padding:0 8px;font-size:0.72rem;display:flex;align-items:center;gap:3px;" ${currentLogsPage === totalLogsPages ? 'disabled' : ''}>
            Next ${icon('chevronRight', 11)}
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
    tbody.querySelectorAll('.log-table-row').forEach(row => {
      row.addEventListener('click', () => {
        tbody.querySelectorAll('.log-table-row').forEach(r => r.style.background = '');
        row.style.background = 'rgba(0, 89, 48, 0.08)';
        const logId = parseInt(row.dataset.logId);
        window.focusMapLog?.(logId);
      });
    });
  }

  updateLogsPage(1);

  // ── Initialize Leaflet map ──────────────────────────────────────────────
  initLeafletMap(container, ojt, logs);
}

// ── Helper to render a single table row for a log entry ───────────────────────
function renderTrackerLogRow(log) {
  const st = log.status;
  const sc = st === 'valid'
    ? { label: 'Valid',     color: 'var(--color-success)',                           bg: 'var(--color-success-bg)' }
    : st === 'not_valid'
    ? { label: 'Not Valid', color: 'var(--color-error,#ef4444)',                     bg: 'var(--color-error-bg,rgba(239,68,68,0.1))' }
    : st === 'no_gps'
    ? { label: 'No GPS',    color: 'var(--text-tertiary)',                            bg: 'var(--bg-tertiary)' }
    : st === 'gps_only'
    ? { label: 'GPS Saved', color: 'var(--color-warning)',                            bg: 'var(--color-warning-bg)' }
    : { label: 'Pending',   color: 'var(--color-warning)',                            bg: 'var(--color-warning-bg)' };

  const lv = log.locationValidity;
  const dist = log.distanceMeters != null ? Number(log.distanceMeters) : null;
  const inLat = log.inLat ?? log.latitude;
  const inLon = log.inLon ?? log.longitude;
  const hasCoords = inLat != null && inLon != null;
  const coordsHint = hasCoords ? `<div style="font-size:0.6rem;color:var(--text-tertiary);margin-top:3px;">${Number(inLat).toFixed(5)}, ${Number(inLon).toFixed(5)}</div>` : '';

  // Geofence Rule:
  // <= 100 meters is within site ("In Site" / Valid)
  // > 100 meters is outside site ("Too Far" / Not Valid)
  let isInSite = false;
  let isTooFar = false;

  if (dist !== null) {
    isInSite = dist <= 100;
    isTooFar = dist > 100;
  } else if (lv === 'In Site' || lv === 'valid' || log.status === 'valid') {
    isInSite = true;
  } else if (lv === 'Too Far' || log.status === 'not_valid') {
    isTooFar = true;
  }

  let lvHtml = '';
  if (isInSite) {
    const distHint = dist !== null ? ` (${dist}m)` : '';
    lvHtml = `<div><span style="background:var(--color-success-bg);color:var(--color-success);font-size:0.63rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;">${icon('checkCircle', 10)} In Site${distHint}</span>${coordsHint}</div>`;
  } else if (isTooFar) {
    const distHint = dist !== null ? ` (${dist}m)` : '';
    lvHtml = `<div><span style="background:var(--color-error-bg,rgba(239,68,68,0.1));color:var(--color-error,#ef4444);font-size:0.63rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;">${icon('alertTriangle', 10)} Too Far${distHint}</span>${coordsHint}</div>`;
  } else if (hasCoords) {
    lvHtml = `<div><span style="background:rgba(255,149,0,.1);color:#FF9500;font-size:0.63rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;">${icon('mapPin', 10)} GPS saved</span>${coordsHint}</div>`;
  } else {
    lvHtml = `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(107,114,148,0.1);color:var(--text-tertiary);font-size:0.63rem;font-weight:600;padding:2px 8px;border-radius:99px;white-space:nowrap;">${icon('mapPin', 10)} No location</span>`;
  }

  const mIn = log.morningIn || log.timeIn || '—';
  const mOut = log.morningOut
    ? `${log.morningOut}${log.autoMorningTimeout ? '<div style="font-size:0.6rem;color:#d97706;font-weight:600;">Auto 12:00</div>' : ''}`
    : (log.afternoonIn ? '<span style="color:#d97706;font-size:0.68rem;font-weight:600;">Auto 12:00</span>' : '—');
  const aIn = log.afternoonIn || '—';
  const aOut = log.afternoonOut
    ? log.afternoonOut
    : (log.afternoonIn ? '<span style="color:var(--color-warning);font-size:0.7rem;font-weight:600;">In Progress</span>' : (log.timeOut && !log.morningOut ? log.timeOut : '—'));

  return `
    <tr class="log-table-row" data-log-id="${log.id}" style="border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 0.15s ease;">
      <td style="padding:9px 10px;font-size:0.78rem;font-weight:500;white-space:nowrap;">${log.dayLabel || log.date}</td>
      <td style="padding:9px 10px;font-size:0.78rem;text-align:center;color:var(--color-success);font-weight:600;">${mIn}</td>
      <td style="padding:9px 10px;font-size:0.78rem;text-align:center;color:#d97706;font-weight:600;">${mOut}</td>
      <td style="padding:9px 10px;font-size:0.78rem;text-align:center;color:var(--color-success);font-weight:600;">${aIn}</td>
      <td style="padding:9px 10px;font-size:0.78rem;text-align:center;color:var(--color-error);font-weight:600;">${aOut}</td>
      <td style="padding:9px 10px;font-size:0.83rem;font-weight:700;text-align:center;">${(log.hours > 0 || log.timeOut || log.afternoonOut) ? log.hours + 'h' : '—'}</td>
      <td style="padding:9px 10px;text-align:center;">
        <span style="background:${sc.bg};color:${sc.color};font-size:0.63rem;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;">${sc.label}</span>
      </td>
      <td style="padding:9px 10px;text-align:center;">${lvHtml}</td>
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
    // Default center: Bacolod City
    const defaultLat = 10.6840;
    const defaultLon = 122.9563;

    // Center on the most recent logged location (prefer log-in, fall back to log-out or company)
    const geoLogs = logs.filter(l => (l.inLat != null && l.inLon != null) || (l.outLat != null && l.outLon != null));
    const firstLog = geoLogs[0];
    const centerLat = firstLog?.inLat != null ? Number(firstLog.inLat) : (ojt.companyLat != null ? Number(ojt.companyLat) : defaultLat);
    const centerLon = firstLog?.inLon != null ? Number(firstLog.inLon) : (ojt.companyLon != null ? Number(ojt.companyLon) : defaultLon);

    const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: true }).setView([centerLat, centerLon], 15);

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

    // ── Red Pin + 100m Geofence Circle: Company Location ────────────────────
    function placeCompanyPin(compLat, compLon) {
      allPoints.push([compLat, compLon]);

      // 100-meter Circular Geofence Boundary
      L.circle([compLat, compLon], {
        radius: 100,
        color: '#005930',
        fillColor: '#22c55e',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 6',
      }).addTo(map).bindPopup(`
        <div style="font-size:0.8rem;min-width:150px;">
          <strong style="color:#005930;">100m Geofence Perimeter</strong><br>
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

      if (!map.hasLayer(inLayer)) map.addLayer(inLayer);
      if (!map.hasLayer(outLayer)) map.addLayer(outLayer);
      if (!map.hasLayer(linesLayer)) map.addLayer(linesLayer);
      updateFilterActive(btnAll);

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
    };

    setTimeout(() => map.invalidateSize(), 200);
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

    if (log) {
      const dotColor = log.status === 'valid'     ? 'var(--color-success)'
                     : log.status === 'not_valid' ? 'var(--color-error,#ef4444)'
                     : 'var(--text-tertiary)';
      dotHtml    = `<span style="display:block;width:4px;height:4px;border-radius:50%;background:${dotColor};margin:1px auto 0;"></span>`;
      extraAttr  = `data-log-date="${dateStr}" class="cal-day--has-log"`;
    } else if (isPast && !isWeekend) {
      dotHtml = `<span style="display:block;width:4px;height:4px;border-radius:50%;background:var(--color-error);margin:1px auto 0;"></span>`;
    }

    const tooltipParts = log
      ? `${log.timeIn} – ${log.timeOut} · ${log.hours}h (${log.status})`
      : isWeekend ? 'Weekend' : '';

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

// ── Log In Modal ──────────────────────────────────────────────────────────────
function showLogInModal(sessionLabelOrSuccess, onSuccessMaybe) {
  const sessionLabel = typeof sessionLabelOrSuccess === 'string' ? sessionLabelOrSuccess : 'Log In';
  const onSuccess = typeof sessionLabelOrSuccess === 'function' ? sessionLabelOrSuccess : onSuccessMaybe;
  let geoResult = null;

  const isAfternoon = sessionLabel.toLowerCase().includes('afternoon');
  const nowHM = currentTimeHHMM();
  const defaultTime = isAfternoon && nowHM < '13:00' ? '13:00' : nowHM;

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  bd.innerHTML = `
    <div class="modal modal--visible" style="max-width:420px;">
      <div class="modal__header">
        <h3 class="modal__title" style="display:flex;align-items:center;gap:8px;">${icon('logIn', 20)} ${esc(sessionLabel)}</h3>
        <button class="modal__close" id="li-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body">
        <div class="form-group">
          <label class="form-label">Time In *</label>
          <input type="time" class="form-input" id="li-time" value="${defaultTime}" ${isAfternoon ? 'min="13:00"' : ''} required />
          ${isAfternoon ? `<p class="text-xs" style="margin-top:5px;color:#d97706;font-weight:600;display:flex;align-items:center;gap:4px;">${icon('clock', 12)} Afternoon session begins at 1:00 PM (Lunch break ends at 1:00 PM)</p>` : ''}
        </div>
        <div id="li-geo-status" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-secondary);border:1px solid transparent;border-radius:var(--radius-md);margin-top:4px;">
          ${icon('mapPin', 14)}
          <span class="text-xs" id="li-geo-label">Detecting your location…</span>
        </div>
        <!-- shown only when geo fails -->
        <div id="li-geo-fail-panel" style="display:none;margin-top:10px;padding:12px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md);">
          <p style="font-size:0.78rem;font-weight:600;color:#ef4444;margin-bottom:6px;display:flex;align-items:center;gap:6px;">${icon('alertTriangle',13)} GPS Location Required</p>
          <p style="font-size:0.72rem;color:var(--text-secondary);line-height:1.55;margin-bottom:10px;">GPS location is mandatory to record attendance. Please enable location permissions in your browser or device settings, then click <strong>Retry Location</strong>.</p>
          <button class="btn btn--outline" id="li-retry" style="font-size:0.76rem;padding:5px 14px;display:inline-flex;align-items:center;gap:6px;">${icon('refreshCcw',13)} Retry Location</button>
        </div>
        <p class="text-xs text-secondary" style="display:flex;align-items:flex-start;gap:6px;margin-top:10px;padding:10px 12px;background:var(--color-info-bg);border:1px solid var(--color-info);border-radius:var(--radius-md);line-height:1.5;">
          ${icon('mapPin', 13)} GPS location is required to verify your attendance against the OJT work site geofence.
        </p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="li-cancel">Cancel</button>
        <button class="btn btn--primary" id="li-submit" disabled>${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);

  const geoBox    = bd.querySelector('#li-geo-status');
  const geoLabel  = bd.querySelector('#li-geo-label');
  const submitBtn = bd.querySelector('#li-submit');
  const failPanel = bd.querySelector('#li-geo-fail-panel');
  const retryBtn  = bd.querySelector('#li-retry');

  function attemptGeo() {
    geoResult = null;
    submitBtn.disabled = true;
    failPanel.style.display = 'none';
    geoBox.style.background = 'var(--bg-secondary)';
    geoBox.style.border = '1px solid transparent';
    geoLabel.innerHTML = 'Detecting your location…';

    requestGeo(geoBox, geoLabel).then(result => {
      geoResult = result;
      if (result && result.lat != null && result.lon != null) {
        failPanel.style.display = 'none';
        submitBtn.disabled = false;
      } else {
        failPanel.style.display = 'block';
        submitBtn.disabled = true;
      }
    });
  }

  retryBtn.addEventListener('click', attemptGeo);

  attemptGeo();

  const close = () => bd.remove();
  bd.querySelector('#li-close').addEventListener('click', close);
  bd.querySelector('#li-cancel').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  submitBtn.addEventListener('click', () => {
    const timeVal = bd.querySelector('#li-time').value;
    if (!timeVal) return;
    if (isAfternoon && timeVal < '13:00') {
      showToast('Cannot time in before 1:00 PM because it is lunch break.', 'warning');
      return;
    }
    if (!geoResult || geoResult.lat == null || geoResult.lon == null) {
      showToast('GPS location is required to log attendance.', 'error');
      return;
    }
    close();
    onSuccess(timeVal, geoResult.lat, geoResult.lon);
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
function showLogOutModal(todayLog, sessionLabelOrSuccess, onSuccessMaybe) {
  const sessionLabel = typeof sessionLabelOrSuccess === 'string' ? sessionLabelOrSuccess : 'Log Out';
  const onSuccess = typeof sessionLabelOrSuccess === 'function' ? sessionLabelOrSuccess : onSuccessMaybe;
  let geoResult = null;

  const isMorning = sessionLabel.toLowerCase().includes('lunch') || sessionLabel.toLowerCase().includes('morning');
  const loggedInAt = isMorning ? (todayLog?.morningIn || todayLog?.timeIn || '—') : (todayLog?.afternoonIn || todayLog?.timeIn || '—');
  const loggedIn24 = parseTimeTo24(loggedInAt);
  const nowHM = currentTimeHHMM();

  // Smart default value:
  // If current device time is earlier than time in (e.g. testing during off-hours, or same minute):
  // Default to regular shift end (e.g. '17:00' for afternoon, '12:00' for morning) so user does not get an invalid time.
  let defaultTimeOut = nowHM;
  if (loggedIn24 && nowHM < loggedIn24) {
    if (isMorning) {
      defaultTimeOut = loggedIn24 > '12:00' ? loggedIn24 : '12:00';
    } else {
      defaultTimeOut = loggedIn24 > '17:00' ? loggedIn24 : '17:00';
    }
  }

  const infoText = isMorning
    ? `Morning session started at <strong>${loggedInAt}</strong>. Taking lunch break?`
    : `Afternoon session started at <strong>${loggedInAt}</strong>. Ending shift for today?`;

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  bd.innerHTML = `
    <div class="modal modal--visible" style="max-width:420px;">
      <div class="modal__header">
        <h3 class="modal__title" style="display:flex;align-items:center;gap:8px;color:#d97706;">${icon('logOut', 20)} ${esc(sessionLabel)}</h3>
        <button class="modal__close" id="lo-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body">
        <div style="padding:10px 14px;background:rgba(217,119,6,0.08);border-radius:var(--radius-md);margin-bottom:12px;font-size:0.83rem;color:#d97706;font-weight:600;">
          ${icon('clock', 14)} ${infoText}
        </div>
        <div class="form-group">
          <label class="form-label">Time Out *</label>
          <input type="time" class="form-input" id="lo-time" value="${defaultTimeOut}" ${loggedIn24 ? `min="${loggedIn24}"` : ''} required />
          <p id="lo-time-warning" class="text-xs" style="margin-top:5px;display:none;color:#ef4444;font-weight:600;"></p>
        </div>
        <div id="lo-geo-status" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-secondary);border:1px solid transparent;border-radius:var(--radius-md);margin-top:4px;">
          ${icon('mapPin', 14)}
          <span class="text-xs" id="lo-geo-label">Detecting your location…</span>
        </div>
        <!-- shown only when geo fails -->
        <div id="lo-geo-fail-panel" style="display:none;margin-top:10px;padding:12px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md);">
          <p style="font-size:0.78rem;font-weight:600;color:#ef4444;margin-bottom:6px;display:flex;align-items:center;gap:6px;">${icon('alertTriangle',13)} GPS Location Required</p>
          <p style="font-size:0.72rem;color:var(--text-secondary);line-height:1.55;margin-bottom:10px;">GPS location is mandatory to record attendance. Please allow location permissions in your browser or device settings, then click <strong>Retry Location</strong>.</p>
          <button class="btn btn--outline" id="lo-retry" style="font-size:0.76rem;padding:5px 14px;display:inline-flex;align-items:center;gap:6px;">${icon('refreshCcw',13)} Retry Location</button>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="lo-cancel">Cancel</button>
        <button class="btn btn--primary" id="lo-submit" disabled style="background:#d97706;border-color:#d97706;">${icon('checkCircle', 16)} Confirm ${esc(sessionLabel)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);

  const geoBox    = bd.querySelector('#lo-geo-status');
  const geoLabel  = bd.querySelector('#lo-geo-label');
  const submitBtn = bd.querySelector('#lo-submit');
  const failPanel = bd.querySelector('#lo-geo-fail-panel');
  const retryBtn  = bd.querySelector('#lo-retry');
  const timeInput = bd.querySelector('#lo-time');
  const warningEl = bd.querySelector('#lo-time-warning');

  function checkTimeValidity() {
    const val = timeInput.value;
    if (loggedIn24 && val && val < loggedIn24) {
      warningEl.textContent = `Time Out cannot be earlier than Time In (${loggedInAt}).`;
      warningEl.style.display = 'block';
      submitBtn.disabled = true;
      return false;
    } else {
      warningEl.style.display = 'none';
      if (geoResult && geoResult.lat != null && geoResult.lon != null) {
        submitBtn.disabled = false;
      }
      return true;
    }
  }

  timeInput.addEventListener('input', checkTimeValidity);
  timeInput.addEventListener('change', checkTimeValidity);

  function attemptGeo() {
    geoResult = null;
    submitBtn.disabled = true;
    failPanel.style.display = 'none';
    geoBox.style.background = 'var(--bg-secondary)';
    geoBox.style.border = '1px solid transparent';
    geoLabel.innerHTML = 'Detecting your location…';

    requestGeo(geoBox, geoLabel).then(result => {
      geoResult = result;
      if (result && result.lat != null && result.lon != null) {
        failPanel.style.display = 'none';
        checkTimeValidity();
      } else {
        failPanel.style.display = 'block';
        submitBtn.disabled = true;
      }
    });
  }

  retryBtn.addEventListener('click', attemptGeo);

  attemptGeo();

  const close = () => bd.remove();
  bd.querySelector('#lo-close').addEventListener('click', close);
  bd.querySelector('#lo-cancel').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  submitBtn.addEventListener('click', () => {
    const timeVal = bd.querySelector('#lo-time').value;
    if (!timeVal) return;
    if (loggedIn24 && timeVal < loggedIn24) {
      showToast(`Time Out cannot be earlier than Time In (${loggedInAt}).`, 'error');
      return;
    }
    if (!geoResult || geoResult.lat == null || geoResult.lon == null) {
      showToast('GPS location is required to log attendance.', 'error');
      return;
    }
    close();
    onSuccess(timeVal, geoResult.lat, geoResult.lon);
  });
}

// ── Location Warning Popup ────────────────────────────────────────────────────
function showLocationWarning(distanceMeters) {
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  bd.innerHTML = `
    <div class="modal modal--visible" style="max-width:380px;text-align:center;">
      <div class="modal__body" style="padding:32px 24px;">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(239,68,68,0.12);color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
          ${icon('alertTriangle', 28)}
        </div>
        <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:8px;color:#ef4444;">Location Are Too Far</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.5;margin-bottom:20px;">
          You are <strong>${distanceMeters != null ? distanceMeters + ' m' : 'too far'}</strong> away from the OJT site.<br>
          Your log-in was recorded but marked as <strong>Too Far</strong>.
        </p>
        <button class="btn btn--primary" id="lw-ok">OK, Understood</button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);
  const close = () => bd.remove();
  bd.querySelector('#lw-ok').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });
}



// ── Log Detail Modal (calendar day click) ─────────────────────────────────────
function showLogDetail(log) {
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  const st = log.status;
  const sc = st === 'valid'
    ? { label: 'Valid',     color: 'var(--color-success)',                           bg: 'var(--color-success-bg)',                            ic: 'checkCircle'  }
    : st === 'not_valid'
    ? { label: 'Not Valid', color: 'var(--color-error,#ef4444)',                     bg: 'var(--color-error-bg,rgba(239,68,68,0.1))',           ic: 'alertTriangle' }
    : st === 'no_gps'
    ? { label: 'No GPS',    color: 'var(--text-tertiary)',                            bg: 'var(--bg-tertiary)',                                  ic: 'mapPin'       }
    : { label: 'GPS Saved', color: 'var(--color-warning)',                            bg: 'var(--color-warning-bg)',                             ic: 'clock'        };

  const mIn = log.morningIn || log.timeIn || '—';
  const mOut = log.morningOut || (log.autoMorningTimeout ? '12:00 (Auto)' : '—');
  const mHrs = log.morningHours != null ? `${log.morningHours}h` : '—';

  const aIn = log.afternoonIn || '—';
  const aOut = log.afternoonOut || (log.timeOut && !log.morningOut ? log.timeOut : '—');
  const aHrs = log.afternoonHours != null ? `${log.afternoonHours}h` : '—';
  const totalHrs = (log.hours > 0 || log.timeOut || log.afternoonOut) ? `${log.hours}h` : '—';

  bd.innerHTML = `
    <div class="modal modal--visible" style="max-width:440px;text-align:center;">
      <div class="modal__body" style="padding:26px 22px;">
        <div style="width:48px;height:48px;border-radius:50%;background:${sc.bg};color:${sc.color};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
          ${icon(sc.ic, 22)}
        </div>
        <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">${log.dayLabel || log.date}</h3>
        <span style="background:${sc.bg};color:${sc.color};font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:99px;">${sc.label}</span>

        <!-- Sessions breakdown -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;text-align:left;">
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
          <span style="font-size:0.95rem;font-weight:800;color:var(--color-primary);">${totalHrs}</span>
        </div>

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
