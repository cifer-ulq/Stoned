/**
 * CHMSU HireMe — Unified Interview Hub (Job & OJT Interviews)
 * Layout: Hero → Stat Cards → 2-col (Calendar | Filterable Interviews) → Today Timeline
 */
import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';

/* ── Platform config ── */
const platformCfg = {
  'Google Meet':     { color: '#1EA362', bg: 'rgba(30,163,98,0.08)',  gradient: 'linear-gradient(135deg,#1EA362,#34D399)', label: 'Google Meet' },
  'Zoom':            { color: '#2D8CFF', bg: 'rgba(45,140,255,0.08)', gradient: 'linear-gradient(135deg,#2D8CFF,#60A5FA)', label: 'Zoom' },
  'Microsoft Teams': { color: '#5B5FC7', bg: 'rgba(91,95,199,0.08)',  gradient: 'linear-gradient(135deg,#5B5FC7,#818CF8)', label: 'Teams' },
  'On-site / In-person': { color: '#005930', bg: 'rgba(0,89,48,0.08)', gradient: 'linear-gradient(135deg,#005930,#10B981)', label: 'On-site / In-person' },
};

function getPlatform(name) {
  return platformCfg[name] || {
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-bg)',
    gradient: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-light))',
    label: name || 'Meeting'
  };
}

/* ── Parse date strings as LOCAL dates (no UTC shift) ── */
function localDateFromStr(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split(/[-\\/]/);
  if (parts.length === 3) return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  return null;
}

