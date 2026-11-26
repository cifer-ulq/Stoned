/* ===========================
   OJT Schedule Request Modal — Supervisor Portal
   Allows Supervisors / Coordinators to request official OJT work schedules
   from host companies for a single student or a batch of trainees.
   =========================== */

import { icon } from './icons.js';
import { apiPost } from '../api/client.js';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isEligibleForScheduleRequest(s) {
  if (!s) return { ok: false, reason: 'Invalid student record' };
  if (s.approval_status === 'pending') return { ok: false, reason: 'Pending registration approval' };
  if (s.is_pulled_out) return { ok: false, reason: 'Pulled out / awaiting redeployment' };
  if (s.emergency_status === 'withdrawn_emergency') return { ok: false, reason: 'Emergency withdrawal' };
  if (!s.hasPlacement && !['accepted', 'ojt_confirmed', 'ojt_started', 'on_leave'].includes(s.interest_status)) {
    return { ok: false, reason: 'Not yet placed at a host company' };
  }
  if (s.interest_status && !['accepted', 'ojt_confirmed', 'ojt_started', 'on_leave'].includes(s.interest_status) && !s.company) {
    return { ok: false, reason: 'Awaiting coordinator OJT approval' };
  }
  if (!s.company || s.company === '—') {
    return { ok: false, reason: 'No host company assigned' };
  }
  return { ok: true };
}

/**
 * Open the Schedule Request modal for 1 or N trainees.
 */
