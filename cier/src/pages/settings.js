/* ── Settings Page — CIER Portal ── */
import { getState, setState } from '../store.js';
import { icon, renderIcons } from '../components/icons.js';
import { clearCache, storageUrl, apiUpload } from '../api/client.js';

export default function SettingsPage(container) {
  const theme = getState('ui.theme');
  const user = getState('user') || {};
  const avatarSrc = user.avatar || user.avatar_url;
  const avatarHtml = avatarSrc
    ? `<img src="${storageUrl(avatarSrc)}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.parentElement.textContent='${user.initials || 'CI'}';" />`
    : (user.initials || 'CI');

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">CIER Settings</h1>
      <p class="page-header__subtitle">Profile and display preferences for the CIER Office</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--space-5);max-width:760px;">
      <div class="card">
        <div class="card__header"><h3 class="card__title">${icon('users', 16)} CIER Profile Photo</h3></div>
        <div class="card__body" style="display:flex;align-items:center;gap:20px;padding:20px;">
          <div id="cier-settings-avatar-box" style="width:72px;height:72px;border-radius:50%;overflow:hidden;background:var(--color-primary-bg, #E8F5E9);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;flex-shrink:0;border:2px solid var(--border-default);">
            ${avatarHtml}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${user.name || 'CHMSU CIER Office'}</span>
            <span style="font-size:0.8rem;color:var(--text-secondary);">Center for Internationalization and External Relations (JPG, PNG, WebP up to 5MB).</span>
            <div style="margin-top:6px;">
              <label class="btn btn--primary btn--sm" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
                ${icon('camera', 14)} <span>Upload New Photo</span>
                <input type="file" id="cier-avatar-upload" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__header"><h3 class="card__title">${icon('palette', 16)} Appearance &amp; Cache</h3></div>
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
          <div>
            <button class="btn btn--outline btn--sm" id="btn-clear-cache">${icon('refresh-cw', 14)} <span>Clear Local Cache</span></button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderIcons();

  container.querySelector('#cier-avatar-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo file size is too large. Maximum allowed size is 5 MB.');
      return;
    }

    const form = new FormData();
    form.append('avatar', file);
    const box = container.querySelector('#cier-settings-avatar-box');

    try {
      const res = await apiUpload('/auth/avatar', form);
      if (res?.avatar_url) {
        const photoUrl = storageUrl(res.avatar_url);
        const currentUser = getState('user') || {};
        currentUser.avatar = photoUrl;
        currentUser.avatar_url = photoUrl;
        setState('user', currentUser);
        try {
          const cached = JSON.parse(localStorage.getItem('hireme_user') || '{}');
          cached.avatar_url = photoUrl;
          localStorage.setItem('hireme_user', JSON.stringify(cached));
        } catch (_) {}

        const newImg = `<img src="${photoUrl}" alt="${currentUser.name || 'CIER'}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.parentElement.textContent='${currentUser.initials || 'CI'}';" />`;
        if (box) box.innerHTML = newImg;
        document.querySelectorAll('.navbar__avatar').forEach(el => { el.innerHTML = newImg; });
      }
    } catch {
      alert('Error uploading profile photo. Check connection and try again.');
    } finally {
      e.target.value = '';
    }
  });

  const clearBtn = container.querySelector('#btn-clear-cache');
  clearBtn?.addEventListener('click', () => {
    clearCache();
    const span = clearBtn.querySelector('span');
    if (span) span.textContent = 'Cache Cleared!';
    setTimeout(() => { if (span) span.textContent = 'Clear Local Cache'; }, 2000);
  });

  container.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', () => {
      setState('ui.theme', radio.value);
      document.documentElement.setAttribute('data-theme', radio.value);
      localStorage.setItem('cier-theme', radio.value);
    });
  });
}
