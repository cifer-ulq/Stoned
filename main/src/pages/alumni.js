/**
 * CHMSU HireMe — Alumni Page
 */
import { icon } from '../components/icons.js';
import { apiFetch } from '../api/client.js';

export async function renderAlumni(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="page-section">
        <h1 class="animate-fade-in-up">Alumni Hub</h1>
        <p class="text-secondary mt-2 mb-8 animate-fade-in-up" style="animation-delay:80ms;">
          Your career resources, certificates, and alumni network
        </p>
      </section>

      <!-- Certificates -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">${icon('award', 24)} Certificates</h2>
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

  // Load all data in parallel
  const [certRes, careerRes, networkRes] = await Promise.all([
    apiFetch('alumni/certificates'),
    apiFetch('alumni/career-recommendations'),
    apiFetch('alumni/network'),
  ]);

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
