/**
 * CHMSU HireMe — Company Interviews Page (Unified Job & OJT Schedule)
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPut } from '../api/client.js';

/* ─── helpers ─── */
/** Returns true if the current moment is within the meeting window */
function canJoinMeeting(iv) {
  if (iv.interview_type === 'face_to_face') return false;
  const todayStr = new Date().toISOString().split('T')[0];
  if (iv.date_raw !== todayStr) return false;
  if (!iv.meeting_link || iv.meeting_link === '#' || iv.meeting_link.startsWith('javascript:')) return false;

  // Parse "10:00 AM" / "2:30 PM" → minutes since midnight
  const m = (iv.time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return true; // fallback: allow
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(h, min, 0, 0);

  const windowStart = new Date(scheduled.getTime() - 15 * 60 * 1000);  // 15 min early
  const windowEnd   = new Date(scheduled.getTime() + 120 * 60 * 1000); // 2 hrs after
  return now >= windowStart && now <= windowEnd;
}

/** Convert "10:00 AM" → "10:00", "2:30 PM" → "14:30" for <input type="time"> */
function formatTimeForInput(timeStr) {
  const m = (timeStr || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '10:00';
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDisplayTime(timeVal) {
  if (!timeVal) return '';
  const [h, m] = timeVal.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export async function renderInterviews(container) {
  const today = new Date();

  container.innerHTML = `
    <section class="co-hero fade-in" style="padding:20px 0 12px;">
      <div class="co-hero__content">
        <h1 class="co-hero__title" style="font-size:1.5rem;">${icon('video', 24)} Interview Schedule</h1>
        <p class="co-hero__subtitle" style="margin-bottom:var(--space-4);">Manage upcoming interviews for both Job Openings and Student OJT Internships in one unified schedule.</p>
      </div>
    </section>

    <div class="iv-grid fade-in">
      <div class="iv-main">
        <div class="card card--content" id="interviews-list">
          <div class="card__header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <h3 class="card__title" style="margin:0 0 4px 0;">Scheduled Interviews</h3>
              <p class="text-xs text-secondary" style="margin:0;">Filter by category or timeframe to inspect and manage candidate interviews.</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <label for="iv-filter" class="text-xs text-secondary" style="font-weight:600;">Timeframe:</label>
              <select class="form-select" style="width:auto;min-width:130px;padding:6px 10px;font-size:0.8rem;" id="iv-filter">
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div style="padding:10px 20px 14px;border-bottom:1px solid var(--border-default);">
            <div class="iv-cat-tabs" id="iv-cat-tabs">
              <button type="button" class="iv-cat-tab iv-cat-tab--active" data-cat="all">
                All Interviews <span class="iv-cat-count" id="count-all">0</span>
              </button>
              <button type="button" class="iv-cat-tab" data-cat="job">
                💼 Job Interviews <span class="iv-cat-count" id="count-job">0</span>
              </button>
              <button type="button" class="iv-cat-tab" data-cat="ojt">
                🎓 OJT Interviews <span class="iv-cat-count" id="count-ojt">0</span>
              </button>
            </div>
          </div>

          <div class="card__body" id="iv-cards" style="padding-top:16px;">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm"></div>
            <div class="skeleton skeleton--text"></div>
          </div>
        </div>
      </div>

      <div class="iv-sidebar">
        <div class="iv-cal" id="calendar-widget">
          <div class="iv-cal__header">
            <button class="btn btn--outline btn--sm" id="cal-prev">${icon('chevronLeft', 16)}</button>
            <h4 class="iv-cal__title" id="cal-title">${MONTHS[today.getMonth()]} ${today.getFullYear()}</h4>
            <button class="btn btn--outline btn--sm" id="cal-next">${icon('chevronRight', 16)}</button>
          </div>
          <div class="iv-cal__grid" id="cal-grid"></div>
        </div>

        <div class="card card--content">
          <div class="card__header"><h4 class="card__title" style="margin:0;">Today's Schedule</h4></div>
          <div class="card__body" id="today-schedule">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm"></div>
          </div>
        </div>
      </div>
    </div>`;

  let currentMonth    = today.getMonth();
  let currentYear     = today.getFullYear();
  let allInterviews   = [];
  let currentCategory = 'all';
  let currentTime     = 'all';

  renderCalendar(container, currentYear, currentMonth, []);

  container.querySelector('#cal-prev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(container, currentYear, currentMonth, allInterviews);
  });

  container.querySelector('#cal-next').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(container, currentYear, currentMonth, allInterviews);
  });

  /* Category tabs handler */
  container.querySelectorAll('#iv-cat-tabs .iv-cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('#iv-cat-tabs .iv-cat-tab').forEach(t => t.classList.remove('iv-cat-tab--active'));
      tab.classList.add('iv-cat-tab--active');
      currentCategory = tab.dataset.cat;
      renderInterviewCards(container, allInterviews, currentCategory, currentTime);
    });
  });

  /* Timeframe filter handler */
  container.querySelector('#iv-filter').addEventListener('change', (e) => {
    currentTime = e.target.value;
    renderInterviewCards(container, allInterviews, currentCategory, currentTime);
  });

  /* Load interviews from API */
  try {
    const res = await apiGet('/company/interviews');
    if (res && res.success && Array.isArray(res.data)) {
      allInterviews = res.data;
    }
  } catch (err) {
    console.warn('Could not load interviews from API:', err);
  }

  updateCategoryCounts(container, allInterviews);
  renderInterviewCards(container, allInterviews, currentCategory, currentTime);
  renderCalendar(container, currentYear, currentMonth, allInterviews);
  renderTodaySchedule(container, allInterviews);
}

