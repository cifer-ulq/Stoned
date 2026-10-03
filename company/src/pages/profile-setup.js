/**
 * CHMSU HireMe — Company Profile Setup (Single-Step)
 * Collects company info and saves to DB via API.
 */
import { icon } from '../components/icons.js';
import { navigate } from '../router.js';
import { getState, setState } from '../store.js';
import { apiPost } from '../api/client.js';

const INDUSTRIES = [
  'Information Technology', 'Business Process Outsourcing', 'Manufacturing',
  'Healthcare', 'Education', 'Finance & Banking', 'Retail & E-Commerce',
  'Construction', 'Agriculture', 'Tourism & Hospitality', 'Government',
  'Non-Profit / NGO', 'Other',
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1,000 employees', '1,000+ employees',
];

let logoDataUrl = null;
let logoFile    = null;

export async function renderProfileSetup(container) {
  const company = getState('company');

  // If profile already completed, redirect to profile page
  if (company.profileCompleted) {
    navigate('/profile');
    return;
  }

  // Pre-fill from store
  const prefill = {
    companyName:   company.name || '',
    industry:      company.industry || '',
    companySize:   company.companySize || '',
    address:       company.location || '',
    website:       company.website || '',
    contactEmail:  company.contactEmail || company.email || '',
    contactPhone:  company.contactPhone || '',
    description:   company.description || '',
  };

  logoDataUrl = company.logoUrl || null;
  logoFile    = null;

  render(container, prefill);
}

function render(container, prefill = {}) {
  container.innerHTML = `
    <div class="ps-page fade-in">
      <div class="ps-header">
        <h1 class="ps-header__title">${icon('building', 28)} Company Profile Setup</h1>
        <p class="ps-header__subtitle">Complete your company profile to start posting jobs and receiving applicants.</p>
      </div>

      <div class="ps-content">
        <div class="ps-card slide-in">
          <h2 class="ps-card__title">${icon('building', 22)} Company Information</h2>
          <p class="ps-card__desc">Provide your company details so applicants know who you are.</p>

          <!-- Logo upload -->
          <div class="ps-logo-upload" id="logo-upload-area">
            <div class="ps-logo-upload__preview" id="logo-preview">
              ${logoDataUrl
                ? `<img src="${logoDataUrl}" alt="Logo" class="ps-logo-upload__img" />`
                : `<div class="ps-logo-upload__placeholder">${icon('building', 40)}</div>`}
            </div>
            <div class="ps-logo-upload__info">
              <button type="button" class="btn btn--outline btn--sm" id="btn-upload-logo">
                ${icon('upload', 16)} Upload Logo
              </button>
              <span class="text-xs text-tertiary">PNG, JPG up to 2MB. Recommended 200x200px.</span>
            </div>
            <input type="file" id="logo-file-input" accept="image/png,image/jpeg" hidden />
          </div>

          <div class="ps-form-grid">
            <div class="form-group ps-form-grid__full">
              <label class="form-label">Company Name <span style="color:var(--color-error,#EF4444)">*</span></label>
              <input type="text" class="form-input" id="ps-company-name"
                value="${escapeHtml(prefill.companyName)}"
                placeholder="e.g. TechCorp Solutions" />
            </div>

            <div class="form-group">
              <label class="form-label">Industry <span style="color:var(--color-error,#EF4444)">*</span></label>
              <select class="form-select" id="ps-industry">
                <option value="">Select industry</option>
                ${INDUSTRIES.map(i => `<option value="${i}" ${prefill.industry === i ? 'selected' : ''}>${i}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Company Size <span style="color:var(--color-error,#EF4444)">*</span></label>
              <select class="form-select" id="ps-company-size">
                <option value="">Select size</option>
                ${COMPANY_SIZES.map(s => `<option value="${s}" ${prefill.companySize === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <div class="form-group ps-form-grid__full">
              <label class="form-label">Address / Location <span style="color:var(--color-error,#EF4444)">*</span></label>
              <input type="text" class="form-input" id="ps-address"
                value="${escapeHtml(prefill.address)}"
                placeholder="e.g. 123 IT Park, Cebu City, Philippines" />
            </div>

            <div class="form-group">
              <label class="form-label">Website</label>
              <div class="form-input-group">
                <span class="form-input-group__prepend">${icon('globe', 16)}</span>
                <input type="url" class="form-input form-input--with-prepend" id="ps-website"
                  value="${escapeHtml(prefill.website)}"
                  placeholder="https://yourcompany.com" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Contact Email <span style="color:var(--color-error,#EF4444)">*</span></label>
              <div class="form-input-group">
                <span class="form-input-group__prepend">${icon('mail', 16)}</span>
                <input type="email" class="form-input form-input--with-prepend" id="ps-email"
                  value="${escapeHtml(prefill.contactEmail)}"
                  placeholder="hr@company.com" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <div class="form-input-group">
                <span class="form-input-group__prepend">${icon('phone', 16)}</span>
                <input type="tel" class="form-input form-input--with-prepend" id="ps-phone"
                  value="${escapeHtml(prefill.contactPhone)}"
                  placeholder="+63 912 345 6789" />
              </div>
            </div>

            <div class="form-group ps-form-grid__full">
              <label class="form-label">Company Description</label>
              <textarea class="form-textarea" id="ps-description" rows="4"
                placeholder="Tell applicants about your company, culture, and mission...">${escapeHtml(prefill.description)}</textarea>
              <span class="form-hint">Brief description shown on your company profile.</span>
            </div>
          </div>

          <p id="ps-error" style="color:var(--color-error,#EF4444);margin-top:.5rem;display:none;font-size:.875rem;"></p>
        </div>
      </div>

      <div class="ps-nav">
        <div></div>
        <div class="ps-nav__right">
          <button class="btn btn--primary" id="ps-btn-submit" style="min-width:160px;">
            ${icon('checkCircle', 16)} Save Profile
          </button>
        </div>
      </div>
    </div>
  `;

  attachListeners(container, prefill);
}

function attachListeners(container, prefill) {
  // Logo upload
  const uploadBtn = container.querySelector('#btn-upload-logo');
  const fileInput = container.querySelector('#logo-file-input');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.', 'error'); return; }
      logoFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        logoDataUrl = ev.target.result;
        const preview = container.querySelector('#logo-preview');
        if (preview) preview.innerHTML = `<img src="${logoDataUrl}" alt="Logo" class="ps-logo-upload__img" />`;
      };
      reader.readAsDataURL(file);
    });
  }

  // Submit
  const submitBtn = container.querySelector('#ps-btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => handleSubmit(container));
  }
}

