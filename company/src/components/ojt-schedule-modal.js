/* ===========================
   OJT Schedule & Start Date Modal — Company Portal
   Captures Start Date, Weekly Days, Shift Hours,
   Midday Lunch Break, Overtime Policy & Reporting Instructions.
   =========================== */

import { icon } from './icons.js';
import { apiPost } from '../api/client.js';

const ALL_DAYS = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' },
];

export function openSetOjtScheduleModal({
  studentName = 'Applicant',
  postingTitle = 'OJT Placement',
  slotId,
  interestId,
  requiredHours = 486,
  existingData = null,
  onSuccess,
}) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:10002;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

  // Default start date = next Monday or today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextMonday = new Date();
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  const defaultStartStr = nextMonday.toISOString().split('T')[0];

  // Schedule state
  let selectedDays = existingData?.schedule_days?.length
    ? [...existingData.schedule_days]
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  modal.innerHTML = `
    <div class="modal-box modal-box--visible anim-fade-in-up" role="dialog" aria-modal="true" style="max-width:540px;width:100%;margin:auto;padding:0;overflow:hidden;border-radius:var(--radius-xl);background:var(--bg-elevated);box-shadow:var(--shadow-2xl);border:1px solid var(--border-default);opacity:1!important;transform:none!important;display:flex;flex-direction:column;position:relative;z-index:10003;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#005930,#047857);padding:20px 24px 16px;color:#ffffff;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
              ${icon('calendar', 20)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.05rem;font-weight:800;color:#fff;line-height:1.2;">
                Set OJT Start Date &amp; Schedule
              </h3>
              <p style="margin:3px 0 0;font-size:0.78rem;color:rgba(255,255,255,0.85);">
                ${escapeHtml(studentName)} &middot; ${escapeHtml(postingTitle)}
              </p>
            </div>
          </div>
          <button id="sosi-close" style="background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;">
            ${icon('x', 16)}
          </button>
        </div>
      </div>

      <!-- Scrollable Form Body -->
      <div style="padding:20px 24px;max-height:72vh;overflow-y:auto;display:flex;flex-direction:column;gap:16px;">

        <!-- Step 1: Start Date -->
        <div>
          <label style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:5px;margin-bottom:6px;color:var(--text-primary);">
            ${icon('calendar', 13)} Official OJT Start Date <span style="color:var(--color-error);">*</span>
          </label>
          <input
            type="date"
            id="sosi-date"
            min="${todayStr}"
            value="${existingData?.ojt_start_date_raw || defaultStartStr}"
            class="form-input"
            style="width:100%;height:40px;padding:0 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-secondary);font-family:inherit;font-size:0.88rem;color:var(--text-primary);"
          />
          <p style="font-size:0.72rem;color:var(--text-secondary);margin:4px 0 0;">
            The student's OJT Tracker and geo-fenced punch clock will unlock on this date.
          </p>
        </div>

        <!-- Step 2: Weekly Days -->
        <div style="border-top:1px solid var(--border-default);padding-top:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <label style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:5px;margin:0;color:var(--text-primary);">
              ${icon('clock', 13)} Working Days in a Week <span style="color:var(--color-error);">*</span>
            </label>
            <span id="sosi-days-badge" style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(0,89,48,0.1);color:#005930;">
              5 days / week
            </span>
          </div>

          <!-- Quick Presets -->
          <div style="display:flex;gap:6px;margin-bottom:10px;">
            <button type="button" class="sosi-preset-btn sosi-preset-btn--active" data-preset="mon-fri" style="font-size:0.72rem;padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:var(--bg-secondary);cursor:pointer;font-family:inherit;font-weight:600;">
              Mon &ndash; Fri (5d)
            </button>
            <button type="button" class="sosi-preset-btn" data-preset="mon-sat" style="font-size:0.72rem;padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:var(--bg-secondary);cursor:pointer;font-family:inherit;font-weight:600;">
              Mon &ndash; Sat (6d)
            </button>
            <button type="button" class="sosi-preset-btn" data-preset="custom" style="font-size:0.72rem;padding:4px 10px;border-radius:6px;border:1px solid var(--border-default);background:var(--bg-secondary);cursor:pointer;font-family:inherit;font-weight:600;">
              Custom
            </button>
          </div>

          <!-- Day pills -->
          <div id="sosi-days-group" style="display:flex;gap:6px;flex-wrap:wrap;">
            ${ALL_DAYS.map(d => {
              const isChecked = selectedDays.some(s => s.toLowerCase().startsWith(d.key.toLowerCase()));
              return `
                <button
                  type="button"
                  class="sosi-day-pill ${isChecked ? 'sosi-day-pill--active' : ''}"
                  data-day="${d.key}"
                  style="flex:1;min-width:38px;height:34px;border-radius:8px;font-size:0.78rem;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;border:1px solid ${isChecked ? '#005930' : 'var(--border-default)'};background:${isChecked ? '#005930' : 'var(--bg-secondary)'};color:${isChecked ? '#ffffff' : 'var(--text-secondary)'};"
                  title="${d.full}"
                >
                  ${d.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Step 3: Daily Shift Hours & Meal Break -->
        <!-- Step 3: Daily Shift Hours & Meal Break -->
        <div style="border-top:1px solid var(--border-default);padding-top:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <label style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:5px;margin:0;color:var(--text-primary);">
              ${icon('sun', 13)} Daily Shift Hours &amp; Meal Break
            </label>
            <span style="font-size:0.7rem;font-weight:600;color:var(--text-tertiary);">4-Point Daily Schedule</span>
          </div>

          <!-- 1. Morning Session (AM) -->
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:12px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:0.75rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:5px;">
                ${icon('sun', 13)} Morning Session (AM)
              </span>
              <span id="sosi-morning-badge" style="font-size:0.7rem;font-weight:700;color:#005930;background:rgba(0,89,48,0.08);padding:2px 8px;border-radius:99px;">
                4.0 hrs AM
              </span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <span style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;display:block;margin-bottom:3px;">
                  Morning Time In <span style="color:var(--color-error);">*</span>
                </span>
                <input
                  type="time"
                  id="sosi-time-in"
                  value="${existingData?.shift_start || '08:00'}"
                  class="form-input"
                  style="width:100%;height:36px;padding:0 8px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-elevated);font-family:inherit;font-size:0.84rem;color:var(--text-primary);"
                />
                <span style="font-size:0.68rem;color:var(--text-tertiary);margin-top:2px;display:block;">Arrival / Work Start</span>
              </div>
              <div>
                <span style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;display:block;margin-bottom:3px;">
                  Morning Time Out <span style="color:var(--color-error);">*</span>
                </span>
                <input
                  type="time"
                  id="sosi-lunch-start"
                  value="${existingData?.lunch_start || '12:00'}"
                  class="form-input"
                  style="width:100%;height:36px;padding:0 8px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-elevated);font-family:inherit;font-size:0.84rem;color:var(--text-primary);"
                />
                <span style="font-size:0.68rem;color:var(--text-tertiary);margin-top:2px;display:block;">Before Lunch Break</span>
              </div>
            </div>
          </div>

          <!-- 2. Midday Lunch Break -->
          <div style="background:rgba(245,158,11,0.06);border:1px dashed rgba(245,158,11,0.35);border-radius:var(--radius-md);padding:9px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
            <label for="sosi-lunch-check" style="font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer;margin:0;color:var(--text-primary);">
              <input type="checkbox" id="sosi-lunch-check" ${existingData?.has_lunch_break !== false ? 'checked' : ''} style="accent-color:#005930;width:15px;height:15px;" />
              <span>${icon('coffee', 13)} Deduct Noon Lunch Break (Unpaid)</span>
            </label>
            <span id="sosi-lunch-pill" style="font-size:0.7rem;font-weight:700;color:#b45309;background:rgba(245,158,11,0.14);padding:2px 8px;border-radius:99px;">
              1 hr break (12:00 PM &ndash; 1:00 PM)
            </span>
          </div>

          <!-- 3. Afternoon Session (PM) -->
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:0.75rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:5px;">
                ${icon('sun', 13)} Afternoon Session (PM)
              </span>
              <span id="sosi-afternoon-badge" style="font-size:0.7rem;font-weight:700;color:#005930;background:rgba(0,89,48,0.08);padding:2px 8px;border-radius:99px;">
                4.0 hrs PM
              </span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <span style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;display:block;margin-bottom:3px;">
                  Afternoon Time In <span style="color:var(--color-error);">*</span>
                </span>
                <input
                  type="time"
                  id="sosi-lunch-end"
                  value="${existingData?.lunch_end || '13:00'}"
                  class="form-input"
                  style="width:100%;height:36px;padding:0 8px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-elevated);font-family:inherit;font-size:0.84rem;color:var(--text-primary);"
                />
                <span style="font-size:0.68rem;color:var(--text-tertiary);margin-top:2px;display:block;">Return After Lunch Break</span>
              </div>
              <div>
                <span style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;display:block;margin-bottom:3px;">
                  Afternoon Time Out <span style="color:var(--color-error);">*</span>
                </span>
                <input
                  type="time"
                  id="sosi-time-out"
                  value="${existingData?.shift_end || '17:00'}"
                  class="form-input"
                  style="width:100%;height:36px;padding:0 8px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-elevated);font-family:inherit;font-size:0.84rem;color:var(--text-primary);"
                />
                <span style="font-size:0.68rem;color:var(--text-tertiary);margin-top:2px;display:block;">Shift End / Day Departure</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Live Calculation Strip -->
          <div id="sosi-calc-card" style="margin-top:10px;padding:10px 14px;background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.18);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div>
              <span id="sosi-calc-daily" style="font-size:0.84rem;font-weight:800;color:#005930;">8.0 hrs / day</span>
              <span style="font-size:0.76rem;color:var(--text-secondary);"> &middot; </span>
              <span id="sosi-calc-weekly" style="font-size:0.84rem;font-weight:800;color:#005930;">40.0 hrs / week</span>
            </div>
            <div id="sosi-calc-end" style="font-size:0.75rem;color:#005930;font-weight:700;">
              Est. Completion: Calculating...
            </div>
          </div>
        </div>

        <!-- Step 4: Overtime Policy -->
        <div style="border-top:1px solid var(--border-default);padding-top:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label for="sosi-ot-check" style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer;margin:0;color:var(--text-primary);">
              <input type="checkbox" id="sosi-ot-check" ${existingData?.allow_overtime ? 'checked' : ''} style="accent-color:#005930;width:16px;height:16px;" />
              <span>${icon('zap', 13)} Allow Student Overtime (OT)</span>
            </label>
          </div>

          <div id="sosi-ot-details" style="display:${existingData?.allow_overtime ? 'block' : 'none'};background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:10px 14px;margin-top:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">
                Maximum allowed OT hours per day:
              </span>
              <div style="display:flex;align-items:center;gap:6px;">
                <input
                  type="number"
                  id="sosi-max-ot"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value="${existingData?.max_overtime_hours || '2.0'}"
                  style="width:64px;height:30px;padding:0 6px;text-align:center;border:1px solid var(--border-default);border-radius:6px;font-size:0.82rem;background:var(--bg-elevated);color:var(--text-primary);"
                />
                <span style="font-size:0.75rem;color:var(--text-secondary);">hrs</span>
              </div>
            </div>
            <p style="font-size:0.7rem;color:var(--text-tertiary);margin:6px 0 0;">
              Overtime hours will require supervisor verification and task endorsement.
            </p>
          </div>
        </div>

        <!-- Step 5: Reporting Instructions -->
        <div style="border-top:1px solid var(--border-default);padding-top:14px;">
          <label style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:5px;margin-bottom:6px;color:var(--text-primary);">
            ${icon('messageSquare', 13)} Reporting Instructions &amp; First-Day Guide <span style="color:var(--color-error);">*</span>
          </label>
          <textarea
            id="sosi-instructions"
            rows="3"
            placeholder="e.g. Report to the HR Department on the 3rd floor at 8:00 AM. Look for Ms. Jane Doe. Bring 2 copies of your endorsement letter and valid school ID. Dress code is smart casual."
            style="width:100%;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--bg-secondary);font-family:inherit;font-size:0.84rem;color:var(--text-primary);resize:vertical;box-sizing:border-box;"
          >${escapeHtml(existingData?.ojt_instructions || '')}</textarea>
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-tertiary);margin-top:4px;">
            <span>Minimum 10 characters</span>
            <span id="sosi-chars">0 / 2000</span>
          </div>
        </div>

        <!-- Error Message -->
        <p id="sosi-error" style="color:var(--color-error);font-size:0.8rem;margin:0;display:none;padding:8px 12px;background:rgba(220,38,38,0.08);border-radius:6px;border:1px solid rgba(220,38,38,0.2);"></p>

      </div>

      <!-- Footer Buttons -->
      <div style="padding:14px 24px;border-top:1px solid var(--border-default);display:flex;align-items:center;justify-content:flex-end;gap:10px;background:var(--bg-secondary);">
        <button type="button" id="sosi-cancel" class="btn btn--outline" style="height:38px;padding:0 18px;">
          Cancel
        </button>
        <button type="button" id="sosi-submit" class="btn btn--primary" style="height:38px;padding:0 22px;gap:6px;background:#005930;border-color:#005930;">
          ${icon('checkCircle', 14)} Confirm OJT Start &amp; Schedule
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  // Element handles
  const dateInput      = modal.querySelector('#sosi-date');
  const daysBadge      = modal.querySelector('#sosi-days-badge');
  const daysGroup      = modal.querySelector('#sosi-days-group');
  const timeInInput    = modal.querySelector('#sosi-time-in');
  const timeOutInput   = modal.querySelector('#sosi-time-out');
  const lunchCheck     = modal.querySelector('#sosi-lunch-check');
  const lunchStartIn   = modal.querySelector('#sosi-lunch-start');
  const lunchEndIn     = modal.querySelector('#sosi-lunch-end');
  const otCheck        = modal.querySelector('#sosi-ot-check');
  const otDetails      = modal.querySelector('#sosi-ot-details');
  const maxOtInput     = modal.querySelector('#sosi-max-ot');
  const instructionsEl = modal.querySelector('#sosi-instructions');
  const charsEl        = modal.querySelector('#sosi-chars');
  const errorEl        = modal.querySelector('#sosi-error');
  const submitBtn      = modal.querySelector('#sosi-submit');

  const calcDailyEl    = modal.querySelector('#sosi-calc-daily');
  const calcWeeklyEl   = modal.querySelector('#sosi-calc-weekly');
  const calcEndEl      = modal.querySelector('#sosi-calc-end');

  // Helper: format 24h time to 12h AM/PM
  function formatTime12(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minPad = String(m).padStart(2, '0');
    return `${hour12}:${minPad} ${period}`;
  }

  // Helper: calculate net daily hours
  function computeDailyHours() {
    const tIn  = timeInInput.value;
    const tOut = timeOutInput.value;
    if (!tIn || !tOut) return 0;

    const [hIn, mIn]   = tIn.split(':').map(Number);
    const [hOut, mOut] = tOut.split(':').map(Number);
    const inMin  = hIn * 60 + mIn;
    const outMin = hOut * 60 + mOut;

    if (outMin <= inMin) return 0;

    let totalMin = outMin - inMin;

    if (lunchCheck.checked) {
      const lStart = lunchStartIn.value;
      const lEnd   = lunchEndIn.value;
      if (lStart && lEnd) {
        const [lh1, lm1] = lStart.split(':').map(Number);
        const [lh2, lm2] = lEnd.split(':').map(Number);
        const lInMin  = lh1 * 60 + lm1;
        const lOutMin = lh2 * 60 + lm2;
        if (lOutMin > lInMin) {
          totalMin -= (lOutMin - lInMin);
        }
      }
    }

    return Math.max(0, Math.round((totalMin / 60) * 100) / 100);
  }

  // Helper: calculate estimated end date
  function computeEstimatedEndDate(startDateStr, daysArr, dailyHrs) {
    if (!startDateStr || !daysArr.length || dailyHrs <= 0) return '—';

    const reqHours = requiredHours || 486;
    const totalDaysNeeded = Math.ceil(reqHours / dailyHrs);
    const cur = new Date(startDateStr);
    const dayKeys = daysArr.map(d => d.toLowerCase().slice(0, 3));

    const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };

    let counted = 0;
    let safety = 0;
    while (counted < totalDaysNeeded && safety < 1000) {
      safety++;
      const dKey = dayMap[cur.getDay()];
      if (dayKeys.includes(dKey)) {
        counted++;
        if (counted >= totalDaysNeeded) break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Recalculate schedule metrics & session badges
  function updateScheduleSummary() {
    const dailyHrs = computeDailyHours();
    const daysCount = selectedDays.length;
    const weeklyHrs = Math.round(dailyHrs * daysCount * 100) / 100;

    calcDailyEl.textContent = `${dailyHrs.toFixed(1)} hrs / day`;
    calcWeeklyEl.textContent = `${weeklyHrs.toFixed(1)} hrs / week`;
    daysBadge.textContent = `${daysCount} day${daysCount !== 1 ? 's' : ''} / week`;

    // 1. Morning Session Badge (Morning Time In -> Morning Time Out)
    const tIn = timeInInput.value;
    const lStart = lunchStartIn.value;
    const morningBadge = modal.querySelector('#sosi-morning-badge');
    if (morningBadge && tIn && lStart) {
      const [h1, m1] = tIn.split(':').map(Number);
      const [h2, m2] = lStart.split(':').map(Number);
      const diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diffMin > 0) {
        morningBadge.textContent = `${(diffMin / 60).toFixed(1)} hrs AM`;
        morningBadge.style.color = '#005930';
        morningBadge.style.background = 'rgba(0,89,48,0.08)';
      } else {
        morningBadge.textContent = 'Invalid AM interval';
        morningBadge.style.color = 'var(--color-error)';
        morningBadge.style.background = 'rgba(239,68,68,0.1)';
      }
    }

    // 2. Lunch Break Duration Pill
    const lEnd = lunchEndIn.value;
    const lunchPill = modal.querySelector('#sosi-lunch-pill');
    if (lunchPill) {
      if (lunchCheck.checked && lStart && lEnd) {
        const [lh1, lm1] = lStart.split(':').map(Number);
        const [lh2, lm2] = lEnd.split(':').map(Number);
        const lMin = (lh2 * 60 + lm2) - (lh1 * 60 + lm1);
        if (lMin > 0) {
          const lHrs = Math.floor(lMin / 60);
          const lMins = lMin % 60;
          const str = lHrs > 0 ? (lMins > 0 ? `${lHrs}h ${lMins}m` : `${lHrs} hr`) : `${lMins} min`;
          lunchPill.textContent = `${str} break (${formatTime12(lStart)} – ${formatTime12(lEnd)})`;
          lunchPill.style.color = '#b45309';
          lunchPill.style.background = 'rgba(245,158,11,0.14)';
        } else {
          lunchPill.textContent = 'Afternoon return must be after lunch start';
          lunchPill.style.color = 'var(--color-error)';
          lunchPill.style.background = 'rgba(239,68,68,0.1)';
        }
      } else if (!lunchCheck.checked) {
        lunchPill.textContent = 'No lunch break deduction (continuous)';
        lunchPill.style.color = 'var(--text-secondary)';
        lunchPill.style.background = 'var(--bg-elevated)';
      }
    }

    // 3. Afternoon Session Badge (Afternoon Time In -> Afternoon Time Out)
    const tOut = timeOutInput.value;
    const afternoonBadge = modal.querySelector('#sosi-afternoon-badge');
    if (afternoonBadge && lEnd && tOut) {
      const [h3, m3] = lEnd.split(':').map(Number);
      const [h4, m4] = tOut.split(':').map(Number);
      const diffMinPm = (h4 * 60 + m4) - (h3 * 60 + m3);
      if (diffMinPm > 0) {
        afternoonBadge.textContent = `${(diffMinPm / 60).toFixed(1)} hrs PM`;
        afternoonBadge.style.color = '#005930';
        afternoonBadge.style.background = 'rgba(0,89,48,0.08)';
      } else {
        afternoonBadge.textContent = 'Invalid PM interval';
        afternoonBadge.style.color = 'var(--color-error)';
        afternoonBadge.style.background = 'rgba(239,68,68,0.1)';
      }
    }

    const estEnd = computeEstimatedEndDate(dateInput.value, selectedDays, dailyHrs);
    const reqHrs = requiredHours || 486;
    const weeksNeeded = weeklyHrs > 0 ? Math.ceil(reqHrs / weeklyHrs) : 0;
    calcEndEl.textContent = `Est. Completion: ${estEnd} (~${weeksNeeded} wks for ${reqHrs}h)`;
  }

  // Event: Preset buttons
  modal.querySelectorAll('.sosi-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.sosi-preset-btn').forEach(b => {
        b.classList.remove('sosi-preset-btn--active');
        b.style.background = 'var(--bg-secondary)';
        b.style.borderColor = 'var(--border-default)';
        b.style.color = 'inherit';
      });
      btn.classList.add('sosi-preset-btn--active');
      btn.style.background = '#005930';
      btn.style.borderColor = '#005930';
      btn.style.color = '#ffffff';

      const p = btn.dataset.preset;
      if (p === 'mon-fri') {
        selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      } else if (p === 'mon-sat') {
        selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      }

      // Update pills
      modal.querySelectorAll('.sosi-day-pill').forEach(pill => {
        const isSel = selectedDays.includes(pill.dataset.day);
        pill.style.background = isSel ? '#005930' : 'var(--bg-secondary)';
        pill.style.borderColor = isSel ? '#005930' : 'var(--border-default)';
        pill.style.color = isSel ? '#ffffff' : 'var(--text-secondary)';
      });

      updateScheduleSummary();
    });
  });

  // Event: Individual day pills toggle
  daysGroup.querySelectorAll('.sosi-day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const d = pill.dataset.day;
      if (selectedDays.includes(d)) {
        selectedDays = selectedDays.filter(k => k !== d);
        pill.style.background = 'var(--bg-secondary)';
        pill.style.borderColor = 'var(--border-default)';
        pill.style.color = 'var(--text-secondary)';
      } else {
        selectedDays.push(d);
        pill.style.background = '#005930';
        pill.style.borderColor = '#005930';
        pill.style.color = '#ffffff';
      }

      // De-select quick presets if non-standard
      modal.querySelectorAll('.sosi-preset-btn').forEach(b => {
        b.style.background = 'var(--bg-secondary)';
        b.style.borderColor = 'var(--border-default)';
        b.style.color = 'inherit';
      });

      updateScheduleSummary();
    });
  });

  // Event: Time inputs change
  [dateInput, timeInInput, timeOutInput, lunchStartIn, lunchEndIn].forEach(input => {
    input.addEventListener('input', updateScheduleSummary);
    input.addEventListener('change', updateScheduleSummary);
  });

  // Event: Lunch break toggle
  lunchCheck.addEventListener('change', () => {
    updateScheduleSummary();
  });

  // Event: Overtime toggle
  otCheck.addEventListener('change', () => {
    otDetails.style.display = otCheck.checked ? 'block' : 'none';
  });

  // Event: Instructions character counter
  instructionsEl.addEventListener('input', () => {
    charsEl.textContent = `${instructionsEl.value.length} / 2000`;
  });

  // Close handlers
  const close = () => modal.remove();
  modal.querySelector('#sosi-close').addEventListener('click', close);
  modal.querySelector('#sosi-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // Initial calculation run
  updateScheduleSummary();

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    errorEl.style.display = 'none';

    const startDate    = dateInput.value.trim();
    const instructions = instructionsEl.value.trim();
    const shiftStart   = timeInInput.value;
    const shiftEnd     = timeOutInput.value;
    const hasLunch     = lunchCheck.checked;
    const lunchStart   = lunchStartIn.value;
    const lunchEnd     = lunchEndIn.value;
    const allowOt      = otCheck.checked;
    const maxOt        = allowOt ? parseFloat(maxOtInput.value) || 2.0 : 0;
    const dailyHrs     = computeDailyHours();
    const weeklyHrs    = Math.round(dailyHrs * selectedDays.length * 100) / 100;

    if (!startDate) {
      showErr('Please select an official OJT start date.');
      return;
    }
    if (!selectedDays.length) {
      showErr('Please select at least one working day for the weekly schedule.');
      return;
    }
    if (!shiftStart || !shiftEnd || !lunchStart || !lunchEnd) {
      showErr('Please fill in all 4 schedule times: Morning Time In/Out and Afternoon Time In/Out.');
      return;
    }
    if (dailyHrs <= 0) {
      showErr('Shift schedule must have chronological times and provide positive working hours.');
      return;
    }
    if (!instructions || instructions.length < 10) {
      showErr('Please enter reporting instructions for the student (at least 10 characters).');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Confirming...`;

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/set-ojt-start/${interestId}`, {
        ojt_start_date:     startDate,
        ojt_instructions:   instructions,
        schedule_days:      selectedDays,
        shift_start:        shiftStart,
        shift_end:          shiftEnd,
        lunch_start:        hasLunch ? lunchStart : null,
        lunch_end:          hasLunch ? lunchEnd : null,
        has_lunch_break:    hasLunch,
        daily_hours:        dailyHrs,
        weekly_hours:       weeklyHrs,
        allow_overtime:     allowOt,
        max_overtime_hours: maxOt,
      });

      if (!res?.success) {
        showErr(res?.message || 'Failed to save OJT schedule. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm OJT Start &amp; Schedule`;
        return;
      }

      close();
      if (typeof onSuccess === 'function') {
        onSuccess(res, {
          startDate,
          instructions,
          selectedDays,
          shiftStart,
          shiftEnd,
          lunchStart,
          lunchEnd,
          hasLunch,
          dailyHrs,
          weeklyHrs,
          allowOt,
          maxOt,
        });
      }
    } catch (err) {
      showErr(err.message || 'Network error while saving schedule. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm OJT Start &amp; Schedule`;
    }
  });

  function showErr(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