function updateCategoryCounts(container, interviews) {
  const allCount = interviews.length;
  const jobCount = interviews.filter(i => i.category === 'job').length;
  const ojtCount = interviews.filter(i => i.category === 'ojt').length;

  const elAll = container.querySelector('#count-all');
  const elJob = container.querySelector('#count-job');
  const elOjt = container.querySelector('#count-ojt');

  if (elAll) elAll.textContent = allCount;
  if (elJob) elJob.textContent = jobCount;
  if (elOjt) elOjt.textContent = ojtCount;
}

/* ─── Calendar ─── */
function renderCalendar(container, year, month, interviews) {
  const title = container.querySelector('#cal-title');
  if (title) title.textContent = `${MONTHS[month]} ${year}`;

  const grid = container.querySelector('#cal-grid');
  if (!grid) return;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const interviewDays = new Set(
    (interviews || [])
      .filter(iv => {
        const d = new Date(iv.date_raw);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(iv => new Date(iv.date_raw).getDate())
  );

  let html = DAYS.map(d => `<div class="iv-cal__day-label">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += '<div class="iv-cal__day iv-cal__day--empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday  = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvent = interviewDays.has(d);
    html += `<div class="iv-cal__day ${isToday ? 'iv-cal__day--today' : ''} ${hasEvent ? 'iv-cal__day--has-event' : ''}">${d}${hasEvent ? '<span class="iv-cal__dot"></span>' : ''}</div>`;
  }
  grid.innerHTML = html;
}

/* ─── Today's schedule sidebar ─── */
function renderTodaySchedule(container, interviews) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIvs = (interviews || []).filter(iv => iv.date_raw === todayStr && iv.status !== 'cancelled');
  const el       = container.querySelector('#today-schedule');
  if (!el) return;

  if (!todayIvs.length) {
    el.innerHTML = `<p class="text-sm text-tertiary" style="text-align:center;padding:16px 0;margin:0;">No interviews scheduled for today.</p>`;
    return;
  }

  el.innerHTML = todayIvs.map(iv => `
    <div class="iv-schedule__item" style="padding:10px 0;border-bottom:1px solid var(--border-default);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
        <span class="iv-schedule__time" style="font-weight:700;font-size:0.8rem;color:var(--color-primary);">${iv.time}</span>
        ${iv.category === 'ojt'
          ? `<span class="badge badge--ojt" style="font-size:0.65rem;padding:1px 6px;">🎓 OJT</span>`
          : `<span class="badge badge--job" style="font-size:0.65rem;padding:1px 6px;">💼 JOB</span>`
        }
      </div>
      <div class="iv-schedule__content">
        <div class="iv-schedule__title" style="font-weight:600;font-size:0.85rem;color:var(--text-primary);">${iv.candidate?.name || 'Candidate'}</div>
        <div class="iv-schedule__detail text-xs text-secondary" style="margin-top:2px;">
          ${iv.job?.title || 'Position'} · ${iv.interview_type === 'face_to_face' ? 'On-site' : (iv.platform || 'Online')}
        </div>
      </div>
    </div>`).join('');
}

/* ─── Interview cards ─── */
function renderInterviewCards(container, interviews, category = 'all', timeFilter = 'all') {
  const cardsEl  = container.querySelector('#iv-cards');
  if (!cardsEl) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const weekEnd  = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekStr  = weekEnd.toISOString().split('T')[0];

  let filtered = interviews || [];

  // Filter by category
  if (category === 'job') {
    filtered = filtered.filter(iv => iv.category === 'job');
  } else if (category === 'ojt') {
    filtered = filtered.filter(iv => iv.category === 'ojt');
  }

  // Filter by timeframe
  if (timeFilter === 'today') {
    filtered = filtered.filter(iv => iv.date_raw === todayStr);
  } else if (timeFilter === 'this-week') {
    filtered = filtered.filter(iv => iv.date_raw >= todayStr && iv.date_raw <= weekStr);
  } else if (timeFilter === 'upcoming') {
    filtered = filtered.filter(iv => iv.status === 'upcoming' && iv.date_raw >= todayStr);
  }

  if (!filtered.length) {
    const catText = category === 'job' ? 'Job' : category === 'ojt' ? 'OJT' : '';
    cardsEl.innerHTML = `
      <div class="empty-state" style="padding:48px 16px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;opacity:0.6;">📅</div>
        <h3 class="empty-state__title" style="font-size:1.05rem;font-weight:600;margin-bottom:6px;">No ${catText} interviews found</h3>
        <p class="empty-state__text text-secondary text-sm" style="max-width:420px;margin:0 auto;line-height:1.5;">
          ${category === 'ojt'
            ? 'No OJT interviews match your selection. You can schedule interviews directly from the OJT Applicants list.'
            : category === 'job'
            ? 'No Job interviews match your selection. You can schedule interviews directly from the Job Applicants list.'
            : 'Scheduled interviews will appear here once you schedule candidates from the Applicants page.'}
        </p>
      </div>`;
    return;
  }

  const badgeVariant = s => s === 'upcoming' ? 'info' : s === 'done' ? 'success' : s === 'cancelled' ? 'neutral' : 'warning';

  cardsEl.innerHTML = filtered.map(iv => {
    const isOjt = iv.category === 'ojt';
    const isFaceToFace = iv.interview_type === 'face_to_face';
    const avatarBg = isOjt ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))';

    return `
    <div class="iv-card" data-iv-id="${iv.id}" style="${iv.status === 'cancelled' ? 'opacity:0.6;' : ''}">
      <div class="iv-card__header">
        <div class="iv-card__avatar" style="background:${avatarBg};">${iv.candidate?.initials || 'CA'}</div>
        <div class="iv-card__info">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
            <h4 class="iv-card__name" style="margin:0;">${iv.candidate?.name || 'Candidate'}</h4>
            ${isOjt
              ? '<span class="badge badge--ojt">🎓 OJT Internship</span>'
              : '<span class="badge badge--job">💼 Job Opening</span>'
            }
          </div>
          <p class="iv-card__role text-sm text-secondary" style="margin:0;">
            ${iv.candidate?.role || ''} · <strong style="color:var(--text-primary);font-weight:600;">${iv.job?.title || 'Position'}</strong>
          </p>
        </div>
        <span class="badge badge--${badgeVariant(iv.status)}" style="text-transform:uppercase;font-size:.67rem;letter-spacing:0.5px;">${iv.status === 'past' || iv.status === 'done' ? 'Finished' : iv.status}</span>
      </div>

      <div class="iv-card__details" style="gap:14px;padding:4px 0;">
        <span class="text-sm text-secondary" style="display:inline-flex;align-items:center;gap:5px;">
          ${icon('calendar', 14)} <strong>${iv.date}</strong>
        </span>
        <span class="text-sm text-secondary" style="display:inline-flex;align-items:center;gap:5px;">
          ${icon('clock', 14)} ${iv.time} · ${iv.duration}
        </span>
        ${isFaceToFace
          ? `<span class="text-sm text-secondary" style="display:inline-flex;align-items:center;gap:5px;" title="${iv.location || ''}">
              ${icon('mapPin', 14)} <span style="color:#059669;font-weight:600;">On-site:</span> ${iv.location || 'Company Office'}
            </span>`
          : `<span class="text-sm text-secondary" style="display:inline-flex;align-items:center;gap:5px;">
              ${icon('video', 14)} ${iv.platform || 'Online Meeting'}
            </span>`
        }
      </div>

      ${iv.interviewer_name ? `
      <div style="font-size:.78rem;color:var(--text-secondary);margin-bottom:8px;display:flex;align-items:center;gap:5px;">
        ${icon('user', 12)} <span style="color:var(--text-tertiary);">Interviewer / Host:</span> <strong>${iv.interviewer_name}</strong>
      </div>` : ''}

      ${iv.notes ? `
      <p style="font-size:.79rem;color:var(--text-secondary);margin-bottom:10px;padding:8px 12px;background:var(--bg-secondary);border-radius:var(--radius-md);line-height:1.5;">
        ${icon('fileText', 12)} ${iv.notes}
      </p>` : ''}

      <div class="iv-card__actions" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${isFaceToFace
          ? `<span class="btn btn--outline btn--sm" style="pointer-events:none;opacity:.9;color:#059669;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.06);display:inline-flex;align-items:center;gap:6px;">
              ${icon('mapPin', 14)} On-site Interview
            </span>`
          : canJoinMeeting(iv)
            ? `<a class="btn btn--primary btn--sm" href="${iv.meeting_link}" target="_blank" rel="noopener noreferrer">${icon('video', 14)} Join Meeting</a>`
            : iv.meeting_link && iv.meeting_link !== '#'
              ? `<button class="btn btn--primary btn--sm" disabled title="Available 15 min before the interview and up to 2 hours after" style="opacity:.5;">${icon('video', 14)} Join Meeting</button>`
              : `<button class="btn btn--primary btn--sm" disabled style="opacity:.5;">${icon('video', 14)} Join Meeting</button>`
        }
        <button class="btn btn--outline btn--sm btn--reschedule-iv" data-id="${iv.id}">${icon('calendar', 14)} Reschedule</button>
        ${iv.status !== 'cancelled'
          ? `<button class="btn btn--outline btn--sm btn--cancel-iv" data-id="${iv.id}" style="color:var(--color-danger);border-color:rgba(239,68,68,0.3);">${icon('x', 14)} Cancel</button>`
          : ''
        }
      </div>
    </div>`;
  }).join('');

  // Attach reschedule listener
  cardsEl.querySelectorAll('.btn--reschedule-iv').forEach(btn => {
    btn.addEventListener('click', () => {
      const iv = (interviews || []).find(i => String(i.id) === btn.dataset.id);
      if (iv) openRescheduleModal(iv, interviews, container, category, timeFilter);
    });
  });

  // Attach cancel listener
  cardsEl.querySelectorAll('.btn--cancel-iv').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to cancel this interview?')) return;
      btn.disabled = true;
      btn.innerHTML = icon('clock', 14) + ' Cancelling…';

      const res = await apiPut(`/company/interviews/${btn.dataset.id}/cancel`, {});
      if (res && res.success) {
        const idx = interviews.findIndex(i => String(i.id) === btn.dataset.id);
        if (idx !== -1) {
          interviews[idx].status = 'cancelled';
        }
        renderInterviewCards(container, interviews, category, timeFilter);
        renderTodaySchedule(container, interviews);
        showToast('Interview cancelled successfully', 'info');
      } else {
        btn.disabled = false;
        btn.innerHTML = icon('x', 14) + ' Cancel';
        showToast(res?.message || 'Could not cancel interview. Please try again.', 'error');
      }
    });
  });
}

/* ─── Reschedule Modal ─── */
function openRescheduleModal(iv, allInterviews, container, currentCat, currentTime) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop modal-backdrop--visible';
  overlay.style.cssText = 'z-index:10001;background:rgba(10,12,20,.72);backdrop-filter:blur(3px);';

  const today    = new Date().toISOString().split('T')[0];
  const timeVal  = formatTimeForInput(iv.time);
  const isOjt    = iv.category === 'ojt';

  const durationOptions = ['30 min','45 min','1 hour','1.5 hours','2 hours'];
  const platformOptions = ['Google Meet','Zoom','Microsoft Teams','Phone Call'];
  const typeOptions = isOjt
    ? ['Face-to-Face Interview','Online Interview','OJT Screening','Coordinator & Company Interview','Final OJT Assessment']
    : ['Technical Interview','HR Screening','Initial Interview','Final Interview','Panel Interview'];

  const initialFormat = iv.interview_type || (iv.type?.toLowerCase().includes('face') ? 'face_to_face' : 'online');

  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" style="max-width:540px;width:100%;padding:0;overflow:hidden;">
      <div style="background:${isOjt ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#f59e0b,#d97706)'};padding:20px 24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;color:#fff;flex-shrink:0;">
            ${iv.candidate?.initials || 'CA'}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0;">${icon('calendar', 16)} Reschedule Interview</h3>
              <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.68rem;padding:2px 8px;border-radius:99px;font-weight:600;">
                ${isOjt ? '🎓 OJT' : '💼 JOB'}
              </span>
            </div>
            <p style="color:rgba(255,255,255,.9);font-size:.8rem;margin:2px 0 0;">
              ${iv.candidate?.name || 'Candidate'} · ${iv.job?.title || 'Position'}
            </p>
          </div>
          <button id="rs-close" style="margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${icon('x', 15)}
          </button>
        </div>
      </div>

      <form id="rs-form" style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-height:80vh;overflow-y:auto;">
        <p id="rs-error" style="color:#ef4444;font-size:.83rem;min-height:1em;margin:0;"></p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Date *</label>
            <input name="scheduled_date" type="date" min="${today}" class="form-input" required value="${iv.date_raw}" style="width:100%;">
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Time *</label>
            <input name="scheduled_time" type="time" class="form-input" required value="${timeVal}" style="width:100%;">
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Duration</label>
            <select name="duration" class="form-input form-select" style="width:100%;">
              ${durationOptions.map(d => `<option value="${d}" ${iv.duration === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interview Format *</label>
            <select name="interview_type" id="rs-format-select" class="form-input form-select" required style="width:100%;">
              <option value="online" ${initialFormat === 'online' ? 'selected' : ''}>🌐 Online Video</option>
              <option value="face_to_face" ${initialFormat === 'face_to_face' ? 'selected' : ''}>🏢 Face-to-Face / On-site</option>
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interview Type *</label>
            <select name="type" class="form-input form-select" required style="width:100%;">
              ${typeOptions.map(t => `<option value="${t}" ${iv.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interviewer / Host</label>
            <input name="interviewer_name" type="text" class="form-input" value="${iv.interviewer_name || ''}" placeholder="e.g. Engr. Mark Rivera" style="width:100%;">
          </div>
        </div>

        <div id="rs-online-fields" style="display:${initialFormat === 'face_to_face' ? 'none' : 'block'};">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Platform</label>
              <select name="platform" class="form-input form-select" style="width:100%;">
                ${platformOptions.map(p => `<option value="${p}" ${iv.platform === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Meeting Link</label>
              <input name="meeting_link" type="url" class="form-input" value="${iv.meeting_link && iv.meeting_link !== '#' ? iv.meeting_link : ''}" placeholder="https://meet.google.com/..." style="width:100%;">
            </div>
          </div>
        </div>

        <div id="rs-onsite-fields" style="display:${initialFormat === 'face_to_face' ? 'block' : 'none'};">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">On-site Location / Room / Instructions</label>
            <input name="location" type="text" class="form-input" value="${iv.location || ''}" placeholder="e.g. Main Campus Bldg 2, Room 304 or Company Office" style="width:100%;">
          </div>
        </div>

        <div>
          <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Notes / Focus Areas / Instructions</label>
          <textarea name="notes" class="form-input form-textarea" rows="3" style="width:100%;resize:vertical;">${iv.notes || ''}</textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;padding-top:12px;border-top:1px solid var(--border-default);">
          <button type="button" id="rs-cancel" class="btn btn--ghost">Cancel</button>
          <button type="submit" id="rs-submit" class="btn ${isOjt ? 'btn--primary' : 'btn--warning'}">${icon('calendar', 14)} Confirm Reschedule</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#rs-close').onclick  = close;
  overlay.querySelector('#rs-cancel').onclick = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  // Toggle online vs on-site fields dynamically
  const formatSelect = overlay.querySelector('#rs-format-select');
  const onlineFields = overlay.querySelector('#rs-online-fields');
  const onsiteFields = overlay.querySelector('#rs-onsite-fields');

  formatSelect.addEventListener('change', () => {
    if (formatSelect.value === 'face_to_face') {
      onlineFields.style.display = 'none';
      onsiteFields.style.display = 'block';
    } else {
      onlineFields.style.display = 'block';
      onsiteFields.style.display = 'none';
    }
  });

  overlay.querySelector('#rs-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form      = new FormData(e.target);
    const submitBtn = overlay.querySelector('#rs-submit');
    const errEl     = overlay.querySelector('#rs-error');
    errEl.textContent = '';

    const formatVal = form.get('interview_type');
    const payload = {
      type:             form.get('type'),
      interview_type:   formatVal,
      scheduled_date:   form.get('scheduled_date'),
      scheduled_time:   form.get('scheduled_time'),
      duration:         form.get('duration'),
      platform:         formatVal === 'face_to_face' ? 'On-site / In-person' : (form.get('platform') || 'Online Meeting'),
      meeting_link:     formatVal === 'face_to_face' ? '#' : (form.get('meeting_link') || undefined),
      location:         formatVal === 'face_to_face' ? (form.get('location') || 'Company Office') : (form.get('meeting_link') || 'Online Meeting'),
      interviewer_name: form.get('interviewer_name') || undefined,
      notes:            form.get('notes') || undefined,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = icon('clock', 14) + ' Saving…';

    const res = await apiPut(`/company/interviews/${iv.id}/reschedule`, payload);

    if (res && res.success) {
      close();
      const idx = allInterviews.findIndex(i => String(i.id) === String(iv.id));
      if (idx !== -1) {
        allInterviews[idx] = {
          ...allInterviews[idx],
          date_raw:         payload.scheduled_date,
          date:             formatDisplayDate(payload.scheduled_date),
          time:             formatDisplayTime(payload.scheduled_time),
          type:             payload.type,
          interview_type:   payload.interview_type,
          duration:         payload.duration || allInterviews[idx].duration,
          platform:         payload.platform,
          meeting_link:     payload.meeting_link || '#',
          location:         payload.location,
          interviewer_name: payload.interviewer_name || '',
          notes:            payload.notes || '',
          status:           'upcoming',
        };
      }
      renderInterviewCards(container, allInterviews, currentCat, currentTime);
      renderCalendar(container, new Date().getFullYear(), new Date().getMonth(), allInterviews);
      renderTodaySchedule(container, allInterviews);
      showToast(`Interview rescheduled for ${iv.candidate?.name || 'Candidate'}`, 'success');
    } else {
      errEl.textContent = res?.message || 'Failed to reschedule. Please try again.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = icon('calendar', 14) + ' Confirm Reschedule';
    }
  });
}

/* ─── Toast ─── */
function showToast(message, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast--${type} toast--visible`;
  t.innerHTML = `${icon(type === 'error' ? 'alertCircle' : 'checkCircle', 16)} <span>${message}</span>`;
  document.body.appendChild(t);
  setTimeout(() => { t.classList.remove('toast--visible'); setTimeout(() => t.remove(), 300); }, 3000);
}
