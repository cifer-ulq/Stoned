/* ==========================================================================
   Review OJT Emergency Notice & Leave Modal — Supervisor Portal
   Academic Coordinator evaluation for medical leaves and formal discontinuations
   ========================================================================== */

import { icon } from './icons.js';
import { apiPut, storageUrl } from '../api/client.js';

export function openReviewEmergencyModal({ trainee, onReviewed }) {
  const existing = document.getElementById('review-emergency-modal-overlay');
  if (existing) existing.remove();

  const em = trainee.emergency_request;
  if (!em) return;

  const isWithdrawn = trainee.emergency_status === 'withdrawn_emergency' || em.type === 'permanent_withdrawal';
  const isOnLeave = trainee.emergency_status === 'on_leave';
  const isPending = trainee.emergency_status === 'pending' || em.coordinator_status === 'pending';

  const medicalDocUrl = em.supporting_document_url || (em.document_path || em.supporting_document_path ? storageUrl(em.document_path || em.supporting_document_path) : null);
  const fitToWorkUrl = em.fit_to_work_url || (em.fit_to_work_path || em.fit_to_work_document_path ? storageUrl(em.fit_to_work_path || em.fit_to_work_document_path) : null);
  const hasFitToWork = Boolean(fitToWorkUrl || em.has_fit_to_work);

  const overlay = document.createElement('div');
  overlay.id = 'review-emergency-modal-overlay';
  overlay.className = 'modal-backdrop';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

  const categoryName = (em.category || '').replace(/_/g, ' ').toUpperCase();
  const renderedSnapshot = em.hours_rendered_snapshot ?? trainee.completedHours ?? 0;
  const requiredSnapshot = em.required_hours_snapshot ?? trainee.requiredHours ?? 600;

  overlay.innerHTML = `
    <div class="modal modal--visible" style="max-width:620px;width:100%;max-height:92vh;overflow-y:auto;border-radius:14px;background:var(--bg-card,#fff);box-shadow:0 20px 45px rgba(0,0,0,0.25);">
      <!-- Header -->
      <div style="padding:18px 22px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(245,158,11,0.06) 100%);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.12);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('alertTriangle', 22)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:var(--text-primary);">Review OJT Emergency Notice</h3>
            <p style="margin:2px 0 0;font-size:0.78rem;color:var(--text-secondary);">
              <strong>${trainee.name}</strong> (${trainee.studentId || 'No ID'}) &bull; ${trainee.course || 'BSIT'}
            </p>
          </div>
        </div>
        <button type="button" id="rev-emer-close" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:4px;" aria-label="Close">
          ${icon('x', 18)}
        </button>
      </div>

      <div style="padding:22px;display:flex;flex-direction:column;gap:16px;">
        <div id="rev-emer-err" style="display:none;background:#FEF2F2;border:1px solid #FCA5A5;color:#991B1B;padding:10px 14px;border-radius:8px;font-size:0.83rem;"></div>

        <!-- Student & Placement Summary -->
        <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:10px;padding:14px 16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem;">
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Host Company</span>
              <strong style="color:var(--text-primary);">${trainee.company || '—'}</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Progress Snapshot</span>
              <strong style="color:var(--color-primary);">${renderedSnapshot} / ${requiredSnapshot} Hours</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Emergency Category</span>
              <strong style="color:#b91c1c;">${categoryName}</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Request Period</span>
              <strong>${em.start_date || 'Start'} &ndash; ${em.expected_return_date || 'Discontinue'}</strong>
            </div>
          </div>
        </div>

        <!-- Student Reason & Statement -->
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:var(--text-primary);">Student's Reason / Statement</label>
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-left:4px solid #ef4444;border-radius:6px;padding:12px 14px;font-size:0.84rem;color:var(--text-primary);line-height:1.5;">
            &ldquo;${em.reason || 'No statement provided.'}&rdquo;
          </div>
        </div>

        <!-- Documents Section -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label style="display:block;font-size:0.82rem;font-weight:700;color:var(--text-primary);">Supporting Documents &amp; Clearances</label>

          <!-- Initial Medical / Excuse Notice Document -->
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:#0284c7;">${icon('fileText', 16)}</span>
              <div>
                <strong style="font-size:0.82rem;color:var(--text-primary);display:block;">Filing Proof / Medical Excuse Document</strong>
                <span style="font-size:0.74rem;color:var(--text-secondary);">${em.supporting_document_name || 'Medical Certificate'}</span>
              </div>
            </div>
            ${medicalDocUrl ? `
              <a href="${medicalDocUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);">
                ${icon('fileText', 14)} View Document
              </a>
            ` : `
              <span style="font-size:0.78rem;color:var(--text-tertiary);font-style:italic;">No medical certificate attached at notice filing.</span>
            `}
          </div>

          <!-- Medical Fit-to-Work Clearance Section -->
          ${hasFitToWork && fitToWorkUrl ? `
            <div style="background:rgba(16,185,129,0.06);border:1.5px solid rgba(16,185,129,0.35);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(16,185,129,0.15);color:#059669;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  ${icon('shieldCheck', 20)}
                </div>
                <div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <strong style="font-size:0.86rem;color:#065f46;">Medical Fit-to-Work Clearance</strong>
                    <span class="badge" style="background:#D1FAE5;color:#065F46;font-size:0.68rem;padding:1px 6px;font-weight:700;">Submitted</span>
                  </div>
                  <span style="font-size:0.75rem;color:var(--text-secondary);">Uploaded ${em.fit_to_work_uploaded_at || 'by student'} &bull; Ready for verification</span>
                </div>
              </div>
              <a href="${fitToWorkUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm" style="gap:6px;background:#059669;border-color:#059669;">
                ${icon('shieldCheck', 14)} Inspect Fit-to-Work Clearance
              </a>
            </div>
          ` : (isOnLeave ? `
            <div style="background:var(--bg-secondary);border:1px dashed var(--border-default);border-radius:8px;padding:10px 14px;font-size:0.78rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">
              ${icon('clock', 14)} Trainee has not yet uploaded a Fit-to-Work clearance certificate.
            </div>
          ` : '')}
        </div>

        <!-- Host Company Clearance Status Banner -->
        <div style="padding:10px 14px;border-radius:8px;font-size:0.8rem;display:flex;align-items:center;gap:10px;background:${em.company_clearance_status === 'cleared' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)'};border:1px solid ${em.company_clearance_status === 'cleared' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'};color:${em.company_clearance_status === 'cleared' ? '#065f46' : '#92400e'};">
          ${icon(em.company_clearance_status === 'cleared' ? 'checkCircle' : 'clock', 16)}
          <div>
            <strong>Host Company Exit Clearance:</strong> 
            ${em.company_clearance_status === 'cleared' ? 'Cleared & Assets Returned' : (em.company_clearance_status === 'pending' ? 'Pending Company Clearance' : 'Not Required')}
            ${em.company_clearance_notes ? ` &bull; <em>"${em.company_clearance_notes}"</em>` : ''}
          </div>
        </div>

        <!-- Coordinator Evaluation Form -->
        <form id="rev-emer-form" style="display:flex;flex-direction:column;gap:14px;padding-top:8px;border-top:1px solid var(--border-default);">
          <div>
            <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:8px;color:var(--text-primary);">Academic Action Decision <span style="color:#ef4444;">*</span></label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <label style="border:1.5px solid var(--border-default);border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;align-items:flex-start;gap:8px;" id="lbl-act-approve">
                <input type="radio" name="action" value="approve" ${(isPending && !hasFitToWork) ? 'checked' : ''} style="accent-color:var(--color-primary);margin-top:2px;">
                <div>
                  <strong style="font-size:0.84rem;color:var(--text-primary);display:block;">
                    ${em.type === 'permanent_withdrawal' ? 'Approve Stoppage' : 'Approve Leave of Absence'}
                  </strong>
                  <span style="font-size:0.72rem;color:var(--text-secondary);">
                    ${em.type === 'permanent_withdrawal' ? 'Discontinue training, certify hours, restore company slot' : 'Excuse student absence and freeze attendance logging'}
                  </span>
                </div>
              </label>

              ${(isOnLeave || hasFitToWork) ? `
                <label style="border:1.5px solid var(--border-default);border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;align-items:flex-start;gap:8px;" id="lbl-act-fit">
                  <input type="radio" name="action" value="clear_fit_to_work" ${(hasFitToWork || (isOnLeave && !isPending)) ? 'checked' : ''} style="accent-color:#0284c7;margin-top:2px;">
                  <div>
                    <strong style="font-size:0.84rem;color:#0284c7;display:block;">Lift Leave &amp; Resume OJT</strong>
                    <span style="font-size:0.72rem;color:var(--text-secondary);">Accept Fit-to-Work clearance and unlock punch clock</span>
                  </div>
                </label>
              ` : ''}

              <label style="border:1.5px solid var(--border-default);border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;align-items:flex-start;gap:8px;" id="lbl-act-consult">
                <input type="radio" name="action" value="request_consultation" style="accent-color:#d97706;margin-top:2px;">
                <div>
                  <strong style="font-size:0.84rem;color:#b45309;display:block;">Request Meeting / Dialogue</strong>
                  <span style="font-size:0.72rem;color:var(--text-secondary);">Call student/parents for consultation prior to decision</span>
                </div>
              </label>

              <label style="border:1.5px solid var(--border-default);border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;align-items:flex-start;gap:8px;" id="lbl-act-reject">
                <input type="radio" name="action" value="reject" style="accent-color:#dc2626;margin-top:2px;">
                <div>
                  <strong style="font-size:0.84rem;color:#b91c1c;display:block;">Decline Notice</strong>
                  <span style="font-size:0.72rem;color:var(--text-secondary);">Reject leave/stoppage. Student remains active on site.</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Credited Hours & Academic Verdict (Only for permanent withdrawal approval) -->
          <div id="withdrawal-academic-fields" style="${em.type === 'permanent_withdrawal' && isPending ? 'display:block;' : 'display:none;'}background:rgba(239,68,68,0.03);border:1px dashed rgba(239,68,68,0.3);padding:14px;border-radius:8px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:5px;color:var(--text-primary);">Credited Hours to Award</label>
                <input type="number" step="0.5" name="credited_hours" class="input" style="width:100%;height:36px;" value="${renderedSnapshot}" min="0" max="${requiredSnapshot}">
                <span style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;display:block;">Certified hours credited to academic record</span>
              </div>
              <div>
                <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:5px;color:var(--text-primary);">Academic Verdict Grade</label>
                <select name="academic_verdict" class="input" style="width:100%;height:36px;">
                  <option value="incomplete_inc" selected>Incomplete (INC) - 1 Year to Complete</option>
                  <option value="credited_partial">Credited Partial Hours Rendered</option>
                  <option value="credited_full">Credited Full Course (Exceptional)</option>
                  <option value="withdrawn_no_credit">Withdrawn Without Credit</option>
                </select>
                <span style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;display:block;">Official Registrar remark per CHED CMO</span>
              </div>
            </div>
          </div>

          <!-- Coordinator Remarks / Instructions -->
          <div>
            <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:5px;color:var(--text-primary);">Coordinator Remarks / Advice for Student &amp; Company</label>
            <textarea name="coordinator_remarks" class="input" rows="3" style="width:100%;resize:vertical;font-family:inherit;" placeholder="Add remarks, medical follow-up guidelines, or scheduled meeting dates...">${em.coordinator_remarks || ''}</textarea>
          </div>

          <!-- Submit Buttons -->
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:6px;">
            <button type="button" class="btn btn--outline" id="rev-emer-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary" id="rev-emer-submit" style="gap:6px;">
              ${icon('check', 14)} Confirm Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#rev-emer-close').addEventListener('click', close);
  overlay.querySelector('#rev-emer-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const form = overlay.querySelector('#rev-emer-form');
  const errBox = overlay.querySelector('#rev-emer-err');
  const submitBtn = overlay.querySelector('#rev-emer-submit');
  const withdrawalFields = overlay.querySelector('#withdrawal-academic-fields');
  const actionRadios = overlay.querySelectorAll('input[name="action"]');

  actionRadios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'approve' && em.type === 'permanent_withdrawal') {
        withdrawalFields.style.display = 'block';
      } else {
        withdrawalFields.style.display = 'none';
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Saving Decision…`;

    const fd = new FormData(form);
    const action = fd.get('action');
    const remarks = fd.get('coordinator_remarks');
    const credited = fd.get('credited_hours');
    const verdict = fd.get('academic_verdict');

    const payload = {
      action,
      coordinator_remarks: remarks,
      credited_hours: credited ? parseFloat(credited) : null,
      academic_verdict: verdict || null,
    };

    try {
      const res = await apiPut(`/supervisor/emergency-requests/${em.id}/review`, payload);
      if (res && res.success) {
        close();
        if (typeof onReviewed === 'function') onReviewed(res.data);
      } else {
        errBox.textContent = res?.message || 'Failed to update emergency request.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('check', 14)} Confirm Decision`;
      }
    } catch (err) {
      errBox.textContent = err.message || 'An error occurred while submitting decision.';
      errBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('check', 14)} Confirm Decision`;
    }
  });
}
