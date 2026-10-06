/**
 * CHMSU HireMe — Alumni Page & PEO Tracer Hub
 */
import { icon } from '../components/icons.js';
import { apiFetch } from '../api/client.js';

export async function renderAlumni(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="page-section">
        <h1 class="animate-fade-in-up">Alumni Hub</h1>
        <p class="text-secondary mt-2 mb-8 animate-fade-in-up" style="animation-delay:80ms;">
          Your career resources, certificates, institutional outcomes (PEO), and alumni network
        </p>
      </section>

      <!-- PEO Self-Assessment & Tracer Card -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">${icon('award', 24)} Program Educational Objectives (PEO) Tracer</h2>
            <p class="section-subtitle">Help CHMSU measure undergraduate curriculum alignment and your professional achievements</p>
          </div>
          <div>
            <button class="btn btn--primary btn--sm" id="btn-open-peo-survey">
              ${icon('edit', 14)} Update Career Tracer
            </button>
          </div>
        </div>
        <div class="card" id="peo-tracer-card" style="padding:var(--space-5);background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:var(--radius-xl);">
          <div style="display:flex;align-items:center;gap:10px;color:var(--text-secondary);">
            ${icon('loader', 18)} Loading your curriculum outcomes telemetry...
          </div>
        </div>
      </section>

      <!-- Certificates -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">${icon('fileText', 24)} Certificates</h2>
            <p class="section-subtitle">Download your earned certificates</p>
          </div>
        </div>
        <div class="certificate-cards stagger-children" id="cert-grid">
          <div class="skeleton skeleton--card" style="height:200px;"></div>
          <div class="skeleton skeleton--card" style="height:200px;"></div>
          <div class="skeleton skeleton--card" style="height:200px;"></div>
        </div>
      </section>

      <!-- Career Recommendations -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">${icon('trendingUp', 24)} Career Roadmap</h2>
            <p class="section-subtitle">Personalized career recommendations based on your profile</p>
          </div>
        </div>
        <div class="career-recs stagger-children" id="career-recs">
          <div class="skeleton skeleton--card" style="height:160px;"></div>
          <div class="skeleton skeleton--card" style="height:160px;"></div>
          <div class="skeleton skeleton--card" style="height:160px;"></div>
          <div class="skeleton skeleton--card" style="height:160px;"></div>
        </div>
      </section>

      <!-- Alumni Network -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">${icon('users', 24)} Alumni Network</h2>
            <p class="section-subtitle">Connect with fellow CHMSU IT graduates</p>
          </div>
        </div>
        <div class="alumni-network stagger-children" id="alumni-grid">
          <div class="skeleton skeleton--card" style="height:180px;"></div>
          <div class="skeleton skeleton--card" style="height:180px;"></div>
          <div class="skeleton skeleton--card" style="height:180px;"></div>
        </div>
      </section>
    </div>
  `;

  // Load all data including PEO survey
  const [certRes, careerRes, networkRes, peoRes] = await Promise.all([
    apiFetch('alumni/certificates'),
    apiFetch('alumni/career-recommendations'),
    apiFetch('alumni/network'),
    apiFetch('student/peo-survey'),
  ]);

  // Render PEO Tracer Card
  const peoCard = container.querySelector('#peo-tracer-card');
  if (peoRes?.success && peoRes?.peos) {
    const listHtml = peoRes.peos.map(p => {
      const isMet = p.score >= 3.5;
      const pctVal = Math.round((p.score / 5.0) * 100);
      const color = isMet ? '#005930' : '#F59E0B';

      return `
        <div style="background:var(--bg-secondary);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--border-default);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
            <span style="font-size:0.72rem;font-weight:700;color:var(--color-primary);">${p.code}</span>
            <span style="font-size:0.75rem;font-weight:600;color:${color}">${pctVal}% (${p.score} / 5.0)</span>
          </div>
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${p.title}</div>
          <p style="font-size:0.72rem;color:var(--text-secondary);line-height:1.4;margin-bottom:8px;">${p.evidence || 'Evaluated via academic and work profile'}</p>
          <div style="width:100%;height:6px;background:var(--border-default);border-radius:4px;overflow:hidden;">
            <div style="width:${pctVal}%;height:100%;background:${color};border-radius:4px;"></div>
          </div>
        </div>
      `;
    }).join('');

    peoCard.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:var(--space-4);">
        ${listHtml}
      </div>
    `;

    // Modal survey handler
    container.querySelector('#btn-open-peo-survey')?.addEventListener('click', () => {
      openPeoModal(peoRes.peos, () => renderAlumni(container));
    });
  } else {
    peoCard.innerHTML = `
      <div style="color:var(--text-secondary);font-size:0.85rem;">
        Your verified institutional tracer status is actively tracked by the university administration.
      </div>
    `;
  }

  // Certificates
  if (certRes.success) {
    const typeColors = { official: 'accent', training: 'success', certification: 'info' };
    container.querySelector('#cert-grid').innerHTML = certRes.data.map(cert => `
      <div class="certificate-card hover-lift">
        <div class="certificate-card__icon">
          ${icon('award', 28)}
        </div>
        <h4 class="certificate-card__title">${cert.title}</h4>
        <p class="certificate-card__date">${cert.issuer} · ${cert.date}</p>
        <span class="badge badge--${typeColors[cert.type] || 'neutral'}" style="margin-bottom: var(--space-4);">${cert.type}</span>
        <button class="btn btn--secondary btn--sm" style="width: 100%;">
          ${icon('download', 14)} Download
        </button>
      </div>
    `).join('');
  }

  // Career recommendations
  if (careerRes.success) {
    container.querySelector('#career-recs').innerHTML = careerRes.data.map(rec => `
      <div class="career-rec-card hover-lift">
        <h4 class="career-rec-card__title">${rec.title}</h4>
        <p class="career-rec-card__description">${rec.description}</p>
        <span class="career-rec-card__match">${icon('target', 12)} ${rec.matchLevel}</span>
      </div>
    `).join('');
  }

  // Alumni network
  if (networkRes.success) {
    container.querySelector('#alumni-grid').innerHTML = networkRes.data.map(alum => `
      <div class="alumni-card hover-lift">
        <div class="alumni-card__avatar">${alum.initials}</div>
        <h4 class="alumni-card__name">${alum.name}</h4>
        <p class="alumni-card__role">${alum.role}</p>
        <p class="alumni-card__company">${alum.company} · Batch ${alum.batch}</p>
        <button class="btn btn--ghost btn--sm mt-3">${icon('messageSquare', 14)} Connect</button>
      </div>
    `).join('');
  }
}