async function handleSubmit(container) {
  const name        = container.querySelector('#ps-company-name')?.value?.trim();
  const industry    = container.querySelector('#ps-industry')?.value;
  const size        = container.querySelector('#ps-company-size')?.value;
  const address     = container.querySelector('#ps-address')?.value?.trim();
  const email       = container.querySelector('#ps-email')?.value?.trim();
  const phone       = container.querySelector('#ps-phone')?.value?.trim();
  const website     = container.querySelector('#ps-website')?.value?.trim();
  const description = container.querySelector('#ps-description')?.value?.trim();

  const errorEl = container.querySelector('#ps-error');
  const showError = (msg) => {
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    showToast(msg, 'error');
  };

  if (!name)     { showError('Company name is required.'); return; }
  if (!industry) { showError('Please select an industry.'); return; }
  if (!size)     { showError('Please select a company size.'); return; }
  if (!address)  { showError('Address is required.'); return; }
  if (!email)    { showError('Contact email is required.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Please enter a valid email address.'); return; }
  if (errorEl) errorEl.style.display = 'none';

  const submitBtn = container.querySelector('#ps-btn-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = `${icon('loader', 16)} Saving&hellip;`; }

  try {
    const fd = new FormData();
    fd.append('company_name',     name);
    fd.append('company_type',     industry);
    fd.append('company_size',     size);
    fd.append('company_location', address);
    fd.append('contact_email',    email);
    if (phone)       fd.append('contact_phone', phone);
    if (website)     fd.append('website', website);
    if (description) fd.append('description', description);
    if (logoFile)    fd.append('logo', logoFile);

    const token = localStorage.getItem('hireme_token');
    const res = await fetch('http://localhost:8000/api/company/profile', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      body: fd,
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      const msg = json.message || (json.errors ? Object.values(json.errors).flat().join(' ') : 'Save failed.');
      throw new Error(msg);
    }

    const cp = json.data;
    const company = getState('company');
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const updatedIdentity = {
      ...company,
      name:             cp.company_name,
      initials,
      industry:         cp.company_type,
      location:         cp.company_location,
      companySize:      cp.company_size,
      contactEmail:     cp.contact_email,
      contactPhone:     cp.contact_phone || '',
      website:          cp.website || '',
      description:      cp.description || '',
      logoUrl:          cp.logo_url || null,
      profileCompleted: true,
    };
    setState('company', updatedIdentity);
    localStorage.setItem('hireme_company_user', JSON.stringify(updatedIdentity));

    showToast('Company profile saved!');
    refreshSidebar();
    refreshNavbar();
    setTimeout(() => navigate('/profile'), 800);
  } catch (err) {
    showError(err.message || 'Failed to save profile. Please try again.');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = `${icon('checkCircle', 16)} Save Profile`; }
  }
}

function refreshSidebar() {
  import('../components/sidebar-left.js').then(({ createLeftSidebar }) => {
    const old = document.getElementById('sidebar-left');
    if (old) old.replaceWith(createLeftSidebar());
  });
}

function refreshNavbar() {
  import('../components/navbar.js').then(({ createNavbar }) => {
    const old = document.getElementById('main-navbar');
    if (old) old.replaceWith(createNavbar());
  });
}

function showToast(message, type = 'success') {
  const existing = document.querySelectorAll(`.toast--${type}`);
  existing.forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'alertCircle', 16)} <span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 300); }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
