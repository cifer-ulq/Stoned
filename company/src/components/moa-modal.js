/**
 * CHMSU HireMe — MOA Partnership Request & Posting Guard Modal
 * Used for self-registered companies to request MOA from CIER Admin
 * and guard against premature job/OJT slot posting.
 */
import { icon } from './icons.js';
import { apiPost } from '../api/client.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(message, type = 'success') {
  document.querySelectorAll('.hireme-moa-toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible hireme-moa-toast`;
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.zIndex = '99999';
  toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'alertCircle', 16)} <span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Open the Request MOA modal dialog
 */
export function openMoaRequestModal(options = {}) {
  const existing = document.querySelector('.moa-modal-backdrop');
  if (existing) existing.remove();

  const company = getState('company') || {};
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible moa-modal-backdrop';
  backdrop.style.zIndex = '9999';

  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:540px;width:95vw;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.28);">
      <!-- Header -->
      <div class="modal__header" style="background:#005930;color:#ffffff;padding:20px 24px;border-bottom:none;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:#ffffff;">
            ${icon('fileText', 20)}
          </div>
          <div>
            <h3 class="modal__title" style="margin:0;color:#ffffff;font-size:1.15rem;font-weight:700;">Request MOA Partnership</h3>
            <p style="font-size:0.78rem;color:rgba(255,255,255,0.85);margin:2px 0 0;">CHMSU Center for Internationalization &amp; External Relations (CIER)</p>
          </div>
        </div>
        <button class="modal__close" id="moa-close-btn" style="color:#ffffff;opacity:0.85;">${icon('x', 20)}</button>
      </div>

      <!-- Body -->
      <div class="modal__body" style="padding:22px 24px;background:#ffffff;">
        <div style="background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.18);border-radius:10px;padding:14px 16px;margin-bottom:18px;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#005930;margin-top:2px;">${icon('shieldCheck', 18)}</span>
            <div style="font-size:0.84rem;color:#1e293b;line-height:1.5;">
              <strong style="color:#005930;display:block;margin-bottom:2px;">Official Partnership Protocol</strong>
              As a self-registered industry partner, an established Memorandum of Agreement (MOA) is required before posting OJT slots or hiring job seekers. The CIER Office will review your profile and upload the partnership agreement.
            </div>
          </div>
        </div>

        <form id="moa-request-form">
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:600;font-size:0.85rem;color:#334155;margin-bottom:6px;display:block;">
              Partner Organization
            </label>
            <input type="text" class="form-input" value="${escapeHtml(company.name || 'Your Company')}" disabled style="background:#f8fafc;cursor:not-allowed;" />
          </div>

          <div class="form-group" style="margin-bottom:6px;">
            <label class="form-label" style="font-weight:600;font-size:0.85rem;color:#334155;margin-bottom:6px;display:block;">
              Notes / Message to CIER Office <span style="font-size:0.75rem;color:#64748b;font-weight:normal;">(Optional)</span>
            </label>
            <textarea id="moa-notes-input" class="form-textarea" rows="3" placeholder="e.g. Inquiring for upcoming semester OJT batch (BSIT / BSBA), contact person details, or expedited review request..." style="width:100%;resize:vertical;font-size:0.85rem;"></textarea>
            <span style="font-size:0.72rem;color:#64748b;margin-top:4px;display:block;">Your contact details from your profile will be sent along with this request.</span>
          </div>

          <div id="moa-error-msg" style="display:none;color:#dc2626;font-size:0.82rem;margin-top:10px;padding:8px 12px;background:#fef2f2;border-radius:6px;border:1px solid #fecdd3;"></div>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal__footer" style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn btn--outline" id="moa-cancel-btn" style="height:38px;padding:0 16px;">Cancel</button>
        <button class="btn btn--primary" id="moa-submit-btn" style="background:#005930;border-color:#005930;height:38px;padding:0 20px;gap:8px;font-weight:600;">
          ${icon('send', 14)} Submit MOA Request
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#moa-close-btn').addEventListener('click', close);
  backdrop.querySelector('#moa-cancel-btn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  const submitBtn = backdrop.querySelector('#moa-submit-btn');
  const errorMsg = backdrop.querySelector('#moa-error-msg');
  const notesInput = backdrop.querySelector('#moa-notes-input');

  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    errorMsg.style.display = 'none';
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `${icon('loader', 14)} Submitting…`;

    try {
      const res = await apiPost('/company/request-moa', {
        notes: notesInput.value.trim() || null,
      });

      if (res?.success) {
        // Update company state in store and localStorage
        const curCompany = getState('company') || {};
        const updated = {
          ...curCompany,
          moaStatus: 'Requested',
          moaRequestedAt: res.data?.moa_requested_at || new Date().toISOString(),
          canPostOpportunities: false,
        };
        setState('company', updated);
        localStorage.setItem('hireme_company_user', JSON.stringify(updated));

        close();
        showToast('MOA request submitted to CIER Admin successfully!', 'success');

        if (typeof options.onSuccess === 'function') {
          options.onSuccess(updated);
        }

        // Trigger refresh if needed
        window.dispatchEvent(new CustomEvent('hireme:moa-requested'));
      } else {
        errorMsg.textContent = res?.message || 'Failed to submit MOA request. Please ensure profile is complete.';
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (err) {
      errorMsg.textContent = 'A network error occurred. Please try again.';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * Show a blocked modal when the company attempts to post without an active MOA
 */
export function showPostingRestrictedModal(actionName = 'post opportunities') {
  const existing = document.querySelector('.moa-blocked-backdrop');
  if (existing) existing.remove();

  const company = getState('company') || {};
  const isProfileComplete = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible moa-blocked-backdrop';
  backdrop.style.zIndex = '9999';

  let title = 'Active MOA Required';
  let message = '';
  let primaryActionHtml = '';

  if (!isProfileComplete) {
    title = 'Complete Your Profile First';
    message = `Before you can ${actionName} or establish an MOA partnership with CHMSU, you must complete your company profile details.`;
    primaryActionHtml = `
      <button class="btn btn--primary" id="btn-go-profile" style="background:#005930;border-color:#005930;gap:6px;">
        ${icon('edit', 14)} Complete Profile
      </button>
    `;
  } else if (moaStatus === 'Requested') {
    title = 'MOA Request Under Review';
    message = `Your MOA partnership request has already been submitted to the CHMSU CIER Admin office and is currently under review. Once approved and activated by the administrator, your posting privileges will unlock automatically.`;
    primaryActionHtml = `
      <button class="btn btn--outline" id="btn-view-dash" style="gap:6px;">
        ${icon('home', 14)} Back to Dashboard
      </button>
    `;
  } else {
    title = 'MOA Partnership Agreement Required';
    message = `As a self-registered company, an active Memorandum of Agreement (MOA) between your organization and CHMSU is required before you can ${actionName}.`;
    primaryActionHtml = `
      <button class="btn btn--primary" id="btn-request-moa-now" style="background:#005930;border-color:#005930;gap:6px;">
        ${icon('fileText', 14)} Request MOA with CIER
      </button>
    `;
  }

  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:500px;width:92vw;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.28);">
      <div style="padding:28px 24px 20px;text-align:center;">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          ${icon('fileText', 30)}
        </div>
        <h3 style="margin:0 0 10px;font-size:1.25rem;font-weight:800;color:#0f172a;">${title}</h3>
        <p style="margin:0;font-size:0.88rem;color:#64748b;line-height:1.5;">${message}</p>
      </div>
      <div class="modal__footer" style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:10px;">
        <button class="btn btn--outline" id="btn-blocked-close">Close</button>
        ${primaryActionHtml}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#btn-blocked-close').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  backdrop.querySelector('#btn-go-profile')?.addEventListener('click', () => {
    close();
    navigate('/profile');
  });

  backdrop.querySelector('#btn-view-dash')?.addEventListener('click', () => {
    close();
    navigate('/');
  });

  backdrop.querySelector('#btn-request-moa-now')?.addEventListener('click', () => {
    close();
    openMoaRequestModal({
      onSuccess: () => {
        // Redraw or notify
      }
    });
  });
}
