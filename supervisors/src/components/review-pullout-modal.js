/* ==========================================================================
   Review OJT Pull-Out Request Modal — Supervisor Portal
   Academic Coordinator review of student pull-out request letter & recommendation
   ========================================================================== */

import { icon } from './icons.js';
import { apiPut, storageUrl } from '../api/client.js';

export function openReviewPullOutModal({ trainee, onReviewed }) {
  const existing = document.getElementById('review-pullout-modal-overlay');
  if (existing) existing.remove();

  const po = trainee.pull_out_request;
  if (!po) return;

  const isPending = po.status === 'pending_supervisor';
  const isRecommended = po.status === 'recommended_by_supervisor' || po.status === 'printed_pending_signature' || po.status === 'emailed_to_dean';
  const isApproved = po.status === 'approved';
  const isRejected = po.status === 'rejected' || po.status === 'rejected_by_supervisor';

  const overlay = document.createElement('div');
  overlay.id = 'review-pullout-modal-overlay';
  overlay.className = 'modal-backdrop modal-backdrop--visible modal-backdrop--open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';

  const categoryName = (po.reason_category || '').replace(/_/g, ' ').toUpperCase();
  const renderedSnapshot = po.hours_rendered_snapshot ?? trainee.completedHours ?? 0;
  const requiredSnapshot = po.required_hours_snapshot ?? trainee.requiredHours ?? 600;

  overlay.innerHTML = `
    <div class="modal modal--visible" style="max-width:640px;width:100%;max-height:92vh;overflow-y:auto;border-radius:14px;background:var(--bg-card,#fff);box-shadow:0 20px 45px rgba(0,0,0,0.25);">
      <!-- Header -->
      <div style="padding:18px 22px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(185,28,28,0.06) 0%, rgba(217,119,6,0.06) 100%);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(185,28,28,0.12);color:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('fileText', 22)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:var(--text-primary);">Review OJT Pull-Out Request</h3>
            <p style="margin:2px 0 0;font-size:0.78rem;color:var(--text-secondary);">
              <strong>${trainee.name}</strong> (${trainee.studentId || 'No ID'}) &bull; ${trainee.course || 'BSIT'}
            </p>
          </div>
        </div>
        <button type="button" id="rev-po-close" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:4px;" aria-label="Close">
          ${icon('x', 18)}
        </button>
      </div>

      <div style="padding:22px;display:flex;flex-direction:column;gap:16px;">
        <div id="rev-po-err" style="display:none;background:#FEF2F2;border:1px solid #FCA5A5;color:#991B1B;padding:10px 14px;border-radius:8px;font-size:0.83rem;"></div>

        <!-- Status Pill Banner -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border-default);">
          <span style="font-size:0.8rem;color:var(--text-secondary);">Request Governance Status:</span>
          ${isPending ? `<span class="badge" style="background:#FEF3C7;color:#92400e;font-weight:700;font-size:0.75rem;">Awaiting Your Recommendation</span>` : ''}
          ${isRecommended ? `<span class="badge" style="background:#E0F2FE;color:#0369a1;font-weight:700;font-size:0.75rem;">Recommended &bull; With Program Chair</span>` : ''}
          ${isApproved ? `<span class="badge" style="background:#D1FAE5;color:#065F46;font-weight:700;font-size:0.75rem;">Officially Approved by Dean</span>` : ''}
          ${isRejected ? `<span class="badge" style="background:#FEE2E2;color:#991B1B;font-weight:700;font-size:0.75rem;">Declined / Returned</span>` : ''}
        </div>

        <!-- Student & Placement Summary -->
        <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:10px;padding:14px 16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem;">
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Host Training Establishment</span>
              <strong style="color:var(--text-primary);">${trainee.company || '—'}</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Rendered Progress Snapshot</span>
              <strong style="color:var(--color-primary);">${renderedSnapshot} / ${requiredSnapshot} Hours</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Pull-Out Category</span>
              <strong style="color:#b91c1c;">${categoryName}</strong>
            </div>
            <div>
              <span class="text-tertiary" style="font-size:0.74rem;display:block;">Filing Date</span>
              <strong>${po.created_at || 'Recently'}</strong>
            </div>
          </div>
        </div>

        <!-- Student Reason & Statement -->
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:var(--text-primary);">Student's Reason &amp; Statement</label>
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-left:4px solid #b91c1c;border-radius:6px;padding:12px 14px;font-size:0.84rem;color:var(--text-primary);line-height:1.5;">
            &ldquo;${po.reason || 'No statement provided.'}&rdquo;
          </div>
        </div>

        <!-- Official Student Uploaded Letter -->
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:var(--text-primary);">Student's Official Pull-Out Request Letter</label>
          <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:8px;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;">
                ${icon('fileText', 18)}
              </div>
              <div>
                <strong style="font-size:0.84rem;color:#78350F;display:block;">${po.student_letter_name || 'Pull_Out_Request_Letter.pdf'}</strong>
                <span style="font-size:0.72rem;color:#92400E;">Uploaded by student as official justification document</span>
              </div>
            </div>
            ${po.student_letter_url ? `
              <a href="${storageUrl(po.student_letter_url)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">
                ${icon('eye', 14)} Read &amp; Inspect Letter
              </a>
            ` : `
              <span style="font-size:0.75rem;color:#991B1B;font-style:italic;">Document link unavailable.</span>
            `}
          </div>
        </div>

        ${!isPending ? `
          <!-- Existing Supervisor Recommendation Remarks -->
          <div style="background:rgba(0,89,48,0.06);border-left:4px solid #005930;border-radius:6px;padding:12px 14px;font-size:0.84rem;">
            <strong style="color:#005930;display:block;margin-bottom:4px;">Your Recommendation Notes:</strong>
            <p style="margin:0;color:var(--text-primary);line-height:1.45;">${po.supervisor_remarks || 'None provided.'}</p>
            <span style="font-size:0.72rem;color:var(--text-tertiary);margin-top:4px;display:block;">Logged on ${po.supervisor_action_at || 'Recorded'}</span>
          </div>
        ` : `
          <!-- Recommendation Form -->
          <div>
            <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:var(--text-primary);">
              Coordinator Recommendation Remarks <span style="font-size:0.74rem;font-weight:400;color:var(--text-tertiary);">(Forwarded to Program Chair &amp; Dean)</span>
            </label>
            <textarea id="po-coord-remarks" class="input" rows="3" style="width:100%;resize:vertical;font-family:inherit;font-size:0.83rem;" placeholder="State your academic findings and justification to recommend this pull-out to the Program Chair and Dean..."></textarea>
          </div>

          <!-- Protocol note -->
          <div style="background:rgba(0,89,48,0.05);border-left:3px solid #005930;padding:10px 14px;border-radius:6px;font-size:0.78rem;color:#005930;line-height:1.45;">
            <strong>University Protocol:</strong> Clicking <strong>&ldquo;Recommend Approval&rdquo;</strong> forwards this case to the <strong>Program Chair (Admin)</strong>. The system will automatically synthesize an official endorsement memorandum addressed to the <strong>College Dean</strong> for printing or email routing.
          </div>
        `}
      </div>

      <!-- Footer Buttons -->
      <div style="padding:16px 22px;border-top:1px solid var(--border-default);background:var(--bg-secondary);display:flex;align-items:center;justify-content:flex-end;gap:10px;border-radius:0 0 14px 14px;flex-wrap:wrap;">
        <button type="button" class="btn btn--outline" id="rev-po-cancel">Close</button>
        ${isPending ? `
          <button type="button" class="btn btn--outline" id="rev-po-reject" style="color:#dc2626;border-color:rgba(220,38,38,0.35);gap:6px;">
            ${icon('x', 14)} Decline / Return
          </button>
          <button type="button" class="btn btn--primary" id="rev-po-recommend" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">
            ${icon('checkCircle', 14)} Recommend Approval
          </button>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#rev-po-close').addEventListener('click', close);
  overlay.querySelector('#rev-po-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  if (isPending) {
    const errBox = overlay.querySelector('#rev-po-err');
    const recBtn = overlay.querySelector('#rev-po-recommend');
    const rejBtn = overlay.querySelector('#rev-po-reject');
    const remarksInput = overlay.querySelector('#po-coord-remarks');

    recBtn.addEventListener('click', async () => {
      errBox.style.display = 'none';
      recBtn.disabled = true;
      rejBtn.disabled = true;
      recBtn.innerHTML = `${icon('clock', 14)} Submitting…`;

      try {
        const res = await apiPut(`/supervisor/pull-out-requests/${po.id}/recommend`, {
          action: 'recommend',
          supervisor_remarks: remarksInput.value.trim() || null,
        });

        if (res && res.success) {
          close();
          if (typeof window.showToast === 'function') {
            window.showToast(res.message || 'Pull-out request recommended and forwarded to Program Chair!', 'success');
          }
          if (onReviewed) onReviewed();
        } else {
          throw new Error(res?.message || 'Failed to submit recommendation.');
        }
      } catch (err) {
        errBox.textContent = err.message || 'An error occurred while submitting.';
        errBox.style.display = 'block';
        recBtn.disabled = false;
        rejBtn.disabled = false;
        recBtn.innerHTML = `${icon('checkCircle', 14)} Recommend Approval`;
      }
    });

    rejBtn.addEventListener('click', async () => {
      const reason = remarksInput.value.trim();
      if (!reason) {
        errBox.textContent = 'Please state your remarks / reason for declining the request in the text box above.';
        errBox.style.display = 'block';
        remarksInput.focus();
        return;
      }

      errBox.style.display = 'none';
      recBtn.disabled = true;
      rejBtn.disabled = true;
      rejBtn.innerHTML = `${icon('clock', 14)} Declining…`;

      try {
        const res = await apiPut(`/supervisor/pull-out-requests/${po.id}/recommend`, {
          action: 'reject',
          supervisor_remarks: reason,
        });

        if (res && res.success) {
          close();
          if (typeof window.showToast === 'function') {
            window.showToast(res.message || 'Pull-out request declined.', 'info');
          }
          if (onReviewed) onReviewed();
        } else {
          throw new Error(res?.message || 'Failed to decline request.');
        }
      } catch (err) {
        errBox.textContent = err.message || 'An error occurred while declining.';
        errBox.style.display = 'block';
        recBtn.disabled = false;
        rejBtn.disabled = false;
        rejBtn.innerHTML = `${icon('x', 14)} Decline / Return`;
      }
    });
  }
}
