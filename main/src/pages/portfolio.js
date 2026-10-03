/**
 * CHMSU HireMe — My Portfolio (Dynamic, DB-backed)
 * Sections: About (bio, experience, education, skills) | Resume | Projects | Achievements
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, storageUrl } from '../api/client.js';
import { getState, setState } from '../store.js';

/* ─── palette for skills / experience types ─── */
const typeColor = { OJT: 'accent', Freelance: 'success', Volunteer: 'warning', 'Full-time': 'info', 'Part-time': 'neutral' };
const achColor  = { academic: 'accent', certification: 'info', competition: 'warning', professional: 'success' };
const projectGradients = [
  'linear-gradient(135deg,#005930,#10B981)',
  'linear-gradient(135deg,#4A6CF7,#6D8DFF)',
  'linear-gradient(135deg,#8B5CF6,#A78BFA)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#0D9488,#14B8A6)',
  'linear-gradient(135deg,#EC4899,#F472B6)',
];

const PROJECT_CATEGORIES = [
  { id: 'Academic Capstone', label: '🎓 Academic Capstone' },
  { id: 'Internship / OJT',  label: '💼 Internship / OJT Deliverable' },
  { id: 'Client / Freelance', label: '🤝 Client / Freelance' },
  { id: 'Hackathon / Competition', label: '🏆 Hackathon / Competition' },
  { id: 'Personal / Open Source', label: '🚀 Personal / Open Source' },
  { id: 'Research / Publication', label: '🔬 Research / Publication' },
];

const PROJECT_ROLES = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend / API Engineer',
  'Lead Architect',
  'UI/UX Designer',
  'Mobile App Developer',
  'DevOps / Cloud Engineer',
  'Project Manager / Scrum Master',
  'Solo Developer',
];

const QUICK_STACK = [
  'React', 'Vue.js', 'Next.js', 'Laravel', 'PHP', 'Node.js',
  'Tailwind CSS', 'Bootstrap', 'Python', 'MySQL', 'PostgreSQL',
  'Firebase', 'Supabase', 'Flutter', 'Docker', 'AWS', 'Git'
];

const ACH_CATEGORIES = [
  { id: 'certification', label: 'Professional Certification', color: 'info' },
  { id: 'academic',      label: 'Academic Honor & Award',    color: 'accent' },
  { id: 'competition',   label: 'Competition & Hackathon',    color: 'warning' },
  { id: 'professional',  label: 'Professional & Leadership',  color: 'success' },
];

const AWARD_LEVELS = [
  'International Distinction',
  'National Level',
  'Regional / Provincial',
  'University / Campus Honor',
  'College / Departmental Award',
  '1st Place / Champion',
  'Top Finalist / Runner-Up',
  'Dean’s Lister / Academic Honors',
];

/* ─── shared state ─── */
let P = {}; // profile
let EDU = [], EXP = [], SKL = [], PRJ = [], ACH = [];
let REQS = []; // assigned OJT requirements
let activeOjt = null; // active OJT deployment info
let storeUser = {}; // authenticated user info from store
let currentTab = 'about';
let tabContent;

export function getReqItemName(it) {
  if (!it) return '';
  if (typeof it === 'string') return it.trim();
  return (it.name || it.title || it.label || it.document || '').trim();
}

/* ══════════════════════════════════════════════════
   MODAL HELPER
   ══════════════════════════════════════════════════ */
function openModal({ title, body, onSave }) {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close btn btn--icon" aria-label="Close">${icon('x', 18)}</button>
      </div>
      <form id="portfolio-modal-form" class="modal-body" novalidate>
        ${body}
        <div class="modal-footer">
          <button type="button" class="btn btn--ghost modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="modal-save-btn">Save Changes</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').onclick = close;
  overlay.querySelector('.modal-cancel-btn').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#portfolio-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = overlay.querySelector('#modal-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try {
      await onSave(new FormData(e.target), overlay);
      close();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      const errEl = overlay.querySelector('.modal-error');
      if (errEl) errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

function formVal(form, name) {
  const el = form.get(name);
  return el ? el.toString().trim() : '';
}

/* ══════════════════════════════════════════════════
   CONFIRM DELETE
   ══════════════════════════════════════════════════ */
function confirmDelete(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box modal-box--sm" role="dialog">
      <div class="modal-header"><h3 class="modal-title">Confirm Delete</h3></div>
      <div class="modal-body"><p>${message}</p>
        <p class="modal-error" style="color:var(--color-danger);margin-top:4px;"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn--ghost cancel-btn">Cancel</button>
        <button class="btn btn--danger confirm-btn">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));
  overlay.querySelector('.cancel-btn').onclick = () => overlay.remove();
  overlay.querySelector('.confirm-btn').onclick = async () => {
    overlay.querySelector('.confirm-btn').disabled = true;
    await onConfirm();
    overlay.remove();
  };
}

/* ══════════════════════════════════════════════════
   RENDER HELPERS
   ══════════════════════════════════════════════════ */
function emptyState(msg) {
  return `<div class="empty-state">${icon('inbox', 32)}<p class="text-secondary mt-2">${msg}</p></div>`;
}

