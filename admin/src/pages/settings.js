/* ── Settings Page — Admin Portal (Redesigned) ── */
import { getState, setState } from '../store.js';
import { icon, renderIcons } from '../components/icons.js';
import { clearCache } from '../api/client.js';

export default function SettingsPage(container) {
  const theme = getState('ui.theme');

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Settings</h1>
      <p class="page-header__subtitle">System preferences and configuration</p>
    </div>

    <div style="display:grid;grid-template-columns:250px 1fr;gap:var(--space-5);align-items:start;">
      <div class="card" style="position:sticky;top:calc(var(--navbar-height) + var(--space-6));">
        <div class="card__body" style="padding:var(--space-2) 0;">
          <nav style="display:flex;flex-direction:column;">
            <a href="#general" class="settings-nav-link settings-nav-link--active" data-section="general" style="display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border-radius:var(--radius-md);transition:all 0.15s;">${icon('settings', 15)} General</a>
            <a href="#appearance" class="settings-nav-link" data-section="appearance" style="display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border-radius:var(--radius-md);transition:all 0.15s;">${icon('palette', 15)} Appearance</a>
            <a href="#notifications" class="settings-nav-link" data-section="notifications" style="display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border-radius:var(--radius-md);transition:all 0.15s;">${icon('bell', 15)} Notifications</a>
            <a href="#security" class="settings-nav-link" data-section="security" style="display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border-radius:var(--radius-md);transition:all 0.15s;">${icon('lock', 15)} Security</a>
            <a href="#system" class="settings-nav-link" data-section="system" style="display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border-radius:var(--radius-md);transition:all 0.15s;">${icon('server', 15)} System</a>
          </nav>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-5);">
        <!-- General -->
        <div class="card" id="section-general">
          <div class="card__header"><h3 class="card__title">${icon('settings', 16)} General</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label">Institution Name</label>
              <input class="form-input" value="CHMSU — College of Information & Computing Sciences" />
            </div>
            <div class="form-group">
              <label class="form-label">System Email</label>
              <input class="form-input" type="email" value="cier@chmsu.edu.ph" />
            </div>
            <div class="form-group">
              <label class="form-label">Academic Year</label>
              <select class="form-select"><option>2024–2025</option><option>2023–2024</option></select>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="card" id="section-appearance">
          <div class="card__header"><h3 class="card__title">${icon('palette', 16)} Appearance</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label">Theme</label>
              <div style="display:flex;gap:10px;">
                <label style="display:flex;align-items:center;gap:6px;padding:10px 16px;border:2px solid ${theme === 'light' ? 'var(--color-primary)' : 'var(--border-default)'};border-radius:var(--radius-lg);cursor:pointer;font-size:var(--text-sm);">
                  <input type="radio" name="theme" value="light" ${theme === 'light' ? 'checked' : ''} /> ${icon('sun', 14)} Light
                </label>
                <label style="display:flex;align-items:center;gap:6px;padding:10px 16px;border:2px solid ${theme === 'dark' ? 'var(--color-primary)' : 'var(--border-default)'};border-radius:var(--radius-lg);cursor:pointer;font-size:var(--text-sm);">
                  <input type="radio" name="theme" value="dark" ${theme === 'dark' ? 'checked' : ''} /> ${icon('moon', 14)} Dark
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Accent Color</label>
              <div style="display:flex;gap:8px;">
                ${['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'].map(c => `<button class="color-swatch" style="width:28px;height:28px;border-radius:50%;background:${c};border:2px solid ${c === '#6366F1' ? '#fff' : 'transparent'};box-shadow:0 0 0 2px ${c === '#6366F1' ? c : 'transparent'};cursor:pointer;transition:all 0.15s;"></button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card" id="section-notifications">
          <div class="card__header"><h3 class="card__title">${icon('bell', 16)} Notifications</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:14px;">
            ${[
              { label: 'Email Notifications', desc: 'Receive email for approvals and system alerts', on: true },
              { label: 'Push Notifications', desc: 'Browser push for real-time updates', on: true },
              { label: 'Weekly Digest', desc: 'Summary email every Monday', on: false },
              { label: 'New Company Registration', desc: 'Notify when companies register', on: true },
            ].map(n => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-default);">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${n.label}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${n.desc}</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" ${n.on ? 'checked' : ''} /><span class="toggle__track"><span class="toggle__thumb"></span></span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Security -->
        <div class="card" id="section-security">
          <div class="card__header"><h3 class="card__title">${icon('lock', 16)} Security</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label">Password Policy</label>
              <select class="form-select"><option>Minimum 8 characters, mixed case + number</option><option>Minimum 12 characters, mixed case + number + symbol</option></select>
            </div>
            <div class="form-group">
              <label class="form-label">Session Timeout</label>
              <select class="form-select"><option>30 minutes</option><option>1 hour</option><option>2 hours</option></select>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
              <div>
                <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);">Two-Factor Authentication</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Require 2FA for admin accounts</div>
              </div>
              <label class="toggle"><input type="checkbox" checked /><span class="toggle__track"><span class="toggle__thumb"></span></span></label>
            </div>
          </div>
        </div>

        <!-- System -->
        <div class="card" id="section-system">
          <div class="card__header"><h3 class="card__title">${icon('server', 16)} System</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:var(--text-sm);">
              <span style="color:var(--text-secondary);">Version</span><span style="font-weight:var(--weight-semibold);">2.1.0</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:var(--text-sm);">
              <span style="color:var(--text-secondary);">Environment</span><span class="badge badge--info">Production</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:var(--text-sm);">
              <span style="color:var(--text-secondary);">Database</span><span class="badge badge--success">Connected</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:var(--text-sm);">
              <span style="color:var(--text-secondary);">Last Backup</span><span style="font-weight:var(--weight-semibold);">Today, 6:00 AM</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="btn btn--outline btn--sm" id="btn-clear-cache">${icon('refresh-cw', 14)} <span>Clear Cache</span></button>
              <button class="btn btn--outline btn--sm" style="color:var(--color-error);border-color:var(--color-error);">${icon('trash', 14)} Purge Logs</button>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;padding-bottom:var(--space-6);">
          <button class="btn btn--outline">Cancel</button>
          <button class="btn btn--primary">${icon('check', 14)} Save Changes</button>
        </div>
      </div>
    </div>
  `;

  renderIcons();

  /* Clear Cache Button */
  const clearBtn = container.querySelector('#btn-clear-cache');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearCache();
      const span = clearBtn.querySelector('span');
      if (span) span.textContent = 'Cache Cleared!';
      clearBtn.style.borderColor = 'var(--color-success, #10B981)';
      clearBtn.style.color = 'var(--color-success, #10B981)';
      setTimeout(() => {
        if (span) span.textContent = 'Clear Cache';
        clearBtn.style.borderColor = '';
        clearBtn.style.color = '';
      }, 2000);
    });
  }

  /* Theme Radio */
  container.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', () => {
      setState('ui.theme', radio.value);
      document.documentElement.setAttribute('data-theme', radio.value);
      localStorage.setItem('admin-theme', radio.value);
    });
  });

  /* Settings Nav */
  container.querySelectorAll('.settings-nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      container.querySelectorAll('.settings-nav-link').forEach(l => { l.style.background = ''; l.style.color = 'var(--text-secondary)'; l.style.fontWeight = ''; });
      link.style.background = 'var(--bg-secondary)';
      link.style.color = 'var(--text-primary)';
      link.style.fontWeight = 'var(--weight-semibold)';
      const section = container.querySelector(`#section-${link.dataset.section}`);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Activate first nav link */
  const firstLink = container.querySelector('.settings-nav-link--active');
  if (firstLink) { firstLink.style.background = 'var(--bg-secondary)'; firstLink.style.color = 'var(--text-primary)'; firstLink.style.fontWeight = 'var(--weight-semibold)'; }
}
