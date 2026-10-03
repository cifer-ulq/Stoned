/**
 * CHMSU HireMe — Company Public Profile Page (Jobseeker Portal)
 * High-end LinkedIn / Glassdoor style profile page with cover banner,
 * rich meta facts, structured contact cards, and interactive job openings.
 */
import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';
import { navigate } from '../router.js';

let activeTab = 'about';

/** Safely parse a value that may be a JSON string or already an array */
function toArr(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
}

/** Normalize relative storage paths to full API URL */
function logoSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
}

const GRADIENTS = [
  'linear-gradient(135deg, #005930 0%, #0B7A44 100%)', // Signature CHMSU Forest Green
  'linear-gradient(135deg, #047857 0%, #10B981 100%)', // Deep Emerald
  'linear-gradient(135deg, #004D28 0%, #059669 100%)', // Pine Green
  'linear-gradient(135deg, #065F46 0%, #34D399 100%)', // Rich Forest
  'linear-gradient(135deg, #00381E 0%, #005930 100%)'  // Classic Forest Green
];

export async function renderCompanyProfile(container, params = {}) {
  const id = params.id;
  if (!id) { navigate('/companies'); return; }

  // Skeleton Loader
  container.innerHTML = `
    <div class="animate-fade-in" style="max-width: 1100px; margin: 0 auto; padding-bottom: 40px;">
      <div class="skeleton" style="width: 140px; height: 36px; border-radius: 8px; margin-bottom: 16px;"></div>
      <div class="skeleton" style="height: 220px; border-radius: 20px; margin-bottom: 20px;"></div>
      <div class="skeleton" style="height: 48px; border-radius: 12px; margin-bottom: 20px;"></div>
      <div class="skeleton" style="height: 320px; border-radius: 16px;"></div>
    </div>
  `;

  const [profileRes, jobsRes] = await Promise.all([
    apiGet(`/companies/${id}`),
    apiGet(`/companies/${id}/jobs`),
  ]);

  if (!profileRes?.success || !profileRes?.data) {
    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 600px; margin: 60px auto; text-align: center;">
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; padding: 48px 24px; box-shadow: var(--shadow-md);">
          <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; background: var(--color-error-bg); color: var(--color-error); display: flex; align-items: center; justify-content: center;">
            ${icon('alertCircle', 32)}
          </div>
          <h2 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px;">Company Not Found</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0 0 24px;">
            This company profile may have been deactivated or is currently not available.
          </p>
          <button id="cp-not-found-back" class="btn btn--primary" style="padding: 8px 22px; border-radius: 10px;">
            Back to Companies Directory
          </button>
        </div>
      </div>
    `;
    container.querySelector('#cp-not-found-back')?.addEventListener('click', () => navigate('/companies'));
    return;
  }

  const company = profileRes.data;
  const jobs = jobsRes?.data || [];
  activeTab = 'about';

  render(container, company, jobs);
}

function render(container, company, jobs) {
  const initial = (company.company_name || 'C')[0].toUpperCase();
  const gradient = GRADIENTS[(company.id || 1) % GRADIENTS.length];
  const logo = logoSrc(company.logo_url);

  container.innerHTML = `
    <div class="animate-fade-in" style="max-width: 1100px; margin: 0 auto; padding-bottom: 50px;">
      
      <!-- Back Action -->
      <div style="margin-bottom: 16px;">
        <button id="cp-back-btn" style="display: inline-flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 10px; padding: 8px 16px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
          ${icon('arrowLeft', 16)} Back to Companies
        </button>
      </div>

      <!-- Profile Header Banner & Card -->
      <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; overflow: hidden; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
        
        <!-- Cover Banner -->
        <div style="height: 140px; background: ${gradient}; position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; opacity: 0.15; background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 60%);"></div>
          <div style="position: absolute; right: 20px; top: 16px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; background: rgba(0,0,0,0.32); backdrop-filter: blur(10px); border-radius: 999px; color: #fff; font-size: 0.78rem; font-weight: 600;">
            ${icon('shieldCheck', 14)} Verified Corporate Partner
          </div>
        </div>

        <!-- Main Info Bar -->
        <div style="padding: 0 32px 28px; position: relative;">
          
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; margin-top: -46px; margin-bottom: 20px;">
            
            <!-- Logo -->
            <div style="width: 92px; height: 92px; border-radius: 20px; background: var(--bg-elevated); border: 4px solid var(--bg-elevated); box-shadow: 0 6px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
              ${logo
                ? `<img src="${logo}" alt="${company.company_name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';this.parentElement.style.background='${gradient}';this.parentElement.innerHTML='<span style=\\'color:#fff;font-size:2.2rem;font-weight:800;\\'>${initial}</span>'"/>`
                : `<div style="width: 100%; height: 100%; background: ${gradient}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800;">${initial}</div>`
              }
            </div>

            <!-- Action Buttons on Header -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${company.website ? `
                <a href="${company.website}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 10px; background: var(--bg-secondary); border: 1px solid var(--border-default); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                  ${icon('externalLink', 14)} Visit Website
                </a>
              ` : ''}
              ${company.contact_email ? `
                <a href="mailto:${company.contact_email}" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 10px; background: var(--color-primary); color: #fff; font-size: 0.85rem; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(74, 108, 247, 0.25); transition: all 0.2s;">
                  ${icon('mail', 14)} Contact Company
                </a>
              ` : ''}
            </div>

          </div>

          <!-- Company Title & Meta -->
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
              <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0; font-family: var(--font-heading);">
                ${company.company_name}
              </h1>
              <span style="color: var(--color-primary);" title="Verified Partner">${icon('checkCircle', 18)}</span>
            </div>

            ${company.company_type ? `
              <div style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 12px;">
                ${company.company_type}
              </div>
            ` : ''}

            <!-- Meta Badges -->
            <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.84rem; color: var(--text-secondary);">
              ${company.company_location ? `
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                  ${icon('mapPin', 14)} ${company.company_location}
                </span>
              ` : ''}
              ${company.company_size ? `
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                  ${icon('users', 14)} ${company.company_size} Employees
                </span>
              ` : ''}
              ${company.year_founded ? `
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                  ${icon('calendar', 14)} Founded ${company.year_founded}
                </span>
              ` : ''}
              ${company.ownership_type ? `
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                  ${icon('shield', 14)} ${company.ownership_type}
                </span>
              ` : ''}
            </div>

          </div>

        </div>

      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 14px; padding: 6px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
        <button
          class="cp-tab-btn"
          data-tab="about"
          style="flex: 1; height: 42px; border-radius: 10px; border: none; background: ${activeTab === 'about' ? 'var(--color-primary)' : 'transparent'}; color: ${activeTab === 'about' ? '#fff' : 'var(--text-secondary)'}; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;"
        >
          ${icon('fileText', 16)} About Company
        </button>
        <button
          class="cp-tab-btn"
          data-tab="jobs"
          style="flex: 1; height: 42px; border-radius: 10px; border: none; background: ${activeTab === 'jobs' ? 'var(--color-primary)' : 'transparent'}; color: ${activeTab === 'jobs' ? '#fff' : 'var(--text-secondary)'}; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;"
        >
          ${icon('briefcase', 16)} Open Positions
          <span style="padding: 2px 7px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: ${activeTab === 'jobs' ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)'}; color: ${activeTab === 'jobs' ? '#fff' : 'var(--text-primary)'};">
            ${jobs.length}
          </span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="cp-tab-view"></div>

    </div>
  `;

  renderTabView(container, company, jobs, activeTab);

  // Back button
  container.querySelector('#cp-back-btn')?.addEventListener('click', () => navigate('/companies'));

  // Tab switcher
  container.querySelectorAll('.cp-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      container.querySelectorAll('.cp-tab-btn').forEach(b => {
        const isActive = b.dataset.tab === activeTab;
        b.style.background = isActive ? 'var(--color-primary)' : 'transparent';
        b.style.color = isActive ? '#fff' : 'var(--text-secondary)';
        const badge = b.querySelector('span');
        if (badge) {
          badge.style.background = isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)';
          badge.style.color = isActive ? '#fff' : 'var(--text-primary)';
        }
      });
      renderTabView(container, company, jobs, activeTab);
    });
  });
}

function renderTabView(container, company, jobs, tab) {
  const content = container.querySelector('#cp-tab-view');
  if (!content) return;

  if (tab === 'about') {
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
        <!-- Left: Company Overview -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 26px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 14px; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
              ${icon('fileText', 18)} Company Overview
            </h3>
            <div style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.7; white-space: pre-line;">
              ${company.description || 'No detailed description has been provided by this partner company yet.'}
            </div>
          </div>

          <!-- Opportunities Summary -->
          <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 26px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
              ${icon('target', 18)} Career Opportunities
            </h3>
            <div style="background: var(--bg-secondary); border-radius: 14px; padding: 18px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-primary);">${jobs.length}</div>
                <div style="font-size: 0.84rem; font-weight: 600; color: var(--text-secondary); margin-top: 2px;">Active Open Positions</div>
              </div>
              <button onclick="document.querySelector('[data-tab=\\'jobs\\']').click()" class="btn btn--primary btn--sm" style="padding: 6px 14px; border-radius: 8px;">
                Browse Jobs
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Fast Facts & Contact -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Fast Facts -->
          <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 26px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
              ${icon('briefcase', 18)} Fast Facts
            </h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-default);">
                <span style="color: var(--text-tertiary);">Industry</span>
                <strong style="color: var(--text-primary);">${company.company_type || 'N/A'}</strong>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-default);">
                <span style="color: var(--text-tertiary);">Company Size</span>
                <strong style="color: var(--text-primary);">${company.company_size || 'N/A'}</strong>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-default);">
                <span style="color: var(--text-tertiary);">Ownership</span>
                <strong style="color: var(--text-primary);">${company.ownership_type || 'Private'}</strong>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-default);">
                <span style="color: var(--text-tertiary);">Founded</span>
                <strong style="color: var(--text-primary);">${company.year_founded || 'N/A'}</strong>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-tertiary);">Location</span>
                <strong style="color: var(--text-primary); text-align: right; max-width: 60%;">${company.full_address || company.company_location || 'Philippines'}</strong>
              </div>

            </div>
          </div>

          <!-- Direct Contact Card -->
          <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 26px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
              ${icon('phone', 18)} Contact Information
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${company.contact_person ? `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 10px; background: var(--bg-secondary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${icon('user', 16)}
                  </div>
                  <div>
                    <div style="font-size: 0.76rem; color: var(--text-tertiary);">Contact Representative</div>
                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">
                      ${company.contact_person} ${company.contact_title ? `<span style="font-weight: 400; color: var(--text-secondary);">(${company.contact_title})</span>` : ''}
                    </div>
                  </div>
                </div>
              ` : ''}

              ${company.contact_email ? `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 10px; background: var(--color-primary-bg); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${icon('mail', 16)}
                  </div>
                  <div>
                    <div style="font-size: 0.76rem; color: var(--text-tertiary);">Email Address</div>
                    <a href="mailto:${company.contact_email}" style="font-size: 0.9rem; font-weight: 600; color: var(--color-primary); text-decoration: none;">
                      ${company.contact_email}
                    </a>
                  </div>
                </div>
              ` : ''}

              ${company.contact_phone ? `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 10px; background: var(--color-success-bg); color: var(--color-success); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${icon('phone', 16)}
                  </div>
                  <div>
                    <div style="font-size: 0.76rem; color: var(--text-tertiary);">Telephone / Mobile</div>
                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">
                      ${company.contact_phone}
                    </div>
                  </div>
                </div>
              ` : ''}

              ${company.full_address ? `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 10px; background: var(--bg-secondary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${icon('mapPin', 16)}
                  </div>
                  <div>
                    <div style="font-size: 0.76rem; color: var(--text-tertiary);">Physical Address</div>
                    <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">
                      ${company.full_address}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

          </div>

        </div>

      </div>
    `;
  } else if (tab === 'jobs') {
    if (!jobs.length) {
      content.innerHTML = `
        <div style="text-align: center; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; padding: 60px 20px;">
          <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; background: var(--bg-secondary); color: var(--text-tertiary); display: flex; align-items: center; justify-content: center;">
            ${icon('briefcase', 28)}
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">No Active Job Listings</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 380px; margin: 0 auto;">
            ${company.company_name} currently does not have any open employment positions posted.
          </p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${jobs.map((job, idx) => {
          const skills = toArr(job.required_skills);
          return `
            <div
              class="animate-fade-in-up"
              style="--enter-delay: ${idx * 40}ms; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 24px; box-shadow: var(--shadow-sm); transition: all 0.2s;"
              onmouseenter="this.style.borderColor='var(--color-primary)';this.style.boxShadow='0 8px 24px rgba(74, 108, 247, 0.1)';"
              onmouseleave="this.style.borderColor='var(--border-default)';this.style.boxShadow='var(--shadow-sm)';"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 10px; flex-wrap: wrap;">
                <div>
                  <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; font-family: var(--font-heading);">
                    ${job.title}
                  </h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.82rem; color: var(--text-secondary);">
                    ${job.department ? `<span>${icon('briefcase', 13)} ${job.department}</span>` : ''}
                    ${job.location ? `<span>${icon('mapPin', 13)} ${job.location}</span>` : ''}
                    ${job.employment_type ? `<span>${icon('clock', 13)} ${job.employment_type}</span>` : ''}
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                  ${job.salary_range ? `
                    <span style="padding: 5px 12px; background: var(--color-success-bg); color: var(--color-success); border-radius: 8px; font-size: 0.84rem; font-weight: 700;">
                      ${job.salary_range}
                    </span>
                  ` : ''}
                </div>
              </div>

              ${job.description ? `
                <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 14px;">
                  ${job.description}
                </p>
              ` : ''}

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 14px; border-top: 1px solid var(--border-default);">
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${skills.map(s => `
                    <span style="padding: 3px 10px; background: var(--bg-secondary); color: var(--text-secondary); border-radius: 999px; font-size: 0.78rem; font-weight: 500;">
                      ${s}
                    </span>
                  `).join('')}
                </div>

                <a href="#/jobs" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; background: var(--color-primary-bg); color: var(--color-primary); font-size: 0.84rem; font-weight: 600; text-decoration: none;">
                  View on Job Match ${icon('arrowRight', 13)}
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