export function openScheduleRequestModal({ students = [], onRequested } = {}) {
  const existing = document.getElementById('sup-sched-req-modal');
  if (existing) existing.remove();

  const list = Array.isArray(students) ? students : [students].filter(Boolean);
  const eligible = [];
  const skipped = [];

  list.forEach(s => {
    const check = isEligibleForScheduleRequest(s);
    if (check.ok) eligible.push(s);
    else skipped.push({ student: s, reason: check.reason });
  });

  // Group eligible students by company name for clear preview
  const byCompany = new Map();
  eligible.forEach(s => {
    const comp = s.company || 'Host Company';
    if (!byCompany.has(comp)) byCompany.set(comp, []);
    byCompany.get(comp).push(s);
  });

  const isBatch = list.length > 1;
  const singleStudent = eligible.length === 1 ? eligible[0] : null;
  const isUpdate = singleStudent?.has_confirmed_schedule;
  const isReminder = !isUpdate && singleStudent?.schedule_status === 'requested';

  const modalTitle = isBatch
    ? 'Request OJT Schedules from Companies'
    : (isUpdate ? 'Request Schedule Update' : (isReminder ? 'Remind Company for OJT Schedule' : 'Request OJT Schedule'));

  const modalSub = isBatch
    ? `${eligible.length} eligible trainee(s) across ${byCompany.size} host ${byCompany.size === 1 ? 'company' : 'companies'}`
    : (singleStudent
        ? `${singleStudent.name} · ${singleStudent.company}`
        : `${list[0]?.name || 'Student'}`);

  const modal = document.createElement('div');
  modal.id = 'sup-sched-req-modal';
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,0.68);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;';

  modal.innerHTML = `
    <div class="modal modal--visible" role="dialog" aria-modal="true" style="max-width:520px;width:100%;padding:0;overflow:hidden;border-radius:16px;background:var(--bg-elevated,#fff);box-shadow:var(--shadow-2xl);border:1px solid var(--border-default,#e2e8f0);">
      <div style="background:linear-gradient(135deg,#005930,#047857);padding:18px 22px;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('calendar', 20)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.02rem;font-weight:800;color:#fff;line-height:1.25;">${esc(modalTitle)}</h3>
            <p style="margin:3px 0 0;font-size:0.78rem;color:rgba(255,255,255,0.88);">${esc(modalSub)}</p>
          </div>
        </div>
        <button type="button" id="sr-close" style="background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          ${icon('x', 16)}
        </button>
      </div>

      <div style="padding:20px 22px;max-height:70vh;overflow-y:auto;display:flex;flex-direction:column;gap:14px;">
        ${eligible.length === 0 ? `
          <div style="padding:14px;border-radius:10px;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;font-size:0.84rem;line-height:1.45;">
            <strong>No eligible students selected.</strong><br/>
            Only trainees who are approved/placed at a registered partner company can have an OJT work schedule requested.
          </div>
        ` : `
          <div style="padding:11px 14px;border-radius:10px;background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.18);font-size:0.81rem;color:var(--text-secondary);line-height:1.45;">
            ${isUpdate
              ? 'This notifies the host company to review and update the trainee\'s official working days, shift hours, or break schedule.'
              : 'This sends an official request notification to the host company asking them to submit the student\'s working days, shift hours, break times, and start instructions.'}
          </div>

          <!-- Grouped Company Breakdown -->
          <div>
            <div style="font-size:0.74rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin-bottom:6px;">
              Recipients (${byCompany.size} ${byCompany.size === 1 ? 'Company' : 'Companies'})
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;max-height:165px;overflow-y:auto;">
              ${Array.from(byCompany.entries()).map(([comp, items]) => `
                <div style="padding:9px 12px;border-radius:9px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
                  <div style="min-width:0;">
                    <div style="font-weight:700;font-size:0.84rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                      ${icon('building', 13)} ${esc(comp)}
                    </div>
                    <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:2px;">
                      ${items.map(x => esc(x.name)).join(', ')}
                    </div>
                  </div>
                  <span style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(0,89,48,0.1);color:#005930;white-space:nowrap;">
                    ${items.length} ${items.length === 1 ? 'trainee' : 'trainees'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          ${skipped.length > 0 ? `
            <div style="padding:10px 12px;border-radius:9px;background:#FFFBEB;border:1px solid #FDE68A;font-size:0.78rem;color:#92400E;">
              <strong>${skipped.length} student(s) will be skipped</strong> (not yet placed):
              ${skipped.slice(0, 4).map(x => `${esc(x.student.name)} (${esc(x.reason)})`).join('; ')}${skipped.length > 4 ? ` and ${skipped.length - 4} more` : ''}.
            </div>
          ` : ''}

          <div>
            <label for="sr-note" style="display:block;font-size:0.8rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">
              Message / Instructions to Company <span style="font-weight:400;color:var(--text-tertiary);">(optional)</span>
            </label>
            <textarea
              id="sr-note"
              rows="3"
              maxlength="1000"
              placeholder="e.g., Kindly submit the student's weekly working days and shift schedule for CHMSU OJT attendance monitoring."
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);font-family:inherit;font-size:0.84rem;color:var(--text-primary);resize:vertical;box-sizing:border-box;"
            >${esc(singleStudent?.schedule_request?.supervisor_note || '')}</textarea>
          </div>
        `}

        <div id="sr-error" style="display:none;padding:9px 12px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:0.8rem;font-weight:600;"></div>
      </div>

      <div style="padding:14px 22px;border-top:1px solid var(--border-default,#e2e8f0);background:var(--bg-secondary,#f8fafc);display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="btn btn--outline btn--sm" id="sr-cancel" style="font-weight:600;">Cancel</button>
        ${eligible.length > 0 ? `
          <button type="button" class="btn btn--primary btn--sm" id="sr-submit" style="gap:6px;background:#005930;border-color:#005930;font-weight:700;">
            ${icon('send', 14)} ${isBatch ? `Send Request (${eligible.length})` : (isReminder ? 'Send Reminder' : 'Send Schedule Request')}
          </button>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#sr-close')?.addEventListener('click', close);
  modal.querySelector('#sr-cancel')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const submitBtn = modal.querySelector('#sr-submit');
  const errEl = modal.querySelector('#sr-error');
  const noteEl = modal.querySelector('#sr-note');

  submitBtn?.addEventListener('click', async () => {
    errEl.style.display = 'none';
    submitBtn.disabled = true;
    const origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `${icon('clock', 14)} Sending…`;

    try {
      const payload = {
        student_ids: eligible.map(s => Number(s.id)).filter(Boolean),
        note: noteEl?.value?.trim() || null,
      };
      if (isUpdate && eligible.length === 1) {
        payload.request_type = 'schedule_update';
      }

      const res = await apiPost('/supervisor/schedule-requests', payload);
      if (!res?.success) {
        errEl.textContent = res?.message || 'Unable to send schedule request. Please try again.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
        return;
      }

      close();
      if (typeof onRequested === 'function') {
        onRequested(res);
      }
    } catch (err) {
      errEl.textContent = err?.message || 'Network error while sending request.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  });
}