/* ── Update every avatar element in the shell (sidebar + navbar) ── */
function syncAvatarEverywhere(url) {
  const absUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
  const imgHtml = `<img src="${absUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  document.querySelectorAll('[data-user-avatar]').forEach(el => { el.innerHTML = imgHtml; });
  setState('user.avatar', url);
  // Persist so next full page load shows the image too
  try {
    const cached = JSON.parse(localStorage.getItem('hireme_user') || '{}');
    cached.avatar_url = url;
    localStorage.setItem('hireme_user', JSON.stringify(cached));
  } catch (_) {}
}

function renderProfileLinks() {
  const linksEl = document.getElementById('profile-links');
  if (!linksEl) return;
  const links = [];
  if (P.github_url)   links.push(`<a class="profile-link" href="https://${P.github_url}" target="_blank" rel="noopener">${icon('github',12)} GitHub</a>`);
  if (P.linkedin_url) links.push(`<a class="profile-link" href="https://${P.linkedin_url}" target="_blank" rel="noopener">${icon('linkedin',12)} LinkedIn</a>`);
  if (P.portfolio_url)links.push(`<a class="profile-link" href="https://${P.portfolio_url}" target="_blank" rel="noopener">${icon('externalLink',12)} Portfolio</a>`);
  if (P.requirements_drive_url) links.push(`<a class="profile-link profile-link--drive" href="${P.requirements_drive_url}" target="_blank" rel="noopener" style="color:#0284c7;border-color:rgba(2,132,199,0.3);background:rgba(2,132,199,0.06);font-weight:600;">${icon('folder',12)} Requirements Drive</a>`);
  linksEl.innerHTML = links.join('');
}

/* ══════════════════════════════════════════════════
   ABOUT TAB
   ══════════════════════════════════════════════════ */
function renderAbout() {
  const user = getState('user') || storeUser || {};
  const activeReq = Array.isArray(REQS) && REQS.length ? REQS[0] : null;
  const reqStatus = activeReq?.status;
  const statusBadge = reqStatus === 'verified'
    ? `<span class="badge badge--success" style="font-weight:700;font-size:0.72rem;padding:2px 8px;">${icon('checkCircle', 11)} Verified</span>`
    : reqStatus === 'submitted'
    ? `<span class="badge badge--info" style="font-weight:700;font-size:0.72rem;padding:2px 8px;">${icon('clock', 11)} Under Review</span>`
    : reqStatus === 'needs_revision'
    ? `<span class="badge badge--error" style="font-weight:700;font-size:0.72rem;padding:2px 8px;">${icon('alertTriangle', 11)} Revision Requested</span>`
    : activeReq
    ? `<span class="badge badge--warning" style="font-weight:700;font-size:0.72rem;padding:2px 8px;">${icon('clock', 11)} Pending</span>`
    : '';

  const formattedDueDate = (() => {
    if (!activeReq?.due_date) return '';
    try {
      const d = new Date(activeReq.due_date);
      if (isNaN(d.getTime())) return activeReq.due_date;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
      return activeReq.due_date;
    }
  })();

  tabContent.innerHTML = `
    <div class="animate-fade-in-up">

      <!-- Bio / Contact -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('user', 20)} About Me</h3>
          <button class="btn btn--secondary btn--sm" id="edit-about-btn">${icon('edit', 14)} Edit</button>
        </div>
        <p class="profile-section__bio">${P.bio || '<span class="text-tertiary">No bio yet. Click Edit to add one.</span>'}</p>
        <div class="profile-contact-grid mt-2">
          ${P.phone       ? `<span class="contact-chip">${icon('phone', 13)} ${P.phone}</span>` : ''}
          ${P.location    ? `<span class="contact-chip">${icon('mapPin', 13)} ${P.location}</span>` : ''}
          ${P.github_url  ? `<a class="contact-chip contact-chip--link" href="https://${P.github_url}" target="_blank" rel="noopener">${icon('github', 13)} ${P.github_url}</a>` : ''}
          ${P.linkedin_url? `<a class="contact-chip contact-chip--link" href="https://${P.linkedin_url}" target="_blank" rel="noopener">${icon('linkedin', 13)} ${P.linkedin_url}</a>` : ''}
          ${P.portfolio_url?`<a class="contact-chip contact-chip--link" href="https://${P.portfolio_url}" target="_blank" rel="noopener">${icon('externalLink', 13)} ${P.portfolio_url}</a>` : ''}
          ${P.requirements_drive_url?`<a class="contact-chip contact-chip--link" href="${P.requirements_drive_url}" target="_blank" rel="noopener" style="color:#0284c7;border-color:rgba(2,132,199,0.3);background:rgba(2,132,199,0.06);font-weight:600;">${icon('folder', 13)} OJT Requirements Drive</a>` : ''}
        </div>
      </div>

      <!-- OJT Requirements Section (Minimal Design) -->
      <div class="profile-section" style="padding:16px 20px;border:1px solid ${reqStatus === 'needs_revision' ? 'rgba(239,68,68,0.25)' : reqStatus === 'verified' ? 'rgba(16,185,129,0.25)' : 'rgba(2,132,199,0.2)'};background:${reqStatus === 'needs_revision' ? 'rgba(239,68,68,0.015)' : 'rgba(2,132,199,0.015)'};border-radius:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <div style="width:32px;height:32px;border-radius:8px;background:${reqStatus === 'verified' ? 'rgba(16,185,129,0.12)' : reqStatus === 'needs_revision' ? 'rgba(239,68,68,0.12)' : 'rgba(2,132,199,0.12)'};color:${reqStatus === 'verified' ? '#10b981' : reqStatus === 'needs_revision' ? '#ef4444' : '#0284c7'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon(reqStatus === 'verified' ? 'checkCircle' : 'folder', 16)}
            </div>
            <div style="min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h4 style="margin:0;font-size:0.95rem;font-weight:700;color:var(--text-primary);">${activeReq ? activeReq.title : 'OJT Requirements Drive'}</h4>
                ${statusBadge}
              </div>
              <p style="font-size:0.76rem;color:var(--text-tertiary);margin:2px 0 0;line-height:1.3;">
                ${activeReq?.supervisor?.name ? `Assigned by <strong>${activeReq.supervisor.name}</strong>` : 'Academic Requirements'}
                ${formattedDueDate ? ` &middot; Due: <strong>${formattedDueDate}</strong>` : ''}
              </p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:auto;">
            ${P.requirements_drive_url ? `
              <a href="${P.requirements_drive_url}" target="_blank" rel="noopener" class="btn btn--secondary btn--sm" style="font-size:0.78rem;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
                ${icon('externalLink', 12)} <span>Open Folder</span>
              </a>
              <button class="btn btn--secondary btn--sm" id="edit-drive-btn" style="font-size:0.78rem;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
                ${icon('edit', 12)} <span>Update</span>
              </button>
            ` : `
              <button class="btn btn--primary btn--sm" id="edit-drive-btn" style="font-size:0.78rem;padding:5px 12px;display:inline-flex;align-items:center;gap:5px;">
                ${icon('plus', 12)} <span>Submit Drive Link</span>
              </button>
            `}
          </div>
        </div>

        ${activeReq?.instructions ? `
          <div style="margin-top:8px;padding:6px 10px;background:rgba(2,132,199,0.04);border-left:2.5px solid #0284c7;border-radius:4px;font-size:0.78rem;color:var(--text-secondary);line-height:1.4;">
            <strong style="color:var(--text-primary);">Instructions:</strong> ${activeReq.instructions}
          </div>
        ` : ''}

        ${(reqStatus === 'needs_revision' && activeReq?.supervisor_remarks) ? `
          <div style="margin-top:8px;padding:6px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;display:flex;align-items:flex-start;gap:8px;font-size:0.78rem;color:#b91c1c;line-height:1.4;">
            <span style="flex-shrink:0;margin-top:1px;">${icon('alertTriangle', 13)}</span>
            <div><strong>Feedback:</strong> ${activeReq.supervisor_remarks}</div>
          </div>
        ` : ''}

        ${Array.isArray(activeReq?.items) && activeReq.items.length ? `
          <div style="margin-top:8px;">
            <div style="display:flex;flex-wrap:wrap;gap:5px;">
              ${activeReq.items.map(item => {
                const itemName = getReqItemName(item);
                if (!itemName) return '';
                return `
                <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:5px;background:var(--bg-surface);border:1px solid var(--border-subtle);font-size:0.75rem;color:var(--text-secondary);">
                  <span style="color:${reqStatus === 'verified' ? '#10b981' : '#0284c7'};display:inline-flex;flex-shrink:0;">
                    ${icon(reqStatus === 'verified' ? 'checkCircle' : 'fileText', 11)}
                  </span>
                  <span>${itemName}</span>
                </span>
              `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${P.requirements_drive_url ? `
          <div style="margin-top:8px;padding:5px 8px;background:var(--bg-surface);border:1px solid rgba(2,132,199,0.15);border-radius:5px;display:flex;align-items:center;gap:6px;font-size:0.76rem;">
            <span style="color:#0284c7;display:inline-flex;flex-shrink:0;">${icon('folder', 12)}</span>
            <span style="color:var(--text-tertiary);flex-shrink:0;">Connected Drive:</span>
            <a href="${P.requirements_drive_url}" target="_blank" rel="noopener" style="color:var(--color-primary,#0284c7);text-decoration:none;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;" title="${P.requirements_drive_url}">
              ${P.requirements_drive_url}
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Experience -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('briefcase', 20)} Experience</h3>
          <button class="btn btn--secondary btn--sm" id="add-exp-btn">${icon('plus', 14)} Add</button>
        </div>
        <div id="exp-list">
          ${(() => {
            const ojtCard = activeOjt ? `
              <div class="profile-timeline-item profile-timeline-item--pinned">
                <div class="profile-timeline-item__dot profile-timeline-item__dot--active" style="position:relative;"></div>
                <div class="profile-timeline-item__content">
                  <div class="profile-timeline-item__header">
                    <div>
                      <h4 class="profile-timeline-item__title">${activeOjt.position || 'OJT Trainee'}</h4>
                      <p class="profile-timeline-item__subtitle">
                        ${activeOjt.company}
                        ${activeOjt.department ? `<span style="color:var(--text-tertiary)"> &middot; ${activeOjt.department}</span>` : ''}
                        &nbsp;<span class="badge badge--accent">OJT</span>
                      </p>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                      ${activeOjt.start_date ? `<span class="profile-timeline-item__date">${activeOjt.start_date} &ndash; Present</span>` : ''}
                      <span class="badge" style="background:linear-gradient(135deg,#4A6CF7,#6D8DFF);color:#fff;font-size:.68rem;padding:2px 10px;border-radius:999px;font-weight:700;letter-spacing:.04em;">&#9679; Active</span>
                    </div>
                  </div>
                  <p class="profile-timeline-item__desc" style="color:var(--text-tertiary);font-size:.82rem;">
                    ${[activeOjt.duration, activeOjt.location].filter(Boolean).join(' &nbsp;&middot;&nbsp; ')}
                  </p>
                  <p style="font-size:.78rem;color:var(--text-tertiary);margin-top:4px;">This card is automatically generated from your accepted OJT placement.</p>
                </div>
              </div>` : '';
            const expCards = EXP.length === 0 && !activeOjt
              ? emptyState('No experience entries yet.')
              : EXP.map(exp => `
            <div class="profile-timeline-item" data-id="${exp.id}">
              <div class="profile-timeline-item__dot ${exp.is_current ? 'profile-timeline-item__dot--active' : ''}"></div>
              <div class="profile-timeline-item__content">
                <div class="profile-timeline-item__header">
                  <div>
                    <h4 class="profile-timeline-item__title">${exp.role}</h4>
                    <p class="profile-timeline-item__subtitle">${exp.company} · <span class="badge badge--${typeColor[exp.type] || 'neutral'}">${exp.type}</span></p>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    <span class="profile-timeline-item__date">${exp.period}</span>
                    <button class="btn btn--icon btn--xs edit-exp-btn" data-id="${exp.id}" title="Edit">${icon('edit', 13)}</button>
                    <button class="btn btn--icon btn--xs btn--danger-ghost del-exp-btn" data-id="${exp.id}" title="Delete">${icon('trash', 13)}</button>
                  </div>
                </div>
                <p class="profile-timeline-item__desc">${exp.description || ''}</p>
                <div class="profile-timeline-item__skills">
                  ${(exp.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
              </div>
            </div>`).join('');
            return ojtCard + expCards;
          })()}
        </div>
      </div>

      <!-- Education -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('bookOpen', 20)} Education</h3>
          <button class="btn btn--secondary btn--sm" id="add-edu-btn">${icon('plus', 14)} Add</button>
        </div>
        <div id="edu-list">
          ${(() => {
            const isAlumni = P.is_alumni || P.status === 'alumni' || P.role === 'graduate' || user?.is_alumni || user?.status === 'alumni' || user?.rawRole === 'graduate' || P.year_level === 'Graduated';
            const hasChmsu = P.program || P.campus || P.batch;
            const chmsuCard = hasChmsu ? `
              <div class="profile-timeline-item profile-timeline-item--pinned">
                <div class="profile-timeline-item__dot ${isAlumni ? '' : 'profile-timeline-item__dot--active'}"></div>
                <div class="profile-timeline-item__content">
                  <div class="profile-timeline-item__header">
                    <div>
                      <h4 class="profile-timeline-item__title">Carlos Hilado Memorial State University</h4>
                      <p class="profile-timeline-item__subtitle">
                        ${[P.program, P.campus].filter(Boolean).join(' &mdash; ')}
                        ${P.section ? `<span style="color:var(--text-tertiary);font-size:0.8rem;margin-left:6px;">Section ${P.section}</span>` : ''}
                      </p>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                      ${P.batch ? `<span class="profile-timeline-item__date">${isAlumni ? 'Batch' : 'S.Y.'} ${P.batch}</span>` : ''}
                      ${P.year_level ? `<span class="badge badge--accent" style="font-size:0.68rem;padding:2px 10px;">${P.year_level}</span>` : ''}
                      ${isAlumni
                        ? `<span class="badge badge--success" style="font-size:0.68rem;padding:2px 10px;border-radius:999px;font-weight:700;letter-spacing:0.04em;">${icon('award', 11)} Graduated / Alumni</span>`
                        : `<span class="badge badge--info" style="font-size:0.68rem;padding:2px 10px;border-radius:999px;background:linear-gradient(135deg,#4A6CF7,#6D8DFF);color:#fff;font-weight:700;letter-spacing:0.04em;">Currently Enrolled</span>`
                      }
                    </div>
                  </div>
                </div>
              </div>` : '';
            const userEdu = EDU.length === 0 && !hasChmsu
              ? emptyState('No education entries yet.')
              : EDU.map(edu => `
                <div class="profile-timeline-item" data-id="${edu.id}">
                  <div class="profile-timeline-item__dot ${edu.is_current ? 'profile-timeline-item__dot--active' : ''}"></div>
                  <div class="profile-timeline-item__content">
                    <div class="profile-timeline-item__header">
                      <div>
                        <h4 class="profile-timeline-item__title">${edu.school}</h4>
                        <p class="profile-timeline-item__subtitle">${edu.degree}</p>
                      </div>
                      <div style="display:flex;gap:6px;align-items:center;">
                        <span class="profile-timeline-item__date">${edu.period}</span>
                        <button class="btn btn--icon btn--xs edit-edu-btn" data-id="${edu.id}" title="Edit">${icon('edit', 13)}</button>
                        <button class="btn btn--icon btn--xs btn--danger-ghost del-edu-btn" data-id="${edu.id}" title="Delete">${icon('trash', 13)}</button>
                      </div>
                    </div>
                    ${edu.description ? `<p class="profile-timeline-item__desc">${edu.description}</p>` : ''}
                    ${edu.gpa ? `<span class="text-xs text-secondary">GPA: ${edu.gpa}</span>` : ''}
                  </div>
                </div>`).join('');
            return chmsuCard + userEdu;
          })()}
        </div>
      </div>

      <!-- Skills -->
      <div class="profile-section profile-section--skills">
        <div class="skills-header">
          <div class="skills-header__left">
            <div class="skills-header__icon-box">
              ${icon('zap', 20)}
            </div>
            <div>
              <div class="skills-header__title-row">
                <h3 class="skills-header__title">Skills & Proficiencies</h3>
                ${SKL.length > 0 ? `<span class="skills-header__total-badge">${SKL.length}</span>` : ''}
              </div>
              <p class="skills-header__subtitle">Technical competencies and self-assessed proficiency ratings</p>
            </div>
          </div>
          <button class="btn btn--primary btn--sm skills-header__add-btn" id="add-skill-btn">
            ${icon('plus', 14)} <span>Add Skill</span>
          </button>
        </div>

        ${SKL.length === 0 ? `
          <div class="skills-empty-card">
            <div class="skills-empty-icon">
              ${icon('zap', 26)}
            </div>
            <h4 class="skills-empty-title">No skills added yet</h4>
            <p class="skills-empty-desc">Highlight your programming languages, frameworks, and tools so employers can discover your strengths.</p>
            <button class="btn btn--primary btn--sm" id="empty-add-skill-btn">${icon('plus', 14)} Add Your First Skill</button>
          </div>
        ` : `
          <!-- Top Stats Banner -->
          <div class="skills-stats-banner">
            <div class="skills-stat-pill skills-stat-pill--total">
              <span class="skills-stat-pill__dot"></span>
              <span class="skills-stat-pill__label">Total</span>
              <span class="skills-stat-pill__count">${SKL.length}</span>
            </div>
            ${(() => {
              const counts = { expert: 0, advanced: 0, intermediate: 0, beginner: 0 };
              SKL.forEach(s => {
                const k = skillLevelMeta(s.level).key;
                counts[k] = (counts[k] || 0) + 1;
              });
              return `
                ${counts.expert > 0 ? `
                  <div class="skills-stat-pill skills-stat-pill--expert">
                    <span class="skills-stat-pill__dot"></span>
                    <span class="skills-stat-pill__label">Expert</span>
                    <span class="skills-stat-pill__count">${counts.expert}</span>
                  </div>` : ''}
                ${counts.advanced > 0 ? `
                  <div class="skills-stat-pill skills-stat-pill--advanced">
                    <span class="skills-stat-pill__dot"></span>
                    <span class="skills-stat-pill__label">Advanced</span>
                    <span class="skills-stat-pill__count">${counts.advanced}</span>
                  </div>` : ''}
                ${counts.intermediate > 0 ? `
                  <div class="skills-stat-pill skills-stat-pill--intermediate">
                    <span class="skills-stat-pill__dot"></span>
                    <span class="skills-stat-pill__label">Intermediate</span>
                    <span class="skills-stat-pill__count">${counts.intermediate}</span>
                  </div>` : ''}
                ${counts.beginner > 0 ? `
                  <div class="skills-stat-pill skills-stat-pill--beginner">
                    <span class="skills-stat-pill__dot"></span>
                    <span class="skills-stat-pill__label">Beginner</span>
                    <span class="skills-stat-pill__count">${counts.beginner}</span>
                  </div>` : ''}
              `;
            })()}
          </div>

          <!-- Category Grid -->
          <div class="skills-categories-grid">
            ${(() => {
              const groups = {};
              SKL.forEach(s => {
                if (!groups[s.category]) groups[s.category] = [];
                groups[s.category].push(s);
              });
              return Object.entries(CATEGORY_META)
                .filter(([cat]) => groups[cat]?.length)
                .map(([cat, meta]) => `
                  <div class="skill-category-card" data-cat="${cat}">
                    <div class="skill-category-card__header">
                      <div class="skill-category-card__badge" style="background: ${meta.bg}; color: ${meta.color};">
                        <span class="skill-category-card__emoji">${meta.emoji}</span>
                      </div>
                      <div class="skill-category-card__info">
                        <h4 class="skill-category-card__title">${meta.label}</h4>
                      </div>
                      <span class="skill-category-card__count">${groups[cat].length} ${groups[cat].length === 1 ? 'skill' : 'skills'}</span>
                    </div>
                    <div class="skill-category-card__list">
                      ${groups[cat].map(s => {
                        const lvl = skillLevelMeta(s.level);
                        return `
                          <div class="skill-item-card" data-id="${s.id}">
                            <div class="skill-item-card__main">
                              <span class="skill-item-card__name">${s.name}</span>
                              <div class="skill-level-badge skill-level-badge--${lvl.key}">
                                <span class="skill-level-badge__dot"></span>
                                <span class="skill-level-badge__text">${lvl.label}</span>
                                <span class="skill-level-meter" title="${lvl.label} (${lvl.value}%)">
                                  <span class="skill-meter-bar ${lvl.value >= 25 ? 'skill-meter-bar--active' : ''}"></span>
                                  <span class="skill-meter-bar ${lvl.value >= 50 ? 'skill-meter-bar--active' : ''}"></span>
                                  <span class="skill-meter-bar ${lvl.value >= 75 ? 'skill-meter-bar--active' : ''}"></span>
                                  <span class="skill-meter-bar ${lvl.value >= 100 ? 'skill-meter-bar--active' : ''}"></span>
                                </span>
                              </div>
                            </div>
                            <div class="skill-item-card__actions">
                              <button type="button" class="skill-action-btn edit-skill-btn" data-id="${s.id}" title="Edit ${s.name}">
                                ${icon('edit', 12)}
                              </button>
                              <button type="button" class="skill-action-btn skill-action-btn--del del-skill-btn" data-id="${s.id}" title="Delete ${s.name}">
                                ${icon('trash', 12)}
                              </button>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `).join('');
            })()}
          </div>
        `}
      </div>
    </div>`;

  // ── Bind about edit & requirements drive ──
  tabContent.querySelector('#edit-about-btn').onclick = () => openEditAboutModal();
  tabContent.querySelectorAll('#edit-drive-btn, #empty-add-drive-btn').forEach(btn => {
    btn.onclick = () => openRequirementsDriveModal();
  });

  // ── Experience ──
  tabContent.querySelector('#add-exp-btn').onclick = () => openExpModal(null);
  tabContent.querySelectorAll('.edit-exp-btn').forEach(b => b.onclick = () => openExpModal(EXP.find(e => e.id == b.dataset.id)));
  tabContent.querySelectorAll('.del-exp-btn').forEach(b => b.onclick = () => confirmDelete('Delete this experience entry?', async () => {
    await apiDelete(`/student/experience/${b.dataset.id}`);
    EXP = EXP.filter(e => e.id != b.dataset.id);
    renderAbout();
  }));

  // ── Education ──
  tabContent.querySelector('#add-edu-btn').onclick = () => openEduModal(null);
  tabContent.querySelectorAll('.edit-edu-btn').forEach(b => b.onclick = () => openEduModal(EDU.find(e => e.id == b.dataset.id)));
  tabContent.querySelectorAll('.del-edu-btn').forEach(b => b.onclick = () => confirmDelete('Delete this education entry?', async () => {
    await apiDelete(`/student/education/${b.dataset.id}`);
    EDU = EDU.filter(e => e.id != b.dataset.id);
    renderAbout();
  }));

  // ── Skills ──
  tabContent.querySelectorAll('#add-skill-btn, #empty-add-skill-btn').forEach(b => {
    b.onclick = () => openSkillModal(null);
  });
  tabContent.querySelectorAll('.edit-skill-btn').forEach(b => b.onclick = () => openSkillModal(SKL.find(s => s.id == b.dataset.id)));
  tabContent.querySelectorAll('.del-skill-btn').forEach(b => b.onclick = () => confirmDelete('Delete this skill?', async () => {
    await apiDelete(`/student/skills/${b.dataset.id}`);
    SKL = SKL.filter(s => s.id != b.dataset.id);
    renderAbout();
  }));
}

/* ── Shared inline styles for profile form modals ── */
function pfmStyles(extra = '') {
  return `
    .pfm-box { max-width:520px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
    .pfm-header { padding:18px 22px; border-bottom:1px solid var(--border-subtle); flex-shrink:0; display:flex; align-items:center; justify-content:space-between; }
    .pfm-header-left { display:flex; align-items:center; gap:14px; }
    .pfm-icon-box { width:40px; height:40px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#fff; }
    .pfm-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin:0; }
    .pfm-subtitle { font-size:.78rem; color:var(--text-tertiary); margin:2px 0 0; }
    .pfm-close-btn { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:var(--surface-hover); border:none; cursor:pointer; color:var(--text-secondary); flex-shrink:0; transition:background .15s,color .15s; }
    .pfm-close-btn:hover { background:var(--border-default); color:var(--text-primary); }
    .pfm-form-body { flex:1; overflow-y:auto; display:flex; flex-direction:column; }
    .pfm-form-body::-webkit-scrollbar { width:4px; }
    .pfm-form-body::-webkit-scrollbar-thumb { background:var(--border-default); border-radius:99px; }
    .pfm-section { padding:18px 22px; display:flex; flex-direction:column; gap:12px; }
    .pfm-section-label { display:flex; align-items:center; gap:6px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--text-tertiary); }
    .pfm-divider { height:1px; background:var(--border-subtle); flex-shrink:0; }
    .pfm-fields { display:flex; flex-direction:column; gap:12px; }
    .pfm-label { font-size:.8rem; font-weight:600; color:var(--text-secondary); margin-bottom:4px; display:block; }
    .pfm-req { color:var(--color-danger,#EF4444); }
    .pfm-hint { color:var(--text-tertiary); font-weight:400; }
    .pfm-input { font-size:.875rem !important; border-radius:10px !important; }
    .pfm-input:focus { border-color:var(--color-primary) !important; box-shadow:0 0 0 3px var(--color-primary-bg) !important; outline:none !important; }
    .pfm-input-wrap { position:relative; display:flex; align-items:center; }
    .pfm-input-prefix { position:absolute; left:11px; color:var(--text-tertiary); display:flex; pointer-events:none; }
    .pfm-input--prefixed { padding-left:34px !important; }
    .pfm-footer { position:sticky; bottom:0; background:var(--surface-card); border-top:1px solid var(--border-subtle); padding:14px 22px; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; flex-shrink:0; }
    .pfm-error { color:var(--color-danger,#EF4444); font-size:.8rem; flex:1; margin:0; min-height:1em; }
    .pfm-footer-actions { display:flex; gap:10px; flex-shrink:0; }
    .pfm-save-btn { display:flex; align-items:center; gap:7px; }
    .pfm-type-grid { display:flex; flex-wrap:wrap; gap:6px; }
    .pfm-type-pill { padding:5px 14px; border-radius:999px; font-size:.8rem; font-weight:600; border:1.5px solid var(--border-default); background:var(--surface-card); color:var(--text-secondary); cursor:pointer; transition:all .15s; white-space:nowrap; }
    .pfm-type-pill:hover { border-color:var(--color-primary); color:var(--color-primary); }
    .pfm-type-pill--active { background:linear-gradient(135deg,#4A6CF7,#6D8DFF); color:#fff; border-color:transparent; box-shadow:0 2px 8px rgba(74,108,247,.3); }
    .pfm-dropzone { border:2px dashed var(--border-default); border-radius:12px; padding:20px 16px; text-align:center; cursor:pointer; transition:all .2s ease; background:var(--bg-secondary); }
    .pfm-dropzone:hover { border-color:var(--color-primary); background:rgba(0,89,48,0.04); }
    .pfm-dropzone--has-file { border-style:solid; border-color:var(--color-primary); background:var(--surface-card); }
    .pfm-preview-box { position:relative; width:100%; max-height:180px; overflow:hidden; border-radius:8px; border:1px solid var(--border-default); }
    .pfm-preview-img { width:100%; height:180px; object-fit:cover; display:block; }
    .pfm-preview-remove { position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:6px; background:rgba(0,0,0,0.65); color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
    .pfm-preview-remove:hover { background:#EF4444; }
    .pfm-tag-chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:6px; }
    .pfm-tag-pill { background:var(--surface-card); border:1px solid var(--border-default); color:var(--text-secondary); font-size:0.72rem; font-weight:600; padding:2px 8px; border-radius:99px; cursor:pointer; transition:all .15s; }
    .pfm-tag-pill:hover { border-color:var(--color-primary); color:var(--color-primary); background:var(--color-primary-bg); }
    ${extra}`;
}

