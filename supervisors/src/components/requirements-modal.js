/* ==========================================================================
   OJT Requirements Assignment & Review Modal — Supervisor Portal
   ========================================================================== */

import { icon } from './icons.js';
import { apiPost, apiPut } from '../api/client.js';

export function getReqItemName(it) {
  if (!it) return '';
  if (typeof it === 'string') return it.trim();
  return (it.name || it.title || it.label || it.document || '').trim();
}

const PRESETS = {
  pre_deployment: {
    title: 'Pre-Deployment OJT Document Packet',
    items: [
      'Parents / Guardian Waiver (Notarized)',
      'Medical Examination Certificate (Fit to Work)',
      'Certificate of Registration (COR) / Study Load',
      'Barangay or Police Clearance',
      'OJT Training Agreement / MOA',
      'Updated Resume / Curriculum Vitae',
    ],
    instructions: 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".',
  },
  midterm: {
    title: 'Midterm Progress & Performance Packet',
    items: [
      'Midterm OJT Progress Report',
      'Midterm Daily Time Record (DTR) signed by Company Supervisor',
      'Weekly Internship Reflective Journal (Weeks 1-6)',
    ],
    instructions: 'Submit your signed midterm logs and journal entries into your Drive folder.',
  },
  final_clearance: {
    title: 'Final OJT Clearance & Completion Documents',
    items: [
      'Certificate of OJT Completion from Host Company',
      'Final Daily Time Record (600 Hours Completed)',
      'Host Company Supervisor Evaluation Form',
      'Comprehensive OJT Narrative / Capstone Report',
    ],
    instructions: 'Upload all final completion documents for academic coordinator verification before graduation promotion.',
  },
};

/**
 * Open modal to assign OJT requirements to one or more students.
 */
