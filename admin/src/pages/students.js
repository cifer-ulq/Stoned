import { apiGet, apiGetCached, getCached, apiPost, storageUrl } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { openStudentImportModal } from '../components/student-import-modal.js';
import { openBroadcastModal } from '../components/broadcast-modal.js';

const STATUS_COLORS = {
  'Active OJT': 'success',
  'Undeployed': 'warning',
};

const COURSE_ACRONYM_MAP = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Computer Engineering': 'BSCpE',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Industrial Technology': 'BSIndTech',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Accountancy': 'BSA',
  'Bachelor of Science in Hospitality Management': 'BSHM',
  'Bachelor of Science in Tourism Management': 'BSTM',
  'Bachelor of Science in Criminology': 'BSCrim',
  'Bachelor of Science in Nursing': 'BSN',
  'Bachelor of Science in Civil Engineering': 'BSCE',
  'Bachelor of Science in Mechanical Engineering': 'BSME',
  'Bachelor of Science in Electrical Engineering': 'BSEE',
  'Bachelor of Science in Electronics Engineering': 'BSECE',
  'Bachelor of Science in Agriculture': 'BSA',
  'Bachelor of Science in Fisheries': 'BSF',
  'Bachelor of Science in Psychology': 'BSPsych',
  'Bachelor of Secondary Education': 'BSED',
  'Bachelor of Elementary Education': 'BEED',
  'Bachelor of Technology and Livelihood Education': 'BTLED',
};

function formatCourseOption(course) {
  const acr = COURSE_ACRONYM_MAP[course];
  return acr ? `${course} (${acr})` : course;
}