function isoFromStr(dateStr) {
  const d = localDateFromStr(dateStr);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateLabel(dateStr) {
  const d = localDateFromStr(dateStr);
  if (!d) return dateStr || 'TBD';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Derive effective status from date vs today ── */
const TODAY = new Date();

function effectiveStatus(iv) {
  if (iv.status === 'cancelled') return 'cancelled';
  if (iv.status === 'done' || iv.status === 'completed') return 'done';
  const ivDate = localDateFromStr(iv.date);
  if (!ivDate) return iv.status || 'upcoming';
  const todayMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  if (ivDate < todayMidnight) return 'done';
  return 'upcoming';
}

/* ── Status badge ── */
function statusBadge(status) {
  const map = {
    upcoming:  { label: 'Upcoming',  color: 'var(--color-primary)',  bg: 'var(--color-primary-bg)',  iconName: 'clock' },
    done:      { label: 'Finished',  color: 'var(--color-success)',  bg: 'var(--color-success-bg)', iconName: 'checkCircle' },
    completed: { label: 'Finished',  color: 'var(--color-success)',  bg: 'var(--color-success-bg)', iconName: 'checkCircle' },
    past:      { label: 'Finished',  color: 'var(--color-success)',  bg: 'var(--color-success-bg)', iconName: 'checkCircle' },
    cancelled: { label: 'Cancelled', color: 'var(--color-error)',    bg: 'var(--color-error-bg)',   iconName: 'x' },
  };
  const s = map[status] || map.upcoming;
  return `<span class="iv-badge" style="background:${s.bg};color:${s.color};">${icon(s.iconName, 11)} ${s.label}</span>`;
}

/* ── Calendar helpers ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildCalendar(year, month, ivDates) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ type: 'empty' });
  for (let d = 1; d <= days; d++) {
    const iso     = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = new Date(year, month, d).toDateString() === TODAY.toDateString();
    const count   = ivDates.filter(x => x.iso === iso).length;
    cells.push({ day: d, iso, isToday, count });
  }
  return cells;
}

/* ── Countdown helper ── */
function countdown(dateStr) {
  const d = localDateFromStr(dateStr);
  if (!d) return { text: '—', urgent: false, past: false };
  const todayMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const diff = Math.round((d - todayMidnight) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { text: `${Math.abs(diff)}d ago`, urgent: false, past: true };
  if (diff === 0) return { text: 'Today',    urgent: true,  past: false };
  if (diff === 1) return { text: 'Tomorrow', urgent: true,  past: false };
  return { text: `${diff} days`, urgent: diff <= 3, past: false };
}

/* ── Modal popup for full interview details ── */
function showInterviewDetailModal(iv) {
  const status = effectiveStatus(iv);
  const isPast = status === 'done' || status === 'completed' || status === 'cancelled';
  const cd = countdown(iv.date);
  const formattedDate = formatDateLabel(iv.date);
  const p = getPlatform(iv.platform);

  // Remove existing modal if open
  const existing = document.getElementById('iv-detail-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'iv-detail-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width: 580px;" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div>
          <div class="iv-card__badge-row" style="margin-bottom: 6px;">
            <span class="iv-cat-badge iv-cat-badge--${iv.category}">
              ${icon(iv.isOjt ? 'graduationCap' : 'briefcase', 11)} ${iv.categoryLabel}
            </span>
            ${statusBadge(status)}
          </div>
          <h2 class="modal-title" style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${iv.title}</h2>
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${iv.company}</span>
        </div>
        <button class="modal-close" id="iv-modal-close" aria-label="Close modal">${icon('x', 18)}</button>
      </div>

      <div class="modal-body" style="gap: 16px;">
        <!-- Schedule stats 3-column -->
        <div class="iv-modal__grid">
          <div class="iv-modal__stat">
            <span class="iv-modal__stat-label">${icon('calendar', 12)} Date</span>
            <span class="iv-modal__stat-val">${formattedDate}</span>
          </div>
          <div class="iv-modal__stat">
            <span class="iv-modal__stat-label">${icon('clock', 12)} Time</span>
            <span class="iv-modal__stat-val">${iv.time || 'TBD'} · ${iv.duration}</span>
          </div>
          <div class="iv-modal__stat">
            <span class="iv-modal__stat-label">${icon(iv.isF2F ? 'mapPin' : 'video', 12)} Format</span>
            <span class="iv-modal__stat-val" style="color: ${iv.isF2F ? 'var(--color-primary)' : p.color};">${iv.type}</span>
          </div>
        </div>

        <!-- Location / Meeting Access Card -->
        <div class="iv-modal__block">
          <span class="iv-modal__block-hdr">
            ${icon(iv.isF2F ? 'mapPin' : 'externalLink', 14)}
            ${iv.isF2F ? 'Interview Venue / Location' : 'Meeting Platform & Access Link'}
          </span>

          ${iv.isF2F ? `
            <div class="iv-modal__loc-row">
              <div class="iv-modal__loc-addr">
                <strong>Physical Address:</strong><br>
                ${iv.location || 'Company Office / Campus'}
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn--ghost btn--sm" id="iv-modal-copy-loc" data-loc="${iv.location}">
                  ${icon('share', 13)} Copy Address
                </button>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(iv.location)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">
                  ${icon('mapPin', 13)} Open in Maps
                </a>
              </div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin: 0; margin-top: 4px;">
              Please arrive 10-15 minutes before your scheduled appointment. Bring any required documents and a valid ID.
            </p>
          ` : `
            <div class="iv-modal__loc-row">
              <div class="iv-modal__loc-addr">
                <span class="iv-card__meeting-badge" style="background:${p.bg};color:${p.color};margin-bottom:6px;">
                  ${icon('video', 12)} ${p.label}
                </span>
                <div style="font-size: 0.8rem; word-break: break-all; color: var(--color-primary);">
                  ${iv.meetingLink !== '#' ? iv.meetingLink : 'Link will be provided by interviewer'}
                </div>
              </div>
              ${!isPast && iv.meetingLink !== '#' ? `
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn--ghost btn--sm" id="iv-modal-copy-link" data-link="${iv.meetingLink}">
                    ${icon('share', 13)} Copy Link
                  </button>
                  <a href="${iv.meetingLink}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">
                    ${icon('externalLink', 13)} Join Room
                  </a>
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- Interviewer details -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 10px 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-default); font-size: 0.82rem;">
          <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
            ${icon('user', 14)} Interviewer / Contact:
          </span>
          <strong style="color: var(--text-primary);">${iv.interviewerName || iv.company}</strong>
        </div>

        <!-- Notes / Instructions -->
        ${iv.notes ? `
          <div class="iv-modal__notes">
            <strong style="display: block; margin-bottom: 4px; color: var(--text-primary); font-size: 0.82rem;">
              ${icon('fileText', 14)} Instructions from ${iv.company}:
            </strong>
            <p style="margin: 0; white-space: pre-wrap;">${iv.notes}</p>
          </div>
        ` : `
          <div class="iv-modal__notes" style="border-left-color: var(--border-strong);">
            <strong style="display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 0.82rem;">
              ${icon('fileText', 14)} Preparation Guidelines:
            </strong>
            <p style="margin: 0; font-size: 0.8rem;">No special instructions noted. Ensure you have your updated resume and portfolio ready.</p>
          </div>
        `}
      </div>

      <div class="modal-footer">
        <button class="btn btn--ghost btn--sm" id="iv-modal-close-btn">Close</button>
        ${!isPast && !iv.isF2F && iv.meetingLink !== '#' ? `
          <a href="${iv.meetingLink}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">
            ${icon('externalLink', 14)} Launch Meeting Room
          </a>
        ` : ''}
        ${iv.isF2F && iv.location ? `
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(iv.location)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">
            ${icon('mapPin', 14)} Open Map Navigation
          </a>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    const box = overlay.querySelector('.modal-box');
    if (box) box.classList.add('modal-box--visible');
  });

  // Close handlers
  const closeModal = () => {
    overlay.remove();
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = (e) => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', onEsc);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector('#iv-modal-close')?.addEventListener('click', closeModal);
  overlay.querySelector('#iv-modal-close-btn')?.addEventListener('click', closeModal);

  // Copy handlers inside modal
  overlay.querySelector('#iv-modal-copy-loc')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    navigator.clipboard.writeText(btn.dataset.loc || '').then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `${icon('checkCircle', 13)} Copied!`;
      setTimeout(() => btn.innerHTML = orig, 1800);
    });
  });

  overlay.querySelector('#iv-modal-copy-link')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    navigator.clipboard.writeText(btn.dataset.link || '').then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `${icon('checkCircle', 13)} Copied!`;
      setTimeout(() => btn.innerHTML = orig, 1800);
    });
  });
}

/* ── Interview card builder ── */
function interviewCard(iv, idx) {
  const p      = getPlatform(iv.platform);
  const cd     = countdown(iv.date);
  const status = effectiveStatus(iv);
  const isPast = status === 'done' || status === 'completed' || status === 'cancelled';
  const cardGradient = iv.isOjt
    ? 'linear-gradient(135deg, #005930, #10B981)'
    : (p.gradient || 'linear-gradient(135deg, #1e40af, #3b82f6)');

  return `
    <article class="iv-card ${isPast ? 'iv-card--past' : ''}" style="--d:${idx * 70}ms" data-id="${iv.id}" data-category="${iv.category}">
      <!-- accent strip -->
      <div class="iv-card__strip" style="background:${isPast ? 'var(--bg-tertiary)' : cardGradient}"></div>
      <div class="iv-card__inner">
        <!-- row 1: avatar + category badge + company + status -->
        <div class="iv-card__head">
          <div class="iv-card__avatar" style="background:${isPast ? 'var(--bg-tertiary)' : cardGradient}">${iv.companyInitial}</div>
          <div class="iv-card__head-info">
            <div class="iv-card__badge-row">
              <span class="iv-cat-badge iv-cat-badge--${iv.category}">
                ${icon(iv.isOjt ? 'graduationCap' : 'briefcase', 11)} ${iv.categoryLabel}
              </span>
              ${statusBadge(status)}
            </div>
            <h3 class="iv-card__title" style="margin-top: 4px;">${iv.title}</h3>
            <span class="iv-card__company">${iv.company}</span>
          </div>
        </div>

        <!-- meta chips row -->
        <div class="iv-card__meta">
          <span class="iv-card__chip">${icon('calendar', 13)} ${iv.date}</span>
          <span class="iv-card__chip">${icon('clock', 13)} ${iv.time} · ${iv.duration}</span>
          <span class="iv-card__chip">${icon('user', 13)} ${iv.interviewerName}</span>
          <span class="iv-card__chip iv-card__chip--countdown ${cd.urgent ? 'iv-card__chip--urgent' : ''} ${cd.past ? 'iv-card__chip--past' : ''}">
            ${icon(cd.past ? 'checkCircle' : 'zap', 13)} ${cd.text}
          </span>
        </div>

        <!-- meeting link or physical location block -->
        ${iv.isF2F ? `
          <div class="iv-card__meeting iv-card__meeting--f2f">
            <div class="iv-card__meeting-badge" style="background:rgba(0,89,48,0.08);color:#005930;">
              ${icon('mapPin', 13)} On-site / In-person
            </div>
            <div class="iv-card__meeting-link">
              <span class="iv-card__loc-text" title="${iv.location}">
                ${icon('mapPin', 12)} ${iv.location || 'Company Office / Campus'}
              </span>
            </div>
          </div>
        ` : `
          <div class="iv-card__meeting">
            <div class="iv-card__meeting-badge" style="background:${p.bg};color:${p.color};">
              ${icon('video', 13)} ${p.label}
            </div>
            <div class="iv-card__meeting-link">
              <span class="iv-card__link ${isPast ? 'iv-card__link--muted' : ''}">${iv.meetingLink}</span>
            </div>
          </div>
        `}

        <!-- actions row -->
        <div class="iv-card__actions">
          ${iv.isF2F
            ? `<button class="btn btn--primary btn--sm iv-card__btn-view" data-id="${iv.id}" style="flex: 1.2;">
                 ${icon('eye', 14)} View Location & Details
               </button>`
            : (isPast
                ? `<span class="btn btn--ghost btn--sm iv-card__join iv-card__join--disabled" title="This interview has already passed">
                     ${icon('checkCircle', 14)} Interview Ended
                   </span>`
                : `<a href="${iv.meetingLink}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm iv-card__join">
                     ${icon('externalLink', 14)} Join Meeting
                   </a>`
              )
          }

          ${!iv.isF2F ? `
            <button class="btn btn--ghost btn--sm iv-card__btn-view" data-id="${iv.id}" title="View Details">
              ${icon('eye', 14)} Details
            </button>
          ` : ''}

          ${iv.isF2F
            ? `<button class="btn btn--ghost btn--sm iv-card__copy-loc" data-loc="${iv.location}" title="Copy Address">
                 ${icon('share', 14)} Copy Address
               </button>`
            : (!isPast && iv.meetingLink !== '#'
                ? `<button class="btn btn--ghost btn--sm iv-card__copy" data-link="${iv.meetingLink}" title="Copy Link">
                     ${icon('share', 14)} Copy Link
                   </button>`
                : ''
              )
          }
        </div>
      </div>
    </article>`;
}

/* ── Schedule row for today's timeline ── */
function schedRow(item, idx) {
  return `
    <div class="iv-tl ${item.current ? 'iv-tl--active' : ''}" style="--d:${idx * 60}ms">
      <span class="iv-tl__time">${item.time}</span>
      <div class="iv-tl__rail">
        <span class="iv-tl__dot ${item.current ? 'iv-tl__dot--pulse' : ''}"></span>
        <span class="iv-tl__line"></span>
      </div>
      <div class="iv-tl__body">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="iv-cat-badge iv-cat-badge--${item.category}" style="padding: 1px 6px; font-size: 0.6rem;">
            ${item.categoryLabel}
          </span>
          <span class="iv-tl__title">${item.title}</span>
        </div>
        <span class="iv-tl__sub">${item.detail}</span>
      </div>
      ${item.current ? `<span class="iv-tl__now">NOW</span>` : ''}
    </div>`;
}

/* ══════════════════ MAIN RENDER ══════════════════ */
export async function renderInterview(container) {
  container.innerHTML = `
    <div class="page-enter">

      <!-- ═══ Hero ═══ -->
      <section class="iv-hero">
        <div class="iv-hero__bg">
          <div class="iv-hero__orb iv-hero__orb--1"></div>
          <div class="iv-hero__orb iv-hero__orb--2"></div>
          <div class="iv-hero__orb iv-hero__orb--3"></div>
        </div>
        <div class="iv-hero__content">
          <span class="iv-hero__eyebrow animate-fade-in-up">${icon('calendar', 16)} Student Interview Hub</span>
          <h1 class="iv-hero__title animate-fade-in-up" style="animation-delay:50ms">
            Manage All Your<br>Interviews
          </h1>
          <p class="iv-hero__subtitle animate-fade-in-up" style="animation-delay:100ms">
            Track schedules for both OJT Internships and Job Openings, view locations, join meetings, and prepare with confidence.
          </p>
        </div>
      </section>

      <!-- ═══ Stat Row ═══ -->
      <div class="iv-stats animate-fade-in-up" style="animation-delay:140ms">
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-primary-bg);color:var(--color-primary)">${icon('calendar', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-upcoming">0</span>
            <span class="iv-stat__label">Upcoming</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:rgba(0,89,48,0.08);color:#005930">${icon('graduationCap', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-ojt">0</span>
            <span class="iv-stat__label">OJT Slots</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:rgba(37,99,235,0.08);color:#2563eb">${icon('briefcase', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-job">0</span>
            <span class="iv-stat__label">Job Openings</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-success-bg);color:var(--color-success)">${icon('zap', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-today">0</span>
            <span class="iv-stat__label">Today</span>
          </div>
        </div>
      </div>

      <!-- ═══ Content Grid: Calendar + Cards ═══ -->
      <div class="iv-grid">

        <!-- LEFT: Calendar -->
        <aside class="iv-cal animate-fade-in-up" style="animation-delay:200ms">
          <div class="iv-cal__head">
            <button class="iv-cal__nav" id="iv-cal-prev" aria-label="Previous month">${icon('chevronDown', 16)}</button>
            <h2 class="iv-cal__month" id="iv-cal-label"></h2>
            <button class="iv-cal__nav" id="iv-cal-next" aria-label="Next month">${icon('chevronDown', 16)}</button>
          </div>
          <div class="iv-cal__grid" id="iv-cal-grid"></div>
          <div class="iv-cal__legend">
            <span class="iv-cal__legend-item"><span class="iv-cal__dot iv-cal__dot--today"></span> Today</span>
            <span class="iv-cal__legend-item"><span class="iv-cal__dot iv-cal__dot--iv"></span> Interview</span>
          </div>

          <!-- Mini next-up card inside calendar panel -->
          <div class="iv-cal__next" id="iv-cal-next-up"></div>
        </aside>

        <!-- RIGHT: Interview Cards -->
        <section class="iv-list">
          <div class="iv-list__head">
            <h2 class="iv-section-title">${icon('briefcase', 20)} Scheduled Interviews</h2>
            <span class="iv-list__count" id="iv-list-count">0 interviews</span>
          </div>

          <!-- Filter Pills -->
          <div class="iv-filter-bar" id="iv-filter-bar">
            <button class="iv-filter-btn iv-filter-btn--active" data-filter="all">
              All Interviews <span class="iv-filter-count" id="flt-count-all">0</span>
            </button>
            <button class="iv-filter-btn" data-filter="ojt">
              ${icon('graduationCap', 12)} OJT Internships <span class="iv-filter-count" id="flt-count-ojt">0</span>
            </button>
            <button class="iv-filter-btn" data-filter="job">
              ${icon('briefcase', 12)} Job Openings <span class="iv-filter-count" id="flt-count-job">0</span>
            </button>
            <button class="iv-filter-btn" data-filter="upcoming">
              Upcoming <span class="iv-filter-count" id="flt-count-upcoming">0</span>
            </button>
            <button class="iv-filter-btn" data-filter="past">
              Completed / Past <span class="iv-filter-count" id="flt-count-past">0</span>
            </button>
          </div>

          <div class="iv-list__cards" id="iv-cards">
            <div class="iv-skel"></div>
            <div class="iv-skel"></div>
          </div>

          <div class="iv-list__empty" id="iv-empty" style="display:none">
            <div class="iv-list__empty-icon">${icon('calendar', 48)}</div>
            <h3 id="iv-empty-title">No interviews scheduled</h3>
            <p id="iv-empty-desc">When you have upcoming interviews, they'll appear here</p>
          </div>
        </section>
      </div>

      <!-- ═══ Today's Timeline ═══ -->
      <section class="iv-timeline animate-fade-in-up" style="animation-delay:300ms">
        <div class="iv-timeline__head">
          <h2 class="iv-section-title">${icon('clock', 20)} Today's Schedule</h2>
        </div>
        <div class="iv-timeline__body" id="iv-timeline">
          <div class="iv-skel iv-skel--sm"></div>
          <div class="iv-skel iv-skel--sm"></div>
        </div>
      </section>

    </div>
  `;

  /* ── Fetch data ── */
  let interviews = [];
  try {
    const res = await apiGet('/student/interviews');
    const raw = res?.data ?? [];
    interviews = raw.map(iv => {
      const compName = iv.company_name ?? 'Company';
      const category = iv.category ?? (String(iv.id || '').startsWith('ojt_') ? 'ojt' : 'job');
      const isOjt = category === 'ojt';
      const categoryLabel = iv.category_label ?? (isOjt ? 'OJT Internship' : 'Job Opening');
      const isF2F = iv.interview_type === 'face_to_face' ||
                    iv.platform === 'On-site / In-person' ||
                    iv.type === 'Face-to-Face Interview';

      return {
        id:              iv.id,
        rawId:           iv.raw_id ?? iv.id,
        category,
        categoryLabel,
        isOjt,
        isF2F,
        title:           iv.job_title || (isOjt ? 'OJT Internship Slot' : 'Job Position'),
        company:         compName,
        companyInitial:  iv.company_initial || compName[0]?.toUpperCase() || '?',
        platform:        iv.platform || (isF2F ? 'On-site / In-person' : 'Online Meeting'),
        interviewType:   iv.interview_type || (isF2F ? 'face_to_face' : 'online'),
        type:            iv.type || (isF2F ? 'Face-to-Face Interview' : 'Online Interview'),
        date:            iv.scheduled_date || '',
        time:            iv.scheduled_time || '',
        duration:        iv.duration || '45 mins',
        status:          iv.status || 'upcoming',
        interviewerName: iv.interviewer_name || compName,
        meetingLink:     iv.meeting_link || '#',
        location:        iv.location || (isF2F ? 'Company Office' : 'Online Link'),
        notes:           iv.notes || '',
      };
    });
  } catch {
    interviews = [];
  }

  // Build today's schedule from interviews that match today's ISO date
  const todayIso = `${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`;
  const schedule = interviews
    .filter(iv => iv.date === todayIso)
    .map(iv => ({
      time:          iv.time,
      title:         iv.title,
      category:      iv.category,
      categoryLabel: iv.categoryLabel,
      detail:        `${iv.company} · ${iv.isF2F ? (iv.location || 'On-site') : iv.platform}`,
      current:       false,
    }));

  /* ── Animate stat counters ── */
  function animNum(id, target, dur = 600) {
    const el = container.querySelector('#' + id);
    if (!el) return;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  const todayMidnight   = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const upcomingCount   = interviews.filter(iv => effectiveStatus(iv) === 'upcoming').length;
  const ojtCount        = interviews.filter(iv => iv.category === 'ojt').length;
  const jobCount        = interviews.filter(iv => iv.category === 'job').length;
  const pastCount       = interviews.filter(iv => {
    const s = effectiveStatus(iv);
    return s === 'done' || s === 'completed' || s === 'cancelled';
  }).length;
  const todayCount      = interviews.filter(iv => {
    const d = localDateFromStr(iv.date);
    return d && d.getTime() === todayMidnight.getTime();
  }).length;

  animNum('iv-ct-upcoming', upcomingCount, 500);
  animNum('iv-ct-ojt',      ojtCount,      400);
  animNum('iv-ct-job',      jobCount,      400);
  animNum('iv-ct-today',    todayCount,    350);

  // Update filter pill counts
  const setElText = (id, txt) => {
    const el = container.querySelector('#' + id);
    if (el) el.textContent = txt;
  };
  setElText('flt-count-all', interviews.length);
  setElText('flt-count-ojt', ojtCount);
  setElText('flt-count-job', jobCount);
  setElText('flt-count-upcoming', upcomingCount);
  setElText('flt-count-past', pastCount);

  /* ── Calendar state & render ── */
  let cYear = TODAY.getFullYear(), cMonth = TODAY.getMonth();
  const ivDates = interviews.map(iv => ({ ...iv, iso: isoFromStr(iv.date) }));

  // If no interviews in current month, center calendar on earliest interview if available
  if (ivDates.length > 0) {
    const hasThisMonth = ivDates.some(x => {
      const d = localDateFromStr(x.date);
      return d && d.getFullYear() === cYear && d.getMonth() === cMonth;
    });
    if (!hasThisMonth) {
      const firstIvDate = localDateFromStr(ivDates[0].date);
      if (firstIvDate) {
        cYear = firstIvDate.getFullYear();
        cMonth = firstIvDate.getMonth();
      }
    }
  }

  function drawCal() {
    container.querySelector('#iv-cal-label').textContent = `${MONTHS[cMonth]} ${cYear}`;
    const grid = container.querySelector('#iv-cal-grid');
    const cells = buildCalendar(cYear, cMonth, ivDates);

    grid.innerHTML =
      DAYS.map(d => `<span class="iv-cal__cell iv-cal__cell--hdr">${d}</span>`).join('') +
      cells.map(c => {
        if (c.type === 'empty') return `<span class="iv-cal__cell iv-cal__cell--empty"></span>`;
        const cls = [
          'iv-cal__cell',
          c.isToday ? 'iv-cal__cell--today' : '',
          c.count   ? 'iv-cal__cell--iv'    : '',
        ].filter(Boolean).join(' ');
        return `<span class="${cls}" ${c.count ? `data-date="${c.iso}"` : ''}>${c.day}${c.count ? '<i class="iv-cal__pip"></i>' : ''}</span>`;
      }).join('');

    grid.querySelectorAll('.iv-cal__cell--iv').forEach(el => {
      el.addEventListener('click', () => {
        const card = container.querySelector(`.iv-card[data-date="${el.dataset.date}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('iv-card--flash');
          setTimeout(() => card.classList.remove('iv-card--flash'), 1600);
        }
      });
    });
  }

  container.querySelector('#iv-cal-prev').addEventListener('click', () => {
    cMonth--;
    if (cMonth < 0) { cMonth = 11; cYear--; }
    drawCal();
  });
  container.querySelector('#iv-cal-next').addEventListener('click', () => {
    cMonth++;
    if (cMonth > 11) { cMonth = 0; cYear++; }
    drawCal();
  });
  drawCal();

  /* ── Next-up mini card inside calendar panel ── */
  const nextUp = container.querySelector('#iv-cal-next-up');
  const nextUpcoming = interviews.find(iv => effectiveStatus(iv) === 'upcoming');
  if (nextUpcoming) {
    const n  = nextUpcoming;
    const cd = countdown(n.date);
    const grad = n.isOjt ? 'linear-gradient(135deg, #005930, #10B981)' : 'linear-gradient(135deg, #1e40af, #3b82f6)';
    nextUp.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="iv-cal__next-label">Next Interview</span>
        <span class="iv-cat-badge iv-cat-badge--${n.category}" style="padding: 1px 7px; font-size: 0.6rem;">${n.categoryLabel}</span>
      </div>
      <div class="iv-cal__next-row">
        <div class="iv-cal__next-avatar" style="background:${grad}">${n.companyInitial}</div>
        <div class="iv-cal__next-info">
          <strong>${n.title}</strong>
          <span>${n.company} · ${n.date} ${n.time}</span>
        </div>
        <span class="iv-cal__next-cd ${cd.urgent ? 'iv-cal__next-cd--urgent' : ''}">${cd.text}</span>
      </div>`;
    nextUp.style.cursor = 'pointer';
    nextUp.addEventListener('click', () => showInterviewDetailModal(n));
  } else {
    nextUp.style.display = 'none';
  }

  /* ── Filter & Render Cards ── */
  let currentFilter = 'all';
  const cardsEl = container.querySelector('#iv-cards');
  const emptyEl = container.querySelector('#iv-empty');

  function renderCards() {
    let filtered = interviews;
    if (currentFilter === 'ojt') {
      filtered = interviews.filter(iv => iv.category === 'ojt');
    } else if (currentFilter === 'job') {
      filtered = interviews.filter(iv => iv.category === 'job');
    } else if (currentFilter === 'upcoming') {
      filtered = interviews.filter(iv => effectiveStatus(iv) === 'upcoming');
    } else if (currentFilter === 'past') {
      filtered = interviews.filter(iv => {
        const s = effectiveStatus(iv);
        return s === 'done' || s === 'completed' || s === 'cancelled';
      });
    }

    container.querySelector('#iv-list-count').textContent =
      `${filtered.length} interview${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      cardsEl.style.display = 'none';
      emptyEl.style.display = '';
      const emptyTitle = container.querySelector('#iv-empty-title');
      const emptyDesc  = container.querySelector('#iv-empty-desc');
      if (currentFilter === 'ojt') {
        emptyTitle.textContent = 'No OJT interviews found';
        emptyDesc.textContent = 'When company supervisors schedule an interview for an OJT slot, it will appear here.';
      } else if (currentFilter === 'job') {
        emptyTitle.textContent = 'No job interviews found';
        emptyDesc.textContent = 'When employers schedule an interview for a job opening, it will appear here.';
      } else {
        emptyTitle.textContent = 'No interviews scheduled';
        emptyDesc.textContent = 'When you have scheduled interviews, they will be listed here.';
      }
    } else {
      cardsEl.style.display = 'flex';
      emptyEl.style.display = 'none';
      cardsEl.innerHTML = filtered.map((iv, i) => {
        const iso = isoFromStr(iv.date);
        return interviewCard(iv, i).replace('data-id=', `data-date="${iso}" data-id=`);
      }).join('');

      // Attach card listeners
      attachCardListeners();
    }
  }

  function attachCardListeners() {
    // "View Details" buttons
    cardsEl.querySelectorAll('.iv-card__btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const iv = interviews.find(x => String(x.id) === String(id));
        if (iv) showInterviewDetailModal(iv);
      });
    });

    // Copy link buttons
    cardsEl.querySelectorAll('.iv-card__copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.link || '').then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = `${icon('checkCircle', 14)} Copied!`;
          btn.classList.add('iv-card__copy--ok');
          setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('iv-card__copy--ok'); }, 2000);
        });
      });
    });

    // Copy address buttons
    cardsEl.querySelectorAll('.iv-card__copy-loc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.loc || '').then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = `${icon('checkCircle', 14)} Copied!`;
          btn.classList.add('iv-card__copy--ok');
          setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('iv-card__copy--ok'); }, 2000);
        });
      });
    });

    // Card click opens modal if not clicking a link or button
    cardsEl.querySelectorAll('.iv-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        const id = card.dataset.id;
        const iv = interviews.find(x => String(x.id) === String(id));
        if (iv) showInterviewDetailModal(iv);
      });
    });
  }

  // Filter bar tabs click listener
  container.querySelectorAll('.iv-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.iv-filter-btn').forEach(b => b.classList.remove('iv-filter-btn--active'));
      btn.classList.add('iv-filter-btn--active');
      currentFilter = btn.dataset.filter;
      renderCards();
    });
  });

  // Initial render of cards
  renderCards();

  /* ── Timeline ── */
  const tlEl = container.querySelector('#iv-timeline');
  if (schedule.length) {
    tlEl.innerHTML = schedule.map((s, i) => schedRow(s, i)).join('');
  } else {
    tlEl.innerHTML = '<p style="text-align:center;padding:var(--space-8);color:var(--text-tertiary)">No events scheduled for today</p>';
  }
}
