/* ===========================
   Supervisor Hours Modal — Supervisor Portal
   Single & Batch Add, Edit, and Remove Supervisor Hours (100h Events/Seminars pool)
   =========================== */

import { icon } from './icons.js';
import { apiPost, apiPut, apiDelete } from '../api/client.js';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtHours(val) {
  const n = Number(val || 0);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const REASON_PRESETS = [
  'Attended University / Department OJT Seminar',
  'Attended Industry Career Talk / Webinar',
  'Attended OJT General Orientation & Briefing',
  'Participated in Institutional Skills Workshop',
];

const HOUR_PRESETS = [2, 4, 8, 16];

function getSupHours(t) {
  return Number(t?.supervisorHours ?? 0);
}

function getSupCap(t) {
  return Number(t?.supervisorRequiredHours ?? 100) || 100;
}

function getSupRemaining(t) {
  return Math.max(0, Number((getSupCap(t) - getSupHours(t)).toFixed(2)));
}

function isStudentEligible(t) {
  if (!t) return { ok: false, reason: 'Invalid student' };
  if (t.approval_status === 'pending') return { ok: false, reason: 'Pending Approval' };
  if (t.is_pulled_out) return { ok: false, reason: 'Pulled Out' };
  if (t.emergency_status === 'withdrawn_emergency') return { ok: false, reason: 'Withdrawn' };
  if (!t.isEligibleForSupervisorHours && t.status !== 'Active OJT') {
    return { ok: false, reason: t.status || 'Not Active OJT' };
  }
  if (getSupRemaining(t) <= 0) {
    return { ok: false, reason: 'Maxed (100/100h)' };
  }
  return { ok: true, reason: null };
}

/**
 * Open the Add / Batch Add Supervisor Hours Modal.
 */
export function openSupervisorHoursModal({
  mode = 'single',
  student = null,
  allTrainees = [],
  selectedStudents = [],
  onSaved,
} = {}) {
  const existing = document.getElementById('sup-hours-modal');
  if (existing) existing.remove();

  const isBatch = mode === 'batch' || !student;

  // Build eligible / ineligible lists for Batch mode
  const traineeList = Array.isArray(allTrainees) && allTrainees.length > 0
    ? allTrainees
    : (Array.isArray(selectedStudents) ? selectedStudents : []);

  const preselectedIds = new Set(
    (Array.isArray(selectedStudents) ? selectedStudents : [])
      .filter(s => isStudentEligible(s).ok)
      .map(s => Number(s.id))
  );

  // If opened in batch mode with no pre-selected eligible rows, preselect all eligible active trainees
  const selectedIds = new Set(preselectedIds);
  if (isBatch && selectedIds.size === 0) {
    traineeList.forEach(t => {
      if (isStudentEligible(t).ok) selectedIds.add(Number(t.id));
    });
  }

  const distinctSections = Array.from(new Set(
    traineeList.map(t => t.section).filter(s => s && s !== '—')
  )).sort();

  const distinctCompanies = Array.from(new Set(
    traineeList.filter(t => isStudentEligible(t).ok).map(t => t.company).filter(c => c && c !== '—')
  )).sort();

  const singleRemaining = student ? getSupRemaining(student) : 100;
  const singleCap = student ? getSupCap(student) : 100;
  const singleCurrent = student ? getSupHours(student) : 0;
  const singleCompanyHrs = Number(student?.companyHours ?? 0);
  const singleCompanyCap = Number(student?.companyRequiredHours ?? 500) || 500;
  const singleEligibility = student ? isStudentEligible(student) : { ok: true };

  const modal = document.createElement('div');
  modal.id = 'sup-hours-modal';
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10060;background:rgba(15,23,42,0.68);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;';

  modal.innerHTML = `
    <div class="modal modal--visible" role="dialog" aria-modal="true" style="max-width:${isBatch ? '680px' : '540px'};width:100%;padding:0;overflow:hidden;border-radius:16px;background:var(--bg-elevated,#fff);box-shadow:var(--shadow-2xl);border:1px solid var(--border-default,#e2e8f0);display:flex;flex-direction:column;max-height:92vh;">
      <!-- Emerald Header -->
      <div style="background:linear-gradient(135deg,#005930,#047857);padding:18px 22px;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('award', 20)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.05rem;font-weight:800;color:#fff;line-height:1.25;">
              ${isBatch ? 'Batch Add Supervisor Hours' : 'Add Supervisor Hours'}
            </h3>
            <p style="margin:3px 0 0;font-size:0.78rem;color:rgba(255,255,255,0.88);">
              ${isBatch
                ? 'Credit events, seminars, or orientations (100h Supervisor Allocation)'
                : `${esc(student.name)} · ${esc(student.studentId || 'Active Trainee')}`}
            </p>
          </div>
        </div>
        <button type="button" id="sh-close" style="background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          ${icon('x', 16)}
        </button>
      </div>

      <!-- Body -->
      <div style="padding:20px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;flex:1;min-height:0;">
        ${!isBatch ? `
          <!-- Single Student Balance Summary -->
          <div style="padding:14px 16px;border-radius:12px;background:var(--bg-secondary,#f8fafc);border:1px solid var(--border-default,#e2e8f0);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
              <div>
                <div style="font-weight:700;font-size:0.94rem;color:var(--text-primary);">${esc(student.name)}</div>
                <div style="font-size:0.78rem;color:var(--text-secondary);">
                  ${esc(student.company && student.company !== '—' ? student.company : 'Host Company')} ${student.section && student.section !== '—' ? `· Sec ${esc(student.section)}` : ''}
                </div>
              </div>
              <span style="font-size:0.76rem;font-weight:700;padding:4px 10px;border-radius:99px;background:rgba(0,89,48,0.1);color:#005930;">
                Company: ${fmtHours(singleCompanyHrs)} / ${singleCompanyCap}h
              </span>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;margin-bottom:5px;">
              <span style="font-weight:600;color:var(--text-secondary);">Supervisor Hours Allocation</span>
              <strong style="color:#0284C7;">${fmtHours(singleCurrent)} / ${singleCap} hrs (${fmtHours(singleRemaining)}h remaining)</strong>
            </div>
            <div style="height:8px;border-radius:99px;background:var(--border-default,#e2e8f0);overflow:hidden;">
              <div style="height:100%;width:${Math.min(100, Math.round((singleCurrent / singleCap) * 100))}%;background:#0284C7;border-radius:99px;"></div>
            </div>
          </div>

          ${!singleEligibility.ok ? `
            <div style="padding:12px 14px;border-radius:10px;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;font-size:0.83rem;display:flex;align-items:center;gap:8px;">
              ${icon('alertTriangle', 16)}
              <span><strong>Cannot add hours:</strong> ${esc(singleEligibility.reason)}.</span>
            </div>
          ` : ''}
        ` : `
          <!-- Batch Recipient Picker with Filters -->
          <div style="border:1px solid var(--border-default,#e2e8f0);border-radius:12px;overflow:hidden;background:var(--bg-secondary,#f8fafc);">
            <div style="padding:12px 14px;border-bottom:1px solid var(--border-default,#e2e8f0);display:flex;flex-direction:column;gap:10px;background:var(--bg-card,#fff);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div style="font-size:0.8rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                  ${icon('users', 15)} Select Active OJT Trainees
                  <span id="sh-selected-pill" style="font-size:0.74rem;padding:2px 8px;border-radius:99px;background:rgba(0,89,48,0.1);color:#005930;">0 selected</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <button type="button" class="btn btn--outline btn--xs" id="sh-select-all-active" style="font-size:0.74rem;font-weight:700;color:#005930;border-color:rgba(0,89,48,0.35);">Select All Eligible</button>
                  <button type="button" class="btn btn--outline btn--xs" id="sh-select-filtered" style="font-size:0.74rem;font-weight:600;">Select Filtered</button>
                  <button type="button" class="btn btn--ghost btn--xs" id="sh-clear-selection" style="font-size:0.74rem;">Clear</button>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px;">
                <input type="text" id="sh-filter-search" placeholder="Search name, ID, company…" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.8rem;color:var(--text-primary);box-sizing:border-box;" />
                <select id="sh-filter-section" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.8rem;color:var(--text-primary);">
                  <option value="">All Sections</option>
                  ${distinctSections.map(s => `<option value="${esc(s)}">Section ${esc(s)}</option>`).join('')}
                </select>
                <select id="sh-filter-company" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.8rem;color:var(--text-primary);">
                  <option value="">All Companies</option>
                  ${distinctCompanies.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
              </div>

              <label style="display:inline-flex;align-items:center;gap:6px;font-size:0.76rem;color:var(--text-secondary);cursor:pointer;user-select:none;">
                <input type="checkbox" id="sh-only-eligible" checked style="accent-color:#005930;cursor:pointer;" />
                <span>Show only eligible active trainees (${traineeList.filter(t => isStudentEligible(t).ok).length} of ${traineeList.length})</span>
              </label>
            </div>

            <div id="sh-trainee-list" style="max-height:190px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:5px;"></div>
          </div>
          <div id="sh-batch-cap-notice" style="display:none;padding:9px 12px;border-radius:9px;background:#FFFBEB;border:1px solid #FDE68A;font-size:0.78rem;color:#92400E;"></div>
        `}

        <!-- Form Fields -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label for="sh-hours" style="display:block;font-size:0.8rem;font-weight:700;color:var(--text-primary);margin-bottom:5px;">
              Hours to Credit <span style="color:#EF4444;">*</span>
            </label>
            <input
              type="number"
              id="sh-hours"
              min="0.25"
              max="${isBatch ? 100 : Math.max(0.25, singleRemaining)}"
              step="0.25"
              placeholder="e.g., 4"
              value="4"
              ${!isBatch && !singleEligibility.ok ? 'disabled' : ''}
              style="width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.88rem;font-weight:700;color:var(--text-primary);box-sizing:border-box;"
            />
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;">
              ${HOUR_PRESETS.map(h => `
                <button type="button" class="sh-hr-chip" data-hrs="${h}" style="font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:99px;border:1px solid var(--border-default,#cbd5e1);background:var(--bg-card,#fff);color:var(--text-secondary);cursor:pointer;">+${h}h</button>
              `).join('')}
              ${!isBatch && singleRemaining > 0 && singleRemaining < 16 ? `
                <button type="button" class="sh-hr-chip" data-hrs="${singleRemaining}" style="font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:99px;border:1px solid rgba(0,89,48,0.35);background:rgba(0,89,48,0.08);color:#005930;cursor:pointer;">Fill (${fmtHours(singleRemaining)}h)</button>
              ` : ''}
            </div>
          </div>

          <div>
            <label for="sh-date" style="display:block;font-size:0.8rem;font-weight:700;color:var(--text-primary);margin-bottom:5px;">
              Event / Activity Date <span style="color:#EF4444;">*</span>
            </label>
            <input
              type="date"
              id="sh-date"
              value="${todayIsoDate()}"
              ${!isBatch && !singleEligibility.ok ? 'disabled' : ''}
              style="width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.85rem;color:var(--text-primary);box-sizing:border-box;"
            />
          </div>
        </div>

        <div>
          <label for="sh-title" style="display:block;font-size:0.8rem;font-weight:700;color:var(--text-primary);margin-bottom:5px;">
            Event / Seminar Title <span style="font-weight:400;color:var(--text-tertiary);">(optional)</span>
          </label>
          <input
            type="text"
            id="sh-title"
            maxlength="150"
            placeholder="e.g., CHMSU IT Career & Innovation Seminar 2026"
            ${!isBatch && !singleEligibility.ok ? 'disabled' : ''}
            style="width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.84rem;color:var(--text-primary);box-sizing:border-box;"
          />
        </div>

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <label for="sh-reason" style="font-size:0.8rem;font-weight:700;color:var(--text-primary);">
              Reason / Label <span style="color:#EF4444;">*</span>
            </label>
            <span style="font-size:0.72rem;color:var(--text-tertiary);">Recorded in trainee &amp; student history</span>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px;">
            ${REASON_PRESETS.map(p => `
              <button type="button" class="sh-reason-chip" data-reason="${esc(p)}" style="font-size:0.72rem;font-weight:600;padding:3px 9px;border-radius:99px;border:1px solid var(--border-default,#cbd5e1);background:var(--bg-card,#fff);color:var(--text-secondary);cursor:pointer;">${esc(p)}</button>
            `).join('')}
          </div>
          <textarea
            id="sh-reason"
            rows="2"
            maxlength="1000"
            placeholder="Describe the seminar, event, or justification for crediting these hours..."
            ${!isBatch && !singleEligibility.ok ? 'disabled' : ''}
            style="width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-family:inherit;font-size:0.84rem;color:var(--text-primary);resize:vertical;box-sizing:border-box;"
          ></textarea>
        </div>

        ${!isBatch && singleEligibility.ok ? `
          <div id="sh-single-preview" style="padding:10px 12px;border-radius:9px;background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.2);font-size:0.8rem;color:#0369A1;"></div>
        ` : ''}

        <div id="sh-error" style="display:none;padding:9px 12px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:0.8rem;font-weight:600;"></div>
      </div>

      <!-- Footer -->
      <div style="padding:14px 22px;border-top:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);display:flex;justify-content:flex-end;gap:10px;flex-shrink:0;">
        <button type="button" class="btn btn--outline btn--sm" id="sh-cancel" style="font-weight:600;">Cancel</button>
        <button
          type="button"
          class="btn btn--primary btn--sm"
          id="sh-submit"
          ${!isBatch && !singleEligibility.ok ? 'disabled' : ''}
          style="gap:6px;background:#005930;border-color:#005930;font-weight:700;"
        >
          ${icon('plus', 14)} <span id="sh-submit-label">${isBatch ? 'Add Hours' : 'Add Supervisor Hours'}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#sh-close')?.addEventListener('click', close);
  modal.querySelector('#sh-cancel')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const hoursInput = modal.querySelector('#sh-hours');
  const dateInput = modal.querySelector('#sh-date');
  const titleInput = modal.querySelector('#sh-title');
  const reasonInput = modal.querySelector('#sh-reason');
  const errEl = modal.querySelector('#sh-error');
  const submitBtn = modal.querySelector('#sh-submit');
  const submitLabel = modal.querySelector('#sh-submit-label');

  // Hour preset chips
  modal.querySelectorAll('.sh-hr-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (hoursInput.disabled) return;
      hoursInput.value = chip.dataset.hrs;
      updateLivePreview();
    });
  });

  // Reason preset chips
  modal.querySelectorAll('.sh-reason-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (reasonInput.disabled) return;
      reasonInput.value = chip.dataset.reason;
      reasonInput.focus();
    });
  });

  // Batch checklist & filtering state
  let currentFilteredList = [];
  if (isBatch) {
    const searchEl = modal.querySelector('#sh-filter-search');
    const secEl = modal.querySelector('#sh-filter-section');
    const compEl = modal.querySelector('#sh-filter-company');
    const onlyEligEl = modal.querySelector('#sh-only-eligible');
    const listWrap = modal.querySelector('#sh-trainee-list');
    const selectedPill = modal.querySelector('#sh-selected-pill');
    const capNotice = modal.querySelector('#sh-batch-cap-notice');

    const getFilteredTrainees = () => {
      const q = (searchEl?.value || '').toLowerCase().trim();
      const sec = secEl?.value || '';
      const comp = compEl?.value || '';
      const onlyElig = onlyEligEl ? onlyEligEl.checked : true;

      return traineeList.filter(t => {
        if (onlyElig && !isStudentEligible(t).ok) return false;
        if (sec && t.section !== sec) return false;
        if (comp && t.company !== comp) return false;
        if (q) {
          const match = (t.name && t.name.toLowerCase().includes(q))
            || (t.studentId && String(t.studentId).toLowerCase().includes(q))
            || (t.company && t.company.toLowerCase().includes(q))
            || (t.section && String(t.section).toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      });
    };

    const updateBatchSummaryUi = () => {
      const hrs = Number(hoursInput?.value || 0);
      const count = selectedIds.size;
      if (selectedPill) selectedPill.textContent = `${count} selected`;
      if (submitLabel) submitLabel.textContent = count > 0 ? `Add Hours to ${count} Trainee(s)` : 'Select Trainees';
      if (submitBtn) submitBtn.disabled = count === 0;

      if (capNotice) {
        if (hrs > 0 && count > 0) {
          const cappedStudents = traineeList.filter(t =>
            selectedIds.has(Number(t.id)) && getSupRemaining(t) < hrs && getSupRemaining(t) > 0
          );
          if (cappedStudents.length > 0) {
            capNotice.style.display = 'block';
            capNotice.innerHTML = `<strong>${cappedStudents.length} trainee(s) near 100h cap:</strong> ${cappedStudents.slice(0, 3).map(s => `${esc(s.name)} (+${fmtHours(getSupRemaining(s))}h max)`).join(', ')}${cappedStudents.length > 3 ? ` and ${cappedStudents.length - 3} more` : ''} will be automatically capped at 100 supervisor hours.`;
          } else {
            capNotice.style.display = 'none';
          }
        } else {
          capNotice.style.display = 'none';
        }
      }
    };

    const renderTraineeChecklist = () => {
      currentFilteredList = getFilteredTrainees();
      const hrs = Number(hoursInput?.value || 0);

      if (!currentFilteredList.length) {
        listWrap.innerHTML = `<div style="padding:18px;text-align:center;font-size:0.8rem;color:var(--text-tertiary);">No trainees match these filters.</div>`;
        updateBatchSummaryUi();
        return;
      }

      listWrap.innerHTML = currentFilteredList.map(t => {
        const elig = isStudentEligible(t);
        const idNum = Number(t.id);
        const checked = elig.ok && selectedIds.has(idNum);
        const supHrs = getSupHours(t);
        const supCap = getSupCap(t);
        const rem = getSupRemaining(t);
        const willCap = elig.ok && checked && hrs > 0 && hrs > rem;

        return `
          <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:8px;border:1px solid ${checked ? 'rgba(0,89,48,0.35)' : 'var(--border-default,#e2e8f0)'};background:${checked ? 'rgba(0,89,48,0.04)' : (elig.ok ? 'var(--bg-card,#fff)' : 'rgba(148,163,184,0.08)')};cursor:${elig.ok ? 'pointer' : 'not-allowed'};opacity:${elig.ok ? '1' : '0.68'};">
            <div style="display:flex;align-items:center;gap:9px;min-width:0;">
              <input type="checkbox" class="sh-batch-cb" data-id="${idNum}" ${checked ? 'checked' : ''} ${elig.ok ? '' : 'disabled'} style="accent-color:#005930;width:15px;height:15px;cursor:${elig.ok ? 'pointer' : 'not-allowed'};flex-shrink:0;" />
              <div style="min-width:0;">
                <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.name)}</div>
                <div style="font-size:0.72rem;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${t.section && t.section !== '—' ? `Sec ${esc(t.section)} · ` : ''}${esc(t.company && t.company !== '—' ? t.company : 'Undeployed')}
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              ${willCap ? `<span style="font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:6px;background:#FEF3C7;color:#92400E;">Capped +${fmtHours(rem)}h</span>` : ''}
              ${!elig.ok ? `<span style="font-size:0.68rem;font-weight:700;padding:2px 7px;border-radius:6px;background:#FEE2E2;color:#991B1B;">${esc(elig.reason)}</span>` : ''}
              <span style="font-size:0.74rem;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(2,132,199,0.1);color:#0369A1;">
                ${fmtHours(supHrs)}/${supCap}h
              </span>
            </div>
          </label>`;
      }).join('');

      listWrap.querySelectorAll('.sh-batch-cb').forEach(cb => {
        cb.addEventListener('change', () => {
          const id = Number(cb.dataset.id);
          if (cb.checked) selectedIds.add(id);
          else selectedIds.delete(id);
          renderTraineeChecklist();
        });
      });

      updateBatchSummaryUi();
    };

    modal.querySelector('#sh-select-all-active')?.addEventListener('click', () => {
      traineeList.forEach(t => { if (isStudentEligible(t).ok) selectedIds.add(Number(t.id)); });
      renderTraineeChecklist();
    });
    modal.querySelector('#sh-select-filtered')?.addEventListener('click', () => {
      currentFilteredList.forEach(t => { if (isStudentEligible(t).ok) selectedIds.add(Number(t.id)); });
      renderTraineeChecklist();
    });
    modal.querySelector('#sh-clear-selection')?.addEventListener('click', () => {
      selectedIds.clear();
      renderTraineeChecklist();
    });

    searchEl?.addEventListener('input', renderTraineeChecklist);
    secEl?.addEventListener('change', renderTraineeChecklist);
    compEl?.addEventListener('change', renderTraineeChecklist);
    onlyEligEl?.addEventListener('change', renderTraineeChecklist);

    renderTraineeChecklist();
  }

  function updateLivePreview() {
    if (isBatch) {
      // Re-run cap notice and badges
      const listWrap = modal.querySelector('#sh-trainee-list');
      if (listWrap) {
        const searchEl = modal.querySelector('#sh-filter-search');
        searchEl?.dispatchEvent(new Event('input'));
      }
      return;
    }
    const previewEl = modal.querySelector('#sh-single-preview');
    if (!previewEl || !singleEligibility.ok) return;
    const hrs = Number(hoursInput.value || 0);
    if (!hrs || hrs <= 0) {
      previewEl.textContent = 'Enter positive hours to preview updated progress.';
      return;
    }
    const nextSup = Number((singleCurrent + hrs).toFixed(2));
    const nextTotal = Number((singleCompanyHrs + Math.min(singleCap, nextSup)).toFixed(2));
    if (hrs > singleRemaining) {
      previewEl.style.background = '#FEF2F2';
      previewEl.style.borderColor = '#FECACA';
      previewEl.style.color = '#991B1B';
      previewEl.innerHTML = `<strong>Exceeds 100h limit:</strong> Only <strong>${fmtHours(singleRemaining)} hrs</strong> remaining in supervisor allocation.`;
    } else {
      previewEl.style.background = 'rgba(2,132,199,0.06)';
      previewEl.style.borderColor = 'rgba(2,132,199,0.2)';
      previewEl.style.color = '#0369A1';
      previewEl.innerHTML = `After adding: Supervisor <strong>${fmtHours(singleCurrent)} → ${fmtHours(nextSup)} / ${singleCap} hrs</strong> · Total OJT: <strong>${fmtHours(nextTotal)} / 600 hrs</strong>`;
    }
  }

  hoursInput?.addEventListener('input', updateLivePreview);
  if (!isBatch) updateLivePreview();

  submitBtn?.addEventListener('click', async () => {
    errEl.style.display = 'none';
    const hrs = Number(hoursInput.value);
    const reason = reasonInput.value.trim();
    const title = titleInput.value.trim();
    const activityDate = dateInput.value;

    if (!hrs || !Number.isFinite(hrs) || hrs <= 0) {
      errEl.textContent = 'Please enter a valid number of hours greater than 0.';
      errEl.style.display = 'block';
      hoursInput.focus();
      return;
    }
    if (!isBatch && hrs > singleRemaining) {
      errEl.textContent = `Cannot add ${fmtHours(hrs)} hrs. Only ${fmtHours(singleRemaining)} supervisor hrs remaining.`;
      errEl.style.display = 'block';
      hoursInput.focus();
      return;
    }
    if (!reason) {
      errEl.textContent = 'Please enter a reason or label for crediting these hours.';
      errEl.style.display = 'block';
      reasonInput.focus();
      return;
    }
    if (isBatch && selectedIds.size === 0) {
      errEl.textContent = 'Please select at least one eligible active trainee.';
      errEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    const origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `${icon('clock', 14)} Saving…`;

    try {
      const payload = {
        hours: hrs,
        title: title || null,
        reason,
        activity_date: activityDate || todayIsoDate(),
      };

      const res = isBatch
        ? await apiPost('/supervisor/supervisor-hours/batch', { ...payload, student_ids: Array.from(selectedIds) }, { returnErrorBody: true })
        : await apiPost(`/supervisor/trainees/${student.id}/supervisor-hours`, payload, { returnErrorBody: true });

      if (!res?.success) {
        errEl.textContent = res?.message || 'Unable to credit supervisor hours. Please verify inputs.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
        return;
      }

      close();
      if (typeof onSaved === 'function') onSaved(res);
    } catch (err) {
      errEl.textContent = err?.message || 'Network error while saving supervisor hours.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  });
}

/**
 * Open the Edit Supervisor Hour Entry Modal.
 */
export function openEditSupervisorHourModal({ student, entry, onSaved } = {}) {
  const existing = document.getElementById('sup-hours-edit-modal');
  if (existing) existing.remove();

  const supCap = getSupCap(student);
  const currentTotal = getSupHours(student);
  const entryHrs = Number(entry?.hours || 0);
  const otherHours = Math.max(0, Number((currentTotal - entryHrs).toFixed(2)));
  const maxAllowed = Math.max(0.25, Number((supCap - otherHours).toFixed(2)));

  const modal = document.createElement('div');
  modal.id = 'sup-hours-edit-modal';
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10070;background:rgba(15,23,42,0.68);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;';

  modal.innerHTML = `
    <div class="modal modal--visible" role="dialog" aria-modal="true" style="max-width:480px;width:100%;padding:0;overflow:hidden;border-radius:16px;background:var(--bg-elevated,#fff);box-shadow:var(--shadow-2xl);border:1px solid var(--border-default,#e2e8f0);">
      <div style="background:linear-gradient(135deg,#0284C7,#0369A1);padding:16px 20px;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;">
            ${icon('edit', 18)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1rem;font-weight:800;color:#fff;">Edit Supervisor Hour Entry</h3>
            <p style="margin:2px 0 0;font-size:0.76rem;color:rgba(255,255,255,0.88);">${esc(student?.name || 'Trainee')} · Max allowed: ${fmtHours(maxAllowed)}h</p>
          </div>
        </div>
        <button type="button" id="she-close" style="background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;">${icon('x', 15)}</button>
      </div>

      <div style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label for="she-hours" style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Hours <span style="color:#EF4444;">*</span></label>
            <input type="number" id="she-hours" min="0.25" max="${maxAllowed}" step="0.25" value="${entryHrs}" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.86rem;font-weight:700;color:var(--text-primary);box-sizing:border-box;" />
          </div>
          <div>
            <label for="she-date" style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Activity Date <span style="color:#EF4444;">*</span></label>
            <input type="date" id="she-date" value="${esc(entry?.activity_date || todayIsoDate())}" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.84rem;color:var(--text-primary);box-sizing:border-box;" />
          </div>
        </div>

        <div>
          <label for="she-title" style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Event / Seminar Title <span style="font-weight:400;color:var(--text-tertiary);">(optional)</span></label>
          <input type="text" id="she-title" maxlength="150" value="${esc(entry?.title || '')}" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-size:0.84rem;color:var(--text-primary);box-sizing:border-box;" />
        </div>

        <div>
          <label for="she-reason" style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Reason / Label <span style="color:#EF4444;">*</span></label>
          <textarea id="she-reason" rows="3" maxlength="1000" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-family:inherit;font-size:0.84rem;color:var(--text-primary);resize:vertical;box-sizing:border-box;">${esc(entry?.reason || '')}</textarea>
        </div>

        <div id="she-error" style="display:none;padding:8px 10px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:0.78rem;font-weight:600;"></div>
      </div>

      <div style="padding:12px 20px;border-top:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);display:flex;justify-content:flex-end;gap:8px;">
        <button type="button" class="btn btn--outline btn--sm" id="she-cancel">Cancel</button>
        <button type="button" class="btn btn--primary btn--sm" id="she-save" style="background:#0284C7;border-color:#0284C7;font-weight:700;gap:5px;">
          ${icon('check', 14)} Save Changes
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#she-close')?.addEventListener('click', close);
  modal.querySelector('#she-cancel')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const saveBtn = modal.querySelector('#she-save');
  const errEl = modal.querySelector('#she-error');

  saveBtn?.addEventListener('click', async () => {
    errEl.style.display = 'none';
    const hrs = Number(modal.querySelector('#she-hours').value);
    const title = modal.querySelector('#she-title').value.trim();
    const reason = modal.querySelector('#she-reason').value.trim();
    const activityDate = modal.querySelector('#she-date').value;

    if (!hrs || !Number.isFinite(hrs) || hrs <= 0) {
      errEl.textContent = 'Hours must be greater than 0.';
      errEl.style.display = 'block';
      return;
    }
    if (hrs > maxAllowed) {
      errEl.textContent = `Cannot exceed ${fmtHours(maxAllowed)} hrs for this entry (100h cap).`;
      errEl.style.display = 'block';
      return;
    }
    if (!reason) {
      errEl.textContent = 'Reason / label is required.';
      errEl.style.display = 'block';
      return;
    }

    saveBtn.disabled = true;
    const orig = saveBtn.innerHTML;
    saveBtn.innerHTML = `${icon('clock', 14)} Saving…`;

    const res = await apiPut(`/supervisor/supervisor-hours/${entry.id}`, {
      hours: hrs,
      title: title || null,
      reason,
      activity_date: activityDate || todayIsoDate(),
    }, { returnErrorBody: true });

    if (!res?.success) {
      errEl.textContent = res?.message || 'Failed to update supervisor hour entry.';
      errEl.style.display = 'block';
      saveBtn.disabled = false;
      saveBtn.innerHTML = orig;
      return;
    }

    close();
    if (typeof onSaved === 'function') onSaved(res);
  });
}

/**
 * Open a confirmation modal to remove an erroneous supervisor hour entry.
 */
export function openDeleteSupervisorHourConfirm({ student, entry, onDeleted } = {}) {
  const existing = document.getElementById('sup-hours-del-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'sup-hours-del-modal';
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10070;background:rgba(15,23,42,0.68);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;';

  modal.innerHTML = `
    <div class="modal modal--visible" role="dialog" aria-modal="true" style="max-width:430px;width:100%;padding:0;overflow:hidden;border-radius:16px;background:var(--bg-elevated,#fff);box-shadow:var(--shadow-2xl);border:1px solid var(--border-default,#e2e8f0);">
      <div style="background:linear-gradient(135deg,#DC2626,#E11D48);padding:16px 20px;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;">
            ${icon('trash2', 18)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1rem;font-weight:800;color:#fff;">Remove Supervisor Hours</h3>
            <p style="margin:2px 0 0;font-size:0.76rem;color:rgba(255,255,255,0.88);">${esc(student?.name || 'Trainee')}</p>
          </div>
        </div>
        <button type="button" id="shd-close" style="background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;">${icon('x', 15)}</button>
      </div>

      <div style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;">
        <p style="margin:0;font-size:0.86rem;color:var(--text-primary);line-height:1.45;">
          Are you sure you want to remove <strong>-${fmtHours(entry?.hours)} hrs</strong> from <strong>${esc(student?.name || 'this student')}</strong>?
        </p>
        <div style="padding:10px 12px;border-radius:10px;background:var(--bg-secondary,#f8fafc);border:1px solid var(--border-default,#e2e8f0);font-size:0.8rem;color:var(--text-secondary);">
          ${entry?.title ? `<div style="font-weight:700;color:var(--text-primary);margin-bottom:2px;">${esc(entry.title)}</div>` : ''}
          <div>${esc(entry?.reason || '—')}</div>
          <div style="font-size:0.74rem;color:var(--text-tertiary);margin-top:4px;">Date: ${esc(entry?.activity_date_fmt || entry?.activity_date || '—')}</div>
        </div>
        <div id="shd-error" style="display:none;padding:8px 10px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:0.78rem;font-weight:600;"></div>
      </div>

      <div style="padding:12px 20px;border-top:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);display:flex;justify-content:flex-end;gap:8px;">
        <button type="button" class="btn btn--outline btn--sm" id="shd-cancel">Cancel</button>
        <button type="button" class="btn btn--sm" id="shd-confirm" style="background:#DC2626;color:#fff;border-color:#DC2626;font-weight:700;gap:5px;">
          ${icon('trash2', 14)} Remove Entry
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#shd-close')?.addEventListener('click', close);
  modal.querySelector('#shd-cancel')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const confirmBtn = modal.querySelector('#shd-confirm');
  const errEl = modal.querySelector('#shd-error');

  confirmBtn?.addEventListener('click', async () => {
    errEl.style.display = 'none';
    confirmBtn.disabled = true;
    const orig = confirmBtn.innerHTML;
    confirmBtn.innerHTML = `${icon('clock', 14)} Removing…`;

    const res = await apiDelete(`/supervisor/supervisor-hours/${entry.id}`, { returnErrorBody: true });
    if (!res?.success) {
      errEl.textContent = res?.message || 'Failed to remove entry.';
      errEl.style.display = 'block';
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = orig;
      return;
    }

    close();
    if (typeof onDeleted === 'function') onDeleted(res);
  });
}