export function openAssignRequirementsModal({
  studentId,
  studentName = 'Student',
  program = '',
  interestId = null,
  postingId = null,
  onAssigned = null,
}) {
  const existing = document.getElementById('sup-req-modal-overlay');
  if (existing) existing.remove();

  const activePreset = PRESETS.pre_deployment;
  let items = [...activePreset.items];

  // Default due date to +14 days from now
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const overlay = document.createElement('div');
  overlay.id = 'sup-req-modal-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px;
  `;

  function renderModal() {
    overlay.innerHTML = `
      <div style="background:var(--bg-card, #fff);border:1px solid var(--border-default, #e2e8f0);border-radius:14px;max-width:560px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 45px rgba(0,0,0,0.22);overflow:hidden;animation:sup-modal-in .18s ease-out;">
        
        <!-- Header -->
        <div style="padding:18px 22px;border-bottom:1px solid var(--border-default, #e2e8f0);display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(2,132,199,0.04) 100%);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('clipboardCheck', 20)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:var(--text-primary, #0f172a);">Assign OJT Requirements</h3>
              <p style="margin:2px 0 0;font-size:0.8rem;color:var(--text-secondary, #64748b);">
                Target: <strong>${studentName}</strong> ${program ? `&middot; ${program}` : ''}
              </p>
            </div>
          </div>
          <button type="button" id="sup-req-close" style="background:none;border:none;cursor:pointer;color:var(--text-secondary, #64748b);padding:4px;" aria-label="Close">
            ${icon('x', 18)}
          </button>
        </div>

        <!-- Form Body -->
        <form id="sup-req-form" style="padding:20px 22px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
          
          <!-- Preset selector -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.03em;">
              Template Preset
            </label>
            <select id="sup-req-preset" class="form-select" style="width:100%;padding:8px 12px;font-size:0.85rem;border-radius:8px;border:1px solid var(--border-default, #cbd5e1);background:var(--bg-card,#fff);">
              <option value="pre_deployment" selected>Pre-Deployment OJT Document Packet</option>
              <option value="midterm">Midterm Progress & Performance Packet</option>
              <option value="final_clearance">Final OJT Clearance & Completion Documents</option>
              <option value="custom">Custom Requirements</option>
            </select>
          </div>

          <!-- Packet Title -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;">
              Packet Title
            </label>
            <input type="text" id="sup-req-title" class="form-input" value="${activePreset.title}" required style="width:100%;padding:8px 12px;font-size:0.88rem;border-radius:8px;border:1px solid var(--border-default, #cbd5e1);" />
          </div>

          <!-- Checklist Items -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);text-transform:uppercase;letter-spacing:0.03em;">
                Required Checklist Items (${items.length})
              </label>
              <span style="font-size:0.72rem;color:#0284c7;font-weight:600;">Student will see this checklist</span>
            </div>
            
            <div id="sup-req-items-list" style="display:flex;flex-direction:column;gap:6px;max-height:170px;overflow-y:auto;padding:8px 10px;border:1px solid var(--border-default, #e2e8f0);border-radius:8px;background:var(--bg-secondary, #f8fafc);">
              ${items.map((it, idx) => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 6px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;">
                  <span style="font-size:0.8rem;color:#1e293b;display:flex;align-items:center;gap:6px;">
                    <span style="color:#005930;">${icon('checkCircle', 13)}</span>
                    ${getReqItemName(it)}
                  </span>
                  <button type="button" class="del-req-item-btn" data-idx="${idx}" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:2px;" title="Remove item">
                    ${icon('x', 14)}
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- Add custom item line -->
            <div style="display:flex;gap:6px;margin-top:8px;">
              <input type="text" id="sup-req-new-item" placeholder="Add another required document..." style="flex:1;padding:6px 10px;font-size:0.8rem;border-radius:6px;border:1px solid #cbd5e1;" />
              <button type="button" id="sup-req-add-item-btn" class="btn btn--outline btn--sm" style="font-size:0.75rem;padding:0 10px;gap:4px;">
                ${icon('plus', 12)} Add
              </button>
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;">
              Submission Deadline (Due Date)
            </label>
            <div style="display:flex;align-items:center;gap:8px;">
              <input type="date" id="sup-req-due" value="${defaultDueDate}" style="padding:6px 10px;font-size:0.85rem;border-radius:6px;border:1px solid #cbd5e1;background:#fff;" />
              <div style="display:flex;gap:4px;">
                <button type="button" class="btn btn--ghost btn--xs quick-due" data-days="7" style="font-size:0.7rem;padding:3px 7px;">+7d</button>
                <button type="button" class="btn btn--ghost btn--xs quick-due" data-days="14" style="font-size:0.7rem;padding:3px 7px;">+14d</button>
                <button type="button" class="btn btn--ghost btn--xs quick-due" data-days="30" style="font-size:0.7rem;padding:3px 7px;">+30d</button>
              </div>
            </div>
          </div>

          <!-- Instructions / Remarks -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;">
              Instructions / Notes for Student
            </label>
            <textarea id="sup-req-notes" rows="2" style="width:100%;padding:8px 10px;font-size:0.82rem;border-radius:8px;border:1px solid #cbd5e1;resize:vertical;" placeholder="Optional guidelines...">${activePreset.instructions}</textarea>
          </div>

          <!-- Notification preview alert -->
          <div style="padding:10px 12px;background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.22);border-radius:8px;display:flex;align-items:flex-start;gap:8px;font-size:0.75rem;color:#0369a1;">
            <span style="color:#0284c7;flex-shrink:0;margin-top:1px;">${icon('bell', 14)}</span>
            <span>Assigning this packet will immediately dispatch an in-app notification & checklist reminder to <strong>${studentName}</strong>.</span>
          </div>

          <p id="sup-req-error" style="color:#dc2626;font-size:0.78rem;margin:0;display:none;"></p>

          <!-- Footer -->
          <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-default, #e2e8f0);">
            <button type="button" id="sup-req-cancel" class="btn btn--outline btn--sm">Cancel</button>
            <button type="submit" id="sup-req-submit-btn" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">
              ${icon('send', 13)} Assign & Notify Student
            </button>
          </div>

        </form>
      </div>
    `;

    // Event listeners
    const closeBtn = overlay.querySelector('#sup-req-close');
    const cancelBtn = overlay.querySelector('#sup-req-cancel');
    const form = overlay.querySelector('#sup-req-form');
    const presetSelect = overlay.querySelector('#sup-req-preset');
    const titleInput = overlay.querySelector('#sup-req-title');
    const notesInput = overlay.querySelector('#sup-req-notes');
    const dueInput = overlay.querySelector('#sup-req-due');
    const newItemInput = overlay.querySelector('#sup-req-new-item');
    const addItemBtn = overlay.querySelector('#sup-req-add-item-btn');
    const errEl = overlay.querySelector('#sup-req-error');
    const submitBtn = overlay.querySelector('#sup-req-submit-btn');

    const closeModal = () => overlay.remove();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    // Preset selection change
    presetSelect.onchange = () => {
      const pKey = presetSelect.value;
      if (PRESETS[pKey]) {
        titleInput.value = PRESETS[pKey].title;
        notesInput.value = PRESETS[pKey].instructions;
        items = [...PRESETS[pKey].items];
      } else {
        titleInput.value = 'Custom OJT Requirements';
        notesInput.value = '';
        items = [];
      }
      renderModal();
    };

    // Quick due buttons
    overlay.querySelectorAll('.quick-due').forEach(b => {
      b.onclick = () => {
        const days = parseInt(b.dataset.days, 10);
        const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dueInput.value = d;
      };
    });

    // Delete item
    overlay.querySelectorAll('.del-req-item-btn').forEach(b => {
      b.onclick = () => {
        const idx = parseInt(b.dataset.idx, 10);
        items.splice(idx, 1);
        renderModal();
      };
    });

    // Add item
    const addItem = () => {
      const v = newItemInput.value.trim();
      if (v) {
        items.push(v);
        newItemInput.value = '';
        renderModal();
      }
    };
    addItemBtn.onclick = addItem;
    newItemInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } };

    // Submit assignment
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!items.length) {
        errEl.textContent = 'Please include at least one required checklist item.';
        errEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `${icon('loader', 14)} Dispatching...`;
      errEl.style.display = 'none';

      try {
        const payload = {
          student_ids:  [parseInt(studentId, 10)],
          interest_id:  interestId ? parseInt(interestId, 10) : null,
          posting_id:   postingId ? parseInt(postingId, 10) : null,
          title:        titleInput.value.trim() || 'Pre-Deployment OJT Document Packet',
          items:        items,
          due_date:     dueInput.value || null,
          instructions: notesInput.value.trim() || null,
        };

        const res = await apiPost('/supervisor/requirements/assign', payload);

        if (res?.success) {
          closeModal();
          if (typeof onAssigned === 'function') {
            onAssigned(res.data);
          }
        } else {
          errEl.textContent = res?.message || 'Failed to assign requirements. Please try again.';
          errEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('send', 13)} Assign & Notify Student`;
        }
      } catch (err) {
        errEl.textContent = err.message || 'An unexpected error occurred.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 13)} Assign & Notify Student`;
      }
    };
  }

  renderModal();
  document.body.appendChild(overlay);
}