/**
 * Interactive PEO Self-Evaluation Modal
 */
function openPeoModal(peos, onSuccess) {
  let modal = document.getElementById('peo-survey-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'peo-survey-modal';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

  const fields = peos.map(p => `
    <div style="background:var(--bg-secondary);padding:var(--space-4);border-radius:var(--radius-lg);margin-bottom:var(--space-3);border:1px solid var(--border-default);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-weight:700;font-size:0.8rem;color:var(--color-primary);">${p.code}: ${p.title}</span>
        <select class="form-select peo-score-input" data-peo-id="${p.peo_id}" style="width:auto;padding:4px 24px 4px 8px;font-size:0.75rem;">
          <option value="5" ${p.score >= 4.5 ? 'selected' : ''}>5 - Highly Proficient (Mastery)</option>
          <option value="4" ${p.score >= 3.5 && p.score < 4.5 ? 'selected' : ''}>4 - Proficient (Strong)</option>
          <option value="3" ${p.score >= 2.5 && p.score < 3.5 ? 'selected' : ''}>3 - Developing (Satisfactory)</option>
          <option value="2" ${p.score >= 1.5 && p.score < 2.5 ? 'selected' : ''}>2 - Emerging (Basic)</option>
          <option value="1" ${p.score < 1.5 ? 'selected' : ''}>1 - Novice (Initial)</option>
        </select>
      </div>
      <p style="font-size:0.72rem;color:var(--text-secondary);margin-bottom:6px;line-height:1.4;">${p.description}</p>
      <input type="text" class="form-input peo-evidence-input" data-peo-id="${p.peo_id}"
        placeholder="Brief evidence (e.g. Current job title, employer, certifications, publications)"
        value="${p.evidence ? p.evidence.replace(/"/g, '&quot;') : ''}"
        style="width:100%;font-size:0.75rem;padding:6px 10px;" />
    </div>
  `).join('');

  modal.innerHTML = `
    <div style="background:var(--bg-elevated);border-radius:var(--radius-2xl);max-width:640px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl);overflow:hidden;border:1px solid var(--border-default);">
      <div style="padding:var(--space-5);border-bottom:1px solid var(--border-default);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="font-size:var(--text-base);font-weight:700;">Graduate Career &amp; PEO Tracer Survey</h3>
          <p style="font-size:var(--text-xs);color:var(--text-secondary);">Rate your university training alignment and career outcomes</p>
        </div>
        <button id="peo-modal-close" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);">${icon('x', 20)}</button>
      </div>
      <div style="padding:var(--space-5);overflow-y:auto;flex:1;">
        ${fields}
      </div>
      <div style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-default);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-primary);">
        <button class="btn btn--outline btn--sm" id="peo-modal-cancel">Cancel</button>
        <button class="btn btn--primary btn--sm" id="peo-modal-submit">${icon('check', 14)} Submit Self-Assessment</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#peo-modal-close')?.addEventListener('click', close);
  modal.querySelector('#peo-modal-cancel')?.addEventListener('click', close);

  modal.querySelector('#peo-modal-submit')?.addEventListener('click', async () => {
    const btn = modal.querySelector('#peo-modal-submit');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const responses = [];
    modal.querySelectorAll('.peo-score-input').forEach(sel => {
      const peoId = parseInt(sel.dataset.peoId, 10);
      const score = parseFloat(sel.value);
      const evInput = modal.querySelector(`.peo-evidence-input[data-peo-id="${peoId}"]`);
      responses.push({
        peo_id: peoId,
        score,
        evidence: evInput ? evInput.value.trim() : null,
      });
    });

    try {
      const res = await apiFetch('student/peo-survey', {
        method: 'POST',
        body: JSON.stringify({ responses }),
      });
      if (res.success) {
        close();
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        alert(res.message || 'Failed to save responses.');
        btn.disabled = false;
        btn.textContent = 'Submit Self-Assessment';
      }
    } catch {
      alert('Error communicating with the server.');
      btn.disabled = false;
      btn.textContent = 'Submit Self-Assessment';
    }
  });
}