/* ── Save button icon helper ── */
const SAVE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
const SPIN_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .7s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

/* ── Edit About Modal ── */
function openEditAboutModal() {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" role="dialog" aria-modal="true">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#10B981,#34D399);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h3 class="pfm-title">Edit About Me</h3>
            <p class="pfm-subtitle">Update your public profile information</p>
          </div>
        </div>
        <button type="button" class="pfm-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="pfm-form" class="pfm-form-body" novalidate>

        <!-- Profile -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
            Profile
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Headline</label>
              <input class="form-input pfm-input" name="headline" placeholder="e.g. BSIT Student · Frontend Developer" value="${P.headline || ''}">
            </div>
            <div class="form-group">
              <label class="pfm-label">Bio</label>
              <textarea class="form-input form-textarea pfm-input" name="bio" rows="4" placeholder="Tell us about yourself…">${P.bio || ''}</textarea>
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Contact -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.1 2 2 0 0 1 3.58 3h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6A16 16 0 0 0 13.4 16.09l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Contact
          </div>
          <div class="pfm-fields" style="flex-direction:row;gap:10px;">
            <div class="form-group" style="flex:1;">
              <label class="pfm-label">Phone</label>
              <input class="form-input pfm-input" name="phone" type="tel" placeholder="+63 912 345 6789" value="${P.phone || ''}">
            </div>
            <div class="form-group" style="flex:1;">
              <label class="pfm-label">City / Location</label>
              <input class="form-input pfm-input" name="location" placeholder="Bacolod City, Philippines" value="${P.location || ''}">
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Links -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Links
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">GitHub</label>
              <div class="pfm-input-wrap">
                <span class="pfm-input-prefix"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></span>
                <input class="form-input pfm-input pfm-input--prefixed" name="github_url" placeholder="github.com/username" value="${P.github_url || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="pfm-label">LinkedIn</label>
              <div class="pfm-input-wrap">
                <span class="pfm-input-prefix"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span>
                <input class="form-input pfm-input pfm-input--prefixed" name="linkedin_url" placeholder="linkedin.com/in/username" value="${P.linkedin_url || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="pfm-label">Portfolio Website</label>
              <div class="pfm-input-wrap">
                <span class="pfm-input-prefix"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                <input class="form-input pfm-input pfm-input--prefixed" name="portfolio_url" placeholder="yoursite.dev" value="${P.portfolio_url || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="pfm-label">OJT Requirements Drive Link (e.g. Google Drive)</label>
              <div class="pfm-input-wrap">
                <span class="pfm-input-prefix">${icon('folder', 14)}</span>
                <input class="form-input pfm-input pfm-input--prefixed" name="requirements_drive_url" type="url" placeholder="https://drive.google.com/drive/folders/..." value="${P.requirements_drive_url || ''}">
              </div>
              <span style="font-size:0.73rem;color:var(--text-tertiary);margin-top:3px;display:block;">Upload your required OJT documents into a cloud drive and share the link here.</span>
            </div>
          </div>
        </div>

        <!-- Footer (sticky) -->
        <div class="pfm-footer">
          <p class="pfm-error" id="pfm-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost pfm-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn">${SAVE_ICON} Save Changes</button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.pfm-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.pfm-close-btn').onclick = close;
  overlay.querySelector('.pfm-cancel').onclick     = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#pfm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl   = overlay.querySelector('#pfm-error');
    const saveBtn = overlay.querySelector('.pfm-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `${SPIN_ICON} Saving…`;
    const form = new FormData(e.target);
    const data = {
      headline: formVal(form, 'headline'), bio: formVal(form, 'bio'),
      phone: formVal(form, 'phone'), location: formVal(form, 'location'),
      github_url: formVal(form, 'github_url'), linkedin_url: formVal(form, 'linkedin_url'),
      portfolio_url: formVal(form, 'portfolio_url'),
      requirements_drive_url: formVal(form, 'requirements_drive_url'),
    };
    try {
      const res = await apiPut('/student/about', data);
      Object.assign(P, data);
      if (res?.data?.requirements_drive_url !== undefined) {
        P.requirements_drive_url = res.data.requirements_drive_url;
      }
      const headerHeadline = document.getElementById('profile-headline');
      if (headerHeadline) headerHeadline.textContent = P.headline || '';
      const metaLocation = document.getElementById('profile-location');
      if (metaLocation) metaLocation.textContent = P.location || '—';
      renderProfileLinks();
      close();
      renderAbout();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} Save Changes`;
      errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

/* ── Requirements Drive Modal ── */
function openRequirementsDriveModal() {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();
  const activeReq = Array.isArray(REQS) && REQS.length ? REQS[0] : null;

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" role="dialog" aria-modal="true" style="max-width:500px;">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#0284c7,#38bdf8);">
            ${icon('folder', 20)}
          </div>
          <div>
            <h3 class="pfm-title">${activeReq ? 'Submit OJT Requirements' : 'OJT Requirements Drive'}</h3>
            <p class="pfm-subtitle">${activeReq ? `Upload documents for ${activeReq.title}` : 'Attach or update your Google Drive folder link'}</p>
          </div>
        </div>
        <button type="button" class="pfm-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="pfm-drive-form" class="pfm-form-body" novalidate>
        <div class="pfm-section">
          <div class="pfm-section-label">
            ${icon('folder', 13)} Cloud Drive Link
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Requirements Folder URL (Google Drive / OneDrive)</label>
              <div class="pfm-input-wrap">
                <span class="pfm-input-prefix">${icon('folder', 14)}</span>
                <input class="form-input pfm-input pfm-input--prefixed" name="requirements_drive_url" type="url" placeholder="https://drive.google.com/drive/folders/..." value="${P.requirements_drive_url || ''}">
              </div>
              <p style="font-size:0.75rem;color:var(--text-tertiary);margin:6px 0 0;line-height:1.4;">
                Upload your required OJT documents (medical certificate, waiver, endorsement forms, etc.) to a cloud drive folder, set permissions to <strong>"Anyone with the link can view"</strong>, and paste the URL here.
              </p>
            </div>
            ${P.requirements_drive_url ? `
              <div style="margin-top:6px;padding:8px 12px;background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.2);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <span style="font-size:0.78rem;color:#0284c7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;">Current: ${P.requirements_drive_url}</span>
                <a href="${P.requirements_drive_url}" target="_blank" rel="noopener" style="font-size:0.75rem;font-weight:600;color:#0284c7;text-decoration:underline;white-space:nowrap;">Open ↗</a>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="pfm-footer">
          <p class="pfm-error" id="pfm-drive-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost pfm-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn">${SAVE_ICON} ${activeReq ? 'Submit for Review' : 'Save Drive Link'}</button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.pfm-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.pfm-close-btn').onclick = close;
  overlay.querySelector('.pfm-cancel').onclick     = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#pfm-drive-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl   = overlay.querySelector('#pfm-drive-error');
    const saveBtn = overlay.querySelector('.pfm-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `${SPIN_ICON} Submitting…`;
    const form = new FormData(e.target);
    const driveUrl = formVal(form, 'requirements_drive_url');
    try {
      const res = await apiPut('/student/requirements/submit', {
        requirements_drive_url: driveUrl,
        requirement_id: activeReq?.id || null,
      });
      const resolvedUrl = res.requirements_drive_url ?? (driveUrl ? (driveUrl.startsWith('http') ? driveUrl : `https://${driveUrl}`) : null);
      P.requirements_drive_url = resolvedUrl;
      if (activeReq) {
        if (res.requirement) {
          Object.assign(activeReq, res.requirement);
        } else if (resolvedUrl) {
          activeReq.status = 'submitted';
          activeReq.drive_url = resolvedUrl;
        }
      }
      renderProfileLinks();
      close();
      renderAbout();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} ${activeReq ? 'Submit for Review' : 'Save Drive Link'}`;
      errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

/* ── Experience Modal ── */
function openExpModal(exp) {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();
  const EXP_TYPES = ['OJT','Freelance','Volunteer','Full-time','Part-time'];
  let selectedType = exp?.type || 'OJT';

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" role="dialog" aria-modal="true">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#4A6CF7,#6D8DFF);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div>
            <h3 class="pfm-title">${exp ? 'Edit Experience' : 'Add Experience'}</h3>
            <p class="pfm-subtitle">${exp ? 'Update your work history entry' : 'Add a new work or project entry'}</p>
          </div>
        </div>
        <button type="button" class="pfm-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="pfm-form" class="pfm-form-body" novalidate>

        <!-- Position -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Position
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Job Title <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="role" required placeholder="Frontend Developer Intern" value="${exp?.role || ''}">
            </div>
            <div class="form-group">
              <label class="pfm-label">Company / Organization <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="company" required placeholder="TechCorp Solutions" value="${exp?.company || ''}">
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Type & Period -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Type & Period
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Experience Type</label>
              <input type="hidden" name="type" id="pfm-type-val" value="${selectedType}">
              <div class="pfm-type-grid" id="pfm-type-grid">
                ${EXP_TYPES.map(t => `<button type="button" class="pfm-type-pill${t === selectedType ? ' pfm-type-pill--active' : ''}" data-type="${t}">${t}</button>`).join('')}
              </div>
            </div>
            <div style="display:flex;gap:10px;">
              <div class="form-group" style="flex:1;">
                <label class="pfm-label">Start</label>
                <input class="form-input pfm-input" name="period_start" placeholder="Jan 2026" value="${exp?.period_start || ''}">
              </div>
              <div class="form-group" style="flex:1;">
                <label class="pfm-label">End <span class="pfm-hint">(blank = Present)</span></label>
                <input class="form-input pfm-input" name="period_end" placeholder="Present" value="${exp?.period_end || ''}">
              </div>
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Details -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Details
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Description</label>
              <textarea class="form-input form-textarea pfm-input" name="description" rows="3" placeholder="What did you do? What did you achieve?">${exp?.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="pfm-label">Skills used <span class="pfm-hint">(comma-separated)</span></label>
              <input class="form-input pfm-input" name="skills_raw" placeholder="React, JavaScript, CSS" value="${(exp?.skills||[]).join(', ')}">
            </div>
          </div>
        </div>

        <!-- Footer (sticky) -->
        <div class="pfm-footer">
          <p class="pfm-error" id="pfm-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost pfm-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn">${SAVE_ICON} ${exp ? 'Save Changes' : 'Add Experience'}</button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.pfm-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.pfm-close-btn').onclick = close;
  overlay.querySelector('.pfm-cancel').onclick     = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#pfm-type-grid').addEventListener('click', e => {
    const btn = e.target.closest('.pfm-type-pill');
    if (!btn) return;
    selectedType = btn.dataset.type;
    overlay.querySelector('#pfm-type-val').value = selectedType;
    overlay.querySelectorAll('.pfm-type-pill').forEach(b =>
      b.classList.toggle('pfm-type-pill--active', b.dataset.type === selectedType));
  });

  overlay.querySelector('#pfm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl   = overlay.querySelector('#pfm-error');
    const saveBtn = overlay.querySelector('.pfm-save-btn');
    saveBtn.disabled  = true;
    saveBtn.innerHTML = `${SPIN_ICON} Saving…`;
    const form = new FormData(e.target);
    const data = {
      role: formVal(form, 'role'), company: formVal(form, 'company'),
      type: formVal(form, 'type'),
      period_start: formVal(form, 'period_start'), period_end: formVal(form, 'period_end'),
      description: formVal(form, 'description'),
      skills: formVal(form, 'skills_raw').split(',').map(s => s.trim()).filter(Boolean),
      is_current: !formVal(form, 'period_end'),
    };
    try {
      if (!data.role || !data.company) throw new Error('Job title and company are required.');
      if (exp) {
        await apiPut(`/student/experience/${exp.id}`, data);
        const idx = EXP.findIndex(e => e.id === exp.id);
        EXP[idx] = { ...EXP[idx], ...data, period: data.period_start + ' – ' + (data.period_end || 'Present') };
      } else {
        const res = await apiPost('/student/experience', data);
        EXP.unshift({ ...data, id: res.id, period: data.period_start + ' – ' + (data.period_end || 'Present') });
      }
      close();
      renderAbout();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} ${exp ? 'Save Changes' : 'Add Experience'}`;
      errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

/* ── Education Modal ── */
function openEduModal(edu) {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" role="dialog" aria-modal="true">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div>
            <h3 class="pfm-title">${edu ? 'Edit Education' : 'Add Education'}</h3>
            <p class="pfm-subtitle">${edu ? 'Update your academic record' : 'Add a school, program or certification'}</p>
          </div>
        </div>
        <button type="button" class="pfm-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="pfm-form" class="pfm-form-body" novalidate>

        <!-- Institution -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Institution
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">School / University <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="school" required placeholder="Carlos Hilado Memorial State University" value="${edu?.school || ''}">
            </div>
            <div class="form-group">
              <label class="pfm-label">Degree / Program <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="degree" required placeholder="Bachelor of Science in Information Technology" value="${edu?.degree || ''}">
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Period & GPA -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Period & Academic Record
          </div>
          <div style="display:flex;gap:10px;">
            <div class="form-group" style="flex:1;">
              <label class="pfm-label">Year Start</label>
              <input class="form-input pfm-input" name="year_start" placeholder="2022" value="${edu?.year_start || ''}">
            </div>
            <div class="form-group" style="flex:1;">
              <label class="pfm-label">Year End <span class="pfm-hint">(blank = Present)</span></label>
              <input class="form-input pfm-input" name="year_end" placeholder="2026" value="${edu?.year_end || ''}">
            </div>
            <div class="form-group" style="flex:0 0 100px;">
              <label class="pfm-label">GPA</label>
              <input class="form-input pfm-input" name="gpa" placeholder="1.50" value="${edu?.gpa || ''}">
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Honors -->
        <div class="pfm-section">
          <div class="pfm-section-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Honors & Details
          </div>
          <div class="pfm-fields">
            <div class="form-group">
              <label class="pfm-label">Description / Honors</label>
              <textarea class="form-input form-textarea pfm-input" name="description" rows="3" placeholder="Dean's Lister, Computer Club President, Magna Cum Laude…">${edu?.description || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- Footer (sticky) -->
        <div class="pfm-footer">
          <p class="pfm-error" id="pfm-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost pfm-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn">${SAVE_ICON} ${edu ? 'Save Changes' : 'Add Education'}</button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.pfm-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('.pfm-close-btn').onclick = close;
  overlay.querySelector('.pfm-cancel').onclick     = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#pfm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl   = overlay.querySelector('#pfm-error');
    const saveBtn = overlay.querySelector('.pfm-save-btn');
    saveBtn.disabled  = true;
    saveBtn.innerHTML = `${SPIN_ICON} Saving…`;
    const form = new FormData(e.target);
    const data = {
      school: formVal(form, 'school'), degree: formVal(form, 'degree'),
      year_start: formVal(form, 'year_start'), year_end: formVal(form, 'year_end'),
      gpa: formVal(form, 'gpa'), description: formVal(form, 'description'),
      is_current: !formVal(form, 'year_end'),
    };
    try {
      if (!data.school || !data.degree) throw new Error('School and degree are required.');
      if (edu) {
        await apiPut(`/student/education/${edu.id}`, data);
        const idx = EDU.findIndex(e => e.id === edu.id);
        EDU[idx] = { ...EDU[idx], ...data, period: data.year_start + ' – ' + (data.year_end || 'Present') };
      } else {
        const res = await apiPost('/student/education', data);
        EDU.unshift({ ...data, id: res.id, period: data.year_start + ' – ' + (data.year_end || 'Present') });
      }
      close();
      renderAbout();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} ${edu ? 'Save Changes' : 'Add Education'}`;
      errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });
}

/* ── Skill Proficiency Helpers ── */
const SKILL_LEVELS = [
  { key: 'beginner',     label: 'Beginner',     value: 25,  color: '#64748B' },
  { key: 'intermediate', label: 'Intermediate',  value: 50,  color: '#3B82F6' },
  { key: 'advanced',     label: 'Advanced',      value: 75,  color: '#8B5CF6' },
  { key: 'expert',       label: 'Expert',        value: 100, color: '#10B981' },
];
function skillLevelMeta(level) {
  const v = level ?? 50;
  if (v <= 25)  return SKILL_LEVELS[0];
  if (v <= 50)  return SKILL_LEVELS[1];
  if (v <= 75)  return SKILL_LEVELS[2];
  return SKILL_LEVELS[3];
}

/* ── Skill Modal ── */
/* ── Predefined skill lists per category ── */
const SKILL_CATALOG = {
  language: [
    'HTML','CSS','JavaScript','TypeScript','Python','Java','PHP','C','C++','C#',
    'Ruby','Go','Rust','Swift','Kotlin','Dart','R','MATLAB','Scala','Bash','SQL',
    'Perl','Lua','Elixir','Haskell','Assembly',
  ],
  framework: [
    'React','Vue.js','Angular','Next.js','Nuxt.js','Svelte','SvelteKit','Bootstrap',
    'Tailwind CSS','Laravel','Django','Flask','FastAPI','Spring Boot','Express.js',
    'Node.js','Flutter','React Native','Ionic','Electron','Astro','Remix',
    'Ruby on Rails','Symfony','CodeIgniter',
  ],
  tool: [
    'Git','GitHub','GitLab','Bitbucket','Docker','Kubernetes','VS Code','Figma',
    'Adobe XD','Postman','Insomnia','Linux','Webpack','Vite','npm','Yarn','Pnpm',
    'Jira','Trello','Notion','Slack','Photoshop','Illustrator','Canva','Nginx',
    'Apache','CI/CD','Jenkins','GitHub Actions',
  ],
  database: [
    'MySQL','PostgreSQL','SQLite','MariaDB','MongoDB','Firebase','Supabase',
    'Redis','Oracle','MS SQL Server','Elasticsearch','DynamoDB','Cassandra',
    'CouchDB','PlanetScale','Neon',
  ],
  other: [
    'REST API','GraphQL','WebSockets','gRPC','UI/UX Design','Agile / Scrum',
    'Project Management','Technical Writing','Data Analysis','Machine Learning',
    'Deep Learning','Computer Vision','NLP','DevOps','AWS','GCP','Azure',
    'Cybersecurity','Networking','SEO','Content Management','Blockchain','IoT',
  ],
};

const CATEGORY_META = {
  language:  { label: 'Languages',            emoji: '💻', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  framework: { label: 'Frameworks & Libraries', emoji: '🧩', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  tool:      { label: 'Tools & Software',       emoji: '🔧', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  database:  { label: 'Databases',              emoji: '🗄️', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  other:     { label: 'Other',                  emoji: '✨', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
};

function openSkillModal(skill) {
  const initCat   = skill?.category || 'language';
  const initName  = skill?.name     || '';
  const initLevel = skill?.level    ?? 50;

  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box skm-box" role="dialog" aria-modal="true">
      <!-- ── Header ── -->
      <div class="modal-header skm-header">
        <div class="skm-header-left">
          <div class="skm-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div>
            <h3 class="skm-title">${skill ? 'Edit Skill' : 'Add a Skill'}</h3>
            <p class="skm-subtitle">${skill ? 'Update your skill details' : 'Pick from the catalog or add your own'}</p>
          </div>
        </div>
        <button class="skm-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <!-- ── Body: two-column ── -->
      <div class="skm-layout">

        <!-- LEFT: category sidebar -->
        <nav class="skm-sidebar" id="skm-sidebar">
          ${Object.entries(CATEGORY_META).map(([cat, m]) => `
            <button type="button" class="skm-cat-btn ${cat === initCat ? 'skm-cat-btn--active' : ''}" data-cat="${cat}">
              <span class="skm-cat-emoji">${m.emoji}</span>
              <span class="skm-cat-label">${m.label}</span>
            </button>`).join('')}
        </nav>

        <!-- RIGHT: skill picker -->
        <div class="skm-right">

          <!-- Search -->
          <div class="skm-search-wrap">
            <svg class="skm-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input class="skm-search" id="skm-search" type="text" placeholder="Search skills…" autocomplete="off" spellcheck="false">
            <button class="skm-search-clear" id="skm-search-clear" style="display:none;" aria-label="Clear">
              ${icon('x', 12)}
            </button>
          </div>

          <!-- Chip grid -->
          <div class="skm-chip-grid" id="skm-chip-grid"></div>

          <!-- Manual input toggle -->
          <div class="skm-manual-toggle" id="skm-manual-wrap" style="display:none;">
            <span>No results.</span>
            <button type="button" class="skm-manual-link" id="skm-manual-btn">Add "<span id="skm-manual-query"></span>" manually</button>
          </div>
          <div class="skm-manual-input-wrap" id="skm-manual-input-wrap" style="display:none;">
            <label class="skm-manual-label">Custom skill name</label>
            <div class="skm-manual-row">
              <input class="form-input skm-manual-input" id="skm-manual-input" type="text" placeholder="e.g. Figma Prototyping" maxlength="60">
              <button type="button" class="btn btn--primary btn--sm" id="skm-manual-confirm">Use this</button>
            </div>
          </div>

        </div>
      </div>

      <div class="skm-footer">
        <!-- Selected preview -->
        <div class="skm-preview" id="skm-preview">
          <div class="skm-preview-left">
            <div class="skm-preview-dot" id="skm-preview-dot"></div>
            <div>
              <div class="skm-preview-name" id="skm-preview-name">No skill selected</div>
              <div class="skm-preview-cat" id="skm-preview-cat">Choose a skill above</div>
            </div>
          </div>
        </div>
        <div class="skm-level-wrap">
          <div class="skm-level-header">
            <span class="skm-level-title">Proficiency</span>
            <div class="skm-level-badges" id="skm-level-badges">
              ${SKILL_LEVELS.map(l => `
                <button type="button" class="skm-lvl-badge ${skillLevelMeta(initLevel).key === l.key ? 'skm-lvl-badge--active' : ''}" data-level="${l.value}" data-key="${l.key}">${l.label}</button>
              `).join('')}
            </div>
          </div>
        </div>
        <!-- Actions -->
        <div class="skm-actions">
          <button type="button" class="btn btn--ghost" id="skm-cancel">Cancel</button>
          <button type="button" class="btn btn--primary skm-save-btn" id="skm-save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save Skill
          </button>
        </div>
        <p class="skm-error" id="skm-error"></p>
      </div>
    </div>

    <style>
      /* ── Skill Modal ── */
      .skm-box { max-width: 660px; max-height: 88vh; display:flex; flex-direction:column; overflow:hidden; }

      /* header */
      .skm-header { padding: 18px 22px; border-bottom: 1px solid var(--border-subtle); flex-shrink:0; }
      .skm-header-left { display:flex; align-items:center; gap:14px; }
      .skm-header-icon {
        width:40px; height:40px; border-radius:12px; flex-shrink:0;
        background: linear-gradient(135deg,#4A6CF7,#6D8DFF);
        display:flex; align-items:center; justify-content:center; color:#fff;
      }
      .skm-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin:0; }
      .skm-subtitle { font-size:.78rem; color:var(--text-tertiary); margin:2px 0 0; }
      .skm-close-btn {
        margin-left:auto; width:34px; height:34px; border-radius:8px;
        display:flex; align-items:center; justify-content:center;
        background:var(--surface-hover); border:none; cursor:pointer; color:var(--text-secondary);
        flex-shrink:0; transition:background .15s,color .15s;
      }
      .skm-close-btn:hover { background:var(--border-default); color:var(--text-primary); }

      /* two-column body */
      .skm-layout { display:flex; flex:1; overflow:hidden; min-height:0; }

      /* sidebar */
      .skm-sidebar {
        width:170px; flex-shrink:0; padding:12px 8px;
        border-right:1px solid var(--border-subtle);
        display:flex; flex-direction:column; gap:2px; overflow-y:auto;
      }
      .skm-cat-btn {
        display:flex; align-items:center; gap:10px; width:100%;
        padding:9px 12px; border-radius:10px; border:none; cursor:pointer;
        background:transparent; text-align:left;
        font-size:.82rem; color:var(--text-secondary); font-weight:500;
        transition:background .15s,color .15s;
      }
      .skm-cat-btn:hover { background:var(--surface-hover); color:var(--text-primary); }
      .skm-cat-btn--active {
        background:var(--color-primary-bg); color:var(--color-primary);
        font-weight:700;
      }
      .skm-cat-emoji { font-size:1.05rem; flex-shrink:0; }
      .skm-cat-label { line-height:1.3; }

      /* right panel */
      .skm-right { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:14px 16px; gap:12px; }

      /* search */
      .skm-search-wrap {
        display:flex; align-items:center; gap:8px;
        background:var(--bg-secondary); border:1.5px solid var(--border-default);
        border-radius:10px; padding:8px 12px; transition:border .15s;
      }
      .skm-search-wrap:focus-within { border-color:var(--color-primary); background:var(--surface-card); }
      .skm-search-icon { color:var(--text-tertiary); flex-shrink:0; }
      .skm-search {
        flex:1; background:none; border:none; outline:none;
        font-size:.85rem; color:var(--text-primary);
      }
      .skm-search::placeholder { color:var(--text-tertiary); }
      .skm-search-clear {
        background:none; border:none; cursor:pointer;
        color:var(--text-tertiary); display:flex; align-items:center; padding:0;
        border-radius:4px; transition:color .15s;
      }
      .skm-search-clear:hover { color:var(--text-primary); }

      /* chip grid */
      .skm-chip-grid {
        flex:1; overflow-y:auto; display:flex; flex-wrap:wrap;
        gap:7px; align-content:flex-start; padding-right:4px;
      }
      .skm-chip-grid::-webkit-scrollbar { width:4px; }
      .skm-chip-grid::-webkit-scrollbar-thumb { background:var(--border-default); border-radius:99px; }
      .skm-chip {
        display:inline-flex; align-items:center; gap:5px;
        padding:5px 13px; border-radius:999px; font-size:.8rem; font-weight:500;
        border: 1.5px solid var(--border-default); background:var(--surface-card);
        color:var(--text-secondary); cursor:pointer; transition:all .15s; white-space:nowrap;
        user-select:none;
      }
      .skm-chip:hover { border-color:var(--color-primary); color:var(--color-primary); background:var(--color-primary-bg); }
      .skm-chip--active {
        background:linear-gradient(135deg,#4A6CF7,#6D8DFF); color:#fff;
        border-color:transparent; box-shadow:0 2px 8px rgba(74,108,247,.35);
      }
      .skm-chip--active:hover { opacity:.9; color:#fff; }
      .skm-chip-check { display:none; }
      .skm-chip--active .skm-chip-check { display:inline; }

      /* manual */
      .skm-manual-toggle { font-size:.8rem; color:var(--text-tertiary); display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .skm-manual-link { background:none; border:none; cursor:pointer; color:var(--color-primary); font-size:.8rem; font-weight:600; text-decoration:underline; text-underline-offset:2px; padding:0; }
      .skm-manual-label { font-size:.78rem; font-weight:600; color:var(--text-secondary); margin-bottom:4px; }
      .skm-manual-row { display:flex; gap:8px; }
      .skm-manual-input { flex:1; font-size:.85rem; }

      /* footer */
      .skm-footer {
        border-top:1px solid var(--border-subtle); flex-shrink:0;
        padding:16px 20px; display:flex; flex-direction:column; gap:14px;
      }
      .skm-preview { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; background:var(--bg-secondary); border:1.5px solid var(--border-default); min-height:52px; }
      .skm-preview-left { display:flex; align-items:center; gap:12px; }
      .skm-preview-dot { width:10px; height:10px; border-radius:999px; flex-shrink:0; background: linear-gradient(135deg,#4A6CF7,#6D8DFF); opacity:.3; transition:opacity .2s; }
      .skm-preview-dot--active { opacity:1; }
      .skm-preview-name { font-size:.9rem; font-weight:700; color:var(--text-primary); }
      .skm-preview-cat { font-size:.75rem; color:var(--text-tertiary); margin-top:1px; }

      /* level */
      .skm-level-wrap { display:flex; flex-direction:column; gap:6px; }
      .skm-level-header { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
      .skm-level-title { font-size:.78rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:.06em; }
      .skm-level-badges { display:flex; flex-wrap:wrap; gap:6px; }
      .skm-lvl-badge { padding:5px 14px; border-radius:999px; font-size:.76rem; font-weight:600; border:1.5px solid var(--border-default); background:var(--surface-card); color:var(--text-secondary); cursor:pointer; transition:all .18s; }
      .skm-lvl-badge:hover { border-color:var(--color-primary); color:var(--color-primary); background:var(--color-primary-bg); }
      .skm-lvl-badge--active { color:#fff; border-color:transparent; }
      .skm-lvl-badge[data-key="beginner"].skm-lvl-badge--active     { background:#64748B; }
      .skm-lvl-badge[data-key="intermediate"].skm-lvl-badge--active { background:#3B82F6; }
      .skm-lvl-badge[data-key="advanced"].skm-lvl-badge--active     { background:#8B5CF6; }
      .skm-lvl-badge[data-key="expert"].skm-lvl-badge--active       { background:#10B981; }
      .skill-chip__level { font-size:.65rem; font-weight:700; padding:2px 7px; border-radius:999px; letter-spacing:.03em; flex-shrink:0; }
      .skill-chip__level--beginner     { background:rgba(100,116,139,.12); color:#64748B; }
      .skill-chip__level--intermediate { background:rgba(59,130,246,.12);  color:#3B82F6; }
      .skill-chip__level--advanced     { background:rgba(139,92,246,.12);  color:#8B5CF6; }
      .skill-chip__level--expert       { background:rgba(16,185,129,.12);  color:#10B981; }

      /* actions */
      .skm-actions { display:flex; justify-content:flex-end; gap:10px; }
      .skm-save-btn { display:flex; align-items:center; gap:7px; }
      .skm-error { color:var(--color-danger,#EF4444); font-size:.8rem; min-height:1em; margin:0; text-align:right; }
      .skm-slider-track {
        position:relative; height:8px; border-radius:999px;
        background:var(--border-default); overflow:visible;
      }
      .skm-slider-fill {
        position:absolute; left:0; top:0; height:100%;
        border-radius:999px; pointer-events:none;
        background:linear-gradient(90deg,#4A6CF7,#6D8DFF);
        transition:width .1s;
      }
      .skm-slider {
        position:absolute; inset:0; width:100%; height:100%;
        opacity:0; cursor:pointer; margin:0; z-index:1;
      }

      .skm-slider-labels { display:flex; justify-content:space-between; font-size:.72rem; color:var(--text-tertiary); }
      .skm-slider-val { font-weight:700; color:var(--color-primary); }

      /* actions */
      .skm-actions { display:flex; justify-content:flex-end; gap:10px; }
      .skm-save-btn { display:flex; align-items:center; gap:7px; }
      .skm-error { color:var(--color-danger,#EF4444); font-size:.8rem; min-height:1em; margin:0; text-align:right; }

      /* dark mode tweak */
      [data-theme="dark"] .skm-chip { background:var(--bg-secondary); }
    </style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.skm-box')?.classList.add('modal-box--visible'));

  /* ── helpers ── */
  const close = () => overlay.remove();
  overlay.querySelector('.skm-close-btn').onclick  = close;
  overlay.querySelector('#skm-cancel').onclick     = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  /* ── state ── */
  let selectedCat   = initCat;
  let selectedName  = initName;
  let selectedLevel = initLevel;
  let manualMode    = false;
  let searchQ       = '';

  // Wire proficiency badge buttons
  overlay.querySelector('#skm-level-badges').addEventListener('click', e => {
    const btn = e.target.closest('.skm-lvl-badge');
    if (!btn) return;
    selectedLevel = parseInt(btn.dataset.level, 10);
    overlay.querySelectorAll('.skm-lvl-badge').forEach(b =>
      b.classList.toggle('skm-lvl-badge--active', b === btn));
  });

  /* ── update preview strip ── */
  function updatePreview() {
    const dot  = overlay.querySelector('#skm-preview-dot');
    const name = overlay.querySelector('#skm-preview-name');
    const cat  = overlay.querySelector('#skm-preview-cat');
    if (selectedName) {
      dot.classList.add('skm-preview-dot--active');
      name.textContent = selectedName;
      cat.textContent  = `${CATEGORY_META[selectedCat]?.label ?? selectedCat}`;
    } else {
      dot.classList.remove('skm-preview-dot--active');
      name.textContent = 'No skill selected';
      cat.textContent  = 'Choose a skill above';
    }
  }

  /* ── render chip grid ── */
  function renderChips() {
    const grid    = overlay.querySelector('#skm-chip-grid');
    const manual  = overlay.querySelector('#skm-manual-wrap');
    const manInp  = overlay.querySelector('#skm-manual-input-wrap');
    const q       = searchQ.toLowerCase();
    const source  = SKILL_CATALOG[selectedCat] || [];
    const filtered = q ? source.filter(s => s.toLowerCase().includes(q)) : source;

    if (filtered.length === 0 && !manualMode) {
      grid.innerHTML  = '';
      manual.style.display = 'flex';
      overlay.querySelector('#skm-manual-query').textContent = searchQ;
    } else {
      manual.style.display = 'none';
    }

    if (!manualMode) {
      manInp.style.display = 'none';
    }

    grid.innerHTML = filtered.map(s => `
      <button type="button" class="skm-chip ${s === selectedName ? 'skm-chip--active' : ''}" data-skill="${s}">
        <svg class="skm-chip-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ${s}
      </button>`).join('');

    grid.querySelectorAll('.skm-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedName = btn.dataset.skill;
        manualMode   = false;
        renderChips();
        updatePreview();
      });
    });
  }

  /* ── category sidebar ── */
  overlay.querySelector('#skm-sidebar').addEventListener('click', e => {
    const btn = e.target.closest('.skm-cat-btn');
    if (!btn) return;
    selectedCat  = btn.dataset.cat;
    selectedName = '';
    searchQ      = '';
    manualMode   = false;
    overlay.querySelector('#skm-search').value = '';
    overlay.querySelector('#skm-search-clear').style.display = 'none';
    overlay.querySelector('#skm-manual-input-wrap').style.display = 'none';
    overlay.querySelectorAll('.skm-cat-btn').forEach(b => {
      b.classList.toggle('skm-cat-btn--active', b.dataset.cat === selectedCat);
    });
    renderChips();
    updatePreview();
  });

  /* ── search ── */
  const searchEl   = overlay.querySelector('#skm-search');
  const clearBtn   = overlay.querySelector('#skm-search-clear');
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQ = searchEl.value.trim();
      clearBtn.style.display = searchQ ? 'flex' : 'none';
      manualMode = false;
      renderChips();
    }, 180);
  });
  clearBtn.addEventListener('click', () => {
    searchEl.value = '';
    searchQ        = '';
    clearBtn.style.display = 'none';
    manualMode = false;
    overlay.querySelector('#skm-manual-input-wrap').style.display = 'none';
    renderChips();
  });

  /* ── manual input ── */
  overlay.querySelector('#skm-manual-btn').addEventListener('click', () => {
    const wrap = overlay.querySelector('#skm-manual-input-wrap');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    const inp = overlay.querySelector('#skm-manual-input');
    inp.value = searchQ;
    inp.focus();
    inp.select();
  });
  overlay.querySelector('#skm-manual-confirm').addEventListener('click', () => {
    const val = overlay.querySelector('#skm-manual-input').value.trim();
    if (!val) return;
    selectedName = val;
    manualMode   = true;
    renderChips();
    updatePreview();
  });

  /* ── save ── */
  overlay.querySelector('#skm-save').addEventListener('click', async () => {
    const errEl = overlay.querySelector('#skm-error');
    if (!selectedName) { errEl.textContent = '⚠ Please select or enter a skill.'; return; }
    errEl.textContent = '';

    const saveBtn = overlay.querySelector('#skm-save');
    saveBtn.disabled     = true;
    saveBtn.innerHTML    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .7s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…`;

    const data = { name: selectedName, level: selectedLevel, category: selectedCat };
    try {
      if (skill) {
        await apiPut(`/student/skills/${skill.id}`, data);
        const idx = SKL.findIndex(s => s.id === skill.id);
        SKL[idx] = { ...SKL[idx], ...data };
      } else {
        const res = await apiPost('/student/skills', data);
        SKL.push({ ...data, id: res.id, endorsed_count: 0 });
      }
      close();
      renderAbout();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Skill`;
      errEl.textContent = err.message || 'Save failed. Try again.';
    }
  });

  /* ── initial render ── */
  renderChips();
  updatePreview();
}

/* ══════════════════════════════════════════════════
   RESUME TAB
   ══════════════════════════════════════════════════ */
function safeArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function groupSkillsForResume(skills) {
  if (!skills || skills.length === 0) return [];

  const catMap = {
    'Languages': [],
    'Frameworks & Libraries': [],
    'Databases & Backend': [],
    'Tools & Platforms': [],
    'Core Competencies': [],
  };

  const lowerCats = {
    frontend: 'Frameworks & Libraries',
    backend: 'Databases & Backend',
    database: 'Databases & Backend',
    databases: 'Databases & Backend',
    languages: 'Languages',
    programming: 'Languages',
    tools: 'Tools & Platforms',
    devops: 'Tools & Platforms',
    mobile: 'Frameworks & Libraries',
    cloud: 'Tools & Platforms',
    soft: 'Core Competencies',
    design: 'Core Competencies',
  };

  let hasCategorized = false;
  skills.forEach(s => {
    const rawCat = (s.category || '').toLowerCase();
    const mapped = lowerCats[rawCat];
    if (mapped) {
      catMap[mapped].push(s.name);
      hasCategorized = true;
    } else if (s.category && s.category !== 'General' && s.category !== 'Other') {
      if (!catMap[s.category]) catMap[s.category] = [];
      catMap[s.category].push(s.name);
      hasCategorized = true;
    }
  });

  if (hasCategorized) {
    const result = [];
    for (const [catName, list] of Object.entries(catMap)) {
      if (list.length > 0) {
        result.push({ label: catName, items: [...new Set(list)].join(', ') });
      }
    }
    const handled = new Set(result.flatMap(r => r.items.split(', ')));
    const unhandled = skills.filter(s => !handled.has(s.name)).map(s => s.name);
    if (unhandled.length > 0) {
      result.push({ label: 'Additional Skills', items: unhandled.join(', ') });
    }
    return result;
  }

  return [{ label: 'Technical & Domain Skills', items: skills.map(s => s.name).join(', ') }];
}

/* ══════════════════════════════════════════════════
   RESUME TAB (EXECUTIVE 1-PAGE ATS FORMAT)
   ══════════════════════════════════════════════════ */
function renderResume() {
  const typeLabel = P.resume_type === 'summary' ? 'Professional Summary' : 'Career Objective';
  const objText   = P.resume_objective || (P.bio ? P.bio : '<em class="text-tertiary">No objective or professional summary written yet. Click "Edit Summary" above to add one.</em>');

  // Single-line contact details
  const contacts = [];
  if (P.phone) contacts.push(`<span>${P.phone}</span>`);
  if (P.email) contacts.push(`<a href="mailto:${P.email}">${P.email}</a>`);
  if (P.location) contacts.push(`<span>${P.location}</span>`);
  if (P.linkedin_url) {
    const clean = P.linkedin_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">linkedin.com/${clean.replace(/^linkedin\.com\//, '')}</a>`);
  }
  if (P.github_url) {
    const clean = P.github_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">github.com/${clean.replace(/^github\.com\//, '')}</a>`);
  }
  if (P.portfolio_url) {
    const clean = P.portfolio_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">${clean}</a>`);
  }

  // Education list
  let eduList = EDU;
  if ((!eduList || eduList.length === 0) && (P.program || P.course)) {
    eduList = [{
      school: 'Carlos Hilado Memorial State University',
      degree: P.program || P.course || 'Bachelor of Science in Information Technology',
      period: P.year_level ? `${P.year_level} · Expected 2026` : 'Undergraduate',
      gpa: P.gpa || '',
      description: '',
    }];
  }

  // Top 2-3 featured projects to preserve 1-page fit
  const featured = PRJ.filter(p => p.is_featured);
  const resumeProjects = (featured.length >= 2 ? featured : PRJ).slice(0, 3);

  // Grouped skills
  const skillGroups = groupSkillsForResume(SKL);

  tabContent.innerHTML = `
    <div class="animate-fade-in-up">
      
      <!-- Top Action Toolbar (Outside Resume Document) -->
      <div class="resume-toolbar">
        <div class="resume-toolbar__info">
          <span class="resume-toolbar__tag">${icon('fileText', 12)} 1-Page Standard</span>
          <span class="resume-toolbar__desc">Executive single-page ATS-ready format</span>
        </div>
        <div class="resume-toolbar__actions">
          <button class="btn btn--sm resume-action-btn" id="edit-objective-btn">${icon('edit', 14)} Edit Summary</button>
          <button class="btn btn--sm resume-action-btn" id="view-resume-btn">${icon('eye', 14)} Fullscreen / Print</button>
          <button class="btn btn--sm resume-download-btn" id="download-resume-btn">${icon('download', 14)} Download PDF</button>
        </div>
      </div>

      <!-- Printable 1-Page Document Paper Canvas -->
      <div class="resume-paper-wrap">
        <div class="resume-card resume-card--onepage" id="resume-card">

          <!-- Executive Header -->
          <div class="resume-doc-header">
            <h1 class="resume-doc-name">${P.name || 'Candidate Name'}</h1>
            <p class="resume-doc-headline">${P.headline || P.program || 'Software Engineer'}</p>
            <div class="resume-contact-bar">
              ${contacts.join('<span class="resume-sep">•</span>')}
            </div>
          </div>

          <!-- Professional Summary / Objective -->
          <div class="resume-section">
            <div class="resume-section__title">${typeLabel}</div>
            <p class="resume-section__text" id="resume-objective-text">${objText}</p>
          </div>

          <!-- Education -->
          ${eduList && eduList.length > 0 ? `
          <div class="resume-section">
            <div class="resume-section__title">Education</div>
            ${eduList.map(e => `
              <div class="resume-entry">
                <div class="resume-entry__header">
                  <div class="resume-entry__title-group">
                    <strong class="resume-entry__title">${e.degree || 'Bachelor of Science'}</strong>
                    <span class="resume-entry__sub">— ${e.school}</span>
                    ${e.gpa ? `<span class="resume-entry__gpa">· GPA: ${e.gpa}</span>` : ''}
                  </div>
                  <span class="resume-entry__date">${e.period || ''}</span>
                </div>
                ${e.description ? `<p class="resume-entry__desc">${e.description}</p>` : ''}
              </div>`).join('')}
          </div>` : ''}

          <!-- Experience / OJT -->
          ${EXP.length > 0 ? `
          <div class="resume-section">
            <div class="resume-section__title">Experience & Internships</div>
            ${EXP.slice(0, 3).map(e => {
              const eSkills = safeArray(e.skills);
              return `
              <div class="resume-entry">
                <div class="resume-entry__header">
                  <div class="resume-entry__title-group">
                    <strong class="resume-entry__title">${e.role}</strong>
                    <span class="resume-entry__sub">— ${e.company}${e.type ? ` (${e.type})` : ''}</span>
                  </div>
                  <span class="resume-entry__date">${e.period || (e.period_start ? (e.period_start + (e.period_end ? ' – ' + e.period_end : ' – Present')) : '')}</span>
                </div>
                ${e.description ? `<p class="resume-entry__desc">${e.description}</p>` : ''}
                ${eSkills.length ? `<p class="resume-entry__meta"><strong>Key Tools:</strong> ${eSkills.join(', ')}</p>` : ''}
              </div>`;
            }).join('')}
          </div>` : ''}

          <!-- Projects (Curated top 2-3) -->
          ${resumeProjects.length > 0 ? `
          <div class="resume-section">
            <div class="resume-section__title">Technical Projects</div>
            ${resumeProjects.map(p => {
              const tech = safeArray(p.tech_stack);
              return `
              <div class="resume-entry">
                <div class="resume-entry__header">
                  <div class="resume-entry__title-group">
                    <strong class="resume-entry__title">${p.title}</strong>
                    ${p.role ? `<span class="resume-entry__sub">— ${p.role}</span>` : ''}
                    <span class="resume-entry__links">
                      ${p.project_url ? `<a href="${p.project_url}" target="_blank" rel="noopener">[Demo]</a>` : ''}
                      ${p.repo_url ? `<a href="${p.repo_url}" target="_blank" rel="noopener">[Code]</a>` : ''}
                    </span>
                  </div>
                  <span class="resume-entry__date">${p.date_completed || ''}</span>
                </div>
                ${p.description ? `<p class="resume-entry__desc">${p.description}</p>` : ''}
                ${p.outcomes ? `<p class="resume-entry__outcome"><strong>Outcome:</strong> ${p.outcomes}</p>` : ''}
                ${tech.length ? `<p class="resume-entry__meta"><strong>Technologies:</strong> ${tech.join(', ')}</p>` : ''}
              </div>`;
            }).join('')}
          </div>` : ''}

          <!-- Technical Skills (Categorized Inline) -->
          ${skillGroups.length > 0 ? `
          <div class="resume-section">
            <div class="resume-section__title">Technical Skills</div>
            <div class="resume-skills-grid">
              ${skillGroups.map(g => `
                <div class="resume-skill-row">
                  <span class="resume-skill-label">${g.label}:</span>
                  <span class="resume-skill-text">${g.items}</span>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Honors & Certifications -->
          ${ACH.length > 0 ? `
          <div class="resume-section">
            <div class="resume-section__title">Honors & Certifications</div>
            ${ACH.slice(0, 4).map(a => `
              <div class="resume-entry resume-entry--cert">
                <div class="resume-entry__header">
                  <div class="resume-entry__title-group">
                    <strong class="resume-entry__title">${a.title}</strong>
                    ${a.issuer ? `<span class="resume-entry__sub">— ${a.issuer}</span>` : ''}
                    ${a.award_level ? `<span class="resume-entry__badge">${a.award_level}</span>` : ''}
                    ${a.credential_id ? `<span class="resume-entry__cred">ID: ${a.credential_id}</span>` : ''}
                    ${a.credential_url ? `<a href="${a.credential_url}" target="_blank" rel="noopener" class="resume-entry__verify">[Verify]</a>` : ''}
                  </div>
                  <span class="resume-entry__date">${a.date || ''}</span>
                </div>
              </div>`).join('')}
          </div>` : ''}

        </div>
      </div>
    </div>`;

  // View resume preview in new tab with clean single-page layout & print bar
  tabContent.querySelector('#view-resume-btn').onclick = () => {
    const card = tabContent.querySelector('#resume-card');
    if (!card) return;

    const styles = Array.from(document.styleSheets)
      .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume — ${P.name || 'HireMe'}</title>
  <style>
    ${styles}
    @page { size: A4 portrait; margin: 8mm 10mm; }
    html, body { background: #525659; margin: 0; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .print-bar { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; padding: 10px 18px; background: #1e293b; color: #fff; border-radius: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
    .print-btn { background: #005930; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
    .print-btn:hover { background: #00733e; }
    .resume-card { box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important; border: none !important; width: 800px; min-height: 1120px; margin: 0 auto; background: #fff !important; }
    @media print {
      html, body { background: #fff !important; padding: 0 !important; }
      .print-bar { display: none !important; }
      .resume-card { box-shadow: none !important; border: none !important; width: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>1-Page Executive Resume</strong> — A4 Print Preview</span>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  ${card.outerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) win.focus();
  };

  // Edit objective/summary
  tabContent.querySelector('#edit-objective-btn').onclick = () => openModal({
    title: `${icon('fileText', 18)} Edit Professional Summary / Objective`,
    body: `
      <p class="modal-error" style="color:var(--color-danger);font-size:.85rem;min-height:1.2em;"></p>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-input form-select" name="resume_type">
          <option value="objective" ${P.resume_type!=='summary'?'selected':''}>Career Objective (entry-level / OJT candidate)</option>
          <option value="summary"   ${P.resume_type==='summary'?'selected':''}>Professional Summary (experienced / highlights)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">2–3 sentences tailored to your target job</label>
        <textarea class="form-input form-textarea" name="resume_objective" rows="5" placeholder="Detail-oriented BSIT student seeking software development opportunities…">${P.resume_objective || ''}</textarea>
      </div>`,
    onSave: async (form) => {
      const data = {
        resume_type: formVal(form, 'resume_type'),
        resume_objective: formVal(form, 'resume_objective'),
      };
      await apiPut('/student/resume', data);
      Object.assign(P, data);
      renderResume();
    },
  });

  // PDF download
  tabContent.querySelector('#download-resume-btn').onclick = async () => {
    const btn  = tabContent.querySelector('#download-resume-btn');
    const card = tabContent.querySelector('#resume-card');
    if (!card) return;

    btn.disabled = true;
    btn.innerHTML = `${icon('loader', 14)} Generating PDF…`;

    try {
      const html2pdfMod = await import('html2pdf.js');
      const html2pdf    = html2pdfMod.default;

      const safeName = (P.name || 'Resume').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '_');

      card.classList.add('resume-card--exporting');

      await html2pdf()
        .set({
          margin:      [8, 10, 8, 10],
          filename:    `Resume_${safeName}.pdf`,
          image:       { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', letterRendering: true },
          jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(card)
        .save();

      card.classList.remove('resume-card--exporting');
    } catch (err) {
      console.error('PDF generation failed:', err);
      card?.classList.remove('resume-card--exporting');
    }

    btn.disabled = false;
    btn.innerHTML = `${icon('download', 14)} Download PDF`;
  };
}

/* ══════════════════════════════════════════════════
   PROJECTS TAB
   ══════════════════════════════════════════════════ */
function renderProjects() {
  tabContent.innerHTML = `
    <div class="animate-fade-in-up">
      <div class="profile-section">
        <div class="profile-section__header">
          <div>
            <h3 class="profile-section__title" style="display:flex;align-items:center;gap:8px;">
              ${icon('folder', 20)} My Projects
            </h3>
            <p class="text-tertiary text-xs" style="margin:2px 0 0;">Showcase your academic capstones, internships, client work, and personal open source applications.</p>
          </div>
          <button class="btn btn--primary btn--sm" id="add-project-btn" style="gap:5px;">
            ${icon('plus', 14)} Add Project
          </button>
        </div>

        ${PRJ.length === 0 ? emptyState('No projects added yet. Click "Add Project" to showcase your work with verifiable evidence.') : `
        <div class="works-gallery">
          ${PRJ.map((p, i) => {
            const cat = p.category || 'Project';
            const role = p.role || 'Contributor';
            const date = p.date_completed || '';
            const grad = projectGradients[i % projectGradients.length];

            return `
            <div class="work-card hover-lift" data-id="${p.id}">
              <div class="work-card__preview" style="background:${p.image_url ? 'var(--bg-secondary)' : grad};">
                ${p.image_url
                  ? `<img class="work-card__thumb" src="${storageUrl(p.image_url)}" alt="${p.title}" loading="lazy" />`
                  : `<div class="work-card__banner-placeholder">
                      <span style="font-size:2.2rem;opacity:0.9;">📁</span>
                      <span style="font-size:0.8rem;font-weight:700;letter-spacing:0.04em;">${cat}</span>
                    </div>`}
                <span class="work-card__cat-pill">${cat}</span>
                ${p.is_featured ? `<span class="work-card__featured-badge">${icon('star', 11)} Featured</span>` : ''}
              </div>

              <div class="work-card__body">
                <div class="work-card__header-row">
                  <h4 class="work-card__title">${p.title}</h4>
                  <div style="display:flex;gap:4px;flex-shrink:0;">
                    <button class="btn btn--icon btn--xs edit-proj-btn" data-id="${p.id}" title="Edit Project">${icon('edit', 13)}</button>
                    <button class="btn btn--icon btn--xs btn--danger-ghost del-proj-btn" data-id="${p.id}" title="Delete Project">${icon('trash', 13)}</button>
                  </div>
                </div>

                <div class="work-card__meta">
                  <span class="work-card__role-pill">${role}</span>
                  ${date ? `<span style="display:inline-flex;align-items:center;gap:3px;color:var(--text-tertiary);">${icon('calendar', 11)} ${date}</span>` : ''}
                </div>

                <p class="work-card__desc">${p.description || '<em class="text-tertiary">No description provided.</em>'}</p>

                ${p.outcomes ? `
                  <div class="work-card__outcomes">
                    ${icon('trendingUp', 14)}
                    <div><strong style="color:var(--text-primary);font-weight:600;">Impact & Outcomes:</strong> ${p.outcomes}</div>
                  </div>` : ''}

                <div class="work-card__tags">
                  ${(p.tech_stack || []).map(t => `<span class="skill-tag skill-tag--sm">${t}</span>`).join('')}
                </div>

                <div class="work-card__footer">
                  <div class="work-card__links">
                    ${p.project_url ? `
                      <a class="btn btn--xs btn--primary" href="${p.project_url}" target="_blank" rel="noopener" style="gap:5px;">
                        ${icon('externalLink', 12)} Live Demo
                      </a>` : ''}
                    ${p.repo_url ? `
                      <a class="btn btn--xs btn--outline" href="${p.repo_url}" target="_blank" rel="noopener" style="gap:5px;">
                        ${icon('github', 12)} Repository
                      </a>` : ''}
                    ${!p.project_url && !p.repo_url ? `<span class="text-tertiary text-xs" style="font-style:italic;">Verified Coursework</span>` : ''}
                  </div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>`;

  tabContent.querySelector('#add-project-btn').onclick = () => openProjectModal(null);
  tabContent.querySelectorAll('.edit-proj-btn').forEach(b => b.onclick = () => openProjectModal(PRJ.find(p => p.id == b.dataset.id)));
  tabContent.querySelectorAll('.del-proj-btn').forEach(b => b.onclick = () => confirmDelete('Delete this project?', async () => {
    await apiDelete(`/student/projects/${b.dataset.id}`);
    PRJ = PRJ.filter(p => p.id != b.dataset.id);
    renderProjects();
  }));
}

/* ── Add / Edit Project Modal ── */
function openProjectModal(proj) {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();

  let pendingFile = null;
  let currentImageUrl = proj?.image_url || '';

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" style="max-width:580px;" role="dialog" aria-modal="true">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#005930,#10B981);">
            ${icon('folder', 20)}
          </div>
          <div>
            <h3 class="pfm-title">${proj ? 'Edit Project' : 'Add New Project'}</h3>
            <p class="pfm-subtitle">Showcase verifiable evidence and measurable impact</p>
          </div>
        </div>
        <button class="pfm-close-btn" id="proj-modal-close" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="project-form" class="pfm-form-body" novalidate>
        <!-- Section 1: Identity & Classification -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('sparkles', 12)} Project Identity</span>
          <div class="pfm-fields">
            <div>
              <label class="pfm-label">Project Title <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="title" required placeholder="e.g. HireMe Placement Intelligence System" value="${proj?.title || ''}">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label class="pfm-label">Category</label>
                <select class="form-input pfm-input form-select" name="category">
                  ${PROJECT_CATEGORIES.map(c => `<option value="${c.id}" ${proj?.category === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="pfm-label">Your Contributor Role</label>
                <input class="form-input pfm-input" name="role" list="proj-roles-list" placeholder="e.g. Full-Stack Developer" value="${proj?.role || 'Full-Stack Developer'}">
                <datalist id="proj-roles-list">
                  ${PROJECT_ROLES.map(r => `<option value="${r}"></option>`).join('')}
                </datalist>
              </div>
            </div>
            <div>
              <label class="pfm-label">Completion Date / Timeline</label>
              <input class="form-input pfm-input" name="date_completed" placeholder="e.g. October 2025 or Ongoing" value="${proj?.date_completed || ''}">
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Section 2: Visual Evidence / Screenshot -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('camera', 12)} Visual Evidence & Screenshot</span>
          <div class="pfm-fields">
            <div id="proj-dropzone" class="pfm-dropzone ${currentImageUrl ? 'pfm-dropzone--has-file' : ''}">
              <input type="file" id="proj-file-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
              ${currentImageUrl ? `
                <div class="pfm-preview-box">
                  <img class="pfm-preview-img" src="${storageUrl(currentImageUrl)}" id="proj-preview-img" alt="Preview">
                  <button type="button" class="pfm-preview-remove" id="proj-remove-img" title="Remove screenshot">${icon('trash', 14)}</button>
                </div>
                <button type="button" class="btn btn--outline btn--xs" id="proj-change-btn" style="margin-top:8px;">Change Screenshot</button>
              ` : `
                <div id="proj-empty-uploader">
                  <div style="color:var(--color-primary);margin-bottom:4px;">${icon('camera', 26)}</div>
                  <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">Upload Project Screenshot / Thumbnail</div>
                  <div class="pfm-hint" style="font-size:0.72rem;">Drag & drop or click to browse (PNG, JPG, WebP up to 4MB)</div>
                </div>
                <div id="proj-loaded-preview" style="display:none;width:100%;">
                  <div class="pfm-preview-box">
                    <img class="pfm-preview-img" id="proj-local-img" alt="Local Preview">
                    <button type="button" class="pfm-preview-remove" id="proj-remove-local" title="Remove screenshot">${icon('trash', 14)}</button>
                  </div>
                </div>
              `}
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Section 3: Technical Details & Impact -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('code', 12)} Technical Scope & Measurable Impact</span>
          <div class="pfm-fields">
            <div>
              <label class="pfm-label">Project Description</label>
              <textarea class="form-input pfm-input form-textarea" name="description" rows="3" placeholder="Explain what problem this project solves, its core architecture, and key features…">${proj?.description || ''}</textarea>
            </div>
            <div>
              <label class="pfm-label">Quantifiable Impact & Outcomes <span class="pfm-hint">(Crucial for recruiters)</span></label>
              <textarea class="form-input pfm-input form-textarea" name="outcomes" rows="2" placeholder="e.g. Deployed to production; processed 1,200 records; automated grading for 4 class sections…">${proj?.outcomes || ''}</textarea>
            </div>
            <div>
              <label class="pfm-label">Tech Stack (comma-separated)</label>
              <input class="form-input pfm-input" id="proj-stack-input" name="tech_stack_raw" placeholder="React, Laravel, MySQL, Tailwind CSS" value="${(proj?.tech_stack || []).join(', ')}">
              <div style="margin-top:6px;font-size:0.7rem;color:var(--text-tertiary);">Quick add:</div>
              <div class="pfm-tag-chips">
                ${QUICK_STACK.map(tech => `<button type="button" class="pfm-tag-pill quick-tag" data-tech="${tech}">+ ${tech}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Section 4: Verification Links -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('shieldCheck', 12)} Verification & Live Links</span>
          <div class="pfm-fields">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label class="pfm-label">Live Demo URL</label>
                <div class="pfm-input-wrap">
                  <span class="pfm-input-prefix">${icon('externalLink', 14)}</span>
                  <input class="form-input pfm-input pfm-input--prefixed" name="project_url" placeholder="https://..." value="${proj?.project_url || ''}">
                </div>
              </div>
              <div>
                <label class="pfm-label">GitHub / Repository URL</label>
                <div class="pfm-input-wrap">
                  <span class="pfm-input-prefix">${icon('github', 14)}</span>
                  <input class="form-input pfm-input pfm-input--prefixed" name="repo_url" placeholder="https://github.com/..." value="${proj?.repo_url || ''}">
                </div>
              </div>
            </div>
            <div class="form-checkbox-group" style="margin-top:4px;">
              <label class="form-checkbox-label" style="font-size:0.8rem;cursor:pointer;">
                <input type="checkbox" name="is_featured" value="1" ${proj?.is_featured ? 'checked' : ''}> Feature this project prominently on my generated resume
              </label>
            </div>
          </div>
        </div>

        <div class="pfm-footer">
          <p class="pfm-error" id="proj-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost" id="proj-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn" id="proj-save-btn">
              ${SAVE_ICON} ${proj ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#proj-modal-close').onclick = close;
  overlay.querySelector('#proj-cancel').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // ── Quick tag suggestions ──
  const stackInput = overlay.querySelector('#proj-stack-input');
  overlay.querySelectorAll('.quick-tag').forEach(btn => {
    btn.onclick = () => {
      const tech = btn.dataset.tech;
      const current = stackInput.value.split(',').map(s => s.trim()).filter(Boolean);
      if (!current.includes(tech)) {
        current.push(tech);
        stackInput.value = current.join(', ');
      }
    };
  });

  // ── File upload interactions ──
  const fileInput = overlay.querySelector('#proj-file-input');
  const dropzone  = overlay.querySelector('#proj-dropzone');

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#proj-remove-img') || e.target.closest('#proj-remove-local')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const emptyBox = overlay.querySelector('#proj-empty-uploader');
      const loadedBox = overlay.querySelector('#proj-loaded-preview');
      const localImg  = overlay.querySelector('#proj-local-img');
      const previewImg = overlay.querySelector('#proj-preview-img');

      if (previewImg) {
        previewImg.src = ev.target.result;
      } else if (emptyBox && loadedBox && localImg) {
        emptyBox.style.display = 'none';
        loadedBox.style.display = 'block';
        localImg.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  });

  const removeExisting = overlay.querySelector('#proj-remove-img');
  if (removeExisting) {
    removeExisting.onclick = (e) => {
      e.stopPropagation();
      currentImageUrl = '';
      pendingFile = null;
      dropzone.innerHTML = `
        <input type="file" id="proj-file-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        <div id="proj-empty-uploader">
          <div style="color:var(--color-primary);margin-bottom:4px;">${icon('camera', 26)}</div>
          <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">Upload Project Screenshot / Thumbnail</div>
          <div class="pfm-hint" style="font-size:0.72rem;">Drag & drop or click to browse (PNG, JPG, WebP up to 4MB)</div>
        </div>
        <div id="proj-loaded-preview" style="display:none;width:100%;">
          <div class="pfm-preview-box">
            <img class="pfm-preview-img" id="proj-local-img" alt="Local Preview">
            <button type="button" class="pfm-preview-remove" id="proj-remove-local" title="Remove screenshot">${icon('trash', 14)}</button>
          </div>
        </div>`;
      dropzone.querySelector('#proj-file-input').addEventListener('change', (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        pendingFile = file;
        const reader = new FileReader();
        reader.onload = (re) => {
          dropzone.querySelector('#proj-empty-uploader').style.display = 'none';
          dropzone.querySelector('#proj-loaded-preview').style.display = 'block';
          dropzone.querySelector('#proj-local-img').src = re.target.result;
        };
        reader.readAsDataURL(file);
      });
    };
  }

  const removeLocal = overlay.querySelector('#proj-remove-local');
  if (removeLocal) {
    removeLocal.onclick = (e) => {
      e.stopPropagation();
      pendingFile = null;
      overlay.querySelector('#proj-empty-uploader').style.display = 'block';
      overlay.querySelector('#proj-loaded-preview').style.display = 'none';
    };
  }

  // ── Form submission ──
  overlay.querySelector('#project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form    = e.target;
    const saveBtn = overlay.querySelector('#proj-save-btn');
    const errEl   = overlay.querySelector('#proj-error');
    errEl.textContent = '';

    const title = formVal(new FormData(form), 'title');
    if (!title) {
      errEl.textContent = 'Project title is required.';
      return;
    }

    saveBtn.disabled  = true;
    saveBtn.innerHTML = `${SPIN_ICON} Saving Project…`;

    try {
      // 1. Upload screenshot if a new file was chosen
      let finalImageUrl = currentImageUrl;
      if (pendingFile) {
        saveBtn.innerHTML = `${SPIN_ICON} Uploading Screenshot…`;
        const uploadForm = new FormData();
        uploadForm.append('image', pendingFile);
        const upRes = await apiUpload('/student/projects/upload-image', uploadForm);
        if (upRes?.image_url) {
          finalImageUrl = upRes.image_url;
        }
      }

      // 2. Prepare payload
      const payload = {
        title,
        category:       formVal(new FormData(form), 'category'),
        role:           formVal(new FormData(form), 'role'),
        date_completed: formVal(new FormData(form), 'date_completed'),
        description:    formVal(new FormData(form), 'description'),
        outcomes:       formVal(new FormData(form), 'outcomes'),
        tech_stack:     formVal(new FormData(form), 'tech_stack_raw').split(',').map(s => s.trim()).filter(Boolean),
        repo_url:       formVal(new FormData(form), 'repo_url'),
        project_url:    formVal(new FormData(form), 'project_url'),
        image_url:      finalImageUrl,
        is_featured:    form.is_featured.checked,
      };

      if (proj) {
        await apiPut(`/student/projects/${proj.id}`, payload);
        const idx = PRJ.findIndex(p => p.id === proj.id);
        PRJ[idx] = { ...PRJ[idx], ...payload };
      } else {
        const res = await apiPost('/student/projects', payload);
        PRJ.unshift({ ...payload, id: res.id });
      }

      close();
      renderProjects();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} ${proj ? 'Save Changes' : 'Add Project'}`;
      errEl.textContent = err.message || 'Failed to save project. Please check your inputs.';
    }
  });
}

/* ══════════════════════════════════════════════════
   ACHIEVEMENTS TAB
   ══════════════════════════════════════════════════ */
function renderAchievements() {
  tabContent.innerHTML = `
    <div class="animate-fade-in-up">
      <div class="profile-section">
        <div class="profile-section__header">
          <div>
            <h3 class="profile-section__title" style="display:flex;align-items:center;gap:8px;">
              ${icon('award', 20)} Achievements & Certifications
            </h3>
            <p class="text-tertiary text-xs" style="margin:2px 0 0;">Add verified credentials, certificates, honors, and competition distinctions to build employer trust.</p>
          </div>
          <button class="btn btn--primary btn--sm" id="add-ach-btn" style="gap:5px;">
            ${icon('plus', 14)} Add Achievement
          </button>
        </div>

        ${ACH.length === 0 ? emptyState('No achievements or certifications added yet. Click "Add Achievement" to add verifiable credentials.') : `
        <div class="achievements-grid">
          ${ACH.map(a => {
            const catType = a.type || 'certification';
            const hasProof = Boolean(a.credential_url || a.certificate_url);

            // Resilient icon resolution with type fallbacks
            const iconSvg = (a.icon && icon(a.icon, 22)) || (
              catType === 'certification' ? (icon('certificate', 22) || icon('shieldCheck', 22)) :
              catType === 'competition' ? (icon('trophy', 22) || icon('award', 22)) :
              catType === 'academic' ? icon('graduationCap', 22) :
              icon('award', 22)
            );

            return `
            <div class="achievement-card hover-lift" data-id="${a.id}">
              <div>
                <div class="achievement-card__top">
                  <div class="achievement-card__identity">
                    <div class="achievement-card__icon-wrap achievement-card__icon-wrap--${catType}">
                      ${iconSvg}
                    </div>
                    <div class="achievement-card__labels">
                      <span class="achievement-card__cat-badge achievement-card__cat-badge--${catType}">${catType}</span>
                      ${a.issuer ? `<span class="achievement-card__issuer-line" title="${a.issuer}">${icon('building', 12)} ${a.issuer}</span>` : ''}
                    </div>
                  </div>

                  <div class="achievement-card__actions">
                    <button class="achievement-card__action-btn edit-ach-btn" data-id="${a.id}" title="Edit Achievement">${icon('edit', 14)}</button>
                    <button class="achievement-card__action-btn achievement-card__action-btn--delete del-ach-btn" data-id="${a.id}" title="Delete Achievement">${icon('trash', 14)}</button>
                  </div>
                </div>

                <h4 class="achievement-card__title">${a.title}</h4>

                ${(a.award_level || a.credential_id) ? `
                  <div class="achievement-card__pill-row">
                    ${a.award_level ? `
                      <span class="achievement-card__distinction-badge">
                        ${icon('star', 11)} ${a.award_level}
                      </span>` : ''}
                    ${a.credential_id ? `
                      <span class="achievement-card__id-chip" title="Credential ID">
                        ${icon('shieldCheck', 11)} ${a.credential_id}
                      </span>` : ''}
                  </div>` : ''}

                <p class="achievement-card__desc">${a.description || '<em class="text-tertiary">No additional details provided.</em>'}</p>
              </div>

              <div>
                <div class="achievement-card__meta-row">
                  <span style="display:inline-flex;align-items:center;gap:4px;">
                    ${icon('calendar', 12)} ${a.date ? `Issued ${a.date}` : 'Issued'}
                  </span>
                  <span>•</span>
                  <span>${a.does_not_expire ? 'Permanent' : (a.expires_at ? `Expires ${a.expires_at}` : 'Permanent')}</span>
                </div>

                <div class="achievement-card__proof-bar">
                  <div>
                    ${hasProof ? `
                      <span class="achievement-card__proof-status achievement-card__proof-status--verified">
                        ${icon('checkCircle', 13)} Verified
                      </span>` : `
                      <span class="achievement-card__proof-status achievement-card__proof-status--unverified">
                        ${icon('shield', 12)} Self-Reported
                      </span>`}
                  </div>
                  <div class="achievement-card__proof-buttons">
                    ${a.credential_url ? `
                      <a class="btn btn--outline btn--xs" href="${a.credential_url}" target="_blank" rel="noopener" style="gap:4px;">
                        ${icon('externalLink', 11)} Verify
                      </a>` : ''}
                    ${a.certificate_url ? `
                      <button class="btn btn--primary btn--xs view-cert-btn" data-id="${a.id}" style="gap:4px;">
                        ${icon('fileText', 11)} View Proof
                      </button>` : ''}
                    ${!hasProof ? `
                      <button class="btn btn--ghost btn--xs edit-ach-btn" data-id="${a.id}" style="gap:3px;font-size:0.7rem;color:var(--color-primary);" title="Upload Certificate Proof">
                        + Attach Proof
                      </button>` : ''}
                  </div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>`;

  tabContent.querySelector('#add-ach-btn').onclick = () => openAchModal(null);
  tabContent.querySelectorAll('.edit-ach-btn').forEach(b => b.onclick = () => openAchModal(ACH.find(a => a.id == b.dataset.id)));
  tabContent.querySelectorAll('.view-cert-btn').forEach(b => b.onclick = () => {
    const item = ACH.find(a => a.id == b.dataset.id);
    if (item) openCertificateViewer(item);
  });
  tabContent.querySelectorAll('.del-ach-btn').forEach(b => b.onclick = () => confirmDelete('Delete this achievement?', async () => {
    await apiDelete(`/student/achievements/${b.dataset.id}`);
    ACH = ACH.filter(a => a.id != b.dataset.id);
    renderAchievements();
  }));
}

/* ── Add / Edit Achievement Modal ── */
function openAchModal(ach) {
  const existing = document.getElementById('portfolio-modal-overlay');
  if (existing) existing.remove();

  let pendingCertFile = null;
  let currentCertUrl = ach?.certificate_url || '';
  const doesNotExpireInit = ach ? Boolean(ach.does_not_expire) : true;

  const overlay = document.createElement('div');
  overlay.id = 'portfolio-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box pfm-box" style="max-width:580px;" role="dialog" aria-modal="true">
      <div class="pfm-header">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#F59E0B,#FCD34D);">
            ${icon('award', 20)}
          </div>
          <div>
            <h3 class="pfm-title">${ach ? 'Edit Achievement & Certification' : 'Add Achievement / Certification'}</h3>
            <p class="pfm-subtitle">Attach official credentials and verifiable documentation</p>
          </div>
        </div>
        <button class="pfm-close-btn" id="ach-modal-close" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <form id="achievement-form" class="pfm-form-body" novalidate>
        <!-- Section 1: Credential Information -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('award', 12)} Credential Information</span>
          <div class="pfm-fields">
            <div>
              <label class="pfm-label">Title / Certificate Name <span class="pfm-req">*</span></label>
              <input class="form-input pfm-input" name="title" required placeholder="e.g. AWS Certified Cloud Practitioner or Dean's Lister" value="${ach?.title || ''}">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label class="pfm-label">Issuing Organization <span class="pfm-req">*</span></label>
                <input class="form-input pfm-input" name="issuer" required placeholder="e.g. Amazon Web Services, CHMSU, DICT" value="${ach?.issuer || ''}">
              </div>
              <div>
                <label class="pfm-label">Category</label>
                <select class="form-input pfm-input form-select" name="type">
                  ${ACH_CATEGORIES.map(c => `<option value="${c.id}" ${ach?.type === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div>
              <label class="pfm-label">Award Level / Scope</label>
              <select class="form-input pfm-input form-select" name="award_level">
                <option value="">Select distinction level…</option>
                ${AWARD_LEVELS.map(lvl => `<option value="${lvl}" ${ach?.award_level === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Section 2: Credibility & Proof -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('shieldCheck', 12)} Verifiable Proof & Documentation</span>
          <div class="pfm-fields">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label class="pfm-label">Credential ID / License No.</label>
                <input class="form-input pfm-input" name="credential_id" placeholder="e.g. AWS-CCP-938210" value="${ach?.credential_id || ''}">
              </div>
              <div>
                <label class="pfm-label">Verification URL</label>
                <div class="pfm-input-wrap">
                  <span class="pfm-input-prefix">${icon('externalLink', 14)}</span>
                  <input class="form-input pfm-input pfm-input--prefixed" name="credential_url" placeholder="https://credly.com/..." value="${ach?.credential_url || ''}">
                </div>
              </div>
            </div>

            <div>
              <label class="pfm-label">Upload Certificate Document / Proof <span class="pfm-hint">(Image or PDF)</span></label>
              <div id="cert-dropzone" class="pfm-dropzone ${currentCertUrl ? 'pfm-dropzone--has-file' : ''}">
                <input type="file" id="cert-file-input" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
                ${currentCertUrl ? `
                  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:6px 10px;background:var(--bg-secondary);border-radius:8px;border:1px solid var(--border-default);">
                    <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;">
                      ${icon('fileText', 16)} <span>Certificate Document Attached</span>
                    </div>
                    <button type="button" class="btn btn--danger-ghost btn--xs" id="cert-remove-btn">${icon('trash', 13)} Remove</button>
                  </div>
                  <button type="button" class="btn btn--outline btn--xs" id="cert-change-btn" style="margin-top:8px;">Replace Document</button>
                ` : `
                  <div id="cert-empty-box">
                    <div style="color:var(--color-warning);margin-bottom:4px;">${icon('award', 26)}</div>
                    <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">Click or drag certificate image / PDF here</div>
                    <div class="pfm-hint" style="font-size:0.72rem;">PNG, JPG, WebP, or PDF (up to 5MB)</div>
                  </div>
                  <div id="cert-loaded-preview" style="display:none;width:100%;">
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-secondary);border-radius:8px;">
                      <span id="cert-local-filename" style="font-size:0.78rem;font-weight:600;color:var(--text-primary);"></span>
                      <button type="button" class="btn btn--danger-ghost btn--xs" id="cert-remove-local">${icon('trash', 13)}</button>
                    </div>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="pfm-divider"></div>

        <!-- Section 3: Validity & Description -->
        <div class="pfm-section">
          <span class="pfm-section-label">${icon('calendar', 12)} Validity & Details</span>
          <div class="pfm-fields">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label class="pfm-label">Issue Date</label>
                <input class="form-input pfm-input" name="date" placeholder="e.g. Nov 2025" value="${ach?.date || ''}">
              </div>
              <div id="cert-expiry-wrap" style="${doesNotExpireInit ? 'opacity:0.5;pointer-events:none;' : ''}">
                <label class="pfm-label">Expiration Date</label>
                <input class="form-input pfm-input" name="expires_at" id="cert-expiry-input" placeholder="e.g. Nov 2028" value="${ach?.expires_at || ''}" ${doesNotExpireInit ? 'disabled' : ''}>
              </div>
            </div>
            <div class="form-checkbox-group" style="margin-top:2px;">
              <label class="form-checkbox-label" style="font-size:0.8rem;cursor:pointer;">
                <input type="checkbox" id="cert-no-expire" name="does_not_expire" value="1" ${doesNotExpireInit ? 'checked' : ''}> This credential does not expire
              </label>
            </div>
            <div>
              <label class="pfm-label">Description / Criteria Covered</label>
              <textarea class="form-input pfm-input form-textarea" name="description" rows="2" placeholder="Briefly describe what this honor represents or what skills were evaluated…">${ach?.description || ''}</textarea>
            </div>
          </div>
        </div>

        <div class="pfm-footer">
          <p class="pfm-error" id="ach-error"></p>
          <div class="pfm-footer-actions">
            <button type="button" class="btn btn--ghost" id="ach-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary pfm-save-btn" id="ach-save-btn">
              ${SAVE_ICON} ${ach ? 'Save Changes' : 'Add Achievement'}
            </button>
          </div>
        </div>
      </form>
    </div>
    <style>${pfmStyles()}</style>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#ach-modal-close').onclick = close;
  overlay.querySelector('#ach-cancel').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // ── Expiration toggle ──
  const noExpireCb  = overlay.querySelector('#cert-no-expire');
  const expiryWrap  = overlay.querySelector('#cert-expiry-wrap');
  const expiryInput = overlay.querySelector('#cert-expiry-input');
  noExpireCb.addEventListener('change', () => {
    if (noExpireCb.checked) {
      expiryWrap.style.opacity = '0.5';
      expiryWrap.style.pointerEvents = 'none';
      expiryInput.disabled = true;
      expiryInput.value = '';
    } else {
      expiryWrap.style.opacity = '1';
      expiryWrap.style.pointerEvents = 'auto';
      expiryInput.disabled = false;
    }
  });

  // ── File upload interactions ──
  const certFileInput = overlay.querySelector('#cert-file-input');
  const certDropzone  = overlay.querySelector('#cert-dropzone');

  certDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#cert-remove-btn') || e.target.closest('#cert-remove-local')) return;
    certFileInput.click();
  });

  certFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingCertFile = file;

    const emptyBox   = overlay.querySelector('#cert-empty-box');
    const loadedBox  = overlay.querySelector('#cert-loaded-preview');
    const filenameEl = overlay.querySelector('#cert-local-filename');
    if (emptyBox && loadedBox && filenameEl) {
      emptyBox.style.display = 'none';
      loadedBox.style.display = 'block';
      filenameEl.textContent = `📎 ${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
  });

  const removeExistingCert = overlay.querySelector('#cert-remove-btn');
  if (removeExistingCert) {
    removeExistingCert.onclick = (e) => {
      e.stopPropagation();
      currentCertUrl = '';
      pendingCertFile = null;
      certDropzone.innerHTML = `
        <input type="file" id="cert-file-input" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
        <div id="cert-empty-box">
          <div style="color:var(--color-warning);margin-bottom:4px;">${icon('award', 26)}</div>
          <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">Click or drag certificate image / PDF here</div>
          <div class="pfm-hint" style="font-size:0.72rem;">PNG, JPG, WebP, or PDF (up to 5MB)</div>
        </div>
        <div id="cert-loaded-preview" style="display:none;width:100%;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-secondary);border-radius:8px;">
            <span id="cert-local-filename" style="font-size:0.78rem;font-weight:600;color:var(--text-primary);"></span>
            <button type="button" class="btn btn--danger-ghost btn--xs" id="cert-remove-local">${icon('trash', 13)}</button>
          </div>
        </div>`;
      certDropzone.querySelector('#cert-file-input').addEventListener('change', (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        pendingCertFile = file;
        certDropzone.querySelector('#cert-empty-box').style.display = 'none';
        certDropzone.querySelector('#cert-loaded-preview').style.display = 'block';
        certDropzone.querySelector('#cert-local-filename').textContent = `📎 ${file.name} (${Math.round(file.size / 1024)} KB)`;
      });
    };
  }

  // ── Form submission ──
  overlay.querySelector('#achievement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form    = e.target;
    const saveBtn = overlay.querySelector('#ach-save-btn');
    const errEl   = overlay.querySelector('#ach-error');
    errEl.textContent = '';

    const title  = formVal(new FormData(form), 'title');
    const issuer = formVal(new FormData(form), 'issuer');
    if (!title) {
      errEl.textContent = 'Achievement title is required.';
      return;
    }
    if (!issuer) {
      errEl.textContent = 'Issuing organization is required for credibility.';
      return;
    }

    saveBtn.disabled  = true;
    saveBtn.innerHTML = `${SPIN_ICON} Saving Achievement…`;

    try {
      // 1. Upload certificate proof if a new file was selected
      let finalCertUrl = currentCertUrl;
      if (pendingCertFile) {
        saveBtn.innerHTML = `${SPIN_ICON} Uploading Document…`;
        const certForm = new FormData();
        certForm.append('certificate', pendingCertFile);
        const upRes = await apiUpload('/student/achievements/upload-certificate', certForm);
        if (upRes?.certificate_url) {
          finalCertUrl = upRes.certificate_url;
        }
      }

      // 2. Prepare payload
      const payload = {
        title,
        issuer,
        type:            formVal(new FormData(form), 'type'),
        award_level:     formVal(new FormData(form), 'award_level'),
        credential_id:   formVal(new FormData(form), 'credential_id'),
        credential_url:  formVal(new FormData(form), 'credential_url'),
        certificate_url: finalCertUrl,
        date:            formVal(new FormData(form), 'date'),
        expires_at:      noExpireCb.checked ? null : formVal(new FormData(form), 'expires_at'),
        does_not_expire: noExpireCb.checked,
        description:     formVal(new FormData(form), 'description'),
        icon:            'award',
      };

      if (ach) {
        await apiPut(`/student/achievements/${ach.id}`, payload);
        const idx = ACH.findIndex(a => a.id === ach.id);
        ACH[idx] = { ...ACH[idx], ...payload };
      } else {
        const res = await apiPost('/student/achievements', payload);
        ACH.unshift({ ...payload, id: res.id });
      }

      close();
      renderAchievements();
    } catch (err) {
      saveBtn.disabled  = false;
      saveBtn.innerHTML = `${SAVE_ICON} ${ach ? 'Save Changes' : 'Add Achievement'}`;
      errEl.textContent = err.message || 'Failed to save achievement. Please try again.';
    }
  });
}

/* ── Certificate Document Viewer Lightbox ── */
function openCertificateViewer(ach) {
  const existing = document.getElementById('cert-viewer-overlay');
  if (existing) existing.remove();

  const isPdf = ach.certificate_url?.toLowerCase().endsWith('.pdf');
  const fullUrl = storageUrl(ach.certificate_url);

  const overlay = document.createElement('div');
  overlay.id = 'cert-viewer-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:720px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;" role="dialog" aria-modal="true">
      <div class="pfm-header" style="padding:14px 20px;">
        <div class="pfm-header-left">
          <div class="pfm-icon-box" style="background:linear-gradient(135deg,#005930,#10B981);width:36px;height:36px;">
            ${icon('shieldCheck', 18)}
          </div>
          <div>
            <h3 class="pfm-title" style="font-size:0.95rem;">${ach.title}</h3>
            <p class="pfm-subtitle">${ach.issuer || 'Official Credential'} ${ach.credential_id ? `· ID: ${ach.credential_id}` : ''}</p>
          </div>
        </div>
        <button class="pfm-close-btn" id="viewer-close-btn" aria-label="Close">${icon('x', 18)}</button>
      </div>

      <div style="flex:1;overflow:auto;padding:16px;background:#0d1117;display:flex;align-items:center;justify-content:center;min-height:360px;">
        ${isPdf ? `
          <div style="text-align:center;color:#fff;padding:32px;">
            <div style="font-size:3rem;margin-bottom:12px;">📄</div>
            <h4 style="color:#fff;margin:0 0 6px;">PDF Certificate Document</h4>
            <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:16px;">This certificate is stored in authentic PDF format.</p>
            <a href="${fullUrl}" target="_blank" rel="noopener" class="btn btn--primary" style="gap:6px;">
              ${icon('download', 14)} Open & Download PDF
            </a>
          </div>
        ` : `
          <img src="${fullUrl}" alt="${ach.title}" style="max-width:100%;max-height:68vh;object-fit:contain;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,0.4);" />
        `}
      </div>

      <div class="pfm-footer" style="padding:12px 20px;">
        <div style="font-size:0.75rem;color:var(--text-secondary);">
          ${ach.award_level ? `Distinction: <strong>${ach.award_level}</strong>` : 'Verified Portfolio Document'}
        </div>
        <div style="display:flex;gap:8px;">
          ${ach.credential_url ? `
            <a href="${ach.credential_url}" target="_blank" rel="noopener" class="btn btn--outline btn--sm" style="gap:4px;">
              ${icon('externalLink', 12)} Issuer Verification
            </a>` : ''}
          <a href="${fullUrl}" target="_blank" rel="noopener" download class="btn btn--secondary btn--sm" style="gap:4px;">
            ${icon('download', 12)} Download
          </a>
          <button type="button" class="btn btn--ghost btn--sm" id="viewer-close-footer">Close</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#viewer-close-btn').onclick = close;
  overlay.querySelector('#viewer-close-footer').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

/* ══════════════════════════════════════════════════
   MAIN RENDER
   ══════════════════════════════════════════════════ */
export async function renderPortfolio(container) {
  storeUser = getState('user') || {};

  container.innerHTML = `
    <div class="page-enter">
      <!-- Cover -->
      <div class="profile-cover" id="profile-cover">
        <div class="profile-cover__gradient"></div>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-header__top">
          <div class="profile-header__avatar-wrap">
            <div class="profile-header__avatar" id="profile-avatar">
              <span class="profile-header__initials">${storeUser?.initials || '?'}</span>
            </div>
            <label class="profile-header__avatar-edit" title="Change photo">
              ${icon('camera', 14)}
              <input type="file" accept="image/*" id="avatar-upload" hidden>
            </label>
          </div>
          <div class="profile-header__name-actions">
            <div>
              <h1 class="profile-header__name" id="profile-name">Loading…</h1>
              <p class="profile-header__headline" id="profile-headline">—</p>
            </div>
            <div class="profile-header__actions">
              <button class="btn btn--primary" id="edit-profile-btn">${icon('edit', 16)} Edit Profile</button>
              <button class="btn btn--secondary" id="download-resume-top-btn">${icon('download', 16)} Resume</button>
            </div>
          </div>
        </div>
        <div class="profile-header__bottom">
          <div class="profile-header__meta">
            <span class="profile-header__meta-item">${icon('mapPin', 14)} <span id="profile-location">—</span></span>
            <span class="profile-header__meta-item">${icon('briefcase', 14)} <span id="profile-program">—</span></span>
          </div>
          <div class="profile-header__links" id="profile-links"></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs" id="profile-tabs">
        <button class="profile-tabs__item profile-tabs__item--active" data-tab="about">About</button>
        <button class="profile-tabs__item" data-tab="resume">Resume</button>
        <button class="profile-tabs__item" data-tab="projects">Projects</button>
        <button class="profile-tabs__item" data-tab="achievements">Achievements</button>
      </div>

      <!-- Tab Content -->
      <div class="profile-tab-content" id="profile-tab-content">
        <div class="skeleton skeleton--card" style="height:300px;"></div>
      </div>
    </div>`;

  tabContent = container.querySelector('#profile-tab-content');

  // ── Load all portfolio data ──
  let data;
  try {
    data = await apiGet('/student/portfolio');
  } catch {
    tabContent.innerHTML = `<div class="empty-state">${icon('alertCircle',32)}<p class="text-secondary mt-2">Could not load portfolio. Make sure the API server is running.</p></div>`;
    return;
  }

  // Populate module state
  P         = data.profile      || {};
  EDU       = data.education    || [];
  EXP       = data.experience   || [];
  SKL       = data.skills       || [];
  PRJ       = data.projects     || [];
  ACH       = data.achievements || [];
  REQS      = data.requirements || [];
  activeOjt = data.activeOjt    || null;

  // ── Fill header ──
  const avatarEl = container.querySelector('#profile-avatar');
  if (P.avatar_url) {
    const absUrl = P.avatar_url.startsWith('http') ? P.avatar_url : `http://localhost:8000${P.avatar_url}`;
    avatarEl.innerHTML = `<img src="${absUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  } else {
    const initials = (P.name || storeUser?.name || '?').trim().split(/\s+/).map(n=>n[0]).join('').toUpperCase().slice(0,2);
    avatarEl.innerHTML = `<span class="profile-header__initials">${initials}</span>`;
  }

  container.querySelector('#profile-name').textContent = P.name || storeUser?.name || '—';

  // Headline + active OJT badge (suppressed for alumni)
  const isAlumniUser = P.is_alumni || P.status === 'alumni' || P.role === 'graduate' || storeUser?.is_alumni || storeUser?.status === 'alumni' || storeUser?.rawRole === 'graduate' || P.year_level === 'Graduated';
  const headlineEl = container.querySelector('#profile-headline');
  headlineEl.textContent = '';
  const headlineText = document.createTextNode(P.headline || P.program || '—');
  headlineEl.appendChild(headlineText);
  if (activeOjt && !isAlumniUser) {
    const badge = document.createElement('span');
    badge.title = `${activeOjt.position || 'OJT'}${activeOjt.department ? ' · ' + activeOjt.department : ''} at ${activeOjt.company}`;
    badge.style.cssText = [
      'display:inline-flex', 'align-items:center', 'gap:5px',
      'margin-left:10px', 'padding:3px 10px 3px 7px',
      'background:linear-gradient(135deg,#4A6CF7 0%,#6D8DFF 100%)',
      'color:#fff', 'font-size:0.72rem', 'font-weight:700',
      'border-radius:99px', 'letter-spacing:0.02em',
      'box-shadow:0 2px 8px rgba(74,108,247,0.35)',
      'vertical-align:middle', 'cursor:default',
    ].join(';');
    badge.innerHTML = `${icon('briefcase', 12)} Active OJT &nbsp;·&nbsp; ${activeOjt.company}`;
    headlineEl.appendChild(badge);
  } else if (isAlumniUser) {
    const badge = document.createElement('span');
    badge.title = 'Alumni / Graduate';
    badge.style.cssText = [
      'display:inline-flex', 'align-items:center', 'gap:5px',
      'margin-left:10px', 'padding:3px 10px 3px 7px',
      'background:linear-gradient(135deg,#10b981 0%,#059669 100%)',
      'color:#fff', 'font-size:0.72rem', 'font-weight:700',
      'border-radius:99px', 'letter-spacing:0.02em',
      'box-shadow:0 2px 8px rgba(16,185,129,0.35)',
      'vertical-align:middle', 'cursor:default',
    ].join(';');
    badge.innerHTML = `${icon('award', 12)} Alumni`;
    headlineEl.appendChild(badge);
  }

  container.querySelector('#profile-location').textContent = P.location || '—';
  container.querySelector('#profile-program').textContent  = [P.program, P.year_level].filter(Boolean).join(' · ') || '—';

  renderProfileLinks();

  // ── Avatar upload ──
  const avatarEditLabel = container.querySelector('.profile-header__avatar-edit');
  container.querySelector('#avatar-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview while uploading
    const reader = new FileReader();
    reader.onload = (ev) => {
      avatarEl.innerHTML = `<img src="${ev.target.result}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    };
    reader.readAsDataURL(file);

    // Show uploading state
    avatarEditLabel.style.opacity = '0.5';
    avatarEditLabel.style.pointerEvents = 'none';

    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await apiUpload('/student/avatar', form);

      if (res?.avatar_url) {
        P.avatar_url = res.avatar_url;
        // Use absolute URL so it works from any sub-path
        const absUrl = `http://localhost:8000${res.avatar_url}`;
        avatarEl.innerHTML = `<img src="${absUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        // Push the new photo to sidebar + navbar instantly
        syncAvatarEverywhere(res.avatar_url);
      } else {
        // Revert to initials on failure
        const initials = (P.name || '?').trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarEl.innerHTML = `<span class="profile-header__initials">${initials}</span>`;
        alert(res?.message || 'Upload failed. Please try a smaller image (max 2 MB).');
      }
    } catch {
      const initials = (P.name || '?').trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
      avatarEl.innerHTML = `<span class="profile-header__initials">${initials}</span>`;
      alert('Upload failed. Check your connection and try again.');
    } finally {
      avatarEditLabel.style.opacity = '';
      avatarEditLabel.style.pointerEvents = '';
      e.target.value = '';
    }
  });

  // ── Header buttons ──
  container.querySelector('#edit-profile-btn').onclick = () => openEditAboutModal();
  container.querySelector('#download-resume-top-btn').onclick = () => {
    switchTab('resume');
    container.querySelectorAll('.profile-tabs__item').forEach(b => b.classList.toggle('profile-tabs__item--active', b.dataset.tab === 'resume'));
    setTimeout(() => tabContent.querySelector('#download-resume-btn')?.click(), 300);
  };

  // ── Tab switching ──
  const tabRenderers = { about: renderAbout, resume: renderResume, projects: renderProjects, achievements: renderAchievements };
  const tabBar = container.querySelector('#profile-tabs');

  function switchTab(tab) {
    currentTab = tab;
    tabBar.querySelectorAll('.profile-tabs__item').forEach(b => b.classList.toggle('profile-tabs__item--active', b.dataset.tab === tab));
    if (tabRenderers[tab]) tabRenderers[tab]();
  }

  tabBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.profile-tabs__item');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  // Initial render
  renderAbout();
}