/**
 * Open modal to review submitted OJT requirements (Approve or Request Revision).
 */
export function openReviewRequirementsModal({
  requirement,
  studentName = 'Student',
  requirementsDriveUrl = '',
  onReviewed = null,
  onReassign = null,
}) {
  const existing = document.getElementById('sup-req-modal-overlay');
  if (existing) existing.remove();

  const driveUrl = requirement.drive_url || requirementsDriveUrl || '';
  const items = Array.isArray(requirement.items) ? requirement.items : [];

  const overlay = document.createElement('div');
  overlay.id = 'sup-req-modal-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px;
  `;

  overlay.innerHTML = `
    <div style="background:var(--bg-card, #fff);border:1px solid var(--border-default, #e2e8f0);border-radius:14px;max-width:520px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 45px rgba(0,0,0,0.22);overflow:hidden;animation:sup-modal-in .18s ease-out;">
      
      <!-- Header -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-default, #e2e8f0);display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(0,89,48,0.04) 100%);">
        <div>
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#0f172a;">Review OJT Requirements</h3>
          <p style="margin:2px 0 0;font-size:0.8rem;color:#64748b;">
            Student: <strong>${studentName}</strong> &middot; Packet: ${requirement.title}
          </p>
        </div>
        <button type="button" id="sup-rev-close" style="background:none;border:none;cursor:pointer;color:#64748b;padding:4px;" aria-label="Close">
          ${icon('x', 18)}
        </button>
      </div>

      <div style="padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;">
        
        <!-- Drive Link Box -->
        <div style="background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.25);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="min-width:0;">
            <div style="font-size:0.72rem;font-weight:700;color:#0284c7;text-transform:uppercase;">Submitted Google Drive Folder</div>
            ${driveUrl ? `
              <a href="${driveUrl}" target="_blank" rel="noopener" style="font-size:0.85rem;color:#0f172a;font-weight:600;text-decoration:underline;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;" title="${driveUrl}">
                ${driveUrl}
              </a>
            ` : `<span style="font-size:0.8rem;color:#94a3b8;">No Drive link submitted yet.</span>`}
          </div>
          ${driveUrl ? `
            <a href="${driveUrl}" target="_blank" rel="noopener" class="btn btn--outline btn--sm" style="color:#0284c7;border-color:rgba(2,132,199,0.4);gap:5px;font-weight:600;white-space:nowrap;font-size:0.75rem;">
              ${icon('externalLink', 12)} Open Folder ↗
            </a>
          ` : ''}
        </div>

        <!-- Checklist of assigned items -->
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:#1e293b;text-transform:uppercase;margin-bottom:6px;">Assigned Checklist Items</div>
          <div style="display:flex;flex-direction:column;gap:5px;max-height:160px;overflow-y:auto;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            ${items.map(it => {
              const name = getReqItemName(it);
              return `
                <div style="font-size:0.78rem;color:#334155;display:flex;align-items:center;gap:6px;">
                  <span style="color:#005930;">${icon('checkCircle', 13)}</span>
                  <span>${name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Revision Remarks (hidden unless toggled or existing) -->
        <div id="sup-rev-remarks-box" style="${requirement.supervisor_remarks ? '' : 'display:none;'}">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:#dc2626;margin-bottom:5px;">
            Revision Instructions / Feedback for Student
          </label>
          <textarea id="sup-rev-remarks" rows="2" style="width:100%;padding:8px;font-size:0.8rem;border-radius:6px;border:1px solid #cbd5e1;" placeholder="Specify what document is missing, unreadable, or needs re-signing...">${requirement.supervisor_remarks || ''}</textarea>
        </div>

        <p id="sup-rev-error" style="color:#dc2626;font-size:0.78rem;margin:0;display:none;"></p>
      </div>

      <!-- Footer Actions -->
      <div style="padding:14px 20px;border-top:1px solid var(--border-default, #e2e8f0);display:flex;justify-content:space-between;align-items:center;gap:8px;background:#fafafa;">
        <div style="display:flex;align-items:center;gap:8px;">
          ${typeof onReassign === 'function' ? `
            <button type="button" id="sup-rev-reassign-btn" class="btn btn--ghost btn--sm" style="color:#64748b;font-size:0.75rem;padding:4px 8px;" title="Edit checklist or assign new packet">
              ${icon('edit', 12)} Reassign
            </button>
          ` : ''}
          <button type="button" id="sup-rev-toggle-revision" class="btn btn--outline btn--sm" style="color:#dc2626;border-color:rgba(220,38,38,0.3);font-size:0.75rem;">
            ${icon('alertTriangle', 12)} Request Revision
          </button>
        </div>
        <div style="display:flex;gap:8px;">
          <button type="button" id="sup-rev-cancel" class="btn btn--outline btn--sm">Cancel</button>
          <button type="button" id="sup-rev-approve-btn" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">
            ${icon('check', 13)} Approve & Verify
          </button>
        </div>
      </div>

    </div>
  `;

  const closeModal = () => overlay.remove();
  overlay.querySelector('#sup-rev-close').onclick = closeModal;
  overlay.querySelector('#sup-rev-cancel').onclick = closeModal;
  overlay.querySelector('#sup-rev-reassign-btn')?.addEventListener('click', () => {
    closeModal();
    onReassign();
  });
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  const remarksBox = overlay.querySelector('#sup-rev-remarks-box');
  const remarksInput = overlay.querySelector('#sup-rev-remarks');
  const toggleRevBtn = overlay.querySelector('#sup-rev-toggle-revision');
  const approveBtn = overlay.querySelector('#sup-rev-approve-btn');
  const errEl = overlay.querySelector('#sup-rev-error');

  // Toggle revision remarks
  toggleRevBtn.onclick = async () => {
    if (remarksBox.style.display === 'none') {
      remarksBox.style.display = 'block';
      remarksInput.focus();
      toggleRevBtn.textContent = 'Submit Revision Request';
      toggleRevBtn.classList.remove('btn--outline');
      toggleRevBtn.classList.add('btn--danger');
    } else {
      const remarks = remarksInput.value.trim();
      if (!remarks) {
        errEl.textContent = 'Please enter remarks explaining what needs to be revised.';
        errEl.style.display = 'block';
        return;
      }
      toggleRevBtn.disabled = true;
      toggleRevBtn.textContent = 'Sending...';
      try {
        const res = await apiPut(`/supervisor/requirements/${requirement.id}/review`, {
          status: 'needs_revision',
          remarks: remarks,
        });
        if (res?.success) {
          closeModal();
          if (typeof onReviewed === 'function') onReviewed(res.data);
        } else {
          errEl.textContent = res?.message || 'Failed to request revision.';
          errEl.style.display = 'block';
          toggleRevBtn.disabled = false;
        }
      } catch (e) {
        errEl.textContent = e.message || 'Error occurred.';
        errEl.style.display = 'block';
        toggleRevBtn.disabled = false;
      }
    }
  };

  // Approve button
  approveBtn.onclick = async () => {
    approveBtn.disabled = true;
    approveBtn.innerHTML = `${icon('loader', 13)} Verifying...`;
    try {
      const res = await apiPut(`/supervisor/requirements/${requirement.id}/review`, {
        status: 'verified',
        remarks: 'All documents verified and complete.',
      });
      if (res?.success) {
        closeModal();
        if (typeof onReviewed === 'function') onReviewed(res.data);
      } else {
        errEl.textContent = res?.message || 'Failed to verify requirements.';
        errEl.style.display = 'block';
        approveBtn.disabled = false;
        approveBtn.innerHTML = `${icon('check', 13)} Approve & Verify`;
      }
    } catch (e) {
      errEl.textContent = e.message || 'Error occurred.';
      errEl.style.display = 'block';
      approveBtn.disabled = false;
      approveBtn.innerHTML = `${icon('check', 13)} Approve & Verify`;
    }
  };

  document.body.appendChild(overlay);
}
