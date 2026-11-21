/* ==========================================================================
   OJT Requirements Assignment & Review Modal — Supervisor Portal
   ========================================================================== */

import { icon } from './icons.js';
import { apiPost, apiPut, apiDelete } from '../api/client.js';

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

function escapeHtml(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Open modal to assign OJT requirements to one student or batch assign to multiple/all students.
 */
export function openAssignRequirementsModal({
  studentId = null,
  studentName = 'Student',
  program = '',
  interestId = null,
  postingId = null,
  masterDriveUrl = '',
  // Batch parameters
  isBatch = false,
  selectedStudents = [],
  filteredStudents = [],
  allStudents = [],
  initialScope = 'selected',
  sectionFilterName = '',
  onAssigned = null,
}) {
  const existing = document.getElementById('sup-req-modal-overlay');
  if (existing) existing.remove();

  const isBatchMode = Boolean(isBatch || selectedStudents.length > 0 || (allStudents.length > 0 && !studentId));
  
  let currentScope = initialScope;
  if (!isBatchMode) {
    currentScope = 'single';
  } else if (currentScope === 'selected' && selectedStudents.length === 0) {
    currentScope = filteredStudents.length > 0 && filteredStudents.length < allStudents.length ? 'filtered' : 'all';
  }

  const activePreset = PRESETS.pre_deployment;
  let items = [...activePreset.items];
  let customTitle = activePreset.title;
  let customNotes = activePreset.instructions;
  let customMasterDrive = masterDriveUrl || '';

  if (!customMasterDrive && selectedStudents.length > 0) {
    const sWithDrive = selectedStudents.find(s => s.requirements?.master_drive_url);
    if (sWithDrive) customMasterDrive = sWithDrive.requirements.master_drive_url;
  }

  // Default due date to +14 days from now
  let customDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  let skipVerified = true;

  const overlay = document.createElement('div');
  overlay.id = 'sup-req-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px;
  `;

  function resolveTargetStudents() {
    if (!isBatchMode) {
      return [{ id: studentId, name: studentName, course: program }];
    }
    if (currentScope === 'selected') {
      return selectedStudents;
    }
    if (currentScope === 'filtered') {
      return filteredStudents.length > 0 ? filteredStudents : allStudents;
    }
    return allStudents;
  }

  function renderModal() {
    const targetStudents = resolveTargetStudents();
    const targetCount = targetStudents.length;

    // Count verified trainees in current target
    const verifiedInTarget = targetStudents.filter(s => {
      const r = s.requirements;
      return r && (r.status === 'verified' || r.is_verified);
    }).length;

    overlay.innerHTML = `
      <div style="background:var(--bg-card, #fff);border:1px solid var(--border-default, #e2e8f0);border-radius:14px;max-width:${isBatchMode ? '640px' : '560px'};width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 45px rgba(0,0,0,0.22);overflow:hidden;animation:sup-modal-in .18s ease-out;">
        
        <!-- Header -->
        <div style="padding:18px 22px;border-bottom:1px solid var(--border-default, #e2e8f0);display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(2,132,199,0.04) 100%);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('clipboardCheck', 22)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.12rem;font-weight:700;color:var(--text-primary, #0f172a);">
                ${isBatchMode ? 'Batch Assign OJT Requirement Packet' : 'Assign OJT Requirements'}
              </h3>
              <p style="margin:2px 0 0;font-size:0.8rem;color:var(--text-secondary, #64748b);">
                ${isBatchMode
                  ? `CHMSU OJT Practicum &middot; Batch Dispatch to <strong>${targetCount}</strong> student${targetCount !== 1 ? 's' : ''}`
                  : `Target: <strong>${escapeHtml(studentName)}</strong> ${program ? `&middot; ${escapeHtml(program)}` : ''}`
                }
              </p>
            </div>
          </div>
          <button type="button" id="sup-req-close" style="background:none;border:none;cursor:pointer;color:var(--text-secondary, #64748b);padding:4px;" aria-label="Close">
            ${icon('x', 18)}
          </button>
        </div>

        <!-- Form Body -->
        <form id="sup-req-form" style="padding:20px 22px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
          
          ${isBatchMode ? `
            <!-- Batch Audience Scope Selector -->
            <div>
              <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.03em;">
                Target Student Scope
              </label>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">
                <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid ${currentScope === 'selected' ? '#005930' : '#e2e8f0'};border-radius:8px;background:${currentScope === 'selected' ? 'rgba(0,89,48,0.06)' : '#fff'};cursor:pointer;font-size:0.8rem;">
                  <input type="radio" name="scope" value="selected" ${currentScope === 'selected' ? 'checked' : ''} ${selectedStudents.length === 0 ? 'disabled' : ''} />
                  <span><strong>Selected</strong> (${selectedStudents.length})</span>
                </label>
                <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid ${currentScope === 'filtered' ? '#005930' : '#e2e8f0'};border-radius:8px;background:${currentScope === 'filtered' ? 'rgba(0,89,48,0.06)' : '#fff'};cursor:pointer;font-size:0.8rem;">
                  <input type="radio" name="scope" value="filtered" ${currentScope === 'filtered' ? 'checked' : ''} />
                  <span><strong>Filtered</strong> (${filteredStudents.length > 0 ? filteredStudents.length : allStudents.length})</span>
                </label>
                <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid ${currentScope === 'all' ? '#005930' : '#e2e8f0'};border-radius:8px;background:${currentScope === 'all' ? 'rgba(0,89,48,0.06)' : '#fff'};cursor:pointer;font-size:0.8rem;">
                  <input type="radio" name="scope" value="all" ${currentScope === 'all' ? 'checked' : ''} />
                  <span><strong>All Section</strong> (${allStudents.length})</span>
                </label>
              </div>
            </div>

            <!-- Skip verified toggle -->
            ${verifiedInTarget > 0 ? `
              <div style="padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="font-size:0.78rem;color:#15803d;display:flex;align-items:center;gap:6px;">
                  ${icon('shieldCheck', 16)}
                  <span><strong>${verifiedInTarget}</strong> student(s) in this scope are already <strong>Verified</strong>.</span>
                </div>
                <label style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;color:#14532d;cursor:pointer;font-weight:600;">
                  <input type="checkbox" id="sup-req-skip-verified" ${skipVerified ? 'checked' : ''} />
                  Skip verified (Recommended)
                </label>
              </div>
            ` : ''}
          ` : ''}

          <!-- Template Preset Selector -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;">
              Template Preset
            </label>
            <select id="sup-req-preset" class="form-select" style="width:100%;padding:8px 12px;font-size:0.85rem;border-radius:8px;border:1px solid var(--border-default, #cbd5e1);background:var(--bg-card,#fff);">
              <option value="pre_deployment" ${customTitle.includes('Pre-Deployment') ? 'selected' : ''}>Pre-Deployment OJT Document Packet (CHED CMO 104)</option>
              <option value="midterm" ${customTitle.includes('Midterm') ? 'selected' : ''}>Midterm Progress &amp; Performance Packet</option>
              <option value="final_clearance" ${customTitle.includes('Final') ? 'selected' : ''}>Final OJT Clearance &amp; Completion Documents</option>
              <option value="custom" ${(!customTitle.includes('Pre-Deployment') && !customTitle.includes('Midterm') && !customTitle.includes('Final')) ? 'selected' : ''}>Custom Requirements</option>
            </select>
          </div>

          <!-- Packet Title -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:6px;">
              Packet Title
            </label>
            <input type="text" id="sup-req-title" class="form-input" value="${escapeHtml(customTitle)}" required style="width:100%;padding:8px 12px;font-size:0.88rem;border-radius:8px;border:1px solid var(--border-default, #cbd5e1);" />
          </div>

          <!-- Unified Master Google Drive Folder Link -->
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);margin-bottom:4px;">
              Unified Section / Batch Google Drive Folder Link <span style="color:#dc2626;">*</span>
            </label>
            <div style="position:relative;">
              <input type="url" id="sup-req-master-drive" class="form-input" placeholder="https://drive.google.com/drive/folders/..." value="${escapeHtml(customMasterDrive)}" style="width:100%;padding:8px 12px;font-size:0.85rem;border-radius:8px;border:1px solid var(--border-default, #cbd5e1);background:#fff;" required />
            </div>
            <p style="font-size:0.72rem;color:#0284c7;margin:4px 0 0;line-height:1.4;">
              Students will open this folder and create their personal trainee subfolder inside it. (Make sure folder access is set to <strong>"Anyone with link can edit"</strong>).
            </p>
          </div>

          <!-- Checklist Items -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-primary, #1e293b);text-transform:uppercase;letter-spacing:0.03em;">
                Required Checklist Items (${items.length})
              </label>
              <span style="font-size:0.72rem;color:#0284c7;font-weight:600;">Trainees will receive this exact checklist</span>
            </div>
            
            <div id="sup-req-items-list" style="display:flex;flex-direction:column;gap:6px;max-height:165px;overflow-y:auto;padding:8px 10px;border:1px solid var(--border-default, #e2e8f0);border-radius:8px;background:var(--bg-secondary, #f8fafc);">
              ${items.map((it, idx) => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;">
                  <span style="font-size:0.8rem;color:#1e293b;display:flex;align-items:center;gap:6px;">
                    <span style="color:#005930;">${icon('checkCircle', 13)}</span>
                    ${escapeHtml(getReqItemName(it))}
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
              <input type="date" id="sup-req-due" value="${customDueDate}" style="padding:6px 10px;font-size:0.85rem;border-radius:6px;border:1px solid #cbd5e1;background:#fff;" />
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
              Instructions / Notes for Trainees
            </label>
            <textarea id="sup-req-notes" rows="2" style="width:100%;padding:8px 10px;font-size:0.82rem;border-radius:8px;border:1px solid #cbd5e1;resize:vertical;" placeholder="Optional guidelines...">${escapeHtml(customNotes)}</textarea>
          </div>

          <!-- Notification preview alert -->
          <div style="padding:10px 12px;background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.22);border-radius:8px;display:flex;align-items:flex-start;gap:8px;font-size:0.75rem;color:#0369a1;">
            <span style="color:#0284c7;flex-shrink:0;margin-top:1px;">${icon('bell', 14)}</span>
            <span>
              ${isBatchMode
                ? `Assigning this packet will immediately dispatch in-app notifications and portfolio checklists to <strong>${targetCount} trainees</strong>.`
                : `Assigning this packet will immediately dispatch an in-app notification & checklist reminder to <strong>${escapeHtml(studentName)}</strong>.`
              }
            </span>
          </div>

          <p id="sup-req-error" style="color:#dc2626;font-size:0.78rem;margin:0;display:none;"></p>

          <!-- Footer -->
          <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-default, #e2e8f0);">
            <button type="button" id="sup-req-cancel" class="btn btn--outline btn--sm">Cancel</button>
            <button type="submit" id="sup-req-submit-btn" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;gap:6px;font-weight:600;">
              ${icon('send', 13)} ${isBatchMode ? `Dispatch Packet to ${targetCount} Trainee${targetCount !== 1 ? 's' : ''}` : 'Assign & Notify Student'}
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
    const skipVerifiedCheckbox = overlay.querySelector('#sup-req-skip-verified');
    const masterDriveInput = overlay.querySelector('#sup-req-master-drive');

    const closeModal = () => overlay.remove();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    // Scope change in batch mode
    overlay.querySelectorAll('input[name="scope"]').forEach(radio => {
      radio.onchange = () => {
        currentScope = radio.value;
        customTitle = titleInput.value;
        customNotes = notesInput.value;
        customDueDate = dueInput.value;
        customMasterDrive = masterDriveInput?.value || '';
        if (skipVerifiedCheckbox) skipVerified = skipVerifiedCheckbox.checked;
        renderModal();
      };
    });

    if (skipVerifiedCheckbox) {
      skipVerifiedCheckbox.onchange = () => {
        skipVerified = skipVerifiedCheckbox.checked;
      };
    }

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
      customTitle = titleInput.value;
      customNotes = notesInput.value;
      customDueDate = dueInput.value;
      customMasterDrive = masterDriveInput?.value || '';
      if (skipVerifiedCheckbox) skipVerified = skipVerifiedCheckbox.checked;
      renderModal();
    };

    // Quick due buttons
    overlay.querySelectorAll('.quick-due').forEach(b => {
      b.onclick = () => {
        const days = parseInt(b.dataset.days, 10);
        const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dueInput.value = d;
        customDueDate = d;
      };
    });

    // Delete item
    overlay.querySelectorAll('.del-req-item-btn').forEach(b => {
      b.onclick = () => {
        const idx = parseInt(b.dataset.idx, 10);
        items.splice(idx, 1);
        customTitle = titleInput.value;
        customNotes = notesInput.value;
        customDueDate = dueInput.value;
        customMasterDrive = masterDriveInput?.value || '';
        if (skipVerifiedCheckbox) skipVerified = skipVerifiedCheckbox.checked;
        renderModal();
      };
    });

    // Add item
    const addItem = () => {
      const v = newItemInput.value.trim();
      if (v) {
        items.push(v);
        newItemInput.value = '';
        customTitle = titleInput.value;
        customNotes = notesInput.value;
        customDueDate = dueInput.value;
        customMasterDrive = masterDriveInput?.value || '';
        if (skipVerifiedCheckbox) skipVerified = skipVerifiedCheckbox.checked;
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

      const masterDriveVal = masterDriveInput?.value.trim() || '';
      if (!masterDriveVal) {
        errEl.textContent = 'Please provide the Unified Section / Batch Google Drive Folder Link.';
        errEl.style.display = 'block';
        masterDriveInput?.focus();
        return;
      }

      const targets = resolveTargetStudents();
      const targetIds = targets.map(s => parseInt(s.id, 10)).filter(Boolean);

      if (!targetIds.length) {
        errEl.textContent = 'No eligible trainees selected to receive this packet.';
        errEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `${icon('loader', 14)} Dispatching to ${targetIds.length} trainee${targetIds.length !== 1 ? 's' : ''}...`;
      errEl.style.display = 'none';

      try {
        const payload = {
          student_ids:      targetIds,
          interest_id:      interestId ? parseInt(interestId, 10) : null,
          posting_id:       postingId ? parseInt(postingId, 10) : null,
          title:            titleInput.value.trim() || 'Pre-Deployment OJT Document Packet',
          items:            items,
          due_date:         dueInput.value || null,
          instructions:     notesInput.value.trim() || null,
          master_drive_url: masterDriveVal,
          skip_verified:    skipVerifiedCheckbox ? skipVerifiedCheckbox.checked : true,
        };

        const res = await apiPost('/supervisor/requirements/assign', payload);

        if (res?.success) {
          closeModal();
          if (typeof onAssigned === 'function') {
            onAssigned(res);
          }
        } else {
          errEl.textContent = res?.message || 'Failed to assign requirements. Please try again.';
          errEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('send', 13)} ${isBatchMode ? `Dispatch Packet to ${targetIds.length} Trainees` : 'Assign & Notify Student'}`;
        }
      } catch (err) {
        errEl.textContent = err.message || 'An unexpected error occurred.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 13)} ${isBatchMode ? `Dispatch Packet to ${targetIds.length} Trainees` : 'Assign & Notify Student'}`;
      }
    };
  }

  renderModal();
  document.body.appendChild(overlay);
}

/**
 * Open modal to review submitted OJT requirements (Granular Item Review, Batch Approval & Changes).
 */
export function openReviewRequirementsModal({
  requirement,
  studentName = 'Student',
  requirementsDriveUrl = '',
  masterDriveUrl = '',
  onReviewed = null,
  onReassign = null,
}) {
  const existing = document.getElementById('sup-req-modal-overlay');
  if (existing) existing.remove();

  let activeReq = requirement;
  let items = Array.isArray(activeReq.items) ? [...activeReq.items] : [];

  const overlay = document.createElement('div');
  overlay.id = 'sup-req-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px;
  `;

  function renderModal() {
    const totalItems = items.length;
    const approvedCount = items.filter(it => it.status === 'approved').length;
    const revisionCount = items.filter(it => it.status === 'needs_revision').length;

    const currentStatus = activeReq.status || 'pending';
    let statusLabel = 'Under Review';
    let statusBg = '#dbeafe';
    let statusColor = '#1e40af';
    let statusBorder = '#93c5fd';

    if (currentStatus === 'verified' || (approvedCount === totalItems && totalItems > 0)) {
      statusLabel = 'Approved & Verified';
      statusBg = '#dcfce7';
      statusColor = '#15803d';
      statusBorder = '#86efac';
    } else if (currentStatus === 'needs_revision' || revisionCount > 0) {
      statusLabel = 'Revision Requested';
      statusBg = '#fee2e2';
      statusColor = '#b91c1c';
      statusBorder = '#fca5a5';
    } else if (currentStatus === 'pending') {
      statusLabel = 'Submission Pending';
      statusBg = '#fef3c7';
      statusColor = '#92400e';
      statusBorder = '#fcd34d';
    }

    const studentDriveUrl = activeReq.drive_url || requirementsDriveUrl || '';
    const unifiedDriveUrl = activeReq.master_drive_url || masterDriveUrl || '';

    overlay.innerHTML = `
      <div style="background:var(--bg-card, #fff);border:1px solid var(--border-default, #e2e8f0);border-radius:14px;max-width:650px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 24px 50px rgba(0,0,0,0.22);overflow:hidden;animation:sup-modal-in .18s ease-out;">
        
        <!-- Header -->
        <div style="padding:16px 20px;border-bottom:1px solid var(--border-default, #e2e8f0);display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(2,132,199,0.05) 100%);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('clipboardCheck', 22)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#0f172a;">Review OJT Requirements</h3>
                <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};">
                  ${statusLabel}
                </span>
              </div>
              <p style="margin:2px 0 0;font-size:0.8rem;color:#64748b;">
                Trainee: <strong>${escapeHtml(studentName)}</strong> &middot; Packet: ${escapeHtml(activeReq.title || 'Pre-Deployment OJT')}
              </p>
            </div>
          </div>
          <button type="button" id="sup-rev-close" style="background:none;border:none;cursor:pointer;color:#64748b;padding:4px;" aria-label="Close">
            ${icon('x', 18)}
          </button>
        </div>

        <!-- Body Scroll -->
        <div style="padding:18px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;flex:1;">
          
          <!-- Dual Drive Links Row -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:10px;">
            <!-- Master Unified Drive -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div style="min-width:0;flex:1;">
                <div style="font-size:0.68rem;font-weight:700;color:#0284c7;text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:4px;">
                  ${icon('folder', 12)} Master Class Drive
                </div>
                ${unifiedDriveUrl ? `
                  <a href="${unifiedDriveUrl}" target="_blank" rel="noopener" style="font-size:0.78rem;color:#0f172a;font-weight:600;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${unifiedDriveUrl}">
                    ${unifiedDriveUrl}
                  </a>
                ` : `<span style="font-size:0.75rem;color:#94a3b8;">No master drive link configured</span>`}
              </div>
              ${unifiedDriveUrl ? `
                <a href="${unifiedDriveUrl}" target="_blank" rel="noopener" class="btn btn--outline btn--sm" style="font-size:0.72rem;padding:4px 8px;gap:4px;white-space:nowrap;color:#0284c7;border-color:#bae6fd;">
                  ${icon('externalLink', 11)} Open
                </a>
              ` : ''}
            </div>

            <!-- Student Subfolder -->
            <div style="background:rgba(0,89,48,0.04);border:1px solid rgba(0,89,48,0.2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div style="min-width:0;flex:1;">
                <div style="font-size:0.68rem;font-weight:700;color:#005930;text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:4px;">
                  ${icon('folderOpen', 12)} Student Subfolder Link
                </div>
                ${studentDriveUrl ? `
                  <a href="${studentDriveUrl}" target="_blank" rel="noopener" style="font-size:0.78rem;color:#005930;font-weight:700;text-decoration:underline;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${studentDriveUrl}">
                    ${studentDriveUrl}
                  </a>
                ` : `<span style="font-size:0.75rem;color:#b45309;">Folder link not submitted yet</span>`}
              </div>
              ${studentDriveUrl ? `
                <a href="${studentDriveUrl}" target="_blank" rel="noopener" class="btn btn--sm" style="background:#005930;color:#fff;font-size:0.72rem;padding:4px 10px;gap:4px;white-space:nowrap;border:none;">
                  ${icon('externalLink', 11)} Open Folder
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Progress & Batch Action Bar -->
          <div style="background:var(--bg-secondary, #f8fafc);border:1px solid var(--border-default, #e2e8f0);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:0.84rem;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:6px;">
                <span>Verified Requirements:</span>
                <span style="color:#005930;font-size:0.95rem;">${approvedCount}</span> / <span>${totalItems}</span>
              </div>
              <div style="font-size:0.74rem;color:#64748b;margin-top:2px;">
                ${approvedCount === totalItems && totalItems > 0
                  ? 'All checklist items verified. Student is cleared to apply!'
                  : `${totalItems - approvedCount} item${totalItems - approvedCount !== 1 ? 's' : ''} still require approval before placement.`
                }
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" id="sup-toggle-add-item-btn" class="btn btn--outline btn--sm" style="font-size:0.75rem;padding:5px 10px;gap:5px;">
                ${icon('plus', 12)} Add Requirement
              </button>
              <button type="button" id="sup-batch-approve-btn" class="btn btn--primary btn--sm" style="background:#005930;border-color:#005930;color:#fff;font-size:0.75rem;padding:5px 12px;gap:5px;font-weight:700;">
                ${icon('checkCircle', 13)} Batch Approve All
              </button>
            </div>
          </div>

          <!-- Dynamic Add Item Box (Hidden unless toggled) -->
          <div id="sup-add-item-box" style="display:none;background:#ffffff;border:1px dashed #cbd5e1;border-radius:10px;padding:12px;gap:8px;align-items:center;">
            <input type="text" id="sup-new-item-name" placeholder="Document title (e.g. Drug Test Result, SSS E-1)..." style="flex:1;padding:6px 10px;font-size:0.82rem;border:1px solid #cbd5e1;border-radius:6px;" />
            <button type="button" id="sup-confirm-add-item-btn" class="btn btn--primary btn--sm" style="font-size:0.75rem;padding:6px 12px;background:#005930;color:#fff;">
              Add Document
            </button>
            <button type="button" id="sup-cancel-add-item-btn" class="btn btn--ghost btn--sm" style="font-size:0.75rem;padding:6px 8px;">
              Cancel
            </button>
          </div>

          <!-- Checklist Items Granular List -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="font-size:0.74rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">
              Document Checklist &amp; Granular Verification
            </div>

            ${items.map((it, idx) => {
              const itName = getReqItemName(it);
              const itStatus = it.status || 'pending';
              const itRemarks = it.remarks || '';
              const isApproved = itStatus === 'approved';
              const isRevision = itStatus === 'needs_revision';

              return `
                <div class="sup-req-item-row" data-id="${escapeHtml(it.id)}" style="background:#ffffff;border:1px solid ${isApproved ? '#bbf7d0' : isRevision ? '#fecaca' : '#e2e8f0'};border-radius:10px;padding:10px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.02);transition:all 0.15s ease;">
                  
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">
                      <span style="width:24px;height:24px;border-radius:6px;background:${isApproved ? 'rgba(16,185,129,0.12)' : isRevision ? 'rgba(239,68,68,0.12)' : 'rgba(0,89,48,0.08)'};color:${isApproved ? '#059669' : isRevision ? '#dc2626' : '#005930'};display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;">
                        ${isApproved ? icon('check', 13) : (idx + 1)}
                      </span>
                      <div>
                        <strong style="font-size:0.84rem;color:#0f172a;line-height:1.3;display:block;">${escapeHtml(itName)}</strong>
                        <span style="font-size:0.68rem;padding:1px 6px;border-radius:4px;background:${isApproved ? '#dcfce7;color:#15803d;border:1px solid #86efac;' : isRevision ? '#fee2e2;color:#b91c1c;border:1px solid #fca5a5;' : '#fef3c7;color:#92400e;border:1px solid #fcd34d;'};font-weight:700;display:inline-flex;align-items:center;gap:3px;margin-top:2px;">
                          ${isApproved ? `${icon('check', 10)} Approved` : isRevision ? `${icon('alertTriangle', 10)} Revision Needed` : `${icon('clock', 10)} Pending Review`}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex;align-items:center;gap:6px;">
                      ${!isApproved ? `
                        <button type="button" class="btn btn--sm btn-approve-single" data-id="${escapeHtml(it.id)}" style="background:#005930;color:#fff;border-color:#005930;font-size:0.74rem;padding:4px 10px;gap:4px;font-weight:600;" title="Approve this requirement">
                          ${icon('check', 12)} Approve
                        </button>
                      ` : `
                        <span style="font-size:0.75rem;color:#15803d;font-weight:700;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;">
                          ${icon('checkCircle', 13)} Verified
                        </span>
                      `}

                      <button type="button" class="btn btn--outline btn--sm btn-toggle-revision" data-id="${escapeHtml(it.id)}" style="color:#dc2626;border-color:rgba(220,38,38,0.3);font-size:0.74rem;padding:4px 9px;gap:4px;" title="Request changes or add feedback">
                        ${icon('alertTriangle', 11)} ${isRevision ? 'Edit Feedback' : 'Request Changes'}
                      </button>

                      <button type="button" class="btn btn--ghost btn--xs btn-delete-item" data-id="${escapeHtml(it.id)}" data-name="${escapeHtml(itName)}" style="color:#94a3b8;padding:4px 6px;" title="Remove this requirement">
                        ${icon('x', 14)}
                      </button>
                    </div>
                  </div>

                  <!-- Feedback Note if in revision -->
                  ${isRevision && itRemarks ? `
                    <div style="margin-top:8px;padding:8px 10px;background:#fef2f2;border-left:3px solid #ef4444;border-radius:6px;font-size:0.76rem;color:#991b1b;line-height:1.45;">
                      <strong>Supervisor Note:</strong> "${escapeHtml(itRemarks)}"
                    </div>
                  ` : ''}

                  <!-- Inline Revision Drawer (Hidden by default) -->
                  <div class="revision-drawer" data-id="${escapeHtml(it.id)}" style="display:none;margin-top:8px;padding:8px 10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;">
                    <label style="display:block;font-size:0.72rem;font-weight:700;color:#dc2626;margin-bottom:4px;">
                      Feedback for Student (What needs to be corrected?):
                    </label>
                    <textarea class="revision-remarks-input" rows="2" style="width:100%;padding:6px;font-size:0.78rem;border:1px solid #cbd5e1;border-radius:6px;" placeholder="e.g. Incomplete notarization on page 2, missing signature...">${escapeHtml(itRemarks)}</textarea>
                    <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:6px;">
                      <button type="button" class="btn btn--ghost btn--xs cancel-revision-btn" data-id="${escapeHtml(it.id)}" style="font-size:0.72rem;">Cancel</button>
                      <button type="button" class="btn btn--primary btn--xs submit-revision-btn" data-id="${escapeHtml(it.id)}" style="background:#dc2626;border-color:#dc2626;color:#fff;font-size:0.72rem;padding:4px 10px;">Send Feedback</button>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <p id="sup-rev-error" style="color:#dc2626;font-size:0.78rem;margin:0;display:none;"></p>
        </div>

        <!-- Footer -->
        <div style="padding:12px 20px;border-top:1px solid var(--border-default, #e2e8f0);display:flex;justify-content:space-between;align-items:center;background:#fafafa;">
          <div>
            ${typeof onReassign === 'function' ? `
              <button type="button" id="sup-rev-reassign-btn" class="btn btn--ghost btn--sm" style="color:#64748b;font-size:0.75rem;padding:5px 8px;">
                ${icon('edit', 12)} Reassign Packet
              </button>
            ` : ''}
          </div>
          <button type="button" id="sup-rev-done-btn" class="btn btn--outline btn--sm" style="padding:6px 16px;">
            Done &amp; Close
          </button>
        </div>

      </div>
    `;

    bindModalEvents();
  }

  function bindModalEvents() {
    const closeModal = () => {
      overlay.remove();
      if (typeof onReviewed === 'function') onReviewed(activeReq);
    };

    overlay.querySelector('#sup-rev-close').onclick = closeModal;
    overlay.querySelector('#sup-rev-done-btn').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    overlay.querySelector('#sup-rev-reassign-btn')?.addEventListener('click', () => {
      overlay.remove();
      if (typeof onReassign === 'function') onReassign();
    });

    const errEl = overlay.querySelector('#sup-rev-error');

    // Toggle Add Item box
    const toggleAddBtn = overlay.querySelector('#sup-toggle-add-item-btn');
    const addItemBox = overlay.querySelector('#sup-add-item-box');
    const newItemInput = overlay.querySelector('#sup-new-item-name');
    const confirmAddBtn = overlay.querySelector('#sup-confirm-add-item-btn');
    const cancelAddBtn = overlay.querySelector('#sup-cancel-add-item-btn');

    if (toggleAddBtn) {
      toggleAddBtn.onclick = () => {
        const isHidden = addItemBox.style.display === 'none';
        addItemBox.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) newItemInput.focus();
      };
    }
    if (cancelAddBtn) {
      cancelAddBtn.onclick = () => {
        addItemBox.style.display = 'none';
        newItemInput.value = '';
      };
    }
    if (confirmAddBtn) {
      confirmAddBtn.onclick = async () => {
        const name = newItemInput.value.trim();
        if (!name) return;
        confirmAddBtn.disabled = true;
        try {
          const res = await apiPost(`/supervisor/requirements/${activeReq.id}/items`, { name });
          if (res?.success) {
            activeReq = res.data;
            items = Array.isArray(res.data.items) ? [...res.data.items] : [];
            renderModal();
            if (typeof onReviewed === 'function') onReviewed(activeReq);
          } else {
            errEl.textContent = res?.message || 'Failed to add item.';
            errEl.style.display = 'block';
            confirmAddBtn.disabled = false;
          }
        } catch (e) {
          errEl.textContent = e.message || 'Error adding item.';
          errEl.style.display = 'block';
          confirmAddBtn.disabled = false;
        }
      };
    }

    // Batch Approve
    const batchBtn = overlay.querySelector('#sup-batch-approve-btn');
    if (batchBtn) {
      batchBtn.onclick = async () => {
        batchBtn.disabled = true;
        batchBtn.innerHTML = `${icon('loader', 13)} Approving...`;
        try {
          const res = await apiPut(`/supervisor/requirements/${activeReq.id}/batch-approve`);
          if (res?.success) {
            activeReq = res.data;
            items = Array.isArray(res.data.items) ? [...res.data.items] : [];
            renderModal();
            if (typeof onReviewed === 'function') onReviewed(activeReq);
          } else {
            errEl.textContent = res?.message || 'Failed to batch approve.';
            errEl.style.display = 'block';
            batchBtn.disabled = false;
          }
        } catch (e) {
          errEl.textContent = e.message || 'Error occurred.';
          errEl.style.display = 'block';
          batchBtn.disabled = false;
        }
      };
    }

    // Approve Single Item
    overlay.querySelectorAll('.btn-approve-single').forEach(btn => {
      btn.onclick = async () => {
        const itemId = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = `${icon('loader', 12)}...`;
        try {
          const res = await apiPut(`/supervisor/requirements/${activeReq.id}/item-review`, {
            item_id: itemId,
            action:  'approve',
          });
          if (res?.success) {
            activeReq = res.data;
            items = Array.isArray(res.data.items) ? [...res.data.items] : [];
            renderModal();
            if (typeof onReviewed === 'function') onReviewed(activeReq);
          } else {
            errEl.textContent = res?.message || 'Approval failed.';
            errEl.style.display = 'block';
            btn.disabled = false;
          }
        } catch (e) {
          errEl.textContent = e.message || 'Approval error.';
          errEl.style.display = 'block';
          btn.disabled = false;
        }
      };
    });

    // Toggle Revision Drawer
    overlay.querySelectorAll('.btn-toggle-revision').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.dataset.id;
        const drawer = overlay.querySelector(`.revision-drawer[data-id="${itemId}"]`);
        if (drawer) {
          const isHidden = drawer.style.display === 'none';
          drawer.style.display = isHidden ? 'block' : 'none';
          if (isHidden) {
            drawer.querySelector('textarea')?.focus();
          }
        }
      };
    });

    overlay.querySelectorAll('.cancel-revision-btn').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.dataset.id;
        const drawer = overlay.querySelector(`.revision-drawer[data-id="${itemId}"]`);
        if (drawer) drawer.style.display = 'none';
      };
    });

    // Submit Revision Feedback
    overlay.querySelectorAll('.submit-revision-btn').forEach(btn => {
      btn.onclick = async () => {
        const itemId = btn.dataset.id;
        const drawer = overlay.querySelector(`.revision-drawer[data-id="${itemId}"]`);
        const textarea = drawer?.querySelector('.revision-remarks-input');
        const remarks = textarea?.value.trim() || '';

        if (!remarks) {
          errEl.textContent = 'Please enter feedback on what the student needs to correct.';
          errEl.style.display = 'block';
          textarea?.focus();
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending...';
        try {
          const res = await apiPut(`/supervisor/requirements/${activeReq.id}/item-review`, {
            item_id: itemId,
            action:  'request_changes',
            remarks: remarks,
          });
          if (res?.success) {
            activeReq = res.data;
            items = Array.isArray(res.data.items) ? [...res.data.items] : [];
            renderModal();
            if (typeof onReviewed === 'function') onReviewed(activeReq);
          } else {
            errEl.textContent = res?.message || 'Revision request failed.';
            errEl.style.display = 'block';
            btn.disabled = false;
          }
        } catch (e) {
          errEl.textContent = e.message || 'Error occurred.';
          errEl.style.display = 'block';
          btn.disabled = false;
        }
      };
    });

    // Delete item
    overlay.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.onclick = async () => {
        const itemId = btn.dataset.id;
        const itemName = btn.dataset.name || 'this requirement';
        if (!confirm(`Remove "${itemName}" from this student's requirements checklist?`)) return;

        btn.disabled = true;
        try {
          const res = await apiDelete(`/supervisor/requirements/${activeReq.id}/items/${itemId}`);
          if (res?.success) {
            activeReq = res.data;
            items = Array.isArray(res.data.items) ? [...res.data.items] : [];
            renderModal();
            if (typeof onReviewed === 'function') onReviewed(activeReq);
          } else {
            errEl.textContent = res?.message || 'Failed to remove requirement.';
            errEl.style.display = 'block';
            btn.disabled = false;
          }
        } catch (e) {
          errEl.textContent = e.message || 'Error removing item.';
          errEl.style.display = 'block';
          btn.disabled = false;
        }
      };
    });
  }

  renderModal();
  document.body.appendChild(overlay);
}
