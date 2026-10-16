/* ── Admin Pull-Out & Dean Endorsement Modal — Admin Portal ── */
import { icon } from './icons.js';
import { apiGet, apiPost, storageUrl } from '../api/client.js';

export async function openAdminPullOutModal(po, onProcessed) {
  const existing = document.getElementById('admin-pullout-modal-overlay');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'admin-pullout-modal-overlay';
  backdrop.className = 'modal-backdrop';
  backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';

  backdrop.innerHTML = `
    <div class="modal ac-modal" style="max-width:840px;width:100%;max-height:92vh;overflow-y:auto;background:var(--bg-card,#fff);border-radius:14px;box-shadow:0 25px 50px rgba(0,0,0,0.3);">
      <div style="padding:24px;text-align:center;">
        <div class="spinner" style="margin:20px auto;"></div>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);">Generating official memorandum preview for the Dean…</p>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  // Fetch letter preview from backend
  let preview = null;
  try {
    const res = await apiGet(`/admin/pull-out-requests/${po.id}/letter-preview`);
    if (res && res.success) {
      preview = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch letter preview:', err);
  }

  const defaultDeanName = po.dean_name || preview?.default_dean_name || 'Dr. Ma. Elena E. Estrada';
  const defaultDeanEmail = po.dean_email || 'dean.cit@chmsu.edu.ph';
  const isApproved = po.status === 'approved';
  const isRejected = po.status === 'rejected';

  const modalContainer = backdrop.querySelector('.modal');
  modalContainer.innerHTML = `
    <!-- Header -->
    <div class="ac-modal__header" style="background:linear-gradient(135deg, #005930 0%, #00361d 100%);color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;border-radius:14px 14px 0 0;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">
          ${icon('file-text', 22)}
        </div>
        <div>
          <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#fff;">Process OJT Pull-Out &amp; Dean Endorsement</h3>
          <p style="margin:2px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.85);">
            Trainee: <strong>${po.student_name}</strong> (${po.student_number || 'N/A'}) &bull; ${po.course}
          </p>
        </div>
      </div>
      <button class="modal__close" id="admin-po-close" style="background:none;border:none;color:#fff;cursor:pointer;padding:4px;" aria-label="Close">
        ${icon('x', 18)}
      </button>
    </div>

    <!-- Status Sub-header -->
    <div style="background:#f8fafc;padding:12px 24px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">Governance Phase:</span>
        ${po.status === 'recommended_by_supervisor' ? `<span class="badge badge--warning" style="font-size:0.75rem;">Recommended by Coordinator &bull; Awaiting Dean Letter</span>` : ''}
        ${po.status === 'printed_pending_signature' ? `<span class="badge" style="background:#EEF2FF;color:#4338ca;font-weight:700;font-size:0.75rem;">Printed &bull; Awaiting Physical Dean Signature</span>` : ''}
        ${po.status === 'emailed_to_dean' ? `<span class="badge badge--info" style="font-size:0.75rem;">Emailed to Dean &bull; Awaiting Reply</span>` : ''}
        ${po.status === 'approved' ? `<span class="badge badge--success" style="font-size:0.75rem;">Officially Approved by Dean</span>` : ''}
        ${po.status === 'rejected' ? `<span class="badge badge--error" style="font-size:0.75rem;">Declined by Dean</span>` : ''}
        ${po.status === 'pending_supervisor' ? `<span class="badge badge--neutral" style="font-size:0.75rem;">Pending Coordinator Review</span>` : ''}
      </div>
      <div style="font-size:0.75rem;color:var(--text-tertiary);">
        ${po.supervisor_name ? `Coordinator: <strong>${po.supervisor_name}</strong>` : ''}
      </div>
    </div>

    <div style="padding:22px 24px;display:flex;flex-direction:column;gap:18px;">
      <div id="admin-po-msg" style="display:none;padding:10px 14px;border-radius:8px;font-size:0.83rem;"></div>

      <!-- Two Column Layout: Student Case & Letter Preview -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        
        <!-- Column 1: Verification & Student Submissions -->
        <div style="display:flex;flex-direction:column;gap:14px;">
          <h4 style="margin:0;font-size:0.92rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
            ${icon('clipboard-check', 16)} 1. Student &amp; Placement Grievance
          </h4>

          <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.8rem;">
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">Host Company</span>
                <strong style="color:var(--text-primary);">${po.company_name}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">Rendered Hours</span>
                <strong style="color:var(--color-primary);">${po.hours_rendered_snapshot} / ${po.required_hours_snapshot} hrs</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">Reason Category</span>
                <strong style="color:#b91c1c;text-transform:capitalize;">${(po.reason_category || '').replace(/_/g, ' ')}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">Filing Date</span>
                <strong>${po.created_at || 'Recently'}</strong>
              </div>
            </div>
          </div>

          <!-- Student Statement -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-secondary);margin-bottom:4px;">Student's Written Justification:</label>
            <div style="background:var(--bg-elevated);border-left:4px solid #b91c1c;border-radius:6px;padding:12px;font-size:0.82rem;line-height:1.45;color:var(--text-primary);">
              &ldquo;${po.reason}&rdquo;
            </div>
          </div>

          <!-- Uploaded Student Letter Link -->
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              ${icon('file-text', 18)}
              <div>
                <strong style="font-size:0.82rem;color:#78350f;display:block;">${po.student_letter_name || 'Student_Request_Letter.pdf'}</strong>
                <span style="font-size:0.7rem;color:#92400e;">Uploaded formal request letter</span>
              </div>
            </div>
            ${po.student_letter_url ? `
              <a href="${storageUrl(po.student_letter_url)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;font-size:0.75rem;gap:4px;">
                ${icon('eye', 13)} Read Letter
              </a>
            ` : '<span style="font-size:0.75rem;color:#991b1b;">Not available</span>'}
          </div>

          <!-- Coordinator Recommendation Statement -->
          <div style="background:rgba(0,89,48,0.06);border-left:4px solid #005930;border-radius:6px;padding:12px;font-size:0.82rem;">
            <strong style="color:#005930;display:block;margin-bottom:3px;">Coordinator Recommendation:</strong>
            <p style="margin:0;color:var(--text-primary);line-height:1.4;">${po.supervisor_remarks || 'The coordinator recommended favorable approval for pull-out.'}</p>
            <span style="font-size:0.7rem;color:var(--text-tertiary);margin-top:4px;display:block;">Endorsed by ${po.supervisor_name || 'Coordinator'} on ${po.supervisor_action_at || 'Recently'}</span>
          </div>
        </div>

        <!-- Column 2: Official Letter for the Dean & Dispatch Options -->
        <div style="display:flex;flex-direction:column;gap:14px;">
          <h4 style="margin:0;font-size:0.92rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
            ${icon('mail', 16)} 2. Automated Official Letter for Dean
          </h4>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label class="ac-label" style="font-size:0.75rem;">Dean's Full Name <span class="ac-req">*</span></label>
              <input class="ac-input" id="admin-po-dean-name" type="text" value="${defaultDeanName}" style="padding:6px 10px;font-size:0.82rem;" />
            </div>
            <div>
              <label class="ac-label" style="font-size:0.75rem;">Dean's Email Address <span class="ac-req">*</span></label>
              <input class="ac-input" id="admin-po-dean-email" type="email" value="${defaultDeanEmail}" style="padding:6px 10px;font-size:0.82rem;" />
            </div>
          </div>

          <!-- Printable Letter Preview Box -->
          <div id="admin-letter-print-area" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;max-height:260px;overflow-y:auto;font-family:monospace;font-size:0.75rem;line-height:1.5;color:#1e293b;white-space:pre-wrap;box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
