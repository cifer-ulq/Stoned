/* ===========================
   Right Sidebar — Supervisor Portal
   =========================== */

import { icon } from './icons.js';
import { apiFetch } from '../api/client.js';
import { navigate } from '../router.js';

export function createSidebarRight() {
  const aside = document.createElement('aside');
  aside.className = 'sidebar-right';

  aside.innerHTML = `
    <div class="widget">
      <div class="widget__title">Recent Activity</div>
      <div class="widget__content" id="activity-feed">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>

    <div class="widget">
      <div class="widget__title">Quick Actions</div>
      <div class="widget__content" style="gap: var(--space-2); display:flex; flex-direction:column;">
        <button class="btn btn--primary btn--sm" id="qa-route" style="width:100%;">
          ${icon('navigation', 16)} Plan Today's Route
        </button>
        <button class="btn btn--outline btn--sm" id="qa-eval" style="width:100%;">
          ${icon('clipboardCheck', 16)} Submit Evaluation
        </button>
        <button class="btn btn--outline btn--sm" id="qa-map" style="width:100%;">
          ${icon('map', 16)} View Map
        </button>
      </div>
    </div>

    <div class="widget">
      <div class="widget__title">Ending Soon</div>
      <div class="widget__content" id="ending-feed">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>
  `;

  aside.querySelector('#qa-route')?.addEventListener('click', () => navigate('/map'));
  aside.querySelector('#qa-eval')?.addEventListener('click', () => navigate('/evaluations'));
  aside.querySelector('#qa-map')?.addEventListener('click', () => navigate('/map'));

  loadActivity(aside);
  loadEnding(aside);

  return aside;
}

async function loadActivity(aside) {
  try {
    const data = await apiFetch('dashboard/activities', { showLoading: false });
    const feed = aside.querySelector('#activity-feed');
    if (!feed) return;

    const typeConfig = {
      visit: { bg: 'var(--color-info-bg)', color: 'var(--color-info)', ic: 'mapPin' },
      eval: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', ic: 'clipboardCheck' },
      flag: { bg: 'var(--color-error-bg)', color: 'var(--color-error)', ic: 'alertTriangle' },
      report: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', ic: 'fileText' },
    };

    feed.innerHTML = data.slice(0, 5).map(a => {
      const cfg = typeConfig[a.type] || typeConfig.visit;
      return `
        <div class="activity-item">
          <div class="activity-item__icon" style="background:${cfg.bg};color:${cfg.color}">
            ${icon(cfg.ic, 14)}
          </div>
          <div class="activity-item__content">
            <div class="activity-item__text">${a.text}</div>
            <div class="activity-item__time">${a.time}</div>
          </div>
        </div>`;
    }).join('');
  } catch { /* skip */ }
}

async function loadEnding(aside) {
  try {
    const data = await apiFetch('dashboard/ending', { showLoading: false });
    const feed = aside.querySelector('#ending-feed');
    if (!feed) return;

    feed.innerHTML = data.map(s => {
      const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2);
      return `
        <div class="ending-item">
          <div class="ending-item__avatar">${initials}</div>
          <div class="ending-item__info">
            <div class="ending-item__name">${s.name}</div>
            <div class="ending-item__detail">${s.daysLeft} days left · ${s.hoursLeft}h remaining</div>
          </div>
        </div>`;
    }).join('');
  } catch { /* skip */ }
}
