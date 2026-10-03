/**
 * CHMSU HireMe â€” Interview Hub (Professional Redesign)
 * Layout: Hero â†’ Stat Cards â†’ 2-col (Calendar | Interviews) â†’ Today Timeline
 */
import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';

/* â”€â”€ Platform config â”€â”€ */
const platformCfg = {
  'Google Meet':     { color: '#1EA362', bg: 'rgba(30,163,98,0.08)',  gradient: 'linear-gradient(135deg,#1EA362,#34D399)', label: 'Google Meet' },
  'Zoom':            { color: '#2D8CFF', bg: 'rgba(45,140,255,0.08)', gradient: 'linear-gradient(135deg,#2D8CFF,#60A5FA)', label: 'Zoom' },
  'Microsoft Teams': { color: '#5B5FC7', bg: 'rgba(91,95,199,0.08)',  gradient: 'linear-gradient(135deg,#5B5FC7,#818CF8)', label: 'Teams' },
};

function getPlatform(name) {
  return platformCfg[name] || { color: 'var(--color-primary)', bg: 'var(--color-primary-bg)', gradient: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-light))', label: name || 'Meeting' };
}

/* â”€â”€ Status badge â”€â”€ */
function statusBadge(status) {
  const map = {
    upcoming:  { label: 'Upcoming',  color: 'var(--color-primary)',  bg: 'var(--color-primary-bg)' },
    completed: { label: 'Completed', color: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
    cancelled: { label: 'Cancelled', color: 'var(--color-error)',    bg: 'var(--color-error-bg)' },
    finished:  { label: 'Finished',  color: '#94a3b8',               bg: 'rgba(148,163,184,0.12)' },
  };
  const s = map[status] || map.upcoming;
  return `<span class="iv-badge" style="background:${s.bg};color:${s.color};">${icon('clock', 11)} ${s.label}</span>`;
}

/* â”€â”€ Calendar â”€â”€ */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const TODAY  = new Date();

/* ── Normalize raw API interview to display shape ── */
function normalizeInterview(raw) {
  const company = raw.company_name || 'Company';
  const title   = raw.job_title || raw.type || 'Interview';
  const dateObj = raw.scheduled_date ? new Date(raw.scheduled_date + 'T00:00:00') : null;
  const dateFormatted = dateObj
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
  const effectiveStatus = (dateObj && dateObj < todayMidnight) ? 'finished' : (raw.status || 'upcoming');
  return {
    id:              raw.id,
    title,
    company,
    companyInitial:  company.trim().charAt(0).toUpperCase(),
    date:            dateFormatted,
    time:            String(raw.scheduled_time || '').slice(0, 5),
    platform:        raw.platform || '',
    status:          effectiveStatus,
    interviewerName: raw.interviewer_name || 'TBD',
    duration:        raw.duration || '',
    meetingLink:     raw.meeting_link || '#',
    _rawDate:        raw.scheduled_date || '',
  };
}

function isoFromStr(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

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

/* â”€â”€ Countdown helper â”€â”€ */
function countdown(dateStr, timeStr) {
  const target = new Date(dateStr);
  const diff = Math.max(0, Math.floor((target - TODAY) / (1000*60*60*24)));
  if (diff === 0) return { text: 'Today', urgent: true };
  if (diff === 1) return { text: 'Tomorrow', urgent: true };
  return { text: `${diff} days`, urgent: diff <= 3 };
}

/* â”€â”€ Interview card builder â”€â”€ */
/* Returns true if current time has reached/passed the interview start time */
function isInterviewLive(rawDate, timeStr) {
  if (!rawDate || !timeStr) return false;
  const [hh, mm] = timeStr.split(':').map(Number);
  const start = new Date(rawDate + 'T00:00:00');
  start.setHours(hh, mm, 0, 0);
  return new Date() >= start;
}

function interviewCard(iv, idx) {
  const isFinished = iv.status === 'finished';
  const p    = getPlatform(iv.platform);
  const cd   = isFinished ? null : countdown(iv.date, iv.time);
  const live = !isFinished && isInterviewLive(iv._rawDate, iv.time);
  const joinBtn = isFinished ? '' : (live
    ? `<a href="${iv.meetingLink}" target="_blank" rel="noopener noreferrer"
          class="btn btn--primary btn--sm iv-card__join" data-rawdate="${iv._rawDate}" data-time="${iv.time}" data-link="${iv.meetingLink}">
         ${icon('externalLink', 14)} Join Meeting
       </a>`
    : `<button class="btn btn--primary btn--sm iv-card__join iv-card__join--locked"
          disabled data-rawdate="${iv._rawDate}" data-time="${iv.time}" data-link="${iv.meetingLink}"
          title="Available at ${iv.time} on ${iv.date}" style="opacity:.45;cursor:not-allowed;">
         ${icon('clock', 14)} Join Meeting
       </button>`);
  return `
    <article class="iv-card" style="--d:${idx * 80}ms" data-id="${iv.id}">
      <!-- accent strip -->
      <div class="iv-card__strip" style="background:${p.gradient}"></div>
      <div class="iv-card__inner">
        <!-- row 1: company + status -->
        <div class="iv-card__head">
          <div class="iv-card__avatar" style="background:${p.gradient}">${iv.companyInitial}</div>
          <div class="iv-card__head-info">
            <h3 class="iv-card__title">${iv.title}</h3>
            <span class="iv-card__company">${iv.company}</span>
          </div>
          ${statusBadge(iv.status)}
        </div>

        <!-- meta chips row -->
        <div class="iv-card__meta">
          <span class="iv-card__chip">${icon('calendar', 13)} ${iv.date}</span>
          <span class="iv-card__chip">${icon('clock', 13)} ${iv.time} · ${iv.duration}</span>
          <span class="iv-card__chip">${icon('user', 13)} ${iv.interviewerName}</span>
          ${cd ? `<span class="iv-card__chip iv-card__chip--countdown ${cd.urgent ? 'iv-card__chip--urgent' : ''}">${icon('zap', 13)} ${cd.text}</span>` : ''}
        </div>

        <!-- meeting link block -->
        <div class="iv-card__meeting">
          <div class="iv-card__meeting-badge" style="background:${p.bg};color:${p.color};">
            ${icon('externalLink', 14)} ${p.label}
          </div>
          <div class="iv-card__meeting-link">
            <a href="${iv.meetingLink}" target="_blank" rel="noopener noreferrer" class="iv-card__link">${iv.meetingLink}</a>
          </div>
        </div>

        <!-- actions -->
        <div class="iv-card__actions">
          ${joinBtn}
          <button class="btn btn--ghost btn--sm iv-card__copy" data-link="${iv.meetingLink}">
            ${icon('share', 14)} Copy Link
          </button>
        </div>
      </div>
    </article>`;
}

/* â”€â”€ Schedule row â”€â”€ */
function schedRow(item, idx) {
  return `
    <div class="iv-tl ${item.current ? 'iv-tl--active' : ''}" style="--d:${idx * 60}ms">
      <span class="iv-tl__time">${item.time}</span>
      <div class="iv-tl__rail">
        <span class="iv-tl__dot ${item.current ? 'iv-tl__dot--pulse' : ''}"></span>
        <span class="iv-tl__line"></span>
      </div>
      <div class="iv-tl__body">
        <span class="iv-tl__title">${item.title}</span>
        <span class="iv-tl__sub">${item.detail}</span>
      </div>
      ${item.current ? `<span class="iv-tl__now">NOW</span>` : ''}
    </div>`;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MAIN RENDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export async function renderInterview(container) {
  container.innerHTML = `
    <div class="page-enter">

      <!-- â•â•â• Hero â•â•â• -->
      <section class="iv-hero">
        <div class="iv-hero__bg">
          <div class="iv-hero__orb iv-hero__orb--1"></div>
          <div class="iv-hero__orb iv-hero__orb--2"></div>
          <div class="iv-hero__orb iv-hero__orb--3"></div>
        </div>
        <div class="iv-hero__content">
          <span class="iv-hero__eyebrow animate-fade-in-up">${icon('calendar', 16)} Interview Hub</span>
          <h1 class="iv-hero__title animate-fade-in-up" style="animation-delay:50ms">
            Manage Your<br>Interviews
          </h1>
          <p class="iv-hero__subtitle animate-fade-in-up" style="animation-delay:100ms">
            Track schedules, join meetings, and stay prepared for every opportunity
          </p>
        </div>
      </section>

      <!-- â•â•â• Stat Row â•â•â• -->
      <div class="iv-stats animate-fade-in-up" style="animation-delay:140ms">
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-primary-bg);color:var(--color-primary)">${icon('calendar', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-upcoming">0</span>
            <span class="iv-stat__label">Upcoming</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-success-bg);color:var(--color-success)">${icon('zap', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-today">0</span>
            <span class="iv-stat__label">Today</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-warning-bg);color:var(--color-warning)">${icon('clock', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-month">0</span>
            <span class="iv-stat__label">This Month</span>
          </div>
        </div>
        <div class="iv-stat">
          <div class="iv-stat__icon" style="background:var(--color-info-bg);color:var(--color-info)">${icon('externalLink', 20)}</div>
          <div class="iv-stat__info">
            <span class="iv-stat__value" id="iv-ct-platforms">0</span>
            <span class="iv-stat__label">Platforms</span>
          </div>
        </div>
      </div>

      <!-- â•â•â• Content Grid: Calendar + Cards â•â•â• -->
      <div class="iv-grid">

        <!-- LEFT: Calendar -->
        <aside class="iv-cal animate-fade-in-up" style="animation-delay:200ms">
          <div class="iv-cal__head">
            <button class="iv-cal__nav" id="iv-cal-prev">${icon('chevronDown', 16)}</button>
            <h2 class="iv-cal__month" id="iv-cal-label"></h2>
            <button class="iv-cal__nav" id="iv-cal-next">${icon('chevronDown', 16)}</button>
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
          <div class="iv-list__cards" id="iv-cards">
            <div class="iv-skel"></div>
            <div class="iv-skel"></div>
          </div>
          <div class="iv-list__empty" id="iv-empty" style="display:none">
            <div class="iv-list__empty-icon">${icon('calendar', 48)}</div>
            <h3>No interviews scheduled</h3>
            <p>When you have upcoming interviews, they'll appear here</p>
          </div>
        </section>
      </div>

      <!-- â•â•â• Today's Timeline â•â•â• -->
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
  const rawData    = await apiGet('/jobseeker/interviews');
  const interviews = (Array.isArray(rawData) ? rawData : (rawData?.data ?? [])).map(normalizeInterview);

  /* ── Build today's schedule from real interview data ── */
  const todayIso = TODAY.toISOString().split('T')[0];
  const schedule = interviews
    .filter(iv => iv._rawDate === todayIso)
    .map(iv => ({
      time:    iv.time,
      title:   iv.title,
      detail:  iv.company + (iv.platform ? ' · ' + iv.platform : '') + (iv.interviewerName !== 'TBD' ? ' · ' + iv.interviewerName : ''),
      current: false,
    }));

  /* â”€â”€ Animate stat counters â”€â”€ */
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

  const uniquePlatforms  = new Set(interviews.map(iv => iv.platform).filter(Boolean)).size;
  const upcomingCount    = interviews.filter(iv => iv._rawDate >= todayIso).length;
  const thisMonthCount   = interviews.filter(iv => {
    const d = new Date(iv._rawDate + 'T00:00:00');
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  }).length;
  animNum('iv-ct-upcoming', upcomingCount,    500);
  animNum('iv-ct-today',    schedule.length,  400);
  animNum('iv-ct-month',    thisMonthCount,   600);
  animNum('iv-ct-platforms', uniquePlatforms, 350);

  /* â”€â”€ Calendar â”€â”€ */
  let cYear = TODAY.getFullYear(), cMonth = TODAY.getMonth();
  const ivDates = interviews.map(iv => ({ ...iv, iso: isoFromStr(iv._rawDate) }));

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

  container.querySelector('#iv-cal-prev').addEventListener('click', () => { cMonth--; if (cMonth < 0) { cMonth = 11; cYear--; } drawCal(); });
  container.querySelector('#iv-cal-next').addEventListener('click', () => { cMonth++; if (cMonth > 11) { cMonth = 0; cYear++; } drawCal(); });
  drawCal();

  /* â”€â”€ Next-up mini card â”€â”€ */
  const nextUp = container.querySelector('#iv-cal-next-up');
  const nonFinishedInterviews = interviews.filter(iv => iv.status !== 'finished');
  if (nonFinishedInterviews.length) {
    const n = nonFinishedInterviews[0];
    const p = getPlatform(n.platform);
    const cd = countdown(n._rawDate, n.time);
    nextUp.innerHTML = `
      <span class="iv-cal__next-label">Next Interview</span>
      <div class="iv-cal__next-row">
        <div class="iv-cal__next-avatar" style="background:${p.gradient}">${n.companyInitial}</div>
        <div class="iv-cal__next-info">
          <strong>${n.title}</strong>
          <span>${n.date} Â· ${n.time}</span>
        </div>
        <span class="iv-cal__next-cd ${cd.urgent ? 'iv-cal__next-cd--urgent' : ''}">${cd.text}</span>
      </div>`;
  } else {
    nextUp.style.display = 'none';
  }


  /* â”€â”€ Render interview cards â”€â”€ */
  const cardsEl = container.querySelector('#iv-cards');
  const emptyEl = container.querySelector('#iv-empty');
  container.querySelector('#iv-list-count').textContent = `${interviews.length} interview${interviews.length !== 1 ? 's' : ''}`;

  if (interviews.length === 0) {
    cardsEl.style.display = 'none';
    emptyEl.style.display = '';
  } else {
    cardsEl.innerHTML = interviews.map((iv, i) => {
      const iso = isoFromStr(iv._rawDate);
      return interviewCard(iv, i).replace('data-id=', `data-date="${iso}" data-id=`);
    }).join('');
  }

  /* -- Copy link -- */
  container.querySelectorAll('.iv-card__copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.link).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = `${icon('checkCircle', 14)} Copied!`;
        btn.classList.add('iv-card__copy--ok');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('iv-card__copy--ok'); }, 2000);
      });
    });
  });

  /* -- Live-unlock Join Meeting buttons -- */
  function unlockJoinButtons() {
    container.querySelectorAll('.iv-card__join--locked').forEach(btn => {
      if (isInterviewLive(btn.dataset.rawdate, btn.dataset.time)) {
        const link = btn.dataset.link;
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'btn btn--primary btn--sm iv-card__join';
        a.dataset.rawdate = btn.dataset.rawdate;
        a.dataset.time = btn.dataset.time;
        a.dataset.link = link;
        a.innerHTML = `${icon('externalLink', 14)} Join Meeting`;
        btn.replaceWith(a);
      }
    });
  }
  // Check every 30 seconds to unlock buttons when interview time arrives
  const unlockInterval = setInterval(() => {
    if (!container.isConnected) { clearInterval(unlockInterval); return; }
    unlockJoinButtons();
  }, 30000);

  /* â”€â”€ Timeline â”€â”€ */
  const tlEl = container.querySelector('#iv-timeline');
  if (schedule.length) {
    tlEl.innerHTML = schedule.map((s, i) => schedRow(s, i)).join('');
  } else {
    tlEl.innerHTML = '<p style="text-align:center;padding:var(--space-8);color:var(--text-tertiary)">No events scheduled for today</p>';
  }
}