${preview?.letter_body || po.generated_letter_body || 'Letter memorandum preview loading…'}
          </div>

          <!-- Dispatch Channel Buttons -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button type="button" class="btn btn--outline" id="btn-print-letter" style="gap:6px;justify-content:center;font-size:0.82rem;">
              ${icon('printer', 15)} Print Official Letter
            </button>
            <button type="button" class="btn btn--primary" id="btn-email-dean" style="background:#0284c7;border-color:#0284c7;gap:6px;justify-content:center;font-size:0.82rem;">
              ${icon('send', 15)} Email to Dean
            </button>
          </div>
          <span style="font-size:0.72rem;color:var(--text-tertiary);line-height:1.35;">
            &bull; <strong>Print Manually:</strong> Generates physical memorandum for manual signatures.<br>
            &bull; <strong>Email to Dean:</strong> Dispatches official memo directly and waits for email response.
          </span>
        </div>

      </div>

      <!-- Section 3: Finalize Dean's Decision -->
      ${!isApproved && !isRejected ? `
        <div style="margin-top:8px;padding:18px 20px;border-radius:10px;background:var(--bg-elevated);border:1.5px solid var(--border-default);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <h4 style="margin:0;font-size:0.95rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
              ${icon('shield', 16)} 3. Record Dean's Final Decision
            </h4>
            <span style="font-size:0.72rem;color:var(--text-tertiary);">Once physical signature is obtained OR Dean replies via email</span>
          </div>

          <!-- Verified DTR Audit Card -->
          <div style="margin-bottom:14px;padding:12px 14px;border-radius:8px;background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.2);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:0.76rem;font-weight:700;color:#005930;display:flex;align-items:center;gap:5px;margin-bottom:2px;">
                ${icon('clock', 13)} Verified Daily Time Record (DTR) Audit
              </div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">
                Verified Rendered: <strong style="color:var(--text-primary);">${po.dtr_total_hours !== undefined ? po.dtr_total_hours : (po.hours_rendered_snapshot || 0)} hrs</strong> 
                &bull; Valid Logged Days: <strong>${po.dtr_days_count !== undefined ? po.dtr_days_count : 0} days</strong>
                <span style="display:block;font-size:0.71rem;color:var(--text-tertiary);margin-top:2px;">*Unclosed single-punch check-ins on pull-out day are automatically voided and excluded.</span>
              </div>
            </div>
            <button type="button" class="btn btn--outline" id="btn-sync-dtr" style="padding:4px 10px;font-size:0.72rem;height:auto;gap:4px;border-color:rgba(0,89,48,0.3);color:#005930;">
              ${icon('refresh-cw', 12)} Reset to DTR
            </button>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:14px;align-items:flex-end;">
            <div>
              <label class="ac-label" style="font-size:0.75rem;">Dean's Verdict <span class="ac-req">*</span></label>
              <select class="form-select" id="admin-po-verdict" style="width:100%;padding:7px 10px;font-size:0.82rem;">
                <option value="approved">Dean Approved Pull-Out</option>
                <option value="rejected">Dean Declined Pull-Out</option>
              </select>
            </div>
            <div>
              <label class="ac-label" style="font-size:0.75rem;">Credited Hours (hrs)</label>
              <input class="ac-input" id="admin-po-credited-hours" type="number" step="0.5" value="${po.dtr_total_hours !== undefined ? po.dtr_total_hours : (po.hours_rendered_snapshot || 0)}" style="padding:6px 10px;font-size:0.82rem;" />
            </div>
            <div>
              <label class="ac-label" style="font-size:0.75rem;">Admin Directives / Conforme Notes</label>
              <input class="ac-input" id="admin-po-final-remarks" type="text" placeholder="e.g. Approved per Dean email dated Oct 14" style="padding:6px 10px;font-size:0.82rem;" />
            </div>
          </div>

          <div style="margin-top:14px;display:flex;align-items:center;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn--primary" id="btn-finalize-po" style="background:#005930;border-color:#005930;gap:6px;font-size:0.84rem;font-weight:700;">
              ${icon('check-circle', 15)} Finalize Dean Decision &amp; Sync Records
            </button>
          </div>
        </div>
      ` : `
        <div style="margin-top:8px;padding:14px 18px;border-radius:10px;background:${isApproved ? 'rgba(0,89,48,0.08)' : 'rgba(239,68,68,0.08)'};border:1px solid ${isApproved ? 'rgba(0,89,48,0.25)' : 'rgba(239,68,68,0.25)'};font-size:0.83rem;">
          <strong style="color:${isApproved ? '#005930' : '#b91c1c'};display:block;margin-bottom:3px;">
            Final Decision Recorded: ${isApproved ? 'Approved by Dean' : 'Declined by Dean'}
          </strong>
          <span style="color:var(--text-secondary);">
            Credited hours: <strong>${po.credited_hours || 0} hrs</strong> &bull; Decided by <strong>${po.admin_name || 'Admin'}</strong> on ${po.admin_action_at || 'Recorded'}.
          </span>
          ${po.admin_remarks ? `<p style="margin:4px 0 0;font-style:italic;">&ldquo;${po.admin_remarks}&rdquo;</p>` : ''}
        </div>
      `}
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px;border-top:1px solid var(--border-subtle);background:var(--bg-elevated);display:flex;align-items:center;justify-content:flex-end;gap:10px;border-radius:0 0 14px 14px;">
      <button type="button" class="btn btn--outline" id="admin-po-cancel">Close</button>
    </div>
  `;

  const close = () => backdrop.remove();
  modalContainer.querySelector('#admin-po-close').addEventListener('click', close);
  modalContainer.querySelector('#admin-po-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const msgBox = modalContainer.querySelector('#admin-po-msg');
  const deanNameInput = modalContainer.querySelector('#admin-po-dean-name');
  const deanEmailInput = modalContainer.querySelector('#admin-po-dean-email');

  function showMsg(text, type = 'success') {
    msgBox.style.display = 'block';
    msgBox.textContent = text;
    if (type === 'success') {
      msgBox.style.background = '#ECFDF5';
      msgBox.style.border = '1px solid #A7F3D0';
      msgBox.style.color = '#065F46';
    } else {
      msgBox.style.background = '#FEF2F2';
      msgBox.style.border = '1px solid #FCA5A5';
      msgBox.style.color = '#991B1B';
    }
  }

  // 1. Action: Print Official Letter
  const printBtn = modalContainer.querySelector('#btn-print-letter');
  if (printBtn) {
    printBtn.addEventListener('click', async () => {
      const deanName = deanNameInput.value.trim();
      const letterContent = modalContainer.querySelector('#admin-letter-print-area').innerText;

      // Open clean print window
      const printWin = window.open('', '_blank', 'width=800,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>OJT Pull-Out Memorandum — ${po.student_name}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 13pt; line-height: 1.5; color: #000; }
              pre { font-family: 'Times New Roman', serif; font-size: 12.5pt; white-space: pre-wrap; margin: 0; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <pre>${letterContent}</pre>
            <script>
              window.onload = function() { window.print(); };
            <\/script>
          </body>
          </html>
        `);
        printWin.document.close();
      }

      // Record in backend
      try {
        const res = await apiPost(`/admin/pull-out-requests/${po.id}/record-printed`, {
          dean_name: deanName,
        });
        if (res && res.success) {
          showMsg('Letter marked as printed. Request is now awaiting physical Dean signature routing.', 'success');
          if (onProcessed) onProcessed();
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // 2. Action: Send Email to Dean
  const emailBtn = modalContainer.querySelector('#btn-email-dean');
  if (emailBtn) {
    emailBtn.addEventListener('click', async () => {
      const deanName = deanNameInput.value.trim();
      const deanEmail = deanEmailInput.value.trim();

      if (!deanName || !deanEmail) {
        showMsg('Please provide both the Dean Full Name and Dean Email address.', 'error');
        return;
      }

      emailBtn.disabled = true;
      emailBtn.innerHTML = `${icon('clock', 14)} Dispatching Email…`;

      try {
        const res = await apiPost(`/admin/pull-out-requests/${po.id}/send-email`, {
          dean_name: deanName,
          dean_email: deanEmail,
        });

        if (res && res.success) {
          showMsg(`Official memorandum successfully dispatched to Dean at ${deanEmail}. Status set to awaiting Dean email response.`, 'success');
          emailBtn.disabled = false;
          emailBtn.innerHTML = `${icon('send', 15)} Email to Dean`;
          if (onProcessed) onProcessed();
        } else {
          throw new Error(res?.message || 'Failed to dispatch email.');
        }
      } catch (err) {
        showMsg(err.message || 'Error dispatching email to Dean.', 'error');
        emailBtn.disabled = false;
        emailBtn.innerHTML = `${icon('send', 15)} Email to Dean`;
      }
    });
  }

  // Reset to verified DTR
  const syncDtrBtn = modalContainer.querySelector('#btn-sync-dtr');
  if (syncDtrBtn) {
    syncDtrBtn.addEventListener('click', () => {
      const dtrVal = po.dtr_total_hours !== undefined ? po.dtr_total_hours : (po.hours_rendered_snapshot || 0);
      const inputEl = modalContainer.querySelector('#admin-po-credited-hours');
      if (inputEl) {
        inputEl.value = dtrVal;
        showMsg(`Credited hours reset to verified DTR sum (${dtrVal} hrs).`, 'success');
      }
    });
  }

  // 3. Action: Finalize Dean Decision
  const finalizeBtn = modalContainer.querySelector('#btn-finalize-po');
  if (finalizeBtn) {
    finalizeBtn.addEventListener('click', async () => {
      const verdict = modalContainer.querySelector('#admin-po-verdict').value;
      const credited = parseFloat(modalContainer.querySelector('#admin-po-credited-hours').value) || 0;
      const remarks = modalContainer.querySelector('#admin-po-final-remarks').value.trim();

      if (!confirm(`Confirm recording Dean's verdict as "${verdict.toUpperCase()}" for ${po.student_name}? This will synchronize the student's training placement records.`)) {
        return;
      }

      finalizeBtn.disabled = true;
      finalizeBtn.innerHTML = `${icon('clock', 14)} Finalizing…`;

      try {
        const res = await apiPost(`/admin/pull-out-requests/${po.id}/finalize`, {
          dean_verdict: verdict,
          credited_hours: credited,
          admin_remarks: remarks,
          allow_redeployment: true,
        });

        if (res && res.success) {
          close();
          if (typeof window.showToast === 'function') {
            window.showToast(res.message || 'Dean decision finalized successfully.', 'success');
          }
          if (onProcessed) onProcessed();
        } else {
          throw new Error(res?.message || 'Failed to finalize decision.');
        }
      } catch (err) {
        showMsg(err.message || 'Error finalizing decision.', 'error');
        finalizeBtn.disabled = false;
        finalizeBtn.innerHTML = `${icon('check-circle', 15)} Finalize Dean Decision &amp; Sync Records`;
      }
    });
  }
}