function getCourseAcronym(course) {
  if (!course) return '—';
  return COURSE_ACRONYM_MAP[course] || course;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function escapeHtml(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Graduation Promotion Modal ─────────────────────────────────── */
function openPromoteModal({ students, onPromote, container }) {
  if (!students || !students.length) return;

  const existing = container.querySelector('.modal-backdrop-promote');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop-promote';
  backdrop.style.zIndex = '1000';

  const getDynamicSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const candidatePortfolioBatch = students.map(s => s.batch).find(b => b && String(b).trim() !== '');
  const defaultBatch = candidatePortfolioBatch ? candidatePortfolioBatch.trim() : getDynamicSchoolYear();

  backdrop.innerHTML = `
    <div class="modal gpm-modal anim-scale-in">
      <div class="gpm-header">
        <div class="gpm-header__left">
          <div class="gpm-header__icon">
            ${icon('graduation-cap', 22)}
          </div>
          <div>
            <h3 class="gpm-header__title">Promote to Alumni / Graduate</h3>
            <p class="gpm-header__sub">${students.length} student${students.length !== 1 ? 's' : ''} verified (Hours + Company Evaluation)</p>
          </div>
        </div>
        <button class="modal__close" id="gpm-close" aria-label="Close">${icon('x', 16)}</button>
      </div>

      <div class="gpm-body">
        <div class="gpm-alert">
          <div class="gpm-alert__title">
            ${icon('award', 15)} Dual-Gate Requirements Verified
          </div>
          <div>Each candidate has completed the required 600 hours of on-the-job training and received an approved performance evaluation from their host company. Promoting them updates their status to <strong>Graduate / Alumni</strong> and records them in the alumni network.</div>
        </div>

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label class="gpm-field-label" for="gpm-batch-year" style="margin-bottom:0;">
              Graduation Batch / School Year
            </label>
            <span class="badge badge--info" style="font-size:0.7rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
              ${icon('calendar', 11)} Auto-detected from Portfolio
            </span>
          </div>
          <input type="text" id="gpm-batch-year" class="gpm-input" value="${defaultBatch}" placeholder="e.g. ${defaultBatch}" />
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:5px;display:flex;align-items:center;gap:4px;">
            ${icon('info', 11)} Auto-filled with 4th Year Academic School Year (S.Y. ${defaultBatch}). You can edit if needed.
          </div>
        </div>

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label class="gpm-field-label" style="margin-bottom:0;">
              Selected Candidate${students.length !== 1 ? 's' : ''}
            </label>
            <span class="badge badge--neutral" style="font-size:0.7rem;font-weight:600;">
              ${students.length} Total
            </span>
          </div>
          <div class="gpm-students-list">
            ${students.map(st => `
              <div class="gpm-student-item">
                <div>
                  <div class="gpm-student-item__name">${st.name}</div>
                  <div class="gpm-student-item__meta">
                    ${st.program || 'No Program'}${st.section ? ' &middot; ' + st.section : ''} &middot; ID: ${st.student_id || '—'}
                    ${st.batch ? ` &middot; <strong style="color:var(--color-primary);">S.Y. ${st.batch}</strong>` : ''}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span class="badge badge--info" style="font-size:0.72rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    ${icon('check-circle', 11)} ${st.ojt_hours}h / ${st.ojt_required || 600}h
                  </span>
                  <span class="badge badge--success" style="font-size:0.72rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    <span style="color:#F59E0B;">★</span> ${Number(st.evaluation_score || 5).toFixed(1)} Eval
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="gpm-footer">
        <button class="btn btn--outline btn--sm" id="gpm-cancel">Cancel</button>
        <button class="btn btn--primary btn--sm" id="gpm-confirm-btn" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('graduation-cap', 14)} Confirm & Promote
        </button>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  const close = () => backdrop.remove();
  backdrop.querySelector('#gpm-close').addEventListener('click', close);
  backdrop.querySelector('#gpm-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const confirmBtn = backdrop.querySelector('#gpm-confirm-btn');
  confirmBtn.addEventListener('click', async () => {
    const batch = backdrop.querySelector('#gpm-batch-year').value.trim() || defaultBatch;
    const studentIds = students.map(s => s.id);

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="sim-spinner"></span> Promoting...`;

    try {
      const res = await apiPost('/admin/students/promote-graduates', {
        student_ids: studentIds,
        batch,
      });

      if (res && res.success) {
        close();
        if (typeof onPromote === 'function') onPromote(res);
      } else {
        alert(res?.message || 'Failed to promote students. Please verify all requirements.');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `${icon('graduation-cap', 14)} Confirm & Promote`;
        renderIcons();
      }
    } catch (err) {
      alert('Error promoting students: ' + (err.message || 'Network error'));
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `${icon('graduation-cap', 14)} Confirm & Promote`;
      renderIcons();
    }
  });
}

/* ─── Modal ─────────────────────────────────────────────────────── */
function showModal(s, container, onRefresh) {
  const existing = container.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const pct = s.ojt_required > 0
    ? Math.min(100, Math.round((s.ojt_hours / s.ojt_required) * 100))
    : 0;

  const statusKey = s.status === 'Active OJT' ? 'ojt' : 'other';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal spm-modal">
      <!-- Hero -->
      <div class="spm-hero">
        <div class="spm-hero__inner">
          <div class="spm-hero__avatar">
            ${s.avatar_url
              ? `<img src="${storageUrl(s.avatar_url)}" alt="${s.name}" />`
              : initials(s.name)}
          </div>
          <div class="spm-hero__info">
            <h3 class="spm-hero__name">${s.name}</h3>
            <p class="spm-hero__program">${s.program || 'No Program'}${s.year_level ? ' &middot; ' + s.year_level : ''}</p>
            <div class="spm-hero__badges">
              <span class="spm-badge spm-badge--${statusKey}">
                <span class="spm-badge__dot"></span>${s.status}
              </span>
              <span class="spm-badge">${icon('mail', 11)} ${s.email}</span>
            </div>
          </div>
        </div>
        <button class="spm-hero__close" id="modal-close" aria-label="Close">${icon('x', 16)}</button>
      </div>

      <!-- Body -->
      <div class="spm-body">
        <!-- Quick stat tiles -->
        <div class="spm-tiles">
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('map-pin', 14)}</div>
            <span class="spm-tile__val">${s.campus || '—'}</span>
            <div class="spm-tile__lbl">Campus</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('users', 14)}</div>
            <span class="spm-tile__val">${s.section || '—'}</span>
            <div class="spm-tile__lbl">Section</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('calendar', 14)}</div>
            <span class="spm-tile__val">${s.batch || '—'}</span>
            <div class="spm-tile__lbl">Batch</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('award', 14)}</div>
            <span class="spm-tile__val">${s.year_level || '—'}</span>
            <div class="spm-tile__lbl">Year</div>
          </div>
        </div>

        <!-- OJT Progress -->
        <div>
          <div class="spm-sec-head">${icon('briefcase', 12)} OJT Progress</div>
          <div class="spm-ojt">
            <div class="spm-ojt__top">
              <span class="spm-ojt__company${!s.ojt_company ? ' spm-ojt__company--none' : ''}">
                ${s.ojt_company || 'Not yet assigned'}
              </span>
              <span class="spm-ojt__pct">${pct}%</span>
            </div>
            <div class="spm-ojt__track">
              <div class="spm-ojt__fill" data-pct="${pct}"></div>
            </div>
            <div class="spm-ojt__meta">
              <span>${s.ojt_hours || 0} / ${s.ojt_required || 0} hours logged</span>
              <span>${s.ojt_status || 'No record'}</span>
            </div>
          </div>
        </div>

        <!-- Host Company Evaluation Assessment -->
        <div>
          <div class="spm-sec-head">${icon('award', 12)} Host Company Performance Assessment</div>
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:12px 14px;">
            ${s.evaluation_status === 'submitted' ? `
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="badge badge--success" style="display:inline-flex;align-items:center;gap:4px;font-weight:700;">
                    ${icon('check-circle', 12)} Evaluation Verified
                  </span>
                  ${s.evaluation_date ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.evaluation_date}</span>` : ''}
                </div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:4px;">
                  <span style="color:#F59E0B;">★</span> ${Number(s.evaluation_score || 5).toFixed(1)} <span style="font-size:var(--text-xs);color:var(--text-tertiary);font-weight:var(--weight-normal);">/ 5.0</span>
                </div>
              </div>
              <div style="font-size:var(--text-xs);color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                ${icon('user-check', 13)} Evaluated by: <strong>${s.evaluator_name || 'Host Company Supervisor'}</strong> ${s.evaluator_position ? `(${s.evaluator_position})` : ''}
              </div>
            ` : s.evaluation_status === 'pending' ? `
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge badge--warning" style="display:inline-flex;align-items:center;gap:4px;font-weight:600;">
                  ${icon('clock', 12)} Evaluation Pending
                </span>
                <span style="font-size:var(--text-xs);color:var(--text-secondary);">
                  Requested from ${s.ojt_company || 'Host Company'}. Required before graduation promotion.
                </span>
              </div>
            ` : `
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge badge--neutral" style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-tertiary);">
                  ${icon('alert-circle', 12)} Not Evaluated
                </span>
                <span style="font-size:var(--text-xs);color:var(--text-secondary);">
                  Host company has not submitted an evaluation yet. Required before graduation promotion.
                </span>
              </div>
            `}
          </div>
        </div>

        <!-- Skills -->
        <div>
          <div class="spm-sec-head">${icon('layers', 12)} Skills</div>
          <div class="spm-skills">
            ${s.skills && s.skills.length
              ? s.skills.map(sk => `<span class="spm-skill">${sk}</span>`).join('')
              : `<span class="spm-skill spm-skill--empty">No skills listed yet</span>`}
          </div>
        </div>

        ${(s.portfolio_url || s.phone) ? `
        <!-- Links -->
        <div class="spm-links">
          ${s.portfolio_url
            ? `<a href="${s.portfolio_url}" target="_blank" rel="noopener noreferrer" class="spm-link-btn spm-link-btn--portfolio">${icon('link', 12)} Portfolio</a>`
            : ''}
          ${s.phone
            ? `<span class="spm-link-btn spm-link-btn--phone">${icon('phone', 12)} ${s.phone}</span>`
            : ''}
        </div>` : ''}
      </div>

      <!-- Footer -->
      <div class="spm-footer">
        <div class="spm-footer__id">
          ${icon('user', 12)}
          <span class="spm-footer__id-val">${s.student_id || 'No ID'}</span>
        </div>
        <div class="spm-footer__actions">
          ${s.is_eligible_for_promotion ? `
            <button class="btn btn--primary btn--sm" id="modal-promote-btn" style="display:inline-flex;align-items:center;gap:6px;">
              ${icon('graduation-cap', 14)} Promote to Graduate
            </button>
          ` : `
            <span class="badge badge--neutral" title="${s.ineligible_reason || 'Dual-gate requirements not met'}" style="font-size:0.75rem;padding:6px 10px;cursor:help;display:inline-flex;align-items:center;gap:5px;background:var(--bg-secondary);border:1px solid var(--border-default);color:var(--text-secondary);">
              ${icon('lock', 12)} Promotion Locked: ${s.evaluation_status !== 'submitted' ? 'Evaluation Required' : 'Hours Incomplete'}
            </span>
          `}
          <button class="btn btn--outline btn--sm" id="modal-cancel">Close</button>
          <a href="mailto:${s.email}" class="btn btn--primary btn--sm">${icon('mail', 13)} Contact</a>
        </div>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  // Animate OJT bar after paint
  requestAnimationFrame(() => {
    const fill = backdrop.querySelector('.spm-ojt__fill');
    if (fill) fill.style.width = (fill.dataset.pct || 0) + '%';
  });

  const close = () => backdrop.remove();
  backdrop.querySelector('#modal-close').addEventListener('click', close);
  backdrop.querySelector('#modal-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const promoteBtn = backdrop.querySelector('#modal-promote-btn');
  if (promoteBtn) {
    promoteBtn.addEventListener('click', () => {
      openPromoteModal({
        students: [s],
        onPromote: () => {
          close();
          if (typeof onRefresh === 'function') onRefresh();
        },
        container,
      });
    });
  }
}

/* ─── Table rows renderer ───────────────────────────────────────── */
function renderTable(tbody, list, container, selectedStudents, updateSelectionUI, onRefresh) {
  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
            <h3 class="empty-state__title">No students found</h3>
            <p class="empty-state__text">Try adjusting your search or filters</p>
          </div>
        </td>
      </tr>`;
    if (typeof updateSelectionUI === 'function') updateSelectionUI();
    return;
  }

  tbody.innerHTML = list.map(s => {
    const pct = s.ojt_required > 0
      ? Math.min(100, Math.round((s.ojt_hours / s.ojt_required) * 100))
      : 0;
    const badgeColor = STATUS_COLORS[s.status] || 'neutral';
    const barColor = pct >= 100 ? '#3B82F6' : pct >= 40 ? '#10B981' : '#F59E0B';
    const isEligible = Boolean(s.is_eligible_for_promotion);
    const isChecked = selectedStudents ? selectedStudents.has(s.id) : false;
    const acr = getCourseAcronym(s.program);

    return `
      <tr data-id="${s.id}">
        <!-- Checkbox -->
        <td style="text-align:center;width:38px;padding:10px 8px;">
          ${isEligible
            ? `<input type="checkbox" class="student-select-cb" data-id="${s.id}" ${isChecked ? 'checked' : ''} title="Eligible: Completed ${s.ojt_hours}h / ${s.ojt_required || 600}h OJT + Company Evaluated (${Number(s.evaluation_score || 5).toFixed(1)}★)" style="cursor:pointer;width:15px;height:15px;" />`
            : `<input type="checkbox" disabled title="Ineligible: ${escapeHtml(s.ineligible_reason || 'Requirements not met')}" style="cursor:not-allowed;opacity:0.25;width:15px;height:15px;" />`}
        </td>

        <!-- Student -->
        <td style="padding:10px 12px;min-width:180px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${s.avatar_url
              ? `<img src="${storageUrl(s.avatar_url)}" alt="${escapeHtml(s.name)}" style="width:34px;height:34px;border-radius:var(--radius-full);object-fit:cover;flex-shrink:0;border:1px solid var(--border-default);" />`
              : `<div style="width:34px;height:34px;border-radius:var(--radius-full);background:var(--color-primary-bg);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:0.75rem;flex-shrink:0;border:1px solid rgba(0,89,48,0.15);">${initials(s.name)}</div>`}
            <div style="min-width:0;max-width:180px;">
              <div style="font-weight:600;color:var(--text-primary);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(s.email)}">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>

        <!-- Student ID -->
        <td style="padding:10px 12px;white-space:nowrap;">
          <span style="font-family:monospace;font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${escapeHtml(s.student_id || '—')}</span>
        </td>

        <!-- Program & Section -->
        <td style="padding:10px 12px;white-space:nowrap;">
          <div style="font-weight:600;color:var(--text-primary);font-size:0.82rem;" title="${escapeHtml(s.program || '')}">${escapeHtml(acr)}</div>
          <div style="font-size:0.72rem;color:var(--text-secondary);display:flex;align-items:center;gap:4px;margin-top:2px;">
            <span>${escapeHtml(s.year_level || '—')}</span>
            ${s.section ? `<span>·</span><span class="badge badge--info" style="font-size:0.65rem;padding:0 5px;font-weight:700;">${escapeHtml(s.section)}</span>` : ''}
          </div>
        </td>

        <!-- Host Company & Eval -->
        <td style="padding:10px 12px;">
          ${s.ojt_company
            ? `<div style="display:flex;align-items:center;gap:5px;font-size:var(--text-sm);font-weight:500;color:var(--text-primary);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(s.ojt_company)}">
                ${icon('briefcase', 12)} <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(s.ojt_company)}</span>
               </div>
               <div style="margin-top:2px;">
                 ${s.evaluation_status === 'submitted'
                   ? `<span class="badge badge--success" title="Evaluated by ${escapeHtml(s.evaluator_name || 'Host Company')}${s.evaluator_position ? ' (' + escapeHtml(s.evaluator_position) + ')' : ''} on ${escapeHtml(s.evaluation_date || 'N/A')}" style="display:inline-flex;align-items:center;gap:3px;font-size:0.68rem;font-weight:600;padding:0 6px;"><span style="color:#F59E0B;">★</span> ${Number(s.evaluation_score || 5).toFixed(1)} Eval</span>`
                   : s.evaluation_status === 'pending'
                     ? `<span class="badge badge--warning" title="Evaluation requested, awaiting submission" style="display:inline-flex;align-items:center;gap:3px;font-size:0.68rem;font-weight:600;padding:0 6px;">${icon('clock', 10)} Eval Pending</span>`
                     : `<span style="font-size:0.68rem;color:var(--text-tertiary);font-style:italic;">No Eval yet</span>`}
               </div>`
            : `<span style="color:var(--text-tertiary);font-size:var(--text-xs);font-style:italic;">Undeployed</span>`}
        </td>

        <!-- OJT Progress -->
        <td style="padding:10px 12px;">
          ${s.ojt_required > 0 ? `
          <div style="display:flex;align-items:center;gap:7px;min-width:110px;">
            <div class="progress-bar" style="flex:1;min-width:48px;height:6px;">
              <div class="progress-bar__fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <span style="font-size:0.72rem;font-weight:600;white-space:nowrap;color:var(--text-secondary);">${s.ojt_hours}/${s.ojt_required}h</span>
          </div>` : `
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>
          `}
        </td>

        <!-- Status -->
        <td style="padding:10px 12px;white-space:nowrap;">
          ${s.approval_status === 'pending'
            ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;font-size:0.72rem;font-weight:600;border-radius:20px;background:#FEF3C7;color:#92400E;border:1px solid #FCD34D;box-shadow:0 1px 2px rgba(245,158,11,0.06);">
                 <span style="width:6px;height:6px;border-radius:50%;background:#D97706;display:inline-block;"></span>
                 <span>Pending Approval</span>
               </span>`
            : `<span class="badge badge--${badgeColor}">${escapeHtml(s.status)}</span>`}
        </td>

        <!-- Actions -->
        <td style="padding:10px 12px;text-align:right;white-space:nowrap;">
          <div style="display:inline-flex;align-items:center;justify-content:flex-end;gap:5px;">
            ${s.approval_status === 'pending' ? `
              <button class="approve-btn" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:0.73rem;font-weight:600;background:#005930;color:#ffffff;border:1px solid #005930;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,89,48,0.15);transition:all 0.15s ease;" title="Approve student registration">
                ${icon('check', 12)} Approve
              </button>
              <button class="reject-btn" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="display:inline-flex;align-items:center;gap:3px;padding:4px 8px;font-size:0.73rem;font-weight:600;background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;border-radius:6px;cursor:pointer;transition:all 0.15s ease;" title="Reject student registration">
                ${icon('x', 12)} Reject
              </button>
              <button class="view-btn" data-id="${s.id}" style="display:inline-flex;align-items:center;gap:3px;padding:4px 8px;font-size:0.73rem;font-weight:500;background:#ffffff;color:var(--text-secondary,#475569);border:1px solid var(--border-default,#cbd5e1);border-radius:6px;cursor:pointer;" title="View Student Details">
                ${icon('eye', 12)} View
              </button>
            ` : `
              <button class="btn btn--outline btn--sm view-btn" data-id="${s.id}" style="padding:3px 9px;font-size:var(--text-xs);gap:4px;border-radius:6px;">
                ${icon('eye', 12)} View
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderIcons();

  // Approve student action
  tbody.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (!confirm(`Are you sure you want to approve student registration for ${name}?`)) return;
      btn.disabled = true;
      btn.innerHTML = `${icon('check', 12)} Approving...`;
      try {
        const res = await apiPost(`/admin/students/${id}/approve`);
        showToast(res?.message || `Student ${name} approved successfully!`, 'success');
        if (typeof onRefresh === 'function') onRefresh();
      } catch (err) {
        showToast(err.message || 'Failed to approve student.', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icon('check', 12)} Approve`;
      }
    });
  });

  // Reject student action
  tbody.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const reason = prompt(`Enter rejection reason for ${name}:`, 'Student enrollment record not verified.');
      if (reason === null) return;
      btn.disabled = true;
      try {
        const res = await apiPost(`/admin/students/${id}/reject`, { reason });
        showToast(res?.message || `Student registration rejected.`, 'info');
        if (typeof onRefresh === 'function') onRefresh();
      } catch (err) {
        showToast(err.message || 'Failed to reject student.', 'error');
        btn.disabled = false;
      }
    });
  });

  // Individual checkbox selection handling
  tbody.querySelectorAll('.student-select-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = parseInt(cb.dataset.id, 10);
      const student = list.find(s => s.id === id);
      if (student) {
        if (cb.checked) {
          selectedStudents.set(id, student);
        } else {
          selectedStudents.delete(id);
        }
        if (typeof updateSelectionUI === 'function') updateSelectionUI();
      }
    });
  });

  tbody.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const st = list.find(s => String(s.id) === btn.dataset.id);
      if (st) showModal(st, container, onRefresh);
    });
  });

  if (typeof updateSelectionUI === 'function') updateSelectionUI();
}

/* ─── Skeleton loader ───────────────────────────────────────────── */
function showSkeleton(tbody, count = 8) {
  tbody.innerHTML = Array.from({ length: count }, () => `
    <tr style="opacity: 0.5;">
      <td style="text-align:center;padding:10px 8px;"><div style="height:15px;width:15px;background:var(--bg-tertiary);border-radius:3px;margin:auto;"></div></td>
      <td style="padding:10px 12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:var(--radius-full);background:var(--bg-tertiary);flex-shrink:0;"></div>
          <div>
            <div style="height:12px;width:110px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:5px;"></div>
            <div style="height:10px;width:140px;background:var(--bg-tertiary);border-radius:4px;"></div>
          </div>
        </div>
      </td>
      <td style="padding:10px 12px;"><div style="height:12px;width:75px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
      <td style="padding:10px 12px;">
        <div style="height:12px;width:60px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:5px;"></div>
        <div style="height:10px;width:90px;background:var(--bg-tertiary);border-radius:4px;"></div>
      </td>
      <td style="padding:10px 12px;">
        <div style="height:12px;width:110px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:5px;"></div>
        <div style="height:10px;width:60px;background:var(--bg-tertiary);border-radius:4px;"></div>
      </td>
      <td style="padding:10px 12px;"><div style="height:10px;width:95px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
      <td style="padding:10px 12px;"><div style="height:20px;width:80px;background:var(--bg-tertiary);border-radius:12px;"></div></td>
      <td style="padding:10px 12px;text-align:right;"><div style="height:26px;width:65px;background:var(--bg-tertiary);border-radius:6px;display:inline-block;"></div></td>
    </tr>`).join('');
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default async function StudentsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Students</h1>
      <p class="page-header__subtitle">Academic records, OJT progress, and employment tracking</p>
    </div>
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="search-box">
          ${icon('search', 15)}
          <input class="search-box__input" id="student-search" placeholder="Search name, email, or student ID…" />
        </div>
        <select class="form-select" id="filter-course" style="width:auto;max-width:240px;padding:7px 32px 7px 10px;">
          <option value="">All Courses</option>
        </select>
        <select class="form-select" id="filter-section" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Sections</option>
        </select>
        <select class="form-select" id="filter-status" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Status</option>
          <option value="pending">⏳ Pending Approval</option>
          <option value="Eligible for Promotion">Ready for Graduation (Eligible)</option>
          <option value="Needs Evaluation">Needs Company Evaluation</option>
          <option value="Completed OJT">Completed OJT (600h+)</option>
          <option value="Active OJT">Active OJT</option>
          <option value="Undeployed">Undeployed</option>
        </select>
      </div>
      <div class="toolbar__right" style="display:flex;align-items:center;gap:8px;">
        <span id="student-count" style="font-size:var(--text-sm);color:var(--text-tertiary);"></span>
        <button class="btn btn--outline btn--sm" id="broadcast-students-btn" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('bell', 13)} Broadcast Notice
        </button>
        <button class="btn btn--primary btn--sm" id="import-students-btn" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('upload', 14)} Import Students
        </button>
      </div>
    </div>
    <div class="table-wrapper anim-fade-in-up" style="background:var(--bg-surface);">
      <table class="table" id="students-table">
        <thead>
          <tr>
            <th style="width:38px;text-align:center;padding:10px 8px;">
              <input type="checkbox" id="select-all-students" style="cursor:pointer;width:15px;height:15px;" title="Select all eligible students on this page" />
            </th>
            <th style="min-width:180px;padding:10px 12px;">Student</th>
            <th style="width:110px;padding:10px 12px;">Student ID</th>
            <th style="width:130px;padding:10px 12px;">Program</th>
            <th style="min-width:160px;padding:10px 12px;">Host Company</th>
            <th style="width:130px;padding:10px 12px;">OJT Progress</th>
            <th style="width:125px;padding:10px 12px;">Status</th>
            <th style="width:150px;text-align:right;padding:10px 12px;">Actions</th>
          </tr>
        </thead>
        <tbody id="students-tbody"></tbody>
      </table>
    </div>
    <div id="students-pagination" style="display:flex;justify-content:center;gap:8px;margin-top:var(--space-5);flex-wrap:wrap;"></div>

    <!-- Floating Batch Action Bar for Graduation Promotion -->
    <div id="batch-action-bar" class="batch-action-bar" style="display:none;">
      <div class="batch-action-bar__info">
        <span class="batch-action-bar__count-badge" id="batch-selected-count">0</span>
        <span style="font-weight:var(--weight-semibold);color:var(--text-primary);">Selected</span>
        <span class="batch-action-bar__divider"></span>
        <span class="batch-action-bar__pill">${icon('award', 13)} Dual-Gate Qualified</span>
      </div>
      <div class="batch-action-bar__actions">
        <button class="btn btn--outline btn--sm" id="batch-clear-btn" type="button">Deselect</button>
        <button class="btn btn--primary btn--sm" id="batch-promote-btn" type="button" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('graduation-cap', 14)} Promote to Graduate
        </button>
      </div>
    </div>
  `;

  renderIcons();

  const tbody        = container.querySelector('#students-tbody');
  const countEl      = container.querySelector('#student-count');
  const paginationEl = container.querySelector('#students-pagination');

  let currentPage         = 1;
  let debounceTimer       = null;
  const selectedStudents  = new Map();
  let currentStudentsList = [];

  function updateSelectionUI() {
    const selectAllCb = container.querySelector('#select-all-students');
    const bar = container.querySelector('#batch-action-bar');
    const countBadge = container.querySelector('#batch-selected-count');

    const eligibleOnPage = currentStudentsList.filter(s => Boolean(s.is_eligible_for_promotion));
    const selectedOnPageCount = eligibleOnPage.filter(s => selectedStudents.has(s.id)).length;

    if (selectAllCb) {
      if (eligibleOnPage.length === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
        selectAllCb.disabled = true;
      } else {
        selectAllCb.disabled = false;
        selectAllCb.checked = selectedOnPageCount === eligibleOnPage.length;
        selectAllCb.indeterminate = selectedOnPageCount > 0 && selectedOnPageCount < eligibleOnPage.length;
      }
    }

    if (bar) {
      if (selectedStudents.size > 0) {
        bar.style.display = 'flex';
        if (countBadge) countBadge.textContent = selectedStudents.size;
      } else {
        bar.style.display = 'none';
      }
    }
  }

  function applyStudentsResponse(res) {
    if (!res || res.message) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
              <h3 class="empty-state__title">Failed to load students</h3>
              <p class="empty-state__text">${res?.message || 'Check your connection or login session.'}</p>
            </div>
          </td>
        </tr>`;
      updateSelectionUI();
      return;
    }

    // Populate dynamic courses dropdown if returned
    if (Array.isArray(res.courses)) {
      const courseSelect = container.querySelector('#filter-course');
      if (courseSelect) {
        const currentSelected = courseSelect.value;
        const currentOptions = Array.from(courseSelect.options).slice(1).map(o => o.value);
        const isSame = currentOptions.length === res.courses.length && currentOptions.every((v, i) => v === res.courses[i]);
        if (!isSame) {
          courseSelect.innerHTML = '<option value="">All Courses</option>' +
            res.courses.map(course => `<option value="${course}"${course === currentSelected ? ' selected' : ''}>${formatCourseOption(course)}</option>`).join('');
        }
      }
    }

    // Populate dynamic sections dropdown if returned
    if (Array.isArray(res.sections)) {
      const secSelect = container.querySelector('#filter-section');
      if (secSelect) {
        const currentSelected = secSelect.value;
        const currentOptions = Array.from(secSelect.options).slice(1).map(o => o.value);
        const isSame = currentOptions.length === res.sections.length && currentOptions.every((v, i) => v === res.sections[i]);
        if (!isSame) {
          secSelect.innerHTML = '<option value="">All Sections</option>' +
            res.sections.map(sec => `<option value="${sec}"${sec === currentSelected ? ' selected' : ''}>${sec}</option>`).join('');
        }
      }
    }

    currentStudentsList = Array.isArray(res.data) ? res.data : [];
    if (countEl) countEl.textContent = res.total != null ? `${res.total} student${res.total !== 1 ? 's' : ''}` : '';

    renderTable(tbody, currentStudentsList, container, selectedStudents, updateSelectionUI, () => {
      selectedStudents.clear();
      fetchAndRender(true);
    });
    renderPagination(res);
  }

  async function fetchAndRender(force = false) {
    const search  = container.querySelector('#student-search').value.trim();
    const course  = container.querySelector('#filter-course')?.value || '';
    const status  = container.querySelector('#filter-status').value;
    const section = container.querySelector('#filter-section').value;

    const params = new URLSearchParams({ per_page: 8, page: currentPage });
    if (search)  params.set('search', search);
    if (course)  params.set('course', course);
    if (status)  params.set('status', status);
    if (section) params.set('section', section);

    const url = `/admin/students?${params}`;
    const cached = !force ? getCached(url) : null;

    if (cached?.data) {
      applyStudentsResponse(cached.data);
    } else {
      showSkeleton(tbody);
      paginationEl.innerHTML = '';
    }

    const res = await apiGetCached(url, {
      force,
      onUpdate: (fresh) => {
        applyStudentsResponse(fresh);
      },
    });

    if (res && !cached) {
      applyStudentsResponse(res);
    }
  }

  function renderPagination(meta) {
    if (!meta || meta.last_page <= 1) { paginationEl.innerHTML = ''; return; }

    const pages = meta.last_page;
    const cur   = meta.current_page;
    let html = '';

    html += `<button class="an-pg-btn an-pg-btn--nav" data-page="${cur - 1}"${cur === 1 ? ' disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && Math.abs(i - cur) > 2 && i !== 1 && i !== pages) {
        if (i === cur - 3 || i === cur + 3) html += `<span style="padding:0 4px;color:var(--text-tertiary)">…</span>`;
        continue;
      }
      html += `<button class="an-pg-btn${i === cur ? ' an-pg-btn--active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="an-pg-btn an-pg-btn--nav" data-page="${cur + 1}"${cur >= pages ? ' disabled' : ''}>${icon('chevronRight', 14)}</button>`;

    paginationEl.innerHTML = html;
    renderIcons();

    paginationEl.querySelectorAll('.an-pg-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page, 10);
        fetchAndRender();
      });
    });
  }

  /* ── Filter & search events ── */
  container.querySelector('#filter-course')?.addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#filter-status').addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#filter-section').addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#student-search').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { currentPage = 1; fetchAndRender(); }, 400);
  });

  /* ── Batch selection events ── */
  container.querySelector('#select-all-students')?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const eligibleOnPage = currentStudentsList.filter(s => Boolean(s.is_eligible_for_promotion));
    eligibleOnPage.forEach(s => {
      if (isChecked) {
        selectedStudents.set(s.id, s);
      } else {
        selectedStudents.delete(s.id);
      }
    });

    tbody.querySelectorAll('.student-select-cb').forEach(cb => {
      const id = parseInt(cb.dataset.id, 10);
      cb.checked = selectedStudents.has(id);
    });

    updateSelectionUI();
  });

  container.querySelector('#batch-clear-btn')?.addEventListener('click', () => {
    selectedStudents.clear();
    tbody.querySelectorAll('.student-select-cb').forEach(cb => { cb.checked = false; });
    updateSelectionUI();
  });

  container.querySelector('#batch-promote-btn')?.addEventListener('click', () => {
    if (selectedStudents.size === 0) return;
    openPromoteModal({
      students: Array.from(selectedStudents.values()),
      onPromote: () => {
        selectedStudents.clear();
        fetchAndRender(true);
      },
      container,
    });
  });

  /* ── Broadcast button ── */
  container.querySelector('#broadcast-students-btn')?.addEventListener('click', () => {
    openBroadcastModal({
      container,
      onSuccess: () => {
        // Broadcast dispatched successfully
      },
    });
  });

  /* ── Import students button ── */
  container.querySelector('#import-students-btn').addEventListener('click', () => {
    openStudentImportModal(() => {
      currentPage = 1;
      fetchAndRender(true);
    });
  });

  /* ── Initial load ── */
  fetchAndRender();
}
